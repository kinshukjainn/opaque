"use client";

// ============================================================
//  components/vault/UnlockScreen.tsx
// ------------------------------------------------------------
//  Rendered by VaultGate when isInitialized && !isUnlocked.
//  Two modes:
//    "unlock"  → enter master password → v.unlock(pw)
//    "recover" → enter 12-word phrase + new master password →
//                v.unlockWithRecovery(phrase, newPw)
//  On success the provider flips isUnlocked and the gate swaps
//  this screen out for the Dashboard.
// ============================================================

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaSpinner } from "react-icons/fa";
import { LockKeyhole, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useClerk } from "@clerk/nextjs";
import { useVault } from "./VaultProvider";

// Material You / Pixel Form Styles
const inputClass =
  "w-full px-6 py-4 bg-[#1E1F20] border-2 border-transparent text-[16px] text-[#E2E2E2] placeholder-[#8E918F] focus:border-[#A8C7FA] focus:bg-[#282A2C] focus:outline-none rounded-full transition-all duration-300";
const labelClass =
  "block text-[14px] font-medium text-[#C4C7C5] mb-2 pl-4 text-left w-full";
const primaryBtn =
  "w-full flex items-center justify-center gap-2 py-4 px-6 font-semibold text-[16px] bg-[#A8C7FA] hover:bg-[#b9d3fc] text-[#041E49] rounded-full shadow-[0_4px_14px_0_rgba(168,199,250,0.2)] cursor-pointer transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
const ghostBtn =
  "w-full text-center text-[14px] font-medium text-[#8E918F] hover:text-[#E2E2E2] hover:bg-[#1E1F20] py-3 rounded-full transition-colors active:bg-[#282A2C]";

export default function UnlockScreen() {
  const { unlock, unlockWithRecovery } = useVault();
  const { signOut } = useClerk();

  const [mode, setMode] = useState<"unlock" | "recover">("unlock");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // unlock
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // recover
  const [phrase, setPhrase] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");

  const wordCount = phrase.trim() ? phrase.trim().split(/\s+/).length : 0;

  const doUnlock = async () => {
    setError(null);
    setLoading(true);
    try {
      await unlock(pw); // on success the gate unmounts this screen
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

  return (
    <div className="min-h-screen pt-20 flex items-center justify-center bg-[#000000] text-[#E2E2E2] px-6 py-12 selection:bg-[#A8C7FA] selection:text-[#041E49] ">
      <motion.div
        layout
        className="w-full max-w-[420px] flex flex-col items-center text-center"
      >
        {/* Animated Lock Icon Header */}
        <motion.div layout className="flex flex-col items-center mb-8">
          <motion.div
            layout
            className="w-20 h-20 rounded-full bg-[#1E1F20] flex items-center justify-center text-[#A8C7FA] shadow-[0_0_40px_-10px_rgba(168,199,250,0.15)] mb-6"
            animate={
              isFocused
                ? { scale: 1.05, backgroundColor: "#282A2C" }
                : { scale: 1, backgroundColor: "#1E1F20" }
            }
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            {mode === "unlock" ? (
              loading ? (
                <FaSpinner className="w-8 h-8 animate-spin" />
              ) : (
                <LockKeyhole className="w-8 h-8" />
              )
            ) : (
              <ShieldCheck className="w-8 h-8 text-[#C4EDD0]" />
            )}
          </motion.div>
          <motion.h1
            layout
            className="text-3xl font-bold text-[#E2E2E2] tracking-tight"
          >
            {mode === "unlock" ? "Unlock Vault" : "Account Recovery"}
          </motion.h1>
          <motion.p layout className="text-[15px] text-[#8E918F] mt-2">
            {mode === "unlock"
              ? "Enter your master password"
              : "Set a new master password"}
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
              className="mb-6 p-4 w-full bg-[#601410] rounded-[20px] text-[14px] text-[#F2B8B5]"
            >
              {error}
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
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="space-y-6 w-full flex flex-col items-center"
              >
                <div className="relative w-full">
                  <input
                    type={showPw ? "text" : "password"}
                    value={pw}
                    autoFocus
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    onChange={(e) => setPw(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && pw && doUnlock()}
                    className={`${inputClass} pr-14 ${!showPw && pw ? "tracking-[0.25em] font-mono text-lg" : ""}`}
                    placeholder="Master password"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPw((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full text-[#8E918F] hover:text-[#E2E2E2] hover:bg-[#282A2C] transition-colors"
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
                      "Unlock"
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
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="space-y-5 w-full"
              >
                <div>
                  <label className={labelClass}>Recovery phrase</label>
                  <textarea
                    value={phrase}
                    autoFocus
                    onChange={(e) => setPhrase(e.target.value)}
                    rows={3}
                    className={`${inputClass} rounded-[28px] font-mono text-[14px] leading-relaxed resize-none`}
                    placeholder="Enter your 12 words, separated by spaces"
                  />
                  <p className="text-[13px] text-[#8E918F] mt-2 text-right pr-4">
                    {wordCount} / 12 words
                  </p>
                </div>

                <div>
                  <label className={labelClass}>New master password</label>
                  <input
                    type="password"
                    value={newPw}
                    onChange={(e) => setNewPw(e.target.value)}
                    className={`${inputClass} tracking-widest font-mono`}
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
                    className={`${inputClass} tracking-widest font-mono`}
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
                      "Recover & Unlock"
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
        <motion.div layout className="mt-12 text-center w-full">
          <div className="h-px w-full bg-[#1E1F20] mb-6" />
          <button
            onClick={handleSignOut}
            className="text-[14px] font-medium text-[#8E918F] hover:text-[#E2E2E2] transition-colors"
          >
            Not you? Sign out
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
