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
  ShieldCheck,
  AlertTriangle,
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

  // Updated to Material You Tonal Colors
  const levels = [
    { label: "Too weak", pct: 20, color: "#F2B8B5" }, // Red Tonal
    { label: "Weak", pct: 40, color: "#FFB4A1" }, // Orange Tonal
    { label: "Fair", pct: 60, color: "#F9BC05" }, // Yellow Tonal
    { label: "Good", pct: 80, color: "#C4EDD0" }, // Light Green Tonal
    { label: "Strong", pct: 100, color: "#81C995" }, // Green Tonal
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

// Material You Form Styles
const inputClass =
  "w-full px-6 py-4 bg-gray-900 border-2 border-[#444444] text-[16px] text-[#E2E2E2] placeholder-text-gray-600 outline-none rounded-lg transition-all duration-300";
const labelClass =
  "block text-[18px] font-medium text-white mb-2 pl-4 text-left w-full";
const primaryBtn =
  "w-full flex items-center justify-center gap-2 py-2 px-3 font-semibold text-[19px] bg-green-700  text-white rounded-lg cursor-pointer transition-all  disabled:opacity-50 disabled:cursor-not-allowed";
const ghostBtn =
  "w-full text-center text-[15px] font-medium text-[#8E918F] hover:text-[#E2E2E2] hover:bg-[#1E1F20] py-3 rounded-lg transition-colors active:bg-[#282A2C]";

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
    <div className="min-h-screen pt-20 flex items-center justify-center bg-[#161923] text-[#E2E2E2] px-4 sm:px-6 py-12 selection:bg-[#A8C7FA] selection:text-[#041E49] ">
      <motion.div layout className="w-full max-w-[500px]">
        {/* Header */}
        <motion.div
          layout
          className="flex flex-col items-center text-center mb-8"
        >
          <div className="w-16 h-16 rounded-lg bg-green-700 flex items-center justify-center text-white mb-6">
            {step === "password" ? (
              <KeyRound className="w-7 h-7" />
            ) : (
              <ShieldCheck className="w-7 h-7" />
            )}
          </div>
          <h1 className="text-4xl font-normal text-white tracking-tight mb-4">
            Set up your vault
          </h1>
          <div className="flex items-center gap-3 mt-3 text-[14px] font-medium text-white">
            <span
              className={
                step === "password"
                  ? "text-green-500 font-semibold underline"
                  : ""
              }
            >
              Create your Password
            </span>
            <span> {"|"}</span>
            <span
              className={
                step === "reveal"
                  ? "text-green-500 font-semibold underline"
                  : ""
              }
            >
              Seed Phrase
            </span>
            <span>{"|"}</span>
            <span
              className={
                step === "confirm"
                  ? "text-green-500 font-semibold underline"
                  : ""
              }
            >
              Verify seed phrase
            </span>
          </div>
        </motion.div>

        {/* Fluid Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, height: 0, marginBottom: 0 }}
              className="mb-6 p-4 w-full bg-red-500 rounded-[24px] text-[14px] text-[#F2B8B5] flex items-start gap-3"
            >
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div layout>
          <AnimatePresence mode="wait">
            {/* ---------------- STEP 1: master password ---------------- */}
            {step === "password" && (
              <motion.div
                key="password"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="space-y-6"
              >
                {/* Material Warning Tonal */}
                <div className="p-5 rounded-[28px] bg-red-500  flex gap-4">
                  <ShieldAlert className="w-6 h-6 text-white shrink-0 mt-0.5" />
                  <p className="text-[14px] text-white leading-relaxed">
                    Your master password encrypts everything and is never sent
                    to our servers. We{" "}
                    <strong className="font-bold text-white">cannot</strong>{" "}
                    reset it if you forget it, only your recovery phrase can get
                    you back in.
                  </p>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className={labelClass}>Master password</label>
                    <div className="relative">
                      <input
                        type={showPw ? "text" : "password"}
                        value={pw}
                        autoFocus
                        onChange={(e) => setPw(e.target.value)}
                        className={`${inputClass} pr-14 ${!showPw && pw ? "tracking-[0.25em]  text-lg py-3.5" : ""}`}
                        placeholder="At least 8 characters"
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowPw((s) => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-lg text-[#8E918F] hover:text-[#E2E2E2] hover:bg-[#282A2C] transition-colors"
                      >
                        {showPw ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>

                    {/* Fluid Strength Meter */}
                    <AnimatePresence>
                      {pw && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 px-2"
                        >
                          <div className="h-1.5 w-full bg-[#1E1F20] rounded-lg overflow-hidden">
                            <motion.div
                              className="h-full rounded-lg"
                              initial={{ width: 0 }}
                              animate={{
                                width: `${strength.pct}%`,
                                backgroundColor: strength.color,
                              }}
                              transition={{
                                type: "spring",
                                stiffness: 100,
                                damping: 20,
                              }}
                            />
                          </div>
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1, color: strength.color }}
                            className="text-[12px] font-medium mt-2 uppercase tracking-wider"
                          >
                            {strength.label}
                          </motion.p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div>
                    <label className={labelClass}>
                      Confirm master password
                    </label>
                    <input
                      type={showPw ? "text" : "password"}
                      value={confirmPw}
                      onChange={(e) => setConfirmPw(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && createPassword()}
                      className={`${inputClass} ${!showPw && confirmPw ? "tracking-[0.25em]  text-lg py-3.5" : ""}`}
                      placeholder="Re-enter your password"
                    />
                  </div>
                </div>

                <div className="pt-2">
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
                    {!loading && <ArrowRight className="w-5 h-5" />}
                  </button>
                </div>
              </motion.div>
            )}

            {/* ---------------- STEP 2: reveal phrase ---------------- */}
            {step === "reveal" && (
              <motion.div
                key="reveal"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="space-y-6"
              >
                <p className="text-[15px] text-[#8E918F] leading-relaxed text-center">
                  This is your{" "}
                  <strong className="text-[#E2E2E2] font-semibold">
                    recovery phrase
                  </strong>{" "}
                  — the only way back in if you forget your master password.
                  Write it down and store it somewhere safe. It will{" "}
                  <strong className="text-[#E2E2E2] font-semibold">
                    never be shown again
                  </strong>
                  .
                </p>

                {/* Android Native-Style Chips */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {words.map((w, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 px-2 py-2  border-2 border-[#444444] rounded-lg"
                    >
                      <span className="text-[15px] font-medium text-white w-4 text-right select-none">
                        {i + 1}
                      </span>
                      <span className="text-[16px]  font-medium text-white">
                        {w}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={copyPhrase}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-4 text-[15px] font-medium bg-blue-800 rounded-lg text-white "
                  >
                    {copied ? (
                      <Check className="w-5 h-5 text-[#C4EDD0]" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                    {copied ? "Copied" : "Copy Phrase"}
                  </button>
                  <button
                    onClick={downloadPhrase}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-4 text-[15px] font-medium bg-blue-800 rounded-lg text-white"
                  >
                    <Download className="w-5 h-5" />
                    Download
                  </button>
                </div>

                <label className="flex items-center gap-4 cursor-pointer select-none p-4 transition-colors">
                  <div className="relative flex items-center justify-center w-6 h-6 shrink-0">
                    <input
                      type="checkbox"
                      checked={acknowledged}
                      onChange={(e) => setAcknowledged(e.target.checked)}
                      className="appearance-none w-6 h-6 rounded-md border-2 border-[#8E918F] checked:border-[#A8C7FA] checked:bg-[#A8C7FA] transition-colors cursor-pointer"
                    />
                    {acknowledged && (
                      <Check className="absolute w-4 h-4 text-white pointer-events-none" />
                    )}
                  </div>
                  <span className="text-[14px] text-[#C4C7C5] leading-snug">
                    I have saved my recovery phrase. I understand it cannot be
                    recovered if lost.
                  </span>
                </label>

                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => {
                      setError(null);
                      setStep("confirm");
                    }}
                    disabled={!acknowledged}
                    className={primaryBtn}
                  >
                    Continue <ArrowRight className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setStep("password")}
                    className={ghostBtn}
                  >
                    Back to Password
                  </button>
                </div>
              </motion.div>
            )}

            {/* ---------------- STEP 3: confirm phrase ---------------- */}
            {step === "confirm" && (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="space-y-6"
              >
                <p className="text-[15px] text-[#8E918F] leading-relaxed text-center">
                  Confirm you saved it. Enter the following words from your
                  recovery phrase.
                </p>

                <div className="space-y-5">
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
                        className={`${inputClass} `}
                        placeholder={`Enter word ${i + 1}`}
                      />
                    </div>
                  ))}
                </div>

                <div className="space-y-2 pt-4">
                  <button
                    onClick={confirmAndFinish}
                    disabled={
                      loading ||
                      challenge.some((i) => !(answers[i] ?? "").trim())
                    }
                    className={primaryBtn}
                  >
                    {loading ? (
                      <FaSpinner className="animate-spin w-5 h-5" />
                    ) : (
                      <>
                        Create Vault <Check className="w-5 h-5 ml-1" />
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
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  );
}
