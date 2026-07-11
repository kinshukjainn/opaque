---
title: Recovery Phrase
slug: recovery-phrase
description: What a recovery phrase is, how BIP39 generation and validation work, and exactly how the phrase becomes the key that reopens your vault.
---

## Why a recovery phrase exists at all

Opaque is zero-knowledge: the server never holds your keys, so it physically
*cannot* reset your password and let you back in. There is no "email me a reset
link," because a reset link would require the server to have access to your
Vault Key — which is exactly the thing the design refuses to allow.

So Opaque needs a second, independent way for *you* (and only you) to unlock
your vault if you forget your master password. That second way is the
**recovery phrase**: a list of twelve random words, generated once at setup,
that you keep safe. It is a spare key — not a hint, not a security question,
but a genuine second key to the same vault.

## In plain words

Think of your vault as a safe with two keyholes. One keyhole takes your master
password. The other takes a key made from your recovery phrase. Either key
opens the safe; neither is held by the company that built the safe.

When you set up Opaque, it shows you a sequence of twelve words. Those words
*are* the spare key. Write them down, store them somewhere safe and offline,
and never share them. If you ever forget your password, you type the words back
in and you're in.

> The phrase is shown to you exactly once. It is never stored on the server and
> can't be retrieved later. If you lose it *and* forget your password, the vault
> is unrecoverable — by anyone, including Opaque. That permanence is the price
> of having no backdoor.

## What the words actually are: BIP39

The recovery phrase follows **BIP39**, a widely used standard (originally from
the Bitcoin world) for turning random data into a memorable, error-resistant
list of words. Opaque generates and validates phrases with the `@scure/bip39`
library and its **English wordlist**. Concretely, setup calls
`generateMnemonic(wordlist, 128)`, which produces **12 words encoding 128 bits
of entropy**.

A few properties make BIP39 a good fit:

- **Fixed word list.** BIP39 defines a list of exactly **2048 words**, so each
  word encodes 11 bits of information (because 2¹¹ = 2048).
- **Carefully chosen words.** The words are short, common, and unambiguous — no
  two words share their first four letters, so even partial or sloppy
  handwriting can be resolved.
- **Built-in checksum.** Part of the phrase is a checksum computed from the
  rest. Mistype or transpose a word and the phrase fails validation instead of
  silently deriving the wrong key — catching a whole class of human errors
  before any cryptography runs.

### How many words, and how much randomness

The length of a BIP39 phrase reflects how much underlying randomness
("entropy") it encodes:

| Entropy   | Words | Of which checksum |
| --------- | ----- | ----------------- |
| 128 bits  | 12    | 4 bits            |
| 160 bits  | 15    | 5 bits            |
| 192 bits  | 18    | 6 bits            |
| 224 bits  | 21    | 7 bits            |
| 256 bits  | 24    | 8 bits            |

**Opaque uses the first row.** Twelve words carry 12 × 11 = 132 bits of word
data: 128 bits of entropy plus a 4-bit checksum. A 128-bit space (about
3.4 × 10³⁸ possibilities) is so astronomically large that brute-force guessing
is not a realistic attack. This is the crucial difference from a human
password — you might pick `Summer2024!`, but nobody *picks* a BIP39 phrase; it
comes straight from cryptographic randomness (`crypto.getRandomValues` under
the hood).

## Case, spacing, and typos: how input is normalized

Before Opaque validates or derives anything from a phrase, it normalizes the
input:

```ts
export function normalizePhrase(phrase: string): string {
  return phrase.trim().toLowerCase().replace(/\s+/g, " ");
}
```

Leading and trailing whitespace is stripped, everything is lowercased, and any
run of spaces, tabs, or newlines collapses to a single space. Practical
consequences:

- Entry is **case-insensitive** — `Apple Banana` and `apple banana` are the
  same phrase.
- Entry is **whitespace-forgiving** — extra spaces or line breaks (say, from a
  phrase written two words per line on paper) don't matter.
- Word *spelling* still has to be exact, but the checksum has your back: change
  one word and validation almost certainly fails. (A random-but-well-formed
  combination of wordlist words only passes the 4-bit checksum about 1 time
  in 16 — the checksum is an error-*detection* net for you, not a security
  mechanism.)

Normalization matters twice over in Opaque because, as the next section shows,
the canonical phrase string is itself the input to key derivation. Applying the
identical normalization at setup and at recovery guarantees the same words
always derive the same key.

## From phrase to key

Here is exactly what happens between typing the words and holding the Vault
Key:

1. **Normalize** the input (`normalizePhrase`).
2. **Validate the checksum** (`isValidRecoveryPhrase`, backed by
   `validateMnemonic`). Malformed input is rejected immediately with a clear
   error — nothing is ever derived from an invalid phrase.
