"use client";

import React, { useState, useMemo } from "react";
import { Search, Puzzle } from "lucide-react";

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
    <div className="min-h-screen bg-black text-zinc-300 pt-20  selection:bg-zinc-800 selection:text-white pb-32">
      {/* ── TOP NAVIGATION BAR ── */}

      <div className="max-w-6xl mx-auto px-6 pt-16 space-y-12">
        {/* ── HEADER ── */}
        <header className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-zinc-100 flex items-center gap-4 mb-4">
            <Puzzle className="w-10 h-10 text-zinc-400" />
            Supported Services
          </h1>
          <p className="text-zinc-400 text-lg leading-relaxed">
            EndVault provides end-to-end encrypted credential storage for the
            tools you use every day. Below are the natively recognized
            environments for custom autofill, metadata mapping, and icon
            resolution.
          </p>
          <div className="mt-2 px-3 py-2 bg-red-500/30 rounded-xl border-2 border-red-500/20">
            <p className="text-red-300 text-lg leading-relaxed">
              <span className="font-bold ">
                EndVault stores account credentials only
              </span>{" "}
              — passwords, email IDs, and login details for your accounts.
              Please don&lsquo;t save banking or financial information here,
              such as card numbers, CVVs, PINs, or net-banking credentials.
              EndVault isn&apos;t designed to hold that kind of data.
            </p>
          </div>
        </header>

        {/* ── SEARCH & FILTERS ── */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between  p-4 rounded-xl backdrop-blur-sm">
          {/* Search Bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search applications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-950 text-zinc-200 border border-zinc-800 pl-10 pr-4 py-2.5 rounded-full outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-all text-sm"
            />
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat as Category | "All")}
                className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors border ${
                  activeCategory === cat
                    ? "bg-zinc-100 text-black border-zinc-100"
                    : "bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:border-zinc-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* ── RESULTS GRID ── */}
        {filteredApps.length === 0 ? (
          <div className="p-16 border border-zinc-800/80 bg-zinc-900/10 rounded-2xl text-center flex flex-col items-center justify-center">
            <Puzzle className="w-8 h-8 text-zinc-600 mb-4" />
            <p className="text-zinc-400 font-medium text-lg">
              No services found
            </p>
            <p className="text-zinc-500 text-sm mt-1">
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
                  className="group flex flex-col items-center justify-center gap-4 p-6 bg-zinc-900/10 border border-zinc-800/80 hover:bg-zinc-900/40 hover:border-zinc-700 transition-all rounded-2xl cursor-default"
                >
                  <div className="p-4 bg-zinc-950 border border-zinc-800/50 rounded-xl group-hover:scale-110 group-hover:shadow-lg transition-transform duration-300">
                    <Icon className="w-8 h-8 text-zinc-400 group-hover:text-zinc-100 transition-colors" />
                  </div>
                  <div className="text-center space-y-1">
                    <h3 className="text-zinc-200 text-sm font-medium tracking-tight">
                      {app.name}
                    </h3>
                    <p className="text-zinc-600 text-[10px] uppercase tracking-wider font-mono">
                      {app.category.split("&")[0]}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── FOOTER NOTE ── */}
        <div className="pt-12 text-center border-t border-zinc-800/50">
          <p className="text-zinc-500 text-sm">
            Vault26 supports custom entries for any URL or platform. The
            services listed above feature verified metadata mapping.
          </p>
        </div>
      </div>
    </div>
  );
}
