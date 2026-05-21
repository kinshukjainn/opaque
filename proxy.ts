// ============================================================
//  proxy.ts   (Next.js 16 — REPLACES middleware.ts)
// ------------------------------------------------------------
//  This is the Next.js 16 rename of middleware.ts. Delete the old
//  middleware.ts — keeping both is unnecessary and the old name is
//  deprecated. Clerk's clerkMiddleware() code is identical to the
//  middleware version; only the filename changed.
//
//  Pattern: everything is PROTECTED unless it's in isPublicRoute.
//  So /vault(.*) and /api/vault(.*) require a Clerk session by
//  default (Layer 1). Layer 2 — the vault being *unlocked* — is
//  enforced client-side in VaultGate, since only the browser holds
//  the in-memory Vault Key.
// ============================================================

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/about-us(.*)",
  "/pricing(.*)",
  "/docs(.*)",
  "/integrations(.*)",
  "/architecture(.*)",
  "/checker(.*)", // public password-strength tool — move out of public if it should be gated
  "/git-track(.*)",
  "/terms-of-service(.*)",
  "/privacy-policy(.*)",
  // Clerk auth flow pages
  "/sso-callback(.*)",
  "/verify-regis(.*)",
  // Webhook is svix-signed, must stay public (no Clerk session)
  "/api/webhooks(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files unless referenced in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|mp4|webm|mov|m4v|ogg|ogv|mp3|wav|flac|aac)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
    // Always run for Clerk's frontend API routes
    "/__clerk/(.*)",
  ],
};
