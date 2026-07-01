"use client";

import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import { Copy, RefreshCw, Eye, EyeOff } from "lucide-react";
import {
  analyzePassword,
  generatePassword,
  type GenerateOptions,
  type GenerateResult,
} from "./checker";

// --- Flat Configuration ---
const SCORE_COLORS = [
  "text-red-500 bg-red-500",
  "text-orange-500 bg-orange-500",
  "text-yellow-500 bg-yellow-500",
  "text-lime-500 bg-lime-500",
  "text-green-500 bg-green-500",
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

  if (!mounted) return <div className="p-4 text-gray-500">Loading...</div>;

  const activeColor = SCORE_COLORS[result.score];
  const genScore = scoreFromBits(generated.entropyBits);
  const genColor = SCORE_COLORS[genScore];

  return (
    <div className="w-full pt-20 max-w-4xl mx-auto p-6 bg-transparent text-gray-200 ">
      {/* Flat Tabs */}
      <div className="flex border-b border-gray-700 mb-8">
        <button
          className={`px-6 py-3 cursor-pointer text-sm font-bold ${
            mode === "analyze"
              ? "border-b-2 border-green-500 text-green-500"
              : "text-gray-500"
          }`}
          onClick={() => setMode("analyze")}
        >
          ANALYSIS
        </button>
        <button
          className={`px-6 py-3 cursor-pointer text-sm font-bold ${
            mode === "generate"
              ? "border-b-2 border-green-500 text-green-500"
              : "text-gray-500"
          }`}
          onClick={() => setMode("generate")}
        >
          GENERATOR
        </button>
      </div>

      {/* Mode: Analyze */}
      {mode === "analyze" && (
        <div className="flex flex-col gap-8">
          <div>
            <label className="block text-md text-gray-100 mb-2">
              Target Password
            </label>
            <div className="relative flex">
              <input
                type={reveal ? "text" : "password"}
                className="w-full bg-gray-900 border border-gray-700 p-2 rounded-md text-lg text-white outline-none"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                placeholder="Enter password to evaluate..."
              />
              <button
                className="absolute cursor-pointer right-4 top-4 text-gray-200"
                onClick={() => setReveal(!reveal)}
              >
                {reveal ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="border border-gray-700 rounded-lg p-6 bg-gray-900">
            <div className="flex justify-between items-center mb-4">
              <span className="text-green-400">
                Security Index:{" "}
                <strong className="text-white">
                  {pw ? result.label : "N/A"}
                </strong>
              </span>
              <span className="text-green-400">
                Entropy:{" "}
                <strong className="text-white">
                  {result.entropyBits} bits
                </strong>
              </span>
              <span className="text-green-400">
                Crack Time:{" "}
                <strong className="text-white">{result.crackTime}</strong>
              </span>
            </div>

            {/* Flat Meter */}
            <div className="flex gap-1 w-full h-2">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`flex-1 ${
                    i <= result.score
                      ? activeColor.split(" ")[1]
                      : "bg-gray-400"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Flat Logs */}
          {(result.warnings.length > 0 || result.suggestions.length > 0) && (
            <div className="border border-gray-700 p-6 bg-gray-900 rounded-lg">
              <h3 className="text-sm font-bold text-gray-100 mb-4 uppercase">
                Audit Logs
              </h3>
              <ul className="space-y-2 text-sm">
                {result.warnings.map((w, i) => (
                  <li key={i} className="text-red-400">
                    • {w}
                  </li>
                ))}
                {result.suggestions.map((s, i) => (
                  <li key={i} className="text-blue-400">
                    • {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Mode: Generate */}
      {mode === "generate" && (
        <div className="flex flex-col gap-8">
          {/* Output Box */}
          <div className="border border-gray-700 p-6 bg-gray-900 rounded-lg">
            <label className="block text-md text-gray-100 mb-2">
              Generated Credential
            </label>
            <div className="flex gap-4 mb-4">
              <input
                type="text"
                readOnly
                value={generated.password}
                className="w-full rounded-lg bg-blue-300 border border-gray-700 font-semibold p-1 text-lg  text-black outline-none"
              />
              <button
                onClick={() => regenerate()}
                className="bg-gray-800 border border-gray-700 px-3 py-1 rounded-lg text-white hover:bg-gray-700"
              >
                <RefreshCw size={20} />
              </button>
              <button
                onClick={copy}
                className="bg-blue-600 border border-blue-600 px-3 py-1 rounded-lg text-white hover:bg-blue-700"
              >
                {copied ? "Copied" : <Copy size={20} />}
              </button>
            </div>

            <div className="flex gap-1 rounded-lg w-full h-2">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`flex-1 ${
                    i <= genScore ? genColor.split(" ")[1] : "bg-gray-800"
                  }`}
                />
              ))}
            </div>
            <div className="text-right text-sm text-gray-400 mt-2">
              Strength: {generated.entropyBits} bits
            </div>
          </div>

          {/* Simple Policy Controls */}
          <div className="border border-gray-700 p-6 bg-gray-900">
            <h3 className="text-sm font-bold text-gray-400 mb-6 uppercase">
              Parameters
            </h3>

            <div className="mb-8">
              <label className="flex justify-between text-white mb-2">
                <span>Length</span>
                <span>{opts.length}</span>
              </label>
              <input
                type="range"
                min={8}
                max={128}
                value={opts.length}
                onChange={(e) => setOpt({ length: Number(e.target.value) })}
                className="w-full"
              />
            </div>

            <div className="flex flex-col gap-4">
              <span className="text-sm text-gray-400">Character Sets</span>
              <div className="grid grid-cols-2 gap-4">
                {[
                  ["lowercase", "Lower (a-z)"],
                  ["uppercase", "Upper (A-Z)"],
                  ["digits", "Numbers (0-9)"],
                  ["symbols", "Symbols (!@#)"],
                  ["avoidAmbiguous", "Exclude Ambiguous"],
                ].map(([key, lbl]) => (
                  <label
                    key={key}
                    className="flex items-center gap-3 cursor-pointer text-white"
                  >
                    <input
                      type="checkbox"
                      checked={opts[key as keyof GenerateOptions] as boolean}
                      onChange={() =>
                        setOpt({ [key]: !opts[key as keyof GenerateOptions] })
                      }
                      className="w-4 h-4"
                    />
                    {lbl}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
