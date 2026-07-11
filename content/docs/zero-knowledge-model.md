---
title: Zero Knowledge Model
slug: zero-knowledge-model
description: How Opaque keeps your secrets unreadable to its own servers — explained for everyone.
---

## The one-sentence version

Opaque is **zero-knowledge**: your secrets are locked inside your browser
before they're sent anywhere, and the key to unlock them is made from something
only you know — so the Opaque servers store your data but can never read it.

## In plain words

Imagine a left-luggage counter at a train station, but with a twist. You bring
your valuables already sealed inside a locked box. The staff take the box and
shelve it. They give it back when you return. At no point do they have a key,
and the box has no keyhole they can reach — it only opens with a combination
that lives in your head.

Opaque works the same way:

1. You type a secret (say, your Instagram password) into the app.
2. Your **browser** locks it into an unreadable form before sending it.
3. The server stores that locked form and nothing else.
4. When you come back, the server hands the locked form to your browser, and
   your browser unlocks it — using a key built from your master password.

If a thief stole the entire Opaque database tomorrow, they'd walk away with a
pile of locked boxes and no combinations. The contents would be useless noise.

## What the server can and cannot see

"Zero-knowledge" is precise: the server genuinely has *zero knowledge* of your
secret contents. It does still need a little information to function — like your
email, so you can log in.

| Data                                   | Stored on the server? | Can the server read it? |
| -------------------------------------- | --------------------- | ----------------------- |
| Item title (e.g. "Personal Gmail")     | Yes, encrypted        | No                      |
| Username / email *inside* an item      | Yes, encrypted        | No                      |
| Password                               | Yes, encrypted        | No                      |
| Website URL                            | Yes, encrypted        | No                      |
| The service name (Instagram, etc.)     | Yes, encrypted        | No                      |
| Notes                                  | Yes, encrypted        | No                      |
| Your **account** email (for login)     | Yes                   | Yes — needed to sign in |
| When an item was created/updated       | Yes                   | Yes (timestamps)        |
| Item *type* (login / note / card)      | Yes                   | Yes (not a secret)      |

Everything in the first group is stored only as `ciphertext` plus an `iv` (an
"initialization vector" — a small random value that makes each encryption
unique). The server moves those blobs around but has no way to turn them back
into words.

## The keys, and why there are several

This is the heart of the design. Bear with one new idea: **wrapping**. To "wrap"
a key just means to encrypt it with another key. A wrapped key is itself a
locked box.

Opaque uses a small hierarchy:

- **Master password** — what you type. It never leaves your browser and is
  *never stored anywhere*, not even encrypted.
- **Vault Key** — a strong, random key generated once when you set up your
  vault. *This* is the key that actually encrypts and decrypts every item.
- **Password-derived key** — produced from your master password using a slow
  "key derivation function" (KDF) plus a random `salt`. It is used to **wrap**
  (encrypt) a copy of the Vault Key.
- **Recovery key** — derived from a one-time **recovery phrase** (a list of
  random words). It wraps a *second* copy of the Vault Key.

So the server stores two locked copies of the same Vault Key:

```
wrapped_vault_key            ← Vault Key, locked by your password
recovery_wrapped_key         ← Vault Key, locked by your recovery phrase
```

> Why two copies? It means there are two independent ways to get back to the
> Vault Key — your password *or* your recovery phrase — without the server ever
> holding the Vault Key in readable form.

### Why not just encrypt items with the password directly?

Two big reasons, and both improve your life:

- **Changing your password is instant.** Because items are encrypted with the
  Vault Key (not the password), changing your master password only re-wraps the
  Vault Key with a new password-derived key. Not a single item has to be
  re-encrypted.
- **Recovery is possible.** A second wrapper (the recovery phrase) gives you a
  way back in if you forget your password — again, without the server learning
  anything.

## The flows, step by step

### Setting up the vault (first time)

1. Your browser generates a random Vault Key.
2. You choose a master password; the browser derives a key from it (with a fresh
   random salt) and wraps the Vault Key with it.
3. The browser also generates a recovery phrase, derives a recovery key, and
   wraps a second copy of the Vault Key with it.
4. Only the **wrapped** keys, the salt, and the KDF parameters are sent to the
   server and saved. The master password, the recovery phrase, and the raw Vault
   Key never leave the browser.

### Unlocking the vault

1. You enter your master password.
2. The browser fetches the salt, KDF parameters, and `wrapped_vault_key`.
3. It re-derives the password key and uses it to **unwrap** the Vault Key.
4. With the Vault Key in memory, the browser can decrypt items as needed.

### Adding or editing an item

1. You fill in the form (title, password, etc.).
2. The browser encrypts the whole thing with the Vault Key, producing
   `ciphertext` + `iv`.
3. Only `ciphertext` + `iv` (and a non-secret `type`) are sent to the server.

