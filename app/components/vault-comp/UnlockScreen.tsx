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

// Minimal, flat styles matching the background
const inputClass =
  "w-full px-4 py-3 bg-transparent border border-[#2A2D35] text-[16px] text-[#E2E2E2] placeholder-[#5f6368] focus:border-[#A8C7FA] focus:outline-none rounded transition-colors duration-200";
const labelClass =
  "block text-[14px] font-medium text-[#8E918F] mb-1.5 text-left w-full";
const primaryBtn =
  "w-full flex items-center justify-center gap-2 py-3 px-6 font-medium text-[15px] bg-[#E2E2E2] hover:bg-white text-[#161923] rounded cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
const ghostBtn =
  "w-full text-center text-[14px] font-medium text-[#8E918F] hover:text-[#E2E2E2] py-2 transition-colors disabled:opacity-50";

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

  // Ultra-minimal fade animation settings
  const fadeAnim = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 },
  };

  return (
    <div className="min-h-screen pt-20 flex items-center justify-center bg-[#161923] text-[#E2E2E2] px-6 py-12 selection:bg-[#A8C7FA] selection:text-[#041E49]">
      <div className="w-full max-w-[380px] flex flex-col items-center text-center">
        {/* Minimal Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="mb-4 text-[#8E918F]">
            {mode === "unlock" ? (
              loading ? (
                <FaSpinner className="w-6 h-6 animate-spin" />
              ) : (
                <LockKeyhole className="w-6 h-6" />
              )
            ) : (
              <ShieldCheck className="w-6 h-6" />
            )}
          </div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">
            {mode === "unlock" ? "Unlock Vault" : "Account Recovery"}
          </h1>
          <p className="text-[14px] text-[#8E918F] mt-1.5">
            {mode === "unlock"
              ? "Enter your master password"
              : "Set a new master password"}
          </p>
        </div>

        {/* Flat Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              {...fadeAnim}
              className="mb-6 p-3 w-full border border-[#4A2525] bg-[#2A1616] text-[14px] text-[#F2B8B5] rounded"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form Area */}
        <div className="w-full">
          <AnimatePresence mode="wait">
            {mode === "unlock" ? (
              <motion.div
                key="unlock"
                {...fadeAnim}
                className="space-y-6 w-full flex flex-col items-center"
              >
                <div className="relative w-full">
                  <input
                    type={showPw ? "text" : "password"}
                    value={pw}
                    autoFocus
                    onChange={(e) => setPw(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && pw && doUnlock()}
                    className={`${inputClass} pr-12 ${!showPw && pw ? "tracking-[0.25em]  text-lg" : ""}`}
                    placeholder="Master password"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPw((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8E918F] hover:text-[#E2E2E2] transition-colors"
                  >
                    {showPw ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <div className="w-full space-y-3 pt-2">
                  <button
                    onClick={doUnlock}
                    disabled={loading || !pw}
                    className={primaryBtn}
                  >
                    {loading ? (
                      <FaSpinner className="animate-spin w-4 h-4" />
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
                {...fadeAnim}
                className="space-y-5 w-full"
              >
                <div>
                  <label className={labelClass}>Recovery phrase</label>
                  <textarea
                    value={phrase}
                    autoFocus
                    onChange={(e) => setPhrase(e.target.value)}
                    rows={3}
                    className={`${inputClass}  text-[13px] leading-relaxed resize-none`}
                    placeholder="Enter your 12 words, separated by spaces"
                  />
                  <p className="text-[12px] text-[#8E918F] mt-1.5 text-right">
                    {wordCount} / 12 words
                  </p>
                </div>

                <div>
                  <label className={labelClass}>New master password</label>
                  <input
                    type="password"
                    value={newPw}
                    onChange={(e) => setNewPw(e.target.value)}
                    className={`${inputClass} tracking-widest `}
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
                    className={`${inputClass} tracking-widest `}
                    placeholder="••••••••"
                  />
                </div>

                <div className="w-full space-y-3 pt-4">
                  <button
                    onClick={doRecover}
                    disabled={loading}
                    className={primaryBtn}
                  >
                    {loading ? (
                      <FaSpinner className="animate-spin w-4 h-4" />
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
        </div>

        {/* Footer Actions */}
        <div className="mt-10 text-center w-full">
          <div className="h-px w-full bg-[#2A2D35] mb-6" />
          <button
            onClick={handleSignOut}
            className="text-[13px] font-medium text-[#5f6368] hover:text-[#8E918F] transition-colors"
          >
            Not you? Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
