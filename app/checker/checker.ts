// ============================================================
//  lib/checker.ts  —  STANDALONE password tool
// ------------------------------------------------------------
//  Two jobs, zero dependencies, no auth, no DB:
//    1. analyzePassword(pw)  → strength, entropy, crack time, advice
//    2. generatePassword()   → a strong random password + its entropy
// ============================================================

export interface StrengthResult {
  score: 0 | 1 | 2 | 3 | 4;
  label: "Very Weak" | "Weak" | "Fair" | "Strong" | "Very Strong";
  entropyBits: number;
  /** Estimated time to crack at an offline fast-hash GPU rate (~1e11/s). */
  crackTime: string;
  /** Same, but a throttled online attack (10 guesses/sec). */
  onlineCrackTime: string;
  warnings: string[];
  suggestions: string[];
}

export interface GenerateOptions {
  length?: number;
  lowercase?: boolean;
  uppercase?: boolean;
  digits?: boolean;
  symbols?: boolean;
  /** Avoid look-alikes: O/0, l/1/I, etc. */
  avoidAmbiguous?: boolean;
}

export interface GenerateResult {
  password: string;
  entropyBits: number;
}

// ---------- the most-common passwords (hard-capped to ~0 entropy) ----------
const COMMON_PASSWORDS = new Set([
  "password",
  "passw0rd",
  "password1",
  "123456",
  "12345678",
  "123456789",
  "1234567890",
  "qwerty",
  "qwertyuiop",
  "abc123",
  "111111",
  "123123",
  "letmein",
  "welcome",
  "admin",
  "admin123",
  "root",
  "toor",
  "iloveyou",
  "monkey",
  "dragon",
  "sunshine",
  "princess",
  "football",
  "baseball",
  "superman",
  "batman",
  "trustno1",
  "master",
  "shadow",
  "michael",
  "jennifer",
  "hunter",
  "ranger",
  "harley",
  "computer",
  "qazwsx",
  "zxcvbn",
  "asdfgh",
  "asdfghjkl",
  "1q2w3e4r",
  "1qaz2wsx",
  "google",
  "whatever",
  "freedom",
  "starwars",
  "login",
  "passwort",
  "samsung",
  "secret",
  "summer",
  "winter",
  "hello",
  "hello123",
  "test",
  "test123",
  "guest",
  "changeme",
  "ncc1701",
  "letmein123",
  "p@ssw0rd",
  "p@ssword",
]);

// ---------- keyboard rows for walk detection ----------
const KEYBOARD_ROWS = ["1234567890", "qwertyuiop", "asdfghjkl", "zxcvbnm"];

const LEET_MAP: Record<string, string> = {
  "0": "o",
  "1": "i",
  "!": "i",
  "3": "e",
  "4": "a",
  "@": "a",
  "5": "s",
  $: "s",
  "7": "t",
  "8": "b",
  "9": "g",
  "+": "t",
  "|": "l",
};

const log2 = (n: number) => Math.log(n) / Math.LN2;

function normalizeLeet(s: string): string {
  return s.replace(/[013!345789$@+|]/g, (c) => LEET_MAP[c] ?? c);
}

function charPoolSize(pw: string): number {
  let pool = 0;
  if (/[a-z]/.test(pw)) pool += 26;
  if (/[A-Z]/.test(pw)) pool += 26;
  if (/[0-9]/.test(pw)) pool += 10;
  if (/[^A-Za-z0-9\s]/.test(pw)) pool += 33; // common symbols
  if (/[^\x00-\x7F]/.test(pw)) pool += 100; // any non-ASCII / unicode
  return Math.max(pool, 1);
}

function repeatRunPenalty(pw: string, poolBits: number): number {
  let penalty = 0;
  const re = /(.)\1{2,}/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(pw)) !== null)
    penalty += (m[0].length - 1) * poolBits * 0.9;
  return penalty;
}

function sequencePenalty(
  pw: string,
  poolBits: number,
): { penalty: number; found: boolean } {
  const lower = pw.toLowerCase();
  const sequences = [
    "abcdefghijklmnopqrstuvwxyz",
    "0123456789",
    ...KEYBOARD_ROWS,
  ];
  let penalty = 0;
  let found = false;
  let runLen = 1;

  for (let i = 1; i <= lower.length; i++) {
    const inSeq =
      i < lower.length &&
      sequences.some((seq) => {
        const a = seq.indexOf(lower[i - 1]);
        const b = seq.indexOf(lower[i]);
        return a !== -1 && b !== -1 && Math.abs(a - b) === 1;
      });
    if (inSeq) {
      runLen++;
    } else {
      if (runLen >= 3) {
        penalty += (runLen - 1) * poolBits * 0.75;
        found = true;
      }
      runLen = 1;
    }
  }
  return { penalty, found };
}

function repeatedPatternPenalty(pw: string, poolBits: number): number {
  for (let unit = 1; unit <= pw.length / 2; unit++) {
    const slice = pw.slice(0, unit);
    if (slice.repeat(Math.ceil(pw.length / unit)).slice(0, pw.length) === pw) {
      const reps = pw.length / unit;
      return Math.max(0, pw.length * poolBits - (unit * poolBits + log2(reps)));
    }
  }
  return 0;
}

