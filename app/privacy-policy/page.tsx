"use client";

import { motion, Variants, Transition } from "framer-motion";
import {
  Shield,
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  Database,
  Fingerprint,
  Cookie,
  Server,
  Trash2,
  AlertTriangle,
  UserCheck,
  Users,
  FileText,
  Mail,
  Check,
  Minus,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

const LAST_UPDATED = "July 12, 2026";
const CONTACT_EMAIL = "privacy@opaque.app";

const springTransition: Transition = {
  type: "spring",
  stiffness: 420,
  damping: 32,
  mass: 0.9,
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: springTransition },
};

const stagger: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

// The policy is a referenceable, ordered document — numbering is
// navigation here, not decoration.
const toc = [
  { id: "scope", label: "Who we are & scope" },
  { id: "zero-knowledge", label: "Zero-knowledge, plainly" },
  { id: "data-we-store", label: "Information we store" },
  { id: "data-we-cannot-see", label: "What we can never access" },
  { id: "how-we-use", label: "How we use information" },
  { id: "cookies", label: "Cookies & sessions" },
  { id: "third-parties", label: "Third-party services" },
  { id: "retention", label: "Retention & deletion" },
  { id: "security", label: "Security practices" },
  { id: "limits", label: "Honest limits" },
  { id: "rights", label: "Your rights & choices" },
  { id: "children", label: "Children's privacy" },
  { id: "changes", label: "Changes to this policy" },
  { id: "contact", label: "Contact" },
];

const cannotRead = [
  "Your master password",
  "Your 12-word recovery phrase",
  "Your raw Vault Key",
  "Item titles and notes",
  "Usernames and passwords",
  "Website URLs inside items",
  "Which services you save",
];

const storedInClear = [
  "Account email (to sign you in)",
  "Display name & avatar",
  "Item type, favorite flag, folder placement",
  "Created / updated timestamps",
  "Item count & plan",
  "Public KDF salt & parameters",
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
        <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gray-100 dark:bg-[#1A1A1A] flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 md:w-5 md:h-5" style={{ color: tint }} />
        </div>
        <span className="text-[11px] md:text-[12px] tracking-[0.2em] text-gray-500 dark:text-gray-400 font-medium flex-shrink-0">
          {index}
        </span>
        <h2 className="text-[17px] md:text-xl font-semibold text-[#111318] dark:text-white tracking-tight">
          {title}
        </h2>
      </div>
      <div className="space-y-4 text-[14px] md:text-[15px] leading-relaxed text-[#44474F] dark:text-[#C4C6D0]">
        {children}
      </div>
    </motion.section>
  );
}

function Em({ children }: { children: React.ReactNode }) {
  return (
    <strong className="font-semibold text-[#111318] dark:text-white">
      {children}
    </strong>
  );
}

