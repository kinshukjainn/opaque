"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigation } from "@/lib/navigation";

// --- MAIN SIDEBAR COMPONENT ---
export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const q = query.trim().toLowerCase();

  const sections = useMemo(() => {
    if (!q) return navigation;
    return navigation
      .map((s) => ({
        ...s,
        items: s.items.filter((i) => i.title.toLowerCase().includes(q)),
      }))
      .filter((s) => s.items.length > 0);
  }, [q]);

  const toggle = (title: string) =>
    setCollapsed((c) => ({ ...c, [title]: !c[title] }));

  const isActive = (slug: string) => {
    const href = `/docs/${slug}`;
    return (
      pathname === href || (slug === "introduction" && pathname === "/docs")
    );
  };

  return (
    <nav className="flex flex-col gap-5 text-sm">
      {/* Search */}
      <div className="relative">
        <svg
          viewBox="0 0 24 24"
          className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-500"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3-3" strokeLinecap="round" />
        </svg>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search docs"
          className="w-full rounded-full border border-neutral-800 bg-neutral-900/60 py-1.5 pl-8 pr-2 text-[13px] text-neutral-200 placeholder:text-neutral-500 outline-none transition-colors focus:border-neutral-600 focus:ring-1 focus:ring-neutral-600"
        />
      </div>

      {/* Sections */}
      <div className="flex flex-col gap-4">
        {sections.map((section) => {
          const open = q ? true : !collapsed[section.title];
          return (
            <div key={section.title}>
              <button
                onClick={() => toggle(section.title)}
                className="flex w-full items-center justify-between px-2.5 py-1 text-[12px] font-bold  tracking-wider text-green-500 transition-colors hover:text-green-300"
              >
                {section.title}
                <svg
                  viewBox="0 0 24 24"
                  className={`h-4 w-4 transition-transform ${open ? "" : "-rotate-90"}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path
                    d="m6 9 6 6 6-6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              {open && (
                <ul className="mt-1 flex flex-col gap-0.5">
                  {section.items.map((item) => {
                    const active = isActive(item.slug);
                    return (
                      <li key={item.slug} className="relative">
                        {active && (
                          <span className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-blue-400" />
                        )}
                        <Link
                          href={`/docs/${item.slug}`}
                          aria-current={active ? "page" : undefined}
                          onClick={onNavigate}
                          className={`block rounded-xs px-2.5 py-1.5 text-[14px] transition-colors ${
                            active
                              ? "bg-neutral-800/70 font-medium text-blue-400"
                              : "text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200"
                          }`}
                        >
                          {item.title}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}

        {sections.length === 0 && (
          <p className="px-2.5 text-[13px] text-neutral-500">No results.</p>
        )}
      </div>
    </nav>
  );
}

// --- MOBILE NAVIGATION WRAPPER ---
export function MobileDocsNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Track the previous pathname in state
  const [prevPathname, setPrevPathname] = useState(pathname);

  // React-recommended pattern: Update state during render when a prop/URL changes.
  // This avoids the double-render penalty of useEffect.
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setIsOpen(false);
  }

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* Sticky Mobile Header */}
      <div
        className="sticky z-40 -mx-4 flex items-center justify-between border-b border-neutral-800/60 bg-neutral-950/80 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6 md:hidden"
        style={{ top: "var(--header-h)" }}
      >
        <span className="text-sm font-semibold text-neutral-200">
          Documentation
        </span>
        <button
          onClick={() => setIsOpen(true)}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-neutral-800 bg-neutral-900 text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white"
          aria-label="Open documentation menu"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex md:hidden"
          style={{ top: "var(--header-h)" }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative flex w-4/5 max-w-xs flex-col bg-neutral-950 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800/60 px-4 py-3 sm:px-6">
              <span className="text-sm font-bold text-white">Menu</span>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-neutral-400 hover:text-white"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:px-6">
              <Sidebar onNavigate={() => setIsOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
