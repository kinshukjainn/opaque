"use client";

import { motion } from "framer-motion";
import {
  Shield,
  Lock,
  FileKey,
  ShieldAlert,
  LucideIcon,
  Network,
} from "lucide-react";

export default function HeroGrid() {
  return (
    <div className="fixed inset-0 -z-50 overflow-hidden bg-[#030303] pointer-events-none selection:bg-none">
      {/* 1. Base Grid Layer - Made finer and added a subtle breathing pulse */}
      <motion.div
        animate={{ opacity: [0.15, 0.25, 0.15] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-[linear-gradient(to_right,#3f3f46_1px,transparent_1px),linear-gradient(to_bottom,#3f3f46_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_50%,#000_20%,transparent_100%)]"
      />

      {/* 2. Animated Scanning Line (Horizontal) - Softer, wider, more cinematic */}
      <motion.div
        animate={{ y: ["-10vh", "110vh"] }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        className="absolute top-0 left-0 w-full h-[30vh] bg-gradient-to-b from-transparent via-zinc-400/5 to-transparent opacity-60"
      />

      {/* 3. Horizontal Data Streams (Comet effect: bright head, fading tail) */}
      <DataStream top="15%" duration={14} delay={0} direction="right" />
      <DataStream top="35%" duration={18} delay={4} direction="left" />
      <DataStream top="65%" duration={12} delay={2} direction="right" />
      <DataStream top="85%" duration={20} delay={7} direction="left" />

      {/* 4. Vertical Data Streams */}
      <VerticalDataStream left="12%" duration={15} delay={1} direction="down" />
      <VerticalDataStream left="28%" duration={22} delay={5} direction="up" />
      <VerticalDataStream left="72%" duration={17} delay={3} direction="down" />
      <VerticalDataStream left="88%" duration={19} delay={8} direction="up" />

      {/* 5. Floating Cryptography / Security Nodes - Added floating physics */}
      <SecurityNode Icon={Shield} top="18%" left="22%" delay={0} />
      <SecurityNode Icon={Lock} top="65%" left="15%" delay={2.5} />
      <SecurityNode Icon={FileKey} top="28%" left="78%" delay={1.5} />
      <SecurityNode Icon={ShieldAlert} top="72%" left="82%" delay={3.5} />
      <SecurityNode Icon={Network} top="45%" left="88%" delay={5} />

      {/* 6. Floating Hex Strings (Zero-knowledge theme) - Added vertical drift */}
      <HexString text="0x4F8A9..." top="32%" left="18%" delay={0.5} />
      <HexString text="aes-256-gcm" top="68%" left="75%" delay={2.5} />
      <HexString text="argon2id" top="12%" left="72%" delay={1} />
      <HexString text="vault.enc" top="82%" left="25%" delay={3.5} />
      <HexString text="zk-SNARK" top="48%" left="12%" delay={4} />

      {/* 7. Ambient Glows for Depth - Slow pulsing radial gradients */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-zinc-800/10 blur-[120px]"
      />
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
        className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-zinc-800/10 blur-[120px]"
      />

      {/* 8. Grain overlay for premium texture */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.04] mix-blend-overlay" />
    </div>
  );
}

// --- Sub-components ---

function DataStream({
  top,
  duration,
  delay,
  direction,
}: {
  top: string;
  duration: number;
  delay: number;
  direction: "left" | "right";
}) {
  return (
    <div className="absolute h-[1px] w-full bg-transparent" style={{ top }}>
      <motion.div
        animate={{
          x: direction === "right" ? ["-30vw", "130vw"] : ["130vw", "-30vw"],
        }}
        transition={{
          duration,
          delay,
          repeat: Infinity,
          ease: "linear",
        }}
        // Comet effect: bright tip that fades out smoothly
        className={`absolute top-0 h-full w-[25vw] bg-gradient-to-r ${
          direction === "right"
            ? "from-transparent via-zinc-500/20 to-zinc-300/80"
            : "from-zinc-300/80 via-zinc-500/20 to-transparent"
        }`}
      />
    </div>
  );
}

function VerticalDataStream({
  left,
  duration,
  delay,
  direction,
}: {
  left: string;
  duration: number;
  delay: number;
  direction: "up" | "down";
}) {
  return (
    <div className="absolute w-[1px] h-full bg-transparent" style={{ left }}>
      <motion.div
        animate={{
          y: direction === "down" ? ["-30vh", "130vh"] : ["130vh", "-30vh"],
        }}
        transition={{
          duration,
          delay,
          repeat: Infinity,
          ease: "linear",
        }}
        className={`absolute left-0 w-full h-[25vh] bg-gradient-to-b ${
          direction === "down"
            ? "from-transparent via-zinc-500/20 to-zinc-300/80"
            : "from-zinc-300/80 via-zinc-500/20 to-transparent"
        }`}
      />
    </div>
  );
}

function SecurityNode({
  Icon,
  top,
  left,
  delay,
}: {
  Icon: LucideIcon;
  top: string;
  left: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{
        opacity: [0.15, 0.5, 0.15],
        scale: [1, 1.05, 1],
        y: [0, -15, 0], // Added gentle floating
      }}
      transition={{
        duration: 6,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className="absolute flex items-center justify-center p-2.5 rounded-lg border border-zinc-700/30 bg-zinc-900/40 backdrop-blur-md shadow-[0_0_15px_rgba(255,255,255,0.03)]"
      style={{ top, left }}
    >
      <Icon className="w-4 h-4 text-zinc-400" />
    </motion.div>
  );
}

function HexString({
  text,
  top,
  left,
  delay,
}: {
  text: string;
  top: string;
  left: string;
  delay: number;
}) {
  return (
    <motion.div
      animate={{
        opacity: [0, 0.4, 0],
        y: [10, -10], // Added drifting effect
      }}
      transition={{
        duration: 8,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className="absolute font-mono text-[10px] tracking-widest text-zinc-500 uppercase"
      style={{ top, left }}
    >
      {text}
    </motion.div>
  );
}
