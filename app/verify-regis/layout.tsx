import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login / Signup || Opaque",
  description: "Login or signup for the Opaque application",
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <section className={` antialiased`}>{children}</section>;
}
