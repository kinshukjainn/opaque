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
    <main className="relative min-h-screen bg-[#000000] text-[#E2E2E2] selection:bg-[#A8C7FA] selection:text-[#041E49] overflow-x-hidden pb-20 md:pb-32">
      {/* Background Glow - Adaptive height based on viewport */}
      <div className="absolute top-0 left-0 w-full h-[50vh] min-h-[400px] md:h-[600px] bg-[radial-gradient(ellipse_100%_80%_at_50%_-20%,rgba(168,199,250,0.08),transparent)] pointer-events-none -z-10" />

      {/* ========================================== */}
      {/* LOGGED IN VIEW: The Personalized Launchpad   */}
      {/* ========================================== */}
      <Show when="signed-in">
        <section className="relative pt-32 md:pt-40 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto flex flex-col items-center text-center z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="flex flex-col items-center w-full"
          >
            <motion.div variants={fadeUp} className="mb-6">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#1E1F20] flex items-center justify-center text-[#A8C7FA] shadow-[0_0_40px_-10px_rgba(168,199,250,0.2)]">
                <KeyRound className="w-8 h-8 md:w-10 md:h-10" />
              </div>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#E2E2E2] mb-4 px-2"
            >
              Welcome back, {user?.firstName || "Secure User"}.
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-base sm:text-lg text-[#8E918F] max-w-xl mb-10 px-4"
            >
              Your encrypted session is ready. Your master key remains
              completely isolated in this browser instance.
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="w-full max-w-sm mb-12 md:mb-16 px-4"
            >
              <Link
                href="/vault"
                className="group w-full py-3.5 md:py-4 px-8 flex items-center justify-center gap-3 rounded-full bg-[#A8C7FA] text-[#041E49] font-semibold hover:bg-[#b9d3fc] transition-all shadow-[0_4px_20px_-5px_rgba(168,199,250,0.4)] transform hover:scale-[1.02] active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#A8C7FA] focus:ring-offset-2 focus:ring-offset-[#000000]"
              >
                <Unlock className="w-5 h-5 text-[#041E49]" />
                Unlock Vault
              </Link>
            </motion.div>

            {/* Status Cards */}
            <motion.div
              variants={stagger}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full px-2 sm:px-0"
            >
              <motion.div
                variants={fadeUp}
                className="p-4 md:p-5 rounded-[24px] md:rounded-[28px] bg-[#131314] hover:bg-[#1E1F20] transition-colors flex items-center gap-4 text-left border border-[#282A2C]/50"
              >
                <div className="p-3 md:p-3.5 rounded-full bg-[#1E1F20] text-[#C4EDD0]">
                  <Activity className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div>
                  <h3 className="text-[14px] md:text-[15px] font-medium text-[#E2E2E2]">
                    System Status
                  </h3>
                  <p className="text-[12px] md:text-[13px] text-[#8E918F] mt-0.5">
                    All systems operational
                  </p>
                </div>
              </motion.div>

              <motion.div
                variants={fadeUp}
                className="p-4 md:p-5 rounded-[24px] md:rounded-[28px] bg-[#131314] hover:bg-[#1E1F20] transition-colors flex items-center gap-4 text-left border border-[#282A2C]/50"
              >
                <div className="p-3 md:p-3.5 rounded-full bg-[#1E1F20] text-[#EADDFF]">
                  <Code2 className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div>
                  <h3 className="text-[14px] md:text-[15px] font-medium text-[#E2E2E2]">
                    Encryption Standard
                  </h3>
                  <p className="text-[12px] md:text-[13px] text-[#8E918F] mt-0.5">
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
        <section className="relative pt-24 sm:pt-32 lg:pt-40 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto flex flex-col items-center text-center z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="flex flex-col items-center w-full"
          >
            <motion.a
              variants={fadeUp}
              href="/docs/zero-knowledge-model"
              className="group mb-6 md:mb-8 inline-flex items-center gap-2 px-4 py-1.5 md:px-5 md:py-2 rounded-full border border-[#282A2C] bg-[#131314] text-[12px] md:text-[13px] font-medium text-[#C4C7C5] hover:text-[#E2E2E2] hover:bg-[#1E1F20] transition-all shadow-sm max-w-full overflow-hidden"
            >
              <Shield className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#A8C7FA] flex-shrink-0" />
              <span className="truncate">End-to-End Encrypted</span>
              <ArrowRight className="w-3 h-3 md:w-3.5 md:h-3.5 flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
            </motion.a>

            {/* Replaced invalid nested <h1> with a clean <span> structure */}
            <motion.h1
              variants={fadeUp}
              className="mb-6 md:mb-8 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold leading-tight md:leading-[1.1] tracking-tight bg-clip-text text-transparent bg-[linear-gradient(to_right,#4285F4,#EA4335,#FBBC05,#34A853)]"
            >
              Secure your digital life,{" "}
              <span className="relative inline-block text-white font-extrabold tracking-tight">
                {/* Invisible Ghost for layout spacing */}
                <span className="opacity-0 pointer-events-none">
                  invisibly.
                </span>

                {/* Sweeping Cursor Animation */}
                <motion.span
                  className="absolute left-0 top-0 overflow-hidden whitespace-nowrap border-r-[0.15em] border-white text-gray-400 pr-1"
                  animate={{
                    width: ["100%", "0%", "0%", "100%", "100%"],
                  }}
                  transition={{
                    duration: 5,
                    ease: "easeInOut",
                    repeat: Infinity,
                    times: [0, 0.4, 0.5, 0.9, 1],
                  }}
                >
                  invisibly.
                </motion.span>
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-base sm:text-lg md:text-xl text-[#8E918F] max-w-2xl mb-10 md:mb-12 tracking-tight px-2"
            >
              Opaque locks your credentials behind true zero-knowledge
              encryption. No trackers, no plaintext, no compromises.
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="flex flex-col sm:flex-row gap-3 md:gap-4 w-full sm:w-auto px-4 sm:px-0"
            >
              <Link
                href="/vault"
                className="py-3.5 md:py-4 px-6 md:px-8 flex items-center justify-center gap-2 rounded-full bg-[#A8C7FA] text-[#041E49] font-semibold text-[15px] md:text-[16px] hover:bg-[#b9d3fc] transition-all transform hover:scale-[1.02] active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#A8C7FA] focus:ring-offset-2 focus:ring-offset-[#000000] w-full sm:w-auto"
              >
                Get Started Free{" "}
                <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
              </Link>
              <Link
                href="#architecture"
                className="py-3.5 md:py-4 px-6 md:px-8 flex items-center justify-center rounded-full bg-[#131314] text-[#E2E2E2] font-medium text-[15px] md:text-[16px] hover:bg-[#1E1F20] border border-[#282A2C] transition-colors w-full sm:w-auto"
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
            className="mt-16 md:mt-20 w-full max-w-4xl mx-auto rounded-[24px] md:rounded-[32px] bg-[#131314] border border-[#282A2C] shadow-2xl overflow-hidden"
          >
            {/* Mockup Header */}
            <div className="h-12 md:h-14 border-b border-[#282A2C] flex items-center px-4 md:px-6 gap-2 bg-[#131314] overflow-x-auto">
              <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-[#F2B8B5] flex-shrink-0" />
              <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-[#F9BC05] flex-shrink-0" />
              <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-[#C4EDD0] flex-shrink-0" />
              <div className="ml-2 md:ml-4 px-3 py-1 md:px-4 md:py-1.5 bg-[#1E1F20] rounded-full text-[10px] md:text-[12px] font-mono text-[#8E918F] flex items-center gap-2 whitespace-nowrap">
                <Lock className="w-3 h-3 md:w-3.5 md:h-3.5 text-[#A8C7FA]" />
                vault.encrypted.session
              </div>
            </div>

            {/* Mockup Body */}
            <div className="p-4 md:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
              <div className="lg:col-span-2 space-y-4">
                <div className="h-6 md:h-8 w-1/2 md:w-1/3 bg-[#1E1F20] rounded-full mb-4 md:mb-6" />
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 md:p-4 rounded-[20px] md:rounded-[24px] bg-[#1E1F20]"
                    >
                      <div className="flex items-center gap-3 md:gap-4 flex-1">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#282A2C] flex items-center justify-center flex-shrink-0">
                          <Key className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#A8C7FA]" />
                        </div>
                        <div className="space-y-2 flex-1 w-full max-w-[200px]">
                          {/* Replaced hard pixel widths with percentages for fluidity */}
                          <div className="h-2.5 md:h-3.5 w-[60%] bg-[#C4C7C5] rounded-full" />
                          <div className="h-2 md:h-2.5 w-[80%] bg-[#8E918F] rounded-full" />
                        </div>
                      </div>
                      <div className="hidden sm:block font-mono text-[10px] md:text-[11px] text-[#8E918F] bg-[#131314] px-3 py-1 rounded-full border border-[#282A2C] flex-shrink-0">
                        aes-256-gcm
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Server View Side */}
              <div className="lg:border-l border-[#282A2C] lg:pl-6 space-y-3 md:space-y-4 pt-4 lg:pt-0 border-t lg:border-t-0">
                <div className="text-[11px] md:text-[12px] font-medium text-[#8E918F] uppercase tracking-wider mb-2 md:mb-4 pl-1 md:pl-2">
                  What we see (Server)
                </div>
                <div className="font-mono text-[11px] md:text-[12px] text-[#C4C7C5] leading-relaxed break-all bg-[#000000] p-4 md:p-5 rounded-[20px] md:rounded-[24px] border border-[#282A2C] overflow-x-auto">
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
          className="relative px-4 sm:px-6 lg:px-8 py-20 md:py-28 max-w-6xl mx-auto z-10"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-3 md:space-y-4">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#1E1F20] flex items-center justify-center flex-shrink-0">
                <Zap className="w-6 h-6 md:w-7 md:h-7 text-[#ff9100]" />
              </div>
              <h3 className="text-[18px] md:text-[20px] font-semibold text-[#E2E2E2]">
                Effortless Logins
              </h3>
              <p className="text-[#8E918F] leading-relaxed text-[14px] md:text-[15px]">
                Never click &quot;forgot password&quot; again. Save your
                credentials once and log in with a single click across all your
                favorite sites.
              </p>
            </div>
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-3 md:space-y-4">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#1E1F20] flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 md:w-7 md:h-7 text-[#ff9100]" />
              </div>
              <h3 className="text-[18px] md:text-[20px] font-semibold text-[#E2E2E2]">
                Bulletproof Privacy
              </h3>
              <p className="text-[#8E918F] leading-relaxed text-[14px] md:text-[15px]">
                Your data is encrypted before it ever leaves your computer. If
                our servers are ever breached, hackers get absolutely nothing.
              </p>
            </div>
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-3 md:space-y-4 sm:col-span-2 lg:col-span-1 sm:max-w-md sm:mx-auto lg:max-w-none">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#1E1F20] flex items-center justify-center flex-shrink-0">
                <Globe className="w-6 h-6 md:w-7 md:h-7 text-[#ff9100]" />
              </div>
              <h3 className="text-[18px] md:text-[20px] font-semibold text-[#E2E2E2]">
                Access Anywhere
              </h3>
              <p className="text-[#8E918F] leading-relaxed text-[14px] md:text-[15px]">
                Your vault syncs securely to the cloud. Access your passwords
                instantly from your phone, laptop, or tablet.
              </p>
            </div>
          </div>
        </section>

        {/* 3. ARCHITECTURE BENTO GRID */}
        <section
          id="architecture"
          className="relative px-4 sm:px-6 lg:px-8 py-10 md:py-16 max-w-6xl mx-auto z-10"
        >
          <div className="mb-8 md:mb-12 text-center lg:text-left">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#E2E2E2]">
              Zero-Trust Architecture.
            </h2>
            <p className="text-[#8E918F] mt-3 md:mt-4 text-base md:text-lg max-w-2xl mx-auto lg:mx-0">
              We don&apos;t just promise privacy; we guarantee it with math. Our
              architecture separates authentication from decryption entirely.
            </p>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 lg:grid-rows-2 gap-4 md:gap-6"
          >
            {/* Bento Box 1 - Client Side Crypto (Large) */}
            <motion.div
              variants={fadeUp}
              className="md:col-span-2 lg:col-span-2 lg:row-span-1 p-6 md:p-8 rounded-[28px] md:rounded-[32px] bg-[#131314] hover:bg-[#1E1F20] border border-[#282A2C] transition-colors relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-48 h-48 md:w-64 md:h-64 bg-[#A8C7FA]/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
              <Code2 className="w-7 h-7 md:w-8 md:h-8 text-[#A8C7FA] mb-5 md:mb-6" />
              <h3 className="text-lg md:text-xl font-medium text-[#E2E2E2] mb-2 md:mb-3">
                Local Decryption (Browser-side)
              </h3>
              <p className="text-[14px] md:text-[15px] text-[#8E918F] max-w-md leading-relaxed mb-6 md:mb-8">
                Your Master Password is fed into Argon2id locally to derive a
                Key Encryption Key (KEK). This KEK unwraps your Vault Key
                directly in your browser memory. Your raw password never touches
                the network.
              </p>
              <div className="font-mono text-[11px] md:text-[13px] text-[#C4C7C5] bg-[#000000] p-3 md:p-4 rounded-xl md:rounded-full border border-[#282A2C] inline-flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 overflow-x-auto max-w-full">
                <span className="text-[#8E918F]">deriveKey</span>
                <span className="text-[#A8C7FA] hidden sm:inline">→</span>
                <span className="text-[#A8C7FA] sm:hidden">↓</span>
                <span className="whitespace-nowrap">
                  Argon2id(password, salt)
                </span>
              </div>
            </motion.div>

            {/* Bento Box 2 - Postgres Atomic (Tall) */}
            <motion.div
              variants={fadeUp}
              className="md:col-span-1 lg:col-span-1 lg:row-span-2 p-6 md:p-8 rounded-[28px] md:rounded-[32px] bg-[#131314] hover:bg-[#1E1F20] border border-[#282A2C] transition-colors flex flex-col"
            >
              <Database className="w-7 h-7 md:w-8 md:h-8 text-[#C4EDD0] mb-5 md:mb-6" />
              <h3 className="text-lg md:text-xl font-medium text-[#E2E2E2] mb-2 md:mb-3">
                Atomic Database Integrity
              </h3>
              <p className="text-[14px] md:text-[15px] text-[#8E918F] leading-relaxed flex-grow">
                Adding items triggers strict server-side gatekeeping. Your plan
                limits are verified atomically via CTEs alongside encrypted JSON
                blob inserts, preventing race conditions.
              </p>
              <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-[#282A2C]">
                <div className="flex items-center justify-between text-[12px] md:text-[13px] text-[#8E918F] mb-2 md:mb-3">
                  <span>Row count</span>
                  <span className="font-mono">{"<"}</span>
                  <span>User limit</span>
                </div>
                <div className="w-full bg-[#000000] h-2 md:h-2.5 rounded-full overflow-hidden border border-[#282A2C]">
                  <div className="bg-[#C4EDD0] w-1/3 h-full rounded-full" />
                </div>
              </div>
            </motion.div>

            {/* Bento Box 3 - Auth */}
            <motion.div
              variants={fadeUp}
              className="md:col-span-1 lg:col-span-1 p-6 md:p-8 rounded-[28px] md:rounded-[32px] bg-[#131314] hover:bg-[#1E1F20] border border-[#282A2C] transition-colors"
            >
              <Fingerprint className="w-7 h-7 md:w-8 md:h-8 text-[#EADDFF] mb-5 md:mb-6" />
              <h3 className="text-lg md:text-xl font-medium text-[#E2E2E2] mb-2 md:mb-3">
                Identity vs. Access
              </h3>
              <p className="text-[14px] md:text-[15px] text-[#8E918F] leading-relaxed">
                We separate identity from decryption. You log in via Clerk to
                prove who you are, but you still need your Master Key to decrypt
                the payload.
              </p>
            </motion.div>

            {/* Bento Box 4 - Zero Server Knowledge */}
            <motion.div
              variants={fadeUp}
              className="md:col-span-1 lg:col-span-1 p-6 md:p-8 rounded-[28px] md:rounded-[32px] bg-[#131314] hover:bg-[#1E1F20] border border-[#282A2C] transition-colors"
            >
              <Server className="w-7 h-7 md:w-8 md:h-8 text-[#C4C7C5] mb-5 md:mb-6" />
              <h3 className="text-lg md:text-xl font-medium text-[#E2E2E2] mb-2 md:mb-3">
                The Blind Server
              </h3>
              <p className="text-[14px] md:text-[15px] text-[#8E918F] leading-relaxed">
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
