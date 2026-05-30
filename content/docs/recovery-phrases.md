---
title: Recovery Phrase
slug: recovery-phrase
description: What a recovery phrase is, how BIP39 works, and how it gets you back into your vault.
--- 

## Why a recovery phrase exists at all

Opaque is zero-knowledge: the server never holds your keys, so it physically
*cannot* reset your password and let you back in. There is no "email me a reset
link" because a reset link would require the server to have access to your Vault
Key — which is exactly the thing the design refuses to allow.

So Opaque needs a second, independent way for *you* (and only you) to unlock
your vault if you forget your master password. That second way is the **recovery
phrase**: a list of random words, generated once at setup, that you keep safe.
It is a spare key — not a hint, not a question, but a genuine second key to the
same vault.

## In plain words

Think of your vault as a safe with two keyholes. One keyhole takes your master
password. The other takes a key made from your recovery phrase. Either key opens
the safe; neither is held by the company that built the safe.

When you set up Opaque, it shows you a sequence of words — for example, a
12-word list. Those words *are* the spare key. Write them down, store them
somewhere safe and offline, and never share them. If you ever forget your
password, you type the words back in and you're in.

> The phrase is shown to you exactly once. It is never stored on the server and
> can't be retrieved later. If you lose it *and* forget your password, the vault
> is unrecoverable — by anyone, including Opaque. That permanence is the price
> of having no backdoor.

## What the words actually are: BIP39

The recovery phrase follows **BIP39**, a widely used standard (originally from
the Bitcoin world) for turning random data into a memorable, error-resistant
list of words. Opaque uses the `@scure/bip39` library to do this. A few
properties make BIP39 a good fit:

- **Fixed word list.** BIP39 defines a list of exactly **2048 words**. Each word
  encodes 11 bits of information (because 2¹¹ = 2048).
- **Carefully chosen words.** The words are short, common, and unambiguous — no
  two words share their first four letters, so even partial or sloppy handwriting
  can be resolved.
- **Built-in checksum.** A portion of the phrase is a checksum derived from the
  rest. If you mistype or transpose a word, the phrase fails validation instead
  of silently producing the wrong key — catching a whole class of human errors.

### How many words, and how much randomness

The length of the phrase reflects how much underlying randomness ("entropy") it
encodes:

| Entropy   | Words | Of which checksum |
| --------- | ----- | ----------------- |
| 128 bits  | 12    | 4 bits            |
| 160 bits  | 15    | 5 bits            |
| 192 bits  | 18    | 6 bits            |
| 224 bits  | 21    | 7 bits            |
| 256 bits  | 24    | 8 bits            |

A 12-word phrase already encodes 128 bits of entropy. To put that in
perspective: it is so astronomically large a space that guessing it by brute
force is not a realistic attack. This is the crucial difference from a human
password — you might pick `Summer2024!`, but no one *picks* a BIP39 phrase; it's
generated from cryptographic randomness.

## From phrase to key

Two stages turn your words into something that can open the vault:

1. **Words → randomness.** The phrase maps back to the exact entropy (or a seed
   derived from it) it was generated from. The checksum is verified here.
2. **Randomness → recovery key.** That value is turned into the **recovery
   key** — the key used to unwrap your Vault Key.

Because the phrase carries so much entropy on its own, it doesn't depend on a
slow password-style KDF to be safe from guessing the way your master password
does. The strength comes from the size of the random space, not from making each
attempt expensive.

The recovery key never touches your items directly. Its single job is to unwrap
the Vault Key from the `recovery_wrapped_key` blob stored on your account. The
Vault Key then decrypts items, exactly as it would after a normal password
unlock.

```
recovery phrase ──BIP39──▶ entropy/seed ──▶ recovery key ──unwraps──▶ Vault Key
```

## How recovery actually flows

When you choose "I forgot my password" and enter your phrase, here's what
happens in the browser:

1. The browser fetches `recovery_wrapped_key` and `recovery_wrapped_key_iv` from
   the vault-init endpoint.
