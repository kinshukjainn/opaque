---
title: Vault Items
slug: vault-items
description: What a vault item is made of, the item types, and how items are created, read, updated, and deleted.
---

## What a vault item is

A **vault item** is a single stored secret — one login, one note, one card, one
identity. Every item has two distinct halves, and understanding the split is the
key to understanding everything else on this page:

- **The secret** — the sensitive content (title, username, password, URL,
  notes). This is encrypted in your browser and stored only as `ciphertext`.
- **The metadata** — the non-sensitive bookkeeping (a database id, the item
  type, a favorite flag, which folder it's in, timestamps). This is stored in
  plain form because the app needs it to list, sort, filter, and count items
  without ever decrypting anything.

The server only ever sees the second half plus an opaque blob for the first. It
can tell you *have* a login created last Tuesday; it cannot tell *which* login or
*what's in it*.

## Anatomy of an item

| Field         | Half      | Stored as   | Server can read? |
| ------------- | --------- | ----------- | ---------------- |
| `id`          | metadata  | plain       | Yes              |
| `type`        | metadata  | plain       | Yes              |
| `favorite`    | metadata  | plain       | Yes              |
| `folder_id`   | metadata  | plain       | Yes              |
| `created_at`  | metadata  | plain       | Yes              |
| `updated_at`  | metadata  | plain       | Yes              |
| `ciphertext`  | secret    | encrypted   | No               |
| `iv`          | secret    | plain*      | Yes (but useless alone) |

\* The `iv` (initialization vector) is a small random value paired with each
ciphertext. It isn't secret on its own — it only has meaning together with the
key you hold, which the server never has.

Everything inside `ciphertext` — the **secret payload** — decrypts in the
browser to an object like this:

| Secret field | Meaning                                  | Required |
| ------------ | ---------------------------------------- | -------- |
| `service`    | Which known service (or `"other"`)       | Yes      |
| `title`      | Display name, e.g. "Personal Gmail"      | Yes      |
| `customName` | A custom label, used when `service` is `"other"` | No |
| `username`   | Username or email (logins)               | No       |
| `password`   | The password (logins)                    | No       |
| `url`        | The website (logins)                     | No       |
| `notes`      | Free-form text                           | No       |

Only `service` and `title` are guaranteed to be present; the rest are included
only when filled in.

## Item types

The `type` field puts each item into one of four buckets. It's plain metadata, so
it powers the filter tabs and lets the list be organized without decryption.

| Type       | What it represents          |
| ---------- | --------------------------- |
| `login`    | A username/password account |
| `note`     | A secure free-form note     |
| `card`     | A payment card              |
| `identity` | Personal identity details   |

A practical detail about the current implementation: the **login** type collects
the full set of fields (username, password with a generator, website), while the
other types capture a title and notes. In other words, `type` today is mostly an
organizing label, with logins carrying the extra structured fields. The encrypted
payload simply stores whatever fields are present, so types can be enriched later
without changing how storage works.

An item's type is chosen at creation and never changes afterwards — the update
route doesn't touch it.

## The `service` field and display names

Beyond its type, a login usually belongs to a recognizable **service** (Gmail,
Instagram, etc.), chosen from a list. The service controls the little colored
chip shown next to the item.

There's one special value, `"other"`, for anything not in the list. When an item
uses `"other"`, you can give it a `customName`, and the app shows that custom
name in place of the service. The display name resolves like this:

- If `service` is `"other"` → show `customName` (falling back to `title`).
- Otherwise → show `title`.

## The item lifecycle

### Create

When you save a new item:

1. The browser assembles the secret payload from the form (dropping empty
   fields) and **encrypts it with your Vault Key**, producing `ciphertext` and a
   fresh `iv`.
2. It sends only `{ type, ciphertext, iv, folderId }` to the create endpoint.
3. The server stores the row — but only if you're under your plan's item limit
   (see below) — and returns the new item's metadata.
4. The browser keeps the decrypted `secret` it already had and prepends the new
   item to the list, so it appears instantly.

The plaintext title, password, and so on never travel to the server. It receives
ciphertext and a few non-secret labels.

### Read (list)

The list endpoint returns every one of your items as **metadata + ciphertext**,
newest-updated first. The browser then decrypts each item's `ciphertext` with the
Vault Key to reveal the secret for display. Decryption happens once, on load,
entirely client-side.

### Update

Editing works like creating: the browser re-encrypts the full secret into a new
`ciphertext`/`iv` and sends it to the per-item endpoint
(`PATCH /api/vault/items/[id]`). Toggling **favorite** is also an update — the
favorite flag is metadata, but the item is saved through the same path so its
encrypted payload stays consistent. Moving an item into or out of a folder works
the same way.

One rule matters here: **an update replaces the item's whole state.** The route
resets `favorite` and `folderId` to their defaults (`false` / `null`) when they
are omitted, so the client always sends the complete current state — new
ciphertext + IV plus the item's favorite flag and folder placement — every time.

### Delete

Deleting removes the row by id. The UI asks for a quick confirmation first
(a "Delete / No" prompt) to prevent accidental loss, then calls the per-item
delete endpoint and drops the item from the list. On the server, the row delete
and the `item_count` decrement happen in **one atomic statement** — the mirror
image of the create — with the counter clamped at zero so it can never drift or
go negative.

## Plan limits and the atomic insert

Each plan defines an `item_limit`, and each user has a running `item_count`. A
naive implementation would (1) read the count, (2) compare it to the limit, then
(3) insert — but between steps 1 and 3, a second request could slip in and you'd
exceed the limit. That's a classic race condition.

Opaque avoids it by doing the check, the insert, and the counter bump in **one
atomic SQL statement**:

- Look up the user's `item_count` and the plan's `item_limit` (only if the vault
  is initialized).
- Insert the new item **only if** `item_count < item_limit`.
- Increment `item_count` **only if** the insert actually happened.

If the limit is already reached (or the vault isn't initialized), the insert
matches no rows, the statement returns nothing, and the API responds with a
clear `403`. Because it's a single statement, there's no window for two
concurrent requests to both "win," and no need for a multi-step transaction held
open across the network.

Delete works the same way in reverse: the row removal and the counter decrement
share a single statement, so `item_count` stays exact in both directions.

> Gotcha: this query joins the `plans` table to read `item_limit`. If `plans`
> has no matching row, the lookup finds nothing and item creation fails. Seed the
> `plans` table before creating items.

## Why search runs in the browser

The list page has a search box and filter tabs. Filtering by type or favorite
uses metadata, so it could in principle happen anywhere — but **search over
titles, usernames, and URLs cannot happen on the server**, because those live
inside the encrypted payload the server can't read.

So search runs client-side (via Fuse.js) over the already-decrypted items, after
the vault is unlocked. It's fuzzy and instant because everything it searches is
already in memory. There is no server-side search endpoint, and by design there
can't be one.

## Developer reference

The two halves correspond to two TypeScript shapes: a server row and the
decrypted item the UI works with.

```ts
// What the server stores and returns (metadata + opaque blob).
interface VaultItemRow {
  id: string;
  type: "login" | "note" | "card" | "identity";
  ciphertext: string;
  iv: string;
  favorite: boolean;
  folder_id: string | null;
  created_at: string;
  updated_at: string;
}

// The decrypted secret, revealed only in the browser.
interface VaultSecret {
  service: string;
  title: string;
  customName?: string;
  username?: string;
  password?: string;
  url?: string;
  notes?: string;
}

// What the UI actually holds after unlock.
type DecryptedItem = VaultItemRow & { secret: VaultSecret };
```

Creating an item, end to end:

```ts
// In the browser: encrypt, then send only ciphertext + non-secret labels.
// encryptJSON (lib/crypto.ts) stringifies the secret and AES-GCM-encrypts it
// with a fresh random IV.
const { ciphertext, iv } = await encryptJSON(secret, vaultKey);

const res = await fetch("/api/vault/items", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ type, ciphertext, iv }),
});

// The response is metadata only; keep the secret you already encrypted.
const { item } = await res.json();
setItems((prev) => [{ ...item, secret }, ...prev]);
```

Updating an item (including a favorite toggle or folder move):

```ts
// PATCH replaces the whole state — send everything, every time.
const { ciphertext, iv } = await encryptJSON(secret, vaultKey);

await fetch(`/api/vault/items/${id}`, {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ ciphertext, iv, favorite, folderId }),
});
```

A few rules that follow from the model:

- **Never send a plaintext field.** Title, password, URL, notes — all of it goes
  inside `ciphertext`. The request body should only ever carry the blob, the
  IV, the type, the favorite flag, and folder placement.
- **Fresh IV every time.** Each create or update produces a new random IV
  (`encryptJSON` does this automatically). Reusing an IV with the same key is
  unsafe.
- **Updates replace, they don't merge.** The `PATCH` route falls back to
  defaults for omitted `favorite`/`folderId`, so always send the item's full
  current state.
- **Validate `type` server-side.** The API only accepts the four known types on
  create; `type` is immutable afterwards.
- **The server never decrypts.** It validates ownership and shape, enforces the
  limit, and stores blobs — nothing more.

## Where to go next

- **Key Management and KDF** — where the Vault Key that encrypts items comes from.
- **Zero Knowledge Model** — why the server can store items it can't read.
- **Architecture** — how the item routes and database fit together.
