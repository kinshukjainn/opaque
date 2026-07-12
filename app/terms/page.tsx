// ============================================================
//  app/terms-and-conditions/page.tsx  —  Terms & Conditions
// ------------------------------------------------------------
//  Companion to the Privacy Policy page — same theme, same
//  structure: hero → one-minute summary → responsibility split
//  → sticky TOC + numbered sections → closing card.
//
//  Content is grounded in the real product: zero-knowledge
//  boundary, no password-reset backdoor, plan item limits
//  enforced atomically, cascade deletion on account removal.
//
//  Before shipping, swap: LAST_UPDATED, CONTACT_EMAIL, and the
//  [bracketed placeholders] in sections 11 (liability cap) and
//  12 (governing law).
// ============================================================

"use client";

import { motion, Variants, Transition } from "framer-motion";
import {
  Scale,
  ShieldCheck,
  Lock,
  KeyRound,
  Fingerprint,
  CreditCard,
  Ban,
  Copyright,
  RefreshCw,
  Trash2,
  AlertTriangle,
  Gavel,
  FileText,
  Mail,
  Check,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

const LAST_UPDATED = "July 12, 2026";
const CONTACT_EMAIL = "legal@opaque.app";

const springTransition: Transition = {
  type: "spring",
  stiffness: 100,
  damping: 20,
  mass: 1,
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: springTransition },
};

const stagger: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const toc = [
  { id: "agreement", label: "Agreement to these terms" },
  { id: "the-service", label: "The service" },
  { id: "your-account", label: "Your account" },
  { id: "your-keys", label: "Your keys, your responsibility" },
  { id: "plans-limits", label: "Plans & item limits" },
  { id: "acceptable-use", label: "Acceptable use" },
  { id: "your-content", label: "Your content & ownership" },
  { id: "availability", label: "Availability & changes" },
  { id: "termination", label: "Termination" },
  { id: "disclaimers", label: "Disclaimers" },
  { id: "liability", label: "Limitation of liability" },
  { id: "governing-law", label: "Governing law" },
  { id: "changes", label: "Changes to these terms" },
  { id: "contact", label: "Contact" },
];

const ourResponsibilities = [
  "Keep the service available and your ciphertext intact",
  "Store and return your encrypted data faithfully",
  "Verify every account webhook before acting on it",
  "Never weaken the encryption boundary",
  "Delete everything, completely, when you ask",
];

const yourResponsibilities = [
  "Your master password — remember it",
  "Your recovery phrase — store it offline, safely",
  "The devices and browsers you unlock your vault on",
  "The legality of what you choose to store",
  "Keeping your account email current",
];

