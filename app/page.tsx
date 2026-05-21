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
} from "lucide-react";
import HeroGrid from "./components/HeroGrid"; // Adjust this path if needed!

export default function Home() {
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
    // Changed bg-black to bg-transparent here!
    <main className="relative min-h-screen bg-transparent text-zinc-50  selection:bg-zinc-800 selection:text-white overflow-x-hidden pb-32">
      {/* Background Grid */}
      <HeroGrid />

      {/* Soft Hero Spotlight */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-[radial-gradient(ellipse_100%_80%_at_50%_-20%,rgba(255,255,255,0.06),transparent)] pointer-events-none -z-10" />

      {/* Hero Section */}
      <section className="relative pt-32 px-6 max-w-5xl mx-auto flex flex-col items-center text-center z-10">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="flex flex-col items-center w-full"
        >
          <motion.a
            variants={fadeUp}
            href="#"
            className="group mb-8 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-zinc-800/80 bg-zinc-900/30 backdrop-blur-md text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors shadow-lg shadow-black/20"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Secured</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </motion.a>

          <motion.h1
            variants={fadeUp}
            className="text-5xl md:text-7xl font-medium tracking-tighter text-zinc-100 mb-6 leading-[1.1]"
          >
            Security on Top <br className="hidden md:block" />
            <span className="text-zinc-500">Zero knowledge .</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="text-lg text-zinc-400 max-w-2xl mb-10 tracking-tight"
          >
            The server is the gatekeeper, never the pipe. A modern password
            vault where your master key never leaves your browser&apos;s local
            memory.
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
          >
            <button className="h-11 px-8 rounded-md bg-zinc-100 text-black font-medium hover:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-black">
              Initialize Vault
            </button>
            <button className="h-11 px-8 rounded-md bg-zinc-900/20 backdrop-blur-md text-zinc-300 font-medium hover:bg-zinc-900/60 border border-zinc-800/80 transition-colors">
              View Documentation
            </button>
          </motion.div>
        </motion.div>

        {/* Abstract UI Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, ...springTransition }}
          className="mt-20 w-full max-w-4xl mx-auto border border-zinc-800/80 rounded-xl bg-zinc-950/40 backdrop-blur-xl shadow-2xl shadow-black/80 overflow-hidden"
        >
          {/* Mockup Header */}
          <div className="h-12 border-b border-zinc-800/80 flex items-center px-4 gap-2 bg-zinc-900/30">
            <div className="w-3 h-3 rounded-full bg-zinc-800" />
            <div className="w-3 h-3 rounded-full bg-zinc-800" />
            <div className="w-3 h-3 rounded-full bg-zinc-800" />
            <div className="ml-4 px-3 py-1 bg-zinc-800/50 rounded text-[10px] font-mono text-zinc-400 flex items-center gap-2">
              <Lock className="w-3 h-3" />
              vault.encrypted.session
            </div>
          </div>
          {/* Mockup Body */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
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
                        <Key className="w-4 h-4 text-zinc-500" />
                      </div>
                      <div className="space-y-1.5">
                        <div className="h-3 w-24 bg-zinc-700/80 rounded" />
                        <div className="h-2 w-32 bg-zinc-800/80 rounded" />
                      </div>
                    </div>
                    <div className="font-mono text-[10px] text-zinc-600">
                      aes-256-gcm
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Server View Side */}
            <div className="border-l border-zinc-800/80 pl-6 space-y-4 hidden md:block">
              <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-4">
                Server View
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

      {/* Bento Grid Architecture Section */}
      <section className="relative px-6 py-32 max-w-5xl mx-auto z-10">
        <div className="mb-12">
          <h2 className="text-2xl font-medium tracking-tight text-zinc-100">
            Engineered for absolute privacy.
          </h2>
          <p className="text-zinc-400 mt-2">
            The architecture separates authentication from decryption entirely.
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
            className="md:col-span-2 md:row-span-1 p-8 rounded-2xl border border-zinc-800/80 bg-zinc-900/20 backdrop-blur-md relative overflow-hidden group hover:bg-zinc-900/40 transition-colors shadow-xl shadow-black/20"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-zinc-800/20 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
            <Code2 className="w-6 h-6 text-zinc-400 mb-6" />
            <h3 className="text-lg font-medium text-zinc-200 mb-2">
              Local KDF & Decryption
            </h3>
            <p className="text-sm text-zinc-400 max-w-md leading-relaxed mb-6">
              Your Master Password is fed into Argon2id locally to derive a Key
              Encryption Key (KEK). This KEK unwraps your Vault Key directly in
              browser memory.
            </p>
            <div className="font-mono text-xs text-zinc-500 bg-black/40 backdrop-blur-sm p-3 rounded-md border border-zinc-800/50 inline-flex items-center gap-3">
              <span className="text-zinc-300">deriveKey</span>
              <span className="text-zinc-700">→</span>
              <span>Argon2id(password, salt)</span>
            </div>
          </motion.div>

          {/* Bento Box 2 - Postgres Atomic (Tall) */}
          <motion.div
            variants={fadeUp}
            className="md:col-span-1 md:row-span-2 p-8 rounded-2xl border border-zinc-800/80 bg-zinc-900/20 backdrop-blur-md hover:bg-zinc-900/40 transition-colors flex flex-col shadow-xl shadow-black/20"
          >
            <Database className="w-6 h-6 text-zinc-400 mb-6" />
            <h3 className="text-lg font-medium text-zinc-200 mb-2">
              Atomic Integrity
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed flex-grow">
              Adding items triggers strict server-side gatekeeping. Your plan
              limits are verified atomically alongside encrypted JSON blob
              inserts.
            </p>
            <div className="mt-8 pt-8 border-t border-zinc-800/50">
              <div className="flex items-center justify-between text-xs text-zinc-500 mb-2">
                <span>Row count</span>
                <span className="font-mono">===</span>
                <span>User limit</span>
              </div>
              <div className="w-full bg-zinc-800/80 h-1 rounded-full overflow-hidden">
                <div className="bg-zinc-400 w-1/3 h-full rounded-full" />
              </div>
            </div>
          </motion.div>

          {/* Bento Box 3 - Clerk Auth */}
          <motion.div
            variants={fadeUp}
            className="md:col-span-1 md:row-span-1 p-8 rounded-2xl border border-zinc-800/80 bg-zinc-900/20 backdrop-blur-md hover:bg-zinc-900/40 transition-colors shadow-xl shadow-black/20"
          >
            <Fingerprint className="w-6 h-6 text-zinc-400 mb-6" />
            <h3 className="text-lg font-medium text-zinc-200 mb-2">
              Identity vs. Access
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Clerk handles identity. You log in to prove who you are, but the
              server still cannot read your data.
            </p>
          </motion.div>

          {/* Bento Box 4 - Zero Server Knowledge */}
          <motion.div
            variants={fadeUp}
            className="md:col-span-1 md:row-span-1 p-8 rounded-2xl border border-zinc-800/80 bg-zinc-900/20 backdrop-blur-md hover:bg-zinc-900/40 transition-colors shadow-xl shadow-black/20"
          >
            <Server className="w-6 h-6 text-zinc-400 mb-6" />
            <h3 className="text-lg font-medium text-zinc-200 mb-2">
              Blind Server
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              The database stores only AES-GCM ciphertext, IVs, and wrapped
              keys. We are the gatekeeper, not the reader.
            </p>
          </motion.div>
        </motion.div>
      </section>
    </main>
  );
}
