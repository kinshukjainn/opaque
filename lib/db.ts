// ============================================================
//  lib/db.ts  —  Neon serverless (HTTP) client
// ------------------------------------------------------------
//  Same `sql` tagged-template the Kosha webhook already imports.
//  Server-only. The atomic counter is done with single-statement
//  CTEs (see app/api/vault/items), so we never need an interactive
//  transaction over the HTTP driver.
// ============================================================

import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

export const sql = neon(process.env.DATABASE_URL);
