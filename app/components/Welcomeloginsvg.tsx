"use client";

import React from "react";

type VaultUnlockedProps = {
  title?: string;
  subtitle?: string;
  className?: string;
};

export default function VaultUnlocked({ className = "" }: VaultUnlockedProps) {
  return (
    <div
      className={`vault-unlocked w-full max-w-4xl mx-auto flex flex-col items-center ${className}`}
    >
      <style>{`
        /* ================= Google Material 3 Palette ================= */
        .vault-unlocked {
          --v-text: #1C1B1F;
          --v-muted: #49454F;
          --v-primary: #1A73E8; /* Google Blue */
          --v-primary-soft: #D3E3FD;
          --v-secondary: #188038; /* Google Green */
          --v-secondary-soft: #CEEAD6;
          --v-tertiary: #E37400; /* Google Yellow/Orange */
          --v-tertiary-soft: #FCE8E6;
          --v-surface: #F8F9FA;
          --v-outline: #79747E;
          --v-shadow: rgba(0, 0, 0, 0.15);
          --v-bg-blur: rgba(26, 115, 232, 0.1);
        }

        /* Dark Theme (Triggered by .dark class on html or body) */
        .dark .vault-unlocked,
        :root.dark .vault-unlocked {
          --v-text: #E3E3E3;
          --v-muted: #C4C7C5;
          --v-primary: #A8C7FA;
          --v-primary-soft: #0842A0;
          --v-secondary: #82D9B7;
          --v-secondary-soft: #0A3818;
          --v-tertiary: #FFB77C;
          --v-tertiary-soft: #5C2E00;
          --v-surface: #1C1B1F;
          --v-outline: #938F99;
          --v-shadow: rgba(0, 0, 0, 0.5);
          --v-bg-blur: rgba(168, 199, 250, 0.1);
        }

        /* ================= Material 3 Expressive Animations ================= */
        .vault-unlocked .v-float {
          animation: v-float 5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          transform-box: fill-box;
          transform-origin: center;
        }

        .vault-unlocked .v-float-delay {
          animation: v-float 5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          animation-delay: -2.5s;
          transform-box: fill-box;
          transform-origin: center;
        }

        .vault-unlocked .v-ring {
          transform-box: fill-box;
          transform-origin: center;
          animation: v-ring 6s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }

        .vault-unlocked .v-lock {
          animation: v-unlock 1.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
          transform-box: fill-box;
          transform-origin: center bottom;
        }

        .vault-unlocked .v-sparkle {
          animation: v-sparkle 3s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          transform-box: fill-box;
          transform-origin: center;
        }

        .vault-unlocked .v-sparkle-delay {
          animation: v-sparkle 3.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          animation-delay: -1.5s;
          transform-box: fill-box;
          transform-origin: center;
        }
        
        .vault-unlocked .v-pulse {
          animation: v-pulse 3s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          transform-box: fill-box;
          transform-origin: center;
        }

        @keyframes v-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }

        @keyframes v-ring {
          0%, 100% { opacity: 0.3; transform: scale(0.98); }
          50% { opacity: 0.8; transform: scale(1.02); }
        }

        @keyframes v-unlock {
          0% { transform: rotate(-35deg) translateY(12px); }
          60% { transform: rotate(12deg) translateY(-4px); }
          80% { transform: rotate(-4deg) translateY(0); }
          100% { transform: rotate(0) translateY(0); }
        }

        @keyframes v-sparkle {
          0%, 100% { opacity: 0.3; transform: scale(0.6) rotate(0deg); }
          50% { opacity: 1; transform: scale(1.2) rotate(25deg); }
        }

        @keyframes v-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.85; }
        }

        @media (prefers-reduced-motion: reduce) {
          .vault-unlocked *, .vault-unlocked *::before {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>

      <svg
        viewBox="0 0 720 440"
        width="100%"
        height="auto"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-labelledby="vault-title vault-description"
        style={{ filter: "drop-shadow(0 10px 20px var(--v-shadow))" }}
      >
        <desc id="vault-description">
          An open vault surrounded by protected passwords, secure notes, and
          payment cards.
        </desc>

        <defs>
          {/* Material 3 Vault Gradient */}
          <linearGradient id="vault-main" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--v-primary)" />
            <stop offset="100%" stopColor="var(--v-primary-soft)" />
          </linearGradient>

          <linearGradient id="vault-door" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--v-surface)" />
            <stop offset="100%" stopColor="var(--v-primary-soft)" />
          </linearGradient>

          {/* Soft Ambient Shadow Filter */}
          <filter
            id="vault-shadow-filter"
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
          >
            <feDropShadow
              dx="0"
              dy="8"
              stdDeviation="12"
              floodColor="var(--v-shadow)"
            />
          </filter>
        </defs>

        {/* Decorative orbital rings */}
        <ellipse
          cx="360"
          cy="210"
          rx="230"
          ry="175"
          stroke="var(--v-primary)"
          strokeWidth="1.5"
          strokeDasharray="4 12"
          opacity="0.3"
        />

        <ellipse
          cx="360"
          cy="210"
          rx="180"
          ry="140"
          stroke="var(--v-secondary)"
          strokeWidth="1.5"
          opacity="0.25"
          className="v-ring"
        />

        {/* Soft ambient floor shadow */}
        <ellipse
          cx="360"
          cy="365"
          rx="140"
          ry="16"
          fill="var(--v-primary)"
          opacity="0.15"
          filter="url(#vault-shadow-filter)"
        />

        {/* ================= FLOATING ELEMENTS ================= */}

        {/* 1. Password Card (Top Left) */}
        <g className="v-float" filter="url(#vault-shadow-filter)">
          <rect
            x="70"
            y="95"
            width="176"
            height="96"
            rx="32"
            fill="var(--v-primary-soft)"
          />
          <circle cx="102" cy="128" r="14" fill="var(--v-primary)" />

          {/* Lock icon */}
          <path
            d="M98 128a4 4 0 1 1 8 0v4h-8z M96 132h12v10h-12z"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinejoin="round"
          />

          {/* Text placeholders */}
          <rect
            x="126"
            y="122"
            width="90"
            height="8"
            rx="4"
            fill="var(--v-primary)"
            opacity="0.8"
          />
          <rect
            x="126"
            y="140"
            width="60"
            height="6"
            rx="3"
            fill="var(--v-primary)"
            opacity="0.5"
          />

          {/* Checkmark badge */}
          <circle cx="220" cy="170" r="12" fill="var(--v-secondary)" />
          <path
            d="M214 170l4 4 6-7"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>

        {/* 2. Secure Note (Top Right) */}
        <g className="v-float-delay" filter="url(#vault-shadow-filter)">
          <rect
            x="480"
            y="85"
            width="160"
            height="110"
            rx="32"
            fill="var(--v-secondary-soft)"
          />

          {/* Note Icon */}
          <rect
            x="506"
            y="108"
            width="28"
            height="28"
            rx="12"
            fill="var(--v-secondary)"
          />
          <path
            d="M514 118h12 M514 126h8"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Text placeholders */}
          <rect
            x="544"
            y="112"
            width="70"
            height="6"
            rx="3"
            fill="var(--v-secondary)"
            opacity="0.8"
          />
          <rect
            x="506"
            y="152"
            width="110"
            height="6"
            rx="3"
            fill="var(--v-secondary)"
            opacity="0.4"
          />
          <rect
            x="506"
            y="166"
            width="80"
            height="6"
            rx="3"
            fill="var(--v-secondary)"
            opacity="0.4"
          />
        </g>

        {/* 3. Recovery Key (Bottom Left) */}
        <g className="v-float" filter="url(#vault-shadow-filter)">
          <circle cx="120" cy="280" r="40" fill="var(--v-tertiary-soft)" />

          <circle
            cx="112"
            cy="272"
            r="10"
            stroke="var(--v-tertiary)"
            strokeWidth="5"
            fill="none"
          />
          <path
            d="M120 280l16 16m-8-8 6-6m-1 13 6-6"
            stroke="var(--v-tertiary)"
            strokeWidth="5"
            strokeLinecap="round"
          />
        </g>

        {/* 4. Payment Card (Bottom Right) */}
        <g className="v-float-delay" filter="url(#vault-shadow-filter)">
          <rect
            x="530"
            y="255"
            width="120"
            height="80"
            rx="24"
            fill="var(--v-primary-soft)"
          />

          <rect
            x="548"
            y="273"
            width="84"
            height="8"
            rx="4"
            fill="var(--v-primary)"
            opacity="0.9"
          />
          <rect
            x="548"
            y="295"
            width="40"
            height="6"
            rx="3"
            fill="var(--v-primary)"
            opacity="0.5"
          />
          <rect
            x="548"
            y="311"
            width="64"
            height="6"
            rx="3"
            fill="var(--v-primary)"
            opacity="0.5"
          />
        </g>

        {/* ================= CENTRAL VAULT ================= */}

        {/* Vault Platform Base */}
        <ellipse
          cx="360"
          cy="355"
          rx="120"
          ry="16"
          fill="var(--v-primary-soft)"
        />

        {/* Main Vault Body */}
        <rect
          x="255"
          y="130"
          width="210"
          height="220"
          rx="55"
          fill="url(#vault-main)"
        />

        {/* Vault Inner Rim */}
        <rect
          x="268"
          y="143"
          width="184"
          height="194"
          rx="45"
          stroke="white"
          strokeOpacity="0.3"
          strokeWidth="2"
          fill="none"
        />

        {/* Vault Door */}
        <rect
          x="285"
          y="160"
          width="150"
          height="160"
          rx="40"
          fill="url(#vault-door)"
        />

        {/* Door Inner Detail */}
        <rect
          x="296"
          y="171"
          width="128"
          height="138"
          rx="30"
          stroke="var(--v-outline)"
          strokeOpacity="0.3"
          strokeWidth="2.5"
          fill="none"
        />

        {/* Circular Mechanism */}
        <circle
          cx="360"
          cy="240"
          r="48"
          fill="none"
          stroke="var(--v-primary)"
          strokeWidth="6"
        />
        <circle
          cx="360"
          cy="240"
          r="36"
          fill="none"
          stroke="var(--v-primary)"
          strokeWidth="2.5"
          strokeDasharray="4 6"
        />

        {/* Handle Bars */}
        <g stroke="var(--v-primary)" strokeWidth="6" strokeLinecap="round">
          <path d="M360 202v76" />
          <path d="M322 240h76" />
          <path d="M333 213l54 54" />
          <path d="M387 213l-54 54" />
        </g>

        {/* Center Hub */}
        <circle cx="360" cy="240" r="12" fill="var(--v-primary)" />
        <circle cx="360" cy="240" r="5" fill="var(--v-surface)" />

        {/* ================= LOCK & BADGE ================= */}

        {/* Open Lock Shackle */}
        <g className="v-lock">
          <path
            d="M338 115v-16c0-14 10-24 22-24s22 10 22 24v14"
            stroke="var(--v-secondary)"
            strokeWidth="10"
            strokeLinecap="round"
            fill="none"
          />
        </g>

        {/* Lock Body */}
        <rect
          x="322"
          y="112"
          width="76"
          height="56"
          rx="20"
          fill="var(--v-secondary)"
        />

        {/* Lock Keyhole */}
        <circle cx="360" cy="135" r="6" fill="white" />
        <path
          d="M360 139v10"
          stroke="white"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* Success Badge (Pulse) */}
        <g className="v-pulse" filter="url(#vault-shadow-filter)">
          <circle cx="455" cy="152" r="22" fill="var(--v-secondary)" />
          <path
            d="M445 152l7 7 13-14"
            stroke="white"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>

        {/* ================= SPARKLES ================= */}

        <g className="v-sparkle" fill="var(--v-tertiary)">
          <path d="M250 70l6 16 16 6-16 6-6 16-6-16-16-6 16-6z" />
        </g>

        <g className="v-sparkle-delay" fill="var(--v-primary)">
          <path d="M475 55l5 13 13 5-13 5-5 13-5-13-13-5 13-5z" />
        </g>

        <g className="v-sparkle" fill="var(--v-secondary)">
          <path d="M660 220l4 10 10 4-10 4-4 10-4-10-10-4 10-4z" />
        </g>

        {/* ================= BOTTOM STATUS PILL ================= */}
        <g filter="url(#vault-shadow-filter)">
          <rect
            x="248"
            y="380"
            width="224"
            height="42"
            rx="21"
            fill="var(--v-secondary-soft)"
          />

          <circle
            cx="270"
            cy="401"
            r="6"
            fill="var(--v-secondary)"
            className="v-pulse"
          />

          <text
            x="285"
            y="406"
            fill="var(--v-secondary)"
            fontSize="13"
            fontWeight="800"
            fontFamily="system-ui, -apple-system, sans-serif"
            letterSpacing="0.5"
          >
            VAULT UNLOCKED
          </text>
        </g>
      </svg>

      {/* Accessible HTML Text (Better SEO and rendering than SVG text) */}
    </div>
  );
}
