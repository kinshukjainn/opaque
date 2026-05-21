import React from "react";
import {
  Shield,
  Key,
  Eye,
  EyeOff,
  UserCheck,
  Server,
  ArrowRight,
  RefreshCw,
  Code2,
  Layers,
  TerminalSquare,
} from "lucide-react";

export default function ArchitectureDocs() {
  return (
    <div className="min-h-screen bg-black text-zinc-300  selection:bg-zinc-800 selection:text-white pb-32">
      {/* Top Navigation/Breadcrumb Area */}
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-md border-b border-zinc-800/80 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-2 text-sm text-zinc-400 font-medium">
          <TerminalSquare className="w-4 h-4" />
          <span>Documentation</span>
          <span className="text-zinc-600">/</span>
          <span className="text-zinc-100">Architecture Specification</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 pt-16 space-y-24">
        {/* 1. HEADER & ABSTRACT */}
        <header className="space-y-6">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-zinc-100">
            Documentation
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 leading-relaxed max-w-[65ch]">
            The complete technical specification for{" "}
            <span className="font-bold text-blue-500">EndVault</span>. This
            document outlines the cryptographic flows, trust boundaries, and
            database mechanics required to build a zero-knowledge password
            manager.
          </p>
        </header>

        {/* 2. THE TECH STACK */}
        <section className="space-y-8">
          <SectionHeading title="1. Infrastructure & Stack" icon={<Layers />} />
          <p className="text-zinc-400 max-w-[65ch] leading-relaxed">
            Based on the project configuration, the application utilizes a
            modern React ecosystem combined with specific backend primitives to
            ensure security and performance.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StackCard
              title="Next.js 16 & React 19"
              desc="The core framework. Utilizes the latest React compiler and Server Components. Handles routing, API endpoints, and server-side gatekeeping."
            />
            <StackCard
              title="@clerk/nextjs"
              desc="Handles pure identity and authentication. Clerk manages users, sessions, and webhooks, but never touches encrypted vault data."
            />
            <StackCard
              title="Tailwind CSS v4"
              desc="The styling engine. v4 provides a zero-config, highly performant CSS-in-JS alternative for the dark, minimalist UI."
            />
            <StackCard
              title="Postgres (Neon) & Redis (Upstash)"
              desc="Neon handles atomic transactions and JSON ciphertext storage. Upstash Redis handles high-speed rate limiting against brute-force attacks."
            />
          </div>
        </section>

        {/* 3. TRUST BOUNDARIES */}
        <section className="space-y-8 border-t border-zinc-800/80 pt-16">
          <SectionHeading
            title="2. The Dual Trust Boundary"
            icon={<Shield />}
          />
          <div className="prose prose-invert prose-zinc max-w-[65ch]">
            <p className="text-zinc-400 leading-relaxed text-lg">
              The core concept relies on separating identity from access. A
              logged-in user with a locked vault can do nothing.{" "}
              <strong>
                The server can confirm Layer 1 all day; it has no way to ever
                observe Layer 2.
              </strong>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="p-8 rounded-xl border border-zinc-800 bg-zinc-900/20">
              <UserCheck className="w-6 h-6 text-zinc-300 mb-4" />
              <h3 className="text-lg font-medium text-zinc-100 mb-2">
                Layer 1: Clerk Session
              </h3>
              <p className="text-xs font-mono text-zinc-500 mb-4 uppercase tracking-wider">
                &quot;Is this person logged in?&quot;
              </p>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Server-side knowledge. Dictates if the user can make HTTP
                requests to the server. The server verifies the JWT and knows
                the user&apos;s identity and plan limits.
              </p>
            </div>

            <div className="p-8 rounded-xl border border-zinc-800 bg-zinc-900/20">
              <Key className="w-6 h-6 text-zinc-300 mb-4" />
              <h3 className="text-lg font-medium text-zinc-100 mb-2">
                Layer 2: Vault Unlock
              </h3>
              <p className="text-xs font-mono text-zinc-500 mb-4 uppercase tracking-wider">
                &quot;Is the vault decrypted?&quot;
              </p>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Strictly client-side. The Vault Key exists purely in browser
                memory, derived from the Master Password, and vanishes
                immediately on lock or timeout.
              </p>
            </div>
          </div>
        </section>

        {/* 4. STATE MACHINE */}
        <section className="space-y-8 border-t border-zinc-800/80 pt-16">
          <SectionHeading
            title="3. User Lifecycle (State Machine)"
            icon={<RefreshCw />}
          />
          <p className="text-zinc-400 max-w-[65ch] leading-relaxed">
            Because a Clerk user exists before the vault does, the application
            gates access based on the{" "}
            <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-300 text-sm">
              vault_initialized
            </code>{" "}
            database flag.
          </p>

          {/* Responsive State Diagram */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-zinc-900/30 border border-zinc-800/80 rounded-xl p-6 md:p-8 overflow-x-auto">
            <StateNode title="Anonymous" desc="No Session" />
            <Arrow label="Clerk Signup" />

            <StateNode
              title="Logged In"
              desc="vault_initialized = false"
              highlight
            />
            <Arrow label="Setup Flow" />

            <div className="flex flex-col gap-4 p-4 md:p-6 border border-zinc-700/80 rounded-xl bg-zinc-950 min-w-[200px]">
              <div className="text-xs text-zinc-500 uppercase tracking-wider text-center mb-2 font-medium">
                Vault State
              </div>
              <StateNode title="Locked" desc="Key NOT in memory" />
              <div className="flex items-center justify-center gap-2 text-[10px] text-zinc-500 font-mono">
                <span>Enter Password</span>
                <ArrowRight className="w-3 h-3" />
              </div>
              <StateNode title="Unlocked" desc="Key in memory only" highlight />
            </div>
          </div>
        </section>

        {/* 5. VISIBILITY SPEC */}
        <section className="space-y-8 border-t border-zinc-800/80 pt-16">
          <SectionHeading title="4. Server Visibility Spec" icon={<Server />} />
          <p className="text-zinc-400 max-w-[65ch] leading-relaxed">
            A strict definition of what the Postgres database and Node server
            can and cannot observe. Cryptographic material is stored as base64
            TEXT.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-zinc-800/80 rounded-xl overflow-hidden border border-zinc-800">
            <div className="bg-black p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <Eye className="w-5 h-5 text-emerald-500" />
                <h3 className="text-lg font-medium text-zinc-100">
                  Server Can See
                </h3>
              </div>
              <ul className="space-y-4 text-sm text-zinc-400">
                <ListItem>User Identity (Clerk ID)</ListItem>
                <ListItem>Total item count & Plan limits</ListItem>
                <ListItem>Timestamps (Created/Updated)</ListItem>
                <ListItem>Item type (Login vs Note)</ListItem>
                <ListItem>Favorite flags</ListItem>
              </ul>
            </div>
            <div className="bg-black p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <EyeOff className="w-5 h-5 text-red-500" />
                <h3 className="text-lg font-medium text-zinc-100">
                  Server Cannot See
                </h3>
              </div>
              <ul className="space-y-4 text-sm text-zinc-400">
                <ListItem>Item Titles or Usernames</ListItem>
                <ListItem>Passwords or URLs</ListItem>
                <ListItem>Secure Notes or Folders</ListItem>
                <ListItem>The Master Password</ListItem>
                <ListItem>The Recovery Phrase</ListItem>
              </ul>
            </div>
          </div>
        </section>

        {/* 6. OPERATIONAL FLOWS */}
        <section className="space-y-8 border-t border-zinc-800/80 pt-16">
          <SectionHeading title="5. System Workflows" icon={<Code2 />} />
          <p className="text-zinc-400 max-w-[65ch] leading-relaxed mb-8">
            The step-by-step cryptographic processes for all major user actions.
          </p>

          <div className="space-y-6">
            <FlowRow
              num="1"
              title="Vault Initialization"
              desc="Browser generates a random 256-bit Vault Key. Derives a KEK from the master password (Argon2id + fresh salt). Generates a BIP39 phrase. Wraps Vault Key twice. Sends only wrapped blobs + salt to server. Sets vault_initialized = true."
            />
            <FlowRow
              num="2"
              title="Unlock"
              desc="Fetch wrapped_vault_key + salt. Re-derive KEK from typed password. Unwrap key locally. AES-GCM's auth tag means a wrong password simply fails to decrypt. No hashes are stored or compared server-side."
            />
            <FlowRow
              num="3"
              title="Add / Edit Item"
              desc="Encrypt full entry as JSON ({title, username, password...}) with Vault Key + fresh IV. Server checks item_count against item_limit, then atomically inserts row and bumps counter in a single transaction."
            />
            <FlowRow
              num="4"
              title="List & Search"
              desc="Server returns raw ciphertext rows. Browser decrypts them into memory. Search runs completely client-side using Fuse.js over the decrypted objects."
            />
            <FlowRow
              num="5"
              title="Generate Password"
              desc="Pure client-side crypto.getRandomValues over a configurable charset. Never round-trips the server."
            />
            <FlowRow
              num="6"
              title="Forgot Master Password"
              desc="Enter 12 words → derive recovery key → unwrap Vault Key via recovery_wrapped_key → set new master password (re-wraps Vault Key). Entries remain untouched."
            />
            <FlowRow
              num="7"
              title="Change Master Password"
              desc="Same as flow 6 but starting from an unlocked vault. Only the wrapped Vault Key changes, never the individual entries."
            />
            <FlowRow
              num="8"
              title="Account Deletion"
              desc="Clerk user.deleted webhook deletes the users row. Postgres ON DELETE CASCADE handles wiping folders, items, and audit logs instantly. No orphaned data."
            />
            <FlowRow
              num="9"
              title="Brute-Force Protection"
              desc="Unlock attempts are rate-limited in Upstash Redis (keyed by user id) to keep the hot path fast and the database clean from failed attempt logs."
            />
          </div>
        </section>
      </div>
    </div>
  );
}

// --- Micro Components for Readability & Reusability ---

function SectionHeading({
  title,
  icon,
}: {
  title: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="p-2 bg-zinc-900 rounded-lg border border-zinc-800 text-zinc-400">
        {React.cloneElement(
          icon as React.ReactElement<{ className?: string }>,
          { className: "w-5 h-5" },
        )}
      </div>
      <h2 className="text-2xl font-semibold text-zinc-100 tracking-tight">
        {title}
      </h2>
    </div>
  );
}

function StackCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="p-5 rounded-xl border border-zinc-800/80 bg-zinc-900/10">
      <h3 className="text-sm font-semibold text-zinc-200 mb-2">{title}</h3>
      <p className="text-sm text-zinc-400 leading-relaxed">{desc}</p>
    </div>
  );
}

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
      className={`min-w-[140px] md:min-w-[160px] p-4 rounded-lg border text-center transition-colors ${
        highlight
          ? "border-zinc-500 bg-zinc-800/50"
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
    <div className="flex flex-col items-center px-2 py-4 md:py-0">
      {label && (
        <span className="text-[10px] text-zinc-500 font-mono mb-2 uppercase text-center">
          {label}
        </span>
      )}
      <ArrowRight className="w-4 h-4 text-zinc-600 rotate-90 md:rotate-0" />
    </div>
  );
}

function ListItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <div className="w-1.5 h-1.5 rounded-full bg-zinc-600 mt-2 shrink-0" />
      <span className="leading-snug">{children}</span>
    </li>
  );
}

function FlowRow({
  num,
  title,
  desc,
}: {
  num: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 p-5 rounded-xl border border-zinc-800/50 bg-zinc-900/10 hover:bg-zinc-900/30 transition-colors">
      <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-zinc-800 text-xs font-mono text-zinc-300 font-medium">
        {num}
      </div>
      <div>
        <h3 className="text-base font-medium text-zinc-100 mb-2">{title}</h3>
        <p className="text-sm text-zinc-400 leading-relaxed max-w-[70ch]">
          {desc}
        </p>
      </div>
    </div>
  );
}
