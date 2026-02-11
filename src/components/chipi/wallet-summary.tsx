import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { CopyIcon, LockIcon, UnlockIcon, QrCodeIcon, WalletIcon, ShieldCheckIcon, ClockIcon } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/src/components/ui/card";
import { UsdcBalance } from "@/src/components/chipi/usdc-balance";
import { useSession } from "@/src/components/chipi/session-context";
import { WalletPinDialog } from "@/src/components/chipi/wallet-pin-dialog";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/src/components/ui/dialog";
import { Badge } from "@/src/components/ui/badge";
import { Separator } from "@/src/components/ui/separator";

export function WalletSummary({
    normalizedPublicKey,
    walletPublicKey,
}: {
    normalizedPublicKey: string;
    walletPublicKey: string;
}) {
    const { hasActiveSession, session, activateSession, clearSession } = useSession();
    const [pinOpen, setPinOpen] = useState(false);
    const [receiveOpen, setReceiveOpen] = useState(false);

    const shortWallet = normalizedPublicKey
        ? `${normalizedPublicKey.slice(0, 8)}...${normalizedPublicKey.slice(-6)}`
        : "";

    const copyFullWallet = async () => {
        if (!normalizedPublicKey) return;
        await navigator.clipboard.writeText(normalizedPublicKey);
        toast.success("Address copied to clipboard");
    };

    const handleUnlock = () => {
        setPinOpen(true);
    };

    const handleLock = () => {
        clearSession();
        toast.info("Session locked");
    };

    // Calculate time remaining if session exists
    const getSessionExpiry = () => {
        if (!session?.validUntil) return null;
        const expiry = new Date(session.validUntil * 1000);
        return expiry.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <Card className="border-primary/20 bg-background/40 backdrop-blur-md shadow-xl overflow-hidden">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-full bg-primary/10 border border-primary/20">
                            <WalletIcon className="w-5 h-5 text-primary" />
                        </div>
                        <CardTitle className="text-xl font-bold">Chipi Wallet</CardTitle>
                    </div>
                    <Badge variant={hasActiveSession ? "default" : "outline"} className={hasActiveSession ? "bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20" : "text-muted-foreground"}>
                        {hasActiveSession ? (
                            <div className="flex items-center gap-1">
                                <span className="relative flex h-2 w-2 mr-1">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                                Session Active
                            </div>
                        ) : "Session Locked"}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Balance Section */}
                <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Available Balance</p>
                    <UsdcBalance walletPublicKey={walletPublicKey} />
                </div>

                <Separator className="bg-primary/10" />

                {/* Actions Grid */}
                <div className="grid grid-cols-2 gap-3">
                    <Dialog open={receiveOpen} onOpenChange={setReceiveOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="h-auto py-4 flex flex-col gap-2 border-primary/20 hover:bg-primary/5">
                                <QrCodeIcon className="w-5 h-5 mb-1" />
                                <span>Receive</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-xl border-primary/20">
                            <DialogHeader>
                                <DialogTitle>Receive Assets</DialogTitle>
                                <DialogDescription>
                                    Share your wallet address to receive payments.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="flex flex-col items-center gap-6 py-4">
                                <div className="p-4 bg-white rounded-xl shadow-lg">
                                    {/* Placeholder for QR Code since we aren't adding dependencies */}
                                    <div className="w-48 h-48 bg-neutral-100 rounded flex items-center justify-center text-neutral-400 text-sm p-4 text-center border-2 border-dashed">
                                        Scan address (QR Code Placeholder)
                                    </div>
                                </div>
                                <div className="w-full space-y-2">
                                    <p className="text-sm font-medium text-muted-foreground text-center">Wallet Address</p>
                                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-primary/10">
                                        <code className="text-xs flex-1 break-all font-mono text-muted-foreground">
                                            {normalizedPublicKey}
                                        </code>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={copyFullWallet}>
                                            <CopyIcon className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>

                    {hasActiveSession ? (
                        <Button
                            variant="outline"
                            className="h-auto py-4 flex flex-col gap-2 border-red-500/20 text-red-500 hover:bg-red-500/10 hover:text-red-400"
                            onClick={handleLock}
                        >
                            <LockIcon className="w-5 h-5 mb-1" />
                            <span>Lock Session</span>
                        </Button>
                    ) : (
                        <Button
                            variant="outline"
                            className="h-auto py-4 flex flex-col gap-2 border-green-500/20 text-green-500 hover:bg-green-500/10 hover:text-green-400"
                            onClick={handleUnlock}
                        >
                            <UnlockIcon className="w-5 h-5 mb-1" />
                            <span>Unlock Session</span>
                        </Button>
                    )}
                </div>

                {/* Session Info */}
                {hasActiveSession && (
                    <div className="rounded-lg bg-primary/5 border border-primary/10 p-3 text-xs text-muted-foreground space-y-1">
                        <div className="flex items-center gap-2 text-primary font-medium">
                            <ShieldCheckIcon className="w-3 h-3" />
                            Gasless Transactions Enabled
                        </div>
                        <div className="flex items-center gap-2">
                            <ClockIcon className="w-3 h-3" />
                            Auto-lock at {getSessionExpiry()}
                        </div>
                    </div>
                )}
            </CardContent>

            <CardFooter className="bg-muted/20 border-t border-primary/10 py-3">
                <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
                    <span>Address</span>
                    <div className="flex items-center gap-2">
                        <span className="font-mono">{shortWallet}</span>
                        <button onClick={copyFullWallet} className="hover:text-primary transition-colors">
                            <CopyIcon className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            </CardFooter>

            <WalletPinDialog
                open={pinOpen}
                onCancel={() => setPinOpen(false)}
                onSubmit={async (pin) => {
                    setPinOpen(false);
                    await activateSession(pin);
                }}
            />
        </Card>
    );
}
