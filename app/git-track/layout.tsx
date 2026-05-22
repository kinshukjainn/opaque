import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Logs",
  description: "Logs of updates in the endavult application",
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <section className={` antialiased`}>{children}</section>;
}
