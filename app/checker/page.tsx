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

// Material You Tonal Colors Mapping for Scores (0-4)
const SCORE_COLORS = [
  {
    text: "text-[#F2B8B5]", // Red Tonal
    bg: "bg-[#F2B8B5]",
    border: "border-[#601410]",
    lightBg: "bg-[#601410]",
  },
  {
    text: "text-[#FFB4A1]", // Orange Tonal
    bg: "bg-[#FFB4A1]",
    border: "border-[#8C3725]",
    lightBg: "bg-[#8C3725]",
  },
  {
    text: "text-[#F9BC05]", // Yellow Tonal
    bg: "bg-[#F9BC05]",
    border: "border-[#684C00]",
    lightBg: "bg-[#684C00]",
  },
  {
    text: "text-[#C4EDD0]", // Light Green Tonal
    bg: "bg-[#C4EDD0]",
    border: "border-[#0F5223]",
    lightBg: "bg-[#0F5223]",
  },
  {
    text: "text-[#81C995]", // Standard Green Tonal
    bg: "bg-[#81C995]",
    border: "border-[#0D652D]",
    lightBg: "bg-[#0D652D]",
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
    <div className="flex gap-2 w-full h-3">
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={`flex-1 rounded-full transition-colors duration-500 ease-out ${
            i <= score ? activeColor.bg : "bg-[#282A2C]"
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
  colorClass = "text-[#E2E2E2]",
}: MetricCardProps) {
  return (
    <div className="bg-[#131314] border border-[#282A2C] rounded-[32px] p-6 md:p-8 flex flex-col justify-between h-full hover:bg-[#1E1F20] transition-colors">
      <div className="flex items-center justify-between mb-6">
        <span className="text-[15px] font-medium text-[#8E918F]">{title}</span>
        <div className="w-10 h-10 rounded-full bg-[#1E1F20] flex items-center justify-center">
          <Icon className="w-5 h-5 text-[#C4C7C5]" />
        </div>
      </div>
      <div>
        <div className={`text-3xl font-semibold tracking-tight ${colorClass}`}>
          {value}
        </div>
        {subtitle && (
          <div className="text-[13px] text-[#8E918F] mt-2">{subtitle}</div>
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

  if (!mounted) return <div className="min-h-screen bg-[#000000]" />;

  return (
    <div className="min-h-screen bg-[#000000] text-[#E2E2E2] selection:bg-[#A8C7FA] selection:text-[#041E49] flex flex-col ">
      {/* Top Navigation Bar */}
      <header className="bg-[#000000]/80 pt-20 backdrop-blur-2xl border-b border-[#282A2C] px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-5 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#1E1F20] rounded-full flex items-center justify-center shadow-sm">
            <Shield className="w-6 h-6 text-[#A8C7FA]" />
          </div>
          <h1 className="text-xl font-normal text-[#E2E2E2] tracking-tight">
            Security Workspace
          </h1>
        </div>

        {/* Dashboard Segmented Control */}
        <div className="flex p-1.5 bg-[#1E1F20] rounded-full w-full sm:w-auto shadow-inner border border-[#282A2C]">
          <button
            className={`flex-1 sm:w-32 py-2.5 px-4 text-[14px] font-medium rounded-full transition-all ${
              mode === "analyze"
                ? "bg-[#A8C7FA] text-[#041E49] shadow-sm"
                : "text-[#C4C7C5] hover:text-[#E2E2E2]"
            }`}
            onClick={() => setMode("analyze")}
          >
            Analysis
          </button>
          <button
            className={`flex-1 sm:w-32 py-2.5 px-4 text-[14px] font-medium rounded-full transition-all ${
              mode === "generate"
                ? "bg-[#A8C7FA] text-[#041E49] shadow-sm"
                : "text-[#C4C7C5] hover:text-[#E2E2E2]"
            }`}
            onClick={() => setMode("generate")}
          >
            Generator
          </button>
        </div>
      </header>

      {/* Main Dashboard Canvas */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500 pb-32">
        {mode === "analyze" ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
            {/* Left Column: Input Action */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="bg-[#131314] border border-[#282A2C] rounded-[32px] p-6 md:p-8 h-full flex flex-col">
                <h2 className="text-lg font-medium text-[#E2E2E2] mb-6 flex items-center gap-3">
                  <div className="p-2 bg-[#1E1F20] rounded-full">
                    <Lock className="w-4 h-4 text-[#A8C7FA]" />
                  </div>
                  Target Password
                </h2>

                <div className="relative group flex-1">
                  <textarea
                    className="w-full h-48 bg-[#1E1F20] border-2 border-transparent rounded-[24px] py-6 pl-6 pr-14 text-[#E2E2E2] font-mono text-xl outline-none focus:bg-[#282A2C] focus:border-[#A8C7FA] transition-all placeholder:text-[#8E918F] resize-none"
                    value={pw}
                    autoFocus
                    spellCheck={false}
                    placeholder="Enter payload..."
                    onChange={(e) => setPw(e.target.value)}
                    style={
                      {
                        WebkitTextSecurity: reveal ? "none" : "disc",
                      } as CustomCSS
                    }
                  />
                  <button
                    className="absolute right-4 top-4 w-10 h-10 flex items-center justify-center text-[#8E918F] hover:text-[#E2E2E2] transition-colors rounded-full bg-[#131314] hover:bg-[#282A2C] border border-[#282A2C]"
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
            <div className="lg:col-span-7 flex flex-col gap-4 lg:gap-6">
              {/* Strength Meter Card */}
              <div className="bg-[#131314] border border-[#282A2C] rounded-[32px] p-6 md:p-8">
                <div className="flex justify-between items-end mb-6">
                  <span className="text-[15px] font-medium text-[#8E918F]">
                    Security Index
                  </span>
                  <span className={`text-xl font-semibold ${activeColor.text}`}>
                    {pw ? result.label : "Awaiting Input"}
                  </span>
                </div>
                <DashboardMeter score={result.score} />
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
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
                <div className="bg-[#131314] border border-[#282A2C] rounded-[32px] p-6 md:p-8">
                  <h3 className="text-[15px] font-medium text-[#8E918F] mb-6">
                    Audit Logs
                  </h3>
                  <div className="flex flex-col gap-3">
                    {result.warnings.map((w, i) => (
                      <div
                        key={`w${i}`}
                        className="text-[14px] px-5 py-4 bg-[#601410] text-[#F2B8B5] rounded-[24px] flex items-start gap-3"
                      >
                        <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0" />
                        <span className="leading-relaxed">{w}</span>
                      </div>
                    ))}
                    {result.suggestions.map((s, i) => (
                      <div
                        key={`s${i}`}
                        className="text-[14px] px-5 py-4 bg-[#1E1F20] text-[#E2E2E2] rounded-[24px] flex items-start gap-3"
                      >
                        <Info className="w-5 h-5 mt-0.5 shrink-0 text-[#A8C7FA]" />
                        <span className="leading-relaxed">{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
            {/* Left Column: Output & Controls */}
            <div className="lg:col-span-7 flex flex-col gap-4 lg:gap-6">
              {/* Output Display */}
              <div className="bg-[#131314] border border-[#282A2C] rounded-[32px] p-6 lg:p-10">
                <h2 className="text-[15px] font-medium text-[#8E918F] mb-6">
                  Generated Credential
                </h2>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-[#1E1F20] border border-[#282A2C] p-4 pl-6 rounded-[28px] mb-8">
                  <code
                    className={`flex-1 font-mono text-xl sm:text-2xl break-all tracking-wide ${genColor.text}`}
                  >
                    {generated.password}
                  </code>
                  <div className="flex gap-2 shrink-0 w-full sm:w-auto justify-end mt-2 sm:mt-0">
                    <button
                      className="w-12 h-12 flex items-center justify-center bg-[#282A2C] hover:bg-[#333537] rounded-full text-[#C4C7C5] hover:text-[#E2E2E2] transition-colors shadow-sm"
                      onClick={() => regenerate()}
                      title="Regenerate"
                    >
                      <RefreshCw className="w-5 h-5" />
                    </button>
                    <button
                      className={`w-12 h-12 flex items-center justify-center rounded-full transition-colors shadow-sm ${
                        copied
                          ? "bg-[#0F5223] text-[#C4EDD0]"
                          : "bg-[#A8C7FA] text-[#041E49] hover:bg-[#b9d3fc]"
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

                <div className="flex justify-between items-end mb-4">
                  <span className="text-[14px] font-medium text-[#8E918F]">
                    Generation Strength
                  </span>
                  <span className="text-[14px] font-mono font-medium text-[#E2E2E2]">
                    {generated.entropyBits} bits
                  </span>
                </div>
                <DashboardMeter score={genScore} />
              </div>

              {/* Policy Controls */}
              <div className="bg-[#131314] border border-[#282A2C] rounded-[32px] p-6 lg:p-10">
                <h2 className="text-xl font-medium text-[#E2E2E2] mb-8 flex items-center gap-3">
                  <div className="p-2.5 bg-[#1E1F20] rounded-full">
                    <Settings2 className="w-5 h-5 text-[#A8C7FA]" />
                  </div>
                  Security Policy
                </h2>

                {/* Length Slider */}
                <div className="mb-12">
                  <div className="flex justify-between items-end mb-6">
                    <span className="text-[15px] font-medium text-[#8E918F]">
                      String Length
                    </span>
                    <span className="text-3xl font-mono font-medium text-[#E2E2E2]">
                      {opts.length}
                    </span>
                  </div>
                  <input
                    className="w-full h-2 bg-[#282A2C] rounded-full appearance-none cursor-pointer accent-[#A8C7FA]"
                    type="range"
                    min={8}
                    max={128}
                    value={opts.length}
                    onChange={(e) => setOpt({ length: Number(e.target.value) })}
                  />
                </div>

                {/* Character Sets Grid */}
                <div>
                  <span className="block text-[15px] font-medium text-[#8E918F] mb-5">
                    Allowed Characters
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
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
                        className={`px-5 py-4 rounded-[24px] text-[14px] font-medium transition-all text-left flex justify-between items-center ${
                          opts[key]
                            ? "bg-[#A8C7FA] text-[#041E49]"
                            : "bg-[#1E1F20] text-[#C4C7C5] hover:bg-[#282A2C] hover:text-[#E2E2E2]"
                        }`}
                        onClick={() => setOpt({ [key]: !opts[key] })}
                      >
                        {lbl}
                        <div
                          className={`w-2.5 h-2.5 rounded-full ${opts[key] ? "bg-[#041E49]" : "bg-transparent"}`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Generation Stats */}
            <div className="lg:col-span-5 flex flex-col gap-4 lg:gap-6">
              <MetricCard
                title="Resulting Entropy"
                value={`${generated.entropyBits} bits`}
                icon={Activity}
                colorClass={genColor.text}
                subtitle="Based on selected policy parameters"
              />
              <div className="bg-[#131314] border border-[#282A2C] rounded-[32px] p-6 md:p-8 flex-1 flex flex-col justify-center">
                <div className="w-16 h-16 bg-[#1E1F20] rounded-full flex items-center justify-center mb-6">
                  <Shield className="w-8 h-8 text-[#A8C7FA]" />
                </div>
                <h3 className="text-xl font-medium text-[#E2E2E2] mb-3">
                  Zero-Knowledge Architecture
                </h3>
                <p className="text-[#8E918F] text-[15px] leading-relaxed">
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
