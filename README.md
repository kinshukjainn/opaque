# Opaque

A zero-knowledge, end-to-end encrypted password vault built on Next.js, Clerk, and Neon.

Opaque is built around one simple promise: the server never sees your secrets. Titles, usernames, passwords, URLs, notes, even the name of the service get encrypted in your browser before they ever leave it. The backend only ever stores opaque ciphertext and iv blobs that it cannot read.

If the database got dumped tomorrow, an attacker would walk away with nothing but noise.

## Why it's built this way

**Zero-knowledge.** Encryption and decryption both happen client-side. The API only ever touches ciphertext, so there's no code path where the server can read a plaintext secret.

**Recoverable.** Your Vault Key gets wrapped twice: once by a key derived from your master password, and once by a key derived from a recovery phrase. Lose the password and you can still recover with the phrase, and the server never holds either one.

**Fast.** The dashboard decrypts everything once when you unlock, then search, filtering, and favorites all run locally. The network only gets touched when you create, update, or delete an item.

**Simple to run.** Auth is handled by Clerk, data lives in Neon (Postgres), and every route is a plain Next.js handler. No object store, no extra services to wire up.

## How the vault is structured

Each user has one vault holding typed items. The supported types are:

| Type | What it stores |
|----------|----------------------------|
| `login` | Username / email, password, website |
| `note` | A free-form secure note |
| `card` | Payment card details |
| `identity` | Personal identity information |

Items can be favorited, sorted into folders, and searched instantly, all against the decrypted copy that only ever exists in your browser.

## The crypto model in one snippet

The server stores wrapped keys and KDF parameters, never the keys themselves. Unlocking the vault on the client looks roughly like this:

```js
// Derive a key from the master password using the stored salt + params,
// then unwrap the Vault Key, entirely in the browser.
const passwordKey = await deriveKey(masterPassword, kdf_salt, kdf_params);
const vaultKey = await unwrap(wrapped_vault_key, wrapped_vault_key_iv, passwordKey);

// Every item is decrypted locally with the Vault Key.
const secret = await decrypt(item.ciphertext, item.iv, vaultKey);
```

The matching API routes (`/api/vault/init` and `/api/vault/items`) only persist and return these blobs. They never accept or emit a plaintext secret, a master password, or a recovery phrase.

> **Tip:** The Vault Key never changes when you rotate your master password. Only the password-derived wrapper gets re-encrypted, which is why a password change is instant and doesn't require re-encrypting every item.

## How the core flows work

### 1. Vault initialization

The browser generates a 256-bit Vault Key, derives a KEK from the master password (Argon2id plus salt), and generates a BIP39 recovery phrase. The Vault Key is wrapped twice, and only the wrapped blobs and salt get sent to the server.

### 2. Unlock

Fetch the `wrapped_vault_key` and salt, re-derive the KEK from the typed password, and unwrap the key locally. The AES-GCM auth tag means a wrong password simply fails to unwrap. No hashes are stored or compared server-side.

### 3. Add / edit item

The full entry is encrypted as JSON (`{ title, username, pass, ... }`) client-side. The server checks the item limit against the user's plan, then atomically inserts the row and bumps the counter in a single transaction.

### 4. List & search

The server returns raw ciphertext rows. The browser decrypts them into memory, and search runs completely client-side using Fuse.js over the decrypted objects.

### 5. Forgot master password

Enter the 12 words, derive the recovery key, unwrap the Vault Key via `recovery_wrapped_key`, then immediately set a new master password, which re-wraps the Vault Key. Your entries stay untouched.

### 6. Account deletion

The Clerk `user.deleted` webhook deletes the users row, and Postgres `ON DELETE CASCADE` wipes folders, items, and logs instantly. No orphaned data left behind.

## Tech stack

- **Framework:** Next.js 16 (React 19)
- **Auth:** Clerk
- **Database:** Neon (serverless Postgres)
- **Crypto:** Web Crypto API with Argon2id KDF, AES-GCM wrapping, BIP39 recovery phrases (`@scure/bip39`)
- **Search:** Fuse.js (client-side)
- **UI:** Tailwind CSS 4, Framer Motion, Lucide / React Icons
- **Content:** react-markdown with remark-gfm and rehype-highlight

## Getting started

### Prerequisites

- Node.js 18.18 or newer
- A Clerk application
- A Neon Postgres database

### Install

```bash
git clone https://github.com/your-username/Opaque.git
cd Opaque
npm install
```

### Environment variables

Create a `.env.local` file in the project root:

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
CLERK_WEBHOOK_SIGNING_SECRET=whsec_...

# Neon
DATABASE_URL=postgresql://user:password@host/db?sslmode=require
```

### Run it

```bash
npm run dev
```

The app will be live at `http://localhost:3000`.

### Build for production

```bash
npm run build
npm run start
```

## Webhook setup

Point a Clerk webhook at `/api/webhooks/clerk` and subscribe to the `user.deleted` event. Drop the signing secret into `CLERK_WEBHOOK_SIGNING_SECRET` so the handler can verify incoming payloads with svix.

## A note on security

Opaque leans entirely on client-side cryptography. The master password and recovery phrase never reach the server, so they cannot be reset for you. If you lose both, your data is genuinely unrecoverable. That's the tradeoff that makes zero-knowledge actually mean something.

## License

MIT. See `LICENSE` for details.
