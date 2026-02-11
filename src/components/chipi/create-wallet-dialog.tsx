"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/src/components/ui/button";
import {
    DialogHeader,
    Dialog,
    DialogContent,
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
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/src/components/ui/input-otp";
import { Alert, AlertDescription, AlertTitle } from "@/src/components/ui/alert";
import { CheckCircleIcon } from "lucide-react";
import { useCreateWallet, Chain } from "@chipi-stack/nextjs";
import { useAuth, useUser } from "@clerk/nextjs";

const FormSchema = z
    .object({
        pin: z.string().min(4, {
            message: "PIN must be 4 characters.",
        }),
        confirmPin: z.string().min(4, {
            message: "Confirm PIN must be 4 characters.",
        }),
    })
    .refine((data) => data.pin === data.confirmPin, {
        message: "PINs don't match",
        path: ["confirmPin"],
    });

export function CreateWalletDialog({ open, onOpenChange, trigger }: { open?: boolean; onOpenChange?: (open: boolean) => void; trigger?: React.ReactNode }) {
    const { getToken, userId: clerkUserId } = useAuth();
    const { user } = useUser();
    const {
        createWalletAsync,
        isLoading,
        isSuccess,
        data: walletDetails,
    } = useCreateWallet();

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            pin: "",
            confirmPin: "",
        },
    });

    const onSubmit = async (data: z.infer<typeof FormSchema>) => {
        const token = await getToken({ template: "chipipay" });
        if (!token || !clerkUserId) {
            toast.error("Authentication failed");
            return;
        }

        try {
            await createWalletAsync({
                params: {
                    encryptKey: data.pin,
                    externalUserId: clerkUserId,
                    chain: "STARKNET" as Chain,
                },
                bearerToken: token,
            });
            toast.success("Wallet created successfully!");
            form.reset();
            // Optional: Close dialog or refresh parent
        } catch (error) {
            toast.error("Failed to create wallet");
            console.error("Wallet creation error:", error);
        }
    };
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Wallet</DialogTitle>
                    <DialogDescription>
                        Create a PIN to protect your wallet and funds
                    </DialogDescription>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="pin"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Enter PIN</FormLabel>
                                        <FormControl>
                                            <InputOTP maxLength={4} value={field.value} onChange={field.onChange} onBlur={field.onBlur} ref={field.ref}>
                                                <InputOTPGroup>
                                                    <InputOTPSlot index={0} />
                                                    <InputOTPSlot index={1} />
                                                    <InputOTPSlot index={2} />
                                                    <InputOTPSlot index={3} />
                                                </InputOTPGroup>
                                            </InputOTP>
                                        </FormControl>

                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="confirmPin"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirm PIN</FormLabel>
                                        <FormControl>
                                            <InputOTP maxLength={4} value={field.value} onChange={field.onChange} onBlur={field.onBlur} ref={field.ref}>
                                                <InputOTPGroup>
                                                    <InputOTPSlot index={0} />
                                                    <InputOTPSlot index={1} />
                                                    <InputOTPSlot index={2} />
                                                    <InputOTPSlot index={3} />
                                                </InputOTPGroup>
                                            </InputOTP>
                                        </FormControl>

                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button
                                type="submit"
                                disabled={isLoading || isSuccess}
                                className="w-full"
                            >
                                {isLoading
                                    ? "Creating..."
                                    : isSuccess
                                        ? "Wallet Created Successfully!"
                                        : "Create Wallet"}
                            </Button>
                        </form>
                    </Form>
                </DialogHeader>

                <DialogFooter>
                    {/* Wallet Success Details */}
                    {walletDetails && (
                        <Alert>
                            <CheckCircleIcon />
                            <AlertTitle>Wallet Created Successfully!</AlertTitle>
                            <AlertDescription className="space-y-3">
                                {walletDetails.txHash && (
                                    <div>
                                        <p>Transaction Hash:</p>
                                        <span className="break-all">{walletDetails.txHash}</span>
                                    </div>
                                )}

                                <div>
                                    <p>Wallet Public Key:</p>
                                    <span className="break-all">
                                        {(walletDetails as any).publicKey || (walletDetails as any).walletPublicKey}
                                    </span>
                                </div>
                            </AlertDescription>
                        </Alert>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
