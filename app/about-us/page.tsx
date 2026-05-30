"use client";

import Image from "next/image";
import {
  FaGlobe,
  FaPenNib,
  FaCommentDots,
  FaMugHot,
  FaGithub,
  FaTwitter,
  FaInstagram,
} from "react-icons/fa";
import { Shield, ArrowRight } from "lucide-react";

export default function AboutUs() {
  /* ── Links Data ── */
  const links = [
    {
      title: "Portfolio & Projects",
      description:
        "Explore my main website to see my latest work and creations.",
      href: "https://cloudkinshuk.in",
      icon: <FaGlobe className="w-[22px] h-[22px]" />,
    },
    {
      title: "Read the Blog",
      description: "Thoughts, tutorials, and articles on tech and development.",
      href: "https://cloudkinshuk.in/home-blog",
      icon: <FaPenNib className="w-[22px] h-[22px]" />,
    },
    {
      title: "Share Feedback",
      description: "Got ideas or found a bug? Let me know how I can improve.",
      href: "https://fdb.cloudkinshuk.in",
      icon: <FaCommentDots className="w-[22px] h-[22px]" />,
    },
    {
      title: "Support My Work",
      description:
        "Buy me a brew or support the repository to keep servers running.",
      href: "https://brewrepo.cloudkinshuk.in",
      icon: <FaMugHot className="w-[22px] h-[22px]" />,
    },
  ];

  /* ── Social Links Data ── */
  const socialLinks = [
    {
      icon: <FaGithub className="w-6 h-6" />,
      href: "https://github.com/cloudkinshuk",
      label: "GitHub",
    },
    {
      icon: <FaTwitter className="w-6 h-6" />,
      href: "https://x.com/realkinshuk004",
      label: "Twitter",
    },
    {
      icon: <FaInstagram className="w-6 h-6" />,
      href: "https://instagram.com/kinshukjainn",
      label: "Instagram",
    },
  ];

  return (
    <main className="min-h-screen bg-[#000000] text-[#E5E5E5] py-16 px-4 sm:px-6 font-sans antialiased selection:bg-[#333333] selection:text-white">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* ================= PROJECT SECTION ================= */}
        <section className="bg-[#141414] rounded-[32px] p-6 sm:p-10 transition-shadow">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-6">
            {/* Tonal Icon Container */}
            <div className="w-16 h-16 bg-[#262626] rounded-[20px] flex shrink-0 items-center justify-center text-[#FFFFFF]">
              <Shield className="w-8 h-8" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-[28px] sm:text-[32px] font-normal text-[#FFFFFF] tracking-[0.01em] leading-tight">
                About Opaque
              </h1>
              <p className="text-[14px] font-medium text-[#A3A3A3] tracking-[0.02em] mt-1 uppercase">
                Zero-Knowledge Password Manager
              </p>
            </div>
          </div>

          <p className="text-[16px] text-[#A3A3A3] tracking-[0.02em] leading-relaxed mb-8 max-w-[70ch]">
            Opaque is a modern, end-to-end encrypted password vault engineered
            for absolute privacy. By strictly separating authentication from
            decryption, your master key never leaves your browser&apos;s local
            memory. Say goodbye to cloud vulnerabilities and hello to a private
            ecosystem where the server remains a blind gatekeeper—never a
            reader.
          </p>

          {/* Nested Surface Container (High) */}
          <div className="bg-[#1E1E1E] p-6 rounded-[24px]">
            <p className="text-[15px] text-[#A3A3A3] mb-6 leading-relaxed">
              <strong className="text-[#FFFFFF] font-medium">
                Proudly Open Source
              </strong>{" "}
              — Opaque is built with transparency in mind. The core project is
              open-source, meaning developers can audit the cryptographic flows,
              self-host, and contribute to its continuous improvement.
            </p>

            {/* Primary Filled Button */}
            <a
              href="https://github.com/cloudkinshuk/Opaque"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit items-center justify-center gap-3 h-12 px-6 font-medium text-[15px] tracking-[0.01em] bg-[#FFFFFF] text-[#000000] rounded-full hover:bg-[#E5E5E5] active:bg-[#CCCCCC] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFFFFF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1E1E1E]"
            >
              <FaGithub className="w-[18px] h-[18px]" />
              View Source on GitHub
            </a>
          </div>
        </section>

        {/* ================= DEVELOPER SECTION ================= */}
        <section className="flex flex-col md:flex-row gap-8 items-start bg-[#141414] rounded-[32px] p-6 sm:p-10">
          {/* Avatar - Solid M3 borderless style */}
          <div className="flex-shrink-0 relative w-[120px] h-[120px] md:w-[140px] md:h-[140px] rounded-full overflow-hidden bg-[#262626]">
            <Image
              src="/profile.jpg"
              alt="Kinshuk Jain Avatar"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 120px, 140px"
              priority
            />
          </div>

          {/* Bio & Socials */}
          <div className="space-y-6 w-full">
            <div>
              <h2 className="text-[24px] font-normal text-[#FFFFFF] tracking-[0.01em] leading-tight">
                Hi, I am Kinshuk Jain
              </h2>
              <p className="text-[14px] font-medium text-[#A3A3A3] tracking-[0.02em] mt-1 uppercase">
                Lead Developer & Creator
              </p>
            </div>

            {/* M3 Outline Variant Divider */}
            <div className="border-t border-[#333333] w-full"></div>

            <p className="text-[16px] text-[#A3A3A3] tracking-[0.02em] leading-relaxed max-w-[65ch]">
              I am the lead developer and creator behind Opaque. I specialize in
              building robust tools, platforms, and web applications focused on
              great user experiences and modern architectures. When I am not
              coding, I am writing about tech, exploring new frameworks, or
              looking for ways to improve the digital tools we use every day.
            </p>

            {/* Secondary Tonal Buttons (Social Links) */}
            <div className="flex flex-wrap gap-3 pt-2">
              {socialLinks.map((social, idx) => (
                <a
                  key={idx}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="flex items-center justify-center w-12 h-12 bg-[#262626] text-[#A3A3A3] rounded-full hover:bg-[#333333] hover:text-[#FFFFFF] active:bg-[#404040] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFFFFF]"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* ================= RESOURCES & LINKS GRID ================= */}
        <section className="pt-6">
          <div className="flex items-center gap-4 mb-6 px-2">
            <h3 className="text-[20px] font-medium text-[#FFFFFF] tracking-[0.01em]">
              More Resources
            </h3>
            <div className="flex-1 border-t border-[#333333]"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {links.map((link, index) => (
              <a
                key={index}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col p-6 bg-[#141414] hover:bg-[#1E1E1E] active:bg-[#262626] transition-colors rounded-[28px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFFFFF]"
              >
                <div className="flex items-center gap-4 mb-4">
                  {/* Tonal Icon Box */}
                  <div className="w-[48px] h-[48px] flex items-center justify-center bg-[#262626] text-[#FFFFFF] rounded-[16px] group-hover:bg-[#FFFFFF] group-hover:text-[#000000] transition-colors">
                    {link.icon}
                  </div>
                  <h4 className="text-[18px] font-medium text-[#FFFFFF] tracking-[0.01em]">
                    {link.title}
                  </h4>
                </div>

                <p className="text-[15px] text-[#A3A3A3] tracking-[0.02em] leading-relaxed mb-6 flex-1">
                  {link.description}
                </p>

                <div className="mt-auto flex items-center gap-2 text-[14px] font-medium text-[#FFFFFF] tracking-[0.01em] transition-colors">
                  Visit Link
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* ================= FOOTER ================= */}
        <footer className="pt-12 pb-8 text-center">
          <p className="text-[14px] text-[#737373] tracking-[0.02em]">
            Copyright © {new Date().getFullYear()} Kinshuk Jain. All rights
            reserved.
          </p>
        </footer>
      </div>
    </main>
  );
}
