"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaSpinner } from "react-icons/fa";
import {
  LockKeyhole,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { useClerk } from "@clerk/nextjs";
import { useVault } from "./VaultProvider";

// Material 3 Expressive Spring Physics
const m3SpatialSpring = {
  type: "spring" as const,
  stiffness: 420,
  damping: 32,
  mass: 0.9,
};

export default function UnlockScreen() {
  const { unlock, unlockWithRecovery } = useVault();
  const { signOut } = useClerk();

  const [mode, setMode] = useState<"unlock" | "recover">("unlock");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // unlock
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);

  // recover
  const [phrase, setPhrase] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");

  const wordCount = phrase.trim() ? phrase.trim().split(/\s+/).length : 0;

  const doUnlock = async () => {
    setError(null);
    setLoading(true);
    try {
      await unlock(pw);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not unlock.");
      setLoading(false);
    }
  };

  const doRecover = async () => {
    setError(null);
    if (wordCount !== 12) return setError("A recovery phrase is 12 words.");
    if (newPw.length < 8)
      return setError("New master password must be at least 8 characters.");
    if (newPw !== confirmPw) return setError("Passwords don't match.");
    setLoading(true);
    try {
      await unlockWithRecovery(phrase, newPw);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Recovery failed.");
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/";
  };

  const switchMode = (m: "unlock" | "recover") => {
    setMode(m);
    setError(null);
  };

  // Borderless M3 Styling Variables
  const inputClass =
    "w-full px-5 py-4 bg-gray-100 dark:bg-[#1A1A1A] border-none focus:ring-4 focus:ring-[#EADDFF] dark:focus:ring-[#4A3C68] transition-all text-[16px] text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 outline-none rounded-[20px] font-medium";
  const labelClass =
    "block text-[14px] font-semibold text-gray-700 dark:text-gray-300 mb-2 pl-2 tracking-wide";

  const primaryBtn =
    "w-full flex items-center justify-center gap-2 py-4 px-6 font-semibold text-[16px] bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black rounded-[24px] hover:rounded-[16px] active:rounded-[12px] cursor-pointer transition-[border-radius,background-color,transform] duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] border-none";

  const ghostBtn =
    "w-full text-center text-[15px] font-semibold py-3 cursor-pointer text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors border-none";

  return (
    <div className="min-h-screen pt-24 flex items-center justify-center bg-white dark:bg-[#050505] text-[#111318] dark:text-[#E2E2E9] px-4 sm:px-6 py-12 selection:bg-[#EADDFF] selection:text-[#21005D] dark:selection:bg-[#4A3C68] dark:selection:text-[#EADDFF]">
      {/* Massive Borderless Unlock Card */}
      <motion.div
        layout
        className="w-full max-w-[480px] bg-white dark:bg-[#0A0A0A] rounded-[40px] p-6 sm:p-10 md:p-12 border-none"
      >
        {/* Header */}
        <motion.div
          layout
          className="flex flex-col items-center text-center mb-8"
        >
          <div className="w-16 h-16 flex items-center justify-center rounded-[20px] bg-[#EADDFF] dark:bg-[#4A3C68] text-[#21005D] dark:text-[#EADDFF] mb-6">
            {mode === "unlock" ? (
              loading ? (
                <FaSpinner className="w-8 h-8 animate-spin" />
              ) : (
                <LockKeyhole className="w-8 h-8" />
              )
            ) : (
              <ShieldCheck className="w-8 h-8" />
            )}
          </div>
          <motion.h1
            layout
            className="text-3xl sm:text-4xl font-extrabold text-black dark:text-white tracking-tight mb-3"
          >
            {mode === "unlock" ? "Unlock Vault" : "Vault Recovery"}
          </motion.h1>
          <motion.p
            layout
            className="text-[15px] font-medium text-gray-500 dark:text-gray-400 leading-relaxed"
          >
            {mode === "unlock"
              ? "Enter your master password to access your secure data."
              : "Enter your 12-word phrase and set a new master password."}
          </motion.p>
        </motion.div>

        {/* Fluid Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, height: 0, marginBottom: 0 }}
              transition={m3SpatialSpring}
              className="mb-6 p-4 bg-[#FCE8E6] dark:bg-[#3B1212] rounded-[20px] flex items-start gap-3 border-none"
            >
              <AlertTriangle className="w-5 h-5 text-[#8C1D18] dark:text-[#F2B8B5] shrink-0 mt-0.5" />
              <span className="text-[14px] font-semibold text-[#8C1D18] dark:text-[#F2B8B5] leading-relaxed">
                {error}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form Area */}
        <motion.div layout className="w-full">
          <AnimatePresence mode="wait">
            {mode === "unlock" ? (
              <motion.div
                key="unlock"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={m3SpatialSpring}
                className="space-y-6 w-full"
              >
                <div className="relative w-full">
                  <input
                    type={showPw ? "text" : "password"}
                    value={pw}
                    autoFocus
                    onChange={(e) => setPw(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && pw && doUnlock()}
                    className={`${inputClass} pr-14 ${!showPw && pw ? "tracking-[0.25em] text-lg font-bold" : ""}`}
                    placeholder="Enter master password"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPw((s) => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full text-gray-500 hover:text-black dark:hover:text-white hover:bg-white dark:hover:bg-[#333] transition-colors"
                  >
                    {showPw ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>

                <div className="w-full space-y-2 pt-2">
                  <button
                    onClick={doUnlock}
                    disabled={loading || !pw}
                    className={primaryBtn}
                  >
                    {loading ? (
                      <FaSpinner className="animate-spin w-5 h-5" />
                    ) : (
                      "Unlock Vault"
                    )}
                  </button>

                  <button
                    onClick={() => switchMode("recover")}
                    className={ghostBtn}
                  >
                    Forgot your master password?
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="recover"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={m3SpatialSpring}
                className="space-y-5 w-full text-left"
              >
                <div>
                  <label className={labelClass}>Recovery phrase</label>
                  <textarea
                    value={phrase}
                    autoFocus
                    onChange={(e) => setPhrase(e.target.value)}
                    rows={3}
                    className={`${inputClass} text-[14px] leading-relaxed resize-none font-mono`}
                    placeholder="Enter your 12 words, separated by spaces..."
                  />
                  <p className="text-[12px] font-bold text-gray-500 dark:text-gray-400 mt-2 text-right pr-2">
                    {wordCount} / 12 words
                  </p>
                </div>

                <div>
                  <label className={labelClass}>New master password</label>
                  <input
                    type="password"
                    value={newPw}
                    onChange={(e) => setNewPw(e.target.value)}
                    className={`${inputClass} tracking-[0.25em] text-lg font-bold`}
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label className={labelClass}>Confirm new password</label>
                  <input
                    type="password"
                    value={confirmPw}
                    onChange={(e) => setConfirmPw(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && doRecover()}
                    className={`${inputClass} tracking-[0.25em] text-lg font-bold`}
                    placeholder="••••••••"
                  />
                </div>

                <div className="w-full space-y-2 pt-4">
                  <button
                    onClick={doRecover}
                    disabled={loading}
                    className={primaryBtn}
                  >
                    {loading ? (
                      <FaSpinner className="animate-spin w-5 h-5" />
                    ) : (
                      <>
                        Recover & Unlock <ArrowRight className="w-5 h-5 ml-1" />
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => switchMode("unlock")}
                    className={ghostBtn}
                  >
                    Back to unlock
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Footer Actions */}
        <motion.div layout className="mt-10 text-center w-full">
          <div className="h-px w-full bg-gray-100 dark:bg-[#1A1A1A] mb-6 transition-colors border-none" />
          <button
            onClick={handleSignOut}
            className="text-[14px] font-semibold text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
          >
            Not you? Sign out
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
