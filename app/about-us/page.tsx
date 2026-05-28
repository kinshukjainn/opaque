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

const primaryButtonClass =
  "inline-flex w-fit items-center justify-center gap-2 h-10 px-6 font-medium text-sm bg-zinc-100 text-black rounded-full hover:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-black";

export default function AboutUs() {
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

  const socialLinks = [
    {
      icon: <FaGithub className="w-4 h-4" />,
      href: "https://github.com/cloudkinshuk",
      label: "GitHub",
    },
    {
      icon: <FaTwitter className="w-4 h-4" />,
      href: "https://x.com/realkinshuk004",
      label: "Twitter",
    },
    {
      icon: <FaInstagram className="w-4 h-4" />,
      href: "https://instagram.com/kinshukjainn",
      label: "Instagram",
    },
  ];

  return (
    <div className="min-h-screen bg-black text-zinc-300 py-20 px-6  selection:bg-zinc-800 selection:text-white">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* ================= PROJECT SECTION ================= */}
        <section className="bg-zinc-900/20 border border-zinc-800/80 p-8 md:p-10 shadow-xl shadow-black/20 rounded-2xl backdrop-blur-md">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-6">
            <div className="p-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl flex shrink-0 items-center justify-center">
              <Shield className="w-8 h-8 text-zinc-100" />
            </div>
            <div>
              <h1 className="text-3xl font-semibold text-zinc-100 tracking-tight leading-tight">
                About EndVault
              </h1>
              <p className="text-xs font-mono text-zinc-500 uppercase tracking-wider mt-1.5">
                Zero-Knowledge Password Manager
              </p>
            </div>
          </div>

          <p className="text-base text-zinc-400 leading-relaxed mb-8 max-w-[70ch]">
            EndVault is a modern, end-to-end encrypted password vault engineered
            for absolute privacy. By strictly separating authentication from
            decryption, your master key never leaves your browser&apos;s local
            memory. Say goodbye to cloud vulnerabilities and hello to a private
            ecosystem where the server remains a blind gatekeeper—never a
            reader.
          </p>

          <div className="bg-black/40 border border-zinc-800/50 p-6 rounded-xl">
            <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
              <strong className="text-zinc-200 font-semibold">
                Proudly Open Source
              </strong>{" "}
              — EndVault is built with transparency in mind. The core project is
              open-source, meaning developers can audit the cryptographic flows,
              self-host, and contribute to its continuous improvement.
            </p>
            <a
              href="https://github.com/cloudkinshuk/EndVault"
              target="_blank"
              rel="noopener noreferrer"
              className={primaryButtonClass}
            >
              <FaGithub className="w-4 h-4" />
              View Source on GitHub
            </a>
          </div>
        </section>

        {/* ================= DEVELOPER SECTION ================= */}
        <section className="flex flex-col md:flex-row gap-8 items-start bg-zinc-900/20 border border-zinc-800/80 p-8 md:p-10 shadow-xl shadow-black/20 rounded-2xl backdrop-blur-md">
          {/* Avatar */}
          <div className="flex-shrink-0 relative w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden border border-zinc-700/50 shadow-lg">
            <Image
              src="/profile.jpg" // Replace with your actual image path
              alt="Kinshuk Jain Avatar"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 112px, 144px"
              priority
            />
          </div>

          {/* Bio & Socials */}
          <div className="space-y-5 w-full">
            <div>
              <h2 className="text-2xl font-semibold text-zinc-100 tracking-tight leading-tight">
                Hi, I am Kinshuk Jain
              </h2>
              <p className="text-xs font-mono text-zinc-500 uppercase tracking-wider mt-1.5">
                Lead Developer & Creator
              </p>
            </div>

            <div className="border-t border-zinc-800/80 w-full"></div>

            <p className="text-sm text-zinc-400 leading-relaxed max-w-[65ch]">
              I am the lead developer and creator behind EndVault. I specialize
              in building robust tools, platforms, and web applications focused
              on great user experiences and modern architectures. When I am not
              coding, I am writing about tech, exploring new frameworks, or
              looking for ways to improve the digital tools we use every day.
            </p>

            {/* Social Links */}
            <div className="flex flex-wrap gap-3 pt-2">
              {socialLinks.map((social, idx) => (
                <a
                  key={idx}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="flex items-center justify-center w-10 h-10 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-lg hover:text-zinc-100 hover:bg-zinc-800 transition-all"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* ================= RESOURCES & LINKS GRID ================= */}
        <section className="pt-6">
          <div className="flex items-center gap-4 mb-6">
            <h3 className="text-xl font-semibold text-zinc-100 tracking-tight">
              More Resources
            </h3>
            <div className="flex-1 border-t border-zinc-800/80"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {links.map((link, index) => (
              <a
                key={index}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col p-6 bg-zinc-900/10 border border-zinc-800/80 hover:bg-zinc-900/30 transition-colors rounded-2xl"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-2.5 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-zinc-300 group-hover:text-zinc-100 transition-colors">
                    {link.icon}
                  </div>
                  <h4 className="text-base font-medium text-zinc-100">
                    {link.title}
                  </h4>
                </div>

                <p className="text-sm text-zinc-400 leading-relaxed mb-6 flex-1">
                  {link.description}
                </p>

                <div className="mt-auto flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-zinc-500 group-hover:text-zinc-300 transition-colors">
                  Visit Link <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* ================= FOOTER ================= */}
        <footer className="pt-16 pb-8 text-center">
          <p className="text-xs font-mono text-zinc-600 uppercase tracking-widest">
            Copyright © {new Date().getFullYear()} Kinshuk Jain. All rights
            reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}
