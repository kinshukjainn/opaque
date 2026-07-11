---
title: Client-Side Search
slug: client-side-search
description: Why search runs in the browser, how encrypted items become a searchable in-memory list, and how Fuse.js fuzzy-matches your items.
---

## The constraint that shapes everything

Search in Opaque runs entirely in your browser — never on the server. This
isn't a performance choice or a preference; it's a direct consequence of the
zero-knowledge design. The things you'd want to search by — an item's title,
username, or website — live inside the encrypted payload. Concretely, every
item's secret data is serialized to JSON and AES-GCM-encrypted under your
**Vault Key** in the browser (`encryptJSON` in `lib/crypto.ts`); what the
server stores per item is a `{ ciphertext, iv }` pair of base64 strings it
cannot read. There is nothing meaningful on the server to search.

A server-side search would require the server to read your titles and
usernames in plaintext. That would break the entire guarantee the product is
built on. So search happens where the data is actually readable: in your
browser, after the vault is unlocked.

This has a clean corollary: the search box is only as available as your
decrypted data. A locked vault cannot be searched — by you, by the server, by
anyone — which is exactly the point.

## In plain words

When you unlock your vault, your browser decrypts all your items into memory.
From that moment, searching is just looking through a list the browser already
holds — fast, private, and instant. Nothing you type into the search box is
ever sent anywhere. The server doesn't know what you searched for, or even
that you searched at all. When you lock the vault or close the tab, that
decrypted list is gone, and only ciphertext remains at rest.

## From ciphertext to searchable list

Before Fuse.js ever runs, the data it searches has to exist. That happens once
per unlock, in a short pipeline:

1. **Unlock.** The master password (or recovery phrase) is stretched into a
   wrapping key, which unwraps the Vault Key. From here the Vault Key lives in
   browser memory only — see [Key Management and KDF](/docs/key-management).
2. **Fetch.** The browser pulls the item rows from the server. Each row is
   opaque to the server: a base64 `ciphertext`, its base64 12-byte `iv`, and a
   little non-secret bookkeeping (the item's id, its type, whether it's a
   favorite, timestamps).
3. **Decrypt.** Each item's payload is opened with
   `decryptJSON(ciphertext, iv, vaultKey)`. AES-GCM authenticates as it
   decrypts, so a tampered or corrupted blob **throws** instead of silently
   producing garbage — a failed item can be surfaced as unreadable rather than
   shown with wrong data.
4. **Merge.** The decrypted secret object (`title`, `username`, `url`,
   `customName`, `password`, `notes`, …) is combined with the row's non-secret
   metadata into one in-memory item.
5. **Index.** The resulting list is handed to Fuse.js, and search is live.

Illustratively:

```ts
import { decryptJSON } from "@/lib/crypto";

const items = await Promise.all(
  rows.map(async (row) => ({
    id: row.id,
    type: row.type,
    favorite: row.favorite,
    secret: await decryptJSON<SecretPayload>(row.ciphertext, row.iv, vaultKey),
  })),
);
```

Everything downstream of this point — searching, filtering, rendering — is
ordinary in-memory work on `items`. No further crypto is involved until you
save a change (a fresh `encryptJSON`, with a brand-new IV) or lock the vault.

## How it works: Fuse.js over decrypted items

Opaque uses **Fuse.js**, a small fuzzy-search library, to power the search
box. "Fuzzy" means it tolerates imperfect input — typos, partial words,
slightly wrong spelling — and still finds the right item. Searching `gmial` or
`gmai` still turns up your Gmail login.

The flow is simple:

1. On unlock, items are decrypted into an in-memory list (the pipeline above).
2. A Fuse index is built over that list.
3. As you type, Fuse scores every item against your query and returns the
   matches, best first.

Under the hood, Fuse computes an approximate string-match score per indexed
field and keeps items whose best score clears the configured threshold,
ordered from strongest match to weakest. Because the index is built from data
already in memory, there is no network round-trip per keystroke — results
appear as fast as you can type.

## What gets searched (and what doesn't)

Fuse is pointed at a specific set of fields inside each decrypted item:

| Searched field      | Why                                           |
| ------------------- | --------------------------------------------- |
| `secret.title`      | The item's display name — the primary handle  |
| `secret.username`   | So you can find an account by its login       |
| `secret.url`        | So you can find an item by its website        |
| `secret.customName` | The custom label for `"other"` services       |

Just as important is what is **not** searched:

- **Passwords are never indexed.** You don't search *by* a password, and
  keeping it out of the index avoids accidental exposure — for example, a
  match highlight surfacing part of a secret value in the results list, or a
  query that happens to prefix-match a password lighting up seemingly
  unrelated items.
- **Notes are not indexed** either, keeping results focused on identifying
  fields rather than free-form text. This is a deliberate default, not a
  limitation — see the extension notes below if you want to change it.

Note the asymmetry with the decryption pipeline: *all* secret fields are
decrypted into memory on unlock (they have to be, to display and edit items),
but only these four identifiers are fed to the index.

## Fuzzy matching, tuned

Fuse's behavior is controlled by a couple of settings worth understanding:

- **`threshold: 0.4`** — how lenient a match must be. The scale runs from
  `0.0` (only exact matches) to `1.0` (match almost anything). `0.4` is a
  deliberate middle ground: forgiving enough to absorb a transposed letter or
  a missing character, strict enough that unrelated items don't flood the
  results.
- **`ignoreLocation: true`** — by default Fuse favors matches near the *start*
  of a field and penalizes ones deeper in. Turning location sensitivity off
  means a match counts the same whether your term appears at the beginning,
  middle, or end. So searching `mail` finds both `Gmail` and
  `mail.example.com` equally — important for URLs, where the interesting part
  is rarely the first characters.

