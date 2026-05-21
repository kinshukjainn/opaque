"use client";

import { motion } from "framer-motion";
import { Shield, Lock, FileKey, ShieldAlert, LucideIcon } from "lucide-react";

export default function HeroGrid() {
  return (
    <div className="fixed inset-0 -z-50 overflow-hidden bg-black pointer-events-none selection:bg-none">
      {/* 1. Base Grid Layer */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#27272a_1px,transparent_1px),linear-gradient(to_bottom,#27272a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_20%,transparent_100%)] opacity-[0.15]" />

      {/* 2. Animated Scanning Line (Horizontal) */}
      <motion.div
        animate={{
          y: ["-100%", "200%"],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute top-0 left-0 w-full h-[20vh] bg-gradient-to-b from-transparent via-zinc-500/5 to-transparent opacity-50"
      />

      {/* 3. Horizontal Data Streams (Simulating encrypted packets) */}
      <DataStream top="20%" duration={12} delay={0} direction="right" />
      <DataStream top="45%" duration={15} delay={2} direction="left" />
      <DataStream top="70%" duration={10} delay={5} direction="right" />

      {/* 4. Vertical Data Streams */}
      <VerticalDataStream left="15%" duration={14} delay={1} direction="down" />
      <VerticalDataStream left="85%" duration={18} delay={3} direction="up" />

      {/* 5. Floating Cryptography / Security Nodes */}
      <SecurityNode Icon={Shield} top="15%" left="20%" delay={0} />
      <SecurityNode Icon={Lock} top="60%" left="10%" delay={2} />
      <SecurityNode Icon={FileKey} top="25%" left="80%" delay={1.5} />
      <SecurityNode Icon={ShieldAlert} top="75%" left="85%" delay={3} />

      {/* 6. Floating Hex Strings (Zero-knowledge theme) */}
      <HexString text="0x4F8A9..." top="30%" left="15%" delay={0.5} />
      <HexString text="aes-256-gcm" top="65%" left="80%" delay={2.5} />
      <HexString text="argon2id" top="15%" left="75%" delay={1} />
      <HexString text="vault.enc" top="80%" left="20%" delay={3.5} />

      {/* 7. Ambient Glows for Depth */}
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-zinc-800/10 blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-zinc-800/10 blur-[100px]" />

      {/* Grain overlay for texture */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
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
    <div className="absolute h-px w-full bg-transparent" style={{ top }}>
      <motion.div
        animate={{
          x: direction === "right" ? ["-100vw", "100vw"] : ["100vw", "-100vw"],
        }}
        transition={{
          duration,
          delay,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute top-0 h-full w-[20vw] bg-gradient-to-r from-transparent via-zinc-500/40 to-transparent"
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
    <div className="absolute w-px h-full bg-transparent" style={{ left }}>
      <motion.div
        animate={{
          y: direction === "down" ? ["-100vh", "100vh"] : ["100vh", "-100vh"],
        }}
        transition={{
          duration,
          delay,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute left-0 w-full h-[20vh] bg-gradient-to-b from-transparent via-zinc-500/40 to-transparent"
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
  Icon: LucideIcon; // Changed from 'any' to 'LucideIcon'
  top: string;
  left: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{
        opacity: [0.1, 0.4, 0.1],
        scale: [1, 1.1, 1],
      }}
      transition={{
        duration: 4,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className="absolute flex items-center justify-center p-2 rounded-lg border border-zinc-800/50 bg-zinc-900/20 backdrop-blur-sm"
      style={{ top, left }}
    >
      <Icon className="w-4 h-4 text-zinc-500" />
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
        opacity: [0, 0.3, 0],
      }}
      transition={{
        duration: 6,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className="absolute font-mono text-[10px] tracking-widest text-zinc-600 uppercase"
      style={{ top, left }}
    >
      {text}
    </motion.div>
  );
}
