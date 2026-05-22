"use client";

import {
  useMemo,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ElementType,
  type CSSProperties,
} from "react";
import {
  Eye,
  EyeOff,
  RefreshCw,
  Copy,
  Check,
  Shield,
  AlertTriangle,
  Info,
  Settings2,
  Activity,
  Lock,
  Zap,
} from "lucide-react";
import {
  analyzePassword,
  generatePassword,
  type GenerateOptions,
  type GenerateResult,
} from "./checker";

// --- Type Definitions ---

interface CustomCSS extends CSSProperties {
  WebkitTextSecurity?: "none" | "disc" | "circle" | "square";
}

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: ElementType;
  subtitle?: string;
  colorClass?: string;
}

// --- Configuration ---

// Professional, flat colors for enterprise look
const SCORE_COLORS = [
  {
    text: "text-rose-500",
    bg: "bg-rose-500",
    border: "border-rose-500/20",
    lightBg: "bg-rose-500/10",
  },
  {
    text: "text-orange-500",
    bg: "bg-orange-500",
    border: "border-orange-500/20",
    lightBg: "bg-orange-500/10",
  },
  {
    text: "text-yellow-500",
    bg: "bg-yellow-500",
    border: "border-yellow-500/20",
    lightBg: "bg-yellow-500/10",
  },
  {
    text: "text-lime-500",
    bg: "bg-lime-500",
    border: "border-lime-500/20",
    lightBg: "bg-lime-500/10",
  },
  {
    text: "text-emerald-500",
    bg: "bg-emerald-500",
    border: "border-emerald-500/20",
    lightBg: "bg-emerald-500/10",
  },
];

function scoreFromBits(bits: number): number {
  if (bits < 30) return 0;
  if (bits < 50) return 1;
  if (bits < 70) return 2;
  if (bits < 100) return 3;
  return 4;
}

// --- Sub-components ---

function DashboardMeter({ score }: { score: number }) {
  const activeColor = SCORE_COLORS[score];

  return (
    <div className="flex gap-2 w-full h-2.5">
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={`flex-1 rounded-sm transition-colors duration-500 ease-out ${
            i <= score ? activeColor.bg : "bg-zinc-800"
          }`}
        />
      ))}
    </div>
  );
}

function MetricCard({
  title,
  value,
  icon: Icon,
  subtitle,
  colorClass = "text-zinc-100",
}: MetricCardProps) {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-6 flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-zinc-400">{title}</span>
        <Icon className="w-5 h-5 text-zinc-500" />
      </div>
      <div>
        <div className={`text-3xl font-semibold tracking-tight ${colorClass}`}>
          {value}
        </div>
        {subtitle && (
          <div className="text-sm text-zinc-500 mt-2">{subtitle}</div>
        )}
      </div>
    </div>
  );
}

