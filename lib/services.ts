// ============================================================
//  POPULAR SERVICES  —  client-side dropdown options
// ------------------------------------------------------------
//  IMPORTANT (zero-knowledge): this list is a UX convenience ONLY.
//  The selected `id` is stored INSIDE the encrypted vault_items
//  blob — never as a plaintext DB column. The server must not be
//  able to learn which services a user has accounts on.
//
//  Rendering icons: use `domain` with a favicon service or the
//  `simple-icons` package (slug usually matches `id`), and fall
//  back to a colored chip with the first letter using `color`.
//
//  This is a constant, not a Postgres enum — adding a 31st service
//  is a one-line edit here, no migration (same lesson as the
//  `plans` reference table).
// ============================================================

export type ServiceId =
  | "google"
  | "apple"
  | "microsoft"
  | "amazon"
  | "facebook"
  | "instagram"
  | "x"
  | "linkedin"
  | "github"
  | "gitlab"
  | "netflix"
  | "spotify"
  | "youtube"
  | "whatsapp"
  | "discord"
  | "slack"
  | "reddit"
  | "paypal"
  | "dropbox"
  | "steam"
  | "twitch"
  | "tiktok"
  | "snapchat"
  | "adobe"
  | "zoom"
  | "notion"
  | "figma"
  | "coinbase"
  | "flipkart"
  | "paytm"
  | "other";

export interface ServiceOption {
  id: ServiceId;
  name: string; // display label in the dropdown
  domain?: string; // for favicon-based icons (omit for 'other')
  color?: string; // brand color — fallback chip / accent
}

export const POPULAR_SERVICES: ServiceOption[] = [
  { id: "google", name: "Google", domain: "google.com", color: "#4285F4" },
  { id: "apple", name: "Apple", domain: "apple.com", color: "#000000" },
  {
    id: "microsoft",
    name: "Microsoft",
    domain: "microsoft.com",
    color: "#00A4EF",
  },
  { id: "amazon", name: "Amazon", domain: "amazon.com", color: "#FF9900" },
  {
    id: "facebook",
    name: "Facebook",
    domain: "facebook.com",
    color: "#1877F2",
  },
  {
    id: "instagram",
    name: "Instagram",
    domain: "instagram.com",
    color: "#E4405F",
  },
  { id: "x", name: "X (Twitter)", domain: "x.com", color: "#000000" },
  {
    id: "linkedin",
    name: "LinkedIn",
    domain: "linkedin.com",
    color: "#0A66C2",
  },
  { id: "github", name: "GitHub", domain: "github.com", color: "#181717" },
  { id: "gitlab", name: "GitLab", domain: "gitlab.com", color: "#FC6D26" },
  { id: "netflix", name: "Netflix", domain: "netflix.com", color: "#E50914" },
  { id: "spotify", name: "Spotify", domain: "spotify.com", color: "#1DB954" },
  { id: "youtube", name: "YouTube", domain: "youtube.com", color: "#FF0000" },
  {
    id: "whatsapp",
    name: "WhatsApp",
    domain: "whatsapp.com",
    color: "#25D366",
  },
  { id: "discord", name: "Discord", domain: "discord.com", color: "#5865F2" },
  { id: "slack", name: "Slack", domain: "slack.com", color: "#4A154B" },
  { id: "reddit", name: "Reddit", domain: "reddit.com", color: "#FF4500" },
  { id: "paypal", name: "PayPal", domain: "paypal.com", color: "#003087" },
  { id: "dropbox", name: "Dropbox", domain: "dropbox.com", color: "#0061FF" },
  { id: "steam", name: "Steam", domain: "steampowered.com", color: "#171A21" },
  { id: "twitch", name: "Twitch", domain: "twitch.tv", color: "#9146FF" },
  { id: "tiktok", name: "TikTok", domain: "tiktok.com", color: "#000000" },
  {
    id: "snapchat",
    name: "Snapchat",
    domain: "snapchat.com",
    color: "#FFFC00",
  },
  { id: "adobe", name: "Adobe", domain: "adobe.com", color: "#EC1C24" },
  { id: "zoom", name: "Zoom", domain: "zoom.us", color: "#0B5CFF" },
  { id: "notion", name: "Notion", domain: "notion.so", color: "#000000" },
  { id: "figma", name: "Figma", domain: "figma.com", color: "#F24E1E" },
  {
    id: "coinbase",
    name: "Coinbase",
    domain: "coinbase.com",
    color: "#0052FF",
  },
  {
    id: "flipkart",
    name: "Flipkart",
    domain: "flipkart.com",
    color: "#2874F0",
  },
  { id: "paytm", name: "Paytm", domain: "paytm.com", color: "#00BAF2" },
  // Sentinel — when chosen, show a text input and store the typed
  // label as `customName` inside the encrypted blob.
  { id: "other", name: "Other…", color: "#6B7280" },
];

// Quick lookup by id (e.g. to resolve icon/color when rendering a decrypted item)
export const SERVICE_MAP: Record<ServiceId, ServiceOption> = Object.fromEntries(
  POPULAR_SERVICES.map((s) => [s.id, s]),
) as Record<ServiceId, ServiceOption>;

// Favicon URL helper (client-side icon rendering). Swap the provider if you prefer.
export function serviceIconUrl(id: ServiceId): string | null {
  const domain = SERVICE_MAP[id]?.domain;
  return domain
    ? `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
    : null;
}
