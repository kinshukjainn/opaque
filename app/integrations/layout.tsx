import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Architecture : Your password manager",
  description: "Explaination of archietecture of application",
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <section className={` antialiased`}>{children}</section>;
}
