"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  User,
  ArrowUpRight,
  Menu,
  X,
  Layers,
  Users,
  CreditCard,
  BookOpen,
  GitBranch,
  Puzzle,
  Activity,
} from "lucide-react";
import Link from "next/link";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // Added icons and fixed capitalization/spelling inconsistencies
  const navItems = [
    { name: "Architecture", href: "/architecture", icon: Layers },
    { name: "About Us", href: "/about-us", icon: Users },
    { name: "Pricing", href: "/pricing", icon: CreditCard },
    { name: "Docs", href: "/docs", icon: BookOpen },
    { name: "Logs", href: "/git-track", icon: GitBranch },
    { name: "Integrations", href: "/integrations", icon: Puzzle },
    { name: "Checker", href: "/checker", icon: Activity },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-zinc-800/80 ">
      <div className="max-w-[1400px] mx-auto flex h-16 items-center justify-between">
        {/* LEFT SECTION: Logo & Nav */}
        <div className="flex h-full flex-1 overflow-hidden">
          {/* Logo Block */}
          <Link
            href="/"
            className="flex items-center gap-3 px-4 md:px-6 h-full border-r border-zinc-800/80 hover:bg-zinc-900/50 transition-colors flex-shrink-0"
          >
            <Shield className="w-6 h-6 text-zinc-100" />
            <span className="text-lg font-semibold tracking-tight text-zinc-100 whitespace-nowrap">
              END<span className="text-zinc-500 font-light">Vault</span>
            </span>
          </Link>

          {/* Desktop Navigation (Hidden on screens smaller than xl to prevent flex wrapping) */}
          <nav className="hidden xl:flex items-center px-2 h-full overflow-x-auto no-scrollbar">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onMouseEnter={() => setHoveredItem(item.name)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className="relative px-3 2xl:px-4 h-full flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-zinc-100 transition-colors whitespace-nowrap"
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>

                  {/* Framer Motion background pill for hover */}
                  {hoveredItem === item.name && (
                    <motion.div
                      layoutId="header-hover-pill"
                      className="absolute inset-y-3 inset-x-0 bg-zinc-800/50 rounded-md -z-10"
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

        {/* RIGHT SECTION: Auth & CTA */}
        {/* Hidden below xl to ensure the layout never breaks */}
        <div className="hidden xl:flex h-full items-center flex-shrink-0">
          {/* Sign In Block */}
          <Link
            href="#"
            className="flex items-center gap-2 px-6 h-full border-l border-zinc-800/80 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-900/50 transition-all uppercase tracking-wider whitespace-nowrap"
          >
            <span>Sign In</span>
            <User className="w-4 h-4" />
          </Link>

          {/* Primary CTA Block */}
          <Link
            href="#"
            className="group flex items-center gap-2 px-6 h-full bg-zinc-100 text-black text-sm font-semibold hover:bg-white transition-colors uppercase tracking-wider border-l border-zinc-800/80 whitespace-nowrap"
          >
            <span>Initialize Vault</span>
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>

        {/* MOBILE MENU TOGGLE */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="xl:hidden flex items-center justify-center h-full px-6 border-l border-zinc-800/80 text-zinc-300 hover:text-white flex-shrink-0"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
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
            className="xl:hidden overflow-hidden bg-black border-b border-zinc-800/80"
          >
            {/* Added max-h and overflow-y-auto to prevent breaking on short screens */}
            <div className="flex flex-col px-4 py-6 space-y-4 max-h-[calc(100vh-4rem)] overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 text-lg font-medium text-zinc-400 hover:text-zinc-100 transition-colors p-2 hover:bg-zinc-900/50 rounded-lg"
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}

              <div className="h-px bg-zinc-800/80 w-full my-4" />

              <Link
                href="#"
                className="flex items-center justify-between text-lg font-medium text-zinc-300 hover:text-white p-2"
              >
                <span>Sign In</span>
                <User className="w-5 h-5" />
              </Link>

              <Link
                href="#"
                className="flex items-center justify-between w-full p-4 mt-2 bg-zinc-100 text-black text-sm font-semibold rounded-md uppercase tracking-wider"
              >
                <span>Initialize Vault</span>
                <ArrowUpRight className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
