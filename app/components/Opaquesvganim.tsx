"use client";

import React from "react";

export default function OpaqueSvgAnim() {
  return (
    <div className="w-full flex justify-center items-center overflow-hidden py-8 select-none">
      <style>{`
        @keyframes m3-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes m3-spin-slow {
          0% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) scale(1.06); }
          100% { transform: rotate(360deg) scale(1); }
        }
        @keyframes m3-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes m3-packet {
          0% { transform: translateX(0px) scale(0.6); opacity: 0; }
          20% { transform: translateX(10px) scale(1); opacity: 1; }
          80% { transform: translateX(46px) scale(1); opacity: 1; }
          100% { transform: translateX(56px) scale(0.6); opacity: 0; }
        }

        .m3-float-1 {
          animation: m3-float 5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          transform-box: fill-box;
          transform-origin: center;
        }
        .m3-float-2 {
          animation: m3-float 5s cubic-bezier(0.4, 0, 0.2, 1) infinite 1.6s;
          transform-box: fill-box;
          transform-origin: center;
        }
        .m3-float-3 {
          animation: m3-float 5s cubic-bezier(0.4, 0, 0.2, 1) infinite 3.2s;
          transform-box: fill-box;
          transform-origin: center;
        }
        .m3-scallop-spin {
          animation: m3-spin-slow 18s linear infinite;
          transform-box: fill-box;
          transform-origin: center;
        }
        .m3-badge-pulse {
          animation: m3-pulse 3.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          transform-box: fill-box;
          transform-origin: center;
        }
        .m3-stream-1 {
          animation: m3-packet 2.2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          transform-box: fill-box;
          transform-origin: center;
        }
        .m3-stream-2 {
          animation: m3-packet 2.2s cubic-bezier(0.4, 0, 0.2, 1) infinite 1.1s;
          transform-box: fill-box;
          transform-origin: center;
        }

        @media (prefers-reduced-motion: reduce) {
          .m3-float-1,
          .m3-float-2,
          .m3-float-3,
          .m3-scallop-spin,
          .m3-badge-pulse,
          .m3-stream-1,
          .m3-stream-2 {
            animation: none !important;
          }
        }
      `}</style>

      <svg
        viewBox="0 0 960 340"
        className="w-full max-w-5xl h-auto"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Opaque security architecture: Your secrets are encrypted on your device before reaching the server."
        style={{
          fontFamily:
            "'Google Sans', 'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif",
        }}
      >
        {/* ==================== 1. YOUR DEVICE (LEFT - M3 BLUE TONAL) ==================== */}
        <g className="m3-float-1">
          {/* Borderless Tonal Surface Container */}
          <rect
            x="24"
            y="24"
            width="256"
            height="292"
            rx="56"
            className="fill-[#D8EFFE] dark:fill-[#122A3A] transition-colors duration-300"
          />

          {/* Inner Tonal Sub-card (Top Graphic Area) */}
          <rect
            x="44"
            y="44"
            width="216"
            height="120"
            rx="40"
            className="fill-[#B7E1FF] dark:fill-[#1A3B52] transition-colors duration-300"
          />

          {/* M3 Squircle Icon Badge */}
          <rect
            x="116"
            y="68"
            width="72"
            height="72"
            rx="26"
            className="fill-[#00A8FF] dark:fill-[#5CC4FF] m3-badge-pulse transition-colors duration-300"
          />

          {/* Crisp Solid Lock Icon */}
          <rect
            x="138"
            y="102"
            width="28"
            height="20"
            rx="6"
            className="fill-[#00263D] dark:fill-[#072130]"
          />
          <path
            d="M143 102V96C143 91.0294 147.029 87 152 87C156.971 87 161 91.0294 161 96V102"
            className="stroke-[#00263D] dark:stroke-[#072130]"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
          <circle
            cx="152"
            cy="112"
            r="2.5"
            className="fill-[#00A8FF] dark:fill-[#5CC4FF]"
          />

          {/* Title & Subtitle */}
          <text
            x="152"
            y="204"
            textAnchor="middle"
            className="fill-[#062942] dark:fill-[#D8EFFE] transition-colors duration-300"
            fontSize="21"
            fontWeight="700"
            letterSpacing="-0.3"
          >
            Your Device
          </text>
          <text
            x="152"
            y="230"
            textAnchor="middle"
            className="fill-[#2E5B7B] dark:fill-[#89B8D8] transition-colors duration-300"
            fontSize="14"
            fontWeight="500"
          >
            Only you can see this
          </text>

          {/* M3 Bottom Status Pill with Check Icon */}
          <rect
            x="64"
            y="254"
            width="176"
            height="42"
            rx="21"
            className="fill-[#FFFFFF]/80 dark:fill-[#0B1C28] transition-colors duration-300"
          />
          <circle
            cx="90"
            cy="275"
            r="11"
            className="fill-[#00A8FF] dark:fill-[#5CC4FF]"
          />
          <path
            d="M85.5 275.5L88.5 278.5L94.5 272.5"
            className="stroke-[#00263D] dark:stroke-[#072130]"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <text
            x="154"
            y="280"
            textAnchor="middle"
            className="fill-[#062942] dark:fill-[#BCE3FF]"
            fontSize="13"
            fontWeight="700"
          >
            Safe &amp; Secure
          </text>
        </g>

        {/* ==================== 2. CONNECTOR 1 (M3 PILL TRACK) ==================== */}
        <g>
          {/* Pill Track Background */}
          <rect
            x="292"
            y="152"
            width="68"
            height="36"
            rx="18"
            className="fill-[#EDEBF6] dark:fill-[#22212C] transition-colors duration-300"
          />
          {/* Animated Pill Packets */}
          <rect
            x="296"
            y="162"
            width="20"
            height="16"
            rx="8"
            className="fill-[#00A8FF] dark:fill-[#5CC4FF] m3-stream-1"
          />
          <circle
            cx="304"
            cy="170"
            r="6"
            className="fill-[#7B61FF] dark:fill-[#B8A7FF] m3-stream-2"
          />
        </g>

        {/* ==================== 3. ENCRYPTION (CENTER - M3 LAVENDER/PURPLE TONAL) ==================== */}
        <g className="m3-float-2">
          {/* Borderless Tonal Surface Container */}
          <rect
            x="372"
            y="24"
            width="216"
            height="292"
            rx="56"
            className="fill-[#E9E4FF] dark:fill-[#251F42] transition-colors duration-300"
          />

          {/* Inner Tonal Sub-card */}
          <rect
            x="392"
            y="44"
            width="176"
            height="120"
            rx="40"
            className="fill-[#D5CCFF] dark:fill-[#342B5C] transition-colors duration-300"
          />

          {/* M3 8-Point Soft Scallop / Cookie Shape (Rotating) */}
          <path
            d="M480 62
               C487 62 492 68 499 69
               C506 71 513 69 518 74
               C523 79 521 86 523 93
               C524 100 530 105 530 112
               C530 119 524 124 523 131
               C521 138 523 145 518 150
               C513 155 506 153 499 155
               C492 156 487 162 480 162
               C473 162 468 156 461 155
               C454 153 447 155 442 150
               C437 145 439 138 437 131
               C436 124 430 119 430 112
               C430 105 436 100 437 93
               C439 86 437 79 442 74
               C447 69 454 71 461 69
               C468 68 473 62 480 62Z"
            transform="translate(0, -8)"
            className="fill-[#6B4EFF] dark:fill-[#B7A6FF] m3-scallop-spin transition-colors duration-300"
          />

          {/* Stationary Shield / Sparkle Icon Inside Scallop */}
          <path
            d="M480 86L496 93V105C496 116.5 489.2 126.2 480 130C470.8 126.2 464 116.5 464 105V93L480 86Z"
            className="fill-[#FFFFFF] dark:fill-[#1D153B]"
          />
          <path
            d="M480 96V116M472 106H488"
            className="stroke-[#6B4EFF] dark:stroke-[#B7A6FF]"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Title & Subtitle */}
          <text
            x="480"
            y="204"
            textAnchor="middle"
            className="fill-[#231651] dark:fill-[#E9E4FF] transition-colors duration-300"
            fontSize="21"
            fontWeight="700"
            letterSpacing="-0.3"
          >
            Encrypted
          </text>
          <text
            x="480"
            y="230"
            textAnchor="middle"
            className="fill-[#564787] dark:fill-[#B0A4E3] transition-colors duration-300"
            fontSize="14"
            fontWeight="500"
          >
            Scrambled on device
          </text>

          {/* M3 Bottom Pill */}
          <rect
            x="396"
            y="254"
            width="168"
            height="42"
            rx="21"
            className="fill-[#FFFFFF]/80 dark:fill-[#17122B] transition-colors duration-300"
          />
          <circle
            cx="422"
            cy="275"
            r="11"
            className="fill-[#6B4EFF] dark:fill-[#B7A6FF]"
          />
          {/* Key/Scramble Icon */}
          <circle
            cx="422"
            cy="275"
            r="3.5"
            className="fill-[#FFFFFF] dark:fill-[#1D153B]"
          />
          <text
            x="488"
            y="280"
            textAnchor="middle"
            className="fill-[#231651] dark:fill-[#D5CCFF]"
            fontSize="13"
            fontWeight="700"
          >
            Unreadable to us
          </text>
        </g>

        {/* ==================== 4. CONNECTOR 2 (M3 PILL TRACK) ==================== */}
        <g>
          {/* Pill Track Background */}
          <rect
            x="600"
            y="152"
            width="68"
            height="36"
            rx="18"
            className="fill-[#E7F5EC] dark:fill-[#192820] transition-colors duration-300"
          />
          {/* Animated Pill Packets */}
          <rect
            x="604"
            y="162"
            width="20"
            height="16"
            rx="8"
            className="fill-[#6B4EFF] dark:fill-[#B7A6FF] m3-stream-1"
          />
          <circle
            cx="612"
            cy="170"
            r="6"
            className="fill-[#18B86A] dark:fill-[#63E6A2] m3-stream-2"
          />
        </g>

        {/* ==================== 5. OPAQUE SERVER (RIGHT - M3 MINT/GREEN TONAL) ==================== */}
        <g className="m3-float-3">
          {/* Borderless Tonal Surface Container */}
          <rect
            x="680"
            y="24"
            width="256"
            height="292"
            rx="56"
            className="fill-[#D4F8E2] dark:fill-[#102B1E] transition-colors duration-300"
          />

          {/* Inner Tonal Sub-card */}
          <rect
            x="700"
            y="44"
            width="216"
            height="120"
            rx="40"
            className="fill-[#AEECC8] dark:fill-[#173E2B] transition-colors duration-300"
          />

          {/* M3 Stacked Server Pills (Inspired by M3 Component Sliders) */}
          <g className="m3-badge-pulse">
            {/* Top Server Blade */}
            <rect
              x="756"
              y="70"
              width="104"
              height="30"
              rx="15"
              className="fill-[#12A15A] dark:fill-[#5BE39B]"
            />
            <circle
              cx="774"
              cy="85"
              r="5"
              className="fill-[#D4F8E2] dark:fill-[#0A2618]"
            />
            <rect
              x="788"
              y="81"
              width="54"
              height="8"
              rx="4"
              className="fill-[#0B3B22]/40 dark:fill-[#0A2618]/50"
            />

            {/* Bottom Server Blade */}
            <rect
              x="756"
              y="108"
              width="104"
              height="30"
              rx="15"
              className="fill-[#0B3B22] dark:fill-[#286647]"
            />
            <circle
              cx="774"
              cy="123"
              r="5"
              className="fill-[#5BE39B] dark:fill-[#AEECC8]"
            />
            <rect
              x="788"
              y="119"
              width="40"
              height="8"
              rx="4"
              className="fill-[#AEECC8]/50 dark:fill-[#AEECC8]/60"
            />
          </g>

          {/* Title & Subtitle */}
          <text
            x="808"
            y="204"
            textAnchor="middle"
            className="fill-[#08301B] dark:fill-[#D4F8E2] transition-colors duration-300"
            fontSize="21"
            fontWeight="700"
            letterSpacing="-0.3"
          >
            Opaque Server
          </text>
          <text
            x="808"
            y="230"
            textAnchor="middle"
            className="fill-[#256343] dark:fill-[#85CBA4] transition-colors duration-300"
            fontSize="14"
            fontWeight="500"
          >
            Sees only gibberish
          </text>

          {/* M3 Bottom Status Pill */}
          <rect
            x="720"
            y="254"
            width="176"
            height="42"
            rx="21"
            className="fill-[#FFFFFF]/80 dark:fill-[#091911] transition-colors duration-300"
          />
          <circle
            cx="746"
            cy="275"
            r="11"
            className="fill-[#12A15A] dark:fill-[#5BE39B]"
          />
          {/* Slash / Zero-Access Icon */}
          <path
            d="M742 279L750 271"
            className="stroke-[#FFFFFF] dark:stroke-[#0A2618]"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <text
            x="814"
            y="280"
            textAnchor="middle"
            className="fill-[#08301B] dark:fill-[#AEECC8]"
            fontSize="13"
            fontWeight="700"
          >
            Zero Access
          </text>
        </g>
      </svg>
    </div>
  );
}
