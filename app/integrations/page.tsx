"use client";

import React, { useState, useMemo } from "react";
import { Search, Puzzle, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Importing 40 Brand Icons from React Icons
import {
  FaGithub,
  FaInstagram,
  FaLinkedin,
  FaFacebook,
  FaGoogle,
  FaMicrosoft,
  FaApple,
  FaAws,
  FaDigitalOcean,
  FaFigma,
  FaSlack,
  FaDiscord,
  FaSpotify,
  FaTwitch,
  FaReddit,
  FaPinterest,
  FaTiktok,
  FaSnapchat,
  FaWhatsapp,
  FaTelegram,
  FaStripe,
  FaPaypal,
  FaGitlab,
  FaBitbucket,
  FaDocker,
  FaNpm,
  FaXTwitter,
} from "react-icons/fa6";

import {
  SiVercel,
  SiNetlify,
  SiHeroku,
  SiCloudflare,
  SiOpenai,
  SiLinear,
  SiNotion,
  SiSupabase,
  SiMongodb,
  SiPostgresql,
  SiRedis,
  SiUpstash,
  SiClerk,
} from "react-icons/si";

// ============================================================================
// Data: Top 40 Supported Services
// ============================================================================

type Category =
  | "Social & Media"
  | "Developer & Cloud"
  | "Productivity & Finance";

interface SupportedApp {
  id: string;
  name: string;
  category: Category;
  icon: React.ElementType;
}

const SUPPORTED_APPS: SupportedApp[] = [
  // Developer & Cloud
  {
    id: "github",
    name: "GitHub",
    category: "Developer & Cloud",
    icon: FaGithub,
  },
  { id: "aws", name: "AWS", category: "Developer & Cloud", icon: FaAws },
  {
    id: "vercel",
    name: "Vercel",
    category: "Developer & Cloud",
    icon: SiVercel,
  },
  {
    id: "cloudflare",
    name: "Cloudflare",
    category: "Developer & Cloud",
    icon: SiCloudflare,
  },
  {
    id: "supabase",
    name: "Supabase",
    category: "Developer & Cloud",
    icon: SiSupabase,
  },
  {
    id: "digitalocean",
    name: "DigitalOcean",
    category: "Developer & Cloud",
    icon: FaDigitalOcean,
  },
  {
    id: "gitlab",
    name: "GitLab",
    category: "Developer & Cloud",
    icon: FaGitlab,
  },
  {
    id: "docker",
    name: "Docker",
    category: "Developer & Cloud",
    icon: FaDocker,
  },
  {
    id: "mongodb",
    name: "MongoDB",
    category: "Developer & Cloud",
    icon: SiMongodb,
  },
  {
    id: "postgres",
    name: "PostgreSQL",
    category: "Developer & Cloud",
    icon: SiPostgresql,
  },
  { id: "redis", name: "Redis", category: "Developer & Cloud", icon: SiRedis },
  {
    id: "upstash",
    name: "Upstash",
    category: "Developer & Cloud",
    icon: SiUpstash,
  },
  {
    id: "clerk",
    name: "Clerk Auth",
    category: "Developer & Cloud",
    icon: SiClerk,
  },
  {
    id: "netlify",
    name: "Netlify",
    category: "Developer & Cloud",
    icon: SiNetlify,
  },
  {
    id: "heroku",
    name: "Heroku",
    category: "Developer & Cloud",
    icon: SiHeroku,
  },
  {
    id: "bitbucket",
    name: "Bitbucket",
    category: "Developer & Cloud",
    icon: FaBitbucket,
  },
  { id: "npm", name: "NPM", category: "Developer & Cloud", icon: FaNpm },

  // Social & Media
  {
    id: "instagram",
    name: "Instagram",
    category: "Social & Media",
    icon: FaInstagram,
  },
  {
    id: "x",
    name: "X (Twitter)",
    category: "Social & Media",
    icon: FaXTwitter,
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    category: "Social & Media",
    icon: FaLinkedin,
  },
  {
    id: "facebook",
    name: "Facebook",
    category: "Social & Media",
    icon: FaFacebook,
  },
  {
    id: "discord",
    name: "Discord",
    category: "Social & Media",
    icon: FaDiscord,
  },
  { id: "reddit", name: "Reddit", category: "Social & Media", icon: FaReddit },
  { id: "tiktok", name: "TikTok", category: "Social & Media", icon: FaTiktok },
  { id: "twitch", name: "Twitch", category: "Social & Media", icon: FaTwitch },
  {
    id: "spotify",
    name: "Spotify",
    category: "Social & Media",
    icon: FaSpotify,
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    category: "Social & Media",
    icon: FaWhatsapp,
  },
  {
    id: "telegram",
    name: "Telegram",
    category: "Social & Media",
    icon: FaTelegram,
  },
  {
    id: "snapchat",
    name: "Snapchat",
    category: "Social & Media",
    icon: FaSnapchat,
  },
  {
    id: "pinterest",
    name: "Pinterest",
    category: "Social & Media",
    icon: FaPinterest,
  },

  // Productivity, Tech Giants & Finance
  {
    id: "google",
    name: "Google",
    category: "Productivity & Finance",
    icon: FaGoogle,
  },
  {
    id: "apple",
    name: "Apple",
    category: "Productivity & Finance",
    icon: FaApple,
  },
  {
    id: "microsoft",
    name: "Microsoft",
    category: "Productivity & Finance",
    icon: FaMicrosoft,
  },
  {
    id: "openai",
    name: "OpenAI",
    category: "Productivity & Finance",
    icon: SiOpenai,
  },
  {
    id: "slack",
    name: "Slack",
    category: "Productivity & Finance",
    icon: FaSlack,
  },
  {
    id: "figma",
    name: "Figma",
    category: "Productivity & Finance",
    icon: FaFigma,
  },
  {
    id: "notion",
    name: "Notion",
    category: "Productivity & Finance",
    icon: SiNotion,
  },
  {
    id: "linear",
    name: "Linear",
    category: "Productivity & Finance",
    icon: SiLinear,
  },
  {
    id: "stripe",
    name: "Stripe",
    category: "Productivity & Finance",
    icon: FaStripe,
  },
  {
    id: "paypal",
    name: "PayPal",
    category: "Productivity & Finance",
    icon: FaPaypal,
  },
];

// ============================================================================
// Main Component
// ============================================================================

export default function IntegrationsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category | "All">("All");

  // Filter apps based on search and category
  const filteredApps = useMemo(() => {
    return SUPPORTED_APPS.filter((app) => {
      const matchesSearch = app.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCategory =
        activeCategory === "All" || app.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  const categories = [
    "All",
    "Developer & Cloud",
    "Social & Media",
    "Productivity & Finance",
  ];

  return (
    <div className="min-h-screen bg-[#000000] text-[#E2E2E2]  pt-24 selection:bg-[#A8C7FA] selection:text-[#041E49] pb-32">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
        {/* ── HEADER ── */}
        <header className="max-w-3xl space-y-6">
          <div className="flex flex-col gap-4">
            <div className="w-16 h-16 rounded-full bg-[#1E1F20] flex items-center justify-center text-[#A8C7FA]">
              <Puzzle className="w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#E2E2E2]">
              Supported Integrations
            </h1>
          </div>
          <p className="text-[#8E918F] text-[17px] leading-relaxed">
            Opaque provides end-to-end encrypted credential storage for the
            tools you use every day. Below are the natively recognized
            environments for custom autofill, metadata mapping, and icon
            resolution.
          </p>

          {/* Material You Error Tonal Card */}
          <div className="mt-4 p-5 md:p-6 bg-[#601410] rounded-[28px] border border-[#8C1D18]/50 flex items-start gap-4">
            <Info className="w-6 h-6 text-[#F2B8B5] flex-shrink-0 mt-0.5" />
            <p className="text-[#F2B8B5] text-[15px] leading-relaxed">
              <span className="font-semibold block mb-1">
                Opaque stores account credentials only
              </span>
              Passwords, email IDs, and login details for your accounts. Please
              don&lsquo;t save banking or financial information here, such as
              card numbers, CVVs, PINs, or net-banking credentials. Opaque
              isn&apos;t designed to hold that kind of data.
            </p>
          </div>
        </header>

        {/* ── SEARCH & FILTERS ── */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Search Bar */}
          <div className="relative w-full lg:w-96 flex-shrink-0">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8E918F]" />
            <input
              type="text"
              placeholder="Search applications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1E1F20] text-[#E2E2E2] placeholder-[#8E918F] pl-14 pr-6 py-4 rounded-full outline-none focus:bg-[#282A2C] focus:ring-2 focus:ring-[#A8C7FA] transition-all text-[16px]"
            />
          </div>

          {/* Category Pills (Horizontal Scroll on Mobile) */}
          <div
            className="flex flex-nowrap items-center gap-2 w-full overflow-x-auto pb-2 lg:pb-0 scrollbar-hide"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat as Category | "All")}
                className={`px-6 py-3 rounded-full text-[14px] font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                  activeCategory === cat
                    ? "bg-[#A8C7FA] text-[#041E49]"
                    : "bg-[#1E1F20] text-[#C4C7C5] hover:bg-[#282A2C] hover:text-[#E2E2E2]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* ── RESULTS GRID ── */}
        <AnimatePresence mode="popLayout">
          {filteredApps.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="py-24 px-6 border border-[#282A2C] bg-[#131314] rounded-[32px] text-center flex flex-col items-center justify-center w-full"
            >
              <div className="w-16 h-16 bg-[#1E1F20] rounded-full flex items-center justify-center mb-5 text-[#8E918F]">
                <Puzzle className="w-8 h-8" />
              </div>
              <p className="text-[#E2E2E2] font-medium text-xl">
                No services found
              </p>
              <p className="text-[#8E918F] text-[15px] mt-2">
                Try adjusting your search or category filter.
              </p>
            </motion.div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4"
            >
              <AnimatePresence>
                {filteredApps.map((app) => {
                  const Icon = app.icon;
                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 20,
                      }}
                      key={app.id}
                      className="group flex flex-col items-center justify-center gap-4 p-6 bg-[#131314] border border-[#282A2C] hover:bg-[#1E1F20] transition-colors rounded-[32px] cursor-default"
                    >
                      <div className="w-16 h-16 bg-[#1E1F20] group-hover:bg-[#282A2C] rounded-full flex items-center justify-center transition-all duration-300 transform group-hover:scale-110 shadow-[0_4px_14px_0_rgba(0,0,0,0.2)]">
                        <Icon className="w-8 h-8 text-[#C4C7C5] group-hover:text-[#E2E2E2] transition-colors" />
                      </div>
                      <div className="text-center space-y-1.5">
                        <h3 className="text-[#E2E2E2] text-[15px] font-medium tracking-tight">
                          {app.name}
                        </h3>
                        <p className="text-[#8E918F] text-[12px] uppercase tracking-wider font-semibold">
                          {app.category.split("&")[0].trim()}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── FOOTER NOTE ── */}
        <div className="pt-12 text-center border-t border-[#282A2C]">
          <p className="text-[#8E918F] text-[14px]">
            Vault26 supports custom entries for any URL or platform. The
            services listed above feature verified metadata mapping.
          </p>
        </div>
      </div>
    </div>
  );
}
