// ============================================================
//  lib/types.ts  —  shared types
// ============================================================

import type { ServiceId } from "./services";

export type VaultItemType = "login" | "note" | "card" | "identity";

/**
 * The PLAINTEXT secret. This object is what gets encrypted into
 * `vault_items.ciphertext`. The server never sees these fields.
 */
export interface VaultSecret {
  service: ServiceId; // 'google' | ... | 'other'   (UX only)
  customName?: string; // used when service === 'other'
  title: string;
  username?: string;
  password?: string;
  url?: string;
  notes?: string;
  // card / identity types can add their own fields freely:
  cardNumber?: string;
  cardExpiry?: string;
  cardCvv?: string;
}

/** What the API returns for an item — ciphertext only, no secrets. */
export interface VaultItemRow {
  id: string;
  type: VaultItemType;
  ciphertext: string;
  iv: string;
  favorite: boolean;
  folder_id: string | null;
  created_at: string;
  updated_at: string;
}

/** An item after it's been decrypted in the browser. */
export interface DecryptedItem extends VaultItemRow {
  secret: VaultSecret;
}

/** Public crypto material returned to the owner for unlock/recovery. */
export interface VaultStatus {
  initialized: boolean;
  kdf_algo: string | null;
  kdf_salt: string | null;
  kdf_params: {
    iterations: number;
    hash: string;
    recoverySalt: string;
  } | null;
  wrapped_vault_key: string | null;
  wrapped_vault_key_iv: string | null;
  recovery_wrapped_key: string | null;
  recovery_wrapped_key_iv: string | null;
}
