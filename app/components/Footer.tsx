import React, { JSX } from "react";
import {
  FiHome,
  FiGrid,
  FiShield,
  FiFile,
  FiGlobe,
  FiMessageSquare,
  FiBox,
  FiUser,
  FiGithub,
} from "react-icons/fi";
import { FaLinkedin } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";
import { FaPenAlt } from "react-icons/fa";

import { LuKeyRound, LuShieldCheck } from "react-icons/lu";
import { FaXTwitter } from "react-icons/fa6";

import { GrContact } from "react-icons/gr";

import { FaUser } from "react-icons/fa";

// --- Types ---
type LinkItem = {
  name: string;
  href: string;
  icon: React.ElementType;
};

// --- Data ---
const navigationLinks: LinkItem[] = [
  { name: "Home", href: "/", icon: FiHome },
  { name: "Integrations", href: "/integrations", icon: FiGrid },
  { name: "About", href: "/about-us", icon: FaUser },
];

const legalLinks: LinkItem[] = [
  { name: "Privacy Policy", href: "/privacy-policy", icon: FiShield },
  { name: "Terms & Conditions", href: "/terms", icon: FiFile },
];

const creatorLinks: LinkItem[] = [
  { name: "cloudkinshuk.in", href: "https://cloudkinshuk.in", icon: FiGlobe },
  {
    name: "Feedback.in",
    href: "https://clkfeedbacks.cloudkinshuk.in",
    icon: FiMessageSquare,
  },
  { name: "Kosha.in", href: "https://kosha.cloudkinshuk.in", icon: FiBox },
  {
    name: "Github",
    href: "https://github.com/kinshukjainn/opaque",
    icon: FiGithub,
  },
];
const socialLinks: LinkItem[] = [
  {
    name: "Github",
    href: "https://github.com/kinshukjainn/opaque",
    icon: FiGithub,
  },
  {
    name: "Twitter",
    href: "https://x.com/@realkinshuk004",
    icon: FaXTwitter,
  },
  {
    name: "Linkedin",
    href: "https://linkedin.com/kinshukjainn",
    icon: FaLinkedin,
  },
  {
    name: "Intagram",
    href: "https://instagram.com/kinshukjainn",
    icon: FaInstagram,
  },
  {
    name: "Blogs",
    href: "https://cloudkinshuk.in/blogs",
    icon: FaPenAlt,
  },
];

export default function Footer(): JSX.Element {
  return (
    <footer className="bg-[#FAFAFA]/20 backdrop-blur-sm dark:bg-[#0A0A0A]/20 py-16 text-sm text-gray-600 rounded-3xl mt-2 mr-2 ml-2 mb-2 dark:text-gray-400 h-max  border-none transition-colors duration-200">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        {/* Adjusted grid to properly house 5 distinct columns on large screens */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10 lg:gap-8">
          {/* Brand & Security Badge */}
          <div className="flex flex-col items-start gap-5 sm:col-span-2 md:col-span-3 lg:col-span-1">
            <div className="flex items-center gap-2.5 font-extrabold text-black dark:text-white text-3xl tracking-tight">
              <div className="p-2 bg-[#111318] dark:bg-white rounded-[18px] transition-[border-radius] duration-200">
                <LuKeyRound className="h-7 w-7 text-white dark:text-black" />
              </div>
              <span>Opaque</span>
            </div>

            {/* M3 Style Tonal Pill - Borderless */}
            <div className="flex items-center gap-2 rounded-[16px] bg-[#D8F5D0] dark:bg-[#1E4B2A] px-3.5 py-2 text-[13px] font-semibold text-[#0A2E13] dark:text-[#D8F5D0] border-none">
              <LuShieldCheck className="h-4 w-4" />
              <span>End-to-End Encrypted</span>
            </div>

            <p className="mt-2 text-[13px] leading-relaxed text-gray-500 dark:text-gray-400">
              Secure, transparent, and built for privacy.
              <br />
              &copy; {new Date().getFullYear()} Opaque. All rights reserved.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col gap-4">
            <h3 className="text-black dark:text-white font-bold tracking-wide mb-1">
              Platform
            </h3>
            <ul className="flex flex-col gap-2.5">
              {navigationLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="group flex w-fit items-center gap-2.5 px-2 py-1.5 -ml-2 rounded-[12px] hover:rounded-[8px] transition-all duration-200 hover:bg-black/5 dark:hover:bg-white/10 hover:text-black dark:hover:text-white border-none"
                  >
                    <link.icon className="h-4 w-4 text-gray-400 dark:text-gray-500 transition-colors duration-200 group-hover:text-black dark:group-hover:text-white" />
                    <span className="font-medium transition-transform duration-200 group-hover:translate-x-0.5">
                      {link.name}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div className="flex flex-col gap-4">
            <h3 className="text-black dark:text-white font-bold tracking-wide mb-1">
              Legal
            </h3>
            <ul className="flex flex-col gap-2.5">
              {legalLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="group flex w-fit items-center gap-2.5 px-2 py-1.5 -ml-2 rounded-[12px] hover:rounded-[8px] transition-all duration-200 hover:bg-black/5 dark:hover:bg-white/10 hover:text-black dark:hover:text-white border-none"
                  >
                    <link.icon className="h-4 w-4 text-gray-400 dark:text-gray-500 transition-colors duration-200 group-hover:text-black dark:group-hover:text-white" />
                    <span className="font-medium transition-transform duration-200 group-hover:translate-x-0.5">
                      {link.name}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Creator Info */}
          <div className="flex flex-col gap-4">
            <h3 className="flex items-center gap-2 text-black dark:text-white font-bold tracking-wide mb-1">
              <FiUser className="h-4 w-4 text-green-700 dark:text-green-400" />
              <span>@kinshuk jain</span>
            </h3>
            <ul className="flex flex-col gap-2.5">
              {creatorLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex w-fit items-center gap-2.5 px-2 py-1.5 -ml-2 rounded-[12px] hover:rounded-[8px] transition-all duration-200 hover:bg-black/5 dark:hover:bg-white/10 hover:text-black dark:hover:text-white border-none"
                  >
                    <link.icon className="h-4 w-4 text-gray-400 dark:text-gray-500 transition-colors duration-200 group-hover:text-black dark:group-hover:text-white" />
                    <span className="font-medium transition-transform duration-200 group-hover:translate-x-0.5">
                      {link.name}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Links */}
          <div className="flex flex-col gap-4">
            <h3 className="flex items-center gap-2 text-black dark:text-white font-bold tracking-wide mb-1">
              <GrContact className="h-4 w-4 text-green-700 dark:text-green-400" />
              <span>Social Link</span>
            </h3>
            <ul className="flex flex-col gap-2.5">
              {socialLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex w-fit items-center gap-2.5 px-2 py-1.5 -ml-2 rounded-[12px] hover:rounded-[8px] transition-all duration-200 hover:bg-black/5 dark:hover:bg-white/10 hover:text-black dark:hover:text-white border-none"
                  >
                    <link.icon className="h-4 w-4 text-gray-400 dark:text-gray-500 transition-colors duration-200 group-hover:text-black dark:group-hover:text-white" />
                    <span className="font-medium transition-transform duration-200 group-hover:translate-x-0.5">
                      {link.name}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