> Tweaking `threshold` is the main dial for "search feels too loose" vs. "too
> strict." Lower it toward `0.3` for tighter matching; raise it toward `0.5`
> for more forgiving matching.

## How search combines with filters

The list page has both a search box and filter tabs (All, Favorites, Logins,
Notes, Cards, Identities). They work together in a clear order:

1. **Search first.** If there's a query, Fuse produces the matching items,
   ranked; if the box is empty, the starting set is simply all items.
2. **Then filter.** The active tab is applied on top of that set —
   `favorites` keeps only favorited items, a type tab keeps only that type,
   and `all` keeps everything.

So "search for `bank`, then click the Logins tab" shows bank-matching items
that are also logins. The two narrow the list in sequence rather than
competing — and because filtering happens *after* ranking, the surviving
results keep Fuse's best-first order.

## Performance and when it recomputes

Two pieces of memoized work keep this efficient:

- The **Fuse index** is rebuilt only when the underlying item list changes (an
  add, edit, or delete) — not on every keystroke. Building the index is the
  comparatively expensive step, so it's keyed to `items` alone.
- The **visible list** is recomputed when the query, the filter, or the items
  change, reusing the existing index. Typing a character re-runs only the
  cheap part: one search over an already-built index plus a filter pass.

For a personal vault — even a large one — this is comfortably instant, because
everything happens against an in-memory list with no I/O, no network, and no
serialization per keystroke.

## Privacy and the lifetime of the index

The search index is derived from plaintext, so it is handled with the same
discipline as the plaintext itself:

- **Queries never leave the device.** No search-analytics events, no
  query logging, no server round-trips. The server cannot distinguish a
  session where you searched a hundred times from one where you never touched
  the box.
- **The index is ephemeral.** It exists only in JavaScript memory, is rebuilt
  from scratch on every unlock, and vanishes when the vault locks or the tab
  closes. There is nothing to wipe because nothing was written.
- **Nothing decrypted is ever persisted.** Neither the decrypted item list nor
  the Fuse index is written to `localStorage`, IndexedDB, service-worker
  caches, or anywhere else. Persisting either would recreate exactly the
  plaintext-at-rest problem the whole design exists to avoid.

The result: search adds **zero** new information exposure on top of what
unlocking already implies. It reads only what unlock already decrypted, and it
writes nothing anywhere.

## Trade-offs

- **Privacy: maximal.** Queries never leave the device; the server learns
  nothing about what you look for — not the terms, not the frequency, not the
  fact of searching.
- **Speed: excellent at personal scale.** No network latency, no server load,
  results per keystroke.
- **The cost:** search only works *after* unlock, since it needs decrypted
  data. A locked vault can't be searched — which is exactly the point.
- **Scope:** results are only as good as the indexed fields. If you rely on
  finding items by note content, that isn't indexed by default (an intentional
  choice you could change).
- **Scale ceiling:** everything is linear in the number of items, in memory,
  on the main thread. For personal vaults — hundreds to a few thousand
  items — that's imperceptible. If a vault grew to tens of thousands of
  items, the right responses are client-side: debounce the input, or move the
  Fuse index into a Web Worker. Moving search to the server is **never** the
  answer; it would require server-readable plaintext and end zero-knowledge.

## Developer reference

The index and the visible list are both derived with `useMemo`, so they only
recompute when their inputs change:

```ts
// Build the fuzzy index over decrypted items. Rebuilds only when `items` change.
const fuse = useMemo(
  () =>
    new Fuse(items, {
      keys: ["secret.title", "secret.username", "secret.url", "secret.customName"],
      threshold: 0.4,
      ignoreLocation: true,
    }),
  [items],
);

// Search first, then apply the active filter tab.
const visible = useMemo(() => {
  const base = query.trim()
    ? fuse.search(query.trim()).map((r) => r.item)
    : items;

  return base.filter((it) =>
    filter === "all"
      ? true
      : filter === "favorites"
        ? it.favorite
        : it.type === filter,
  );
}, [query, fuse, items, filter]);
```

Notes for anyone extending this:

- **Index only non-sensitive identifiers.** Adding `secret.password` to
  `keys` would index passwords — don't, ever. Be deliberate about
  `secret.notes`: it can genuinely help ("find the item where I wrote down the
  door code"), but it turns every stray phrase in your notes into a potential
  match and makes result highlights quote free-form secret text. If you add
  it, consider giving it a low weight.
- **Weight the keys if ranking feels off.** Fuse accepts
  `{ name: "secret.title", weight: 2 }`-style entries in `keys`, letting a
  title match outrank an equally fuzzy URL match. The current config treats
  all four fields equally, which works well at this field set's size.
- **Keep it client-side.** Any move toward server search — including
  "just index the titles server-side" — reintroduces the need for the server
  to read plaintext and breaks zero-knowledge for every user at once.
- **Keep it in memory.** The same rule as the item list: never persist the
  index or decrypted items to any storage layer for "faster startup."
  Re-deriving the index on unlock is the cheap, safe path.
- **Tuning lives in the Fuse options.** `threshold` and `ignoreLocation` are
  the knobs to reach for first; per-key weights are the third.

## Where to go next

- **Vault Items** — the structure of the items being searched.
- **[Zero Knowledge Model](/docs/zero-knowledge-model)** — why the server
  can't search for you.
- **[Key Management and KDF](/docs/key-management)** — how items get decrypted
  into searchable form.
