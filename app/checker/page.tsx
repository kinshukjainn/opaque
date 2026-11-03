"use client";

import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Copy,
  RefreshCw,
  Eye,
  EyeOff,
  ShieldCheck,
  Clock,
  Hash,
  AlertTriangle,
  Lightbulb,
} from "lucide-react";
import {
  analyzePassword,
  generatePassword,
  type GenerateOptions,
  type GenerateResult,
} from "./checker";

// Material 3 Expressive Spring Physics
const m3SpatialSpring = {
  type: "spring" as const,
  stiffness: 420,
  damping: 32,
  mass: 0.9,
};

// --- Flat Configuration ---
const SCORE_COLORS = [
  "text-red-600 bg-red-600 dark:text-red-500 dark:bg-red-500",
  "text-orange-600 bg-orange-600 dark:text-orange-500 dark:bg-orange-500",
  "text-yellow-500 bg-yellow-500 dark:text-yellow-500 dark:bg-yellow-500",
  "text-lime-500 bg-lime-500 dark:text-lime-500 dark:bg-lime-500",
  "text-green-600 bg-green-600 dark:text-green-500 dark:bg-green-500",
];

function scoreFromBits(bits: number): number {
  if (bits < 30) return 0;
  if (bits < 50) return 1;
  if (bits < 70) return 2;
  if (bits < 100) return 3;
  return 4;
}

