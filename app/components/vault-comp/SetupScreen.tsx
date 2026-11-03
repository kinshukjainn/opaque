"use client";

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

// Material 3 Expressive Spring Physics
const m3SpatialSpring = {
  type: "spring" as const,
  stiffness: 420,
  damping: 32,
  mass: 0.9,
};

// --- simple, dependency-free strength heuristic ---
function scorePassword(pw: string) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;

  // Material You Tonal Colors
  const levels = [
    { label: "Too weak", pct: 20, color: "#F2B8B5" }, // Red Tonal
    { label: "Weak", pct: 40, color: "#FFB4A1" }, // Orange Tonal
    { label: "Fair", pct: 60, color: "#F9BC05" }, // Yellow Tonal
    { label: "Good", pct: 80, color: "#81C995" }, // Green Tonal
    { label: "Strong", pct: 100, color: "#1B7F3B" }, // Deep Green
  ];
  return levels[Math.max(0, Math.min(s, 5) - 1)];
}

// pick 3 distinct word positions to quiz
function pickChallenge(): number[] {
  const idx = [...Array(12).keys()];
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return idx.slice(0, 3).sort((a, b) => a - b);
}

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
      const phrase = await beginSetup(pw);
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
      await finalizeSetup();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Setup failed.");
      setLoading(false);
    }
  };

  // Borderless M3 Styling Variables
  const inputClass =
    "w-full px-5 py-4 bg-gray-100 dark:bg-[#1A1A1A] border-none focus:ring-4 focus:ring-[#EADDFF] dark:focus:ring-[#4A3C68] transition-all text-[16px] text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 outline-none rounded-[20px] font-medium";
  const labelClass =
    "block text-[14px] font-semibold text-gray-700 dark:text-gray-300 mb-2 pl-2 tracking-wide";

  const primaryBtn =
    "w-full flex items-center justify-center gap-2 py-4 px-6 font-semibold text-[16px] bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black rounded-[24px] hover:rounded-[16px] active:rounded-[12px] cursor-pointer transition-[border-radius,background-color,transform] duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] border-none";

  const ghostBtn =
    "w-full text-center text-[15px] font-semibold py-3 cursor-pointer text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors border-none";

  return (
    <div className="min-h-screen pt-24 flex items-center justify-center bg-white dark:bg-[#050505] text-[#111318] dark:text-[#E2E2E9] px-4 sm:px-6 py-12 selection:bg-[#EADDFF] selection:text-[#21005D] dark:selection:bg-[#4A3C68] dark:selection:text-[#EADDFF]">
      {/* Massive Borderless Setup Card */}
      <motion.div
        layout
        className="w-full max-w-[600px] bg-white dark:bg-[#0A0A0A] rounded-[40px] p-6 sm:p-10 md:p-12 border-none"
      >
        {/* Header & M3 Segmented Step Tracker */}
        <motion.div
          layout
          className="flex flex-col items-center text-center mb-10"
        >
          <div className="w-16 h-16 flex items-center justify-center rounded-[20px] bg-[#EADDFF] dark:bg-[#4A3C68] text-[#21005D] dark:text-[#EADDFF] mb-6">
            {step === "password" ? (
              <KeyRound className="w-8 h-8" />
            ) : (
              <ShieldCheck className="w-8 h-8" />
            )}
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-black dark:text-white tracking-tight mb-8">
            Set up your vault
          </h1>

          {/* Step Tracker Pill */}
          <div className="flex p-1 bg-gray-100 dark:bg-[#1A1A1A] rounded-full w-full max-w-[420px] mx-auto overflow-hidden">
            {[
              { id: "password", label: "Password" },
              { id: "reveal", label: "Phrase" },
              { id: "confirm", label: "Verify" },
            ].map((s, i) => {
              const isActive = step === s.id;
              const isPast =
                (step === "reveal" && i === 0) ||
                (step === "confirm" && (i === 0 || i === 1));

              return (
                <div
                  key={s.id}
                  className={`relative flex-1 text-center py-2.5 text-[13px] sm:text-[14px] font-bold transition-colors duration-200 z-10 ${
                    isActive
                      ? "text-[#21005D] dark:text-[#EADDFF]"
                      : isPast
                        ? "text-black dark:text-white"
                        : "text-gray-400 dark:text-gray-500"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="step-indicator"
                      className="absolute inset-0 bg-[#EADDFF] dark:bg-[#4A3C68] rounded-full -z-10"
                      transition={m3SpatialSpring}
                    />
                  )}
                  {s.label}
                </div>
              );
            })}
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
              transition={m3SpatialSpring}
              className="mb-8 p-4 bg-[#FCE8E6] dark:bg-[#3B1212] rounded-[20px] flex items-start gap-3 border-none"
            >
              <AlertTriangle className="w-5 h-5 text-[#8C1D18] dark:text-[#F2B8B5] shrink-0 mt-0.5" />
              <span className="text-[14px] font-semibold text-[#8C1D18] dark:text-[#F2B8B5] leading-relaxed">
                {error}
              </span>
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
                transition={m3SpatialSpring}
                className="space-y-6"
              >
                {/* Material Warning Tonal */}
                <div className="p-5 bg-[#FCE8E6] dark:bg-[#3B1212] rounded-[24px] flex gap-4 border-none">
                  <ShieldAlert className="w-6 h-6 text-[#8C1D18] dark:text-[#F2B8B5] shrink-0 mt-0.5" />
                  <p className="text-[14px] text-[#8C1D18] dark:text-[#F2B8B5] leading-relaxed font-medium">
                    Your master password encrypts everything and is never sent
                    to our servers. We{" "}
                    <strong className="font-bold">cannot</strong> reset it if
                    you forget it, only your recovery phrase can get you back
                    in.
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
                        className={`${inputClass} pr-14 ${!showPw && pw ? "tracking-[0.25em] text-lg py-3.5" : ""}`}
                        placeholder="At least 8 characters master password"
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

                    {/* Fluid Strength Meter */}
                    <AnimatePresence>
                      {pw && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 px-2"
                        >
                          <div className="h-1.5 w-full bg-gray-200 dark:bg-[#282A2C] rounded-full overflow-hidden">
                            <motion.div
                              className="h-full rounded-full"
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
                            className="text-[12px] font-bold mt-2 uppercase tracking-wider"
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
                      className={`${inputClass} ${!showPw && confirmPw ? "tracking-[0.25em] text-lg py-3.5" : ""}`}
                      placeholder="Re-enter your master password"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={createPassword}
                    disabled={loading || !pw || !confirmPw}
                    className={primaryBtn}
                  >
                    {loading ? (
                      <FaSpinner className="animate-spin w-5 h-5" />
                    ) : (
                      "Go to Seed phrase"
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
                transition={m3SpatialSpring}
                className="space-y-6"
              >
                <p className="text-[15px] text-gray-600 dark:text-gray-400 leading-relaxed text-center font-medium px-2">
                  This is your{" "}
                  <strong className="text-[#21005D] dark:text-[#EADDFF] font-bold">
                    recovery phrase
                  </strong>{" "}
                  — the only way back in if you forget your master password.
                  Write it down and store it somewhere safe. It will{" "}
                  <strong className="text-[#21005D] dark:text-[#EADDFF] font-bold">
                    never be shown again
                  </strong>
                  .
                </p>

                {/* Android Native-Style Chips (Soft Purple Tonal) */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {words.map((w, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 px-3 py-3 bg-[#EADDFF] dark:bg-[#4A3C68] rounded-[16px] border-none"
                    >
                      <span className="text-[13px] font-bold text-[#21005D]/60 dark:text-[#EADDFF]/60  w-4 text-right select-none">
                        {i + 1}
                      </span>
                      <span className="text-[15px] font-bold text-[#21005D] dark:text-[#EADDFF]  truncate">
                        {w}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={copyPhrase}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 text-[14px] font-bold bg-gray-100 dark:bg-[#1A1A1A] hover:bg-gray-200 dark:hover:bg-[#252525] cursor-pointer rounded-[16px] text-black dark:text-white transition-colors border-none"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                    {copied ? "Copied" : "Copy"}
                  </button>
                  <button
                    onClick={downloadPhrase}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 text-[14px] font-bold bg-gray-100 dark:bg-[#1A1A1A] hover:bg-gray-200 dark:hover:bg-[#252525] cursor-pointer rounded-[16px] text-black dark:text-white transition-colors border-none"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>

                <label className="flex items-center gap-4 cursor-pointer select-none p-4 rounded-[20px] hover:bg-gray-50 dark:hover:bg-[#111] transition-colors border-none">
                  <div className="relative flex items-center justify-center w-7 h-7 shrink-0">
                    <input
                      type="checkbox"
                      checked={acknowledged}
                      onChange={(e) => setAcknowledged(e.target.checked)}
                      className="appearance-none w-7 h-7 rounded-full bg-gray-200 dark:bg-[#282A2C] checked:bg-black dark:checked:bg-white transition-colors cursor-pointer border-none"
                    />
                    {acknowledged && (
                      <Check className="absolute w-5 h-5 text-white dark:text-black pointer-events-none" />
                    )}
                  </div>
                  <span className="text-[14px] text-gray-700 dark:text-gray-300 leading-snug font-medium">
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
                transition={m3SpatialSpring}
                className="space-y-6"
              >
                <p className="text-[15px] text-gray-600 dark:text-gray-400 leading-relaxed text-center font-medium px-2">
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
                        className={`${inputClass}  text-lg`}
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
