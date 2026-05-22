import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Strength Checker",
  description: "Check your password strength easily",
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <section className={` antialiased`}>{children}</section>;
}
