---
title: Project setup
slug: project-setup
description: How to install, configure, and run EndVault locally.
---



## Prerequisites

- **Node.js 20 or newer** — required by Next 16 and the React 19 toolchain.
- **A package manager** — npm (used in the examples below), pnpm, or yarn.
- **A Clerk application** — for authentication. You'll need the publishable key,
  secret key, and a webhook signing secret.
- **A Neon (Postgres) database** — for storing users and the encrypted vault
  blobs.

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Create your env file (see the table below)
cp .env.example .env.local

# 3. Run the dev server
npm run dev
```

The app will be available at `http://localhost:3000`.

### Available scripts

| Script          | What it does                          |
| --------------- | ------------------------------------- |
| `npm run dev`   | Starts the Next.js development server |
| `npm run build` | Builds the production bundle          |
| `npm run start` | Serves the production build           |
| `npm run lint`  | Runs ESLint                           |

## Environment variables

Create a `.env.local` file in the project root. None of these are encryption
keys for your vault — those are derived in the browser and never stored here.

| Variable                            | Required | Description                                                    |
| ----------------------------------- | -------- | -------------------------------------------------------------- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes      | Clerk publishable key, exposed to the browser                  |
| `CLERK_SECRET_KEY`                  | Yes      | Clerk secret key, used by server-side `auth()`/`currentUser()` |
| `CLERK_WEBHOOK_SECRET`              | Yes      | Signing secret used by `svix` to verify Clerk webhooks         |
| `DATABASE_URL`                      | Yes      | Neon Postgres connection string used by the `sql` client       |

## Database

The schema centers on a few tables that the route handlers expect to exist:

- `users` — one row per Clerk user, holding profile fields plus the wrapped
  vault keys, KDF salt/params, `vault_initialized` flag, and `item_count`.
- `plans` — defines each plan's `item_limit`. Every user row references a plan.
- `vault_items` — the encrypted items (`ciphertext`, `iv`, `type`, `favorite`,
  `folder_id`).
- `vault_folders` and `vault_audit_log` — folders and an audit trail, both
  removed via `ON DELETE CASCADE` when a user is deleted.

> Tip: Seed the `plans` table before creating items. The item-insert query joins
> `plans` to read `item_limit`; if there is no matching plan row, the insert
> finds nothing and item creation fails. This is a common first-run gotcha.

In development, the Clerk webhook can't reach `localhost`, so a user row may not
exist yet. The `/api/vault/init` route creates it on first vault setup using
`ON CONFLICT DO NOTHING`, keeping the webhook as the source of truth in
production.

## What to put — and what not to

**Put in version control:** the source, the `.env.example` template (with empty
or placeholder values), and the database migration/seed files.

**Keep out of version control and out of this doc:**

- Real values for any variable in the table above — commit only `.env.example`,
  never `.env.local`.
- Master passwords, recovery phrases, or any derived key material. These exist
  only in the browser at runtime and must never touch the server, logs, or the
  repo.
- The deep crypto walkthrough and full endpoint reference — those belong on the
  Encryption and API pages, not in setup, so this guide stays short.

## Dependencies

A complete list of what's installed and why. `Scope` distinguishes runtime
packages from development-only tooling.

| Package                       | Version    | Scope   | Purpose                                            |
| ----------------------------- | ---------- | ------- | -------------------------------------------------- |
| `next`                        | `16.2.6`   | runtime | The framework (App Router, API route handlers)     |
| `react`                       | `19.2.4`   | runtime | UI library                                         |
| `react-dom`                   | `19.2.4`   | runtime | React DOM renderer                                 |
| `@clerk/nextjs`               | `^7.4.0`   | runtime | Authentication, sessions, and user management      |
| `@neondatabase/serverless`    | `^1.1.0`   | runtime | Postgres driver behind the `sql` tagged template   |
| `@scure/bip39`                | `^2.2.0`   | runtime | Recovery-phrase (BIP39 mnemonic) generation        |
| `svix`                        | `^1.94.0`  | runtime | Verifies signatures on incoming Clerk webhooks     |
| `fuse.js`                     | `^7.3.0`   | runtime | Client-side fuzzy search over decrypted items      |
| `framer-motion`               | `^12.39.0` | runtime | UI animations (modals, transitions)                |
| `lucide-react`                | `^1.16.0`  | runtime | Primary icon set                                   |
| `react-icons`                 | `^5.6.0`   | runtime | Additional icons (e.g. the loading spinner)        |
| `react-markdown`              | `^10.1.0`  | runtime | Renders the Markdown documentation pages           |
| `remark-gfm`                  | `^4.0.1`   | runtime | GitHub-flavored Markdown (tables, task lists)      |
| `rehype-highlight`            | `^7.0.2`   | runtime | Syntax highlighting for code blocks                |
| `gray-matter`                 | `^4.0.3`   | runtime | Parses frontmatter from `.md` files                |
| `axios`                       | `^1.16.1`  | runtime | HTTP client                                        |
| `tailwindcss`                 | `^4`       | dev     | Utility-first CSS framework                        |
| `@tailwindcss/postcss`        | `^4`       | dev     | Tailwind v4 PostCSS plugin                         |
| `@tailwindcss/typography`     | `^0.5.19`  | dev     | Prose styling for rendered docs                    |
| `typescript`                  | `^5`       | dev     | TypeScript compiler                                |
| `@types/node`                 | `^20`      | dev     | Node type definitions                              |
| `@types/react`                | `^19`      | dev     | React type definitions                             |
| `@types/react-dom`            | `^19`      | dev     | React DOM type definitions                         |
| `babel-plugin-react-compiler` | `1.0.0`    | dev     | React Compiler plugin                              |
| `eslint`                      | `^9`       | dev     | Linter                                             |
| `eslint-config-next`          | `16.2.6`   | dev     | Next.js ESLint configuration                       |

## Where to go next

- **Architecture** — how the routes, database, and webhook sync fit together.
- **Encryption** — the key-wrapping and recovery-phrase flow.
- **Introduction** — the high-level overview of the project.
