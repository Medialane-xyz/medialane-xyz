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

export function PayWithChipiButton({ usdAmount }: { usdAmount: number }) {
    const { getToken, userId: clerkUserId } = useAuth();
    const [pinOpen, setPinOpen] = useState(false);

    const { transferAsync, isLoading: loadingTransfer } = useTransfer();
    const { recordSendTransactionAsync, isLoading: loadingRecord } =
        useRecordSendTransaction();

    const { data: customerWallet } = useGetWallet({
        getBearerToken: () => getToken({ template: "chipipay" }).then(t => t || ""),
        params: {
            externalUserId: clerkUserId || "",
        },
    });

    const runPayment = useCallback(
        async (pin: string) => {
            if (!customerWallet) {
                toast.error("Customer wallet not found");
                return;
            }
            const merchantWalletPublicKey =
                process.env.NEXT_PUBLIC_MERCHANT_WALLET || "";
            if (!merchantWalletPublicKey) {
                toast.error("Merchant wallet is not configured");
                return;
            }

            try {
                const jwtToken = await getToken({ template: "chipipay" });
                if (!jwtToken) {
                    toast.error("No token found");
                    return;
                }

                const transactionHash = await transferAsync({
                    params: {
                        amount: usdAmount,
                        encryptKey: pin,
                        wallet: {
                            publicKey: customerWallet.walletPublicKey,
                            encryptedPrivateKey: customerWallet.encryptedPrivateKey || "",
                        },
                        token: "USDC" as ChainToken,
                        recipient: merchantWalletPublicKey,
                    },
                    bearerToken: jwtToken,
                });

                const recordSendTransactionParams = {
                    transactionHash,
                    chain: "STARKNET" as Chain,
                    expectedSender: customerWallet.walletPublicKey,
                    expectedRecipient: merchantWalletPublicKey,
                    expectedToken: "USDC" as ChainToken,
                    expectedAmount: usdAmount.toString(),
                };

                const sendTx = await recordSendTransactionAsync({
                    params: recordSendTransactionParams,
                    bearerToken: jwtToken,
                });

                console.log("succesful record send transaction:", sendTx);
                toast.success("Payment complete ✨", { position: "bottom-center" });
            } catch (err: unknown) {
                console.error("Error in pay with chipi button:", err);
                const msg =
                    (typeof err === "string" && err) ||
                    (err instanceof Error
                        ? err.message
                        : "Something went wrong. Please try again.");
                toast.error(msg, { position: "bottom-center" });
            }
        },
        [
            usdAmount,
            customerWallet,
            getToken,
            recordSendTransactionAsync,
            transferAsync,
        ]
    );

    return (
        <>
            <Button
                onClick={() => setPinOpen(true)}
                disabled={loadingTransfer || loadingRecord}
            >
                {loadingTransfer || loadingRecord
                    ? "Loading..."
                    : "Pay with Chipi Wallet"}
            </Button>

            <WalletPinDialog
                open={pinOpen}
                onCancel={() => setPinOpen(false)}
                onSubmit={async (pin) => {
                    setPinOpen(false); // close first (no API change to dialog)
                    await runPayment(pin); // then run payment
                }}
            />
        </>
    );
}
