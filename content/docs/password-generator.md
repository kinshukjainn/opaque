---
title: Password Generator
slug: password-generator
description: Why generated passwords are stronger, how a secure generator works, and how Opaque's fits in.
---

## What the generator is for

The password generator is the little refresh button next to the password field
when you create or edit a login. Tap it and Opaque drops a fresh, strong,
random password into the field for you. It exists to solve the single biggest
weakness in any password system: the human picking the password.

A password manager removes the *reason* people choose weak passwords — you no
longer have to remember them, so they no longer need to be memorable. The
generator takes that to its logical end: let the machine produce something no
human would ever invent, and let the vault remember it for you.

## Why generated beats chosen

People are predictable in ways that attackers exploit. We reuse passwords across
sites, lean on names and dates, append a `1` or a `!` to satisfy rules, and
gravitate to the same handful of patterns. Attackers know all of this and try the
likely candidates first.

A generated password has none of that structure. It's drawn from random data, so
there's no pattern to guess and nothing shared with your other accounts. The
practical payoff:

- **No reuse.** Every account gets its own unique password, so a breach of one
  site can't unlock the others.
- **No predictable structure.** There's nothing for a "guess the likely
  password" attack to latch onto.
- **Maximum strength per character.** Random characters pack far more
  unpredictability into the same length than any human phrase.

## In plain words: what makes a password "strong"

Strength comes down to one idea — **entropy**, a measure of how many possibilities
an attacker would have to try. The more truly-random choices that go into a
password, the more possibilities there are, and the longer any brute-force search
would take.

Two things drive entropy:

1. **Length** — more characters means more choices stacked together.
2. **Variety** — drawing from a bigger pool of possible characters (lowercase,
   uppercase, digits, symbols) makes each character carry more information.

Opaque's generator is called with a length (the dashboard uses **20**
characters), and produces a random string of that length.

### How much strength does length 20 give?

Entropy is roughly *length × bits-per-character*, where bits-per-character
depends on the size of the character set:

| Character set                          | Pool size | Bits/char | 20 chars ≈ |
| -------------------------------------- | --------- | --------- | ---------- |
| Letters + digits (a–z, A–Z, 0–9)       | 62        | ~5.95     | ~119 bits  |
| Letters + digits + common symbols      | ~72       | ~6.17     | ~123 bits  |
| Full printable ASCII                   | ~95       | ~6.57     | ~131 bits  |

For context, anything north of about **80 bits** is considered very strong, and
**128 bits** is the comfortable "effectively impossible to brute-force" zone. A
20-character random password lands well inside that range no matter which of the
sets above is used — which is why 20 is a sensible default.

> A handy intuition: each extra random character multiplies the number of
> possibilities by the pool size. Adding length is the cheapest, most reliable
> way to add strength.

## The part that actually matters: the randomness source

A password generator is only as good as its source of randomness, and this is
where implementations quietly go wrong.

- **The right tool** is a cryptographically secure random generator — in the
  browser, `crypto.getRandomValues()`. Its output is unpredictable even to
  someone who has seen previous outputs.
- **The wrong tool** is `Math.random()`. It's fast and fine for shuffling a
  playlist, but it's *not* cryptographically secure: its output can be predicted,
  which would make generated passwords guessable. It must never be used for
  secrets.

A second, subtler detail is **avoiding modulo bias** when turning random bytes
into characters. Naively mapping a random byte onto a character set with the
`%` operator can make some characters slightly more likely than others, shaving
entropy. A correct generator rejects out-of-range values rather than folding them
in, so every character in the set is equally likely.

> If you take one thing from this page: secure generation = a CSPRNG
> (`crypto.getRandomValues`) + an unbiased mapping to the character set. Length
> and variety are the visible part; the randomness source is the part that's
> easy to get wrong and invisible when you do.

## How a generated password flows through the vault

A generated password isn't special once it exists — it's just a password, and it
travels the same path as one you typed:

1. You tap the generate button; the generator returns a fresh random string.
2. It populates the password field in the add/edit form.
3. On save, it becomes part of the item's secret payload, which is **encrypted
   in the browser** before anything is sent.
4. The server stores only the resulting ciphertext — it never sees the generated
   password in the clear, exactly as with every other field.

So the generator produces strength; the zero-knowledge pipeline keeps that
strength private.

## Developer reference

The generator is exposed through the vault hook and called with options:

```ts
const { generate } = useVault();

// Produce a 20-character password and place it in the form.
setForm((f) => ({ ...f, password: generate({ length: 20 }) }));
```

Guidance for the implementation behind `generate`:

- **Use a CSPRNG.** `crypto.getRandomValues()` only — never `Math.random()`.
- **Map without bias.** Use rejection sampling (discard random values that fall
  outside an exact multiple of the character-set size) so every character is
  equally probable.
- **Make the character set explicit.** Decide deliberately which classes are
  included (lowercase, uppercase, digits, symbols); document it; and if you offer
  toggles, recompute entropy from the resulting pool size.
- **Prefer length over rules.** Length is the most efficient lever for entropy.
  Forced-composition rules ("must contain a symbol") add little and can even
  reduce randomness if implemented by post-hoc substitution.
- **Never log generated values.** They're secrets the moment they exist.

## Where to go next

- **Vault Items** — how the generated password is stored as part of an item.
- **Zero Knowledge Model** — why the server never sees the generated value.
- **Client-Side Search** — note that passwords are intentionally not indexed.
