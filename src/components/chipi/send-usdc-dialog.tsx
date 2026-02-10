"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/src/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
} from "@/src/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import { useAuth } from "@clerk/nextjs";
import { useTransfer, useGetWallet, ChainToken } from "@chipi-stack/nextjs";
import { useState } from "react";
import { WalletPinDialog } from "./wallet-pin-dialog";
import type { ControllerRenderProps } from "react-hook-form";

const FormSchema = z.object({
    recipient: z.string().min(1, {
        message: "Recipient address is required.",
    }),
    amount: z.string().min(1, {
        message: "Amount is required.",
    }),
});

type FormValues = z.infer<typeof FormSchema>;

export function SendUsdcDialog() {
    const { getToken, userId: clerkUserId } = useAuth();
    const [pinOpen, setPinOpen] = useState(false);
    const [formData, setFormData] = useState<FormValues | null>(null);

    const { data: wallet } = useGetWallet({
        getBearerToken: () => getToken({ template: "chipipay" }).then(t => t || ""),
        params: {
            externalUserId: clerkUserId || "",
        },
    });

    const { transferAsync, isLoading } = useTransfer();

    const form = useForm<FormValues>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            recipient: "",
            amount: "",
        },
    });

    const onSubmit = async (data: FormValues) => {
        setFormData(data);
        setPinOpen(true);
    };

    const handlePinSubmit = async (pin: string) => {
        setPinOpen(false);

        if (!formData || !wallet) {
            toast.error("Missing data");
            return;
        }

        const token = await getToken({ template: "chipipay" });
        if (!token) {
            toast.error("Authentication failed");
            return;
        }

        try {
            await transferAsync({
                params: {
                    amount: parseFloat(formData.amount),
                    encryptKey: pin,
                    wallet: {
                        publicKey: wallet.walletPublicKey,
                        encryptedPrivateKey: wallet.encryptedPrivateKey || "",
                    },
                    token: "USDC" as ChainToken,
                    recipient: formData.recipient,
                },
                bearerToken: token,
            });
            toast.success("USDC sent successfully!");
            form.reset();
        } catch (error) {
            toast.error("Failed to send USDC");
            console.error("Transfer error:", error);
        }
    };

    return (
        <>
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="outline">Send USDC</Button>
                </DialogTrigger>

                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Send USDC</DialogTitle>
                        <DialogDescription>
                            Send USDC to another Starknet wallet
                        </DialogDescription>
                    </DialogHeader>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="recipient"
                                render={({ field }: { field: ControllerRenderProps<FormValues, "recipient"> }) => (
                                    <FormItem>
                                        <FormLabel>Recipient Address</FormLabel>
                                        <FormControl>
                                            <Input placeholder="0x..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="amount"
                                render={({ field }: { field: ControllerRenderProps<FormValues, "amount"> }) => (
                                    <FormItem>
                                        <FormLabel>Amount (USDC)</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" placeholder="0.00" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button type="submit" disabled={isLoading} className="w-full">
                                {isLoading ? "Sending..." : "Send USDC"}
                            </Button>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            <WalletPinDialog
                open={pinOpen}
                onCancel={() => setPinOpen(false)}
                onSubmit={handlePinSubmit}
            />
        </>
    );
}
