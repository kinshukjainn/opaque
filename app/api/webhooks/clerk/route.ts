// ============================================================
//  app/api/webhooks/clerk/route.ts
// ------------------------------------------------------------
//  Adapted from your Kosha webhook. Changes:
//    - All S3 / @aws-sdk code removed (no object store here).
//    - user.deleted just deletes the users row; ON DELETE CASCADE
//      wipes vault_folders, vault_items, vault_audit_log.
//    - user.created inserts the row with crypto columns LEFT NULL
//      and vault_initialized = false (the default). Those columns
//      are filled later, client-side, during vault setup — never here.
// ============================================================

import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    console.error("CLERK_WEBHOOK_SECRET missing");
    return NextResponse.json(
      { error: "Server misconfigured" },
      { status: 500 },
    );
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Invalid signature", { status: 400 });
  }

  // ---------- user.created ----------
  if (evt.type === "user.created") {
    const {
      id,
      email_addresses,
      primary_email_address_id,
      first_name,
      last_name,
      image_url,
    } = evt.data;

    const primaryEmail =
      email_addresses.find((e) => e.id === primary_email_address_id)
        ?.email_address ?? email_addresses[0]?.email_address;

    if (!primaryEmail) {
      console.error("user.created: no email for", id);
      return NextResponse.json({ error: "No email" }, { status: 400 });
    }

    const name = [first_name, last_name].filter(Boolean).join(" ") || null;

    try {
      // Crypto columns intentionally omitted → they stay NULL,
      // vault_initialized defaults to false. Vault is set up later.
      await sql`
        INSERT INTO users (clerk_id, email, name, avatar_url)
        VALUES (${id}, ${primaryEmail}, ${name}, ${image_url ?? null})
        ON CONFLICT (clerk_id) DO NOTHING
      `;
      return NextResponse.json({ message: "User synced" }, { status: 201 });
    } catch (error) {
      console.error("user.created DB error:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }
  }

  // ---------- user.updated ----------
  if (evt.type === "user.updated") {
    const {
      id,
      email_addresses,
      primary_email_address_id,
      first_name,
      last_name,
      image_url,
    } = evt.data;

    const primaryEmail =
      email_addresses.find((e) => e.id === primary_email_address_id)
        ?.email_address ?? email_addresses[0]?.email_address;

    if (!primaryEmail) {
      return NextResponse.json({ error: "No email" }, { status: 400 });
    }

    const name = [first_name, last_name].filter(Boolean).join(" ") || null;

    try {
      // Upsert, but NEVER touch the crypto / vault_initialized columns.
      await sql`
        INSERT INTO users (clerk_id, email, name, avatar_url)
        VALUES (${id}, ${primaryEmail}, ${name}, ${image_url ?? null})
        ON CONFLICT (clerk_id) DO UPDATE SET
          email      = EXCLUDED.email,
          name       = EXCLUDED.name,
          avatar_url = EXCLUDED.avatar_url,
          updated_at = NOW()
      `;
      return NextResponse.json({ message: "User updated" }, { status: 200 });
    } catch (error) {
      console.error("user.updated DB error:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }
  }

  // ---------- user.deleted ----------
  if (evt.type === "user.deleted") {
    const { id } = evt.data;
    if (!id) return NextResponse.json({ error: "No user id" }, { status: 400 });

    try {
      // No external store to purge — cascade handles everything.
      await sql`DELETE FROM users WHERE clerk_id = ${id}`;
      return NextResponse.json({ message: "User deleted" }, { status: 200 });
    } catch (error) {
      console.error("user.deleted error:", error);
      return NextResponse.json(
        { error: "Deletion failed — will retry" },
        { status: 500 },
      );
    }
  }

  return new Response("", { status: 200 });
}
