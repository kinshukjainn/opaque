"use client";

import { useState, useRef, useEffect } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { FiLogOut, FiSettings, FiChevronDown } from "react-icons/fi";
import Image from "next/image";

interface UserProfileDropdownProps {
  variant?: "desktop" | "mobile";
  onAction?: () => void;
}

export default function UserProfileDropdown({
  variant = "desktop",
  onAction,
}: UserProfileDropdownProps) {
  const { user } = useUser();
  const { signOut, openUserProfile } = useClerk();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  /* ── Pill-shaped menu items, dark glass theme ── */
  const menuItemClass =
    "group/item w-full flex items-center cursor-pointer gap-3 py-2.5 px-3.5 text-[13px] font-medium text-gray-300 hover:text-white hover:bg-white/[0.06] transition-all duration-200 rounded-full outline-none focus-visible:ring-1 focus-visible:ring-white/20";

  const dangerMenuItemClass =
    "group/item w-full flex items-center cursor-pointer gap-3 py-2.5 px-3.5 text-[13px] font-medium text-rose-300/90 hover:text-rose-200 hover:bg-rose-500/10 transition-all duration-200 rounded-full outline-none focus-visible:ring-1 focus-visible:ring-rose-400/30";

  /* ── Outside click (desktop) ── */
  useEffect(() => {
    if (variant !== "desktop") return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [variant]);

  /* ── Esc to close ── */
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, []);

  if (!user) return null;

  const displayName =
    user.fullName || user.firstName || user.username || "User";
  const email = user.primaryEmailAddress?.emailAddress || "";
  const avatarUrl = user.imageUrl;

  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleManage = () => {
    setIsOpen(false);
    onAction?.();
    openUserProfile();
  };

  const handleSignOut = () => {
    setIsOpen(false);
    onAction?.();
    signOut();
  };

  /* ── Avatar with optional live status dot ── */
  const renderAvatar = (size: number, showStatus = false) => {
    const dotSize = Math.max(8, Math.round(size * 0.26));
    return (
      <div className="relative shrink-0">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={displayName}
            width={size}
            height={size}
            unoptimized
            className="object-cover rounded-full ring-1 ring-white/10 bg-white/5"
            style={{ width: size, height: size }}
            referrerPolicy="no-referrer"
          />
        ) : (
          <span
            className="bg-gradient-to-br from-white/20 to-white/[0.04] ring-1 ring-white/10 text-white font-semibold flex items-center justify-center rounded-full backdrop-blur"
            style={{
              width: size,
              height: size,
              fontSize: size < 32 ? 11 : 14,
            }}
          >
            {initials}
          </span>
        )}
        {showStatus && (
          <span
            className="absolute bottom-0 right-0 flex items-center justify-center"
            style={{ width: dotSize, height: dotSize }}
          >
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 animate-ping" />
            <span
              className="relative inline-flex rounded-full bg-emerald-400 ring-2 ring-[#0f0f10]"
              style={{ width: dotSize, height: dotSize }}
            />
          </span>
        )}
      </div>
    );
  };

  /* ─────────────────────────────────────────────
     MOBILE — Inline expandable glass card
     ───────────────────────────────────────────── */
  if (variant === "mobile") {
    return (
      <div
        className="relative w-full rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl backdrop-saturate-150 overflow-hidden shadow-[0_8px_24px_-12px_rgba(0,0,0,0.6)]"
        ref={dropdownRef}
      >
        {/* Glass top hairline matching header */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="w-full flex items-center gap-3 p-3 hover:bg-white/[0.04] transition-colors duration-200 cursor-pointer outline-none"
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          {renderAvatar(40, true)}
          <div className="min-w-0 flex-1 text-left">
            <p className="text-[14px] font-semibold text-gray-100 truncate">
              {displayName}
            </p>
            {email && (
              <p className="text-[12px] text-gray-400 truncate mt-0.5">
                {email}
              </p>
            )}
          </div>
          <div
            className={`w-9 h-9 flex items-center justify-center shrink-0 rounded-full border transition-all duration-200 ${
              isOpen
                ? "bg-white/[0.08] border-white/15"
                : "bg-white/[0.03] border-white/10"
            }`}
          >
            <FiChevronDown
              className={`w-4 h-4 text-gray-300 transition-transform duration-300 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </div>
        </button>

        <div
          className={`overflow-hidden transition-all duration-300 ease-out ${
            isOpen ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="mx-3 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <div className="flex flex-col gap-1 p-2">
            <button onClick={handleManage} className={menuItemClass}>
              <FiSettings className="w-4 h-4 shrink-0 text-gray-400 group-hover/item:text-white group-hover/item:rotate-45 transition-all duration-300" />
              <span>Manage Account</span>
            </button>

            <button onClick={handleSignOut} className={dangerMenuItemClass}>
              <FiLogOut className="w-4 h-4 shrink-0 group-hover/item:translate-x-0.5 transition-transform duration-200" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ─────────────────────────────────────────────
     DESKTOP — Floating glass dropdown
     ───────────────────────────────────────────── */
  return (
    <div className="relative" ref={dropdownRef}>
      {/* Pill-shaped trigger */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full border transition-all duration-200 cursor-pointer outline-none ${
          isOpen
            ? "border-white/20 bg-white/[0.08]"
            : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/15"
        }`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {renderAvatar(26, true)}
        <FiChevronDown
          className={`w-3.5 h-3.5 text-gray-300 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown panel */}
      <div
        className={`absolute right-0 top-[calc(100%+10px)] w-[300px] origin-top-right transition-all duration-200 ease-out ${
          isOpen
            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
            : "opacity-0 scale-95 -translate-y-1 pointer-events-none"
        }`}
      >
        <div className="relative rounded-3xl  bg-zinc-900">
          {/* Glass top hairline matching header */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          {/* Decorative radial glows for depth */}
          <div className="pointer-events-none absolute -top-24 -right-16 w-48 h-48 rounded-full  bg-white/[0.05] blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-16 w-48 h-48 rounded-full bg-emerald-400/[0.04] blur-3xl" />

          {/* User Info Header */}
          <div className="relative flex items-start gap-3 p-4">
            {renderAvatar(44, true)}
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-semibold text-gray-100 truncate">
                {displayName}
              </p>
              {email && (
                <p className="text-[12px] text-[#ff9100] truncate mt-0.5">
                  {email}
                </p>
              )}
              <div className="inline-flex items-center gap-1.5 mt-2 pl-1.5 pr-2 py-0.5 rounded-full bg-blue-800">
                <span className="relative flex w-1.5 h-1.5">
                  <span className="absolute inline-flex w-full h-full rounded-full bg-white opacity-70 animate-ping" />
                  <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-white" />
                </span>
                <span className="text-[10px] font-semibold text-white tracking-[0.08em]">
                  ONLINE
                </span>
              </div>
            </div>
          </div>

          {/* Divider with gradient fade */}
          <div className="mx-4 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          {/* Action Buttons */}
          <div className="relative p-2 flex flex-col gap-0.5">
            <button onClick={handleManage} className={menuItemClass}>
              <FiSettings className="w-4 h-4 shrink-0 text-gray-400 group-hover/item:text-white  transition-all duration-300" />
              <span className="flex-1 text-left">Manage Account</span>
              <span className="text-[10px] text-gray-500 opacity-0 group-hover/item:opacity-100 transition-opacity">
                ↗
              </span>
            </button>

            <button onClick={handleSignOut} className={dangerMenuItemClass}>
              <FiLogOut className="w-4 h-4 shrink-0 group-hover/item:translate-x-0.5 transition-transform duration-200" />
              <span className="flex-1 text-left">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
