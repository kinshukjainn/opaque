---
title: Vault Endpoints
slug: vault-endpoints
description: API reference for the vault item and vault setup routes.
---

## Overview

These are the HTTP endpoints that move vault data between the browser and the
database. There are two groups:

- **Vault items** (`/api/vault/items`) — create, list, update, and delete the
  encrypted items.
- **Vault setup** (`/api/vault/init`) — read the encrypted material needed to
  unlock or recover, initialize a vault, and re-wrap on a password change.

Every endpoint shares the same ground rules described next.

## Conventions

- **Authentication.** All routes require an authenticated Clerk session. With no
  valid session they return `401 Unauthorized`. The user is resolved server-side
  from the session, so there is no user id in the request body.
- **Ownership scoping.** The per-item routes (`[id]`) match the row id *and* the
  authenticated owner in the same query. An id that exists but belongs to
  another user behaves exactly like a missing row: `404`. Guessing ids gets you
  nothing.
- **Encryption is the client's job.** These endpoints only ever accept and
  return `ciphertext`, `iv`, wrapped keys, and public KDF parameters. No route
  accepts or returns a plaintext secret, master password, or recovery phrase.
- **Content type.** Request bodies are JSON; send `Content-Type:
  application/json`.
- **Errors.** Failures return a JSON object of the form `{ "error": "..." }`
  with an appropriate status code.

---

## Vault items

### GET `/api/vault/items`

Lists the authenticated user's items, most recently updated first. Returns
ciphertext only — the server never decrypts.

**Response `200`**

```json
{
  "items": [
    {
      "id": "…",
      "type": "login",
      "ciphertext": "…",
      "iv": "…",
      "favorite": false,
      "folder_id": null,
      "created_at": "…",
      "updated_at": "…"
    }
  ]
}
```

| Status | Meaning        |
| ------ | -------------- |
| `200`  | Items returned |
| `401`  | Not signed in  |

---

### POST `/api/vault/items`

