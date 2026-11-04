"use client";

import React from "react";

export default function SecureYourDataSvg() {
  return (
    <div className="w-full flex justify-center items-center py-6 select-none">
      <style>{`
        /* Smooth, calm 6-second continuous flow */
        @keyframes m3-float-gentle {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
        @keyframes m3-shield-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.04); }
        }
        @keyframes m3-data-packet {
          0% { transform: translateX(0px) scale(0.6); opacity: 0; }
          15% { transform: translateX(8px) scale(1); opacity: 1; }
          85% { transform: translateX(44px) scale(1); opacity: 1; }
          100% { transform: translateX(52px) scale(0.6); opacity: 0; }
        }
        @keyframes m3-lock-click {
          0%, 15% { transform: rotate(0deg); }
          25%, 35% { transform: rotate(-8deg); }
          45%, 100% { transform: rotate(0deg); }
        }

        .anim-float {
          animation: m3-float-gentle 5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          transform-box: fill-box;
          transform-origin: center;
        }
        .anim-pulse {
          animation: m3-shield-pulse 3.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          transform-box: fill-box;
          transform-origin: center;
        }
        .anim-packet-1 {
          animation: m3-data-packet 2.2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          transform-box: fill-box;
          transform-origin: center;
        }
        .anim-packet-2 {
          animation: m3-data-packet 2.2s cubic-bezier(0.4, 0, 0.2, 1) infinite 1.1s;
          transform-box: fill-box;
          transform-origin: center;
        }
        .anim-lock {
          animation: m3-lock-click 4s ease-in-out infinite;
          transform-box: fill-box;
          transform-origin: center;
        }

        @media (prefers-reduced-motion: reduce) {
          .anim-float, .anim-pulse, .anim-packet-1, .anim-packet-2, .anim-lock {
            animation: none !important;
          }
        }
      `}</style>

      <svg
        viewBox="0 0 460 220"
        className="w-full max-w-xl h-auto"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Illustration showing passwords encrypted entirely on your device before reaching the cloud."
        style={{
          fontFamily:
            "'Google Sans', 'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif",
        }}
      >
        {/* ==================== 1. YOUR DEVICE (LEFT) ==================== */}
        <g className="anim-float">
          {/* Main Tonal Container */}
          <rect
            x="24"
            y="20"
            width="170"
            height="180"
            rx="40"
            className="fill-[#D8EFFE] dark:fill-[#132A3B] transition-colors duration-300"
          />

          {/* Top Graphic Card */}
          <rect
            x="38"
            y="34"
            width="142"
            height="86"
            rx="28"
            className="fill-[#B7E1FF] dark:fill-[#1B3B52] transition-colors duration-300"
          />

          {/* Glowing Shield Icon */}
          <g className="anim-pulse">
            <circle
              cx="109"
              cy="77"
              r="28"
              className="fill-[#00A8FF] dark:fill-[#5CC4FF]"
            />
            {/* Lock inside shield */}
            <g className="anim-lock">
              <rect
                x="101"
                y="74"
                width="16"
                height="12"
                rx="3.5"
                className="fill-[#00263D] dark:fill-[#072130]"
              />
              <path
                d="M104.5 74V69.5C104.5 66.7386 106.739 64.5 109.5 64.5C112.261 64.5 114.5 66.7386 114.5 69.5V74"
                className="stroke-[#00263D] dark:stroke-[#072130]"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </g>
          </g>

          {/* Labels */}
          <text
            x="109"
            y="148"
            textAnchor="middle"
            className="fill-[#062942] dark:fill-[#D8EFFE]"
            fontSize="16"
            fontWeight="700"
          >
            Your Device
          </text>
          <text
            x="109"
            y="170"
            textAnchor="middle"
            className="fill-[#2E5B7B] dark:fill-[#89B8D8]"
            fontSize="12"
            fontWeight="500"
          >
            Locked on your phone
          </text>
        </g>

        {/* ==================== 2. SECURE ENCRYPTION STREAM (CENTER) ==================== */}
        <g>
          {/* Pill Connection Track */}
          <rect
            x="206"
            y="92"
            width="48"
            height="32"
            rx="16"
            className="fill-[#EDEBF6] dark:fill-[#22212C] transition-colors duration-300"
          />
          {/* Moving Scrambled Data Packets */}
          <rect
            x="212"
            y="100"
            width="16"
            height="16"
            rx="5"
            className="fill-[#6B4EFF] dark:fill-[#B7A6FF] anim-packet-1"
          />
          <circle
            cx="220"
            cy="108"
            r="5"
            className="fill-[#00A8FF] dark:fill-[#5CC4FF] anim-packet-2"
          />
        </g>

        {/* ==================== 3. CLOUD SERVER (RIGHT) ==================== */}
        <g className="anim-float" style={{ animationDelay: "1.5s" }}>
          {/* Main Tonal Container */}
          <rect
            x="266"
            y="20"
            width="170"
            height="180"
            rx="40"
            className="fill-[#E9E4FF] dark:fill-[#221D3A] transition-colors duration-300"
          />

          {/* Top Graphic Card */}
          <rect
            x="280"
            y="34"
            width="142"
            height="86"
            rx="28"
            className="fill-[#D5CCFF] dark:fill-[#322856] transition-colors duration-300"
          />

          {/* Cloud Icon */}
          <g className="anim-pulse" style={{ animationDelay: "1s" }}>
            <circle
              cx="351"
              cy="77"
              r="28"
              className="fill-[#6B4EFF] dark:fill-[#B7A6FF]"
            />
            {/* Simple Server / Cloud Shield */}
            <path
              d="M343 73H359M343 81H359"
              className="stroke-[#FFFFFF] dark:stroke-[#1D153B]"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <circle
              cx="347"
              cy="73"
              r="1.5"
              className="fill-[#FFFFFF] dark:fill-[#1D153B]"
            />
            <circle
              cx="347"
              cy="81"
              r="1.5"
              className="fill-[#FFFFFF] dark:fill-[#1D153B]"
            />
          </g>

          {/* Labels */}
          <text
            x="351"
            y="148"
            textAnchor="middle"
            className="fill-[#231651] dark:fill-[#E9E4FF]"
            fontSize="16"
            fontWeight="700"
          >
            Our Cloud
          </text>
          <text
            x="351"
            y="170"
            textAnchor="middle"
            className="fill-[#564787] dark:fill-[#B0A4E3]"
            fontSize="12"
            fontWeight="500"
          >
            Sees only gibberish
          </text>
        </g>
      </svg>
    </div>
  );
}
