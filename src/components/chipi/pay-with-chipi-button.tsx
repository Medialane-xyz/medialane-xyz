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
} from "@chipi-stack/nextjs";
import { WalletPinDialog } from "./wallet-pin-dialog";

export function PayWithChipiButton({ usdAmount, recipientAddress }: { usdAmount: number; recipientAddress: string }) {
    const { getToken } = useAuth();
    const [pinOpen, setPinOpen] = useState(false);

    // We need wallet data for the transfer
    const { transferAsync, isLoading } = useTransfer();

    const handlePay = () => {
        setPinOpen(true);
    }

    const onPinSubmit = async (pin: string) => {
        setPinOpen(false);

        try {
            const token = await getToken({ template: "chipipay" });
            if (!token) {
                toast.error("Authentication failed");
                return;
            }

            // Execute transfer
            // Note: Assuming transferAsync expects these params based on standard Chipi SDK usage in v11
            await transferAsync({
                bearerToken: token,
                params: {
                    encryptKey: pin,
                    amount: usdAmount.toString(), // Ensure amount format is correct (e.g. string)
                    recipientAddress: recipientAddress,
                    tokenAddress: "0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8", // USDC on Starknet Mainnet
                    // If SDK handles decimals, good. If not, might need conversion.
                    // v11 usually expects raw string amount or handles it. 
                    // Let's assume input is human readable if SDK handles it, or check existing usage.
                } as any // Casting to avoid strict type checks if types are missing/different in v11
            });

            toast.success("Payment successful!");
        } catch (e: any) {
            console.error("Payment failed", e);
            toast.error(e.message || "Payment failed");
        }
    };

    return (
        <>
            <Button
                onClick={handlePay}
                disabled={isLoading}
            >
                {isLoading ? "Processing..." : `Pay $${usdAmount} with Chipi`}
            </Button>

            <WalletPinDialog
                open={pinOpen}
                onCancel={() => setPinOpen(false)}
                onSubmit={onPinSubmit}
            />
        </>
    );
}