Creates a new item — but only if the user is under their plan's item limit and
the vault is initialized. The limit check, insert, and counter increment happen
in a single atomic statement (see [Vault Items](/vault-items#plan-limits-and-the-atomic-insert)).

**Request body**

| Field        | Type   | Required | Notes                                            |
| ------------ | ------ | -------- | ------------------------------------------------ |
| `ciphertext` | string | Yes      | The encrypted secret payload                     |
| `iv`         | string | Yes      | Initialization vector for this ciphertext        |
| `type`       | string | No       | One of `login`, `note`, `card`, `identity` (default `login`) |
| `folderId`   | string | No       | Target folder, or `null` (default `null`)         |

```json
{ "type": "login", "ciphertext": "…", "iv": "…", "folderId": null }
```

**Response `201`**

```json
{ "item": { "id": "…", "type": "login", "ciphertext": "…", "iv": "…",
            "favorite": false, "folder_id": null,
            "created_at": "…", "updated_at": "…" } }
```

| Status | Meaning                                                         |
| ------ | --------------------------------------------------------------- |
| `201`  | Item created                                                    |
| `400`  | Missing `ciphertext`/`iv`, or an invalid `type`                 |
| `401`  | Not signed in                                                   |
| `403`  | Item limit reached, or the vault is not initialized             |

> A `403` here is intentional and clean, not an error — it's what you get when
> the atomic insert finds no room under the plan limit (or no initialized vault).

---

### PATCH `/api/vault/items/[id]`

Replaces an item's stored state. Because the secret is re-encrypted in the
browser, an edit always sends a fresh `ciphertext` and `iv`. Toggling the
**favorite** flag and moving an item between folders go through this same
route.

> **This is a full replacement, not a merge.** Omitted fields fall back to
> their defaults — `favorite` to `false`, `folderId` to `null` — rather than
> being preserved. The client therefore always sends the item's complete
> current state. An item's `type` is fixed at creation and cannot be changed
> here.

**Request body**

| Field        | Type           | Required | Notes                                        |
| ------------ | -------------- | -------- | -------------------------------------------- |
| `ciphertext` | string         | Yes      | New encrypted payload                        |
| `iv`         | string         | Yes      | New initialization vector                    |
| `favorite`   | boolean        | No       | Defaults to `false` when omitted             |
| `folderId`   | string \| null | No       | Defaults to `null` (no folder) when omitted  |

**Response `200`** — the updated row:

```json
{ "item": { "id": "…", "type": "login", "ciphertext": "…", "iv": "…",
            "favorite": true, "folder_id": null,
            "created_at": "…", "updated_at": "…" } }
```

| Status | Meaning                      |
| ------ | ---------------------------- |
| `200`  | Item updated                 |
| `400`  | Missing `ciphertext` or `iv` |
| `401`  | Not signed in                |
| `404`  | No such item for this user   |

---

### DELETE `/api/vault/items/[id]`

Permanently removes an item by id. The row delete and the owner's `item_count`
decrement happen in **one atomic statement** — the mirror image of the create —
so the counter can never drift. The decrement is clamped at zero
(`GREATEST(item_count - 1, 0)`), so it can never go negative either.

**Response `200`**

```json
{ "message": "Deleted" }
```

| Status | Meaning               |
| ------ | --------------------- |
| `200`  | Item deleted          |
| `401`  | Not signed in         |
| `404`  | No such item for user |

The `[id]` route folder must be named literally `[id]` (with the brackets) for
Next.js to match it; a missing or misnamed folder is a common cause of a
PATCH/DELETE falling through to an HTML page instead of the handler.

---

## Vault setup

### GET `/api/vault/init`

Returns the encrypted material the browser needs to unlock or recover the vault.
Every value is ciphertext or a public KDF parameter — safe to hand to the
authenticated owner.

**Response `200` — vault exists**

```json
{
  "initialized": true,
  "kdf_algo": "…",
  "kdf_salt": "…",
  "kdf_params": { },
  "wrapped_vault_key": "…",
  "wrapped_vault_key_iv": "…",
  "recovery_wrapped_key": "…",
  "recovery_wrapped_key_iv": "…"
}
```

**Response `200` — no user row yet**

```json
{ "initialized": false }
```

| Status | Meaning                                           |
| ------ | ------------------------------------------------- |
| `200`  | Returns the material, or `{ initialized: false }` |
| `401`  | Not signed in                                     |

---

### POST `/api/vault/init`

First-time vault setup. Stores both wrapped keys, the salt, and the KDF
parameters, and flips `vault_initialized` to `true`. This route never sees a
master password, recovery phrase, or any plaintext secret — only opaque blobs.

If the user row doesn't exist yet (common in local dev, where the Clerk webhook
can't reach `localhost`), it is created here from the authenticated user's Clerk
data using `ON CONFLICT DO NOTHING`, so the webhook stays the source of truth if
it later runs.

**Request body — all required**

| Field                     |
| ------------------------- |
| `kdf_algo`                |
| `kdf_salt`                |
| `kdf_params`              |
| `wrapped_vault_key`       |
| `wrapped_vault_key_iv`    |
| `recovery_wrapped_key`    |
| `recovery_wrapped_key_iv` |

**Response `201`**

```json
{ "message": "Vault initialized" }
```

| Status | Meaning                              |
| ------ | ------------------------------------ |
| `201`  | Vault initialized                    |
| `400`  | A required field is missing or null  |
| `401`  | Not signed in                        |
| `409`  | Vault already initialized            |

> The update is guarded with `WHERE vault_initialized = false`, making setup
> idempotent and ensuring it can never overwrite an existing vault — which would
> lock the owner out of their data. A second attempt returns `409`.

---

### PUT `/api/vault/init`

Re-wraps the vault on a **master-password change**. Only the password-side
material changes; the recovery-wrapped key and the Vault Key itself are left
untouched, so the change is instant and existing items are not re-encrypted.

**Request body — all required**

| Field                  | Notes                               |
| ---------------------- | ----------------------------------- |
| `kdf_salt`             | New salt for the new password key   |
| `kdf_params`           | New KDF parameters                  |
| `wrapped_vault_key`    | Vault Key re-wrapped by the new key |
| `wrapped_vault_key_iv` | IV for the new wrapping             |

**Response `200`**

```json
{ "message": "Master password updated" }
```

| Status | Meaning                              |
| ------ | ------------------------------------ |
| `200`  | Master password updated              |
| `400`  | A required field is missing or null  |
| `401`  | Not signed in                        |
| `404`  | Vault not initialized                |

> The update is guarded with `WHERE vault_initialized = true`, so a re-wrap can
> only apply to an already-set-up vault; otherwise it returns `404`.

---

## Quick reference

| Method & path                   | Purpose                                  | Success |
| ------------------------------- | ---------------------------------------- | ------- |
| `GET /api/vault/items`          | List items (ciphertext only)             | `200`   |
| `POST /api/vault/items`         | Create item (with limit check)           | `201`   |
| `PATCH /api/vault/items/[id]`   | Replace item state / favorite / folder   | `200`   |
| `DELETE /api/vault/items/[id]`  | Delete item + atomic counter decrement   | `200`   |
| `GET /api/vault/init`           | Read unlock/recovery material            | `200`   |
| `POST /api/vault/init`          | First-time vault setup                   | `201`   |
| `PUT /api/vault/init`           | Re-wrap on password change               | `200`   |

## Where to go next

- **Vault Items** — the structure of the data these item routes carry.
- **Key Management and KDF** — what the init route's wrapped keys and params are.
- **Clerk User Sync** — the separate webhook endpoint that mirrors profiles.
