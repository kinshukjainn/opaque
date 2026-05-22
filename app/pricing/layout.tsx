import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Pricing of the endvault application",
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <section className={` antialiased`}>{children}</section>;
}