// --- Main Component ---

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
    const timer = setTimeout(() => {
      setGenerated(generatePassword(initialOptsRef.current));
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const regenerate = useCallback(
    (next = opts) => {
      try {
        setGenerated(generatePassword(next));
        setCopied(false);
      } catch {
        // Ignored if user deselects all options
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

  const activeColor = SCORE_COLORS[result.score];
  const genScore = scoreFromBits(generated.entropyBits);
  const genColor = SCORE_COLORS[genScore];

  if (!mounted) return <div className="min-h-screen bg-[#09090b]" />;

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-300  selection:bg-zinc-800 selection:text-white flex flex-col">
      {/* Top Navigation Bar */}
      <header className=" bg-[#09090b]/80 pt-20 backdrop-blur-xl border-b border-zinc-800/80 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg">
            <Shield className="w-5 h-5 text-zinc-100" />
          </div>
          <h1 className="text-xl font-semibold text-zinc-100 tracking-tight">
            Security Workspace
          </h1>
        </div>

        {/* Dashboard Segmented Control */}
        <div className="flex p-1 bg-zinc-900/80 border border-zinc-800/80 rounded-xl w-full sm:w-auto">
          <button
            className={`flex-1 sm:w-32 py-2 text-sm font-medium rounded-lg transition-all ${
              mode === "analyze"
                ? "bg-zinc-800 text-zinc-100 shadow-sm border border-zinc-700/50"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
            onClick={() => setMode("analyze")}
          >
            Analysis
          </button>
          <button
            className={`flex-1 sm:w-32 py-2 text-sm font-medium rounded-lg transition-all ${
              mode === "generate"
                ? "bg-zinc-800 text-zinc-100 shadow-sm border border-zinc-700/50"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
            onClick={() => setMode("generate")}
          >
            Generator
          </button>
        </div>
      </header>

      {/* Main Dashboard Canvas */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500">
        {mode === "analyze" ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            {/* Left Column: Input Action */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-6 h-full flex flex-col">
                <h2 className="text-lg font-medium text-zinc-100 mb-6 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-zinc-400" /> Target Password
                </h2>

                <div className="relative group flex-1">
                  <textarea
                    className="w-full h-40 bg-[#09090b] border border-zinc-800 rounded-xl py-4 pl-4 pr-12 text-zinc-100 font-mono text-lg outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all placeholder:text-zinc-600 resize-none shadow-inner"
                    value={pw}
                    autoFocus
                    spellCheck={false}
                    placeholder="Enter payload to analyze..."
                    onChange={(e) => setPw(e.target.value)}
                    style={
                      {
                        WebkitTextSecurity: reveal ? "none" : "disc",
                      } as CustomCSS
                    }
                  />
                  <button
                    className="absolute right-3 top-3 p-2 text-zinc-500 hover:text-zinc-300 transition-colors rounded-lg bg-[#09090b]"
                    onClick={() => setReveal((r) => !r)}
                    title={reveal ? "Hide" : "Show"}
                  >
                    {reveal ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Analytics Metrics */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              {/* Strength Meter Card */}
              <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-6">
                <div className="flex justify-between items-end mb-4">
                  <span className="text-sm font-medium text-zinc-400">
                    Security Index
                  </span>
                  <span className={`text-lg font-semibold ${activeColor.text}`}>
                    {pw ? result.label : "Awaiting Input"}
                  </span>
                </div>
                <DashboardMeter score={result.score} />
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <MetricCard
                  title="Entropy Value"
                  value={`${result.entropyBits} bits`}
                  icon={Activity}
                  subtitle="Mathematical unpredictability"
                />
                <MetricCard
                  title="Est. Crack Time"
                  value={result.crackTime}
                  icon={Zap}
                  subtitle="Using high-end GPU cluster"
                />
              </div>

              {/* Feedback Console */}
              {(result.warnings.length > 0 ||
                result.suggestions.length > 0) && (
                <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-6">
                  <h3 className="text-sm font-medium text-zinc-400 mb-4">
                    Audit Logs
                  </h3>
                  <div className="flex flex-col gap-3">
                    {result.warnings.map((w, i) => (
                      <div
                        key={`w${i}`}
                        className="text-sm px-4 py-3 bg-rose-500/10 text-rose-300 rounded-xl border border-rose-500/20 flex items-start gap-3"
                      >
                        <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                        <span className="leading-relaxed">{w}</span>
                      </div>
                    ))}
                    {result.suggestions.map((s, i) => (
                      <div
                        key={`s${i}`}
                        className="text-sm px-4 py-3 bg-zinc-950 text-zinc-400 rounded-xl border border-zinc-800/80 flex items-start gap-3"
                      >
                        <Info className="w-4 h-4 mt-0.5 shrink-0 text-zinc-500" />
                        <span className="leading-relaxed">{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            {/* Left Column: Output & Controls */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              {/* Output Display */}
              <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-6 lg:p-8">
                <h2 className="text-sm font-medium text-zinc-400 mb-4">
                  Generated Credential
                </h2>
                <div className="flex items-center gap-4 bg-[#09090b] border border-zinc-800/80 p-4 rounded-xl shadow-inner mb-6">
                  <code
                    className={`flex-1 font-mono text-xl sm:text-2xl break-all ${genColor.text}`}
                  >
                    {generated.password}
                  </code>
                  <div className="flex gap-2 shrink-0">
                    <button
                      className="w-12 h-12 flex items-center justify-center border border-zinc-700 bg-zinc-800 rounded-xl text-zinc-300 hover:text-white hover:border-zinc-500 transition-all"
                      onClick={() => regenerate()}
                      title="Regenerate"
                    >
                      <RefreshCw className="w-5 h-5" />
                    </button>
                    <button
                      className={`w-12 h-12 flex items-center justify-center border rounded-xl transition-all ${
                        copied
                          ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-500"
                          : "border-zinc-700 bg-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-500"
                      }`}
                      onClick={copy}
                      title="Copy to clipboard"
                    >
                      {copied ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-end mb-3 mt-8">
                  <span className="text-sm font-medium text-zinc-400">
                    Generation Strength
                  </span>
                  <span className="text-sm font-mono text-zinc-500">
                    {generated.entropyBits} bits
                  </span>
                </div>
                <DashboardMeter score={genScore} />
              </div>

              {/* Policy Controls */}
              <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-6 lg:p-8">
                <h2 className="text-lg font-medium text-zinc-100 mb-8 flex items-center gap-2">
                  <Settings2 className="w-5 h-5 text-zinc-400" /> Security
                  Policy
                </h2>

                {/* Length Slider */}
                <div className="mb-10">
                  <div className="flex justify-between items-end mb-4">
                    <span className="text-sm font-medium text-zinc-400">
                      String Length
                    </span>
                    <span className="text-2xl font-mono font-medium text-zinc-100">
                      {opts.length}
                    </span>
                  </div>
                  <input
                    className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-300"
                    type="range"
                    min={8}
                    max={128}
                    value={opts.length}
                    onChange={(e) => setOpt({ length: Number(e.target.value) })}
                  />
                </div>

                {/* Character Sets Grid */}
                <div>
                  <span className="block text-sm font-medium text-zinc-400 mb-4">
                    Allowed Characters
                  </span>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {(
                      [
                        ["lowercase", "Lowercase (a-z)"],
                        ["uppercase", "Uppercase (A-Z)"],
                        ["digits", "Numbers (0-9)"],
                        ["symbols", "Symbols (!@#)"],
                        ["avoidAmbiguous", "Exclude Ambiguous"],
                      ] as const
                    ).map(([key, lbl]) => (
                      <button
                        key={key}
                        className={`px-4 py-3 border rounded-xl text-sm font-medium transition-all text-left flex justify-between items-center ${
                          opts[key]
                            ? "bg-zinc-100 text-zinc-900 border-zinc-200"
                            : "bg-[#09090b] text-zinc-400 border-zinc-800 hover:border-zinc-600"
                        }`}
                        onClick={() => setOpt({ [key]: !opts[key] })}
                      >
                        {lbl}
                        <div
                          className={`w-2 h-2 rounded-full ${opts[key] ? "bg-zinc-900" : "bg-transparent"}`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Generation Stats */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <MetricCard
                title="Resulting Entropy"
                value={`${generated.entropyBits} bits`}
                icon={Activity}
                colorClass={genColor.text}
                subtitle="Based on selected policy parameters"
              />
              <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-6 flex-1 flex flex-col justify-center">
                <Shield className="w-12 h-12 text-zinc-700 mb-6" />
                <h3 className="text-lg font-medium text-zinc-200 mb-2">
                  Zero-Knowledge Architecture
                </h3>
                <p className="text-zinc-500 text-sm leading-relaxed">
                  All password generation and analysis happens entirely in your
                  local browser memory. No data is ever transmitted, logged, or
                  stored on external servers.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
