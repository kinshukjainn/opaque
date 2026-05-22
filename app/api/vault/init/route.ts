// ============================================================
//  app/api/vault/init/route.ts
// ------------------------------------------------------------
//  GET  → return the (encrypted) material the browser needs to
//         unlock or recover. All values are ciphertext / public
//         KDF params — safe to hand to the authenticated owner.
//  POST → first-time vault setup. Stores the two wrapped keys +
//         salt + params and flips vault_initialized = true.
//  PUT  → re-wrap on master-password change (Vault Key unchanged).
//
//  This route NEVER sees a master password, recovery phrase, or any
//  plaintext secret. It only persists opaque blobs.
// ============================================================

import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await sql`
    SELECT vault_initialized, kdf_algo, kdf_salt, kdf_params,
           wrapped_vault_key, wrapped_vault_key_iv,
           recovery_wrapped_key, recovery_wrapped_key_iv
    FROM users WHERE clerk_id = ${userId}
  `;

  if (rows.length === 0) {
    return NextResponse.json({ initialized: false }, { status: 200 });
  }

  const r = rows[0];
  return NextResponse.json(
    {
      initialized: r.vault_initialized,
      kdf_algo: r.kdf_algo,
      kdf_salt: r.kdf_salt,
      kdf_params: r.kdf_params,
      wrapped_vault_key: r.wrapped_vault_key,
      wrapped_vault_key_iv: r.wrapped_vault_key_iv,
      recovery_wrapped_key: r.recovery_wrapped_key,
      recovery_wrapped_key_iv: r.recovery_wrapped_key_iv,
    },
    { status: 200 },
  );
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const b = await req.json();
  const required = [
    "kdf_algo",
    "kdf_salt",
    "kdf_params",
    "wrapped_vault_key",
    "wrapped_vault_key_iv",
    "recovery_wrapped_key",
    "recovery_wrapped_key_iv",
  ];
  for (const k of required) {
    if (b[k] === undefined || b[k] === null) {
      return NextResponse.json({ error: `Missing ${k}` }, { status: 400 });
    }
  }

  // Ensure the user row exists. In dev the Clerk webhook can't reach
  // localhost, so the row may not be created yet — create it here from
  // the authenticated user's data. ON CONFLICT DO NOTHING means the
  // webhook stays the source of truth if it already ran.
  const u = await currentUser();
  await sql`
    INSERT INTO users (clerk_id, email, name, avatar_url)
    VALUES (
      ${userId},
      ${u?.emailAddresses?.[0]?.emailAddress ?? ""},
      ${[u?.firstName, u?.lastName].filter(Boolean).join(" ") || null},
      ${u?.imageUrl ?? null}
    )
    ON CONFLICT (clerk_id) DO NOTHING
  `;

  // WHERE vault_initialized = false → idempotent, can't clobber an
  // existing vault (which would lock the user out of their data).
  const rows = await sql`
    UPDATE users SET
      kdf_algo                = ${b.kdf_algo},
      kdf_salt                = ${b.kdf_salt},
      kdf_params              = ${JSON.stringify(b.kdf_params)}::jsonb,
      wrapped_vault_key       = ${b.wrapped_vault_key},
      wrapped_vault_key_iv    = ${b.wrapped_vault_key_iv},
      recovery_wrapped_key    = ${b.recovery_wrapped_key},
      recovery_wrapped_key_iv = ${b.recovery_wrapped_key_iv},
      vault_initialized       = true,
      updated_at              = now()
    WHERE clerk_id = ${userId} AND vault_initialized = false
    RETURNING id
  `;

  if (rows.length === 0) {
    return NextResponse.json(
      { error: "Vault already initialized" },
      { status: 409 },
    );
  }
  return NextResponse.json({ message: "Vault initialized" }, { status: 201 });
}

export async function PUT(req: Request) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const b = await req.json();
  for (const k of [
    "kdf_salt",
    "kdf_params",
    "wrapped_vault_key",
    "wrapped_vault_key_iv",
  ]) {
    if (b[k] === undefined || b[k] === null) {
      return NextResponse.json({ error: `Missing ${k}` }, { status: 400 });
    }
  }

  // Password change: only the password-wrapped key + its KDF salt/params
  // change. The recovery-wrapped key and the Vault Key itself stay put.
  const rows = await sql`
    UPDATE users SET
      kdf_salt             = ${b.kdf_salt},
      kdf_params           = ${JSON.stringify(b.kdf_params)}::jsonb,
      wrapped_vault_key    = ${b.wrapped_vault_key},
      wrapped_vault_key_iv = ${b.wrapped_vault_key_iv},
      updated_at           = now()
    WHERE clerk_id = ${userId} AND vault_initialized = true
    RETURNING id
  `;

  if (rows.length === 0) {
    return NextResponse.json(
      { error: "Vault not initialized" },
      { status: 404 },
    );
  }
  return NextResponse.json(
    { message: "Master password updated" },
    { status: 200 },
  );
}
