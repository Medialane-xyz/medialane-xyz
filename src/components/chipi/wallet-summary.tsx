import { useState } from "react";
import { toast } from "sonner";
import { CopyIcon, QrCodeIcon, WalletIcon } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/src/components/ui/card";
import { UsdcBalance } from "@/src/components/chipi/usdc-balance";
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
    const [receiveOpen, setReceiveOpen] = useState(false);

    const shortWallet = normalizedPublicKey
        ? `${normalizedPublicKey.slice(0, 8)}...${normalizedPublicKey.slice(-6)}`
        : "";

    const copyFullWallet = async () => {
        if (!normalizedPublicKey) return;
        await navigator.clipboard.writeText(normalizedPublicKey);
        toast.success("Address copied to clipboard");
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
                    <Badge variant="outline" className="text-muted-foreground border-primary/20 bg-primary/5">
                        Active
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
                <div className="w-full">
                    <Dialog open={receiveOpen} onOpenChange={setReceiveOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="w-full py-4 flex flex-col gap-2 border-primary/20 hover:bg-primary/5 h-auto">
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
                </div>
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
        </Card>
    );
}