export default function PrivacyPolicy() {
  return (
    <main className="relative min-h-screen bg-white dark:bg-[#050505] text-[#111318] dark:text-[#E2E2E9] selection:bg-[#D8F5D0] selection:text-[#0A2E13] dark:selection:bg-[#1E4B2A] dark:selection:text-[#D8F5D0] overflow-x-hidden pb-20 md:pb-28">
      {/* Background glow — soft green tonal gradient */}
      <div className="absolute top-0 left-0 w-full h-[45vh] min-h-[360px] md:h-[520px] bg-[radial-gradient(ellipse_100%_80%_at_50%_-20%,rgba(27,127,59,0.06),transparent)] pointer-events-none -z-10" />

      {/* ================= HERO ================= */}
      <section className="relative pt-24 sm:pt-32 md:pt-36 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto z-10">
        <motion.div initial="hidden" animate="visible" variants={stagger}>
          <motion.div
            variants={fadeUp}
            className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gray-100 dark:bg-[#1A1A1A] text-[13px] font-medium text-[#111318] dark:text-[#E2E2E9] border-none"
          >
            <Shield className="w-4 h-4 text-[#1B7F3B] dark:text-[#8EE0A1] flex-shrink-0" />
            Zero-knowledge by design
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-[#111318] dark:text-white mb-5"
          >
            Privacy{" "}
            <span className="text-[#1B7F3B] dark:text-[#8EE0A1]">Policy</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="text-[13px] md:text-[14px] text-gray-500 dark:text-gray-400 mb-6"
          >
            Last updated {LAST_UPDATED} · Applies to the Opaque web application
            and its API
          </motion.p>

          <motion.p
            variants={fadeUp}
            className="text-base sm:text-lg text-[#44474F] dark:text-[#C4C6D0] max-w-2xl leading-relaxed"
          >
            Most privacy policies ask you to trust a promise. This one mostly
            describes an architecture: Opaque is built so that we{" "}
            <Em>cannot</Em> read your secrets, even if we wanted to. Below is
            exactly what we store, what we can never see, and why.
          </motion.p>
        </motion.div>

        {/* ---------- The one-minute version ---------- */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={fadeUp}
          className="mt-12 md:mt-14 p-5 md:p-7 rounded-[24px] md:rounded-[28px] bg-gray-50 dark:bg-[#111111] border-none"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-lg bg-white dark:bg-[#1A1A1A] text-[#1B7F3B] dark:text-[#8EE0A1] flex-shrink-0">
              <Lock className="w-4 h-4 md:w-5 md:h-5" />
            </div>
            <h2 className="text-[15px] md:text-[16px] font-semibold text-[#111318] dark:text-white">
              The one-minute version
            </h2>
          </div>
          <ul className="space-y-3 text-[14px] md:text-[15px] text-[#44474F] dark:text-[#C4C6D0] leading-relaxed">
            <li className="flex gap-3">
              <Check className="w-4 h-4 text-[#1B7F3B] dark:text-[#8EE0A1] mt-1 flex-shrink-0" />
              <span>
                Everything in your vault is encrypted{" "}
                <Em>inside your browser</Em> before it is sent to us. Our
                servers store ciphertext they cannot decrypt.
              </span>
            </li>
            <li className="flex gap-3">
              <Check className="w-4 h-4 text-[#1B7F3B] dark:text-[#8EE0A1] mt-1 flex-shrink-0" />
              <span>
                Your master password and recovery phrase{" "}
                <Em>never leave your device</Em> and are never stored anywhere —
                not even encrypted.
              </span>
            </li>
            <li className="flex gap-3">
              <Check className="w-4 h-4 text-[#1B7F3B] dark:text-[#8EE0A1] mt-1 flex-shrink-0" />
              <span>
                We keep only what running your account requires: your email,
                basic profile, plan, and non-secret item metadata.{" "}
                <Em>No ads, no trackers, no selling data.</Em>
              </span>
            </li>
          </ul>
        </motion.div>

        {/* ---------- The two ledgers (signature element) ---------- */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={stagger}
          className="mt-4 md:mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          <motion.div
            variants={fadeUp}
            className="p-5 md:p-7 rounded-[24px] md:rounded-[28px] bg-[#D8F5D0] dark:bg-[#1E4B2A] border-none"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-lg bg-white/50 dark:bg-black/20 text-[#0A2E13] dark:text-[#D8F5D0] flex-shrink-0">
                <EyeOff className="w-4 h-4 md:w-5 md:h-5" />
              </div>
              <h3 className="text-[14px] md:text-[15px] font-semibold text-[#0A2E13] dark:text-[#D8F5D0]">
                What we can never read
              </h3>
            </div>
            <ul className="space-y-2.5">
              {cannotRead.map((item) => (
                <li
                  key={item}
                  className="flex gap-2.5 text-[13px] md:text-[14px] text-[#0A2E13]/80 dark:text-[#D8F5D0]/80"
                >
                  <Check className="w-3.5 h-3.5 text-[#0A2E13] dark:text-[#D8F5D0] mt-[3px] flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="p-5 md:p-7 rounded-[24px] md:rounded-[28px] bg-gray-50 dark:bg-[#111111] border-none"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-lg bg-white dark:bg-[#1A1A1A] text-gray-600 dark:text-gray-400 flex-shrink-0">
                <Eye className="w-4 h-4 md:w-5 md:h-5" />
              </div>
              <h3 className="text-[14px] md:text-[15px] font-semibold text-[#111318] dark:text-white">
                What we store in the clear
              </h3>
            </div>
            <ul className="space-y-2.5">
              {storedInClear.map((item) => (
                <li
                  key={item}
                  className="flex gap-2.5 text-[13px] md:text-[14px] text-[#44474F] dark:text-[#C4C6D0]"
                >
                  <Minus className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 mt-[3px] flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[12px] md:text-[13px] text-gray-500 dark:text-gray-400 leading-relaxed">
              This is bookkeeping the app needs to list, filter, and count your
              items without decrypting anything.
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* ================= POLICY BODY ================= */}
      <section className="relative px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto mt-16 md:mt-24 z-10">
        <div className="lg:grid lg:grid-cols-[230px_minmax(0,1fr)] lg:gap-12 xl:gap-16">
          {/* Sticky contents — desktop */}
          <aside className="hidden lg:block">
            <nav
              aria-label="On this page"
              className="sticky top-28 border-l-2 border-gray-100 dark:border-[#1A1A1A] pl-5"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400 mb-4">
                On this page
              </p>
              <ul className="space-y-0.5">
                {toc.map((item, i) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className="group flex items-baseline gap-2.5 py-1.5 text-[13px] text-[#44474F] dark:text-[#C4C6D0] hover:text-[#111318] dark:hover:text-white focus-visible:text-[#111318] dark:focus-visible:text-white focus-visible:outline-none transition-colors rounded-r-lg"
                    >
                      <span className="text-[10px] tracking-wider text-gray-400 dark:text-gray-500 group-hover:text-[#1B7F3B] dark:group-hover:text-[#8EE0A1] transition-colors flex-shrink-0">
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
          <div className="lg:hidden mb-12 p-5 rounded-[24px] bg-gray-50 dark:bg-[#111111] border-none">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400 mb-4">
              On this page
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
              {toc.map((item, i) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className="flex items-baseline gap-2 text-[13px] text-[#44474F] dark:text-[#C4C6D0] hover:text-[#111318] dark:hover:text-white transition-colors py-0.5"
                  >
                    <span className="text-[10px] tracking-wider text-gray-400 dark:text-gray-500 flex-shrink-0">
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
              id="scope"
              index="01"
              icon={FileText}
              tint="#1B7F3B"
              title="Who we are & scope"
            >
              <p>
                Opaque is a zero-knowledge password manager operated by the
                Opaque team (&quot;Opaque&quot;, &quot;we&quot;,
                &quot;us&quot;). This policy explains what information the
                Opaque web application and its API handle when you use them, how
                that information is used, and — just as importantly — what we
                are architecturally unable to access.
              </p>
              <p>
                It is written to be read, not skimmed past. If you want the same
                system described at a deeper technical level, the{" "}
                <Link
                  href="/docs/zero-knowledge-model"
                  className="text-[#1B7F3B] dark:text-[#8EE0A1] font-medium hover:underline underline-offset-4 decoration-[#1B7F3B]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B7F3B]/50 rounded-sm"
                >
                  zero-knowledge documentation
                </Link>{" "}
                covers the exact cryptography and data flows.
              </p>
            </Section>

            <Section
              id="zero-knowledge"
              index="02"
              icon={Lock}
              tint="#1B7F3B"
              title="Zero-knowledge, plainly"
            >
              <p>
                Every secret you save — titles, usernames, passwords, URLs,
                notes — is encrypted <Em>inside your browser</Em> with
                AES-256-GCM before it is transmitted. The key that performs that
                encryption (your Vault Key) is itself protected by keys derived
                from your master password and your recovery phrase, neither of
                which ever leaves your device.
              </p>
              <p>
                The practical consequence: our servers store, move, and back up
                locked boxes. There is <Em>no code path</Em> on the server that
                decrypts them, no support tool that opens them, and no
                password-reset backdoor. If our database were stolen tomorrow,
                the thief would hold ciphertext and public key-derivation
                parameters — noise without your master password.
              </p>
              <p>
                This is why the rest of this policy is short on drama: for the
                data that matters most, there is nothing readable for us to
                collect, share, analyze, or lose.
              </p>
            </Section>

            <Section
              id="data-we-store"
              index="03"
              icon={Database}
              tint="#1B7F3B"
              title="Information we store"
            >
              <p>We store four narrow categories of information:</p>
              <ul className="list-disc pl-5 marker:text-[#1B7F3B] dark:marker:text-[#8EE0A1] space-y-3">
                <li>
                  <Em>Account & profile.</Em> Your email address, display name,
                  avatar URL, and internal identifiers, provided through our
                  authentication provider, Clerk. These fields are kept in sync
                  via cryptographically signed webhooks, and the sync only ever
                  touches these profile fields — never your encryption material.
                </li>
                <li>
                  <Em>Encrypted vault data.</Em> For each item, a ciphertext
                  blob and its initialization vector (IV); plus two wrapped
                  (encrypted) copies of your Vault Key and the public
                  key-derivation salt and parameters needed to unlock them on
                  your device. All of it is opaque to us.
                </li>
                <li>
                  <Em>Non-secret metadata.</Em> Each item&apos;s type (login,
                  note, card, or identity), favorite flag, folder placement, and
                  timestamps, along with your running item count and plan. This
                  lets the app list, filter, and enforce plan limits without
                  decrypting anything.
                </li>
                <li>
                  <Em>Operational records.</Em> A metadata-only audit log of
                  vault activity (never secret content), and standard
                  infrastructure logs — which may include an IP address and
                  browser type — retained briefly for security and debugging.
                  Because decryption never happens server-side, there is no
                  plaintext secret for us to log, and we never do.
                </li>
              </ul>
            </Section>

            <Section
              id="data-we-cannot-see"
              index="04"
              icon={EyeOff}
              tint="#1B7F3B"
              title="What we can never access"
            >
              <p>
                The following never reach our servers in readable form — not at
                sign-up, not during syncing, not in logs, not ever:
              </p>
              <ul className="list-disc pl-5 marker:text-[#1B7F3B] dark:marker:text-[#8EE0A1] space-y-3">
                <li>
                  <Em>Your master password.</Em> It is used only inside your
                  browser to derive a key, and is never transmitted or stored
                  anywhere, in any form.
                </li>
                <li>
                  <Em>Your recovery phrase.</Em> The 12-word phrase is generated
                  in your browser and converted to a key there; only the
                  resulting <Em>encrypted</Em> copy of your Vault Key is stored.
                </li>
                <li>
                  <Em>Your Vault Key.</Em> The key that actually encrypts your
                  items exists in raw form only in your browser&apos;s memory
                  while your vault is unlocked.
                </li>
                <li>
                  <Em>The contents of every item.</Em> Titles, usernames,
                  passwords, URLs, notes, and even which service an item belongs
                  to all live inside the encrypted payload.
                </li>
              </ul>
              <p>
                The &quot;What we can never read&quot; card at the top of this
                page is exhaustive on purpose. If a future feature would require
                moving anything on that list to the server in readable form, the
                feature does not ship.
              </p>
            </Section>

            <Section
              id="how-we-use"
              index="05"
              icon={Fingerprint}
              tint="#1B7F3B"
              title="How we use information"
            >
              <p>We use the information above only to run the service:</p>
              <ul className="list-disc pl-5 marker:text-[#1B7F3B] dark:marker:text-[#8EE0A1] space-y-3">
                <li>
                  To <Em>authenticate you</Em> and maintain your signed-in
                  session through Clerk.
                </li>
                <li>
                  To <Em>keep your account record accurate</Em>, by processing
                  signed webhook events when you register, update your profile,
                  or delete your account.
                </li>
                <li>
                  To <Em>store and return your encrypted items</Em>, and to
                  enforce your plan&apos;s item limit — checked atomically at
                  the moment of creation, using only the non-secret counter.
                </li>
                <li>
                  To <Em>keep the service secure</Em>: verifying webhook
                  signatures, scoping every database query to the authenticated
                  owner, and maintaining the metadata-only audit log.
                </li>
                <li>
                  To <Em>send essential service messages</Em>, such as security
                  or account notices, to your account email.
                </li>
              </ul>
              <p>
                We do not sell personal information. We do not show advertising.
                We do not run third-party analytics or advertising trackers. We
                do not build profiles of you — there is nothing readable to
                profile.
              </p>
            </Section>

            <Section
              id="cookies"
              index="06"
              icon={Cookie}
              tint="#1B7F3B"
              title="Cookies & sessions"
            >
              <p>
                Opaque uses only <Em>strictly necessary</Em> cookies, set by our
                authentication provider Clerk, to keep you signed in and to
                protect your session. There are no advertising, analytics, or
                cross-site tracking cookies.
              </p>
              <p>
                Your unlocked Vault Key lives only in your browser&apos;s{" "}
                <Em>memory</Em> for the duration of a session. It is never
                written to cookies, localStorage, or any other persistent
                storage, and it is gone when the vault locks or the page
                unloads.
              </p>
            </Section>

            <Section
              id="third-parties"
              index="07"
              icon={Server}
              tint="#1B7F3B"
              title="Third-party services"
            >
              <p>
                A small number of providers help us run Opaque. Each receives
                only what its role requires, and none of them can decrypt your
                vault:
              </p>
              <ul className="list-disc pl-5 marker:text-[#1B7F3B] dark:marker:text-[#8EE0A1] space-y-3">
                <li>
                  <Em>Clerk</Em> — authentication and session management. Clerk
                  holds your sign-in credentials and profile, and notifies us of
                  account changes through webhooks delivered via Svix. Every
                  delivery is signature-verified before we act on it.
                </li>
                <li>
                  <Em>Database & hosting providers</Em> — store and serve the
                  data described in section 03. Your vault contents reach them
                  only as ciphertext.
                </li>
              </ul>
              <p>
                We do not share personal information with any other third party,
                except where required by law — and even then, vault contents can
                only ever be produced as ciphertext, because that is all we
                hold.
              </p>
            </Section>

            <Section
              id="retention"
              index="08"
              icon={Trash2}
              tint="#1B7F3B"
              title="Retention & deletion"
            >
              <p>
                We keep your information for as long as your account exists, and
                no longer than the service needs it:
              </p>
              <ul className="list-disc pl-5 marker:text-[#1B7F3B] dark:marker:text-[#8EE0A1] space-y-3">
                <li>
                  <Em>Deleting an item</Em> removes it immediately. The row
                  removal and your item counter update happen in a single atomic
                  operation, so nothing lingers and nothing drifts.
                </li>
                <li>
                  <Em>Deleting your account</Em> removes your user record, and
                  database-level cascades wipe your folders, items, and audit
                  log in the same action. There is no orphaned copy left behind
                  for us to keep.
                </li>
                <li>
                  <Em>Backups.</Em> Where our infrastructure providers keep
                  short-lived backups, any vault content inside them remains
                  ciphertext, and profile data ages out with the normal backup
                  cycle.
                </li>
              </ul>
            </Section>

            <Section
              id="security"
              index="09"
              icon={ShieldCheck}
              tint="#1B7F3B"
              title="Security practices"
            >
              <p>
                Security here is structural, not a checklist bolted on
                afterwards:
              </p>
              <ul className="list-disc pl-5 marker:text-[#1B7F3B] dark:marker:text-[#8EE0A1] space-y-3">
                <li>
                  <Em>In transit</Em>, all traffic is protected with HTTPS
                  (TLS).
                </li>
                <li>
                  <Em>At rest</Em>, vault contents are AES-256-GCM ciphertext,
                  encrypted on your device with a fresh random IV on every save.
                </li>
                <li>
                  <Em>Key derivation</Em> uses PBKDF2-SHA-256 at 600,000
                  iterations (in line with OWASP guidance), with versioned
                  parameters stored per account so the algorithm can be
                  strengthened over time without a breaking migration.
                </li>
                <li>
                  <Em>Account webhooks</Em> are accepted only after their
                  cryptographic signature is verified — a forged request never
                  touches the database.
                </li>
                <li>
                  <Em>Access control</Em> scopes every query to the
                  authenticated owner. Guessing another user&apos;s item id
                  behaves exactly like requesting something that does not exist.
                </li>
              </ul>
            </Section>

            <Section
              id="limits"
              index="10"
              icon={AlertTriangle}
              tint="#1B7F3B"
              title="Honest limits"
            >
              <p>
                No zero-knowledge system protects against everything, and we
                would rather tell you where the line is:
              </p>
              <ul className="list-disc pl-5 marker:text-[#1B7F3B] dark:marker:text-[#8EE0A1] space-y-3">
                <li>
                  <Em>A weak master password.</Em> Someone who stole our
                  database could attempt to guess your password offline. The
                  slow key derivation makes each guess expensive, but a strong,
                  unique master password is your real defense.
                </li>
                <li>
                  <Em>A compromised device.</Em> Malware or a malicious browser
                  extension can read secrets while your vault is unlocked,
                  because your device is where decryption happens.
                </li>
                <li>
                  <Em>Losing both factors.</Em> If you forget your master
                  password <Em>and</Em> lose your recovery phrase, no one —
                  including us — can recover your data. That is the deliberate
                  cost of having no backdoor.
                </li>
                <li>
                  <Em>Phishing.</Em> If you are tricked into typing your master
                  password into a fake page, encryption cannot help. Always
                  confirm you are on the real site.
                </li>
              </ul>
            </Section>

            <Section
              id="rights"
              index="11"
              icon={UserCheck}
              tint="#1B7F3B"
              title="Your rights & choices"
            >
              <p>You stay in control of everything we hold:</p>
              <ul className="list-disc pl-5 marker:text-[#1B7F3B] dark:marker:text-[#8EE0A1] space-y-3">
                <li>
                  <Em>View and update</Em> your name, email, and avatar in
                  account settings; changes flow through to Opaque
                  automatically.
                </li>
                <li>
                  <Em>Add, edit, and delete items</Em> at any time. Deletions
                  take effect immediately.
                </li>
                <li>
                  <Em>Delete your account</Em> to erase everything we store
                  about you, as described in section 08.
                </li>
                <li>
                  <Em>Regional rights.</Em> Depending on where you live (for
                  example under the GDPR or CCPA), you may have rights to
                  access, correct, delete, or port your data, and to object to
                  certain processing. Contact us and we will honor them — with
                  one honest caveat: for vault contents, the only copy we can
                  produce is the ciphertext, because that is all we have.
                </li>
              </ul>
            </Section>

            <Section
              id="children"
              index="12"
              icon={Users}
              tint="#1B7F3B"
              title="Children's privacy"
            >
              <p>
                Opaque is not directed to children under 13 (or the higher
                minimum age required where you live), and we do not knowingly
                collect information from them. If you believe a child has
                created an account, contact us and we will delete it.
              </p>
            </Section>

            <Section
              id="changes"
              index="13"
              icon={FileText}
              tint="#1B7F3B"
              title="Changes to this policy"
            >
              <p>
                If this policy changes, we will revise the date at the top of
                this page. For material changes — anything that alters what we
                collect or how it is used — we will notify you in the app or by
                email before the change takes effect. One thing will not change:
                the zero-knowledge boundary. Weakening it would break the
                product, not just the policy.
              </p>
            </Section>

            <Section
              id="contact"
              index="14"
              icon={Mail}
              tint="#1B7F3B"
              title="Contact"
            >
              <p>
                Questions, requests, or concerns about your data are welcome at{" "}
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-[#1B7F3B] dark:text-[#8EE0A1] font-medium hover:underline underline-offset-4 decoration-[#1B7F3B]/40 break-words focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B7F3B]/50 rounded-sm"
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
              className="p-6 md:p-8 rounded-[24px] md:rounded-[28px] bg-[#D8F5D0] dark:bg-[#1E4B2A] border-none flex flex-col sm:flex-row sm:items-center justify-between gap-5"
            >
              <div>
                <h3 className="text-[15px] md:text-[16px] font-semibold text-[#0A2E13] dark:text-[#D8F5D0] mb-1.5">
                  Want the technical version?
                </h3>
                <p className="text-[13px] md:text-[14px] text-[#0A2E13]/80 dark:text-[#D8F5D0]/80 leading-relaxed max-w-md">
                  The documentation walks through the key hierarchy, the
                  encryption flows, and exactly what the server does — and
                  refuses to do.
                </p>
              </div>
              <div className="flex flex-col xs:flex-row sm:flex-row gap-3 w-full sm:w-auto flex-shrink-0">
                <Link
                  href="/docs/zero-knowledge-model"
                  className="group py-2.5 px-5 flex items-center justify-center gap-2 rounded-xl bg-black dark:bg-white text-white dark:text-black font-semibold text-[14px] transition-all active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/50 dark:focus-visible:ring-white/50 w-full sm:w-auto border-none"
                >
                  How it works
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link
                  href="/vault"
                  className="py-2.5 px-5 flex items-center justify-center rounded-xl bg-white/50 dark:bg-black/20 text-[#0A2E13] dark:text-[#D8F5D0] font-medium text-[14px] hover:bg-white/70 dark:hover:bg-black/40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B7F3B]/50 w-full sm:w-auto border-none"
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
