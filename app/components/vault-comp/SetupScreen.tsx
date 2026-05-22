"use client";

// ============================================================
//  components/vault/SetupScreen.tsx
// ------------------------------------------------------------
//  First-time vault setup. Rendered by VaultGate when
//  isInitialized === false. Three steps:
//    1) create master password (+ strength meter, irreversibility warning)
//    2) reveal the 12-word recovery phrase ONCE (copy / download)
//    3) confirm 3 words in order → finalizeSetup() commits & unlocks
//  Nothing is stored on the server until step 3 succeeds.
// ============================================================

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaSpinner } from "react-icons/fa";
import {
  KeyRound,
  ShieldAlert,
  Copy,
  Check,
  Download,
  Eye,
  EyeOff,
  ArrowRight,
} from "lucide-react";
import { useVault } from "./VaultProvider";

// --- simple, dependency-free strength heuristic ---
function scorePassword(pw: string) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  const levels = [
    { label: "Too weak", pct: 20, color: "#ef4444" },
    { label: "Weak", pct: 40, color: "#f59e0b" },
    { label: "Fair", pct: 60, color: "#eab308" },
    { label: "Good", pct: 80, color: "#3b82f6" },
    { label: "Strong", pct: 100, color: "#22c55e" },
  ];
  return levels[Math.max(0, Math.min(s, 5) - 1)];
}

// pick 3 distinct word positions to quiz (non-security, Math.random is fine)
function pickChallenge(): number[] {
  const idx = [...Array(12).keys()];
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return idx.slice(0, 3).sort((a, b) => a - b);
}

const inputClass =
  "w-full px-4 py-2 bg-[#111111] border border-[#333333] text-[16px] text-gray-100 placeholder-gray-500 focus:border-[#0078D4] focus:ring-1 focus:ring-[#0078D4] focus:outline-none rounded-md transition-all";
const labelClass = "block text-[15px] font-medium text-gray-100 mb-1.5";
const primaryBtn =
  "w-full flex items-center justify-center gap-2 py-3 px-4 font-semibold text-[14px] bg-[#0078D4] hover:bg-[#006abc] text-white rounded-full shadow-lg shadow-[#0078D4]/20 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed";
const ghostBtn =
  "w-full text-center text-[14px] text-gray-400 hover:text-white transition-colors";

type Step = "password" | "reveal" | "confirm";

