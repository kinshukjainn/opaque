"use client";

import Image from "next/image";
import { motion, Variants } from "framer-motion";
import {
  FaGlobe,
  FaPenNib,
  FaCommentDots,
  FaMugHot,
  FaGithub,
  FaTwitter,
  FaInstagram,
} from "react-icons/fa";
import { ArrowUpRight } from "lucide-react";

// Material 3 Expressive Spring Physics
const m3SpatialSpring = {
  type: "spring" as const,
  stiffness: 420,
  damping: 32,
  mass: 0.9,
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: m3SpatialSpring },
};

const stagger: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

export default function AboutUs() {
  /* ── Links Data ── */
  const links = [
    {
      title: "Portfolio & Projects",
      description:
        "Explore my main website to see my latest work and creations.",
      href: "https://cloudkinshuk.in",
      icon: <FaGlobe className="w-5 h-5" />,
    },
    {
      title: "Read the Blog",
      description: "Thoughts, tutorials, and articles on tech and development.",
      href: "https://cloudkinshuk.in/home-blog",
      icon: <FaPenNib className="w-5 h-5" />,
    },
    {
      title: "Share Feedback",
      description: "Got ideas or found a bug? Let me know how I can improve.",
      href: "https://fdb.cloudkinshuk.in",
      icon: <FaCommentDots className="w-5 h-5" />,
    },
    {
      title: "Support My Work",
      description:
        "Buy me a brew or support the repository to keep servers running.",
      href: "https://brewrepo.cloudkinshuk.in",
      icon: <FaMugHot className="w-5 h-5" />,
    },
  ];

  /* ── Social Links Data ── */
  const socialLinks = [
    {
      icon: <FaGithub className="w-5 h-5" />,
      href: "https://github.com/cloudkinshuk",
      label: "GitHub",
    },
    {
      icon: <FaTwitter className="w-5 h-5" />,
      href: "https://x.com/realkinshuk004",
      label: "Twitter",
    },
    {
      icon: <FaInstagram className="w-5 h-5" />,
      href: "https://instagram.com/kinshukjainn",
      label: "Instagram",
    },
  ];

  return (
    <main className="min-h-screen bg-white dark:bg-[#050505] text-[#111318] dark:text-[#E2E2E9] pt-28 pb-20 px-4 sm:px-6 antialiased selection:bg-[#D3E4FF] selection:text-[#001D36] dark:selection:bg-[#204473] dark:selection:text-[#D3E4FF] transition-colors duration-200">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="max-w-5xl mx-auto space-y-8"
      >
        {/* ================= HERO / PROJECT SECTION (Massive Tonal Block) ================= */}
        <motion.section
          variants={fadeUp}
          className="bg-blue-100 dark:bg-[#141414] rounded-[40px] p-6 sm:p-10 md:p-14 border-none relative overflow-hidden"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-8">
            {/* M3 Expressive Squircle Icon Container (Inverted for contrast) */}
            <div className="w-16 h-16 bg-black dark:bg-white rounded-[24px] flex shrink-0 items-center justify-center border-none shadow-sm">
              <Image
                src="/logo/logog.png"
                alt="Opaque Logo"
                width={308}
                height={309}
                className="w-9 h-auto sm:w-10 sm:h-auto object-contain shrink-0 dark:invert"
                priority
              />
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-[32px] sm:text-[40px] font-extrabold text-[#001D36] dark:text-[#D3E4FF] tracking-tight leading-none">
                  About Opaque
                </h1>
                <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-[13px] font-bold bg-white/50 dark:bg-black/30 text-[#001D36] dark:text-[#D3E4FF] border-none backdrop-blur-sm">
                  Zero-Knowledge Vault
                </span>
              </div>
              <p className="text-[15px] sm:text-[16px] font-medium text-[#001D36]/70 dark:text-[#D3E4FF]/70">
                Client-side encrypted password management architecture
              </p>
            </div>
          </div>

          <p className="text-[16px] sm:text-[18px] text-[#001D36]/90 dark:text-[#D3E4FF]/90 leading-[1.7] mb-10 max-w-[70ch] font-medium">
            <strong className="font-bold text-[#001D36] dark:text-[#D3E4FF]">
              Opaque
            </strong>{" "}
            is a modern, end-to-end encrypted password vault engineered for
            absolute privacy. By strictly separating authentication from
            decryption, your master key never leaves your browser&apos;s local
            memory. Say goodbye to cloud vulnerabilities and hello to a private
            ecosystem where the server remains a blind gatekeeper—never a
            reader.
          </p>

          {/* Nested High-Contrast Callout (B&W inversion) */}
          <div className="bg-white dark:bg-[#050505] p-6 sm:p-8 rounded-[32px] flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-none">
            <p className="text-[15px] sm:text-[16px] text-gray-700 dark:text-gray-300 leading-relaxed max-w-[54ch]">
              <strong className="text-black dark:text-white font-bold block sm:inline mb-1.5 sm:mb-0">
                Proudly Open Source —{" "}
              </strong>
              Built with transparency in mind. Developers can audit the
              cryptographic flows, self-host, and contribute to its continuous
              improvement.
            </p>

            {/* Primary Shape-Morphing M3 Button */}
            <a
              href="https://github.com/cloudkinshuk/Opaque"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 w-full sm:w-auto items-center justify-center gap-2.5 py-3.5 px-6 font-bold text-[15px] bg-[#D3E4FF] dark:bg-[#204473] hover:bg-[#C2D3FF] dark:hover:bg-[#17324F] text-[#001D36] dark:text-[#D3E4FF] rounded-[24px] hover:rounded-[16px] active:rounded-[12px] transition-[border-radius,background-color,transform] duration-200 active:scale-[0.97] border-none"
            >
              <FaGithub className="w-[20px] h-[20px] shrink-0" />
              <span>View Source on GitHub</span>
            </a>
          </div>
        </motion.section>

        {/* ================= DEVELOPER SECTION (Borderless Card) ================= */}
        <motion.section
          variants={fadeUp}
          className="flex flex-col md:flex-row gap-6 sm:gap-10 items-start bg-gray-50 dark:bg-[#111111] rounded-[40px] p-6 sm:p-10 border-none"
        >
          {/* Avatar - Crisp M3 Squircle */}
          <div className="shrink-0 relative w-[120px] h-[120px] sm:w-[150px] sm:h-[150px] rounded-[36px] overflow-hidden bg-[#D3E4FF] dark:bg-[#204473]">
            <Image
              src="/profile.jpg"
              alt="Kinshuk Jain Avatar"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 120px, 150px"
              priority
            />
          </div>

          {/* Bio & Socials */}
          <div className="space-y-6 w-full min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <h2 className="text-[26px] sm:text-[32px] font-extrabold text-black dark:text-white tracking-tight leading-tight mb-2">
                  Hi, I am Kinshuk Jain
                </h2>
                <span className="inline-block text-[13px] font-bold text-[#001D36] dark:text-[#D3E4FF] bg-[#D3E4FF] dark:bg-[#204473] px-4 py-1.5 rounded-full">
                  Lead Developer & Creator
                </span>
              </div>

              {/* Social Links (Shape-Morphing Tonal Buttons) */}
              <div className="flex items-center gap-2.5 pt-1 sm:pt-0">
                {socialLinks.map((social, idx) => (
                  <a
                    key={idx}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="flex items-center justify-center w-12 h-12 bg-white dark:bg-[#1A1A1A] hover:bg-[#D3E4FF] dark:hover:bg-[#204473] text-gray-600 dark:text-gray-400 hover:text-[#001D36] dark:hover:text-[#D3E4FF] rounded-full hover:rounded-[16px] transition-[border-radius,background-color,color,transform] duration-200 active:scale-[0.95] border-none"
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Fluid Divider */}
            <div className="h-[2px] bg-gray-200 dark:bg-[#222] w-full rounded-full" />

            <p className="text-[16px] text-gray-600 dark:text-gray-400 leading-[1.7] max-w-[66ch]">
              I am the lead developer and creator behind Opaque. I specialize in
              building robust tools, platforms, and web applications focused on
              great user experiences and modern architectures. When I am not
              coding, I am writing about tech, exploring new frameworks, or
              looking for ways to improve the digital tools we use every day.
            </p>
          </div>
        </motion.section>

        {/* ================= RESOURCES & LINKS GRID ================= */}
        <motion.section variants={fadeUp} className="pt-2">
          <div className="flex items-center gap-4 mb-6 px-2">
            <h3 className="text-[22px] sm:text-[24px] font-extrabold text-black dark:text-white tracking-tight shrink-0">
              More Resources
            </h3>
            <div className="h-[2px] flex-1 bg-gray-100 dark:bg-[#1A1A1A] rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {links.map((link, index) => (
              <a
                key={index}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col justify-between p-6 sm:p-8 bg-gray-50 dark:bg-[#111111] hover:bg-[#D3E4FF] dark:hover:bg-[#204473] rounded-[32px] hover:rounded-[24px] transition-[border-radius,background-color,transform] duration-200 active:scale-[0.98] border-none"
              >
                <div>
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-4">
                      {/* Tonal Icon Container */}
                      <div className="w-12 h-12 flex items-center justify-center bg-white dark:bg-[#1A1A1A] group-hover:bg-white/50 dark:group-hover:bg-black/20 text-black dark:text-white group-hover:text-[#001D36] dark:group-hover:text-[#D3E4FF] rounded-[16px] shrink-0 transition-colors duration-200">
                        {link.icon}
                      </div>
                      <h4 className="text-[18px] sm:text-[20px] font-extrabold text-black dark:text-white group-hover:text-[#001D36] dark:group-hover:text-[#D3E4FF] tracking-tight transition-colors duration-200">
                        {link.title}
                      </h4>
                    </div>

                    <span className="flex items-center justify-center w-9 h-9 rounded-full bg-white dark:bg-[#1A1A1A] group-hover:bg-black/10 dark:group-hover:bg-black/30 text-gray-500 group-hover:text-[#001D36] dark:group-hover:text-[#D3E4FF] transition-colors duration-200 shrink-0">
                      <ArrowUpRight className="w-5 h-5" />
                    </span>
                  </div>

                  <p className="text-[15px] text-gray-600 dark:text-gray-400 group-hover:text-[#001D36]/80 dark:group-hover:text-[#D3E4FF]/80 leading-relaxed transition-colors duration-200">
                    {link.description}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t-2 border-gray-200/50 dark:border-[#222]/50 flex items-center justify-between text-[14px] font-bold text-gray-500 group-hover:text-[#001D36] dark:group-hover:text-[#D3E4FF] transition-colors duration-200">
                  <span>Open Resource</span>
                  <span className="text-[12px] font-medium opacity-70 truncate max-w-[180px]">
                    {link.href.replace("https://", "")}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </motion.section>

        {/* ================= FOOTER ================= */}
        <motion.footer variants={fadeUp} className="pt-10 pb-4 text-center">
          <p className="text-[14px] font-medium text-gray-400 dark:text-gray-600">
            Copyright © {new Date().getFullYear()} Kinshuk Jain. All rights
            reserved.
          </p>
        </motion.footer>
      </motion.div>
    </main>
  );
}
