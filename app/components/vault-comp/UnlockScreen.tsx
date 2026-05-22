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
import { LockKeyhole, Eye, EyeOff, KeyRound, ArrowRight } from "lucide-react";
import { useClerk } from "@clerk/nextjs";
import { useVault } from "./VaultProvider";

const inputClass =
  "w-full px-4 py-2 bg-[#111111] border border-[#333333] text-[16px] text-gray-100 placeholder-gray-500 focus:border-[#0078D4] focus:ring-1 focus:ring-[#0078D4] focus:outline-none rounded-md transition-all";
const labelClass = "block text-[15px] font-medium text-gray-100 mb-1.5";
const primaryBtn =
  "w-full flex items-center justify-center gap-2 py-3 px-4 font-semibold text-[14px] bg-[#0078D4] hover:bg-[#006abc] text-white rounded-full shadow-lg shadow-[#0078D4]/20 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed";
const ghostBtn =
  "w-full text-center text-[14px] text-gray-400 hover:text-white transition-colors";

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] text-gray-100 px-6 py-12 selection:bg-[#0078D4] selection:text-white">
      <div className="w-full max-w-[460px]">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-11 h-11 rounded-full bg-[#0078D4]/15 border border-[#0078D4]/40 flex items-center justify-center text-[#0078D4]">
            {mode === "unlock" ? (
              <LockKeyhole className="w-5 h-5" />
            ) : (
              <KeyRound className="w-5 h-5" />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {mode === "unlock"
                ? "Unlock your vault"
                : "Reset master password"}
            </h1>
            <p className="text-[13px] text-gray-400">
              {mode === "unlock"
                ? "Enter your master password to decrypt your vault."
                : "Use your recovery phrase to set a new master password."}
            </p>
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-3.5 bg-red-950/30 border border-red-900/50 rounded-xl text-[13.5px] text-red-200"
          >
            {error}
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {mode === "unlock" ? (
            <motion.div
              key="unlock"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-5"
            >
              <div>
                <label className={labelClass}>Master password</label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    value={pw}
                    autoFocus
                    onChange={(e) => setPw(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && pw && doUnlock()}
                    className={`${inputClass} pr-12`}
                    placeholder="Your master password"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPw((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-200"
                  >
                    {showPw ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

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
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>

              <button
                onClick={() => switchMode("recover")}
                className={ghostBtn}
              >
                Forgot your master password?
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="recover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-5"
            >
              <div>
                <label className={labelClass}>Recovery phrase</label>
                <textarea
                  value={phrase}
                  autoFocus
                  onChange={(e) => setPhrase(e.target.value)}
                  rows={3}
                  className={`${inputClass} font-mono resize-none`}
                  placeholder="Enter your 12 words, separated by spaces"
                />
                <p className="text-[12px] text-gray-500 mt-1">
                  {wordCount} / 12 words
                </p>
              </div>

              <div>
                <label className={labelClass}>New master password</label>
                <input
                  type="password"
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  className={inputClass}
                  placeholder="At least 8 characters"
                />
              </div>

              <div>
                <label className={labelClass}>Confirm new password</label>
                <input
                  type="password"
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && doRecover()}
                  className={inputClass}
                  placeholder="Re-enter new password"
                />
              </div>

              <button
                onClick={doRecover}
                disabled={loading}
                className={primaryBtn}
              >
                {loading ? (
                  <FaSpinner className="animate-spin w-5 h-5" />
                ) : (
                  "Recover & unlock"
                )}
              </button>

              <button onClick={() => switchMode("unlock")} className={ghostBtn}>
                Back to unlock
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-10 text-center">
          <button
            onClick={handleSignOut}
            className="text-[13px] text-gray-500 hover:text-gray-300 transition-colors"
          >
            Not you? Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
