import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Integration",
  description: "All the integration listed with Opaque ",
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <section className={` antialiased`}>{children}</section>;
}
