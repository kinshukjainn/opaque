"use client";

import { useState, useCallback, useEffect } from "react";
import { useSignIn, useSignUp, useClerk } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import { FaSpinner } from "react-icons/fa";
import Link from "next/link";
import {
  LockKeyhole,
  ShieldCheck,
  Zap,
  Sparkles,
  KeyRound,
  Eye,
  EyeOff,
} from "lucide-react";

const APP_NAME = "EndVault";

function getErrorMessage(error: unknown): string {
  if (!error) return "An unexpected error occurred.";
  const e = error as { errors?: { longMessage?: string }[]; message?: string };
  return (
    e.errors?.[0]?.longMessage ??
    e.message ??
    "An unexpected error occurred. Please try again."
  );
}

function BenefitItem({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white flex items-center justify-center text-blue-800 shadow-sm">
        {icon}
      </div>
      <div>
        <h3 className="text-gray-100 font-semibold text-[15px] mb-1">
          {title}
        </h3>
        <p className="text-gray-400 text-[13px] leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}

export default function AuthPage() {
  const { signIn } = useSignIn();
  const { signUp } = useSignUp();
  const { setActive } = useClerk();

  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [pendingVerification, setPendingVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");

  const [pendingMfa, setPendingMfa] = useState(false);
  const [mfaCode, setMfaCode] = useState("");

  const providers = ["Clerk", "Neon", "AWS"];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % providers.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [providers.length]);

  const handleSignIn = useCallback(async () => {
    if (!signIn) return;
    setLoading(true);
    setAuthError(null);
    try {
      const { error } = await signIn.password({ identifier: email, password });
      if (error) {
        setAuthError(getErrorMessage(error));
        setLoading(false);
        return;
      }

      if (signIn.status === "complete" && signIn.createdSessionId) {
        await setActive({ session: signIn.createdSessionId });
        window.location.href = "/vault";
      } else if (
        signIn.status === "needs_second_factor" ||
        signIn.status === "needs_client_trust"
      ) {
        const emailFactor = signIn.supportedSecondFactors?.find(
          (f) => f.strategy === "email_code",
        );

        if (emailFactor) {
          const { error: sendError } = await signIn.emailCode.sendCode();
          if (sendError) {
            setAuthError(getErrorMessage(sendError));
            setLoading(false);
            return;
          }
          setPendingMfa(true);
          setLoading(false);
        } else {
          setAuthError(
            "Device verification required, but no email factor was found.",
          );
          setLoading(false);
        }
      } else {
        setAuthError(`Status: ${signIn.status} — requires additional steps.`);
        setLoading(false);
      }
    } catch (err) {
      setAuthError(getErrorMessage(err));
      setLoading(false);
    }
  }, [signIn, setActive, email, password]);

  const handleVerifyMfa = useCallback(async () => {
    if (!signIn) return;
    setLoading(true);
    setAuthError(null);
    try {
      const { error } = await signIn.emailCode.verifyCode({ code: mfaCode });
      if (error) {
        setAuthError(getErrorMessage(error));
        setLoading(false);
        return;
      }
      if (signIn.status === "complete" && signIn.createdSessionId) {
        await setActive({ session: signIn.createdSessionId });
        window.location.href = "/vault";
      } else {
        setAuthError(`Verification incomplete. Status: ${signIn.status}`);
        setLoading(false);
      }
    } catch (err) {
      setAuthError(getErrorMessage(err));
      setLoading(false);
    }
  }, [signIn, setActive, mfaCode]);

  const handleSignUp = useCallback(async () => {
    if (!signUp) return;
    setLoading(true);
    setAuthError(null);
    try {
      const { error: createErr } = await signUp.password({
        emailAddress: email,
        password,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
      });
      if (createErr) {
        setAuthError(getErrorMessage(createErr));
        setLoading(false);
        return;
      }
      const { error: sendErr } = await signUp.verifications.sendEmailCode();
      if (sendErr) {
        setAuthError(getErrorMessage(sendErr));
        setLoading(false);
        return;
      }
      setPendingVerification(true);
    } catch (err) {
      setAuthError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [signUp, email, password, firstName, lastName]);

  const handleVerifySignUp = useCallback(async () => {
    if (!signUp) return;
    setLoading(true);
    setAuthError(null);
    try {
      const { error: verifyErr } = await signUp.verifications.verifyEmailCode({
        code: verificationCode,
      });
      if (verifyErr) {
        setAuthError(getErrorMessage(verifyErr));
        setLoading(false);
        return;
      }
      if (
        (signUp.status === "complete" || signUp.createdSessionId) &&
        signUp.createdSessionId
      ) {
        await setActive({ session: signUp.createdSessionId });
        window.location.href = "/vault";
      } else {
        const missing = signUp.missingFields ?? [];
        const unverified = signUp.unverifiedFields ?? [];
        setAuthError(
          missing.length > 0
            ? `Missing required fields: ${missing.join(", ")}`
            : unverified.length > 0
              ? `Still unverified: ${unverified.join(", ")}`
              : "Sign-up incomplete. Please try again.",
        );
        setLoading(false);
      }
    } catch (err) {
      setAuthError(getErrorMessage(err));
      setLoading(false);
    }
  }, [signUp, setActive, verificationCode]);

  const handleSubmit = useCallback(() => {
    if (pendingMfa) return handleVerifyMfa();
    if (pendingVerification) return handleVerifySignUp();
    if (isSignUp) return handleSignUp();
    return handleSignIn();
  }, [
    pendingMfa,
    pendingVerification,
    isSignUp,
    handleVerifyMfa,
    handleVerifySignUp,
    handleSignUp,
    handleSignIn,
  ]);

  const toggleMode = useCallback(() => {
    setIsSignUp((prev) => !prev);
    setAuthError(null);
    setPendingVerification(false);
    setPendingMfa(false);
    setVerificationCode("");
    setMfaCode("");
  }, []);

  const heading = pendingMfa
    ? "Device Verification"
    : pendingVerification
      ? "Verify Email"
      : isSignUp
        ? "Create your vault"
        : "Get back to your Vault";

  const subtext = pendingMfa
    ? "A security code has been sent to your email."
    : pendingVerification
      ? `A 6-digit code has been sent to ${email}.`
      : isSignUp
        ? `Create your account to set up your secure ${APP_NAME} vault.`
        : `Log in to ${APP_NAME} to unlock your vault.`;

  const canSubmit = pendingMfa
    ? mfaCode.length === 6
    : pendingVerification
      ? verificationCode.length === 6
      : isSignUp
        ? !!(email && password && firstName && lastName)
        : !!(email && password);

  const inputClass =
    "w-full px-4 py-3 bg-[#111111] border border-[#333333] text-[15px] text-gray-100 placeholder-gray-500 focus:border-[#0078D4] focus:ring-1 focus:ring-[#0078D4] focus:outline-none rounded-lg transition-all";
  const labelClass = "block text-[14px] font-medium text-gray-200 mb-2";
  const primaryButtonClass =
    "w-full flex items-center justify-center gap-2 py-3 px-4 font-semibold text-[14px] bg-[#0078D4] hover:bg-[#006abc] text-white rounded-full shadow-lg shadow-[#0078D4]/20 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed";
  const secondaryButtonClass =
    "w-full flex items-center justify-center gap-2 py-3 px-4 font-semibold text-[14px] cursor-pointer bg-transparent border border-[#333333] hover:bg-[#1a1a1a] text-gray-200 rounded-full transition-all disabled:opacity-50";

  return (
    <div className="grid pt-10  min-h-screen grid-cols-1 lg:grid-cols-2 bg-[#050505] text-gray-100 selection:bg-[#0078D4] selection:text-white">
      {/* LEFT PANEL: Branding & Benefits (Strictly contained, hidden on mobile) */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 xl:p-16 bg-black border-r border-[#1f1f1f] overflow-hidden">
        {/* Background Graphic */}
        <div className="absolute inset-0 z-0 bg-black/80" />

        <div className="relative z-10 flex flex-col gap-10">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold tracking-tight text-white flex items-center flex-wrap gap-2">
              {APP_NAME} /{" "}
              <span className="text-[11px] px-3 py-1 bg-blue-800/20 border-blue-400 border rounded-full">
                Authentication
              </span>
            </span>
          </div>

          {/* Value Proposition */}
          <div className="mt-4">
            <h1 className="text-4xl xl:text-5xl font-bold text-white mb-6 leading-tight max-w-[480px]">
              Your passwords, sealed by encryption only you can open.
            </h1>
            <p className="text-lg text-gray-400 max-w-md leading-relaxed">
              A zero-knowledge password vault. Everything is encrypted on your
              device before it ever reaches our servers — so no one but you can
              read it.
            </p>
          </div>

          {/* Benefits List */}
          <div className="space-y-8 mt-4 max-w-md">
            <BenefitItem
              icon={<ShieldCheck className="w-5 h-5" />}
              title="Zero-Knowledge Encryption"
              description="Your secrets are encrypted in your browser with AES-256. We store only ciphertext — even we can never read them."
            />
            <BenefitItem
              icon={<KeyRound className="w-5 h-5" />}
              title="One Master Password"
              description="Unlock everything with a single master password, backed by a 12-word recovery phrase that only you hold."
            />
            <BenefitItem
              icon={<Zap className="w-5 h-5" />}
              title="Built-in Generator"
              description="Create strong, unique passwords for every account in one click — no more reusing the same password."
            />
          </div>
        </div>

        {/* Dynamic Security Badge */}
        <div className="relative z-10 flex items-center gap-2 mt-auto pt-10">
          <div className="flex items-center gap-2 text-[13px] text-gray-400 bg-[#111111] border border-blue-400 px-4 py-2 rounded-full">
            <LockKeyhole className="w-4 h-4 text-[#0078D4]" />
            <span>Secured infrastructure by</span>
            <div className="relative flex items-center justify-start w-[50px] h-[18px] overflow-hidden font-semibold text-gray-200">
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={providers[index]}
                  initial={{ y: 15, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -15, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute left-0"
                >
                  {providers[index]}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Authentication Form (Strictly centered) */}
      <div className="flex flex-col justify-center items-center w-full px-6 py-12 lg:px-12 bg-[#050505]">
        <div className="w-full max-w-[400px]">
          {/* Mobile Logo (Visible only on small screens) */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-10">
            <span className="text-2xl font-bold tracking-tight text-white flex items-center">
              {APP_NAME} <span className="mx-2 text-gray-500">/</span>
              <span className="text-xs px-2 py-1 bg-blue-800/20 border border-blue-400 rounded-full">
                Auth
              </span>
            </span>
          </div>

          {/* Header */}
          <div className="mb-8 text-center sm:text-left">
            <h2 className="text-3xl font-bold text-white mb-2">{heading}</h2>
            <p className="text-[15px] text-gray-400 leading-relaxed">
              {subtext}
            </p>
          </div>

          {/* Error Banner */}
          {authError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-950/30 border border-red-900/50 flex items-start gap-3 rounded-xl"
            >
              <div className="mt-0.5 text-red-500 flex-shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <p className="text-[13.5px] font-medium text-red-200 leading-snug">
                {authError}
              </p>
            </motion.div>
          )}

          {/* Main Form container */}
          <div className="space-y-5">
            {pendingMfa || pendingVerification ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div>
                  <label className={labelClass}>Security Code</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="000000"
                    value={pendingMfa ? mfaCode : verificationCode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                      if (pendingMfa) setMfaCode(val);
                      else setVerificationCode(val);
                    }}
                    onKeyDown={(e) =>
                      e.key === "Enter" && canSubmit && handleSubmit()
                    }
                    className={`${inputClass} text-center text-3xl tracking-[0.3em] py-4 font-mono`}
                  />
                </div>

                <div className="space-y-4 pt-2">
                  <button
                    onClick={handleSubmit}
                    disabled={loading || !canSubmit}
                    className={primaryButtonClass}
                  >
                    {loading ? (
                      <FaSpinner className="animate-spin w-5 h-5" />
                    ) : (
                      "Verify & Continue"
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setPendingMfa(false);
                      setPendingVerification(false);
                      setVerificationCode("");
                      setMfaCode("");
                      setAuthError(null);
                    }}
                    className="w-full text-center text-[14px] text-gray-400 hover:text-white transition-colors"
                  >
                    Cancel and go back
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-5"
              >
                {isSignUp && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>First Name</label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className={inputClass}
                        placeholder="Jane"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Last Name</label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className={inputClass}
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className={labelClass}>Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    className={inputClass}
                    placeholder="you@company.com"
                  />
                </div>

                <div>
                  <label className={labelClass}>Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete={
                        isSignUp ? "new-password" : "current-password"
                      }
                      onKeyDown={(e) =>
                        e.key === "Enter" && canSubmit && handleSubmit()
                      }
                      className={`${inputClass} pr-12`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      tabIndex={-1}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-200 transition-colors p-2"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div
                  id="clerk-captcha"
                  data-cl-theme="dark"
                  data-cl-size="flexible"
                  className="pt-1"
                />

                <div className="pt-2 space-y-4">
                  <button
                    onClick={handleSubmit}
                    disabled={loading || !canSubmit}
                    className={primaryButtonClass}
                  >
                    {loading ? (
                      <FaSpinner className="animate-spin w-5 h-5" />
                    ) : isSignUp ? (
                      "Create Account"
                    ) : (
                      "Sign In"
                    )}
                  </button>

                  <div className="relative flex items-center justify-center py-2">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-[#222]"></div>
                    </div>
                    <div className="relative bg-[#050505] px-4 text-[12px] font-semibold text-gray-400 uppercase tracking-wider">
                      or
                    </div>
                  </div>

                  <button onClick={toggleMode} className={secondaryButtonClass}>
                    {isSignUp
                      ? "Log in to existing account"
                      : "Create a new account"}
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer Terms */}
          <div className="mt-10 text-center text-[13px] text-gray-500 leading-relaxed">
            By continuing, you agree to our{" "}
            <Link
              href="/terms"
              className="text-gray-300 hover:text-white transition-colors underline decoration-gray-600 underline-offset-2"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="text-gray-300 hover:text-white transition-colors underline decoration-gray-600 underline-offset-2"
            >
              Privacy Policy
            </Link>
            .
          </div>
        </div>
      </div>
    </div>
  );
}
