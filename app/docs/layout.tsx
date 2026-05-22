import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Documentation ",
  description: "Explanation detailed documentation of endvault application",
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <section className={` antialiased`}>{children}</section>;
}
