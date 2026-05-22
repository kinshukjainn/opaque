// ============================================================
//  app/api/vault/items/route.ts
// ------------------------------------------------------------
//  GET  → list this user's items (ciphertext only), newest first.
//  POST → create an item. Plan-limit check + insert + counter bump
//         happen in ONE atomic SQL statement (CTE), so there's no
//         race and no interactive transaction needed over HTTP.
//         Mirrors Kosha's "check quota BEFORE you commit" pattern.
//
//  The server only ever handles `ciphertext` + `iv`. It cannot read
//  the title, username, password, url, or the service name.
// ============================================================

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

const VALID_TYPES = ["login", "note", "card", "identity"];

export async function GET() {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const items = await sql`
    SELECT i.id, i.type, i.ciphertext, i.iv, i.favorite, i.folder_id,
           i.created_at, i.updated_at
    FROM vault_items i
    JOIN users u ON u.id = i.user_id
    WHERE u.clerk_id = ${userId}
    ORDER BY i.updated_at DESC
  `;

  return NextResponse.json({ items }, { status: 200 });
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { type = "login", ciphertext, iv, folderId = null } = await req.json();

  if (!ciphertext || !iv) {
    return NextResponse.json(
      { error: "Missing ciphertext/iv" },
      { status: 400 },
    );
  }
  if (!VALID_TYPES.includes(type)) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  // Atomic: insert ONLY if under the plan's item_limit, then bump the
  // counter — all in one statement. Empty result == limit reached
  // (or vault not initialized).
  const rows = await sql`
    WITH usr AS (
      SELECT u.id, u.item_count, p.item_limit
      FROM users u
      JOIN plans p ON p.id = u.plan_id
      WHERE u.clerk_id = ${userId} AND u.vault_initialized = true
    ),
    ins AS (
      INSERT INTO vault_items (user_id, type, ciphertext, iv, folder_id)
      SELECT id, ${type}, ${ciphertext}, ${iv}, ${folderId}
      FROM usr
      WHERE usr.item_count < usr.item_limit
      RETURNING id, type, ciphertext, iv, favorite, folder_id, created_at, updated_at
    ),
    upd AS (
      UPDATE users
      SET item_count = item_count + 1, updated_at = now()
      WHERE id = (SELECT id FROM usr) AND EXISTS (SELECT 1 FROM ins)
      RETURNING id
    )
    SELECT * FROM ins
  `;

  if (rows.length === 0) {
    return NextResponse.json(
      { error: "Item limit reached or vault not initialized" },
      { status: 403 },
    );
  }
  return NextResponse.json({ item: rows[0] }, { status: 201 });
}