export default function PasswordDashboard() {
  const [mode, setMode] = useState<"analyze" | "generate">("analyze");
  const [mounted, setMounted] = useState(false);

  // Analyze State
  const [pw, setPw] = useState("");
  const [reveal, setReveal] = useState(false);
  const result = useMemo(() => analyzePassword(pw), [pw]);

  // Generate State
  const [opts, setOpts] = useState<Required<GenerateOptions>>({
    length: 20,
    lowercase: true,
    uppercase: true,
    digits: true,
    symbols: true,
    avoidAmbiguous: false,
  });

  const [generated, setGenerated] = useState<GenerateResult>({
    password: "",
    entropyBits: 0,
  });
  const [copied, setCopied] = useState(false);
  const initialOptsRef = useRef(opts);

  useEffect(() => {
    setGenerated(generatePassword(initialOptsRef.current));
    setMounted(true);
  }, []);

  const regenerate = useCallback(
    (next = opts) => {
      try {
        setGenerated(generatePassword(next));
        setCopied(false);
      } catch {
        // Fallback
      }
    },
    [opts],
  );

  const setOpt = (patch: Partial<GenerateOptions>) => {
    const next = { ...opts, ...patch } as Required<GenerateOptions>;
    setOpts(next);
    regenerate(next);
  };

  const copy = async () => {
    if (!generated.password) return;
    await navigator.clipboard.writeText(generated.password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!mounted)
    return (
      <div className="p-8 text-gray-500 text-sm flex items-center justify-center min-h-screen bg-white dark:bg-[#050505]">
        Loading workspace...
      </div>
    );

  const activeColor = SCORE_COLORS[result.score];
  const genScore = scoreFromBits(generated.entropyBits);
  const genColor = SCORE_COLORS[genScore];

  return (
    <div className="w-full min-h-screen pt-24 pb-12 px-4 sm:px-6 md:px-8 mx-auto max-w-5xl bg-white dark:bg-black text-[#111318] dark:text-[#E2E2E9] transition-colors duration-200">
      {/* Workspace Header & Tabs (Borderless M3 Style) */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-black dark:text-white">
          Checker and Generator
        </h1>

        {/* M3 Segmented Button / Pill Track */}
        <div className="flex p-1 bg-gray-100 dark:bg-[#1A1A1A] rounded-full w-fit">
          <button
            className={`relative px-5 py-2 text-[14px] font-semibold transition-colors duration-200 rounded-full z-10 ${
              mode === "analyze"
                ? "text-[#21005D] dark:text-[#EADDFF]"
                : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-300"
            }`}
            onClick={() => setMode("analyze")}
          >
            {mode === "analyze" && (
              <motion.div
                layoutId="active-tab"
                className="absolute inset-0 bg-[#EADDFF] dark:bg-[#4A3C68] rounded-full -z-10"
                transition={m3SpatialSpring}
              />
            )}
            Analysis
          </button>
          <button
            className={`relative px-5 py-2 text-[14px] font-semibold transition-colors duration-200 rounded-full z-10 ${
              mode === "generate"
                ? "text-[#21005D] dark:text-[#EADDFF]"
                : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-300"
            }`}
            onClick={() => setMode("generate")}
          >
            {mode === "generate" && (
              <motion.div
                layoutId="active-tab"
                className="absolute inset-0 bg-[#EADDFF] dark:bg-[#4A3C68] rounded-full -z-10"
                transition={m3SpatialSpring}
              />
            )}
            Generator
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* ─────────────────────────────────────────────────────────
            MODE: ANALYZE (Compact Dashboard Layout)
            ───────────────────────────────────────────────────────── */}
        {mode === "analyze" && (
          <motion.div
            key="analyze"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={m3SpatialSpring}
            className="flex flex-col gap-6"
          >
            {/* Compact Hero Input Field */}
            <div className="w-full">
              <div className="relative flex items-center">
                <input
                  type={reveal ? "text" : "password"}
                  className="w-full bg-gray-100 dark:bg-[#121212] border-none focus:ring-4 focus:ring-[#EADDFF] dark:focus:ring-[#4A3C68]/50 transition-all p-4 md:p-5 rounded-[24px] text-xl md:text-2xl text-black dark:text-white outline-none placeholder-gray-400 dark:placeholder-gray-600 "
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  placeholder="Enter password to analyze..."
                />
                <button
                  className="absolute cursor-pointer right-3 p-2.5 bg-white dark:bg-[#252525] hover:bg-gray-50 dark:hover:bg-[#333] text-gray-700 dark:text-gray-300 transition-all rounded-full"
                  onClick={() => setReveal(!reveal)}
                  aria-label="Toggle password visibility"
                >
                  {reveal ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Compact Metrics Grid Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
              {/* Card 1: Security Index */}
              <div className="p-5 md:p-6 rounded-[24px] bg-gray-50 dark:bg-[#111111] border-none flex flex-col gap-1">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider text-xs mb-1">
                  <ShieldCheck
                    size={16}
                    className={pw ? activeColor.split(" ")[0] : ""}
                  />
                  Security Index
                </div>
                <div className="text-2xl md:text-3xl font-bold text-black dark:text-white">
                  {pw ? result.label : "N/A"}
                </div>

                {/* Meter inside the card */}
                <div className="flex gap-1 w-full h-2 rounded-full overflow-hidden mt-4">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`flex-1 rounded-full transition-colors duration-500 ${
                        i <= result.score && pw
                          ? activeColor.split(" ")[1]
                          : "bg-gray-200 dark:bg-[#282A2C]"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Card 2: Entropy */}
              <div className="p-5 md:p-6 rounded-[24px] bg-gray-50 dark:bg-[#111111] border-none flex flex-col gap-1">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider text-xs mb-1">
                  <Hash
                    size={16}
                    className="text-[#6A4EA0] dark:text-[#D0BCFF]"
                  />
                  Raw Entropy
                </div>
                <div className="text-2xl md:text-3xl font-bold text-black dark:text-white">
                  {pw ? `${result.entropyBits}` : "0"}{" "}
                  <span className="text-lg text-gray-400 font-medium">
                    bits
                  </span>
                </div>
                <p className="mt-2 text-gray-500 dark:text-gray-400 text-xs font-medium leading-relaxed">
                  Higher bits exponentially increase resistance to brute-force.
                </p>
              </div>

              {/* Card 3: Crack Time */}
              <div className="p-5 md:p-6 rounded-[24px] bg-gray-50 dark:bg-[#111111] border-none flex flex-col gap-1">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider text-xs mb-1">
                  <Clock size={16} className="text-orange-500" />
                  Est. Crack Time
                </div>
                <div className="text-2xl md:text-3xl font-bold text-black dark:text-white leading-tight">
                  {pw ? result.crackTime : "Instant"}
                </div>
                <p className="mt-2 text-gray-500 dark:text-gray-400 text-xs font-medium leading-relaxed">
                  Estimated time for a standard hardware setup to guess this.
                </p>
              </div>
            </div>

            {/* Compact Audit Logs Panel */}
            {(result.warnings.length > 0 || result.suggestions.length > 0) &&
              pw && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={m3SpatialSpring}
                  className="p-5 md:p-6 bg-gray-50 dark:bg-[#111111] rounded-[24px] w-full border-none"
                >
                  <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-4 uppercase tracking-wider">
                    Actionable Feedback
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Warnings Column */}
                    {result.warnings.length > 0 && (
                      <div className="flex flex-col gap-2">
                        {result.warnings.map((w, i) => (
                          <div
                            key={i}
                            className="flex gap-3 items-start p-3 bg-[#FCE8E6] dark:bg-[#3B1212] rounded-xl"
                          >
                            <AlertTriangle
                              className="text-[#8C1D18] dark:text-[#F2B8B5] shrink-0 mt-0.5"
                              size={18}
                            />
                            <span className="text-[#8C1D18] dark:text-[#F2B8B5] font-medium text-sm leading-snug">
                              {w}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    {/* Suggestions Column */}
                    {result.suggestions.length > 0 && (
                      <div className="flex flex-col gap-2">
                        {result.suggestions.map((s, i) => (
                          <div
                            key={i}
                            className="flex gap-3 items-start p-3 bg-[#EADDFF] dark:bg-[#4A3C68] rounded-xl"
                          >
                            <Lightbulb
                              className="text-[#6A4EA0] dark:text-[#D0BCFF] shrink-0 mt-0.5"
                              size={18}
                            />
                            <span className="text-[#21005D] dark:text-[#EADDFF] font-medium text-sm leading-snug">
                              {s}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
          </motion.div>
        )}

        {/* ─────────────────────────────────────────────────────────
            MODE: GENERATE (Compact Split Layout)
            ───────────────────────────────────────────────────────── */}
        {mode === "generate" && (
          <motion.div
            key="generate"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={m3SpatialSpring}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* Left Column: Output Display */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <div className="p-6 md:p-8 bg-gray-50 dark:bg-[#111111] border-none rounded-[24px] flex flex-col h-full relative">
                <label className="block text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider text-xs mb-4">
                  Your Secure Credential
                </label>

                <div className="flex-1 flex items-center justify-center min-h-[140px] mb-6">
                  <p className="w-full text-center text-2xl sm:text-3xl md:text-4xl  text-black dark:text-white break-all leading-tight font-bold selection:bg-[#EADDFF] dark:selection:bg-[#4A3C68]">
                    {generated.password}
                  </p>
                </div>

                {/* Strength Meter */}
                <div className="w-full mb-6">
                  <div className="flex justify-between items-end mb-2">
                    <span className="font-semibold text-sm text-black dark:text-white">
                      Strength
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 font-medium text-xs">
                      {generated.entropyBits} bits
                    </span>
                  </div>
                  <div className="flex gap-1.5 rounded-full w-full h-2 overflow-hidden">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`flex-1 rounded-full transition-colors duration-500 ${
                          i <= genScore
                            ? genColor.split(" ")[1]
                            : "bg-gray-200 dark:bg-[#282A2C]"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-auto">
                  <button
                    onClick={() => regenerate()}
                    className="bg-white dark:bg-[#1A1A1A] hover:bg-gray-100 dark:hover:bg-[#252525] text-black dark:text-white p-3.5 rounded-xl transition-all active:scale-[0.97] flex items-center justify-center gap-2 font-semibold text-sm border-none"
                  >
                    <RefreshCw size={18} />
                    Regenerate
                  </button>
                  <button
                    onClick={copy}
                    className={`${
                      copied
                        ? "bg-green-600 dark:bg-green-600 text-white"
                        : "bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
                    } p-3.5 rounded-xl transition-all active:scale-[0.97] flex items-center justify-center gap-2 font-semibold text-sm border-none`}
                  >
                    {copied ? (
                      <span className="flex items-center gap-2">Copied!</span>
                    ) : (
                      <>
                        <Copy size={18} /> Copy
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Controls */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <div className="p-5 md:p-6 bg-gray-50 dark:bg-[#111111] border-none rounded-[24px] h-full">
                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-5 uppercase tracking-wider">
                  Configuration
                </h3>

                {/* Length Slider */}
                <div className="mb-6">
                  <div className="flex justify-between items-center text-black dark:text-white mb-3 font-medium">
                    <span className="text-sm">Length</span>
                    <span className="font-bold text-lg bg-white dark:bg-[#1A1A1A] px-3 py-0.5 rounded-lg">
                      {opts.length}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={8}
                    max={128}
                    value={opts.length}
                    onChange={(e) => setOpt({ length: Number(e.target.value) })}
                    className="w-full h-1.5 bg-gray-200 dark:bg-[#282A2C] rounded-lg appearance-none cursor-pointer accent-[#6A4EA0] dark:accent-[#D0BCFF]"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400 mt-1.5 font-medium">
                    <span>8</span>
                    <span>128</span>
                  </div>
                </div>

                {/* Checkboxes List */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider mb-1">
                    Character Sets
                  </span>
                  {[
                    ["lowercase", "Lowercase (a-z)"],
                    ["uppercase", "Uppercase (A-Z)"],
                    ["digits", "Numbers (0-9)"],
                    ["symbols", "Symbols (!@#*)"],
                    ["avoidAmbiguous", "Exclude Ambiguous (l, I, O, 0)"],
                  ].map(([key, lbl]) => (
                    <label
                      key={key}
                      className="flex items-center justify-between p-2.5 px-3 bg-white dark:bg-[#1A1A1A] rounded-xl cursor-pointer group hover:bg-gray-100 dark:hover:bg-[#222222] transition-colors border-none"
                    >
                      <span className="text-gray-800 dark:text-white font-medium text-sm select-none">
                        {lbl}
                      </span>
                      <div className="relative flex items-center">
                        <input
                          type="checkbox"
                          checked={
                            opts[key as keyof GenerateOptions] as boolean
                          }
                          onChange={() =>
                            setOpt({
                              [key]: !opts[key as keyof GenerateOptions],
                            })
                          }
                          className="w-4 h-4 accent-[#6A4EA0] dark:accent-[#D0BCFF] cursor-pointer rounded border-none transition-all"
                        />
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
