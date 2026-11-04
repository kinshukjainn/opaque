"use client";

import React from "react";

export default function TakeBackPrivacySvg() {
  return (
    <div className="w-full flex justify-center items-center py-6 select-none">
      <style>{`
        /* 6-second loop:
           0% - 25%: Tracker peeks over, passwords visible
           30% - 80%: Toggle snaps ON, privacy curtain drops, tracker gets dizzy
           90% - 100%: Reset smoothly for loop
        */
        @keyframes m3-toggle-knob {
          0%, 22% { transform: translateX(0px); }
          30%, 82% { transform: translateX(26px); }
          92%, 100% { transform: translateX(0px); }
        }
        @keyframes m3-curtain-drop {
          0%, 24% { transform: scaleY(0); opacity: 0; }
          32%, 82% { transform: scaleY(1); opacity: 1; }
          92%, 100% { transform: scaleY(0); opacity: 0; }
        }
        @keyframes m3-snooper-bonk {
          0%, 22% { transform: translateY(10px) rotate(0deg); }
          26% { transform: translateY(16px) rotate(-4deg); }
          32%, 82% { transform: translateY(-10px) rotate(6deg); }
          92%, 100% { transform: translateY(10px) rotate(0deg); }
        }
        @keyframes m3-pupil-look {
          0%, 10% { transform: translate(0px, 0px); }
          15%, 24% { transform: translate(3px, 5px); }
          30%, 82% { transform: translate(0px, -3px); opacity: 0; }
          90%, 100% { transform: translate(0px, 0px); opacity: 1; }
        }
        @keyframes m3-dizzy-eyes {
          0%, 28% { opacity: 0; transform: scale(0.5); }
          34%, 80% { opacity: 1; transform: scale(1); }
          88%, 100% { opacity: 0; transform: scale(0.5); }
        }
        @keyframes m3-badge-pop {
          0%, 28% { transform: scale(0) rotate(-25deg); opacity: 0; }
          36%, 80% { transform: scale(1) rotate(0deg); opacity: 1; }
          88%, 100% { transform: scale(0) rotate(25deg); opacity: 0; }
        }
        @keyframes m3-card-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }

        .anim-knob {
          animation: m3-toggle-knob 6s cubic-bezier(0.34, 1.56, 0.64, 1) infinite;
          transform-box: fill-box;
          transform-origin: center;
        }
        .anim-curtain {
          animation: m3-curtain-drop 6s cubic-bezier(0.22, 1, 0.36, 1) infinite;
          transform-box: fill-box;
          transform-origin: top center;
        }
        .anim-snooper {
          animation: m3-snooper-bonk 6s cubic-bezier(0.34, 1.56, 0.64, 1) infinite;
          transform-box: fill-box;
          transform-origin: bottom center;
        }
        .anim-pupil {
          animation: m3-pupil-look 6s ease-in-out infinite;
          transform-box: fill-box;
          transform-origin: center;
        }
        .anim-dizzy {
          animation: m3-dizzy-eyes 6s cubic-bezier(0.34, 1.56, 0.64, 1) infinite;
          transform-box: fill-box;
          transform-origin: center;
        }
        .anim-badge {
          animation: m3-badge-pop 6s cubic-bezier(0.34, 1.56, 0.64, 1) infinite;
          transform-box: fill-box;
          transform-origin: center;
        }
        .anim-float {
          animation: m3-card-float 4.5s ease-in-out infinite;
          transform-box: fill-box;
          transform-origin: center;
        }

        @media (prefers-reduced-motion: reduce) {
          .anim-knob, .anim-curtain, .anim-snooper, .anim-pupil, .anim-dizzy, .anim-badge, .anim-float {
            animation: none !important;
          }
        }
      `}</style>

      <svg
        viewBox="0 0 420 290"
        className="w-full max-w-md h-auto"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Playful animation showing a privacy toggle blocking a snooping tracker in under a minute."
        style={{
          fontFamily:
            "'Google Sans', 'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif",
        }}
      >
        {/* ==================== AMBIENT M3 BACKGROUND SHAPES ==================== */}
        <circle
          cx="72"
          cy="195"
          r="48"
          className="fill-[#E9E4FF] dark:fill-[#221D3A] transition-colors duration-300"
        />
        <rect
          x="295"
          y="38"
          width="76"
          height="76"
          rx="28"
          transform="rotate(12 295 38)"
          className="fill-[#D4F8E2] dark:fill-[#122C1F] transition-colors duration-300"
        />

        {/* ==================== 1. THE NOSY SNOOPER BLOB (PEEKING FROM BEHIND) ==================== */}
        <g className="anim-snooper">
          {/* Soft M3 Coral/Terracotta Blob Body */}
          <path
            d="M162 78C162 51.4903 183.49 30 210 30C236.51 30 258 51.4903 258 78V108H162V78Z"
            className="fill-[#FFDAD6] dark:fill-[#5C1F1B] transition-colors duration-300"
          />

          {/* Little Binocular / Goggle Rim */}
          <rect
            x="175"
            y="52"
            width="70"
            height="32"
            rx="16"
            className="fill-[#FF897D] dark:fill-[#8C2D27] transition-colors duration-300"
          />

          {/* Left & Right Sclera (Whites of Eyes) */}
          <circle cx="194" cy="68" r="11" className="fill-[#FFFFFF]" />
          <circle cx="226" cy="68" r="11" className="fill-[#FFFFFF]" />

          {/* Curious Pupils (Looking down at your data) */}
          <g className="anim-pupil">
            <circle cx="194" cy="68" r="5" className="fill-[#410E0B]" />
            <circle cx="226" cy="68" r="5" className="fill-[#410E0B]" />
          </g>

          {/* Dizzy "> <" Eyes (Appear when privacy shade slams shut!) */}
          <g className="anim-dizzy">
            <path
              d="M190 64L197 68L190 72"
              className="stroke-[#410E0B]"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M230 64L223 68L230 72"
              className="stroke-[#410E0B]"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Funny "Nope!" Speech Pill */}
            <rect
              x="252"
              y="22"
              width="66"
              height="26"
              rx="13"
              className="fill-[#FFDAD6] dark:fill-[#5C1F1B]"
            />
            <text
              x="285"
              y="39"
              textAnchor="middle"
              className="fill-[#410E0B] dark:fill-[#FFDAD6]"
              fontSize="11"
              fontWeight="700"
            >
              Bonk! 😵‍💫
            </text>
          </g>
        </g>

        {/* ==================== 2. MAIN CREDENTIAL VAULT CARD ==================== */}
        <g className="anim-float">
          {/* Borderless Tonal Surface Container */}
          <rect
            x="76"
            y="86"
            width="268"
            height="174"
            rx="44"
            className="fill-[#D8EFFE] dark:fill-[#152A38] transition-colors duration-300"
          />

          {/* Top Bar: "Private Mode" + M3 Switch */}
          <rect
            x="96"
            y="104"
            width="228"
            height="50"
            rx="25"
            className="fill-[#B7E1FF] dark:fill-[#1E3B4F] transition-colors duration-300"
          />

          {/* Small Key Icon Circle */}
          <circle
            cx="122"
            cy="129"
            r="15"
            className="fill-[#00A8FF] dark:fill-[#5CC4FF]"
          />
          <circle
            cx="120"
            cy="129"
            r="4"
            className="stroke-[#00263D] dark:stroke-[#062130]"
            strokeWidth="2.5"
          />
          <path
            d="M124 129H130M128 129V132"
            className="stroke-[#00263D] dark:stroke-[#062130]"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          <text
            x="146"
            y="134"
            className="fill-[#062942] dark:fill-[#D8EFFE]"
            fontSize="14"
            fontWeight="700"
          >
            Private Vault
          </text>

          {/* M3 Switch Track */}
          <rect
            x="252"
            y="113"
            width="58"
            height="32"
            rx="16"
            className="fill-[#062942] dark:fill-[#0B1B26]"
          />
          {/* M3 Switch Thumb (Animated) */}
          <g className="anim-knob">
            <circle
              cx="268"
              cy="129"
              r="11"
              className="fill-[#5BE39B] dark:fill-[#5BE39B]"
            />
            <path
              d="M264.5 129.5L267 132L272 127"
              className="stroke-[#062942]"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>

          {/* Exposed Credential Rows (Before Curtain Drops) */}
          <g>
            {/* Row 1 */}
            <rect
              x="98"
              y="168"
              width="224"
              height="34"
              rx="17"
              className="fill-[#FFFFFF]/85 dark:fill-[#0E1E29]"
            />
            <circle
              cx="116"
              cy="185"
              r="8"
              className="fill-[#6B4EFF] dark:fill-[#B7A6FF]"
            />
            {/* Masked Dots */}
            <circle
              cx="138"
              cy="185"
              r="3.5"
              className="fill-[#2E5B7B] dark:fill-[#89B8D8]"
            />
            <circle
              cx="150"
              cy="185"
              r="3.5"
              className="fill-[#2E5B7B] dark:fill-[#89B8D8]"
            />
            <circle
              cx="162"
              cy="185"
              r="3.5"
              className="fill-[#2E5B7B] dark:fill-[#89B8D8]"
            />
            <circle
              cx="174"
              cy="185"
              r="3.5"
              className="fill-[#2E5B7B] dark:fill-[#89B8D8]"
            />
            <rect
              x="266"
              y="177"
              width="44"
              height="16"
              rx="8"
              className="fill-[#D4F8E2] dark:fill-[#173E2B]"
            />

            {/* Row 2 */}
            <rect
              x="98"
              y="210"
              width="224"
              height="34"
              rx="17"
              className="fill-[#FFFFFF]/85 dark:fill-[#0E1E29]"
            />
            <circle
              cx="116"
              cy="227"
              r="8"
              className="fill-[#00A8FF] dark:fill-[#5CC4FF]"
            />
            <circle
              cx="138"
              cy="227"
              r="3.5"
              className="fill-[#2E5B7B] dark:fill-[#89B8D8]"
            />
            <circle
              cx="150"
              cy="227"
              r="3.5"
              className="fill-[#2E5B7B] dark:fill-[#89B8D8]"
            />
            <circle
              cx="162"
              cy="227"
              r="3.5"
              className="fill-[#2E5B7B] dark:fill-[#89B8D8]"
            />
            <circle
              cx="174"
              cy="227"
              r="3.5"
              className="fill-[#2E5B7B] dark:fill-[#89B8D8]"
            />
            <rect
              x="266"
              y="219"
              width="44"
              height="16"
              rx="8"
              className="fill-[#E9E4FF] dark:fill-[#342B5C]"
            />
          </g>

          {/* ==================== 3. SLAMMING PRIVACY SHADE (DROPS OVER PASSWORDS) ==================== */}
          <g className="anim-curtain">
            <rect
              x="94"
              y="164"
              width="232"
              height="84"
              rx="26"
              className="fill-[#6B4EFF] dark:fill-[#B7A6FF]"
            />
            {/* Cool Sunglasses / Incognito Eyes on the Privacy Shade */}
            <rect
              x="168"
              y="185"
              width="38"
              height="22"
              rx="11"
              className="fill-[#1D1340]"
            />
            <rect
              x="214"
              y="185"
              width="38"
              height="22"
              rx="11"
              className="fill-[#1D1340]"
            />
            <path
              d="M204 194H216"
              className="stroke-[#1D1340]"
              strokeWidth="4"
              strokeLinecap="round"
            />
            {/* Lens Glint */}
            <path
              d="M176 191L182 197M222 191L228 197"
              className="stroke-[#FFFFFF]"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <text
              x="210"
              y="231"
              textAnchor="middle"
              className="fill-[#FFFFFF] dark:fill-[#1D1340]"
              fontSize="12"
              fontWeight="700"
              letterSpacing="0.4"
            >
              100% Mind Your Own Business
            </text>
          </g>
        </g>

        {/* ==================== 4. "< 1 MIN" M3 SCALLOP SPEED BADGE ==================== */}
        <g className="anim-badge">
          {/* Soft M3 Mint Pill Badge Floating Bottom-Right */}
          <rect
            x="278"
            y="224"
            width="118"
            height="44"
            rx="22"
            className="fill-[#12A15A] dark:fill-[#5BE39B]"
          />
          {/* Lightning Bolt Icon */}
          <circle
            cx="300"
            cy="246"
            r="13"
            className="fill-[#D4F8E2] dark:fill-[#08301B]"
          />
          <path
            d="M301 239L295 247H300L299 253L305 245H300L301 239Z"
            className="fill-[#12A15A] dark:fill-[#5BE39B]"
          />
          <text
            x="348"
            y="251"
            textAnchor="middle"
            className="fill-[#FFFFFF] dark:fill-[#08301B]"
            fontSize="13"
            fontWeight="800"
          >
            &lt; 1 min
          </text>
        </g>
      </svg>
    </div>
  );
}
