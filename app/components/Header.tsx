"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import {
  User,
  ArrowUpRight,
  Menu,
  X,
  Layers,
  Users,
  BookOpen,
  GitBranch,
  Puzzle,
  Activity,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import UserProfileDropdown from "./UserprofileDropdown";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // Same hook UserProfileDropdown uses — resolves cleanly in your project.
  const { isLoaded, isSignedIn } = useUser();

  const navItems = [
    { name: "Architecture", href: "/architecture", icon: Layers },
    { name: "About Us", href: "/about-us", icon: Users },
    { name: "Docs", href: "/docs", icon: BookOpen },
    { name: "Logs", href: "/git-track", icon: GitBranch },
    { name: "Integrations", href: "/integrations", icon: Puzzle },
    { name: "Checker", href: "/checker", icon: Activity },
  ];

  // Material You / Pixel Styled Blocks

  const ctaBlock =
    "group flex items-center gap-2 px-6 py-2.5 rounded-full bg-yellow-500 text-black text-[15px] font-bold  transition-all whitespace-nowrap shadow-sm transform hover:scale-[1.02] active:scale-95";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#161923] border-b border-[#282A2C]">
      <div className="max-w-[1400px] mx-auto flex h-[72px] items-center justify-between px-4 md:px-6">
        {/* LEFT SECTION: Logo & Nav */}
        <div className="flex h-full flex-1 items-center overflow-hidden gap-2 md:gap-6">
          {/* Logo Block - Now fully responsive */}
          <Link
            href="/"
            className="flex items-center gap-1.5 sm:gap-3 px-2 sm:px-3 py-2  transition-colors shrink-0 z-10"
          >
            {/* Shield: hidden on tiny mobile screens to save space, visible sm and up */}

            {/* Custom Logo Image: Using 238x229 aspect ratio but scaling responsively via Tailwind */}
            <Image
              src="/logo/logog.png"
              alt="Opaque Logo"
              width={238}
              height={229}
              className="w-6 h-auto sm:w-7 sm:h-auto object-contain shrink-0"
              priority
            />

            {/* Text: Scales down slightly on mobile to prevent layout breaking */}
            <span className="text-2xl sm:text-3xl font-normal tracking-tight text-white whitespace-nowrap">
              Opaque
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center gap-1 h-full overflow-x-auto no-scrollbar">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onMouseEnter={() => setHoveredItem(item.name)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className="relative px-4 py-2 flex items-center gap-2 text-[14px] font-medium text-white transition-colors  z-10"
                >
                  <Icon className="w-4 h-4 text-green-500" />
                  <span>{item.name}</span>

                  {hoveredItem === item.name && (
                    <motion.div
                      layoutId="header-hover-pill"
                      className="absolute inset-0 border-b-2 border-green-500 -z-10"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* RIGHT SECTION: Auth-aware */}
        <div className="hidden xl:flex h-full items-center gap-3 flex-shrink-0">
          {isLoaded &&
            (isSignedIn ? (
              <>
                <Link href="/vault" className={ctaBlock}>
                  <span>Open Vault</span>
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
                <div className="flex items-center pl-2">
                  <UserProfileDropdown variant="desktop" />
                </div>
              </>
            ) : (
              <>
                <div className="google-border-wrap">
                  <Link href="/verify-regis" className="btn">
                    <User className="w-4 h-4" />
                    <span>Sign In</span>
                  </Link>
                </div>
                <Link href="/vault" className={ctaBlock}>
                  <span>Initialize Vault</span>
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              </>
            ))}
        </div>

        {/* MOBILE MENU TOGGLE */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="xl:hidden flex items-center justify-center p-2.5 rounded-full cursor-pointer bg-[#161923] text-white transition-colors flex-shrink-0"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* MOBILE DROP DOWN MENU */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
            className="xl:hidden overflow-hidden bg-[#161923]   rounded-b-[32px] border-b-2 border-gray-600 absolute top-[72px] left-0 w-full z-40"
          >
            <div className="flex flex-col px-2 py-2 space-y-1 max-h-[calc(100vh-60px)] overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 text-[16px] font-medium text-white hover:border-l-3 border-green-500 transition-colors p-4 "
                  >
                    <Icon className="w-5 h-5 text-green-500" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}

              <div className="h-px bg-[#282A2C] w-full my-4" />

              {isLoaded &&
                (isSignedIn ? (
                  <div className="flex flex-col gap-4">
                    <div className="px-2">
                      <UserProfileDropdown
                        variant="mobile"
                        onAction={() => setIsOpen(false)}
                      />
                    </div>
                    <Link
                      href="/vault"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-center gap-2 w-full p-4 bg-[#A8C7FA] text-[#041E49] text-[16px] font-semibold rounded-full transition-transform active:scale-95"
                    >
                      <span>Open Vault</span>
                      <ArrowUpRight className="w-5 h-5" />
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 pt-2">
                    <Link
                      href="/verify-regis"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-center gap-2 w-full p-4 text-[16px] font-medium text-[#E2E2E2] bg-[#1E1F20] hover:bg-[#282A2C] rounded-full transition-colors"
                    >
                      <User className="w-5 h-5" />
                      <span>Sign In</span>
                    </Link>
                    <Link
                      href="/vault"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-center gap-2 w-full p-4 bg-[#A8C7FA] text-[#041E49] text-[16px] font-semibold rounded-full transition-transform active:scale-95"
                    >
                      <span>Initialize Vault</span>
                      <ArrowUpRight className="w-5 h-5" />
                    </Link>
                  </div>
                ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
