// app/vault/layout.tsx

import { VaultProvider } from "../components/vault-comp/VaultProvider";

export default function VaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <VaultProvider>{children}</VaultProvider>;
}
