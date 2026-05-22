"use client";

// ============================================================
//  components/vault/VaultProvider.tsx
// ------------------------------------------------------------
//  The ONLY place your UI talks to. Holds the unwrapped Vault Key
//  in memory (never persisted), does all crypto, talks to the API.
//
//  SETUP is two steps so nothing is stored until the user has
//  confirmed their recovery phrase:
//    1. beginSetup(masterPassword) → generates keys + phrase in
//       memory, returns the 12-word phrase, stores NOTHING.
//    2. finalizeSetup()            → commits to the server and
//       unlocks. Call only after the phrase is confirmed.
//
//  Other API:
//    v.unlock(pw) · v.unlockWithRecovery(phrase, newPw)
//    v.changeMasterPassword(newPw) · v.lock()
//    v.addItem / v.updateItem / v.deleteItem · v.generate(opts)
//    v.isInitialized · v.isUnlocked · v.items · v.loading
// ============================================================

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import {
  DEFAULT_KDF,
  deriveWrappingKey,
  generateVaultKey,
  wrapVaultKey,
  unwrapVaultKey,
  encryptJSON,
  decryptJSON,
  generateRecoveryPhrase,
  isValidRecoveryPhrase,
  normalizePhrase,
  newSalt,
  generatePassword,
  type PasswordOptions,
} from "@/lib/crypto";
import type {
  DecryptedItem,
  VaultItemRow,
  VaultItemType,
  VaultSecret,
  VaultStatus,
} from "@/lib/types";

const AUTO_LOCK_MS = 5 * 60 * 1000; // lock after 5 min of inactivity

interface PendingSetup {
  vaultKey: CryptoKey;
  body: Record<string, unknown>; // the POST body, ready to send on finalize
}

interface VaultContextValue {
  loading: boolean;
  isInitialized: boolean;
  isUnlocked: boolean;
  items: DecryptedItem[];
  beginSetup: (masterPassword: string) => Promise<string>; // returns the phrase
  finalizeSetup: () => Promise<void>;
  unlock: (masterPassword: string) => Promise<void>;
  unlockWithRecovery: (
    phrase: string,
    newMasterPassword: string,
  ) => Promise<void>;
  changeMasterPassword: (newMasterPassword: string) => Promise<void>;
  lock: () => void;
  addItem: (secret: VaultSecret, type?: VaultItemType) => Promise<void>;
  updateItem: (
    id: string,
    secret: VaultSecret,
    opts?: { favorite?: boolean; folderId?: string | null },
  ) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  generate: (opts?: PasswordOptions) => string;
}

const VaultContext = createContext<VaultContextValue | null>(null);

