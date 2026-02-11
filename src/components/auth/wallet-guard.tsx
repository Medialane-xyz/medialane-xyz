"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { useGetWallet } from "@chipi-stack/nextjs";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export function WalletGuard() {
    const { userId, isLoaded, getToken } = useAuth();
    const { user } = useUser();
    const router = useRouter();
    const pathname = usePathname();

    const { data: wallet, isLoading, error } = useGetWallet({
        getBearerToken: () => getToken({ template: "chipipay" }).then(t => t || ""),
        params: { externalUserId: userId || "" },
        queryOptions: {
            enabled: !!userId && isLoaded,
            retry: false,
        }
    });

    useEffect(() => {
        // Only run check if auth is loaded and user is signed in
        if (!isLoaded || !userId) return;

        // Skip check if already on onboarding page to avoid loops
        if (pathname?.startsWith("/onboarding")) return;

        // If wallet loading is finished
        if (!isLoading && user) {
            // If we have an error (likely 404) or no wallet data
            if (error || !wallet) {
                // CRITICAL: Check if Clerk metadata thinks we ALREADY have a wallet.
                // If so, do NOT redirect to onboarding, as that causes a loop with middleware.
                // This likely means an API/SDK issue (404 on existing wallet).
                const hasWalletInMetadata = user.publicMetadata?.walletCreated === true;

                if (hasWalletInMetadata) {
                    console.error("WalletGuard: Wallet missing in SDK but exists in Metadata. Preventing redirect loop.");
                    return;
                }

                console.log("WalletGuard: No wallet found and no metadata, redirecting to onboarding.");
                router.push("/onboarding");
            }
        }
    }, [isLoaded, userId, wallet, isLoading, error, pathname, router, user]);

    return null;
}
