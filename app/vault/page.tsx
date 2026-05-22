// app/vault/page.tsx
"use client";
import { useVault } from "../components/vault-comp/VaultProvider"; // ← adjust path to your folder
import SetupScreen from "../components/vault-comp/SetupScreen";
import UnlockScreen from "../components/vault-comp/UnlockScreen";
import Dashboard from "../components/vault-comp/Dashboard";

export default function VaultGate() {
  const v = useVault();
  if (v.loading) return null;
  if (v.isUnlocked) return <Dashboard />; // ← unlocked wins, no waiting on status refresh
  if (!v.isInitialized) return <SetupScreen />;
  return <UnlockScreen />;
}