export function VaultProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<VaultStatus | null>(null);
  const [items, setItems] = useState<DecryptedItem[]>([]);

  // The unwrapped Vault Key lives ONLY here, in a ref, in memory.
  const vaultKeyRef = useRef<CryptoKey | null>(null);
  const pendingSetupRef = useRef<PendingSetup | null>(null);
  const [unlocked, setUnlocked] = useState(false);

  // ---- fetch vault status on mount ----
  const refreshStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/vault/init");
      if (res.ok) setStatus(await res.json());
    } catch {
      /* not signed in / offline — leave status null */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/vault/init");
        if (!cancelled && res.ok) setStatus(await res.json());
      } catch {
        /* not signed in / offline — leave status null */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // ---- decrypt the whole vault into memory ----
  const loadItems = useCallback(async () => {
    const key = vaultKeyRef.current;
    if (!key) return;
    const res = await fetch("/api/vault/items");
    if (!res.ok) throw new Error("Failed to load items");
    const { items: rows } = (await res.json()) as { items: VaultItemRow[] };
    const decrypted = await Promise.all(
      rows.map(async (row) => ({
        ...row,
        secret: await decryptJSON<VaultSecret>(row.ciphertext, row.iv, key),
      })),
    );
    setItems(decrypted);
  }, []);

  // ---- lock ----
  const lock = useCallback(() => {
    vaultKeyRef.current = null;
    setUnlocked(false);
    setItems([]);
  }, []);

  // ---- auto-lock on inactivity ----
  useEffect(() => {
    if (!unlocked) return;
    let timer: ReturnType<typeof setTimeout>;
    const reset = () => {
      clearTimeout(timer);
      timer = setTimeout(lock, AUTO_LOCK_MS);
    };
    const events = ["mousedown", "keydown", "touchstart", "scroll"];
    events.forEach((e) => window.addEventListener(e, reset));
    reset();
    return () => {
      clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [unlocked, lock]);

  // ---- STEP 1: prepare setup in memory, return the phrase, store nothing ----
  const beginSetup = useCallback(
    async (masterPassword: string): Promise<string> => {
      const vaultKey = await generateVaultKey();

      // (a) wrap with the master-password key
      const pwSalt = newSalt();
      const pwKey = await deriveWrappingKey(masterPassword, pwSalt);
      const wrappedByPw = await wrapVaultKey(vaultKey, pwKey);

      // (b) wrap with the recovery-phrase key
      const phrase = generateRecoveryPhrase();
      const recSalt = newSalt();
      const recKey = await deriveWrappingKey(phrase, recSalt);
      const wrappedByRec = await wrapVaultKey(vaultKey, recKey);

      pendingSetupRef.current = {
        vaultKey,
        body: {
          kdf_algo: DEFAULT_KDF.algo,
          kdf_salt: pwSalt,
          kdf_params: { ...DEFAULT_KDF, recoverySalt: recSalt },
          wrapped_vault_key: wrappedByPw.ciphertext,
          wrapped_vault_key_iv: wrappedByPw.iv,
          recovery_wrapped_key: wrappedByRec.ciphertext,
          recovery_wrapped_key_iv: wrappedByRec.iv,
        },
      };
      return phrase; // caller shows this ONCE; it is never stored or retrievable
    },
    [],
  );

  // ---- STEP 2: commit to the server + unlock (after phrase confirmed) ----
  const finalizeSetup = useCallback(async () => {
    const pending = pendingSetupRef.current;
    if (!pending) throw new Error("No setup in progress");

    const res = await fetch("/api/vault/init", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pending.body),
    });
    if (!res.ok) {
      const { error } = await res
        .json()
        .catch(() => ({ error: "Setup failed" }));
      throw new Error(error);
    }

    vaultKeyRef.current = pending.vaultKey;
    pendingSetupRef.current = null;
    setUnlocked(true);
    await refreshStatus();
    await loadItems();
  }, [refreshStatus, loadItems]);

  // ---- unlock with master password ----
  const unlock = useCallback(
    async (masterPassword: string) => {
      const s =
        status ?? (await fetch("/api/vault/init").then((r) => r.json()));
      if (!s?.initialized) throw new Error("Vault not initialized");
      const pwKey = await deriveWrappingKey(
        masterPassword,
        s.kdf_salt,
        s.kdf_params.iterations,
      );
      try {
        vaultKeyRef.current = await unwrapVaultKey(
          { ciphertext: s.wrapped_vault_key, iv: s.wrapped_vault_key_iv },
          pwKey,
        );
      } catch {
        throw new Error("Incorrect master password");
      }
      setUnlocked(true);
      await loadItems();
    },
    [status, loadItems],
  );

  // ---- change master password (vault must be unlocked) ----
  const changeMasterPassword = useCallback(
    async (newMasterPassword: string) => {
      const vaultKey = vaultKeyRef.current;
      if (!vaultKey) throw new Error("Vault is locked");

      const pwSalt = newSalt();
      const pwKey = await deriveWrappingKey(newMasterPassword, pwSalt);
      const wrapped = await wrapVaultKey(vaultKey, pwKey);
      const kdf_params = {
        ...DEFAULT_KDF,
        recoverySalt: status?.kdf_params?.recoverySalt,
      };

      const res = await fetch("/api/vault/init", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kdf_salt: pwSalt,
          kdf_params,
          wrapped_vault_key: wrapped.ciphertext,
          wrapped_vault_key_iv: wrapped.iv,
        }),
      });
      if (!res.ok) throw new Error("Could not update master password");
      await refreshStatus();
    },
    [status, refreshStatus],
  );

  // ---- unlock via recovery phrase, then set a NEW master password ----
  const unlockWithRecovery = useCallback(
    async (phrase: string, newMasterPassword: string) => {
      const norm = normalizePhrase(phrase);
      if (!isValidRecoveryPhrase(norm))
        throw new Error("Invalid recovery phrase");

      const s =
        status ?? (await fetch("/api/vault/init").then((r) => r.json()));
      if (!s?.initialized) throw new Error("Vault not initialized");

      const recKey = await deriveWrappingKey(
        norm,
        s.kdf_params.recoverySalt,
        s.kdf_params.iterations,
      );
      try {
        vaultKeyRef.current = await unwrapVaultKey(
          { ciphertext: s.recovery_wrapped_key, iv: s.recovery_wrapped_key_iv },
          recKey,
        );
      } catch {
        throw new Error("Recovery phrase did not match");
      }

      setUnlocked(true);
      await changeMasterPassword(newMasterPassword); // re-wrap with new password
      await loadItems();
    },
    [status, loadItems, changeMasterPassword],
  );

  // ---- CRUD ----
  const addItem = useCallback(
    async (secret: VaultSecret, type: VaultItemType = "login") => {
      const key = vaultKeyRef.current;
      if (!key) throw new Error("Vault is locked");
      const { ciphertext, iv } = await encryptJSON(secret, key);
      const res = await fetch("/api/vault/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, ciphertext, iv }),
      });
      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: "Failed" }));
        throw new Error(error);
      }
      const { item } = (await res.json()) as { item: VaultItemRow };
      setItems((prev) => [{ ...item, secret }, ...prev]);
    },
    [],
  );

  const updateItem = useCallback(
    async (
      id: string,
      secret: VaultSecret,
      opts: { favorite?: boolean; folderId?: string | null } = {},
    ) => {
      const key = vaultKeyRef.current;
      if (!key) throw new Error("Vault is locked");
      const { ciphertext, iv } = await encryptJSON(secret, key);
      const res = await fetch(`/api/vault/items/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ciphertext,
          iv,
          favorite: opts.favorite ?? false,
          folderId: opts.folderId ?? null,
        }),
      });
      if (!res.ok) throw new Error("Update failed");
      const { item } = (await res.json()) as { item: VaultItemRow };
      setItems((prev) =>
        prev.map((it) => (it.id === id ? { ...item, secret } : it)),
      );
    },
    [],
  );

  const deleteItem = useCallback(async (id: string) => {
    const res = await fetch(`/api/vault/items/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Delete failed");
    setItems((prev) => prev.filter((it) => it.id !== id));
  }, []);

  const generate = useCallback(
    (opts?: PasswordOptions) => generatePassword(opts),
    [],
  );

  const value: VaultContextValue = {
    loading,
    isInitialized: status?.initialized ?? false,
    isUnlocked: unlocked,
    items,
    beginSetup,
    finalizeSetup,
    unlock,
    unlockWithRecovery,
    changeMasterPassword,
    lock,
    addItem,
    updateItem,
    deleteItem,
    generate,
  };

  return (
    <VaultContext.Provider value={value}>{children}</VaultContext.Provider>
  );
}

export function useVault() {
  const ctx = useContext(VaultContext);
  if (!ctx) throw new Error("useVault must be used inside <VaultProvider>");
  return ctx;
}
