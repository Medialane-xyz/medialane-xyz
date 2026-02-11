"use client";

import { useState, useCallback } from "react";
import { Button } from "@/src/components/ui/button";
import { toast } from "sonner";

import { useAuth } from "@clerk/nextjs";
import {
    useRecordSendTransaction,
    useTransfer,
    ChainToken,
    Chain,
    useGetWallet,
    STARKNET_CONTRACTS
} from "@chipi-stack/nextjs";
import { WalletPinDialog } from "./wallet-pin-dialog";
import { useSession } from "./session-context";

export function PayWithChipiButton({ usdAmount }: { usdAmount: number }) {
    const {
        hasActiveSession,
        activateSession,
        executeWithSession,
        isExecutingSession,
        isLoadingSession
    } = useSession();

    // We still need wallet data to construct the call if needed, 
    // but executeWithSession abstracts some of it. 
    // Wait, executeWithSession takes `calls`. We need to construct the transfer call.
    // The `useTransfer` hook abstracted this. Now we need to manually build the call?
    // Or we use `useTransfer` inside session context?
    // `executeWithSession` executes `Call[]`.
    // We need to know the USDC contract address and entrypoint.

    // Re-reading `useChipiSession` docs in d.ts:
    // "Execute calls using the session key"

    // We need the USDC contract address. 
    // `STARKNET_CONTRACTS` from `@chipi-stack/types` might help.

    const [pinOpen, setPinOpen] = useState(false);

    const handlePay = async () => {
        if (hasActiveSession) {
            await runSessionPayment();
        } else {
            setPinOpen(true);
        }
    }

    const runSessionPayment = async () => {
        const merchantWalletPublicKey = process.env.NEXT_PUBLIC_MERCHANT_WALLET || "";
        if (!merchantWalletPublicKey) {
            toast.error("Merchant wallet not configured");
            return;
        }

        try {
            // Get USDC contract address for current network (defaulting to USDC for now)
            const tokenConfig = STARKNET_CONTRACTS.USDC;
            // Note: In a real app, check process.env.NEXT_PUBLIC_STARKNET_NETWORK for mainnet/sepolia switch 
            // if the SDK doesn't handle it automatically in the constant.
            // STARKNET_CONTRACTS usually has mainnet defaults.

            // Calculate amount in base units (6 decimals for USDC)
            const decimals = tokenConfig.decimals;
            const amountInBaseUnits = Math.floor(usdAmount * Math.pow(10, decimals));
            const amountUint256 = amountInBaseUnits.toString();

            // Construct Starknet Call
            const call = {
                contractAddress: tokenConfig.contractAddress,
                entrypoint: "transfer",
                calldata: [merchantWalletPublicKey, amountUint256, "0"] // u256 is low, high
            };

            await executeWithSession([call]);
            toast.success("Payment complete (Gasless) ✨");
        } catch (e) {
            console.error("Payment failed", e);
            toast.error("Payment failed. Please try again.");
        }
    };

    return (
        <>
            <Button
                onClick={handlePay}
                disabled={isExecutingSession || isLoadingSession}
            >
                {isExecutingSession
                    ? "Processing..."
                    : hasActiveSession ? "Pay Instant (Gasless)" : "Pay with Chipi Wallet"}
            </Button>

            <WalletPinDialog
                open={pinOpen}
                onCancel={() => setPinOpen(false)}
                onSubmit={async (pin) => {
                    setPinOpen(false);
                    await activateSession(pin);
                    setTimeout(() => runSessionPayment(), 500); // Small delay to ensuring session is ready
                }}
            />
        </>
    );
}
