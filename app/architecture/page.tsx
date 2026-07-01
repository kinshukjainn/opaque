"use client";

import React from "react";
import {
  Shield,
  Key,
  Database,
  Unlock,
  Eye,
  EyeOff,
  UserCheck,
  ArrowRight,
  ShieldCheck,
  Zap,
  RefreshCw,
  Search,
} from "lucide-react";

export default function ArchitectureDocs() {
  return (
    <div className="w-full max-w-5xl pt-10  mx-auto p-4 sm:p-6 text-[#F3F4F6]  selection:bg-[#0060df] selection:text-white">
      <div className="space-y-16 pt-10 pb-20">
        {/* ── HEADER ── */}
        <header className="space-y-4 pt-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-[#2e3447] bg-[#1e2230] text-[13px] font-medium text-[#a0a6b8]">
            <Shield className="w-4 h-4 text-[#0060df]" />
            System Architecture
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
            Zero-Knowledge Design
          </h1>
          <p className="text-[19px] text-[#a0a6b8] max-w-3xl leading-relaxed">
            The core philosophy of this application relies on a strict
            separation between authentication (identity) and decryption
            (access). The server acts solely as a gatekeeper and never as the
            pipe.
          </p>
        </header>

        {/* ── SECTION 1: THE TWO LAYERS ── */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-white mb-2">
              The Dual Trust Boundary
            </h2>
            <p className="text-[#a0a6b8] text-[17px] max-w-3xl leading-relaxed">
              Internalizing that these layers are entirely independent is what
              stops insecure design. The server can confirm Layer 1 all day, but
              it has no way to ever observe Layer 2.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="p-6 md:p-8 rounded-lg border border-[#2e3447] bg-[#1e2230]">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-lg bg-[#161923] border border-[#2e3447] flex items-center justify-center">
                  <UserCheck className="w-5 h-5 text-[#0060df]" />
                </div>
                <h3 className="text-[18px] font-semibold text-white">
                  Layer 1: Clerk Session
                </h3>
              </div>
              <div className="text-[12px] font-medium text-[#a0a6b8] mb-4  tracking-wide bg-[#161923] inline-block px-2.5 py-1 rounded-lg border border-[#2e3447]">
                &quot;Is this person logged in?&quot;
              </div>
              <p className="text-[19px] text-[#F3F4F6] leading-relaxed">
                Handled by Clerk. This dictates if the user can make HTTP
                requests to your server. The server verifies the JWT and knows
                the user&apos;s identity, plan tier, and account limits.
              </p>
            </div>

            <div className="p-6 md:p-8 rounded-lg border border-[#2e3447] bg-[#1e2230]">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-lg bg-[#161923] border border-[#2e3447] flex items-center justify-center">
                  <Key className="w-5 h-5 text-[#eab308]" />
                </div>
                <h3 className="text-[18px] font-semibold text-white">
                  Layer 2: Vault Unlock
                </h3>
              </div>
              <div className="text-[12px] font-medium text-[#a0a6b8] mb-4  tracking-wide bg-[#161923] inline-block px-2.5 py-1 rounded-lg border border-[#2e3447]">
                &quot;Is the vault decrypted right now?&quot;
              </div>
              <p className="text-[19px] text-[#F3F4F6] leading-relaxed">
                Handled locally in the browser. The Vault Key exists purely in
                volatile memory, derived from the Master Password. A logged-in
                Clerk user with a locked vault can do nothing with their data.
              </p>
            </div>
          </div>
        </section>

        {/* ── SECTION 2: USER LIFECYCLE ── */}
        <section className="space-y-6 pt-10 border-t border-[#2e3447]">
          <div>
            <h2 className="text-2xl font-semibold text-white mb-2">
              User Lifecycle (State Machine)
            </h2>
            <p className="text-[#a0a6b8] text-[17px] max-w-3xl leading-relaxed">
              Because a Clerk user exists before the vault does, the application
              gates access based on the{" "}
              <code className="text-[#0060df] bg-[#0060df]/10 px-1.5 py-0.5 rounded-lg text-[13px] border border-[#0060df]/20 ">
                vault_initialized
              </code>{" "}
              database flag.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row items-center gap-4 bg-[#1e2230] border border-[#2e3447] rounded-xl p-6 md:p-8 overflow-x-auto">
            <StateNode title="Anonymous" desc="No Session" />
            <Arrow />
            <StateNode
              title="Logged In"
              desc="vault_initialized = false"
              highlight
            />
            <Arrow label="Setup Flow" />
            <div className="flex flex-col gap-4 p-5 border border-[#2e3447] rounded-xl bg-[#161923]">
              <StateNode title="Vault Locked" desc="Key NOT in memory" />
              <div className="flex items-center justify-center gap-2 text-[12px] text-[#6b7280] font-medium  tracking-wide">
                <span>Unlock</span>
                <ArrowRight className="w-3.5 h-3.5" />
                <span>Auto-Lock</span>
              </div>
              <StateNode
                title="Vault Unlocked"
                desc="Vault Key in memory"
                highlight
              />
            </div>
          </div>
        </section>

        {/* ── SECTION 3: SERVER VISIBILITY ── */}
        <section className="space-y-6 pt-10 border-t border-[#2e3447]">
          <div>
            <h2 className="text-2xl font-semibold text-white mb-2">
              Server Visibility Spec
            </h2>
            <p className="text-[#a0a6b8] text-[17px] max-w-3xl leading-relaxed">
              Exactly what the Postgres database and your Node/Next.js backend
              can and cannot observe.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="bg-[#1e2230] p-6 md:p-8 rounded-lg border border-[#2e3447]">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 rounded-lg bg-[#22c55e]/10 border border-[#22c55e]/20 flex items-center justify-center text-[#22c55e]">
                  <Eye className="w-5 h-5" />
                </div>
                <h3 className="text-[18px] font-semibold text-white">
                  Server Can See
                </h3>
              </div>
              <ul className="space-y-3 text-[19px] text-[#F3F4F6]">
                <ListItem>User Identity (via Clerk JWT)</ListItem>
                <ListItem>Total item count (for plan limits)</ListItem>
                <ListItem>When items were created/updated</ListItem>
                <ListItem>Item type (Login, Note, Card)</ListItem>
                <ListItem>Favorite flag status</ListItem>
                <ListItem>Subscription plan tier</ListItem>
              </ul>
            </div>

            <div className="bg-[#1e2230] p-6 md:p-8 rounded-lg border border-[#2e3447]">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 rounded-lg bg-[#ef4444]/10 border border-[#ef4444]/20 flex items-center justify-center text-[#ef4444]">
                  <EyeOff className="w-5 h-5" />
                </div>
                <h3 className="text-[18px] font-semibold text-white">
                  Server Cannot See
                </h3>
              </div>
              <ul className="space-y-3 text-[19px] text-[#F3F4F6]">
                <ListItem>Item Titles or Usernames</ListItem>
                <ListItem>Passwords or URLs</ListItem>
                <ListItem>Secure Notes or Folder Names</ListItem>
                <ListItem>The Master Password</ListItem>
                <ListItem>The BIP39 Recovery Phrase</ListItem>
                <ListItem>The Unwrapped Vault Key</ListItem>
              </ul>
            </div>
          </div>
        </section>

        {/* ── SECTION 4: CORE FLOWS ── */}
        <section className="space-y-6 pt-10 border-t border-[#2e3447]">
          <div>
            <h2 className="text-2xl font-semibold text-white mb-2">
              Core Operational Flows
            </h2>
            <p className="text-[#a0a6b8] text-[17px] max-w-3xl leading-relaxed">
              How the cryptographic primitives map to user actions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <FlowCard
              icon={<ShieldCheck />}
              title="1. Vault Initialization"
              desc="Browser generates a 256-bit Vault Key. Derives KEK from Master Password (Argon2id + salt). Generates BIP39 recovery phrase. Wraps Vault Key twice. Sends only wrapped blobs + salt to server."
            />
            <FlowCard
              icon={<Unlock />}
              title="2. Unlock Mechanism"
              desc="Fetch wrapped_vault_key + salt. Re-derive KEK from typed password. Unwrap key locally. AES-GCM auth tag ensures wrong passwords simply fail. No hashes stored or compared server-side."
            />
            <FlowCard
              icon={<Database />}
              title="3. Add / Edit Item"
              desc="Encrypt full entry as JSON {title, username, pass...} client-side. Server checks item_limit against plan, then atomically inserts row + bumps counter in one transaction."
            />
            <FlowCard
              icon={<Search />}
              title="4. List & Search"
              desc="Server returns raw ciphertext rows. Browser decrypts them into memory. Search runs completely client-side using Fuse.js over the decrypted objects."
            />
            <FlowCard
              icon={<RefreshCw />}
              title="5. Forgot Master Password"
              desc="Enter 12 words → derive recovery key → unwrap Vault Key via recovery_wrapped_key → immediately set new master password (re-wraps Vault Key). Entries remain untouched."
            />
            <FlowCard
              icon={<Zap />}
              title="6. Account Deletion"
              desc="Clerk user.deleted webhook deletes the users row. Postgres ON DELETE CASCADE handles wiping folders, items, and logs instantly. No orphaned external data."
            />
          </div>
        </section>
      </div>
    </div>
  );
}

// --- Micro Components ---

function StateNode({
  title,
  desc,
  highlight = false,
}: {
  title: string;
  desc: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`min-w-[160px] p-4 rounded-lg border text-center ${
        highlight
          ? "border-[#0060df] bg-[#0060df]/10"
          : "border-[#2e3447] bg-[#161923]"
      }`}
    >
      <div
        className={`text-[19px] font-semibold ${
          highlight ? "text-[#0060df]" : "text-white"
        }`}
      >
        {title}
      </div>
      <div
        className={`text-[12px] mt-1 ${
          highlight ? "text-[#0060df]/80" : "text-[#6b7280]"
        }`}
      >
        {desc}
      </div>
    </div>
  );
}

function Arrow({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center px-2 py-2">
      {label && (
        <span className="text-[11px] text-[#6b7280] font-medium mb-1.5  tracking-wide">
          {label}
        </span>
      )}
      <ArrowRight className="w-5 h-5 text-[#6b7280]" />
    </div>
  );
}

function ListItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <div className="w-1.5 h-1.5 rounded-xl bg-[#6b7280] mt-2 shrink-0" />
      <span>{children}</span>
    </li>
  );
}

function FlowCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="p-6 rounded-lg border border-[#2e3447] bg-[#1e2230]">
      <div className="flex items-center gap-3 mb-3">
        <div className="text-[#0060df]">
          {React.cloneElement(
            icon as React.ReactElement<{ className?: string }>,
            { className: "w-5 h-5" },
          )}
        </div>
        <h3 className="text-[19px] font-semibold text-white">{title}</h3>
      </div>
      <p className="text-[19px] text-[#a0a6b8] leading-relaxed">{desc}</p>
    </div>
  );
}
