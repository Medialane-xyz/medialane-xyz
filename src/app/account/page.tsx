"use client";

import { useUser, useAuth } from "@clerk/nextjs";
import { useGetWallet } from "@chipi-stack/nextjs";
import Image from "next/image";
import { WalletSummary } from "@/src/components/chipi/wallet-summary";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Separator } from "@/src/components/ui/separator";

export default function AccountPage() {
    const { user, isLoaded: isUserLoaded } = useUser();
    const { getToken, userId } = useAuth();

    const { data: wallet, isLoading: isWalletLoading } = useGetWallet({
        getBearerToken: () => getToken({ template: "chipipay" }).then((t) => t || ""),
        params: {
            externalUserId: userId || "",
        },
        queryOptions: {
            enabled: !!userId,
        },
    });

    if (!isUserLoaded || isWalletLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="animate-pulse text-xl text-primary font-bold">Loading Account...</div>
            </div>
        );
    }

    if (!userId) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                <h1 className="text-2xl font-bold">Please sign in to view your account</h1>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl neon-text">
                    Account
                </h1>
                <p className="text-muted-foreground">Manage your profile and wallet settings.</p>
            </div>

            <Separator className="bg-primary/20" />

            <div className="grid gap-6 md:grid-cols-2">
                {/* User Profile Section */}
                <Card className="h-full border-primary/20 bg-background/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold text-primary">Profile</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center text-center gap-4">
                        <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-primary shadow-[0_0_15px_rgba(var(--primary),0.5)]">
                            <Image
                                src={user?.imageUrl || "/placeholder-user.jpg"}
                                alt={user?.fullName || "User Avatar"}
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div className="space-y-1">
                            <h2 className="text-2xl font-bold">{user?.fullName}</h2>
                            <p className="text-sm text-muted-foreground">{user?.primaryEmailAddress?.emailAddress}</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Wallet Section */}
                <Card className="h-full border-primary/20 bg-background/50 backdrop-blur-sm overflow-hidden">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold text-primary">Wallet</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {wallet ? (
                            <WalletSummary
                                normalizedPublicKey={(wallet as any).walletPublicKey}
                                walletPublicKey={(wallet as any).walletPublicKey}
                            />
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <p>Redirecting to wallet setup...</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
