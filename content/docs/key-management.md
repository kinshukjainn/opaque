---
title: Key Management and KDF
slug: key-management
description: How EndVault derives, wraps, stores, and rotates keys — and what a KDF actually does.
---

## Overview

Key management is the part of EndVault that decides *which* keys exist, *where*
they come from, and *what is ever written to the database*. The short version:
exactly one key — the **Vault Key** — encrypts your items, and that key is only
ever stored in **wrapped** (re-encrypted) form. The keys that do the wrapping are
**derived** on demand from things you know or hold: your master password and
your recovery phrase. The server stores the wrapped blobs and the public recipe
for re-deriving those wrapping keys — never a usable key itself.

This page goes deeper than the [Zero Knowledge Model](/docs/zero-knowledge-model)
page; read that first if you want the high-level intuition.

## The key hierarchy

```
master password ──KDF(salt, params)──▶ password key ──wraps──▶ Vault Key
recovery phrase ──BIP39 derivation────▶ recovery key ──wraps──▶ Vault Key
                                                                  │
                                                                  └─ encrypts every item
```

- **Vault Key** — a strong, randomly generated key. It is the *only* key that
  ever touches item data. It is generated once, at vault setup, and ideally
  never changes for the life of the vault.
- **Password key** — derived from your master password using a KDF plus a
  random salt. Its only job is to wrap/unwrap the Vault Key.
- **Recovery key** — derived from a recovery phrase. Its only job is to wrap a
  second, independent copy of the Vault Key.

The reason there are wrapping keys at all is decoupling: because items are bound
to the Vault Key and not to your password, you can change your password (or
recover via phrase) by re-wrapping one small key, instead of re-encrypting
everything you own.

## What a KDF is, and why it's slow on purpose

A **KDF (Key Derivation Function)** turns a human-chosen password into a
fixed-size cryptographic key. You can't just use a password as a key directly —
passwords are short, predictable, and drawn from a tiny slice of all possible
values. A KDF fixes two problems at once:

1. **Format.** It produces a uniform, full-strength key from arbitrary text.
2. **Cost.** It is *deliberately expensive* to compute — slow, and often
   memory-hungry.

That second point is the whole game. If the database ever leaks, an attacker
has your `wrapped_vault_key` and the public parameters, and can try to guess your
password offline. A fast hash would let them try billions of guesses per second.
A good KDF makes each guess cost real time and memory, dragging an attacker's
throughput down from billions per second to a comparative trickle.

> Plain-language version: a KDF is a lock that takes a noticeable moment to turn.
> You barely notice the half-second when you log in. An attacker trying millions
> of passwords notices it enormously.

### The common choices

| Algorithm     | Type           | Notes                                                       |
| ------------- | -------------- | ----------------------------------------------------------- |
| **Argon2id**  | Memory-hard    | Modern recommendation; resists GPU/ASIC cracking best       |
| **scrypt**    | Memory-hard    | Strong, older, widely available                             |
| **PBKDF2**    | Iteration-only | Ubiquitous and FIPS-friendly, but easier to accelerate      |

EndVault records which one was used in the `kdf_algo` column, so the choice is
not baked in — it can be upgraded later and migrated per user.

## Salt and parameters (and why they're not secret)

Two things accompany the KDF and are stored **in the clear**:

- **Salt** (`kdf_salt`) — a random value mixed into the derivation. It ensures
  two users with the same password get completely different keys, and it defeats
  precomputed "rainbow table" attacks. A salt is per-user and unique; it does
  **not** need to be secret.
- **Parameters** (`kdf_params`) — the cost knobs: iteration count for PBKDF2, or
  memory/iterations/parallelism for Argon2id/scrypt. These are stored so the
  browser can reproduce the *exact same* derivation on every unlock.

