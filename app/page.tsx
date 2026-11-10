"use client";

import { motion, Variants, Transition } from "framer-motion";
import { Shield, Unlock, Check, X, Key, Lock } from "lucide-react";
import Link from "next/link";
import { Show, useUser } from "@clerk/nextjs";
import Opaquesvganim from "./components/Opaquesvganim";
import Privacythemesvg from "./components/Privacythemesvg";
import Securedatasvg from "./components/Securedatasvg";
import Welcomeloginsvg from "./components/Welcomeloginsvg";
import { MatGridBackground } from "./components/MatGridBackground";

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
    <main className="relative min-h-screen w-full overflow-x-hidden">
      {/* ========================================== */}
      {/* Matte grid background (fixed, -z-10)       */}
      {/* ========================================== */}
      <MatGridBackground />

      {/* ========================================== */}
      {/* LOGGED IN VIEW: The Technical Console      */}
      {/* ========================================== */}
      <Show when="signed-in">
        <div className="min-h-screen w-full flex items-center justify-center overflow-hidden relative border-none">
          <section className="relative z-10 px-4 sm:px-6 w-full max-w-3xl mx-auto flex flex-col items-center text-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="flex flex-col items-center w-full"
            >
              {/* Logo (Borderless) */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, ...springTransition }}
              >
                <div className="w-full relative flex items-center justify-center">
                  <Welcomeloginsvg />
                </div>
              </motion.div>

              {/* Typography */}
              <motion.h1
                variants={fadeUp}
                className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-black dark:text-white mb-5 px-2"
              >
                Hey , <br className="sm:hidden" />
                <span className="text-black dark:text-white font-extrabold pb-1">
                  @{user?.firstName || "Secure User"}
                  {user?.lastName || ""}
                </span>
                .
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="text-gray-600 dark:text-gray-400 text-lg sm:text-xl mb-12 max-w-lg mx-auto leading-relaxed"
              >
                Start saving your passwords and secure them with us.
              </motion.p>

              {/* Premium Borderless Button */}
              <motion.div
                variants={fadeUp}
                className="w-full flex justify-center px-4"
              >
                <Link
                  href="/vault"
                  className="group relative flex items-center justify-center gap-4 px-6 py-3.5 w-full max-w-sm bg-black dark:bg-white text-white dark:text-black rounded-[28px] hover:rounded-[18px] active:rounded-[12px] text-[1.15rem] font-bold transition-[border-radius,background-color,transform] duration-200 active:scale-[0.98] border-none"
                >
                  <Unlock className="relative z-10 w-6 h-6 group-hover:scale-110 group-hover:-translate-y-0.5 transition-transform duration-300" />
                  <span className="relative z-10">Open your Vault</span>
                </Link>
              </motion.div>
            </motion.div>
          </section>
        </div>
      </Show>

      {/* ========================================== */}
      {/* LOGGED OUT VIEW: Marketing Page            */}
      {/* ========================================== */}
      <Show when="signed-out">
        <div className="min-h-screen w-full text-black dark:text-white">
          {/* 1. HERO SECTION */}
          <section className="relative pt-24 pb-16 lg:pt-32 lg:pb-24 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 sm:px-8">
              <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
                {/* Left Column: Text & Actions */}
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={stagger}
                  className="max-w-xl"
                >
                  <motion.div
                    variants={fadeUp}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 dark:bg-black/10 backdrop-blur-xs text-black dark:text-white text-sm font-semibold mb-6 border border-black/40 dark:border-white/[0.06]"
                  >
                    <Shield className="w-4 h-4" /> Zero knowledge architecture
                  </motion.div>

                  <motion.h1
                    variants={fadeUp}
                    className="text-5xl sm:text-6xl lg:text-[4.5rem] font-extrabold taglinefont tracking-tight text-black dark:text-white mb-6 leading-[1.05]"
                  >
                    Secure your digital life, effortlessly.
                  </motion.h1>

                  <motion.p
                    variants={fadeUp}
                    className="text-lg sm:text-xl text-gray-800 dark:text-gray-200 mb-10 leading-relaxed"
                  >
                    Opaque is a beautifully simple password vault that keeps
                    your credentials safe. We can&apos;t see your data, and
                    neither can anyone else.
                  </motion.p>

                  <motion.div
                    variants={fadeUp}
                    className="flex flex-col sm:flex-row items-center gap-4"
                  >
                    <Link
                      href="/verify-regis"
                      className="w-full sm:w-auto px-8 py-3.5 bg-black dark:bg-white text-white dark:text-black rounded-[28px] hover:rounded-[18px] active:rounded-[12px] text-[1rem] font-bold transition-[border-radius,background-color,transform] duration-200 active:scale-[0.98] flex items-center justify-center border-none"
                    >
                      Get started for free
                    </Link>
                  </motion.div>
                </motion.div>

                {/* Right Column: Lottie Animation */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2, ...springTransition }}
                >
                  <div className="w-full relative flex items-center justify-center">
                    <Opaquesvganim />
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* 2. HOW WE SECURE YOUR DATA (Simple Language) */}
          <section className="relative py-24 border-y border-black/[0.04] dark:border-white/[0.05]">
            <div className="max-w-7xl mx-auto px-6 sm:px-8">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={stagger}
                className="text-center max-w-2xl mx-auto mb-16"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2, ...springTransition }}
                >
                  <div className="w-full relative flex items-center justify-center">
                    <Securedatasvg />
                  </div>
                </motion.div>
                <motion.h2
                  variants={fadeUp}
                  className="text-3xl taglinefont sm:text-4xl font-bold text-black dark:text-white mb-4 tracking-tight"
                >
                  How we secure your data
                </motion.h2>
                <motion.p
                  variants={fadeUp}
                  className="text-lg text-gray-600 dark:text-gray-400"
                >
                  We use production-grade encryption that happens entirely on
                  your device. Even we can&apos;t see your passwords.
                </motion.p>
              </motion.div>

              <div className="grid md:grid-cols-3 gap-6">
                <motion.div
                  variants={fadeUp}
                  className="bg-gray-400/10 dark:bg-black/10 backdrop-blur-xs p-8 rounded-[32px] border border-black/10 dark:border-white/[0.06]"
                >
                  <div className="w-12 h-12 bg-blue-800 dark:bg-[#ff9100] rounded-full flex items-center justify-center mb-6">
                    <Lock className="w-6 h-6 text-white dark:text-black" />
                  </div>
                  <h3 className="text-xl font-bold text-black dark:text-white mb-3">
                    Locks on your device
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    Before anything is saved, it is scrambled (encrypted) right
                    inside your browser. We never see your raw data.
                  </p>
                </motion.div>

                <motion.div
                  variants={fadeUp}
                  className="bg-yellow-400/10 dark:bg-black/10 backdrop-blur-xs p-8 rounded-[32px] border border-gray-400/10 dark:border-white/[0.06]"
                >
                  <div className="w-12 h-12 bg-black dark:bg-green-500 rounded-full flex items-center justify-center mb-6">
                    <Key className="w-6 h-6 text-green-500 dark:text-black" />
                  </div>
                  <h3 className="text-xl font-bold text-black dark:text-white mb-3">
                    One Master Password
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    You only need to remember one strong password. It acts as
                    the key to unlock your entire vault securely.
                  </p>
                </motion.div>

                <motion.div
                  variants={fadeUp}
                  className="bg-red-400/10 dark:bg-black/10 backdrop-blur-xs p-8 rounded-[32px] border border-gray-400/10 dark:border-white/[0.06]"
                >
                  <div className="w-12 h-12 bg-red-800 dark:bg-blue-800 rounded-full flex items-center justify-center mb-6">
                    <Shield className="w-6 h-6 text-white dark:text-purple-100" />
                  </div>
                  <h3 className="text-xl font-bold text-black dark:text-white mb-3">
                    12-Word Backup Phrase
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    If you forget your master password, a unique 12-word phrase
                    is the only way to recover your account. Keep it safe!
                  </p>
                </motion.div>
              </div>
            </div>
          </section>

          {/* 3. WHAT WE HAVE / WHAT WE DON'T */}
          <section className="relative py-24">
            <div className="max-w-5xl mx-auto px-6 sm:px-8">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={stagger}
                className="grid md:grid-cols-2 gap-12"
              >
                {/* What we have */}
                <motion.div variants={fadeUp}>
                  <h2 className="text-3xl taglinefont font-bold text-black dark:text-white mb-8 border-none">
                    What Opaque has
                  </h2>
                  <ul className="space-y-6">
                    {[
                      "Strong, unbreakable encryption (AES-GCM)",
                      "Zero-knowledge security (we can't read your data)",
                      "A built-in strong password generator",
                      "Lightning-fast access from any device",
                      "A safe way to recover your account if you forget your password",
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-full bg-green-400 dark:bg-green-800 flex items-center justify-center">
                          <Check className="w-4 h-4 text-black dark:text-white" />
                        </div>
                        <span className="text-lg text-gray-700 dark:text-gray-300">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </motion.div>

                {/* What we don't */}
                <motion.div variants={fadeUp}>
                  <h2 className="text-3xl taglinefont font-bold text-black dark:text-white mb-8 border-none">
                    What Opaque doesn&apos;t have
                  </h2>
                  <ul className="space-y-6">
                    {[
                      "No tracking or selling your data",
                      "No complicated setup process",
                      "No access for us to see your passwords",
                      "No hidden fees or premium locks",
                      "No weak security loopholes",
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-full bg-red-400 dark:bg-red-800 flex items-center justify-center">
                          <X className="w-4 h-4 text-black dark:text-white" />
                        </div>
                        <span className="text-lg text-gray-700 dark:text-gray-300">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </motion.div>
            </div>
          </section>

          {/* 4. BOTTOM CALL TO ACTION */}
          <section className="relative py-24 border-t border-black/[0.04] dark:border-white/[0.05]">
            <div className="max-w-4xl mx-auto px-6 text-center">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={stagger}
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2, ...springTransition }}
                >
                  <div className="w-full relative flex items-center justify-center">
                    <Privacythemesvg />
                  </div>
                </motion.div>
                <motion.h2
                  variants={fadeUp}
                  className="text-4xl taglinefont font-extrabold tracking-tight text-black dark:text-white mb-6"
                >
                  Take back your privacy
                </motion.h2>
                <motion.p
                  variants={fadeUp}
                  className="text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto"
                >
                  Join users who have switched to a faster, safer, and
                  completely private credential manager. Setup takes less than a
                  minute.
                </motion.p>

                <motion.div
                  variants={fadeUp}
                  className="flex flex-col items-center justify-center space-y-6"
                >
                  <Link
                    href="/verify-regis"
                    className="px-8 py-3.5 bg-black dark:bg-white text-white dark:text-black text-lg font-bold rounded-[28px] hover:rounded-[18px] active:rounded-[12px] transition-[border-radius,background-color,transform] duration-200 active:scale-[0.98] border-none"
                  >
                    Create your free account
                  </Link>

                  <p className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600 dark:text-gray-400 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-black dark:text-white" />{" "}
                      No credit card required
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-black dark:text-white" />{" "}
                      End-to-end encrypted
                    </span>
                  </p>
                </motion.div>
              </motion.div>
            </div>
          </section>
        </div>
      </Show>
    </main>
  );
}
