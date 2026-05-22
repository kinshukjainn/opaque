import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Only these require a session. Everything else (/, /verify-regis,
// /api/webhooks/clerk, marketing pages) stays public.
const isProtected = createRouteMatcher(["/vault(.*)", "/api/vault(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtected(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Run on everything except Next internals/static files — this broad
    // matcher is REQUIRED so the dev session handshake (__clerk_db_jwt)
    // gets processed on every navigation. A narrow matcher causes the loop.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
