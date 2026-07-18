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
          className="w-full rounded-xl border border-neutral-800 bg-neutral-900/10  backdrop-blur-xs py-3 pl-8 pr-2 text-[15px] text-white  outline-none "
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
                className="flex w-full items-center justify-between px-2.5 py-1/2 text-[15px] font-medium  tracking-wider text-white transition-colors  cursor-pointer"
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
                <ul className="mt-1 flex flex-col gap-1">
                  {section.items.map((item) => {
                    const active = isActive(item.slug);
                    return (
                      <li key={item.slug} className="relative">
                        <Link
                          href={`/docs/${item.slug}`}
                          aria-current={active ? "page" : undefined}
                          onClick={onNavigate}
                          className={`block rounded-full px-2.5 py-1.5 text-[16px] transition-colors ${
                            active
                              ? "  font-semibold text-green-500 "
                              : "text-neutral-200 hover:underline"
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
        className="sticky z-40 -mx-4 flex items-center justify-between   bg-[#191623] border-b border-[#444444] px-4 py-3  sm:-mx-6 sm:px-6 md:hidden"
        style={{ top: "var(--header-h)" }}
      >
        <span className="text-lg font-medium text-neutral-100">
          Opaque Documentation/Blogs
        </span>
        <button
          onClick={() => setIsOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-xl cursor-pointer  bg-green-800 text-neutral-100 transition-colors  hover:text-white"
          aria-label="Open documentation menu"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="white"
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
            className="absolute inset-0 bg-black/10 backdrop-blur-xs "
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative flex w-4/5 max-w-xs flex-col bg-[#161923]  shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800/60 px-4 py-3 sm:px-6">
              <span className="text-3xl font-normal text-white">Menu</span>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 bg-green-800 rounded-xl cursor-pointer text-neutral-100 hover:text-white"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="white"
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