export function estimateEntropyBits(password: string): number {
  if (!password) return 0;

  const poolBits = log2(charPoolSize(password));
  const bits = password.length * poolBits;

  const lower = password.toLowerCase();
  const normalized = normalizeLeet(lower);

  if (COMMON_PASSWORDS.has(lower) || COMMON_PASSWORDS.has(normalized)) {
    return Math.min(bits, log2(COMMON_PASSWORDS.size) + 1); // ~6 bits
  }

  let penalty = 0;
  penalty += repeatRunPenalty(password, poolBits);
  penalty += sequencePenalty(password, poolBits).penalty;
  penalty += repeatedPatternPenalty(password, poolBits);
  if (/(?:19|20)\d{2}/.test(password)) penalty += 2.5;

  return Math.max(bits - penalty, Math.min(bits, poolBits));
}

function formatSeconds(seconds: number): string {
  if (!isFinite(seconds) || seconds > 3.15e16) return "centuries";
  if (seconds < 1) return "instantly";
  const units: [number, string][] = [
    [60, "second"],
    [60, "minute"],
    [24, "hour"],
    [30, "day"],
    [12, "month"],
    [100, "year"],
    [Infinity, "century"],
  ];
  let value = seconds;
  for (const [factor, name] of units) {
    if (value < factor) {
      const v = Math.round(value);
      return `${v} ${name}${v === 1 ? "" : name === "century" ? "ies" : "s"}`;
    }
    value /= factor;
  }
  return "centuries";
}

function crackTimeFor(bits: number, guessesPerSec: number): string {
  const guesses = Math.pow(2, Math.min(bits, 1023)) / 2;
  return formatSeconds(guesses / guessesPerSec);
}

export function analyzePassword(password: string): StrengthResult {
  const bits = estimateEntropyBits(password);
  const warnings: string[] = [];
  const suggestions: string[] = [];

  if (!password) {
    return {
      score: 0,
      label: "Very Weak",
      entropyBits: 0,
      crackTime: "instantly",
      onlineCrackTime: "instantly",
      warnings: [],
      suggestions: ["Type a password to check its strength."],
    };
  }

  const lower = password.toLowerCase();
  if (
    COMMON_PASSWORDS.has(lower) ||
    COMMON_PASSWORDS.has(normalizeLeet(lower))
  ) {
    warnings.push("This is one of the most commonly used passwords.");
  }
  if (sequencePenalty(password, 1).found) {
    warnings.push(
      "Contains a predictable sequence (like abc, 123, or qwerty).",
    );
  }
  if (/(.)\1{2,}/.test(password)) {
    warnings.push("Contains repeated characters.");
  }
  if (/(?:19|20)\d{2}/.test(password)) {
    warnings.push("Contains what looks like a year — easy to guess.");
  }

  if (password.length < 12) suggestions.push("Use at least 12–16 characters.");
  if (charPoolSize(password) < 62)
    suggestions.push("Mix uppercase, lowercase, numbers, and symbols.");
  if (suggestions.length === 0 && bits < 100)
    suggestions.push("Add a few more characters for extra margin.");

  let score: StrengthResult["score"];
  if (bits < 30) score = 0;
  else if (bits < 50) score = 1;
  else if (bits < 70) score = 2;
  else if (bits < 100) score = 3;
  else score = 4;

  const labels = [
    "Very Weak",
    "Weak",
    "Fair",
    "Strong",
    "Very Strong",
  ] as const;

  return {
    score,
    label: labels[score],
    entropyBits: Math.round(bits * 10) / 10,
    crackTime: crackTimeFor(bits, 1e11),
    onlineCrackTime: crackTimeFor(bits, 10),
    warnings,
    suggestions,
  };
}

const SETS = {
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  digits: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{};:,.<>?",
};
const AMBIGUOUS = /[O0Il1|S5B8]/g;

function secureRandomInt(maxExclusive: number): number {
  const limit = Math.floor(0xffffffff / maxExclusive) * maxExclusive;
  const buf = new Uint32Array(1);
  let x: number;
  do {
    // Only access crypto if available (prevents SSR crashes)
    if (typeof window !== "undefined" && window.crypto) {
      window.crypto.getRandomValues(buf);
    } else {
      // Fallback for SSR/Node environments (though ideally this runs client-side)
      buf[0] = Math.floor(Math.random() * 0xffffffff);
    }
    x = buf[0];
  } while (x >= limit);
  return x % maxExclusive;
}

export function generatePassword(opts: GenerateOptions = {}): GenerateResult {
  const {
    length = 20,
    lowercase = true,
    uppercase = true,
    digits = true,
    symbols = true,
    avoidAmbiguous = false,
  } = opts;

  const active: string[] = [];
  if (lowercase) active.push(SETS.lowercase);
  if (uppercase) active.push(SETS.uppercase);
  if (digits) active.push(SETS.digits);
  if (symbols) active.push(SETS.symbols);
  if (active.length === 0) throw new Error("Select at least one character set");

  const pools = active.map((s) =>
    avoidAmbiguous ? s.replace(AMBIGUOUS, "") : s,
  );
  const charset = pools.join("");

  let password = "";
  const meetsRequirements = (pw: string) =>
    pools.every((pool) => [...pw].some((c) => pool.includes(c)));

  do {
    const chars: string[] = [];
    for (let i = 0; i < length; i++) {
      chars.push(charset[secureRandomInt(charset.length)]);
    }
    password = chars.join("");
  } while (length >= pools.length && !meetsRequirements(password));

  const entropyBits = length * log2(charset.length);
  return { password, entropyBits: Math.round(entropyBits * 10) / 10 };
}
