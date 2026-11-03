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

  /* ── Borderless M3 Styled Menu Items ── */
  const menuItemClass =
    "w-full flex items-center gap-3 px-4 py-3 text-[14px] font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1A1A1A] hover:text-black dark:hover:text-white transition-[background-color,color] duration-200 text-left rounded-[16px] active:scale-[0.98] border-none outline-none";

  const dangerMenuItemClass =
    "w-full flex items-center gap-3 px-4 py-3 text-[14px] font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-[background-color,color] duration-200 text-left rounded-[16px] active:scale-[0.98] border-none outline-none";

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
    user.fullName || user.firstName || user.username || "Opaque User";
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

  /* ── Borderless Avatar ── */
  const renderAvatar = (size: number) => {
    return (
      <div className="relative shrink-0">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={displayName}
            width={size}
            height={size}
            unoptimized
            className="object-cover rounded-full bg-gray-100 dark:bg-[#1A1A1A]"
            style={{ width: size, height: size }}
            referrerPolicy="no-referrer"
          />
        ) : (
          <span
            className="bg-gray-200 dark:bg-[#2A2A2A] text-black dark:text-white font-bold flex items-center justify-center rounded-full"
            style={{
              width: size,
              height: size,
              fontSize: size < 32 ? 12 : 15,
            }}
          >
            {initials}
          </span>
        )}
      </div>
    );
  };

  /* ─────────────────────────────────────────────
     MOBILE — Integrated seamlessly into the Header
     ───────────────────────────────────────────── */
  if (variant === "mobile") {
    return (
      <div className="w-full" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-[20px] hover:bg-gray-100 dark:hover:bg-[#1A1A1A] transition-colors text-left outline-none border-none"
          aria-expanded={isOpen}
        >
          {renderAvatar(38)}
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-bold text-black dark:text-white truncate">
              {displayName}
            </p>
            {email && (
              <p className="text-[13px] text-gray-500 dark:text-gray-400 truncate">
                {email}
              </p>
            )}
          </div>
          <FiChevronDown
            className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isOpen && (
          <div className="mt-2 bg-gray-50 dark:bg-[#121212] rounded-[24px] p-2 flex flex-col space-y-1 overflow-hidden">
            <button
              onClick={handleManage}
              className={
                menuItemClass + " hover:bg-white dark:hover:bg-[#1A1A1A]"
              }
            >
              <FiSettings className="w-[18px] h-[18px] shrink-0 text-gray-500" />
              <span>Account Settings</span>
            </button>
            <button
              onClick={handleSignOut}
              className={
                dangerMenuItemClass + " hover:bg-white dark:hover:bg-[#1A1A1A]"
              }
            >
              <FiLogOut className="w-[18px] h-[18px] shrink-0" />
              <span>Sign out</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  /* ─────────────────────────────────────────────
     DESKTOP — Clean M3 Borderless Dropdown Panel
     ───────────────────────────────────────────── */
  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1.5 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-[#1A1A1A] transition-colors focus:outline-none border-none group"
        aria-expanded={isOpen}
      >
        {renderAvatar(34)}
        <FiChevronDown
          className={`w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform duration-200 group-hover:text-black dark:group-hover:text-white ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Box */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-[280px] bg-white dark:bg-[#0A0A0A] shadow-xl shadow-black/5 dark:shadow-white/5 rounded-[28px] z-50 overflow-hidden border-none">
          {/* User Info Header (Tonal Surface) */}
          <div className="px-5 py-4 bg-gray-50/50 dark:bg-[#141414]/50">
            <div className="flex items-center gap-3">
              {renderAvatar(42)}
              <div className="flex-1 min-w-0">
                <p className="text-[14.5px] font-bold text-black dark:text-white truncate">
                  {displayName}
                </p>
                {email && (
                  <p className="text-[13px] text-gray-500 dark:text-gray-400 truncate">
                    {email}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Action Links */}
          <div className="p-2 space-y-0.5">
            <button onClick={handleManage} className={menuItemClass}>
              <FiSettings className="w-[18px] h-[18px] shrink-0 text-gray-500" />
              <span>Account Settings</span>
            </button>
            <button onClick={handleSignOut} className={dangerMenuItemClass}>
              <FiLogOut className="w-[18px] h-[18px] shrink-0" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