Storing these openly is safe by design. EndVault's security rests on the secrecy
of your password and the fact that the Vault Key is never stored unwrapped — not
on hiding the salt or the cost settings. (Indeed they *must* be readable, or you
couldn't unlock your own vault.)

## What's actually stored

Every key-related field lives on the user's row and is either an opaque blob or a
public recipe:

| Column                    | Holds                          | Secret? |
| ------------------------- | ------------------------------ | ------- |
| `kdf_algo`                | Which KDF was used             | No      |
| `kdf_salt`                | Random salt for the password key | No    |
| `kdf_params`              | KDF cost parameters (JSON)     | No      |
| `wrapped_vault_key`       | Vault Key encrypted by the password key | Useless without the password |
| `wrapped_vault_key_iv`    | IV for that wrapping           | No      |
| `recovery_wrapped_key`    | Vault Key encrypted by the recovery key | Useless without the phrase |
| `recovery_wrapped_key_iv` | IV for that wrapping           | No      |

Notably absent: the master password, the recovery phrase, the password key, the
recovery key, and the unwrapped Vault Key. None of these is ever transmitted to
or written by the server.

## Wrapping and unwrapping

"Wrapping" is just authenticated encryption of one key by another. EndVault uses
an authenticated cipher (AES-GCM-style: ciphertext plus an authentication tag),
which gives a useful property for free:

- **Wrap:** `wrapped_vault_key = encrypt(vaultKey, passwordKey, iv)`
- **Unwrap:** `vaultKey = decrypt(wrapped_vault_key, passwordKey, iv)`

Because the cipher is *authenticated*, an incorrect password produces a
derivation that fails the integrity check on decryption rather than silently
returning garbage. That failed check is exactly how the app knows you typed the
wrong master password — without the server being involved at all.

Each wrapping uses its own **IV** (`*_iv`). With GCM-style ciphers, reusing an
IV with the same key is catastrophic, so IVs are random and unique per
encryption operation (this applies to item encryption too, not just key
wrapping).

## The two derivation paths

### Password path

The everyday path. On unlock, the browser fetches `kdf_algo`, `kdf_salt`, and
`kdf_params`, re-derives the password key from the typed master password, and
unwraps the Vault Key from `wrapped_vault_key`.

### Recovery path (BIP39)

The recovery phrase is a BIP39 mnemonic — a list of words encoding a large amount
of random entropy (128 bits or more). Because it is genuinely high-entropy
(unlike a human password), it isn't vulnerable to guessing in the same way a weak
password is. The browser converts the mnemonic into the recovery key and uses it
to unwrap the Vault Key from `recovery_wrapped_key`.

> The recovery phrase is shown to you exactly once, at setup, and is never sent
> to the server. Treat it like the only spare key to a safe — because that's
> what it is.

## Key lifecycle operations

### Setup

1. Generate a random Vault Key in the browser.
2. Generate a random salt; derive the password key via the chosen KDF.
3. Generate a BIP39 recovery phrase; derive the recovery key.
4. Wrap the Vault Key twice (password key, recovery key).
5. Send `kdf_algo`, `kdf_salt`, `kdf_params`, both wrapped keys, and both IVs to
   the server. Nothing else.

### Unlock

Re-derive the password key from the stored salt/params, unwrap the Vault Key,
keep it in memory for the session. Decrypt items on demand.

### Master-password change

Only the password side moves. The browser keeps the *same* Vault Key, generates
a **new** salt and KDF parameters, derives a new password key, and re-wraps the
Vault Key. The server updates `kdf_salt`, `kdf_params`, `wrapped_vault_key`, and
`wrapped_vault_key_iv` — and deliberately leaves `recovery_wrapped_key` and the
Vault Key untouched. This is why a password change is instant: no items are
re-encrypted.

### Recovery

Derive the recovery key from the phrase, unwrap the Vault Key from
`recovery_wrapped_key`, then immediately run a password change to re-establish a
password-side wrapper with a new master password.

## Choosing KDF parameters (developer guidance)

Parameters are a balance between user-perceptible delay and attacker cost. The
usual approach is to tune to a **target derivation time on representative
hardware** — commonly somewhere around a few hundred milliseconds — rather than
copying fixed numbers.

- **Argon2id** — set a memory cost (e.g. tens of MiB or more), a small number of
  iterations, and parallelism to match; memory-hardness is what frustrates GPUs.
- **scrypt** — tune the cost factor `N` (plus `r`, `p`) to the same time target.
- **PBKDF2-HMAC-SHA256** — needs a *high* iteration count (hundreds of thousands
  and up) because it isn't memory-hard.

Always consult current published guidance (e.g. OWASP's password-storage
recommendations) for up-to-date minimums, and re-evaluate periodically — what's
expensive for an attacker today gets cheaper every year. Because EndVault stores
`kdf_algo` and `kdf_params` per user, you can raise parameters or switch
algorithms over time and migrate users transparently on their next unlock.

## Security properties and pitfalls

- **Compromise of the database alone reveals nothing usable** — only wrapped
  keys and public parameters.
- **Strength is bounded by the master password.** A weak password is the soft
  spot; the KDF buys time, not invulnerability. Encourage strong, unique
  passwords.
- **Never reuse an IV** with the same key, for wrapping or item encryption.
  Generate a fresh random IV every time.
- **Never log or transmit derived keys or the Vault Key.** They must live only
  in browser memory and only while unlocked.
- **The Vault Key shouldn't rotate casually.** Rotating it means re-encrypting
  every item; the design intentionally avoids this by rotating *wrappers*
  instead. Reserve true Vault Key rotation for genuine compromise scenarios.
- **No backdoor exists.** If both the password and the recovery phrase are lost,
  the wrapped Vault Key can never be opened. This is a feature, not a gap.

## Developer reference

Illustrative shape (the real primitives live in the client crypto module):

```ts
// Derive the password key from public salt + params.
const passwordKey = await deriveKey(masterPassword, kdf_salt, kdf_params, kdf_algo);

// Unwrap the Vault Key (authenticated decryption — a wrong password throws).
const vaultKey = await unwrapKey(wrapped_vault_key, wrapped_vault_key_iv, passwordKey);

// On password change: keep vaultKey, make a new salt/params, re-wrap.
const newSalt = randomSalt();
const newParams = currentParams();
const newPasswordKey = await deriveKey(newMasterPassword, newSalt, newParams, kdf_algo);
const { ciphertext, iv } = await wrapKey(vaultKey, newPasswordKey);
// PUT { kdf_salt: newSalt, kdf_params: newParams,
//       wrapped_vault_key: ciphertext, wrapped_vault_key_iv: iv }
```

## Where to go next

- **Zero Knowledge Model** — the high-level guarantee these keys deliver.
- **Architecture** — how the routes and database store and serve this material.
- **Project setup** — install and run the project.
