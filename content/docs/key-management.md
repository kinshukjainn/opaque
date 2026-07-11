---
title: Key Management and KDF
slug: key-management
description: How Opaque derives, wraps, stores, and rotates keys — the exact primitives, parameters, and lifecycle rules implemented in the client crypto module.
---

## Overview

Key management is the part of Opaque that decides *which* keys exist, *where*
they come from, and *what is ever written to the database*. The short version:
exactly one key — the **Vault Key** — encrypts your items, and that key is only
ever stored in **wrapped** (re-encrypted) form. The keys that do the wrapping
are **derived** on demand from things you know or hold: your master password
and your recovery phrase. The server stores the wrapped blobs and the public
recipe for re-deriving those wrapping keys — never a usable key itself.

All of this is implemented in a single client-side module, `lib/crypto.ts`,
built directly on the browser's native Web Crypto API (`crypto.subtle`). The
server never imports or executes it; every derivation, wrap, unwrap,
encryption, and decryption happens in the browser.

This page goes deeper than the [Zero Knowledge Model](/docs/zero-knowledge-model)
page; read that first if you want the high-level intuition.

## The key hierarchy

```
master password ─────────────── PBKDF2(kdf_salt, iterations) ─────▶ password key ──wraps──▶ Vault Key
recovery phrase ── normalize ── PBKDF2(recoverySalt, iterations) ──▶ recovery key ──wraps──▶ Vault Key
                                                                                               │
                                                                                               └── encrypts every item (AES-GCM)
```

- **Vault Key** — a random 256-bit AES-GCM key generated in the browser at
  vault setup (`generateVaultKey`). It is the *only* key that ever touches item
  data, it lives exclusively in memory while the vault is unlocked, and it
  ideally never changes for the life of the vault. It is created *extractable*
  for exactly one reason: it must be exportable so it can be wrapped.
- **Password key** — derived from your master password with PBKDF2 plus a
  random per-user salt (`kdf_salt`). Non-extractable, transient, and its only
  job is to wrap/unwrap the Vault Key.
- **Recovery key** — derived from your **normalized** recovery phrase through
  the *same* PBKDF2 path, but with its own dedicated salt (`recoverySalt`,
  stored inside `kdf_params`). Also non-extractable, also exists only to
  wrap/unwrap. BIP39 supplies the phrase's *format* — wordlist, generation, and
  checksum — while the key itself comes from the shared KDF; see
  [Recovery Phrase](/docs/recovery-phrase) for the full pipeline.

The reason there are wrapping keys at all is decoupling: because items are
bound to the Vault Key and not to your password, changing your password (or
recovering via phrase) means re-wrapping one 32-byte key instead of
re-encrypting everything you own.

## The exact primitives

| Piece | Primitive | Details |
| --- | --- | --- |
| Vault Key | AES-GCM, 256-bit | `crypto.subtle.generateKey`, extractable (so it can be exported and wrapped), memory-only |
| Wrapping keys | AES-GCM, 256-bit | Derived via `deriveKey`, **non-extractable**, never stored or transmitted |
| KDF | PBKDF2-HMAC-SHA256 | 600,000 iterations by default (`DEFAULT_KDF`, per OWASP guidance for PBKDF2-SHA256) |
| Salts | `crypto.getRandomValues` | 16 random bytes (`newSalt`), base64-encoded, stored in the clear |
| IVs | `crypto.getRandomValues` | 12 random bytes, fresh for every single encryption — key wraps and item writes alike |
| Item encryption | AES-GCM over UTF-8 JSON | `encryptJSON` / `decryptJSON`, fresh IV per write |
| Encoding | base64 | Every binary value (salts, IVs, ciphertexts) crosses the wire and hits the database as a base64 string |

## What a KDF is, and why it's slow on purpose

A **KDF (Key Derivation Function)** turns a human-chosen password into a
fixed-size cryptographic key. You can't just use a password as a key directly —
passwords are short, predictable, and drawn from a tiny slice of all possible
values. A KDF fixes two problems at once:

1. **Format.** It produces a uniform, full-strength key from arbitrary text.
2. **Cost.** It is *deliberately expensive* to compute — slow, and (for the
   best algorithms) memory-hungry.

That second point is the whole game. If the database ever leaks, an attacker
has your `wrapped_vault_key` and the public parameters, and can try to guess
your password offline. A fast hash would let them try billions of guesses per
second. A good KDF makes each guess cost real time — with Opaque's defaults,
every single guess costs 600,000 chained HMAC-SHA256 computations — dragging an
attacker's throughput down from billions per second to a comparative trickle.

> Plain-language version: a KDF is a lock that takes a noticeable moment to
> turn. You barely notice the half-second when you log in. An attacker trying
> millions of passwords notices it enormously.