3. **Derive the recovery key.** The normalized phrase is fed through the *same*
   key-derivation function used for the master password —
   PBKDF2-HMAC-SHA256 via `deriveWrappingKey` — but with its **own dedicated
   salt**, `recoverySalt`, which lives inside the public `kdf_params` record,
   and the stored iteration count (600,000 by default). The output is a 256-bit
   AES-GCM **recovery key**.
4. **Unwrap the Vault Key.** The recovery key performs an authenticated
   (AES-GCM) decryption of the `recovery_wrapped_key` blob. If the phrase was
   wrong, this step throws; if it succeeds, the Vault Key is back in memory.

```
recovery phrase ──normalize──▶ canonical words ──checksum ok?──▶
    PBKDF2(recoverySalt, iterations) ──▶ recovery key ──unwraps──▶ Vault Key
```

Two points of precision worth calling out:

- **Opaque does not use BIP39's seed step.** The BIP39 spec also defines a
  `mnemonicToSeed` function (PBKDF2-SHA512 with a fixed `"mnemonic"` salt)
  intended for deriving cryptocurrency wallet seeds. Opaque never calls it.
  Here, BIP39 is used purely as a *format* — generation, wordlist, and
  checksum — while key derivation goes through Opaque's own KDF path with its
  own random salt. The benefit: one audited derivation function
  (`deriveWrappingKey`) serves both the password door and the phrase door, and
  a future KDF upgrade (e.g. Argon2id) automatically covers both.
- **The KDF is not what makes the phrase strong.** A 128-bit random phrase is
  unguessable by the sheer size of the space; unlike `Summer2024!`, it doesn't
  *need* password-style stretching. Running it through PBKDF2 anyway costs a
  fraction of a second once, keeps the code path uniform, and adds a little
  free hardening. Belt and braces.

The recovery key never touches your items directly. Its single job is to unwrap
the Vault Key from the `recovery_wrapped_key` blob stored on your account. The
Vault Key then decrypts items, exactly as it would after a normal password
unlock.

## How recovery actually flows

When you choose "I forgot my password" and enter your phrase, here's what
happens in the browser:

1. The browser fetches the recovery material from the vault-init endpoint:
   `recovery_wrapped_key`, `recovery_wrapped_key_iv`, and `kdf_params` — which
   it needs for `recoverySalt` and the iteration count.
2. It normalizes the input and validates the checksum. Malformed phrases are
   rejected right here, before any (intentionally slow) derivation runs.
3. It derives the recovery key and attempts the authenticated unwrap. A wrong
   but well-formed phrase produces a failed AES-GCM authentication — surfaced
   as "invalid recovery phrase." The server is never asked "is this correct?";
   the blob simply cannot be opened.
4. With the Vault Key recovered, you set a **new master password**. The browser
   generates a fresh `kdf_salt`, derives a new password key, re-wraps the
   *same* Vault Key, and sends only the new wrapped key and KDF material to the
   server.
5. Because the phrase is in hand at this moment, the recovery flow is also the
   one safe opportunity to **rebuild the recovery wrapper itself** — re-wrapping
   under a fresh `recoverySalt` or upgraded KDF parameters, or even issuing a
   brand-new phrase — all without touching a single item.

Notice what does **not** happen: the recovery phrase is never transmitted, the
Vault Key is never sent in readable form, and your items are never
re-encrypted — only wrappers are rebuilt.

## Where it sits relative to your password

The recovery phrase and the master password are **two independent doors to the
same Vault Key**. That has important consequences:

- Changing your master password does **not** change your recovery phrase. A
  password change touches only the password-side fields; `recovery_wrapped_key`,
  its IV, and the `recoverySalt` its derivation depends on are deliberately
  left untouched — so your written-down words keep working.
- Either door alone is full access. Anyone holding your recovery phrase can
  open your vault *without* knowing your password. The phrase is therefore at
  least as sensitive as the password — arguably more, since it bypasses the
  password entirely and, unlike a password, never changes in day-to-day use.

## Keeping it safe (for users)

- **Write it down on paper** and store it somewhere physically secure (a safe,
  a lockbox). Offline storage keeps it away from malware entirely.
- **Consider a second paper copy in a separate secure location**, so a single
  fire or flood can't destroy your only spare key.
- **Don't photograph it or paste it into notes, email, or chat.** Anything
  synced to the cloud widens the attack surface — and don't store it inside the
  very vault it protects.
- **Never type it into a page you reached from a link.** Confirm you're on the
  genuine Opaque site first — phishing a recovery phrase is strictly worse than
  phishing a password.
- **Treat losing it as serious.** Without the phrase, your master password
  becomes your *only* way in. Losing both means permanent loss of the data.

## Developer notes

