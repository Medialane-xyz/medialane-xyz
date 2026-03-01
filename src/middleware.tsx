import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  '/',
  '/about',
  '/mint(.*)',       // events — public
  '/workshop',      // educational — public
  '/onboarding',    // wallet setup
  '/api/proxy(.*)', // existing proxy
  '/create(.*)',    // creator tools
]);

// Paths that don't require a Chipi wallet (API portal is wallet-free)
const isPortalPath = createRouteMatcher([
  '/account(.*)',
  '/api/portal(.*)',
]);

/**
 * Read walletCreated from the JWT session claims — zero Clerk API calls.
 *
 * Requires a custom session token in the Clerk dashboard:
 *   Dashboard → Sessions → Customize session token → add:
 *   { "metadata": "{{user.public_metadata}}" }
 *
 * Once configured, sessionClaims.metadata.walletCreated reflects the value
 * set in publicMetadata and is refreshed on every new session token issue.
 */
function hasWalletClaim(sessionClaims: Record<string, unknown> | null): boolean {
  const metadata = sessionClaims?.metadata as Record<string, unknown> | undefined;
  return metadata?.walletCreated === true;
}

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims, redirectToSignIn } = await auth();

  // Unauthenticated user hitting a private route → sign-in
  if (!userId && !isPublicRoute(req)) {
    return redirectToSignIn({ returnBackUrl: req.url });
  }

  if (userId) {
    const hasWallet = hasWalletClaim(sessionClaims);

    // Already has a wallet and hits /onboarding → send home
    if (hasWallet && req.nextUrl.pathname === "/onboarding") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // No wallet yet → enforce onboarding, except for portal & public routes
    if (!hasWallet && !isPublicRoute(req) && !isPortalPath(req) && req.nextUrl.pathname !== "/onboarding") {
      const onboardingUrl = new URL("/onboarding", req.url);
      onboardingUrl.searchParams.set("redirect_url", req.url);
      return NextResponse.redirect(onboardingUrl);
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
