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
  KeyRound,
  Eye,
  EyeOff,
  AlertTriangle,
} from "lucide-react";

const APP_NAME = "Opaque";

// Material 3 Expressive Spring Physics
const m3SpatialSpring = {
  type: "spring" as const,
  stiffness: 420,
  damping: 32,
  mass: 0.9,
};

const m3FastSpring = {
  type: "spring" as const,
  stiffness: 550,
  damping: 35,
};

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
    <div className="flex items-start gap-4 transition-colors">
      <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-[16px] bg-white/40 dark:bg-black/20 text-[#001D36] dark:text-[#D3E4FF]">
        {icon}
      </div>
      <div>
        <h3 className="text-[#001D36] dark:text-[#D3E4FF] font-bold text-[17px] mb-1.5 tracking-tight">
          {title}
        </h3>
        <p className="text-[#001D36]/70 dark:text-[#D3E4FF]/70 text-[15px] font-medium leading-relaxed">
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
        : "Welcome back";

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

  // Borderless M3 Styling Variables
  const inputClass =
    "w-full px-5 py-4 bg-gray-100 dark:bg-[#1A1A1A] focus:bg-white dark:focus:bg-[#222] border-none focus:ring-4 focus:ring-[#D3E4FF] dark:focus:ring-[#204473] transition-all text-[16px] text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 outline-none rounded-[20px] font-medium";
  const labelClass =
    "block text-[14px] font-semibold text-gray-700 dark:text-gray-300 mb-2 pl-2 tracking-wide";

  const primaryButtonClass =
    "w-full flex items-center justify-center gap-2 py-4 px-6 font-semibold text-[16px] bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black rounded-[24px] hover:rounded-[16px] active:rounded-[12px] cursor-pointer transition-[border-radius,background-color,transform] duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] border-none";

  const secondaryButtonClass =
    "w-full flex items-center justify-center gap-2 py-4 px-6 font-semibold text-[16px] cursor-pointer bg-gray-100 hover:bg-gray-200 dark:bg-[#1A1A1A] dark:hover:bg-[#252525] text-black dark:text-white rounded-[24px] hover:rounded-[16px] active:rounded-[12px] transition-[border-radius,background-color,transform] duration-200 active:scale-[0.98] disabled:opacity-50 border-none";

  return (
    <div className="min-h-screen bg-white dark:bg-[#050505] flex items-center justify-center p-4 sm:p-6 lg:p-8 selection:bg-[#D3E4FF] selection:text-[#001D36] dark:selection:bg-[#204473] dark:selection:text-[#D3E4FF]">
      {/* Massive Borderless Split Card */}
      <div className="w-full max-w-[1400px] min-h-[800px] pt-15  grid grid-cols-1 lg:grid-cols-2 bg-white dark:bg-[#0A0A0A] rounded-[40px] overflow-hidden border-none">
        {/* LEFT PANEL: Branding & Benefits (Tonal Surface) */}
        <div className="relative hidden lg:flex flex-col justify-between p-12 xl:p-16 bg-[#D3E4FF] dark:bg-[#001D36] border-none overflow-hidden">
          <div className="relative z-10 flex flex-col gap-12">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold tracking-tight text-[#001D36] dark:text-[#D3E4FF] flex items-center gap-3">
                {APP_NAME}
                <span className="text-[#001D36]/30 dark:text-[#D3E4FF]/30">
                  /
                </span>
                <span className="text-[13px] font-bold px-3 py-1 text-white bg-black dark:text-black dark:bg-white rounded-full uppercase tracking-wider">
                  Authentication
                </span>
              </span>
            </div>

            {/* Value Proposition */}
            <div>
              <h1 className="text-4xl xl:text-5xl font-extrabold mb-6 leading-[1.1] tracking-tight text-[#001D36] dark:text-[#D3E4FF]">
                Your passwords, sealed by encryption only you can open.
              </h1>
            </div>

            {/* Benefits List */}
            <div className="space-y-8 mt-4 max-w-md">
              <BenefitItem
                icon={<ShieldCheck className="w-6 h-6" />}
                title="Zero-Knowledge Encryption"
                description="Your secrets are encrypted in your browser with AES-256. We store only ciphertext — even we can never read them."
              />
              <BenefitItem
                icon={<KeyRound className="w-6 h-6" />}
                title="One Master Password"
                description="Unlock everything with a single master password, backed by a 12-word recovery phrase that only you hold."
              />
              <BenefitItem
                icon={<Zap className="w-6 h-6" />}
                title="Built-in Generator"
                description="Create strong, unique passwords for every account in one click — no more reusing the same password."
              />
            </div>
          </div>

          {/* Dynamic Security Badge */}
          <div className="relative z-10 flex items-center gap-2 mt-auto pt-12">
            <div className="flex items-center gap-3 text-[14px] bg-white/60 dark:bg-black/40 backdrop-blur-md px-4 py-2.5 rounded-full border-none">
              <LockKeyhole className="w-4 h-4 text-[#001D36] dark:text-[#D3E4FF]" />
              <span className="text-[#001D36] dark:text-[#D3E4FF] font-semibold tracking-wide">
                Secured by
              </span>
              <div className="relative flex items-center justify-start w-[50px] h-[20px] overflow-hidden font-extrabold text-[#001D36] dark:text-[#D3E4FF]">
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={providers[index]}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={m3FastSpring}
                    className="absolute left-0"
                  >
                    {providers[index]}
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Authentication Form (Pure B&W) */}
        <div className="flex flex-col justify-center items-center p-6 sm:p-12 lg:p-16 xl:p-24 bg-white dark:bg-[#0A0A0A] border-none">
          <div className="w-full max-w-[420px]">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center justify-center gap-3 mb-10">
              <span className="text-3xl font-bold tracking-tight text-black dark:text-white flex items-center gap-3">
                {APP_NAME}
                <span className="text-gray-300 dark:text-gray-700">/</span>
                <span className="text-[12px] font-bold px-3 py-1 text-white bg-black dark:text-black dark:bg-white rounded-full uppercase tracking-wider">
                  Auth
                </span>
              </span>
            </div>

            {/* Header */}
            <motion.div layout className="mb-10 text-center lg:text-left">
              <motion.h2
                layout
                className="text-3xl sm:text-4xl font-extrabold text-black dark:text-white mb-3 tracking-tight"
              >
                {heading}
              </motion.h2>
              <motion.p
                layout
                className="text-[15px] font-medium text-gray-500 dark:text-gray-400 leading-relaxed"
              >
                {subtext}
              </motion.p>
            </motion.div>

            {/* Error Banner */}
            <AnimatePresence>
              {authError && (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, height: 0, marginBottom: 0 }}
                  transition={m3SpatialSpring}
                  className="mb-8 p-4 bg-[#FCE8E6] dark:bg-[#3B1212] rounded-[20px] flex items-start gap-3 border-none"
                >
                  <div className="mt-0.5 text-[#8C1D18] dark:text-[#F2B8B5] flex-shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <p className="text-[14px] font-semibold text-[#8C1D18] dark:text-[#F2B8B5] leading-snug">
                    {authError}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main Form container */}
            <motion.div layout className="space-y-6">
              <AnimatePresence mode="wait">
                {pendingMfa || pendingVerification ? (
                  <motion.div
                    key="otp-view"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={m3SpatialSpring}
                    className="space-y-6"
                  >
                    <div>
                      <label className={labelClass}>Security Code</label>
                      <input
                        type="password"
                        inputMode="numeric"
                        placeholder="000000"
                        value={pendingMfa ? mfaCode : verificationCode}
                        onChange={(e) => {
                          const val = e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 6);
                          if (pendingMfa) setMfaCode(val);
                          else setVerificationCode(val);
                        }}
                        onKeyDown={(e) =>
                          e.key === "Enter" && canSubmit && handleSubmit()
                        }
                        className={`${inputClass} text-center text-4xl tracking-[0.4em] py-6 font-bold`}
                      />
                    </div>

                    <div className="space-y-3 pt-2">
                      <button
                        onClick={handleSubmit}
                        disabled={loading || !canSubmit}
                        className={primaryButtonClass}
                      >
                        {loading ? (
                          <FaSpinner className="animate-spin w-5 h-5" />
                        ) : (
                          "Verify Code"
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
                        className={secondaryButtonClass}
                      >
                        Cancel and go back
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="form-view"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={m3SpatialSpring}
                    className="space-y-5"
                  >
                    {isSignUp && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="grid grid-cols-1 sm:grid-cols-2 gap-5 overflow-hidden"
                      >
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
                      </motion.div>
                    )}

                    <div>
                      <label className={labelClass}>Email Address</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                        className={inputClass}
                        placeholder="you@example.com"
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Master Password</label>
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
                          className={`${inputClass} pr-14 ${!showPassword && password ? "tracking-[0.25em] text-lg font-bold" : ""}`}
                          placeholder={
                            !showPassword ? "••••••••" : "Your password"
                          }
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((s) => !s)}
                          tabIndex={-1}
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full text-gray-400 hover:text-black dark:hover:text-white hover:bg-white dark:hover:bg-[#333] transition-colors"
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

                    <div className="pt-4 space-y-4">
                      <button
                        onClick={handleSubmit}
                        disabled={loading || !canSubmit}
                        className={primaryButtonClass}
                      >
                        {loading ? (
                          <FaSpinner className="animate-spin w-5 h-5" />
                        ) : isSignUp ? (
                          "Create Secure Account"
                        ) : (
                          "Unlock Vault"
                        )}
                      </button>

                      <div className="relative flex items-center justify-center py-2">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-200 dark:border-[#222]"></div>
                        </div>
                        <div className="relative px-4 bg-white dark:bg-[#0A0A0A] text-[12px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                          or
                        </div>
                      </div>

                      <button
                        onClick={toggleMode}
                        className={secondaryButtonClass}
                      >
                        {isSignUp
                          ? "Log in to existing account"
                          : "Create a new account"}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Footer Terms */}
            <motion.div
              layout
              className="mt-12 text-center text-[13px] font-medium text-gray-500 dark:text-gray-400 leading-relaxed px-4"
            >
              By continuing, you agree to our{" "}
              <Link
                href="/terms"
                className="text-black dark:text-white font-semibold hover:underline underline-offset-4 decoration-[#D3E4FF] dark:decoration-[#204473] transition-colors"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="text-black dark:text-white font-semibold hover:underline underline-offset-4 decoration-[#D3E4FF] dark:decoration-[#204473] transition-colors"
              >
                Privacy Policy
              </Link>
              .
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
