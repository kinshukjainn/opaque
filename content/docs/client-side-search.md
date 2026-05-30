---
title: Client-Side Search
slug: client-side-search
description: Why search runs in the browser, how Fuse.js fuzzy-matches your items, and what it can and can't search.
---

## The constraint that shapes everything

Search in Opaque runs entirely in your browser — never on the server. This
isn't a performance choice or a preference; it's a direct consequence of the
zero-knowledge design. The things you'd want to search by — an item's title,
username, or website — live inside the encrypted payload. The server stores those
only as `ciphertext` it cannot read, so it has nothing meaningful to search.

A server-side search would require the server to read your titles and usernames.
That would break the entire guarantee the product is built on. So search happens
where the data is actually readable: in your browser, after the vault is
unlocked.

## In plain words

When you unlock your vault, your browser decrypts all your items into memory.
From that moment, searching is just looking through a list the browser already
holds — fast, private, and instant. Nothing you type into the search box is ever
sent anywhere. The server doesn't know what you searched for, or even that you
searched at all.

## How it works: Fuse.js over decrypted items

Opaque uses **Fuse.js**, a small fuzzy-search library, to power the search box.
"Fuzzy" means it tolerates imperfect input — typos, partial words, slightly wrong
spelling — and still finds the right item. Searching `gmial` or `gmai` still
turns up your Gmail login.

The flow is simple:

1. On unlock, items are decrypted into an in-memory list.
2. A Fuse index is built over that list.
3. As you type, Fuse scores every item against your query and returns the
   matches, best first.

Because the index is built from data already in memory, there is no network
round-trip per keystroke — results appear as fast as you can type.

## What gets searched (and what doesn't)

Fuse is pointed at a specific set of fields inside each decrypted item:

| Searched field      | Why                                          |
| ------------------- | -------------------------------------------- |
| `secret.title`      | The item's display name — the primary handle |
| `secret.username`   | So you can find an account by its login       |
| `secret.url`        | So you can find an item by its website         |
| `secret.customName` | The custom label for `"other"` services       |

Just as important is what is **not** searched:

- **Passwords** are never indexed. You don't search *by* a password, and keeping
  it out of the index avoids accidental exposure (for example, surfacing a match
  highlight on a secret value).
- **Notes** are not indexed either, keeping results focused on identifying
  fields rather than free-form text.

## Fuzzy matching, tuned

Fuse's behavior is controlled by a couple of settings worth understanding:

- **`threshold: 0.4`** — how lenient a match must be. The scale runs from `0.0`
  (only exact matches) to `1.0` (match almost anything). `0.4` is a deliberate
  middle ground: forgiving enough to absorb typos, strict enough that unrelated
  items don't flood the results.
- **`ignoreLocation: true`** — by default Fuse favors matches near the *start* of
  a field. Turning this off means a match counts the same whether your term
  appears at the beginning, middle, or end. So searching `mail` finds both
  `Gmail` and `mail.example.com` equally.

> Tweaking `threshold` is the main dial for "search feels too loose" vs. "too
> strict." Lower it toward `0.3` for tighter matching; raise it toward `0.5` for
> more forgiving matching.

## How search combines with filters

The list page has both a search box and filter tabs (All, Favorites, Logins,
Notes, Cards, Identities). They work together in a clear order:

1. **Search first.** If there's a query, Fuse produces the matching items; if the
   box is empty, the starting set is simply all items.
2. **Then filter.** The active tab is applied on top of that set — `favorites`
   keeps only favorited items, a type tab keeps only that type, and `all` keeps
   everything.

So "search for `bank`, then click the Logins tab" shows bank-matching items that
are also logins. The two narrow the list in sequence rather than competing.

## Performance and when it recomputes

Two pieces of memoized work keep this efficient:

- The **Fuse index** is rebuilt only when the underlying item list changes (an
  add, edit, or delete) — not on every keystroke.
- The **visible list** is recomputed when the query, the filter, or the items
  change, reusing the existing index.

For a personal vault — even a large one — this is comfortably instant, because
everything happens against an in-memory list with no I/O.

## Trade-offs

- **Privacy: maximal.** Queries never leave the device; the server learns
  nothing about what you look for.
- **Speed: excellent at personal scale.** No network latency, no server load.
- **The cost:** search only works *after* unlock, since it needs decrypted data.
  A locked vault can't be searched — which is exactly the point.
- **Scope:** results are only as good as the indexed fields. If you rely on
  finding items by note content, that isn't indexed by default (an intentional
  choice you could change).

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

- **Index only non-sensitive identifiers.** Adding `secret.password` to `keys`
  would index passwords — don't. Be deliberate about adding `secret.notes`.
- **Keep it client-side.** Any move toward server search reintroduces the need
  for the server to read plaintext and breaks zero-knowledge.
- **Tuning lives in the Fuse options.** `threshold` and `ignoreLocation` are the
  knobs; weighting individual keys is also possible if you want titles to rank
  above URLs.

## Where to go next

- **Vault Items** — the structure of the items being searched.
- **Zero Knowledge Model** — why the server can't search for you.
- **Key Management and KDF** — how items get decrypted into searchable form.
