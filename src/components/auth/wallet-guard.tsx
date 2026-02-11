"use client";

import { useAuth } from "@clerk/nextjs";
import { useGetWallet } from "@chipi-stack/nextjs";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export function WalletGuard() {
    const { userId, isLoaded, getToken } = useAuth();
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
        if (!isLoading) {
            // If we have an error (likely 404) or no wallet data, redirect
            // We assume that if useGetWallet fails for a logged in user, they need a wallet
            if (error || !wallet) {
                // Double check specific error if possible, but for now assuming error = 404/missing
                console.log("WalletGuard: No wallet found, redirecting to onboarding.");
                router.push("/onboarding");
            }
        }
    }, [isLoaded, userId, wallet, isLoading, error, pathname, router]);

    return null;
}