### The common choices

| Algorithm     | Type           | Notes                                                  |
| ------------- | -------------- | ------------------------------------------------------ |
| **Argon2id**  | Memory-hard    | Modern recommendation; resists GPU/ASIC cracking best  |
| **scrypt**    | Memory-hard    | Strong, older, widely available                        |
| **PBKDF2**    | Iteration-only | Ubiquitous and FIPS-friendly, but easier to accelerate |

Opaque uses **PBKDF2-HMAC-SHA256** today, for a pragmatic reason: it is the one
password-stretching KDF built natively into Web Crypto, so the entire
derivation runs on audited browser primitives with no WASM dependency. The
algorithm is recorded per user (`kdf_algo`, mirrored as `algo` inside
`kdf_params`), so the choice is not baked in — the module is explicitly
structured for an Argon2id upgrade later (see
[Choosing and upgrading KDF parameters](#choosing-and-upgrading-kdf-parameters)).

## Salts and parameters (and why they're not secret)

Three kinds of public values accompany the KDF and are stored **in the clear**:

- **Password salt** (`kdf_salt`) — 16 random bytes mixed into the password
  derivation. It ensures two users with the same password get completely
  different keys, and it defeats precomputed "rainbow table" attacks. Per-user,
  unique, and **not** secret.
- **Recovery salt** (`recoverySalt`, carried inside `kdf_params`) — a second,
  independent 16-byte salt for the recovery-phrase derivation. The password and
  the phrase never share a salt, so the two doors stay cryptographically
  independent.
- **Parameters** (`kdf_params`) — the full, versioned derivation recipe,
  serialized as JSON. Its exact shape is defined by the `KdfParams` interface:

```ts
{
  algo: "pbkdf2",           // future: "argon2id"
  iterations: 600000,       // PBKDF2 rounds
  hash: "SHA-256",
  recoverySalt: "<base64>", // dedicated salt for the recovery-phrase key
}
```

These are stored so the browser can reproduce the *exact same* derivation on
every unlock. Storing them openly is safe by design: Opaque's security rests on
the secrecy of your password and phrase and on the fact that the Vault Key is
never stored unwrapped — not on hiding salts or cost settings. (Indeed they
*must* be readable, or you couldn't unlock your own vault.) Because the recipe
is versioned per user, parameters can be raised — or the algorithm swapped —
over time, migrating users transparently.

## What's actually stored

Every key-related field lives on the user's row and is either an opaque blob or
a public recipe:

| Column                    | Holds                                                                   | Secret? |
| ------------------------- | ----------------------------------------------------------------------- | ------- |
| `kdf_algo`                | Which KDF was used (mirrors `algo` in the params)                       | No      |
| `kdf_salt`                | Random 16-byte salt for the password key (base64)                       | No      |
| `kdf_params`              | The serialized `KdfParams` recipe — `algo`, `iterations`, `hash`, `recoverySalt` | No |
| `wrapped_vault_key`       | Vault Key encrypted by the password key                                 | Useless without the password |
| `wrapped_vault_key_iv`    | 12-byte IV for that wrapping (base64)                                   | No      |
| `recovery_wrapped_key`    | Vault Key encrypted by the recovery key                                 | Useless without the phrase |
| `recovery_wrapped_key_iv` | 12-byte IV for that wrapping (base64)                                   | No      |

Notably absent: the master password, the recovery phrase, the password key, the
recovery key, and the unwrapped Vault Key. None of these is ever transmitted to
or written by the server — they exist only in browser memory, and only while
needed.

## Wrapping and unwrapping, exactly

"Wrapping" is authenticated encryption of one key by another. Concretely
(`wrapVaultKey` / `unwrapVaultKey`):

- **Wrap:** export the Vault Key to its 32 raw bytes
  (`crypto.subtle.exportKey("raw", …)`), generate a fresh random 12-byte IV,
  AES-GCM-encrypt those bytes under the wrapping key, and base64-encode the
  result into a `{ ciphertext, iv }` pair.
- **Unwrap:** AES-GCM-decrypt the blob under the derived wrapping key, then
  re-import the raw bytes as an AES-GCM key. The re-imported Vault Key is
  created extractable so a later password change can wrap it again.

Because AES-GCM is *authenticated* (ciphertext plus an integrity tag), a wrong
password or phrase derives a wrong wrapping key, and decryption **throws**
rather than returning garbage. That thrown authentication failure is exactly
how the app knows you mistyped — with zero server involvement. There is no
"check password" endpoint anywhere; correctness is proven only by successfully
opening the blob.

Two implementation notes:

- Opaque uses `encrypt`/`decrypt` over the exported raw key rather than Web
  Crypto's `wrapKey`/`unwrapKey` convenience calls. The security is equivalent;
  doing it manually keeps full control over encoding and error handling.
- Each wrapping uses its own **IV**. With GCM, reusing an IV under the same key
  is catastrophic (it leaks plaintext relationships and enables tag forgery),
  so IVs are random and generated fresh for *every* encryption operation — key
  wraps and item writes alike. Never reuse, never hardcode.

## Item encryption

Items go through the same authenticated cipher, one layer down
(`encryptJSON` / `decryptJSON`):

1. The item's secret payload is serialized (`JSON.stringify`) and UTF-8
   encoded.
2. A fresh random 12-byte IV is generated.
3. The bytes are AES-GCM-encrypted under the **Vault Key**.
4. The resulting `{ ciphertext, iv }` pair — both base64 — is what the server
   stores for that item.

Consequences worth knowing:

- **Every save produces a brand-new IV and ciphertext**, even if the content
  barely changed. The server can see *that* something changed and roughly how
  big it is — never *what*.
- **Tampering is detected.** If a stored blob is modified, the GCM tag check
  fails and `decryptJSON` throws instead of yielding corrupted plaintext.
- **Decryption yields typed data:** the plaintext parses back from JSON into
  the item's secret object.

## The two derivation paths

### Password path

The everyday path. On unlock, the browser fetches `kdf_algo`, `kdf_salt`, and
`kdf_params`, then calls `deriveWrappingKey(masterPassword, kdf_salt,
iterations)`: the typed password is imported as PBKDF2 key material and
stretched into a 256-bit AES-GCM password key, which unwraps
`wrapped_vault_key`. Note that the password is used **exactly as typed** — no
trimming or case-folding — so the front end should guard against accidental
whitespace at entry time.

### Recovery path

The phrase path runs through the same function with different inputs. The
phrase is first **normalized** (trimmed, lowercased, whitespace collapsed) and
its BIP39 checksum validated; then
`deriveWrappingKey(normalizedPhrase, kdf_params.recoverySalt, iterations)`
produces the recovery key, which unwraps `recovery_wrapped_key`. The phrase is
genuinely high-entropy (128 bits), so unlike a human password it doesn't *need*
the KDF's stretching to resist guessing — the KDF is kept for uniformity (one
audited derivation path serving both doors) and as free extra hardening. Full
detail in [Recovery Phrase](/docs/recovery-phrase).

## Key lifecycle operations

### Setup

1. Generate a random Vault Key in the browser (`generateVaultKey`).
2. Generate two independent salts (`newSalt()` twice): `kdf_salt` for the
   password and `recoverySalt` for the phrase; assemble `kdf_params` from the
   defaults plus `recoverySalt`.
3. Derive the password key from the master password and `kdf_salt`.
4. Generate a BIP39 recovery phrase (`generateRecoveryPhrase`, 12 words), show
   it to the user exactly once, and derive the recovery key from the
   *normalized* phrase and `recoverySalt`.
5. Wrap the Vault Key twice — once under each key (`wrapVaultKey`), each wrap
   with its own fresh IV.
6. Send `kdf_algo`, `kdf_salt`, `kdf_params`, both wrapped keys, and both IVs
   to the server. Nothing else.

### Unlock

Re-derive the password key from the stored salt/params, unwrap the Vault Key,
keep it in memory for the session, and decrypt items on demand
(`decryptJSON`). On lock or tab close, the in-memory key is dropped and
everything returns to ciphertext-at-rest.

### Master-password change

Only the password side moves. The browser keeps the *same* Vault Key, generates
a **new** `kdf_salt`, derives a new password key, and re-wraps. The server
updates `kdf_salt`, `kdf_params`, `wrapped_vault_key`, and
`wrapped_vault_key_iv` — and deliberately leaves `recovery_wrapped_key` and the
Vault Key untouched. This is why a password change is instant: no items are
re-encrypted.

> **Invariant: carry the recovery material forward.** `kdf_params` contains
> `recoverySalt`, and the recovery derivation also reads `iterations` from the
> same record. The recovery wrapper was built with those exact values and
> **cannot be rebuilt without the phrase** — so a plain password change must
> write new params that *preserve* `recoverySalt` and the iteration count
> unchanged. Regenerating that salt (or bumping iterations) here would silently
> make every stored recovery phrase stop working.

### Recovery

Derive the recovery key from the phrase, unwrap the Vault Key from
`recovery_wrapped_key`, then immediately run a password change to re-establish
a password-side wrapper with a new master password. Because the phrase is in
hand during this flow, it is also the *only* safe moment to rebuild the
recovery wrapper — fresh `recoverySalt`, upgraded parameters, or a whole new
phrase — since both wrappers can be rewritten together.

## Choosing and upgrading KDF parameters

Parameters are a balance between user-perceptible delay and attacker cost. The
usual approach is to tune to a **target derivation time on representative
hardware** — commonly a few hundred milliseconds — rather than copying fixed
numbers.

- **PBKDF2-HMAC-SHA256** (today's algorithm) — needs a *high* iteration count
  because it isn't memory-hard. Opaque's default of **600,000** follows OWASP's
  published guidance for this construction; re-evaluate it periodically, since
  what's expensive for an attacker today gets cheaper every year.
- **Argon2id** (the planned upgrade) — set a memory cost (tens of MiB or more),
  a small iteration count, and parallelism to match; memory-hardness is what
  frustrates GPU farms.
- **scrypt** — tune the cost factor `N` (plus `r`, `p`) to the same time
  target.

### The Argon2id upgrade path, concretely

`deriveWrappingKey` is deliberately the **single seam** for this migration. The
plan, straight from the module's design notes:

1. Branch on `params.algo`. For `"argon2id"`, compute the hash with
   `hash-wasm`'s Argon2id implementation, reading memory/iterations/parallelism
   from `kdf_params`.
2. Import the resulting bytes as a key:
   `crypto.subtle.importKey("raw", hash, "AES-GCM", …)`.
3. Nothing else changes — wrapping, unwrapping, and item encryption are all
   downstream of the derived key.

Migration is per-user and lazy: on a successful unlock with the old parameters,
derive again under the new recipe, re-wrap the password side, and update the
row. The **recovery wrapper** can't be migrated without the phrase, so it
upgrades on the user's next recovery flow (or via an explicit "re-verify your
recovery phrase" prompt). Because `kdf_algo`/`kdf_params` are stored per user,
a mixed fleet mid-migration is perfectly fine.

## Security properties and pitfalls

- **Compromise of the database alone reveals nothing usable** — only wrapped
  keys, IVs, and public parameters.
- **Strength is bounded by the master password.** A weak password is the soft
  spot; the KDF buys time, not invulnerability. Encourage strong, unique
  passwords.
- **Never reuse an IV** with the same key, for wrapping or item encryption.
  Generate a fresh random IV every time — the module already does; keep it that
  way in any extension.
- **Never log, persist, or transmit derived keys or the Vault Key.** They live
  only in browser memory, only while unlocked. The Vault Key's
  `extractable: true` flag exists solely so wrapping can export it — never call
  `exportKey` on it for any other purpose.
- **Preserve `recoverySalt` and the recovery iteration count on password
  change.** See the invariant above; violating it silently bricks recovery.
- **Only the phrase is normalized.** Master passwords are used byte-for-byte as
  typed; don't "helpfully" trim or lowercase them, or existing vaults stop
  opening.
- **The Vault Key shouldn't rotate casually.** Rotating it means re-encrypting
  every item; the design intentionally avoids this by rotating *wrappers*
  instead. Reserve true Vault Key rotation for genuine compromise scenarios.
- **No backdoor exists.** If both the password and the recovery phrase are
  lost, the wrapped Vault Key can never be opened. This is a feature, not a
  gap.

## Developer reference

The real primitives, as exported by `lib/crypto.ts`:

```ts
import {
  deriveWrappingKey,
  wrapVaultKey,
  unwrapVaultKey,
  newSalt,
  type KdfParams,
} from "@/lib/crypto";

// ---- Unlock: derive the password key from public salt + params, then unwrap.
const params: KdfParams = JSON.parse(user.kdf_params);
const passwordKey = await deriveWrappingKey(
  masterPassword,
  user.kdf_salt,
  params.iterations,
);

// Authenticated decryption — a wrong password throws here.
const vaultKey = await unwrapVaultKey(
  { ciphertext: user.wrapped_vault_key, iv: user.wrapped_vault_key_iv },
  passwordKey,
);

// ---- Password change: same Vault Key, new salt — recovery material preserved.
const newKdfSalt = newSalt();
const nextParams: KdfParams = { ...params }; // keeps recoverySalt + iterations intact
const newPasswordKey = await deriveWrappingKey(
  newMasterPassword,
  newKdfSalt,
  nextParams.iterations,
);
const rewrapped = await wrapVaultKey(vaultKey, newPasswordKey);

// PUT {
//   kdf_salt: newKdfSalt,
//   kdf_params: nextParams,
//   wrapped_vault_key: rewrapped.ciphertext,
//   wrapped_vault_key_iv: rewrapped.iv,
// }   — recovery_wrapped_key / _iv are not touched.
```

## Where to go next

- **[Zero Knowledge Model](/docs/zero-knowledge-model)** — the high-level
  guarantee these keys deliver.
- **[Recovery Phrase](/docs/recovery-phrase)** — the second door, in depth.
- **Architecture** — how the routes and database store and serve this material.
- **Project setup** — install and run the project.
