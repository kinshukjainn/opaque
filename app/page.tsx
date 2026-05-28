"use client";

import { motion, Variants, Transition } from "framer-motion";
import {
  Lock,
  Shield,
  Server,
  ArrowRight,
  Key,
  Fingerprint,
  Database,
  Code2,
  Globe,
  Zap,
  Unlock,
  Activity,
  KeyRound,
} from "lucide-react";
import Link from "next/link";
import { Show, useUser } from "@clerk/nextjs";

export default function Home() {
  const { user } = useUser();

  const springTransition: Transition = {
    type: "spring",
    stiffness: 100,
    damping: 20,
    mass: 1,
  };

  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: springTransition },
  };

  const stagger: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  return (
    <main className="relative min-h-screen bg-[#000000] text-[#E2E2E2] selection:bg-[#A8C7FA] selection:text-[#041E49] overflow-x-hidden pb-32 ">
      {/* Background Glow - Pixel Blue Tint */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-[radial-gradient(ellipse_100%_80%_at_50%_-20%,rgba(168,199,250,0.08),transparent)] pointer-events-none -z-10" />

      {/* ========================================== */}
      {/* LOGGED IN VIEW: The Personalized Launchpad   */}
      {/* ========================================== */}
      <Show when="signed-in">
        <section className="relative pt-40 px-4 sm:px-6 max-w-4xl mx-auto flex flex-col items-center text-center z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="flex flex-col items-center w-full"
          >
            <motion.div variants={fadeUp} className="mb-6">
              <div className="w-20 h-20 rounded-full bg-[#1E1F20] flex items-center justify-center text-[#A8C7FA] shadow-[0_0_40px_-10px_rgba(168,199,250,0.2)]">
                <KeyRound className="w-10 h-10" />
              </div>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#E2E2E2] mb-4"
            >
              Welcome back, {user?.firstName || "Secure User"}.
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-lg text-[#8E918F] max-w-xl mb-10"
            >
              Your encrypted session is ready. Your master key remains
              completely isolated in this browser instance.
            </motion.p>

            <motion.div variants={fadeUp} className="w-full max-w-sm mb-16">
              <Link
                href="/vault"
                className="group w-full py-4 px-8 flex items-center justify-center gap-3 rounded-full bg-[#A8C7FA] text-[#041E49] font-semibold hover:bg-[#b9d3fc] transition-all shadow-[0_4px_20px_-5px_rgba(168,199,250,0.4)] transform hover:scale-[1.02] active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#A8C7FA] focus:ring-offset-2 focus:ring-offset-[#000000]"
              >
                <Unlock className="w-5 h-5 text-[#041E49]" />
                Unlock Vault
              </Link>
            </motion.div>

            {/* Status Cards */}
            <motion.div
              variants={stagger}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full"
            >
              <motion.div
                variants={fadeUp}
                className="p-5 rounded-[28px] bg-[#131314] hover:bg-[#1E1F20] transition-colors flex items-center gap-4 text-left border border-[#282A2C]/50"
              >
                <div className="p-3.5 rounded-full bg-[#1E1F20] text-[#C4EDD0]">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-[15px] font-medium text-[#E2E2E2]">
                    System Status
                  </h3>
                  <p className="text-[13px] text-[#8E918F] mt-0.5">
                    All systems operational
                  </p>
                </div>
              </motion.div>

              <motion.div
                variants={fadeUp}
                className="p-5 rounded-[28px] bg-[#131314] hover:bg-[#1E1F20] transition-colors flex items-center gap-4 text-left border border-[#282A2C]/50"
              >
                <div className="p-3.5 rounded-full bg-[#1E1F20] text-[#EADDFF]">
                  <Code2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-[15px] font-medium text-[#E2E2E2]">
                    Encryption Standard
                  </h3>
                  <p className="text-[13px] text-[#8E918F] mt-0.5">
                    AES-256-GCM enforced
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </section>
      </Show>

      {/* ========================================== */}
      {/* LOGGED OUT VIEW: The Marketing Landing Page  */}
      {/* ========================================== */}
      <Show when="signed-out">
        {/* 1. HERO SECTION */}
        <section className="relative pt-32 px-4 sm:px-6 max-w-5xl mx-auto flex flex-col items-center text-center z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="flex flex-col items-center w-full"
          >
            <motion.a
              variants={fadeUp}
              href="#features"
              className="group mb-8 inline-flex items-center gap-2 px-5 py-2 rounded-full border border-[#282A2C] bg-[#131314] text-[13px] font-medium text-[#C4C7C5] hover:text-[#E2E2E2] hover:bg-[#1E1F20] transition-all shadow-sm"
            >
              <Shield className="w-4 h-4 text-[#A8C7FA]" />
              <span>End-to-End Encrypted</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </motion.a>

            <motion.h1
              variants={fadeUp}
              className="mb-6 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold leading-tight tracking-tight text-[#E2E2E2] md:leading-[1.1]"
            >
              The EndVault <br className="hidden md:block" />
              <span className="text-red-500">can&apos;t read</span> your
              passwords.
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-lg md:text-xl text-[#8E918F] max-w-2xl mb-12 tracking-tight"
            >
              Remember just one master password. We lock up the rest in a vault
              so secure, even we don&apos;t have the key to open it.
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
            >
              <Link
                href="/vault"
                className="py-4 px-8 flex items-center justify-center gap-2 rounded-full bg-[#A8C7FA] text-[#041E49] font-semibold text-[16px] hover:bg-[#b9d3fc] transition-all transform hover:scale-[1.02] active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#A8C7FA] focus:ring-offset-2 focus:ring-offset-[#000000]"
              >
                Get Started Free <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="#architecture"
                className="py-4 px-8 flex items-center justify-center rounded-full bg-[#131314] text-[#E2E2E2] font-medium text-[16px] hover:bg-[#1E1F20] border border-[#282A2C] transition-colors"
              >
                How it works
              </Link>
            </motion.div>
          </motion.div>

          {/* Abstract UI Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, ...springTransition }}
            className="mt-20 w-full max-w-4xl mx-auto rounded-[32px] bg-[#131314] border border-[#282A2C] shadow-2xl overflow-hidden"
          >
            {/* Mockup Header */}
            <div className="h-14 border-b border-[#282A2C] flex items-center px-6 gap-2 bg-[#131314]">
              <div className="w-3 h-3 rounded-full bg-[#F2B8B5]" />
              <div className="w-3 h-3 rounded-full bg-[#F9BC05]" />
              <div className="w-3 h-3 rounded-full bg-[#C4EDD0]" />
              <div className="ml-4 px-4 py-1.5 bg-[#1E1F20] rounded-full text-[12px] font-mono text-[#8E918F] flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-[#A8C7FA]" />
                vault.encrypted.session
              </div>
            </div>
            {/* Mockup Body */}
            <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div className="md:col-span-2 space-y-4">
                <div className="h-8 w-1/3 bg-[#1E1F20] rounded-full mb-6" />
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-4 rounded-[24px] bg-[#1E1F20]"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-[#282A2C] flex items-center justify-center">
                          <Key className="w-4 h-4 text-[#A8C7FA]" />
                        </div>
                        <div className="space-y-2">
                          <div className="h-3.5 w-24 bg-[#C4C7C5] rounded-full" />
                          <div className="h-2.5 w-32 bg-[#8E918F] rounded-full" />
                        </div>
                      </div>
                      <div className="hidden sm:block font-mono text-[11px] text-[#8E918F] bg-[#131314] px-3 py-1 rounded-full border border-[#282A2C]">
                        aes-256-gcm
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Server View Side */}
              <div className="md:border-l border-[#282A2C] md:pl-6 space-y-4 pt-6 md:pt-0 border-t md:border-t-0">
                <div className="text-[12px] font-medium text-[#8E918F] uppercase tracking-wider mb-4 pl-2">
                  What we see (Server)
                </div>
                <div className="font-mono text-[12px] text-[#C4C7C5] leading-relaxed break-all bg-[#000000] p-5 rounded-[24px] border border-[#282A2C]">
                  <span className="text-[#8E918F]">{"{"}</span>
                  <br />
                  &nbsp;&nbsp;&quot;id&quot;: &quot;uuid-v4&quot;,
                  <br />
                  &nbsp;&nbsp;&quot;ct&quot;: &quot;U2FsdGVkX19+Z...&quot;,
                  <br />
                  &nbsp;&nbsp;&quot;iv&quot;: &quot;8d7a4f2...&quot;,
                  <br />
                  <span className="text-[#8E918F]">{"}"}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* 2. SIMPLE BENEFITS */}
        <section
          id="features"
          className="relative px-4 sm:px-6 py-28 max-w-5xl mx-auto z-10"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-4">
              <div className="w-14 h-14 rounded-full bg-[#1E1F20] flex items-center justify-center">
                <Zap className="w-7 h-7 text-[#F9BC05]" />
              </div>
              <h3 className="text-[20px] font-medium text-[#E2E2E2]">
                Effortless Logins
              </h3>
              <p className="text-[#8E918F] leading-relaxed text-[15px]">
                Never click &quot;forgot password&quot; again. Save your
                credentials once and log in with a single click across all your
                favorite sites.
              </p>
            </div>
            <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-4">
              <div className="w-14 h-14 rounded-full bg-[#1E1F20] flex items-center justify-center ">
                <Shield className="w-7 h-7 text-[#C4EDD0]" />
              </div>
              <h3 className="text-[20px] font-medium text-[#E2E2E2]">
                Bulletproof Privacy
              </h3>
              <p className="text-[#8E918F] leading-relaxed text-[15px]">
                Your data is encrypted before it ever leaves your computer. If
                our servers are ever breached, hackers get absolutely nothing.
              </p>
            </div>
            <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-4">
              <div className="w-14 h-14 rounded-full bg-[#1E1F20] flex items-center justify-center">
                <Globe className="w-7 h-7 text-[#EADDFF]" />
              </div>
              <h3 className="text-[20px] font-medium text-[#E2E2E2]">
                Access Anywhere
              </h3>
              <p className="text-[#8E918F] leading-relaxed text-[15px]">
                Your vault syncs securely to the cloud. Access your passwords
                instantly from your phone, laptop, or tablet.
              </p>
            </div>
          </div>
        </section>

        {/* 3. ARCHITECTURE BENTO GRID */}
        <section
          id="architecture"
          className="relative px-4 sm:px-6 py-16 max-w-5xl mx-auto z-10"
        >
          <div className="mb-12 text-center md:text-left">
            <h2 className="text-3xl sm:text-4xl font-normal tracking-tight text-[#E2E2E2]">
              Zero-Trust Architecture.
            </h2>
            <p className="text-[#8E918F] mt-4 text-lg max-w-2xl">
              We don&apos;t just promise privacy; we guarantee it with math. Our
              architecture separates authentication from decryption entirely.
            </p>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-4"
          >
            {/* Bento Box 1 - Client Side Crypto (Large) */}
            <motion.div
              variants={fadeUp}
              className="md:col-span-2 md:row-span-1 p-8 rounded-[32px] bg-[#131314] hover:bg-[#1E1F20] border border-[#282A2C] transition-colors relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#A8C7FA]/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
              <Code2 className="w-8 h-8 text-[#A8C7FA] mb-6" />
              <h3 className="text-xl font-medium text-[#E2E2E2] mb-3">
                Local Decryption (Browser-side)
              </h3>
              <p className="text-[15px] text-[#8E918F] max-w-md leading-relaxed mb-8">
                Your Master Password is fed into Argon2id locally to derive a
                Key Encryption Key (KEK). This KEK unwraps your Vault Key
                directly in your browser memory. Your raw password never touches
                the network.
              </p>
              <div className="font-mono text-[12px] md:text-[13px] text-[#C4C7C5] bg-[#000000] p-4 rounded-full border border-[#282A2C] inline-flex items-center gap-3 overflow-x-auto max-w-full">
                <span className="text-[#8E918F]">deriveKey</span>
                <span className="text-[#A8C7FA]">→</span>
                <span>Argon2id(password, salt)</span>
              </div>
            </motion.div>

            {/* Bento Box 2 - Postgres Atomic (Tall) */}
            <motion.div
              variants={fadeUp}
              className="md:col-span-1 md:row-span-2 p-8 rounded-[32px] bg-[#131314] hover:bg-[#1E1F20] border border-[#282A2C] transition-colors flex flex-col"
            >
              <Database className="w-8 h-8 text-[#C4EDD0] mb-6" />
              <h3 className="text-xl font-medium text-[#E2E2E2] mb-3">
                Atomic Database Integrity
              </h3>
              <p className="text-[15px] text-[#8E918F] leading-relaxed flex-grow">
                Adding items triggers strict server-side gatekeeping. Your plan
                limits are verified atomically via CTEs alongside encrypted JSON
                blob inserts, preventing race conditions.
              </p>
              <div className="mt-8 pt-8 border-t border-[#282A2C]">
                <div className="flex items-center justify-between text-[13px] text-[#8E918F] mb-3">
                  <span>Row count</span>
                  <span className="font-mono">{"<"}</span>
                  <span>User limit</span>
                </div>
                <div className="w-full bg-[#000000] h-2 rounded-full overflow-hidden border border-[#282A2C]">
                  <div className="bg-[#C4EDD0] w-1/3 h-full rounded-full" />
                </div>
              </div>
            </motion.div>

            {/* Bento Box 3 - Auth */}
            <motion.div
              variants={fadeUp}
              className="md:col-span-1 md:row-span-1 p-8 rounded-[32px] bg-[#131314] hover:bg-[#1E1F20] border border-[#282A2C] transition-colors"
            >
              <Fingerprint className="w-8 h-8 text-[#EADDFF] mb-6" />
              <h3 className="text-xl font-medium text-[#E2E2E2] mb-3">
                Identity vs. Access
              </h3>
              <p className="text-[15px] text-[#8E918F] leading-relaxed">
                We separate identity from decryption. You log in via Clerk to
                prove who you are, but you still need your Master Key to decrypt
                the payload.
              </p>
            </motion.div>

            {/* Bento Box 4 - Zero Server Knowledge */}
            <motion.div
              variants={fadeUp}
              className="md:col-span-1 md:row-span-1 p-8 rounded-[32px] bg-[#131314] hover:bg-[#1E1F20] border border-[#282A2C] transition-colors"
            >
              <Server className="w-8 h-8 text-[#C4C7C5] mb-6" />
              <h3 className="text-xl font-medium text-[#E2E2E2] mb-3">
                The Blind Server
              </h3>
              <p className="text-[15px] text-[#8E918F] leading-relaxed">
                The database stores only AES-GCM ciphertext, IVs, and wrapped
                keys. Even if compromised, the attacker only gets useless,
                scrambled text.
              </p>
            </motion.div>
          </motion.div>
        </section>
      </Show>
    </main>
  );
}
