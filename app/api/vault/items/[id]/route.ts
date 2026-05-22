// ============================================================
//  app/api/vault/items/[id]/route.ts
// ------------------------------------------------------------
//  PATCH  → replace an item's encrypted blob (+ favorite/folder).
//           The client always sends the full re-encrypted state.
//  DELETE → remove an item and decrement the counter atomically.
//
//  Both are scoped by `user_id = (the caller's user)`, so a user can
//  only ever touch their own rows even if they guess another id.
// ============================================================

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const {
    ciphertext,
    iv,
    favorite = false,
    folderId = null,
  } = await req.json();

  if (!ciphertext || !iv) {
    return NextResponse.json(
      { error: "Missing ciphertext/iv" },
      { status: 400 },
    );
  }

  const rows = await sql`
    UPDATE vault_items
    SET ciphertext = ${ciphertext},
        iv         = ${iv},
        favorite   = ${favorite},
        folder_id  = ${folderId},
        updated_at = now()
    WHERE id = ${id}
      AND user_id = (SELECT id FROM users WHERE clerk_id = ${userId})
    RETURNING id, type, ciphertext, iv, favorite, folder_id, created_at, updated_at
  `;

  if (rows.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ item: rows[0] }, { status: 200 });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  // Delete + decrement in one statement (counter never drifts).
  const rows = await sql`
    WITH del AS (
      DELETE FROM vault_items
      WHERE id = ${id}
        AND user_id = (SELECT id FROM users WHERE clerk_id = ${userId})
      RETURNING user_id
    ),
    upd AS (
      UPDATE users
      SET item_count = GREATEST(item_count - 1, 0), updated_at = now()
      WHERE id = (SELECT user_id FROM del)
      RETURNING id
    )
    SELECT user_id FROM del
  `;

  if (rows.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ message: "Deleted" }, { status: 200 });
}