function Section({
  id,
  index,
  icon: Icon,
  tint,
  title,
  children,
}: {
  id: string;
  index: string;
  icon: React.ElementType;
  tint: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      id={id}
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      className="scroll-mt-28 md:scroll-mt-32"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg bg-[#1E1F20] border border-[#282A2C] flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 md:w-5 md:h-5" style={{ color: tint }} />
        </div>
        <span className="text-[11px] md:text-[12px] tracking-[0.2em] text-[#5F6368] font-medium flex-shrink-0">
          {index}
        </span>
        <h2 className="text-[17px] md:text-xl font-semibold text-[#E2E2E2] tracking-tight">
          {title}
        </h2>
      </div>
      <div className="space-y-4 text-[14px] md:text-[15px] leading-relaxed text-[#8E918F]">
        {children}
      </div>
    </motion.section>
  );
}

function Em({ children }: { children: React.ReactNode }) {
  return <strong className="font-medium text-[#E2E2E2]">{children}</strong>;
}

export default function TermsAndConditions() {
  return (
    <main className="relative min-h-screen bg-[#161923] text-[#E2E2E2] selection:bg-[#A8C7FA] selection:text-[#041E49] overflow-x-hidden pb-20 md:pb-28">
      {/* Background glow — same treatment as the landing page */}
      <div className="absolute top-0 left-0 w-full h-[45vh] min-h-[360px] md:h-[520px] bg-[radial-gradient(ellipse_100%_80%_at_50%_-20%,rgba(168,199,250,0.08),transparent)] pointer-events-none -z-10" />

      {/* ================= HERO ================= */}
      <section className="relative pt-24 sm:pt-32 md:pt-36 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto z-10">
        <motion.div initial="hidden" animate="visible" variants={stagger}>
          <motion.div
            variants={fadeUp}
            className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#131314] border border-[#282A2C] text-[13px] font-medium text-[#C4C7C5]"
          >
            <Scale className="w-4 h-4 text-green-500 flex-shrink-0" />A contract
            in plain language
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-white mb-5"
          >
            Terms &amp; <span className="text-green-500">Conditions</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="text-[13px] md:text-[14px] text-[#5F6368] mb-6"
          >
            Last updated {LAST_UPDATED} · Applies to the Opaque web application
            and its API
          </motion.p>

          <motion.p
            variants={fadeUp}
            className="text-base sm:text-lg text-[#8E918F] max-w-2xl leading-relaxed"
          >
            What you can expect from us, what we expect from you, and — because
            Opaque is zero-knowledge — which responsibilities can only ever be
            yours. These terms work together with the{" "}
            <Link
              href="/privacy-policy"
              className="text-green-500 hover:text-green-400 underline underline-offset-4 decoration-green-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/50 rounded-sm"
            >
              Privacy Policy
            </Link>
            .
          </motion.p>
        </motion.div>

        {/* ---------- The one-minute version ---------- */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={fadeUp}
          className="mt-12 md:mt-14 p-5 md:p-7 rounded-[24px] md:rounded-[28px] bg-[#131314] border border-[#282A2C]/70"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-lg bg-[#1E1F20] text-green-500 flex-shrink-0">
              <Lock className="w-4 h-4 md:w-5 md:h-5" />
            </div>
            <h2 className="text-[15px] md:text-[16px] font-medium text-[#E2E2E2]">
              The one-minute version
            </h2>
          </div>
          <ul className="space-y-3 text-[14px] md:text-[15px] text-[#8E918F] leading-relaxed">
            <li className="flex gap-3">
              <Check className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
              <span>
                Everything in your vault is <Em>yours</Em>. We store encrypted
                blobs, claim no rights to what is inside them, and could not
                read them if we tried.
              </span>
            </li>
            <li className="flex gap-3">
              <Check className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
              <span>
                You are the <Em>only keeper</Em> of your master password and
                recovery phrase. Lose both and no one — including us — can
                recover your vault. That is by design, and you accept it by
                using Opaque.
              </span>
            </li>
            <li className="flex gap-3">
              <Check className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
              <span>
                Use the service <Em>lawfully</Em>, stay within your plan&apos;s
                limits, and do not attack the infrastructure — or we may suspend
                the account.
              </span>
            </li>
          </ul>
        </motion.div>

        {/* ---------- The responsibility split (signature element) ---------- */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={stagger}
          className="mt-4 md:mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          <motion.div
            variants={fadeUp}
            className="p-5 md:p-7 rounded-[24px] md:rounded-[28px] bg-[#131314] border border-[#282A2C]/70"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-lg bg-[#1E1F20] text-[#C4EDD0] flex-shrink-0">
                <ShieldCheck className="w-4 h-4 md:w-5 md:h-5" />
              </div>
              <h3 className="text-[14px] md:text-[15px] font-medium text-[#E2E2E2]">
                What we are responsible for
              </h3>
            </div>
            <ul className="space-y-2.5">
              {ourResponsibilities.map((item) => (
                <li
                  key={item}
                  className="flex gap-2.5 text-[13px] md:text-[14px] text-[#8E918F]"
                >
                  <Check className="w-3.5 h-3.5 text-green-500 mt-[3px] flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="p-5 md:p-7 rounded-[24px] md:rounded-[28px] bg-[#131314] border border-[#282A2C]/70"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-lg bg-[#1E1F20] text-[#F2B8B5] flex-shrink-0">
                <KeyRound className="w-4 h-4 md:w-5 md:h-5" />
              </div>
              <h3 className="text-[14px] md:text-[15px] font-medium text-[#E2E2E2]">
                What only you can be responsible for
              </h3>
            </div>
            <ul className="space-y-2.5">
              {yourResponsibilities.map((item) => (
                <li
                  key={item}
                  className="flex gap-2.5 text-[13px] md:text-[14px] text-[#8E918F]"
                >
                  <Check className="w-3.5 h-3.5 text-[#F2B8B5] mt-[3px] flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[12px] md:text-[13px] text-[#5F6368] leading-relaxed">
              If both your master password and recovery phrase are lost, your
              vault is permanently unrecoverable — see section 04.
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* ================= TERMS BODY ================= */}
      <section className="relative px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto mt-16 md:mt-24 z-10">
        <div className="lg:grid lg:grid-cols-[230px_minmax(0,1fr)] lg:gap-12 xl:gap-16">
          {/* Sticky contents — desktop */}
          <aside className="hidden lg:block">
            <nav
              aria-label="On this page"
              className="sticky top-28 border-l border-[#282A2C] pl-5"
            >
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#5F6368] mb-4">
                On this page
              </p>
              <ul className="space-y-0.5">
                {toc.map((item, i) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className="group flex items-baseline gap-2.5 py-1.5 text-[13px] text-[#8E918F] hover:text-[#E2E2E2] focus-visible:text-[#E2E2E2] focus-visible:outline-none transition-colors"
                    >
                      <span className="text-[10px] tracking-wider text-[#5F6368] group-hover:text-green-500 transition-colors flex-shrink-0">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          {/* Contents — mobile & tablet */}
          <div className="lg:hidden mb-12 p-5 rounded-[24px] bg-[#131314] border border-[#282A2C]/70">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#5F6368] mb-4">
              On this page
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
              {toc.map((item, i) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className="flex items-baseline gap-2 text-[13px] text-[#8E918F] hover:text-[#E2E2E2] transition-colors py-0.5"
                  >
                    <span className="text-[10px] tracking-wider text-[#5F6368] flex-shrink-0">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Article */}
          <article className="max-w-3xl space-y-12 md:space-y-16">
            <Section
              id="agreement"
              index="01"
              icon={FileText}
              tint="#A8C7FA"
              title="Agreement to these terms"
            >
              <p>
                These terms are a contract between you and the Opaque team
                (&quot;Opaque&quot;, &quot;we&quot;, &quot;us&quot;). By
                creating an account or using the Opaque web application or its
                API, you agree to these terms and to the{" "}
                <Link
                  href="/privacy-policy"
                  className="text-green-500 hover:text-green-400 underline underline-offset-4 decoration-green-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/50 rounded-sm"
                >
                  Privacy Policy
                </Link>
                , which describes what we store and what we can never see.
              </p>
              <p>
                If you do not agree with something here, the honest advice is
                simple: do not use the service. Nothing in these terms limits
                rights you have under law that cannot be waived.
              </p>
            </Section>

            <Section
              id="the-service"
              index="02"
              icon={Lock}
              tint="#C4EDD0"
              title="The service"
            >
              <p>
                Opaque is a <Em>zero-knowledge password manager</Em>. Your
                secrets are encrypted inside your browser before they reach us;
                we store, sync, and return the encrypted result. Two
                consequences of that design are part of this agreement, not just
                the marketing:
              </p>
              <ul className="list-disc pl-5 marker:text-[#3E4042] space-y-3">
                <li>
                  We <Em>cannot read, search, or restore</Em> the contents of
                  your vault, and we cannot reset access to it. There is no
                  backdoor for support, for us, or for anyone else.
                </li>
                <li>
                  Features that would require our servers to read your secrets
                  in plaintext are <Em>out of scope by design</Em>. We will not
                  build them, even on request.
                </li>
              </ul>
            </Section>

            <Section
              id="your-account"
              index="03"
              icon={Fingerprint}
              tint="#EADDFF"
              title="Your account"
            >
              <p>
                You sign in through our authentication provider, Clerk. You
                agree to provide accurate information, keep your account email
                current (it is how we deliver notices under these terms), and
                keep your sign-in credentials to yourself. You are responsible
                for activity that happens under your account and on the devices
                where you unlock your vault.
              </p>
              <p>
                You must be at least 13 years old — or the higher minimum age
                required where you live — and legally able to enter into this
                agreement. One account is for one person.
              </p>
            </Section>

            <Section
              id="your-keys"
              index="04"
              icon={KeyRound}
              tint="#F2B8B5"
              title="Your keys, your responsibility"
            >
              <p>
                This is the most important section of these terms. When you set
                up your vault, your browser generates a master password wrapper
                and a 12-word recovery phrase. <Em>We never receive either.</Em>{" "}
                By using Opaque, you acknowledge and accept all of the
                following:
              </p>
              <ul className="list-disc pl-5 marker:text-[#3E4042] space-y-3">
                <li>
                  You are <Em>solely responsible</Em> for remembering your
                  master password and for storing your recovery phrase safely —
                  ideally offline.
                </li>
                <li>
                  If you forget your master password, the recovery phrase is the{" "}
                  <Em>only</Em> way back into your vault. If you lose both, your
                  encrypted data is <Em>permanently unrecoverable</Em> — by you,
                  by us, by anyone. You accept that this is an intended property
                  of a zero-knowledge service, not a defect in it.
                </li>
                <li>
                  Anyone who obtains your recovery phrase together with access
                  to your account can unlock your vault. Guard the phrase like
                  cash; if you believe it has been exposed, treat the vault as
                  compromised and rotate the credentials stored inside it.
                </li>
              </ul>
              <p>
                How this works under the hood is described in the{" "}
                <Link
                  href="/docs/zero-knowledge-model"
                  className="text-green-500 hover:text-green-400 underline underline-offset-4 decoration-green-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/50 rounded-sm"
                >
                  zero-knowledge documentation
                </Link>
                .
              </p>
            </Section>

            <Section
              id="plans-limits"
              index="05"
              icon={CreditCard}
              tint="#A8C7FA"
              title="Plans & item limits"
            >
              <p>
                Each plan includes a maximum number of vault items. The limit is
                enforced at the moment you save a new item — atomically, so it
                cannot be raced past — and once you reach it, new saves are
                declined until you delete items or move to a plan with more
                room. Existing items are never touched by a limit check.
              </p>
              <p>
                Where paid plans are offered, the price and billing terms shown
                at the time of purchase apply. We may introduce or adjust plans
                over time; changes that reduce what a paid plan includes will
                come with reasonable advance notice.
              </p>
            </Section>

            <Section
              id="acceptable-use"
              index="06"
              icon={Ban}
              tint="#C4EDD0"
              title="Acceptable use"
            >
              <p>Do not use Opaque to:</p>
              <ul className="list-disc pl-5 marker:text-[#3E4042] space-y-3">
                <li>
                  Break the law, or store content whose possession is itself
                  unlawful. Encryption hides your data from us — it does{" "}
                  <Em>not</Em> change your legal responsibility for it.
                </li>
                <li>
                  Attack the service: probing or overloading endpoints,
                  attempting to forge account webhooks, tampering with
                  authentication, or trying to bypass plan limits or ownership
                  checks.
                </li>
                <li>
                  Access or attempt to access another person&apos;s account or
                  vault.
                </li>
                <li>
                  Resell, sublicense, or white-label the service without our
                  written permission.
                </li>
              </ul>
              <p>
                Because we cannot inspect vault contents, enforcement is based
                on what we can see: account behavior and non-secret metadata.
                You are responsible for claims and damages arising from your
                unlawful use of the service.
              </p>
            </Section>

            <Section
              id="your-content"
              index="07"
              icon={Copyright}
              tint="#EADDFF"
              title="Your content & ownership"
            >
              <p>
                Everything you store in your vault is and remains <Em>yours</Em>
                . You grant us only the narrow license needed to operate the
                service: to store, transmit, and back up the ciphertext you send
                us. We claim no intellectual-property rights over your vault
                contents — and since we hold only ciphertext, we could not
                exercise any even in theory.
              </p>
              <p>
                Feedback and suggestions you send us about the product may be
                used freely, without obligation to you.
              </p>
            </Section>

            <Section
              id="availability"
              index="08"
              icon={RefreshCw}
              tint="#A8C7FA"
              title="Availability & changes"
            >
              <p>
                Opaque is an evolving service. We may add, change, or remove
                features, and short interruptions can happen for maintenance or
                reasons outside our control. One commitment does not move: we
                will not change the service in a way that{" "}
                <Em>weakens the zero-knowledge boundary</Em>.
              </p>
              <p>
                Plain advice that doubles as a term: for anything
                mission-critical, keep an independent record. No online service
                — ours included — should be your single point of failure.
              </p>
            </Section>

            <Section
              id="termination"
              index="09"
              icon={Trash2}
              tint="#F2B8B5"
              title="Termination"
            >
              <p>
                <Em>You</Em> can stop at any time by deleting your account.
                Deletion removes your user record, and database-level cascades
                wipe your folders, items, and audit log in the same action, as
                described in the Privacy Policy.
              </p>
              <p>
                <Em>We</Em> may suspend or terminate an account for a material
                violation of these terms, unlawful use, or conduct that puts the
                service or other users at risk — with notice where practicable.
                On termination, your data is deleted the same way as a
                self-deletion. Sections that by their nature should survive
                (such as 06, 07, 10, 11, and 12) survive termination.
              </p>
            </Section>

            <Section
              id="disclaimers"
              index="10"
              icon={AlertTriangle}
              tint="#F2B8B5"
              title="Disclaimers"
            >
              <p>
                The service is provided <Em>&quot;as is&quot;</Em> and{" "}
                <Em>&quot;as available&quot;</Em>, without warranties of any
                kind — express or implied — including merchantability, fitness
                for a particular purpose, and uninterrupted or error-free
                operation.
              </p>
              <p>
                In particular, and consistent with the honest limits every
                zero-knowledge system has, we are not responsible for loss
                caused by a forgotten master password combined with a lost
                recovery phrase; a weak or reused master password; malware,
                malicious browser extensions, or otherwise compromised devices;
                or phishing that tricks you into revealing your credentials.
              </p>
            </Section>

            <Section
              id="liability"
              index="11"
              icon={Scale}
              tint="#C4EDD0"
              title="Limitation of liability"
            >
              <p>
                To the maximum extent permitted by law, we are not liable for
                indirect, incidental, special, consequential, or punitive
                damages, or for lost profits, revenues, or data. Our total
                aggregate liability for all claims relating to the service is
                limited to the greater of the amounts you paid us in the 12
                months before the claim arose, or [50 USD].
              </p>
              <p>
                Nothing in this section excludes or limits liability that cannot
                be excluded or limited under applicable law.
              </p>
            </Section>

            <Section
              id="governing-law"
              index="12"
              icon={Gavel}
              tint="#EADDFF"
              title="Governing law"
            >
              <p>
                These terms are governed by the laws of [your country or state],
                without regard to conflict-of-law rules. Disputes that cannot be
                resolved informally will be brought in the courts of [your
                venue], and both sides consent to that jurisdiction — except
                where the law where you live gives you the right to bring claims
                locally.
              </p>
            </Section>

            <Section
              id="changes"
              index="13"
              icon={FileText}
              tint="#A8C7FA"
              title="Changes to these terms"
            >
              <p>
                If these terms change, we will revise the date at the top of
                this page. For material changes, we will notify you in the app
                or by email before they take effect. Continuing to use Opaque
                after a change takes effect means you accept the updated terms;
                if you do not, stop using the service and delete your account.
              </p>
            </Section>

            <Section
              id="contact"
              index="14"
              icon={Mail}
              tint="#C4EDD0"
              title="Contact"
            >
              <p>
                Questions about these terms are welcome at{" "}
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-green-500 hover:text-green-400 underline underline-offset-4 decoration-green-500/40 break-words focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/50 rounded-sm"
                >
                  {CONTACT_EMAIL}
                </a>
                . We read everything.
              </p>
            </Section>

            {/* ---------- Closing card ---------- */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={fadeUp}
              className="p-6 md:p-8 rounded-[24px] md:rounded-[28px] bg-[#131314] border border-[#282A2C]/70 flex flex-col sm:flex-row sm:items-center justify-between gap-5"
            >
              <div>
                <h3 className="text-[15px] md:text-[16px] font-medium text-[#E2E2E2] mb-1.5">
                  Read this together with the Privacy Policy
                </h3>
                <p className="text-[13px] md:text-[14px] text-[#8E918F] leading-relaxed max-w-md">
                  The terms say what we agree to; the Privacy Policy shows what
                  we store — and what we architecturally cannot see.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto flex-shrink-0">
                <Link
                  href="/privacy-policy"
                  className="group py-2.5 px-5 flex items-center justify-center gap-2 rounded-lg bg-green-500 text-black font-semibold text-[14px] transition-all active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400 w-full sm:w-auto"
                >
                  Privacy Policy
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link
                  href="/vault"
                  className="py-2.5 px-5 flex items-center justify-center rounded-lg bg-[#1E1F20] text-[#E2E2E2] font-medium text-[14px] hover:bg-[#282A2C] border border-[#282A2C] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A8C7FA]/50 w-full sm:w-auto"
                >
                  Open Vault
                </Link>
              </div>
            </motion.div>
          </article>
        </div>
      </section>
    </main>
  );
}