- The phrase is generated, validated, normalized, and turned into a key
  **entirely in the browser** (`@scure/bip39` plus Web Crypto). At setup, the
  server receives only `recovery_wrapped_key`, `recovery_wrapped_key_iv`, and
  the public `kdf_params` (which carries `recoverySalt`). During recovery, it
  receives nothing phrase-related at all.
- **Show the phrase exactly once.** After setup there is nothing to retrieve —
  only the wrapped key is stored. Make the one-time display unmissable, and
  require explicit confirmation before proceeding (asking the user to re-type a
  few of the words is a good pattern).
- **Always normalize before validating *and* deriving.** Deriving from raw
  input instead of `normalizePhrase(input)` would make the key silently depend
  on capitalization and spacing — the same words would fail to open the vault.
- **Validate before deriving.** The checksum check is instant and rejects
  malformed input with a precise error; the KDF is intentionally slow. Fail
  fast, then spend the derivation time only on plausible phrases.
- **Authenticated unwrap is your "wrong phrase" signal.** Exactly like the
  password path, a bad phrase yields a failed authenticated decryption —
  surface it as "invalid recovery phrase," and never build a server-side
  correctness check.
- **Re-wrap, don't regenerate.** Recovery must unwrap the *existing* Vault Key
  and re-establish a password wrapper — not mint a new Vault Key, which would
  orphan every existing item.
- **Preserve `recoverySalt` across password changes.** The recovery derivation
  depends on it (and on the stored iteration count); regenerating it outside a
  flow that also re-wraps the recovery side silently invalidates every stored
  phrase. See [Key Management and KDF](/docs/key-management) for the full
  invariant.
- **The wordlist is fixed (English) and public.** The entry UI can safely offer
  autocomplete or suggestions from the 2048 words — a large usability win that
  costs nothing in security, since the list is part of the open standard.

```ts
import {
  generateRecoveryPhrase,
  isValidRecoveryPhrase,
  normalizePhrase,
  deriveWrappingKey,
  wrapVaultKey,
  unwrapVaultKey,
  newSalt,
  DEFAULT_KDF,
  type KdfParams,
} from "@/lib/crypto";

// ---- Setup: build params, generate the phrase, wrap the Vault Key under it.
const kdfParams: KdfParams = { ...DEFAULT_KDF, recoverySalt: newSalt() };
const phrase = generateRecoveryPhrase(); // 12 words, 128 bits — show it ONCE

const recoveryKey = await deriveWrappingKey(
  normalizePhrase(phrase),
  kdfParams.recoverySalt,
  kdfParams.iterations,
);
const recoveryWrapped = await wrapVaultKey(vaultKey, recoveryKey);
// persist: recovery_wrapped_key    = recoveryWrapped.ciphertext
//          recovery_wrapped_key_iv = recoveryWrapped.iv

// ---- Recovery: validate, derive, unwrap. A wrong phrase throws at the unwrap.
if (!isValidRecoveryPhrase(input)) {
  throw new Error("Invalid recovery phrase");
}
const key = await deriveWrappingKey(
  normalizePhrase(input),
  kdfParams.recoverySalt, // from the vault-init payload
  kdfParams.iterations,
);
const recoveredVaultKey = await unwrapVaultKey(
  { ciphertext: recovery_wrapped_key, iv: recovery_wrapped_key_iv },
  key,
);
// then run the password-change flow with recoveredVaultKey
```

## Quick FAQ

**Can Opaque show me my phrase again later?**
No. It's displayed once at setup and never stored, so there's nothing to show.

**Is the phrase case-sensitive? Do extra spaces matter?**
No. Input is normalized — trimmed, lowercased, and whitespace-collapsed —
before validation and key derivation. The words themselves must be spelled
correctly, and the checksum catches most slips.

**Why 12 words and not 24?**
Twelve words already encode 128 bits of entropy — far beyond brute force. Fewer
words means easier, less error-prone transcription. (BIP39 supports up to 24
words if the requirement ever changed.)

**If someone gets my phrase, what can they do?**
Open your vault completely, without your password. Guard it accordingly.

**Does changing my password invalidate my phrase?**
No. The phrase keeps working; only the password wrapper is rebuilt. The
recovery wrapper and the salt it depends on are untouched.

**Can I get a new phrase?**
The design allows it: while the vault is unlocked (or during a recovery flow),
the same Vault Key can be re-wrapped under a key derived from a fresh phrase
and the old wrapper replaced — items are never touched. The old phrase stops
working the moment its wrapper is replaced.

**Why not security questions or an email reset instead?**
Both would require the server to be able to recover your keys — a backdoor that
would break zero-knowledge for everyone.

## Where to go next

- **[Key Management and KDF](/docs/key-management)** — how wrapping, salts, and
  parameters work in detail.
- **[Zero Knowledge Model](/docs/zero-knowledge-model)** — the guarantee the
  recovery phrase upholds.
- **Project setup** — install and run the project.
