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

  /* ── Material Design 3 (Pixel) List Item Classes ── */
  // Hover/Active states simulate M3 state layers (8-12% opacity on top of surface)
  const menuItemClass =
    "group w-full flex items-center cursor-pointer gap-4 py-4 px-4 text-[15px] tracking-[0.01em] font-medium text-[#E6E1E5] hover:bg-white/[0.08] active:bg-white/[0.12] transition-colors duration-200 outline-none focus-visible:bg-white/[0.12]";

  const dangerMenuItemClass =
    "group w-full flex items-center cursor-pointer gap-4 py-4 px-4 text-[15px] tracking-[0.01em] font-medium text-[#F2B8B5] hover:bg-[#F2B8B5]/[0.08] active:bg-[#F2B8B5]/[0.12] transition-colors duration-200 outline-none focus-visible:bg-[#F2B8B5]/[0.12]";

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
    user.fullName || user.firstName || user.username || "Google User";
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

  /* ── Avatar ── */
  const renderAvatar = (size: number, showStatus = false) => {
    const dotSize = Math.max(12, Math.round(size * 0.3));
    return (
      <div className="relative shrink-0">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={displayName}
            width={size}
            height={size}
            unoptimized
            className="object-cover rounded-full bg-[#36343B]"
            style={{ width: size, height: size }}
            referrerPolicy="no-referrer"
          />
        ) : (
          <span
            className="bg-[#4F378B] text-[#EADDFF] font-medium flex items-center justify-center rounded-full"
            style={{
              width: size,
              height: size,
              fontSize: size < 32 ? 13 : 18,
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
            <span
              className="relative inline-flex rounded-full bg-[#A8C7FA] ring-[3px] ring-[#211F26]"
              style={{ width: dotSize, height: dotSize }}
            />
          </span>
        )}
      </div>
    );
  };

  /* ─────────────────────────────────────────────
     MOBILE — Material 3 Expanding Card (Surface Container)
     ───────────────────────────────────────────── */
  if (variant === "mobile") {
    return (
      <div
        className="relative w-full rounded-[28px] bg-[#211F26] overflow-hidden text-[#E6E1E5] font-sans antialiased"
        ref={dropdownRef}
      >
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="w-full flex items-center gap-4 p-4 hover:bg-white/[0.08] active:bg-white/[0.12] transition-colors duration-200 cursor-pointer outline-none"
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          {renderAvatar(52, false)}
          <div className="min-w-0 flex-1 text-left flex flex-col justify-center">
            <p className="text-[16px] font-normal tracking-[0.03em] truncate">
              {displayName}
            </p>
            {email && (
              <p className="text-[14px] text-[#CAC4D0] tracking-[0.01em] truncate mt-0.5">
                {email}
              </p>
            )}
          </div>
          <div className="w-12 h-12 flex items-center justify-center shrink-0 rounded-full">
            <FiChevronDown
              className={`w-6 h-6 text-[#CAC4D0] transition-transform duration-300 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </div>
        </button>

        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          {/* M3 Outline Variant Divider */}
          <div className="mx-4 h-[1px] bg-[#49454F]" />
          <div className="flex flex-col py-2">
            <button onClick={handleManage} className={menuItemClass}>
              <FiSettings className="w-[22px] h-[22px] shrink-0 text-[#CAC4D0] group-hover:text-[#E6E1E5] transition-colors" />
              <span>Google Account settings</span>
            </button>

            <button onClick={handleSignOut} className={dangerMenuItemClass}>
              <FiLogOut className="w-[22px] h-[22px] shrink-0" />
              <span>Sign out of this device</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ─────────────────────────────────────────────
     DESKTOP — Material 3 Popup (Surface Container High)
     ───────────────────────────────────────────── */
  return (
    <div className="relative font-sans antialiased" ref={dropdownRef}>
      {/* M3 Pill Trigger */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex items-center gap-2 pl-2 pr-3 py-2 rounded-full transition-colors duration-200 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#A8C7FA] focus-visible:ring-offset-2 focus-visible:ring-offset-[#141218] ${
          isOpen
            ? "bg-[#36343B]" // Surface Container Highest
            : "bg-[#211F26] hover:bg-[#2B2930] active:bg-[#36343B]" // Surface Container
        }`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {renderAvatar(32, false)}
        <FiChevronDown
          className={`w-4 h-4 text-[#CAC4D0] transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown panel */}
      <div
        className={`absolute right-0 top-[calc(100%+12px)] w-[340px] origin-top-right transition-all duration-200 ease-out z-50 ${
          isOpen
            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
            : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
        }`}
      >
        <div className="relative rounded-[28px] bg-[#2B2930] shadow-[0_4px_16px_rgba(0,0,0,0.3)] flex flex-col py-3 overflow-hidden">
          {/* User Info Header */}
          <div className="relative flex items-center gap-4 px-5 pb-4 pt-2">
            {renderAvatar(56, false)}
            <div className="min-w-0 flex-1 flex flex-col justify-center">
              <p className="text-[16px] font-normal text-[#E6E1E5] tracking-[0.03em] truncate">
                {displayName}
              </p>
              {email && (
                <p className="text-[14px] text-[#CAC4D0] tracking-[0.01em] truncate mt-0.5">
                  {email}
                </p>
              )}
              {/* Material Primary Badge */}
              <div className="inline-flex items-center gap-1.5 mt-3 pl-2 pr-2.5 py-1 rounded-lg bg-[#0842A0] self-start">
                <span className="text-[12px] font-medium text-[#D3E3FD] tracking-wide">
                  Active
                </span>
              </div>
            </div>
          </div>

          <div className="h-[1px] bg-[#49454F] my-2" />

          {/* Action Buttons */}
          <div className="flex flex-col">
            <button onClick={handleManage} className={menuItemClass}>
              <FiSettings className="w-[22px] h-[22px] shrink-0 text-[#CAC4D0] group-hover:text-[#E6E1E5] transition-colors" />
              <span className="flex-1 text-left">Google Account settings</span>
            </button>

            <button onClick={handleSignOut} className={dangerMenuItemClass}>
              <FiLogOut className="w-[22px] h-[22px] shrink-0" />
              <span className="flex-1 text-left">Sign out of this device</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
