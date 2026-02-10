"use client";

import { useGetTokenBalance, Chain, ChainToken } from "@chipi-stack/nextjs";
import { useAuth } from "@clerk/nextjs";

export function UsdcBalance({ walletPublicKey }: { walletPublicKey: string }) {
    const { getToken } = useAuth();
    const { data: usdcBalance } = useGetTokenBalance({
        params: {
            chain: "STARKNET" as Chain,
            chainToken: "USDC" as ChainToken,
            walletPublicKey,
        },
        getBearerToken: () => getToken({ template: "chipipay" }).then(t => t || ""),
    });

    return (
        <p className="text-8xl">
            {!isNaN(Number(usdcBalance?.balance))
                ? `$${Number(usdcBalance?.balance).toFixed(2)}`
                : "$0.00"}
        </p>
    );
}
