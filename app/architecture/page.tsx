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
    <div className="min-h-screen bg-black text-zinc-300  selection:bg-zinc-800 selection:text-white py-20 px-6">
      <div className="max-w-5xl mx-auto space-y-24">
        {/* Header */}
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/50 text-xs font-medium text-zinc-400 mb-4">
            <Shield className="w-3.5 h-3.5" />
            System Architecture
          </div>
          <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-zinc-100">
            Zero-Knowledge Design
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl leading-relaxed">
            The core philosophy of this application relies on a strict
            separation between authentication (identity) and decryption
            (access). The server acts solely as a gatekeeper and never as the
            pipe.
          </p>
        </header>

        {/* Section 1: The Two Layers */}
        <section className="space-y-8">
          <div>
            <h2 className="text-2xl font-medium text-zinc-100 mb-2">
              The Dual Trust Boundary
            </h2>
            <p className="text-zinc-400 max-w-3xl">
              Internalizing that these layers are entirely independent is what
              stops insecure design. The server can confirm Layer 1 all day, but
              it has no way to ever observe Layer 2.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-8 rounded-2xl border border-zinc-800 bg-zinc-900/30">
              <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center mb-6">
                <UserCheck className="w-5 h-5 text-zinc-300" />
              </div>
              <h3 className="text-lg font-medium text-zinc-100 mb-2">
                Layer 1: Clerk Session
              </h3>
              <p className="text-sm font-mono text-zinc-500 mb-4 uppercase tracking-wider">
                &quot;Is this person logged in?&quot;
              </p>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Handled by Clerk. This dictates if the user can make HTTP
                requests to your server. The server verifies the JWT and knows
                the user&apos;s identity, plan tier, and account limits.
              </p>
            </div>

            <div className="p-8 rounded-2xl border border-zinc-800 bg-zinc-900/30">
              <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center mb-6">
                <Key className="w-5 h-5 text-zinc-300" />
              </div>
              <h3 className="text-lg font-medium text-zinc-100 mb-2">
                Layer 2: Vault Unlock
              </h3>
              <p className="text-sm font-mono text-zinc-500 mb-4 uppercase tracking-wider">
                &quot;Is the vault decrypted right now?&quot;
              </p>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Handled locally in the browser. The Vault Key exists purely in
                volatile memory, derived from the Master Password. A logged-in
                Clerk user with a locked vault can do nothing with their data.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: User Lifecycle (State Machine) */}
        <section className="space-y-8 border-t border-zinc-800/50 pt-16">
          <div>
            <h2 className="text-2xl font-medium text-zinc-100 mb-2">
              User Lifecycle (State Machine)
            </h2>
            <p className="text-zinc-400 max-w-3xl">
              Because a Clerk user exists before the vault does, the application
              gates access based on the{" "}
              <code className="text-zinc-300">vault_initialized</code> database
              flag.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row items-center gap-4 bg-zinc-900/20 border border-zinc-800 rounded-xl p-8 overflow-x-auto">
            <StateNode title="Anonymous" desc="No Session" />
            <Arrow />
            <StateNode
              title="Logged In"
              desc="vault_initialized = false"
              highlight
            />
            <Arrow label="Setup Flow" />
            <div className="flex flex-col gap-4 p-4 border border-zinc-800/80 rounded-xl bg-zinc-950">
              <StateNode title="Vault Locked" desc="Key NOT in memory" />
              <div className="flex items-center justify-center gap-2 text-xs text-zinc-500 font-mono">
                <span>Unlock</span>
                <ArrowRight className="w-3 h-3" />
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

        {/* Section 3: Server Visibility (Can vs Cannot See) */}
        <section className="space-y-8 border-t border-zinc-800/50 pt-16">
          <div>
            <h2 className="text-2xl font-medium text-zinc-100 mb-2">
              Server Visibility Spec
            </h2>
            <p className="text-zinc-400 max-w-3xl">
              Exactly what the Postgres database and your Node/Next.js backend
              can and cannot observe.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-zinc-800/50 rounded-2xl overflow-hidden border border-zinc-800">
            <div className="bg-black p-8">
              <div className="flex items-center gap-3 mb-6">
                <Eye className="w-6 h-6 text-emerald-500" />
                <h3 className="text-lg font-medium text-zinc-100">
                  Server Can See
                </h3>
              </div>
              <ul className="space-y-3 text-sm text-zinc-400">
                <ListItem>User Identity (via Clerk JWT)</ListItem>
                <ListItem>Total item count (for plan limits)</ListItem>
                <ListItem>When items were created/updated</ListItem>
                <ListItem>Item type (Login, Note, Card)</ListItem>
                <ListItem>Favorite flag status</ListItem>
                <ListItem>Subscription plan tier</ListItem>
              </ul>
            </div>
            <div className="bg-black p-8">
              <div className="flex items-center gap-3 mb-6">
                <EyeOff className="w-6 h-6 text-red-500" />
                <h3 className="text-lg font-medium text-zinc-100">
                  Server Cannot See
                </h3>
              </div>
              <ul className="space-y-3 text-sm text-zinc-400">
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

        {/* Section 4: Core Operational Flows */}
        <section className="space-y-8 border-t border-zinc-800/50 pt-16">
          <div>
            <h2 className="text-2xl font-medium text-zinc-100 mb-2">
              Core Operational Flows
            </h2>
            <p className="text-zinc-400 max-w-3xl">
              How the cryptographic primitives map to user actions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

// --- Micro Components for Readability ---

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
      className={`min-w-[160px] p-4 rounded-lg border text-center transition-colors ${
        highlight
          ? "border-zinc-500 bg-zinc-800/30"
          : "border-zinc-800 bg-black"
      }`}
    >
      <div
        className={`text-sm font-medium ${highlight ? "text-zinc-100" : "text-zinc-300"}`}
      >
        {title}
      </div>
      <div className="text-xs text-zinc-500 mt-1">{desc}</div>
    </div>
  );
}

function Arrow({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center px-4">
      {label && (
        <span className="text-[10px] text-zinc-500 font-mono mb-1 uppercase">
          {label}
        </span>
      )}
      <ArrowRight className="w-4 h-4 text-zinc-600" />
    </div>
  );
}

function ListItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <div className="w-1.5 h-1.5 rounded-full bg-zinc-700 mt-1.5 shrink-0" />
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
    <div className="p-6 rounded-xl border border-zinc-800/80 bg-zinc-900/10 hover:bg-zinc-900/30 transition-colors">
      <div className="w-8 h-8 rounded-md bg-zinc-800/50 flex items-center justify-center text-zinc-400 mb-4">
        {/* Fix for TypeScript cloneElement Error: explicitly typing the cast element */}
        {React.cloneElement(
          icon as React.ReactElement<{ className?: string }>,
          { className: "w-4 h-4" },
        )}
      </div>
      <h3 className="text-base font-medium text-zinc-100 mb-2">{title}</h3>
      <p className="text-sm text-zinc-400 leading-relaxed">{desc}</p>
    </div>
  );
}