### Changing your master password

Only the password-side wrapper changes: a new salt, new KDF parameters, and a
freshly `wrapped_vault_key`. The recovery wrapper and the Vault Key itself stay
exactly as they were — which is why the change is instant and doesn't lock you
out of anything.

### Recovering access

If you forget your master password, you enter your recovery phrase instead. The
browser derives the recovery key, unwraps the Vault Key from
`recovery_wrapped_key`, and then lets you set a new master password (which simply
re-wraps the Vault Key on the password side).

## What this protects you from — and what it doesn't

Honest security docs draw this line clearly.

**Protected against:**

- A database breach or leaked backup — attackers get only ciphertext.
- A curious or malicious server operator — there is no code path that exposes a
  plaintext secret to the server.
- A compromised network connection — only locked data travels over it.

**Not protected against (and no zero-knowledge system is):**

- A **weak master password.** If your password is guessable, an attacker who
  steals the database could try to brute-force the wrapper offline. The KDF is
  deliberately slow to make this expensive, but a strong, unique password is
  still your real defense.
- A **compromised device or browser.** Malware or a malicious browser extension
  can read secrets while the vault is unlocked, because that's where decryption
  happens.
- **Losing both factors.** If you forget your master password *and* lose your
  recovery phrase, no one — including Opaque — can recover your data. That's
  the trade-off for true zero-knowledge: there is no backdoor.
- **Phishing.** If you're tricked into typing your master password into a fake
  page, encryption can't help. Always confirm you're on the real site.

## For developers

Everything below lives in `lib/crypto.ts`, runs **in the browser only**, and is
built on the native Web Crypto API (`crypto.subtle`). The server never imports
this module.

Concretely: the Vault Key is a random **256-bit AES-GCM** key; item payloads and
both wrapped copies of the Vault Key are AES-GCM ciphertexts with a fresh
12-byte IV each time; and the wrapping keys are derived with
**PBKDF2-SHA-256 at 600,000 iterations** by default (OWASP's guidance).
`kdf_algo` and `kdf_params` are stored per user and versioned, so upgrading the
KDF later (e.g. to Argon2id) means changing a single function —
`deriveWrappingKey` — with no up-front migration of stored data.

```ts
// Derive a wrapping key from the master password (PBKDF2-SHA-256).
// The salt and iteration count come from the server and are NOT secret.
const passwordKey = await deriveWrappingKey(
  masterPassword,
  kdf_salt,
  kdf_params.iterations,
);

// Unwrap the Vault Key — the only key that touches item data.
// Throws if the password is wrong (the AES-GCM auth tag fails).
const vaultKey = await unwrapVaultKey(
  { ciphertext: wrapped_vault_key, iv: wrapped_vault_key_iv },
  passwordKey,
);

// Encrypt an item before it ever leaves the browser (fresh IV every call).
const { ciphertext, iv } = await encryptJSON(secret, vaultKey);

// Decrypt on the way back in.
const secret = await decryptJSON<VaultSecret>(item.ciphertext, item.iv, vaultKey);
```

A few consequences of this model that are easy to overlook:

- **The server is "dumb" on purpose.** The `/api/vault/items` and
  `/api/vault/init` routes only persist and return opaque blobs and public KDF
  parameters. They validate ownership and shape, never content.
- **Search must be client-side.** Because the server can't read titles or
  usernames, fuzzy search (via Fuse.js) runs in the browser over the *decrypted*
  items after unlock. There is no server-side search and there can't be one.
- **A wrong password fails loudly, not silently.** Unwrapping with the wrong
  key throws (AES-GCM authentication), so "wrong master password" is detected
  without the server ever checking a password.
- **Recovery phrases use BIP39.** The mnemonic is 12 English words (128 bits),
  generated in the browser with `@scure/bip39` and turned into a recovery key
  using a separate `recoverySalt` stored inside `kdf_params`. The server only
  ever sees the resulting `recovery_wrapped_key`.
- **Never log plaintext.** Any future feature that handles secrets must keep the
  encrypt/decrypt boundary inside the browser. The moment a secret reaches the
  server in readable form, the zero-knowledge guarantee is broken.

## Quick FAQ

**Can Opaque reset my password and recover my data?**
No. By design, Opaque never holds your keys. A reset would mean a backdoor,
which would break the entire model.

**What happens if Opaque gets hacked?**
Attackers would obtain encrypted blobs and public KDF parameters — not your
secrets. Your master password remains your protection.

**Is my account email a secret?**
No. It's used for login and is stored in readable form. The secrets *inside*
your items are what's encrypted.

## Where to go next

- **Project setup** — install, configure, and run Opaque.
- **Architecture** — how the routes, database, and webhook sync fit together.
- **Introduction** — the high-level overview of the project.