export default function SetupScreen() {
  const { beginSetup, finalizeSetup } = useVault();

  const [step, setStep] = useState<Step>("password");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // step 1
  const [pw, setPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const strength = useMemo(() => scorePassword(pw), [pw]);

  // step 2
  const [words, setWords] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const [challenge, setChallenge] = useState<number[]>([]);

  // step 3
  const [answers, setAnswers] = useState<Record<number, string>>({});

  // ---- step 1 → 2 ----
  const createPassword = async () => {
    setError(null);
    if (pw.length < 8)
      return setError("Master password must be at least 8 characters.");
    if (pw !== confirmPw) return setError("Passwords don't match.");
    setLoading(true);
    try {
      const phrase = await beginSetup(pw); // generates everything, stores nothing
      setWords(phrase.split(" "));
      setChallenge(pickChallenge());
      setAcknowledged(false);
      setStep("reveal");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start setup.");
    } finally {
      setLoading(false);
    }
  };

  const copyPhrase = async () => {
    await navigator.clipboard.writeText(words.join(" "));
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const downloadPhrase = () => {
    const blob = new Blob([words.join(" ")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "recovery-phrase.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  // ---- step 3: confirm + commit ----
  const confirmAndFinish = async () => {
    setError(null);
    const ok = challenge.every(
      (i) => (answers[i] ?? "").trim().toLowerCase() === words[i],
    );
    if (!ok) return setError("Those words don't match your recovery phrase.");
    setLoading(true);
    try {
      await finalizeSetup(); // commits to server + unlocks → VaultGate swaps to dashboard
    } catch (e) {
      setError(e instanceof Error ? e.message : "Setup failed.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] text-gray-100 px-6 py-12 selection:bg-[#0078D4] selection:text-white">
      <div className="w-full max-w-[520px]">
        {/* header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-11 h-11 rounded-full bg-[#0078D4]/15 border border-[#0078D4]/40 flex items-center justify-center text-[#0078D4]">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Set up your vault</h1>
            <p className="text-[13px] text-gray-400">
              Step {step === "password" ? 1 : step === "reveal" ? 2 : 3} of 3
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
          {/* ---------------- STEP 1: master password ---------------- */}
          {step === "password" && (
            <motion.div
              key="password"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-5"
            >
              <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-900/40 flex gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-[13px] text-amber-200/90 leading-relaxed">
                  Your master password encrypts everything and is never sent to
                  our servers. We <strong>cannot</strong> reset it — if you
                  forget it, only your recovery phrase can get you back in.
                </p>
              </div>

              <div>
                <label className={labelClass}>Master password</label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    value={pw}
                    autoFocus
                    onChange={(e) => setPw(e.target.value)}
                    className={`${inputClass} pr-12`}
                    placeholder="At least 8 characters"
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
                {pw && (
                  <div className="mt-2">
                    <div className="h-1.5 w-full bg-[#1a1a1a] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${strength.pct}%`,
                          background: strength.color,
                        }}
                      />
                    </div>
                    <p
                      className="text-[12px] mt-1"
                      style={{ color: strength.color }}
                    >
                      {strength.label}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className={labelClass}>Confirm master password</label>
                <input
                  type={showPw ? "text" : "password"}
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && createPassword()}
                  className={inputClass}
                  placeholder="Re-enter your password"
                />
              </div>

              <button
                onClick={createPassword}
                disabled={loading || !pw || !confirmPw}
                className={primaryBtn}
              >
                {loading ? (
                  <FaSpinner className="animate-spin w-5 h-5" />
                ) : (
                  "Continue"
                )}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </motion.div>
          )}

          {/* ---------------- STEP 2: reveal phrase ---------------- */}
          {step === "reveal" && (
            <motion.div
              key="reveal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-5"
            >
              <p className="text-[14px] text-gray-400 leading-relaxed">
                This is your{" "}
                <strong className="text-gray-200">recovery phrase</strong> — the
                only way back in if you forget your master password. Write it
                down and store it somewhere safe. It will{" "}
                <strong className="text-gray-200">never be shown again</strong>.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {words.map((w, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 px-3 py-2.5 bg-[#111111] border border-[#2a2a2a] rounded-lg"
                  >
                    <span className="text-[11px] text-gray-600 w-4 text-right">
                      {i + 1}
                    </span>
                    <span className="text-[14px] font-mono text-gray-100">
                      {w}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={copyPhrase}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 text-[13px] bg-[#111111] border border-[#333] hover:bg-[#1a1a1a] rounded-full text-gray-200 transition-all"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  {copied ? "Copied" : "Copy"}
                </button>
                <button
                  onClick={downloadPhrase}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 text-[13px] bg-[#111111] border border-[#333] hover:bg-[#1a1a1a] rounded-full text-gray-200 transition-all"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>

              <label className="flex items-start gap-3 cursor-pointer select-none pt-1">
                <input
                  type="checkbox"
                  checked={acknowledged}
                  onChange={(e) => setAcknowledged(e.target.checked)}
                  className="mt-1 accent-[#0078D4] w-4 h-4"
                />
                <span className="text-[13px] text-gray-300 leading-relaxed">
                  I have saved my recovery phrase. I understand it cannot be
                  recovered if lost.
                </span>
              </label>

              <button
                onClick={() => {
                  setError(null);
                  setStep("confirm");
                }}
                disabled={!acknowledged}
                className={primaryBtn}
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
              <button onClick={() => setStep("password")} className={ghostBtn}>
                Back
              </button>
            </motion.div>
          )}

          {/* ---------------- STEP 3: confirm phrase ---------------- */}
          {step === "confirm" && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-5"
            >
              <p className="text-[14px] text-gray-400 leading-relaxed">
                Confirm you saved it. Enter the following words from your
                recovery phrase.
              </p>

              <div className="space-y-4">
                {challenge.map((i) => (
                  <div key={i}>
                    <label className={labelClass}>Word #{i + 1}</label>
                    <input
                      type="text"
                      autoComplete="off"
                      value={answers[i] ?? ""}
                      onChange={(e) =>
                        setAnswers((a) => ({ ...a, [i]: e.target.value }))
                      }
                      className={`${inputClass} font-mono`}
                      placeholder={`Enter word ${i + 1}`}
                    />
                  </div>
                ))}
              </div>

              <button
                onClick={confirmAndFinish}
                disabled={
                  loading || challenge.some((i) => !(answers[i] ?? "").trim())
                }
                className={primaryBtn}
              >
                {loading ? (
                  <FaSpinner className="animate-spin w-5 h-5" />
                ) : (
                  <>
                    Create vault <Check className="w-4 h-4" />
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setError(null);
                  setStep("reveal");
                }}
                className={ghostBtn}
              >
                Back to recovery phrase
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
