// app/vault/layout.tsx
import type { Metadata } from "next";
import { VaultProvider } from "../components/vault-comp/VaultProvider";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Dashboard of the application",
};

export default function VaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <VaultProvider>{children}</VaultProvider>;
}
