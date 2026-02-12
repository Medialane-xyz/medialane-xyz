"use client";

import { useRouter } from "next/navigation";
import { useUser, useAuth } from "@clerk/nextjs";
import { useGetWallet } from "@chipi-stack/nextjs";
import Image from "next/image";
import { WalletSummary } from "@/src/components/chipi/wallet-summary";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Separator } from "@/src/components/ui/separator";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { WalletIcon } from "lucide-react";

export default function AccountPage() {
    const { user, isLoaded: isUserLoaded } = useUser();
    const { getToken, userId } = useAuth();
    const router = useRouter();

    const publicKey = user?.publicMetadata?.publicKey as string;

    // Use useGetWallet only if we don't have the key in metadata (fallback)
    const { data: wallet, isLoading: isWalletLoading } = useGetWallet({
        getBearerToken: () => getToken({ template: "chipipay" }).then((t) => t || ""),
        params: {
            externalUserId: userId || "",
        },
        queryOptions: {
            enabled: !!userId && !publicKey,
        },
    });

    const displayWallet = publicKey ? {
        wallet: {
            publicKey: publicKey,
            normalizedPublicKey: publicKey
        }
    } : wallet;

    if (!isUserLoaded) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <div className="text-muted-foreground animate-pulse">Loading Account...</div>
                </div>
            </div>
        );
    }

    if (!userId) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">Sign in to continue</h1>
                <p className="text-muted-foreground max-w-md">Access your wallet and profile by signing in.</p>
                <Button onClick={() => router.push("/sign-in")}>Sign In</Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12 max-w-5xl space-y-10">
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl neon-text">
                    My Account
                </h1>
                <p className="text-lg text-muted-foreground">Manage your decentralized identity and assets.</p>
            </div>

            <Separator className="bg-primary/20" />

            <div className="grid gap-8 md:grid-cols-2 lg:gap-12">
                {/* Visual / Info Section */}
                <div className="space-y-6">
                    <Card className="border-primary/20 bg-background/50 backdrop-blur-sm overflow-hidden h-full">
                        <CardHeader>
                            <CardTitle className="text-xl font-bold text-primary flex items-center gap-2">
                                User Profile
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center justify-center text-center gap-6 py-8">
                            <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-primary/20 shadow-[0_0_20px_rgba(var(--primary),0.3)]">
                                <Image
                                    src={user?.imageUrl || "/placeholder-user.jpg"}
                                    alt={user?.fullName || "User Avatar"}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold">{user?.fullName}</h2>
                                <p className="text-sm font-medium text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
                                    {user?.primaryEmailAddress?.emailAddress}
                                </p>
                            </div>
                            <div className="w-full pt-4">
                                <div className="text-xs text-muted-foreground uppercase tracking-widest mb-2 font-semibold">Verification</div>
                                <div className="flex justify-center gap-2">
                                    <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-green-500/20">Email Verified</Badge>
                                    <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 border-blue-500/20">Clerk Identity</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Wallet Section */}
                <div className="space-y-6">
                    {displayWallet ? (
                        <div className="space-y-4">
                            <WalletSummary
                                normalizedPublicKey={(displayWallet as any).wallet?.normalizedPublicKey || (displayWallet as any)?.wallet?.publicKey || (displayWallet as any).normalizedPublicKey || ""}
                                walletPublicKey={(displayWallet as any).wallet?.publicKey || (displayWallet as any)?.publicKey || ""}
                            />
                            <p className="text-xs text-muted-foreground text-center px-4">
                                Your Chipi Wallet is a smart contract wallet secured by your PIN and passkeys.
                            </p>
                        </div>
                    ) : (
                        <Card className="h-auto border-dashed border-2 border-primary/30 bg-muted/10 p-8 flex flex-col items-center justify-center text-center space-y-4">
                            <div className="p-4 rounded-full bg-primary/10 mb-2">
                                <WalletIcon className="w-8 h-8 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold">No Wallet Found</h3>
                            <p className="text-muted-foreground text-sm max-w-xs">
                                It seems you don't have a wallet yet. Secure your account to get started.
                            </p>
                            <Button onClick={() => router.push("/onboarding")}>
                                Secure Account
                            </Button>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
