import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions || Opaque",
  description: "Terms & Conditions of the Opaque application",
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <section className={` antialiased`}>{children}</section>;
}
