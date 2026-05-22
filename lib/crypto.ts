// ============================================================
//  lib/crypto.ts  —  CLIENT-SIDE crypto (runs in the browser only)
// ------------------------------------------------------------
//  Zero-knowledge core. Everything here uses the native Web Crypto
//  API (crypto.subtle). The server NEVER imports or runs this.
//
//  Design:
//    - A random 256-bit Vault Key encrypts every entry (AES-GCM).
//    - The Vault Key is wrapped (encrypted) two independent ways:
//        (a) by a key derived from the master password
//        (b) by a key derived from the BIP39 recovery phrase
//    - PBKDF2 today; swapping to Argon2id later = change ONE function
//      (deriveWrappingKey) since kdf_algo/params are stored per-user.
// ============================================================

import { generateMnemonic, validateMnemonic } from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english.js";

// ---------- KDF parameters (versioned; stored in users.kdf_params) ----------

export interface KdfParams {
  algo: "pbkdf2"; // future: "argon2id"
  iterations: number; // PBKDF2 rounds
  hash: "SHA-256";
  recoverySalt: string; // base64 — separate salt for the recovery-phrase key
}

export const DEFAULT_KDF: Omit<KdfParams, "recoverySalt"> = {
  algo: "pbkdf2",
  iterations: 600_000, // OWASP guidance for PBKDF2-SHA256
  hash: "SHA-256",
};

// ---------- base64 helpers ----------

export function bufToB64(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

export function b64ToBuf(b64: string): Uint8Array<ArrayBuffer> {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export function newSalt(bytes = 16): string {
  return bufToB64(crypto.getRandomValues(new Uint8Array(bytes)));
}

// ---------- key derivation (the ONE place to swap in Argon2id later) ----------

/**
 * Derive an AES-GCM wrapping key from a secret (master password OR mnemonic).
 * To move to Argon2id: branch on params.algo, hash with hash-wasm's argon2id,
 * then crypto.subtle.importKey("raw", hash, "AES-GCM", ...). Nothing else changes.
 */
export async function deriveWrappingKey(
  secret: string,
  saltB64: string,
  iterations: number = DEFAULT_KDF.iterations,
): Promise<CryptoKey> {
  const base = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: b64ToBuf(saltB64), iterations, hash: "SHA-256" },
    base,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

// ---------- the Vault Key ----------

export function generateVaultKey(): Promise<CryptoKey> {
  // extractable: true so we can export+wrap it. It lives in memory only.
  return crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, [
    "encrypt",
    "decrypt",
  ]);
}

export interface WrappedKey {
  ciphertext: string; // base64
  iv: string; // base64
}

/** Wrap the Vault Key under a wrapping key (export raw → AES-GCM encrypt). */
export async function wrapVaultKey(
  vaultKey: CryptoKey,
  wrappingKey: CryptoKey,
): Promise<WrappedKey> {
  const raw = await crypto.subtle.exportKey("raw", vaultKey);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    wrappingKey,
    raw,
  );
  return { ciphertext: bufToB64(ct), iv: bufToB64(iv) };
}

/** Unwrap → throws if the wrapping key is wrong (AES-GCM auth tag fails). */
export async function unwrapVaultKey(
  wrapped: WrappedKey,
  wrappingKey: CryptoKey,
): Promise<CryptoKey> {
  const raw = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: b64ToBuf(wrapped.iv) },
    wrappingKey,
    b64ToBuf(wrapped.ciphertext),
  );
  return crypto.subtle.importKey("raw", raw, "AES-GCM", true, [
    "encrypt",
    "decrypt",
  ]);
}

// ---------- per-item encryption ----------

export async function encryptJSON(
  obj: unknown,
  vaultKey: CryptoKey,
): Promise<{ ciphertext: string; iv: string }> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = new TextEncoder().encode(JSON.stringify(obj));
  const ct = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    vaultKey,
    data,
  );
  return { ciphertext: bufToB64(ct), iv: bufToB64(iv) };
}

export async function decryptJSON<T>(
  ciphertext: string,
  iv: string,
  vaultKey: CryptoKey,
): Promise<T> {
  const pt = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: b64ToBuf(iv) },
    vaultKey,
    b64ToBuf(ciphertext),
  );
  return JSON.parse(new TextDecoder().decode(pt)) as T;
}

// ---------- BIP39 recovery phrase ----------

export function generateRecoveryPhrase(): string {
  return generateMnemonic(wordlist, 128); // 128 bits → 12 words
}

export function isValidRecoveryPhrase(phrase: string): boolean {
  return validateMnemonic(
    phrase.trim().toLowerCase().replace(/\s+/g, " "),
    wordlist,
  );
}

export function normalizePhrase(phrase: string): string {
  return phrase.trim().toLowerCase().replace(/\s+/g, " ");
}

// ---------- password generator (unbiased, client-side) ----------

export interface PasswordOptions {
  length?: number;
  lower?: boolean;
  upper?: boolean;
  digits?: boolean;
  symbols?: boolean;
}

export function generatePassword(opts: PasswordOptions = {}): string {
  const {
    length = 20,
    lower = true,
    upper = true,
    digits = true,
    symbols = true,
  } = opts;
  const charset =
    (lower ? "abcdefghijklmnopqrstuvwxyz" : "") +
    (upper ? "ABCDEFGHIJKLMNOPQRSTUVWXYZ" : "") +
    (digits ? "0123456789" : "") +
    (symbols ? "!@#$%^&*()-_=+[]{};:,.<>?" : "");
  if (!charset) throw new Error("Select at least one character set");

  // rejection sampling avoids modulo bias
  const limit = Math.floor(0xffffffff / charset.length) * charset.length;
  const out: string[] = [];
  const buf = new Uint32Array(1);
  while (out.length < length) {
    crypto.getRandomValues(buf);
    if (buf[0] >= limit) continue;
    out.push(charset[buf[0] % charset.length]);
  }
  return out.join("");
}
