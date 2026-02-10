"use client";

import { useState } from "react";
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
    DialogFooter,
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
import { Alert, AlertDescription, AlertTitle } from "@/src/components/ui/alert";
import { CheckCircleIcon } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { useBuySku, useGetWallet } from "@chipi-stack/nextjs";
import type { Sku } from "@chipi-stack/nextjs";
import { WalletPinDialog } from "@/src/components/chipi/wallet-pin-dialog";
import type { ControllerRenderProps } from "react-hook-form";

const FormSchema = z.object({
    amount: z.string().optional(),
});

type FormValues = z.infer<typeof FormSchema>;

export function BuySkuDialog({ sku }: { sku: Sku }) {
    const { getToken, userId: clerkUserId } = useAuth();
    const [pinOpen, setPinOpen] = useState(false);
    const [formData, setFormData] = useState<FormValues | null>(null);

    const { data: wallet } = useGetWallet({
        getBearerToken: () => getToken({ template: "chipipay" }).then(t => t || ""),
        params: {
            externalUserId: clerkUserId || "",
        },
    });

    const { buySkuAsync, isLoading, isSuccess, data: purchaseDetails } = useBuySku();

    const form = useForm<FormValues>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            amount: sku.fixedAmount?.toString() || "",
        },
    });

    const onSubmit = async (data: FormValues) => {
        setFormData(data);
        setPinOpen(true);
    };

    const handlePinSubmit = async (pin: string) => {
        setPinOpen(false);

        const token = await getToken({ template: "chipipay" });
        if (!token || !clerkUserId || !wallet) {
            toast.error("Authentication failed");
            return;
        }

        try {
            await buySkuAsync({
                params: {
                    skuId: sku.id,
                    encryptKey: pin,
                    wallet: {
                        publicKey: wallet.walletPublicKey,
                        encryptedPrivateKey: wallet.encryptedPrivateKey || "",
                    },
                    amount: formData?.amount ? parseFloat(formData.amount) : sku.fixedAmount,
                },
                bearerToken: token,
            });
            toast.success("Purchase successful!");
            form.reset();
        } catch (error) {
            toast.error("Failed to complete purchase");
            console.error("Purchase error:", error);
        }
    };

    return (
        <>
            <Dialog>
                <DialogTrigger asChild>
                    <Button>Buy Now</Button>
                </DialogTrigger>

                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Buy {sku.name}</DialogTitle>
                        <DialogDescription>
                            Complete your purchase with your Chipi Wallet
                        </DialogDescription>
                    </DialogHeader>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            {!sku.fixedAmount && (
                                <FormField
                                    control={form.control}
                                    name="amount"
                                    render={({ field }: { field: ControllerRenderProps<FormValues, "amount"> }) => (
                                        <FormItem>
                                            <FormLabel>Amount</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.01" placeholder="0.00" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                            {sku.fixedAmount && (
                                <p className="text-lg font-bold">
                                    Price: ${sku.fixedAmount} MXN
                                </p>
                            )}

                            <Button
                                type="submit"
                                disabled={isLoading || isSuccess}
                                className="w-full"
                            >
                                {isLoading
                                    ? "Processing..."
                                    : isSuccess
                                        ? "Purchase Complete!"
                                        : "Confirm Purchase"}
                            </Button>
                        </form>
                    </Form>

                    <DialogFooter>
                        {purchaseDetails && (
                            <Alert>
                                <CheckCircleIcon />
                                <AlertTitle>Purchase Successful!</AlertTitle>
                                <AlertDescription className="space-y-3">
                                    <div>
                                        <p>Transaction Hash:</p>
                                        <span className="break-all">{purchaseDetails.txHash}</span>
                                    </div>
                                </AlertDescription>
                            </Alert>
                        )}
                    </DialogFooter>
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
