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
    <div className="min-h-screen bg-[#000000] text-[#E2E2E2] selection:bg-[#A8C7FA] selection:text-[#041E49] py-24 px-4 sm:px-6 ">
      <div className="max-w-5xl mx-auto space-y-24">
        {/* Header */}
        <header className="space-y-6 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-[#282A2C] bg-[#1E1F20] text-[14px] font-medium text-[#C4C7C5] mb-2 shadow-sm">
            <Shield className="w-4 h-4 text-[#A8C7FA]" />
            System Architecture
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[#E2E2E2]">
            Zero-Knowledge Design
          </h1>
          <p className="text-lg md:text-xl text-[#8E918F] max-w-2xl leading-relaxed mx-auto md:mx-0">
            The core philosophy of this application relies on a strict
            separation between authentication (identity) and decryption
            (access). The server acts solely as a gatekeeper and never as the
            pipe.
          </p>
        </header>

        {/* Section 1: The Two Layers */}
        <section className="space-y-10">
          <div>
            <h2 className="text-3xl font-normal text-[#E2E2E2] mb-3">
              The Dual Trust Boundary
            </h2>
            <p className="text-[#8E918F] text-lg max-w-3xl leading-relaxed">
              Internalizing that these layers are entirely independent is what
              stops insecure design. The server can confirm Layer 1 all day, but
              it has no way to ever observe Layer 2.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="p-8 md:p-10 rounded-[32px] border border-[#282A2C] bg-[#131314] hover:bg-[#1E1F20] transition-colors">
              <div className="w-14 h-14 rounded-full bg-[#1E1F20] flex items-center justify-center mb-6 shadow-sm">
                <UserCheck className="w-6 h-6 text-[#A8C7FA]" />
              </div>
              <h3 className="text-xl font-medium text-[#E2E2E2] mb-2">
                Layer 1: Clerk Session
              </h3>
              <p className="text-[12px] font-mono font-semibold text-[#8E918F] mb-5 uppercase tracking-wider bg-[#000000] inline-block px-3 py-1 rounded-full border border-[#282A2C]">
                &quot;Is this person logged in?&quot;
              </p>
              <p className="text-[15px] text-[#C4C7C5] leading-relaxed">
                Handled by Clerk. This dictates if the user can make HTTP
                requests to your server. The server verifies the JWT and knows
                the user&apos;s identity, plan tier, and account limits.
              </p>
            </div>

            <div className="p-8 md:p-10 rounded-[32px] border border-[#282A2C] bg-[#131314] hover:bg-[#1E1F20] transition-colors">
              <div className="w-14 h-14 rounded-full bg-[#1E1F20] flex items-center justify-center mb-6 shadow-sm">
                <Key className="w-6 h-6 text-[#F9BC05]" />
              </div>
              <h3 className="text-xl font-medium text-[#E2E2E2] mb-2">
                Layer 2: Vault Unlock
              </h3>
              <p className="text-[12px] font-mono font-semibold text-[#8E918F] mb-5 uppercase tracking-wider bg-[#000000] inline-block px-3 py-1 rounded-full border border-[#282A2C]">
                &quot;Is the vault decrypted right now?&quot;
              </p>
              <p className="text-[15px] text-[#C4C7C5] leading-relaxed">
                Handled locally in the browser. The Vault Key exists purely in
                volatile memory, derived from the Master Password. A logged-in
                Clerk user with a locked vault can do nothing with their data.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: User Lifecycle (State Machine) */}
        <section className="space-y-10 border-t border-[#282A2C] pt-20">
          <div>
            <h2 className="text-3xl font-normal text-[#E2E2E2] mb-3">
              User Lifecycle (State Machine)
            </h2>
            <p className="text-[#8E918F] text-lg max-w-3xl leading-relaxed">
              Because a Clerk user exists before the vault does, the application
              gates access based on the{" "}
              <code className="text-[#A8C7FA] bg-[#041E49] px-2 py-0.5 rounded-md text-sm border border-[#1a386b]">
                vault_initialized
              </code>{" "}
              database flag.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row items-center gap-4 bg-[#131314] border border-[#282A2C] rounded-[40px] p-8 md:p-12 overflow-x-auto">
            <StateNode title="Anonymous" desc="No Session" />
            <Arrow />
            <StateNode
              title="Logged In"
              desc="vault_initialized = false"
              highlight
            />
            <Arrow label="Setup Flow" />
            <div className="flex flex-col gap-5 p-6 border border-[#282A2C] rounded-[32px] bg-[#000000]">
              <StateNode title="Vault Locked" desc="Key NOT in memory" />
              <div className="flex items-center justify-center gap-2 text-[12px] text-[#8E918F] font-mono font-medium">
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

        {/* Section 3: Server Visibility (Can vs Cannot See) */}
        <section className="space-y-10 border-t border-[#282A2C] pt-20">
          <div>
            <h2 className="text-3xl font-normal text-[#E2E2E2] mb-3">
              Server Visibility Spec
            </h2>
            <p className="text-[#8E918F] text-lg max-w-3xl leading-relaxed">
              Exactly what the Postgres database and your Node/Next.js backend
              can and cannot observe.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="bg-[#131314] p-8 md:p-10 rounded-[32px] border border-[#282A2C]">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-full bg-[#0F5223] flex items-center justify-center text-[#C4EDD0]">
                  <Eye className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-medium text-[#E2E2E2]">
                  Server Can See
                </h3>
              </div>
              <ul className="space-y-4 text-[15px] text-[#C4C7C5]">
                <ListItem>User Identity (via Clerk JWT)</ListItem>
                <ListItem>Total item count (for plan limits)</ListItem>
                <ListItem>When items were created/updated</ListItem>
                <ListItem>Item type (Login, Note, Card)</ListItem>
                <ListItem>Favorite flag status</ListItem>
                <ListItem>Subscription plan tier</ListItem>
              </ul>
            </div>

            <div className="bg-[#131314] p-8 md:p-10 rounded-[32px] border border-[#282A2C]">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-full bg-[#601410] flex items-center justify-center text-[#F2B8B5]">
                  <EyeOff className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-medium text-[#E2E2E2]">
                  Server Cannot See
                </h3>
              </div>
              <ul className="space-y-4 text-[15px] text-[#C4C7C5]">
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
        <section className="space-y-10 border-t border-[#282A2C] pt-20">
          <div>
            <h2 className="text-3xl font-normal text-[#E2E2E2] mb-3">
              Core Operational Flows
            </h2>
            <p className="text-[#8E918F] text-lg max-w-3xl leading-relaxed">
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
      className={`min-w-[180px] p-5 rounded-[28px] border text-center transition-colors shadow-sm ${
        highlight
          ? "border-[#A8C7FA] bg-[#A8C7FA]/10"
          : "border-[#282A2C] bg-[#1E1F20]"
      }`}
    >
      <div
        className={`text-[15px] font-medium ${highlight ? "text-[#A8C7FA]" : "text-[#E2E2E2]"}`}
      >
        {title}
      </div>
      <div
        className={`text-[13px] mt-1.5 ${highlight ? "text-[#a8c7fa]/70" : "text-[#8E918F]"}`}
      >
        {desc}
      </div>
    </div>
  );
}

function Arrow({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center px-4 py-2">
      {label && (
        <span className="text-[11px] text-[#8E918F] font-mono font-medium mb-2 uppercase tracking-wider">
          {label}
        </span>
      )}
      <ArrowRight className="w-5 h-5 text-[#8E918F]" />
    </div>
  );
}

function ListItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <div className="w-1.5 h-1.5 rounded-full bg-[#8E918F] mt-2 shrink-0" />
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
    <div className="p-6 md:p-8 rounded-[32px] border border-[#282A2C] bg-[#131314] hover:bg-[#1E1F20] transition-colors group">
      <div className="w-12 h-12 rounded-full bg-[#1E1F20] group-hover:bg-[#282A2C] flex items-center justify-center text-[#A8C7FA] mb-5 transition-colors">
        {React.cloneElement(
          icon as React.ReactElement<{ className?: string }>,
          { className: "w-5 h-5" },
        )}
      </div>
      <h3 className="text-[17px] font-medium text-[#E2E2E2] mb-3">{title}</h3>
      <p className="text-[14px] text-[#8E918F] leading-relaxed">{desc}</p>
    </div>
  );
}
