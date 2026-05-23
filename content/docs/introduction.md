---
title: Introduction
slug: introduction
description: A zero-knowledge, end-to-end encrypted password vault built on Next.js, Clerk, and Neon.
---

Welcome to **EndVault** — a password manager built on a simple promise: the
server never sees your secrets. Titles, usernames, passwords, URLs, notes, even
the name of the service are encrypted in your browser before they ever leave
it. The backend only ever stores opaque `ciphertext` + `iv` blobs that it
cannot read.

If the database were dumped tomorrow, an attacker would get nothing but noise.

## Why this design

- **Zero-knowledge** — encryption and decryption happen client-side. The API
  handles ciphertext only; there is no code path where the server can read a
  plaintext secret.
- **Recoverable** — your Vault Key is wrapped twice: once by a key derived from
  your master password, and once by a key derived from a recovery phrase. Lose
  the password, recover with the phrase — without the server ever holding
  either.
- **Fast** — the dashboard decrypts once on unlock, then search, filtering, and
  favorites all run locally. The network is only touched to create, update, or
  delete an item.
- **Simple to run** — auth is handled by Clerk, data lives in Neon (Postgres),
  and every route is a standard Next.js handler. No object store, no extra
  services to wire up.

## How the vault is structured

Each user has one vault holding typed items. The supported types are:

| Type       | What it stores                          |
| ---------- | --------------------------------------- |
| `login`    | Username / email, password, website     |
| `note`     | A free-form secure note                 |
| `card`     | Payment card details                    |
| `identity` | Personal identity information            |

Items can be favorited, organized into folders, and searched instantly — all on
the decrypted copy that only ever exists in your browser.

## The crypto model in one snippet

The server stores wrapped keys and KDF parameters, never the keys themselves.
Roughly, unlocking the vault looks like this on the client:

```ts
// Derive a key from the master password using the stored salt + params,
// then unwrap the Vault Key — entirely in the browser.
const passwordKey = await deriveKey(masterPassword, kdf_salt, kdf_params);
const vaultKey = await unwrap(wrapped_vault_key, wrapped_vault_key_iv, passwordKey);

// Every item is decrypted locally with the Vault Key.
const secret = await decrypt(item.ciphertext, item.iv, vaultKey);
```

The matching API routes (`/api/vault/init` and `/api/vault/items`) only persist
and return these blobs. They never accept or emit a plaintext secret, a master
password, or a recovery phrase.

> Tip: The Vault Key never changes when you rotate your master password — only
> the password-derived wrapper is re-encrypted. That means a password change is
> instant and doesn't require re-encrypting every item.

## Where to go next

- **Architecture** — how the routes, database, and webhook sync fit together.
- **Encryption** — the full key-wrapping and recovery-phrase flow.
- **Self-hosting** — environment variables, Clerk setup, and Neon connection.
