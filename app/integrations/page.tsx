"use client";

import React, { useState, useMemo } from "react";
import { Search, Puzzle, Info } from "lucide-react";

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

  // Fast, synchronous filtering using useMemo
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
    <div className="min-h-screen bg-[#161923] text-[#F3F4F6] pt-24 pb-32  selection:bg-[#0060df] selection:text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10">
        {/* ── HEADER ── */}
        <header className="max-w-3xl space-y-6">
          <div className="flex flex-col gap-4">
            <div className="w-14 h-14 rounded-full bg-[#1e2230] border border-[#2e3447] flex items-center justify-center text-[#F3F4F6]">
              <Puzzle className="w-7 h-7" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
              Supported Integrations
            </h1>
          </div>
          <p className="text-[#a0a6b8] text-lg leading-relaxed">
            Opaque provides end-to-end encrypted credential storage for the
            tools you use every day. Below are the natively recognized
            environments for custom autofill, metadata mapping, and icon
            resolution.
          </p>

          {/* Pragmatic Warning Card */}
          <div className="mt-4 p-5 md:p-6 bg-[#2a221b] rounded-xl border border-[#d97706]/30 flex items-start gap-4">
            <Info className="w-6 h-6 text-[#fbbf24] flex-shrink-0 mt-0.5" />
            <p className="text-[#fcd34d] text-[15px] leading-relaxed">
              <span className="font-semibold block mb-1 text-white">
                Opaque stores account credentials only
              </span>
              Passwords, email IDs, and login details for your accounts. Please
              don&apos;t save banking or financial information here, such as
              card numbers, CVVs, PINs, or net-banking credentials. Opaque
              isn&apos;t designed to hold that kind of data.
            </p>
          </div>
        </header>

        {/* ── SEARCH & FILTERS ── */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Search Bar */}
          <div className="relative w-full lg:w-96 flex-shrink-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6b7280]" />
            <input
              type="text"
              placeholder="Search applications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1e2230] text-[#F3F4F6] placeholder-[#6b7280] pl-12 pr-4 py-3 rounded-xl border border-[#2e3447] outline-none focus:bg-[#252a3b] focus:border-[#0060df] focus:ring-1 focus:ring-[#0060df] transition-all duration-150 ease-in-out text-[16px]"
            />
          </div>

          {/* Category Pills */}
          <div
            className="flex flex-nowrap items-center gap-2 w-full overflow-x-auto pb-2 lg:pb-0 scrollbar-hide"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat as Category | "All")}
                className={`px-5 py-2.5 rounded-lg text-[14px] font-medium whitespace-nowrap transition-colors duration-150 ease-in-out flex-shrink-0 border ${
                  activeCategory === cat
                    ? "bg-[#0060df] border-[#0060df] text-white"
                    : "bg-[#1e2230] border-[#2e3447] text-[#a0a6b8] hover:bg-[#252a3b] hover:text-[#F3F4F6]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* ── RESULTS GRID ── */}
        {filteredApps.length === 0 ? (
          <div className="py-24 px-6 border border-[#2e3447] bg-[#1e2230] rounded-2xl text-center flex flex-col items-center justify-center w-full">
            <div className="w-14 h-14 bg-[#252a3b] rounded-xl flex items-center justify-center mb-5 text-[#6b7280]">
              <Search className="w-7 h-7" />
            </div>
            <p className="text-[#F3F4F6] font-medium text-lg">
              No services found
            </p>
            <p className="text-[#a0a6b8] text-[15px] mt-1">
              Try adjusting your search or category filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredApps.map((app) => {
              const Icon = app.icon;
              return (
                <div
                  key={app.id}
                  className="group flex flex-col items-center justify-center gap-4 p-5 bg-[#1e2230] border border-[#2e3447] hover:border-[#0060df]/50 hover:bg-[#252a3b] transition-all duration-150 ease-in-out rounded-xl cursor-default"
                >
                  <div className="w-14 h-14 bg-[#252a3b] group-hover:bg-[#2e3447] rounded-lg flex items-center justify-center transition-colors duration-150">
                    <Icon className="w-7 h-7 text-[#a0a6b8] group-hover:text-white transition-colors duration-150" />
                  </div>
                  <div className="text-center space-y-1">
                    <h3 className="text-[#F3F4F6] text-[15px] font-semibold tracking-tight">
                      {app.name}
                    </h3>
                    <p className="text-[#6b7280] text-[11px] uppercase tracking-wide font-medium">
                      {app.category.split("&")[0].trim()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── FOOTER NOTE ── */}
        <div className="pt-10 text-center border-t border-[#2e3447]">
          <p className="text-[#6b7280] text-[14px]">
            Vault26 supports custom entries for any URL or platform. The
            services listed above feature verified metadata mapping.
          </p>
        </div>
      </div>
    </div>
  );
}
