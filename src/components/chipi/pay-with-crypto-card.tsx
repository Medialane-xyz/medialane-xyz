import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/src/components/ui/card";
import { PayWithChipiButton } from "@/src/components/chipi/pay-with-chipi-button";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";

const merchantWallet = process.env.NEXT_PUBLIC_MERCHANT_WALLET || "0xMerchantWalletPublicKey";

export function PayWithCryptoCard({ usdAmount }: { usdAmount: number }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Payment Summary</CardTitle>
                <CardDescription>check and confirm your order</CardDescription>
            </CardHeader>
            <CardContent>
                <p>
                    Subtotal:
                    <span>${(usdAmount * 1.0).toFixed(2)}</span>
                </p>
                <p>
                    Total USDC:
                    <span>${usdAmount.toFixed(2)}</span>
                </p>
            </CardContent>
            <CardFooter>
                <Button asChild>
                    <Link
                        href={`https://pay.chipipay.com/?usdAmount=${usdAmount}&token=USDC&starknetWallet=${merchantWallet}`}
                        target="_blank"
                    >
                        Pay with External Wallet
                    </Link>
                </Button>
                <PayWithChipiButton usdAmount={usdAmount} />
            </CardFooter>
        </Card>
    );
}
