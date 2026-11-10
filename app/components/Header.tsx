"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoCloudDoneSharp } from "react-icons/io5";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { User, Menu, X, Users, Puzzle, Activity } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import UserProfileDropdown from "./UserprofileDropdown";
import ThemeToggle from "./Themetoggle";

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

// Dynamic Route Colors (Material You inspired)
const getRouteColors = (path: string) => {
  switch (path) {
    case "/about-us":
      // Soft Blue (like Image 1)
      return {
        activeBg: "bg-[#D3E4FF] dark:bg-[#204473]",
        activeText: "text-[#001D36] dark:text-[#D3E4FF]",
        hoverBg: "bg-[#E8F1FF] dark:bg-[#17324F]",
        icon: "text-[#0061A4] dark:text-[#9FCAFF]",
      };
    case "/integrations":
      // Soft Green (like Image 3)
      return {
        activeBg: "bg-[#D8F5D0] dark:bg-[#1E4B2A]",
        activeText: "text-[#0A2E13] dark:text-[#D8F5D0]",
        hoverBg: "bg-[#EAFAE5] dark:bg-[#153A1E]",
        icon: "text-[#1B7F3B] dark:text-[#8EE0A1]",
      };
    case "/checker":
      // Soft Purple (like Image 2)
      return {
        activeBg: "bg-[#EADDFF] dark:bg-[#4A3C68]",
        activeText: "text-[#21005D] dark:text-[#EADDFF]",
        hoverBg: "bg-[#F4ECFF] dark:bg-[#382A52]",
        icon: "text-[#6A4EA0] dark:text-[#D0BCFF]",
      };
    default:
      // Fallback (B&W)
      return {
        activeBg: "bg-gray-200 dark:bg-gray-800",
        activeText: "text-black dark:text-white",
        hoverBg: "bg-gray-100 dark:bg-gray-900",
        icon: "text-gray-600 dark:text-gray-400",
      };
  }
};

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const pathname = usePathname();

  const { isLoaded, isSignedIn } = useUser();

  // Close mobile menu automatically when viewport crosses desktop breakpoint
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const navItems = [
    { name: "About Creator", href: "/about-us", icon: Users },
    { name: "Integrations", href: "/integrations", icon: Puzzle },
    { name: "Checker", href: "/checker", icon: Activity },
  ];

  // Borderless, high-contrast, Google-style CTA
  const ctaBlock =
    "group relative flex items-center gap-2 px-4 xl:px-5 py-2.5 rounded-[28px] hover:rounded-[18px] active:rounded-[12px] bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 font-semibold text-[14px] xl:text-[15px] tracking-tight transition-[border-radius,background-color,transform] duration-200 whitespace-nowrap active:scale-[0.97]";

  return (
    <header className="fixed w-full z-50 bg-white/80 dark:bg-[#0A0A0A]/80 backdrop-blur-xl transition-colors duration-200 border-none">
      <div className="max-w-[1440px] mx-auto flex h-[72px] items-center justify-between px-3 sm:px-5 xl:px-8 gap-2">
        {/* LEFT SECTION: Brand Identity & M3 Tonal Nav Track */}
        <div className="flex h-full items-center gap-3 xl:gap-6 min-w-0">
          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className="group flex items-center gap-2.5 pr-2 py-1.5 rounded-full outline-none shrink-0"
          >
            <div className="p-2 bg-[#111318] dark:bg-white rounded-[18px] group-hover:rounded-[14px] group-active:rounded-[10px] transition-[border-radius,background-color] duration-200">
              <Image
                src="/logo/logog.png"
                alt="Opaque Logo"
                width={238}
                height={229}
                className="w-8 h-auto sm:w-8 sm:h-auto object-contain shrink-0 dark:invert"
                priority
              />
            </div>
            <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-black taglinefont dark:text-white whitespace-nowrap">
              Opaque
            </span>
          </Link>

          {/* Desktop Navigation (Borderless M3 Pill Track) */}
          <nav
            aria-label="Main Navigation"
            onMouseLeave={() => setHoveredItem(null)}
            className="hidden lg:flex items-center p-1"
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              const isHovered = hoveredItem === item.name;
              const routeColors = getRouteColors(item.href);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onMouseEnter={() => setHoveredItem(item.name)}
                  className={`relative px-3 xl:px-4 py-2 flex items-center gap-1.5 xl:gap-2 text-[13.5px] xl:text-[14.5px] font-semibold tracking-tight rounded-full transition-colors duration-150 z-10 whitespace-nowrap select-none ${
                    isActive
                      ? routeColors.activeText
                      : "text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white"
                  }`}
                >
                  {/* Active Route Tonal Indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="header-active-pill"
                      className={`absolute inset-0 rounded-full -z-20 ${routeColors.activeBg}`}
                      transition={m3SpatialSpring}
                    />
                  )}

                  {/* Expressive Hover Tonal Pill */}
                  {isHovered && (
                    <motion.div
                      layoutId="header-hover-pill"
                      className={`absolute inset-0 rounded-full -z-10 ${
                        isActive
                          ? "bg-black/5 dark:bg-white/10" // subtle overlay if hovering active
                          : routeColors.hoverBg
                      }`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={m3SpatialSpring}
                    />
                  )}

                  <Icon
                    className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                      isHovered ? "scale-110" : "scale-100"
                    } ${
                      isActive
                        ? routeColors.icon
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* RIGHT SECTION: Auth, Theme, and Mobile Toggle */}
        <div className="flex h-full items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Auth-aware Action Cluster (Desktop) */}
          <div className="hidden lg:flex items-center gap-2.5">
            {isLoaded &&
              (isSignedIn ? (
                <>
                  <a href="https://kosha.cloudkinshuk.in" className={ctaBlock}>
                    <IoCloudDoneSharp className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    <span>Open Kosha</span>
                  </a>
                  <div className="flex items-center pl-1">
                    <UserProfileDropdown variant="desktop" />
                  </div>
                </>
              ) : (
                <>
                  <Link
                    href="/verify-regis"
                    className="flex items-center gap-2 px-4 xl:px-5 py-2.5 rounded-[28px] hover:rounded-[18px] active:rounded-[12px] font-semibold text-[14px] xl:text-[15px] tracking-tight bg-gray-100 dark:bg-[#1A1A1A] hover:bg-gray-200 dark:hover:bg-[#2A2A2A] text-black dark:text-white transition-[border-radius,background-color,transform] duration-200 active:scale-[0.97] whitespace-nowrap border-none"
                  >
                    <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <span>Sign In</span>
                  </Link>
                  <a href="https://kosha.cloudkinshuk.in" className={ctaBlock}>
                    <IoCloudDoneSharp className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    <span>Open Kosha</span>
                  </a>
                </>
              ))}
          </div>

          {/* Theme Toggle Container */}
          <div className="flex items-center">
            <ThemeToggle />
          </div>

          {/* MOBILE MENU TOGGLE (M3 Shape-Morphing Icon Button) */}
          <motion.button
            type="button"
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(!isOpen)}
            className={`lg:hidden flex items-center justify-center w-10 h-10 cursor-pointer transition-[border-radius,background-color] duration-200 shrink-0 border-none ${
              isOpen
                ? "rounded-[14px] bg-black dark:bg-white text-white dark:text-black"
                : "rounded-full bg-gray-100 dark:bg-[#1A1A1A] text-black dark:text-white"
            }`}
          >
            <AnimatePresence mode="wait" initial={false}>
              {isOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0, scale: 0.7 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: 90, opacity: 0, scale: 0.7 }}
                  transition={m3FastSpring}
                >
                  <X className="w-7 h-7" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0, scale: 0.7 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: -90, opacity: 0, scale: 0.7 }}
                  transition={m3FastSpring}
                >
                  <Menu className="w-7 h-7" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      {/* MOBILE DROP DOWN SHEET (Borderless, Contrasting, Tonal) */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Flat Scrim Overlay to dismiss on outside tap */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsOpen(false)}
              className="lg:hidden fixed inset-0 top-[80px] bg-white/40 dark:bg-black/40 backdrop-blur-sm z-30"
            />

            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={m3SpatialSpring}
              className="lg:hidden overflow-hidden bg-white dark:bg-[#0A0A0A] right-3 rounded-[32px] absolute top-[82px] w-max z-40 shadow-xl shadow-black/5 dark:shadow-white/5 border-none"
            >
              <div className="flex flex-col p-4 sm:p-5 max-h-[calc(100dvh-100px)] overflow-y-auto">
                {/* M3 EXPRESSIVE TILES GRID */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {navItems.map((item, idx) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    const routeColors = getRouteColors(item.href);

                    return (
                      <motion.div
                        key={item.name}
                        initial={{ opacity: 0, y: 10, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{
                          ...m3SpatialSpring,
                          delay: idx * 0.03,
                        }}
                        className={
                          idx === navItems.length - 1 &&
                          navItems.length % 2 !== 0
                            ? "col-span-2 sm:col-span-1"
                            : ""
                        }
                      >
                        <Link
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className={`group flex items-center sm:flex-col justify-start sm:justify-center gap-3 sm:gap-2 rounded-[22px] active:rounded-[14px] px-4 py-3.5 transition-[border-radius,background-color,transform] duration-200 active:scale-[0.97] border-none ${
                            isActive
                              ? `${routeColors.activeBg} ${routeColors.activeText}`
                              : "bg-gray-50 dark:bg-[#1A1A1A] hover:bg-gray-100 dark:hover:bg-[#222222] text-black dark:text-white"
                          }`}
                        >
                          <div
                            className={`flex items-center justify-center w-9 h-9 rounded-full shrink-0 transition-colors ${
                              isActive
                                ? "bg-white/40 dark:bg-black/20"
                                : "bg-gray-200 dark:bg-[#2A2A2A] text-gray-700 dark:text-gray-300"
                            }`}
                          >
                            <Icon
                              className={`w-4 h-4 ${isActive ? routeColors.icon : ""}`}
                            />
                          </div>
                          <span className="text-[14px] font-semibold tracking-tight text-left sm:text-center truncate">
                            {item.name}
                          </span>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Borderless Divider */}
                <div className="h-px bg-gray-100 dark:bg-[#1F1F1F] w-full my-4" />

                {/* AUTH & CTA SECTION */}
                {isLoaded &&
                  (isSignedIn ? (
                    <div className="flex flex-col gap-3">
                      <div className="p-2 rounded-[22px] bg-gray-50 dark:bg-[#1A1A1A] flex justify-center">
                        <UserProfileDropdown
                          variant="mobile"
                          onAction={() => setIsOpen(false)}
                        />
                      </div>
                      <a
                        href="https://kosha.cloudkinshuk.in"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-center gap-2.5 w-full py-3.5 px-5 bg-black dark:bg-white text-white dark:text-black text-[15px] font-bold rounded-[26px] active:rounded-[14px] transition-[border-radius,background-color,transform] duration-200 active:scale-[0.98] border-none"
                      >
                        <IoCloudDoneSharp className="w-5 h-5" />
                        <span>Open Kosha</span>
                      </a>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2.5">
                      <Link
                        href="/verify-regis"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-center gap-2 py-3.5 px-4 text-[14.5px] font-bold text-black dark:text-white bg-gray-100 dark:bg-[#1A1A1A] hover:bg-gray-200 dark:hover:bg-[#2A2A2A] rounded-[24px] active:rounded-[14px] transition-[border-radius,background-color,transform] duration-200 active:scale-[0.97] border-none"
                      >
                        <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        <span>Sign In</span>
                      </Link>
                      <a
                        href="https://kosha.cloudkinshuk.in"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-center gap-2 py-3.5 px-4 text-[14.5px] font-bold text-white dark:text-black bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 rounded-[24px] active:rounded-[14px] transition-[border-radius,background-color,transform] duration-200 active:scale-[0.97] border-none"
                      >
                        <IoCloudDoneSharp className="w-4 h-4" />
                        <span>Open Kosha</span>
                      </a>
                    </div>
                  ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
