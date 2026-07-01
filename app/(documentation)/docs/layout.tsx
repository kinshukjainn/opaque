import { Sidebar, MobileDocsNav } from "@/app/components/docs/Sidebar";
import "highlight.js/styles/github-dark.css";

// 👇 set this to your parent header's actual height
const HEADER_HEIGHT = "72px";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen bg-[#161923] text-neutral-200"
      style={
        {
          "--header-h": HEADER_HEIGHT,
          // 1. ADDED: This pushes the entire layout down so it never hides under the fixed header
          paddingTop: "var(--header-h)",
        } as React.CSSProperties
      }
    >
      <div className="mx-auto flex max-w-7xl flex-col px-4 sm:px-6 md:flex-row md:gap-8 lg:gap-12 lg:px-8">
        <MobileDocsNav />

        <aside
          className="sticky hidden h-[calc(100vh-var(--header-h))] w-56 shrink-0 overflow-y-auto border-r border-neutral-800/60 py-8 pr-4 md:block lg:w-64"
          // This keeps it pinned exactly beneath the header when you scroll
          style={{ top: "var(--header-h)" }}
        >
          <Sidebar />
        </aside>

        {/* 2. CHANGED: Removed the complex pt-[calc(...)] here since the parent wrapper now handles the header height */}
        <main className="min-w-0 flex-1 pb-24 pt-8">
          <div className="mx-auto max-w-3xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
