// components/matte-grid-background.tsx
import type { CSSProperties } from "react";

/* ──────────────────────────────────────────────────────────────
   Radial mask — fades the grid out toward the edges so it never
   looks like a cheap tiled pattern.
   ────────────────────────────────────────────────────────────── */
const GRID_MASK =
  "radial-gradient(ellipse 78% 68% at 50% 32%, #000 20%, rgba(0,0,0,0.6) 58%, transparent 100%)";

/* ──────────────────────────────────────────────────────────────
   Film grain — an inline SVG turbulence texture. This is the
   single biggest contributor to the "matte" feel: it kills
   banding in the gradients and gives the surface a physical,
   paper-like micro-texture.
   ────────────────────────────────────────────────────────────── */
const GRAIN_URL = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E")`;

export interface MatGridBackgroundProps {
  /** Extra classes forwarded to the root element. */
  className?: string;
  style?: CSSProperties;
  /** Size of a small grid cell, in px. Major lines appear every 4 cells. */
  cellSize?: number;
  /** Pin to the viewport (true) or fill the nearest positioned parent (false). */
  fixed?: boolean;
  grid?: boolean;
  grain?: boolean;
  glow?: boolean;
}

export function MatGridBackground({
  className = "",
  style,
  cellSize = 32,
  fixed = true,
  grid = true,
  grain = true,
  glow = true,
}: MatGridBackgroundProps) {
  const majorSize = cellSize * 4;

  return (
    <div
      aria-hidden="true"
      className={[
        "pointer-events-none select-none overflow-hidden",
        fixed ? "fixed" : "absolute",
        "inset-0 -z-10",
        // Grid colour tokens — flipped by the `dark` class on <html>
        "[--grid-fine:rgba(15,23,42,0.055)] [--grid-major:rgba(15,23,42,0.10)]",
        "dark:[--grid-fine:rgba(255,255,255,0.05)] dark:[--grid-major:rgba(255,255,255,0.09)]",
        className,
      ].join(" ")}
      style={
        {
          "--cell": `${cellSize}px`,
          "--major": `${majorSize}px`,
          ...style,
        } as CSSProperties
      }
    >
      {/* 1 · Flat matte base */}
      <div className="absolute inset-0 bg-[#f6f7f8] dark:bg-[#08090b]" />

      {/* 2 · Diffuse top light — soft, no specular highlight */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_-15%,rgba(255,255,255,0.95),rgba(255,255,255,0)_60%)] dark:bg-[radial-gradient(120%_90%_at_50%_-15%,rgba(255,255,255,0.07),rgba(255,255,255,0)_60%)]" />

      {/* 3 · Desaturated ambient tints (kept very low for a matte look) */}
      {glow && (
        <>
          <div className="absolute -left-[18%] -top-[22%] h-[42rem] w-[42rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.10),transparent_70%)] dark:bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.14),transparent_70%)]" />
          <div className="absolute -right-[18%] top-[28%] h-[38rem] w-[38rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(20,184,166,0.08),transparent_70%)] dark:bg-[radial-gradient(circle_at_center,rgba(45,212,191,0.09),transparent_70%)]" />
        </>
      )}

      {/* 4 · The grid: fine lines + major lines, radially masked */}
      {grid && (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: [
              "linear-gradient(to right, var(--grid-fine) 1px, transparent 1px)",
              "linear-gradient(to bottom, var(--grid-fine) 1px, transparent 1px)",
              "linear-gradient(to right, var(--grid-major) 1px, transparent 1px)",
              "linear-gradient(to bottom, var(--grid-major) 1px, transparent 1px)",
            ].join(","),
            backgroundSize: [
              "var(--cell) var(--cell)",
              "var(--cell) var(--cell)",
              "var(--major) var(--major)",
              "var(--major) var(--major)",
            ].join(","),
            maskImage: GRID_MASK,
            WebkitMaskImage: GRID_MASK,
          }}
        />
      )}

      {/* 5 · Grain / matte texture */}
      {grain && (
        <div
          className="absolute inset-0 opacity-[0.04] dark:opacity-[0.07]"
          style={{ backgroundImage: GRAIN_URL, backgroundSize: "200px 200px" }}
        />
      )}

      {/* 6 · Vignette — pulls focus to the centre */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(15,23,42,0.06)_100%)] dark:bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(0,0,0,0.55)_100%)]" />

      {/* 7 · Hairline top edge for that finished, framed feel */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-black/10 to-transparent dark:via-white/10" />
    </div>
  );
}
