export type NavItem = { title: string; slug: string };
export type NavSection = { title: string; items: NavItem[] };

export const navigation: NavSection[] = [
  {
    title: "Getting Started",
    items: [
      { title: "Introduction", slug: "introduction" },
      { title: "Project Setup", slug: "project-setup" },
    ],
  },
  {
    title: "Security & Architecture",
    items: [
      { title: "Zero-Knowledge Model", slug: "zero-knowledge-model" },
      { title: "Key Management & KDF", slug: "key-management" },
      { title: "Recovery Phrases", slug: "recovery-phrases" },
    ],
  },
  {
    title: "Core Features",
    items: [
      { title: "Vault Items", slug: "vault-items" },
      { title: "Client-Side Search", slug: "client-side-search" },
      { title: "Password Generator", slug: "password-generator" },
    ],
  },
  {
    title: "API & Webhooks",
    items: [
      { title: "Clerk User Sync", slug: "clerk-user-sync" },
      { title: "Vault Endpoints", slug: "vault-endpoints" },
    ],
  },
];
