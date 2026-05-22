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
import HeroGrid from "./components/HeroGrid"; // Adjust this path if needed!
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
    <main className="relative min-h-screen bg-transparent text-zinc-50 selection:bg-zinc-800 selection:text-white overflow-x-hidden pb-32">
      {/* Background Grid - Shared for both views */}
      <HeroGrid />
      <div className="absolute top-0 left-0 w-full h-[600px] bg-[radial-gradient(ellipse_100%_80%_at_50%_-20%,rgba(255,255,255,0.06),transparent)] pointer-events-none -z-10" />

      {/* ========================================== */}
      {/* LOGGED IN VIEW: The Personalized Launchpad   */}
      {/* ========================================== */}
      <Show when="signed-in">
        <section className="relative pt-40 px-6 max-w-4xl mx-auto flex flex-col items-center text-center z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="flex flex-col items-center w-full"
          >
            <motion.div variants={fadeUp} className="mb-6">
              <div className="w-16 h-16 rounded-full bg-black flex items-center justify-center border border-white/20 shadow-lg shadow-white/30">
                <KeyRound className="w-8 h-8 text-white" />
              </div>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="text-4xl md:text-5xl font-bold tracking-tighter text-white mb-4"
            >
              Welcome back, {user?.firstName || "Secure User"}.
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-lg text-zinc-400 max-w-xl mb-10"
            >
              Your encrypted session is ready. Your master key remains
              completely isolated in this browser instance.
            </motion.p>

            <motion.div variants={fadeUp} className="w-full max-w-sm mb-16">
              <Link
                href="/vault"
                className="group w-full py-4 px-8 flex items-center justify-center gap-3 rounded-xl bg-zinc-100 text-black font-semibold hover:bg-white transition-all shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-black"
              >
                <Unlock className="w-5 h-5 text-zinc-700 group-hover:text-black transition-colors" />
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
                className="p-5 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-md flex items-center gap-4 text-left"
              >
                <div className="p-3 rounded-full bg-green-500/10 border border-green-500/20">
                  <Activity className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-zinc-200">
                    System Status
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    All systems operational
                  </p>
                </div>
              </motion.div>

              <motion.div
                variants={fadeUp}
                className="p-5 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-md flex items-center gap-4 text-left"
              >
                <div className="p-3 rounded-full bg-purple-500/10 border border-purple-500/20">
                  <Code2 className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-zinc-200">
                    Encryption Standard
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
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
        {/* 1. HERO SECTION: Plain English, Benefit-Driven */}
        <section className="relative pt-32 px-6 max-w-5xl mx-auto flex flex-col items-center text-center z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="flex flex-col items-center w-full"
          >
            <motion.a
              variants={fadeUp}
              href="#features"
              className="group mb-8 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-zinc-800/80 bg-zinc-900/30 backdrop-blur-md text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors shadow-lg shadow-black/20"
            >
              <Shield className="w-3.5 h-3.5 text-blue-400" />
              <span>End-to-End Encrypted</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </motion.a>

            <motion.h1
              variants={fadeUp}
              className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-white mb-6 leading-[1.1]"
            >
              The password manager <br className="hidden md:block" />
              that <span className="text-blue-400">can&apos;t read</span> your
              passwords.
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-lg md:text-xl text-zinc-400 max-w-2xl mb-10 tracking-tight"
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
                className="py-4 px-8 flex items-center justify-center gap-2 rounded-lg bg-zinc-100 text-black font-semibold hover:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-black"
              >
                Get Started Free <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="#architecture"
                className="py-4 px-8 flex items-center justify-center rounded-lg bg-zinc-900/40 backdrop-blur-md text-zinc-300 font-medium hover:bg-zinc-900/80 border border-zinc-800/80 transition-colors"
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
            className="mt-16 w-full max-w-4xl mx-auto border border-zinc-800/80 rounded-xl bg-zinc-950/40 backdrop-blur-xl shadow-2xl shadow-black/80 overflow-hidden"
          >
            {/* Mockup Header */}
            <div className="h-12 border-b border-zinc-800/80 flex items-center px-4 gap-2 bg-zinc-900/30">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
              <div className="ml-4 px-3 py-1 bg-zinc-800/50 rounded text-[10px] font-mono text-zinc-400 flex items-center gap-2">
                <Lock className="w-3 h-3 text-blue-400" />
                vault.encrypted.session
              </div>
            </div>
            {/* Mockup Body */}
            <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div className="md:col-span-2 space-y-4">
                <div className="h-8 w-1/3 bg-zinc-900/80 rounded-md border border-zinc-800/50" />
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-lg border border-zinc-800/50 bg-zinc-900/30 backdrop-blur-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-zinc-800/80 flex items-center justify-center">
                          <Key className="w-4 h-4 text-zinc-400" />
                        </div>
                        <div className="space-y-1.5">
                          <div className="h-3 w-24 bg-zinc-700/80 rounded" />
                          <div className="h-2 w-32 bg-zinc-800/80 rounded" />
                        </div>
                      </div>
                      <div className="hidden sm:block font-mono text-[10px] text-zinc-600">
                        aes-256-gcm
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Server View Side */}
              <div className="border-l border-zinc-800/80 pl-6 space-y-4 hidden md:block">
                <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-4">
                  What we see (Server)
                </div>
                <div className="font-mono text-[10px] text-zinc-600 leading-relaxed break-all bg-black/60 backdrop-blur-md p-4 rounded-lg border border-zinc-900">
                  <span className="text-zinc-400">{"{"}</span>
                  <br />
                  &nbsp;&nbsp;&quot;id&quot;: &quot;uuid-v4&quot;,
                  <br />
                  &nbsp;&nbsp;&quot;ct&quot;: &quot;U2FsdGVkX19+Z...&quot;,
                  <br />
                  &nbsp;&nbsp;&quot;iv&quot;: &quot;8d7a4f2...&quot;,
                  <br />
                  <span className="text-zinc-400">{"}"}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* 2. SIMPLE BENEFITS: For the everyday user */}
        <section
          id="features"
          className="relative px-6 py-24 max-w-5xl mx-auto z-10"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                <Zap className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-zinc-100">
                Effortless Logins
              </h3>
              <p className="text-zinc-400 leading-relaxed">
                Never click &quot;forgot password&quot; again. Save your
                credentials once and log in with a single click across all your
                favorite sites.
              </p>
            </div>
            <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center border border-green-500/20">
                <Shield className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-zinc-100">
                Bulletproof Privacy
              </h3>
              <p className="text-zinc-400 leading-relaxed">
                Your data is encrypted before it ever leaves your computer. If
                our servers are ever breached, hackers get absolutely nothing.
              </p>
            </div>
            <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                <Globe className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-zinc-100">
                Access Anywhere
              </h3>
              <p className="text-zinc-400 leading-relaxed">
                Your vault syncs securely to the cloud. Access your passwords
                instantly from your phone, laptop, or tablet.
              </p>
            </div>
          </div>
        </section>

        {/* 3. ARCHITECTURE BENTO GRID: For the Engineers */}
        <section
          id="architecture"
          className="relative px-6 py-16 max-w-5xl mx-auto z-10 border-t border-zinc-900/50"
        >
          <div className="mb-12 text-center md:text-left">
            <h2 className="text-3xl font-semibold tracking-tight text-zinc-100">
              For the engineers: Zero-Trust Architecture.
            </h2>
            <p className="text-zinc-400 mt-3 text-lg max-w-2xl">
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
              className="md:col-span-2 md:row-span-1 p-6 md:p-8 rounded-2xl border border-zinc-800/80 bg-zinc-900/20 backdrop-blur-md relative overflow-hidden group hover:bg-zinc-900/40 transition-colors shadow-xl shadow-black/20"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-zinc-800/20 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
              <Code2 className="w-6 h-6 text-blue-400 mb-6" />
              <h3 className="text-lg font-medium text-zinc-200 mb-2">
                Local Decryption (Browser-side)
              </h3>
              <p className="text-sm text-zinc-400 max-w-md leading-relaxed mb-6">
                Your Master Password is fed into Argon2id locally to derive a
                Key Encryption Key (KEK). This KEK unwraps your Vault Key
                directly in your browser memory. Your raw password never touches
                the network.
              </p>
              <div className="font-mono text-[10px] md:text-xs text-zinc-500 bg-black/40 backdrop-blur-sm p-3 rounded-md border border-zinc-800/50 inline-flex items-center gap-2 md:gap-3 overflow-x-auto w-full md:w-auto">
                <span className="text-zinc-300">deriveKey</span>
                <span className="text-zinc-700">→</span>
                <span>Argon2id(password, salt)</span>
              </div>
            </motion.div>

            {/* Bento Box 2 - Postgres Atomic (Tall) */}
            <motion.div
              variants={fadeUp}
              className="md:col-span-1 md:row-span-2 p-6 md:p-8 rounded-2xl border border-zinc-800/80 bg-zinc-900/20 backdrop-blur-md hover:bg-zinc-900/40 transition-colors flex flex-col shadow-xl shadow-black/20"
            >
              <Database className="w-6 h-6 text-green-400 mb-6" />
              <h3 className="text-lg font-medium text-zinc-200 mb-2">
                Atomic Database Integrity
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed flex-grow">
                Adding items triggers strict server-side gatekeeping. Your plan
                limits are verified atomically via CTEs alongside encrypted JSON
                blob inserts, preventing race conditions.
              </p>
              <div className="mt-8 pt-8 border-t border-zinc-800/50">
                <div className="flex items-center justify-between text-xs text-zinc-500 mb-2">
                  <span>Row count</span>
                  <span className="font-mono">{"<"}</span>
                  <span>User limit</span>
                </div>
                <div className="w-full bg-zinc-800/80 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-green-400/80 w-1/3 h-full rounded-full" />
                </div>
              </div>
            </motion.div>

            {/* Bento Box 3 - Auth */}
            <motion.div
              variants={fadeUp}
              className="md:col-span-1 md:row-span-1 p-6 md:p-8 rounded-2xl border border-zinc-800/80 bg-zinc-900/20 backdrop-blur-md hover:bg-zinc-900/40 transition-colors shadow-xl shadow-black/20"
            >
              <Fingerprint className="w-6 h-6 text-purple-400 mb-6" />
              <h3 className="text-lg font-medium text-zinc-200 mb-2">
                Identity vs. Access
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                We separate identity from decryption. You log in via Clerk to
                prove who you are, but you still need your Master Key to decrypt
                the payload.
              </p>
            </motion.div>

            {/* Bento Box 4 - Zero Server Knowledge */}
            <motion.div
              variants={fadeUp}
              className="md:col-span-1 md:row-span-1 p-6 md:p-8 rounded-2xl border border-zinc-800/80 bg-zinc-900/20 backdrop-blur-md hover:bg-zinc-900/40 transition-colors shadow-xl shadow-black/20"
            >
              <Server className="w-6 h-6 text-zinc-400 mb-6" />
              <h3 className="text-lg font-medium text-zinc-200 mb-2">
                The Blind Server
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
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