2. It validates the phrase (checksum) and derives the recovery key.
3. It unwraps the Vault Key from `recovery_wrapped_key`. If the phrase is wrong,
   the authenticated decryption fails and you're told the phrase is invalid —
   the server is never asked "is this correct?", it simply can't be opened.
4. With the Vault Key recovered, you set a **new master password**. The browser
   derives a fresh password key (new salt, new parameters) and re-wraps the
   *same* Vault Key, then sends only the new wrapped key and KDF material to the
   server.

Notice what does **not** happen: the recovery phrase is never transmitted, the
Vault Key is never sent in readable form, and your items are never
re-encrypted — only the password-side wrapper is rebuilt.

## Where it sits relative to your password

The recovery phrase and the master password are **two independent doors to the
same Vault Key**. That has an important consequence:

- Changing your master password does **not** change your recovery phrase. The
  recovery wrapper (`recovery_wrapped_key`) is left untouched on a password
  change, so your written-down words keep working.
- Anyone holding your recovery phrase can open your vault *without* knowing your
  password. The phrase is therefore at least as sensitive as the password —
  arguably more, since it bypasses the password entirely.

## Keeping it safe (for users)

- **Write it down on paper** and store it somewhere secure (a safe, a lockbox).
  Offline storage avoids exposing it to malware.
- **Don't photograph it or paste it into notes/email/chat.** Anything synced to
  the cloud widens the attack surface.
- **Never type it into a page you reached from a link.** Confirm you're on the
  genuine Opaque site first — phishing a recovery phrase is as damaging as
  phishing a password.
- **Treat losing it as serious.** Without the phrase, your master password
  becomes your *only* way in. Losing both means permanent loss of the data.

## Developer notes

- The phrase is generated, validated, and converted to a key entirely in the
  browser via `@scure/bip39`. The server only ever receives the resulting
  `recovery_wrapped_key` and its IV at setup time.
- **Show the phrase exactly once.** After setup it should not be retrievable —
  there is nothing to retrieve, since only the wrapped key is stored. Make the
  one-time display unmissable and require the user to confirm they've saved it.
- **Validate before deriving.** Use the library's checksum validation to reject
  malformed input early, with a clear error, rather than failing later at the
  unwrap step.
- **Authenticated unwrap is your "wrong phrase" signal.** Just like the password
  path, a bad phrase yields a failed authenticated decryption — surface that as
  "invalid recovery phrase," and never confirm phrase correctness server-side.
- **Re-wrap, don't regenerate.** Recovery should unwrap the existing Vault Key
  and re-establish a password wrapper — not mint a new Vault Key, which would
  orphan every existing item.

```ts
import { generateMnemonic, validateMnemonic, mnemonicToSeed } from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english";

// Setup: create the phrase, show it to the user once.
const phrase = generateMnemonic(wordlist, 128); // 12 words

// Recovery: validate, derive the recovery key, unwrap the Vault Key.
if (!validateMnemonic(phrase, wordlist)) throw new Error("Invalid recovery phrase");
const seed = await mnemonicToSeed(phrase);
const recoveryKey = await deriveRecoveryKey(seed);
const vaultKey = await unwrapKey(recovery_wrapped_key, recovery_wrapped_key_iv, recoveryKey);
```

## Quick FAQ

**Can Opaque show me my phrase again later?**
No. It's displayed once at setup and never stored, so there's nothing to show.

**If someone gets my phrase, what can they do?**
Open your vault completely, without your password. Guard it accordingly.

**Why not security questions or an email reset instead?**
Both would require the server to be able to recover your keys — a backdoor that
would break zero-knowledge for everyone.

**Does changing my password invalidate my phrase?**
No. The phrase keeps working; only the password wrapper is rebuilt.

## Where to go next

- **Key Management and KDF** — how wrapping, salts, and parameters work.
- **Zero Knowledge Model** — the guarantee the recovery phrase upholds.
- **Project setup** — install and run the project.
