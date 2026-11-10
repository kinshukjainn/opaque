import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy || Opaque",
  description: "Privacy Policy of the Opaque application",
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <section className={` antialiased`}>{children}</section>;
}
