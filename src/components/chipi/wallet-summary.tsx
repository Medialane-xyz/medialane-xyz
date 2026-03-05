import { useState } from "react";
import { toast } from "sonner";
import { CopyIcon, ExternalLinkIcon, WalletIcon, CheckIcon } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/src/components/ui/card";
import { UsdcBalance } from "@/src/components/chipi/usdc-balance";
import { Badge } from "@/src/components/ui/badge";
import { Separator } from "@/src/components/ui/separator";

export function WalletSummary({
    normalizedPublicKey,
    walletPublicKey,
}: {
    normalizedPublicKey: string;
    walletPublicKey: string;
}) {
    const [copied, setCopied] = useState(false);

    const shortWallet = normalizedPublicKey
        ? `${normalizedPublicKey.slice(0, 6)}...${normalizedPublicKey.slice(-4)}`
        : "";

    const copyFullWallet = async () => {
        if (!normalizedPublicKey) return;
        await navigator.clipboard.writeText(normalizedPublicKey);
        setCopied(true);
        toast.success("Address copied to clipboard");
        setTimeout(() => setCopied(false), 2000);
    };

    const explorerUrl = `https://starkscan.co/contract/${normalizedPublicKey}`;

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

                {/* Wallet Info & Actions Section */}
                <div className="space-y-4">
                    <div className="flex flex-col gap-2">
                        <p className="text-sm font-medium text-muted-foreground">Wallet Address</p>
                        <div className="flex flex-col sm:flex-row items-center gap-2">
                            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 border border-primary/10 flex-1 w-full min-w-0">
                                <code className="text-[10px] sm:text-xs flex-1 break-all font-mono text-muted-foreground truncate">
                                    {normalizedPublicKey}
                                </code>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 shrink-0 hover:bg-primary/10 hover:text-primary transition-colors"
                                    onClick={copyFullWallet}
                                >
                                    {copied ? <CheckIcon className="w-4 h-4" /> : <CopyIcon className="w-4 h-4" />}
                                </Button>
                            </div>

                            <Button
                                variant="outline"
                                className="w-full sm:w-auto h-auto py-3 px-4 border-primary/20 hover:bg-primary/5 gap-2 shrink-0"
                                asChild
                            >
                                <a href={explorerUrl} target="_blank" rel="noopener noreferrer">
                                    <ExternalLinkIcon className="w-4 h-4" />
                                    <span>Explorer</span>
                                </a>
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="bg-muted/10 border-t border-primary/5 py-3 px-6">
                <p className="text-[10px] text-muted-foreground/60 w-full text-center sm:text-left">
                    Official Starknet Smart Contract Wallet
                </p>
            </CardFooter>
        </Card>
    );
}
