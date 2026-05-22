import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About us ",
  description: "About the endvault creator and application",
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <section className={` antialiased`}>{children}</section>;
}
