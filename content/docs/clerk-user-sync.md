---
title: Clerk User Sync
slug: clerk-user-sync
description: How Clerk identities are mirrored into EndVault's own database via signed webhooks.
---

## Why sync users at all

EndVault uses **Clerk** for authentication — sign-up, sign-in, sessions, profile
data. But Clerk lives outside your database, and EndVault needs a local `users`
row to hang everything else off: the wrapped vault keys, the encrypted items, the
plan and item count, folders. That local row is the anchor the rest of the schema
references.

So there are effectively two records of "you": the identity Clerk owns, and the
application row EndVault owns. **User sync** is the process that keeps the
EndVault row in step with Clerk — creating it when you sign up, updating it when
your profile changes, and removing it when your account is deleted.

## In plain words

When something happens to your account in Clerk — you register, you change your
name, you delete your account — Clerk sends EndVault a little notification called
a **webhook**. EndVault listens for these notifications and updates its own
copy of your basic profile to match. It's a one-way mirror: Clerk is the source
of truth for who you are; EndVault just keeps a synchronized reflection.

Crucially, that mirror only ever touches your *profile* fields (email, name,
avatar). It never touches your vault's encrypted data — more on why that matters
below.

## The mechanism: signed webhooks

A webhook is just an HTTP request Clerk makes to a URL you register
(`/api/webhooks/clerk`). But an open endpoint that creates and deletes users
would be dangerous if anyone could call it. So every webhook is **signed**, and
EndVault verifies that signature before trusting a single byte.

Verification uses the **svix** library (Clerk delivers webhooks via svix):

1. Clerk sends the event with three headers: `svix-id`, `svix-timestamp`, and
   `svix-signature`.
2. EndVault checks all three headers are present (missing → `400`).
3. It verifies the signature against the shared `CLERK_WEBHOOK_SECRET`. A valid
   signature proves the request genuinely came from your Clerk app and wasn't
   tampered with.
4. If verification fails, the request is rejected (`400`) and nothing touches the
   database.

> Without this step, a forged request could create or delete user rows at will.
> Signature verification is what makes a public endpoint safe to expose.

## The three events

EndVault handles three Clerk event types. Each maps to a precise database action:

| Event          | What EndVault does                                              | Success status |
| -------------- | -------------------------------------------------------------- | -------------- |
| `user.created` | Insert a new `users` row (profile only); skip if it exists      | `201`          |
| `user.updated` | Update the profile fields on the matching row                   | `200`          |
| `user.deleted` | Delete the `users` row; cascades wipe the user's vault data      | `200`          |

For both `created` and `updated`, EndVault works out the **primary email** (the
address Clerk marks as primary, falling back to the first on file) and a display
**name** (`first_name` + `last_name`, or `null` if neither is set). If no email
can be determined, it responds `400` rather than storing a half-formed row.

### user.created

Inserts the row with `clerk_id`, `email`, `name`, and `avatar_url`. Notably, the
crypto columns are **left out entirely**, so they stay `NULL`, and
`vault_initialized` keeps its default of `false`. The vault is set up later,
client-side. The insert uses `ON CONFLICT (clerk_id) DO NOTHING`, so if a row for
that user already exists, nothing is overwritten.

### user.updated

Mirrors profile changes. It upserts the row but updates **only** `email`, `name`,
`avatar_url`, and `updated_at`. This is the single most important rule in the
whole sync.

### user.deleted

Deletes the `users` row by `clerk_id`. There's no other cleanup code because the
database does it: `ON DELETE CASCADE` on the foreign keys automatically removes
the user's `vault_folders`, `vault_items`, and `vault_audit_log`. One delete,
everything tied to the user goes with it. If the delete fails, EndVault returns
`500` — a non-success status tells Clerk/svix to **retry** later.

## The rule that protects your vault

The sync handlers must **never touch the crypto or `vault_initialized` columns.**
This is stated explicitly in the code, and it's not a stylistic preference — it's
a safety lock.

Here's the danger it prevents. Suppose `user.updated` blindly overwrote the whole
row. A routine profile change in Clerk (you update your name) would wipe your
`wrapped_vault_key` back to `NULL` — and since that wrapped key is the *only*
stored path back to your Vault Key, you'd be permanently locked out of your own
encrypted data. By restricting updates to profile fields only, a profile change
can never disturb the encryption state.

| Column group                                   | Touched by sync? |
| ---------------------------------------------- | ---------------- |
| `email`, `name`, `avatar_url`                  | Yes              |
| `kdf_*`, `wrapped_*`, `recovery_*`             | No — never       |
| `vault_initialized`                            | No — never       |

The division of ownership is clean: **Clerk owns the profile, the browser owns
the crypto.** Sync stays strictly on the profile side of that line.

## Idempotency: why ON CONFLICT matters

Webhooks are not guaranteed to arrive exactly once. They can be retried after a
transient failure or, occasionally, delivered more than once. The handlers are
written to be **idempotent** — safe to run repeatedly with the same result:

- `user.created` uses `ON CONFLICT DO NOTHING`, so a duplicate delivery doesn't
  error or create a second row.
- `user.updated` uses `ON CONFLICT DO UPDATE`, so it converges the row to the
  latest profile whether or not it already existed.

This also means the two handlers cooperate gracefully if events arrive out of
order or overlap.

## The local-development gotcha

In production, Clerk can reach your deployed webhook URL, so `user.created`
fires and the row exists before you ever set up your vault. In **local
development, Clerk can't reach `localhost`**, so that webhook never arrives and
the row is missing.

EndVault handles this without breaking the model: the **vault-init route**
creates the user row on first vault setup, from the authenticated user's own
Clerk data, using `ON CONFLICT DO NOTHING`. That last clause is what keeps things
consistent — if the webhook *did* run, init won't clobber it; the webhook remains
the source of truth whenever it's available.

## Developer reference

**Configuration**

- Set `CLERK_WEBHOOK_SECRET` in your environment. Without it, the endpoint
  returns `500` and refuses to process events.
- In the Clerk dashboard, add a webhook endpoint pointing at
  `/api/webhooks/clerk` and subscribe it to `user.created`, `user.updated`, and
  `user.deleted`.
- For local testing, use a tunneling tool (so Clerk can reach your machine) or
  rely on the init-route backfill described above.

**Status codes at a glance**

| Situation                         | Response                          |
| --------------------------------- | --------------------------------- |
| `CLERK_WEBHOOK_SECRET` missing    | `500` (server misconfigured)      |
| Missing svix headers              | `400`                             |
| Invalid signature                 | `400`                             |
| No email on create/update         | `400`                             |
| DB error                          | `500` (triggers retry)            |
| `user.deleted` failure            | `500` (triggers retry)            |

**Implementation rules**

- Always verify the signature *before* reading the payload as trusted input.
- Keep updates scoped to profile columns; never write crypto/`vault_initialized`
  from a webhook.
- Return a non-2xx status on failure so deliveries are retried rather than
  silently lost.
- Rely on `ON DELETE CASCADE` for cleanup instead of manually deleting child
  rows.

## Where to go next

- **Project setup** — where `CLERK_WEBHOOK_SECRET` and the database fit in.
- **Key Management and KDF** — the crypto columns this sync deliberately avoids.
- **Architecture** — how routes, auth, and the database connect end to end.
