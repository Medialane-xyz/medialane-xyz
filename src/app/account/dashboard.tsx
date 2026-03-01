"use client";

import { useAuth } from "@clerk/nextjs";
import { useGetWallet } from "@chipi-stack/nextjs";
import Image from "next/image";
import { WalletSummary } from "@/src/components/chipi/wallet-summary";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Separator } from "@/src/components/ui/separator";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { ApiKeysTab } from "@/src/components/portal/api-keys-tab";
import { UsageTab } from "@/src/components/portal/usage-tab";
import { PlanTab } from "@/src/components/portal/plan-tab";
import { WebhooksTab } from "@/src/components/portal/webhooks-tab";
import { WalletIcon, User, Key, BarChart2, Zap, Webhook } from "lucide-react";
import { useRouter } from "next/navigation";

type WalletShape = { wallet: { publicKey: string; normalizedPublicKey: string } };

interface Props {
  initialPlan: string;
  userImageUrl: string;
  userFullName: string | null;
  userEmail: string;
  userId: string;
  publicKey?: string;
}

export function AccountDashboard({
  initialPlan,
  userImageUrl,
  userFullName,
  userEmail,
  userId,
  publicKey,
}: Props) {
  const { getToken } = useAuth();
  const router = useRouter();

  const { data: wallet } = useGetWallet({
    getBearerToken: () => getToken({ template: "chipipay" }).then((t) => t || ""),
    params: { externalUserId: userId },
    queryOptions: { enabled: !!userId && !publicKey },
  });

  const displayWallet: WalletShape | null = publicKey
    ? { wallet: { publicKey, normalizedPublicKey: publicKey } }
    : (wallet as WalletShape | null) ?? null;

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl neon-text">
          API Portal
        </h1>
        <p className="text-lg text-muted-foreground">
          Manage your API keys, monitor usage, and explore your plan.
        </p>
      </div>

      <Separator className="bg-primary/20" />

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 h-auto p-1 gap-1">
          <TabsTrigger value="profile" className="flex items-center gap-1.5 py-2 text-xs sm:text-sm">
            <User className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="wallet" className="flex items-center gap-1.5 py-2 text-xs sm:text-sm">
            <WalletIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Wallet</span>
          </TabsTrigger>
          <TabsTrigger value="keys" className="flex items-center gap-1.5 py-2 text-xs sm:text-sm">
            <Key className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">API Keys</span>
          </TabsTrigger>
          <TabsTrigger value="usage" className="flex items-center gap-1.5 py-2 text-xs sm:text-sm">
            <BarChart2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Usage</span>
          </TabsTrigger>
          <TabsTrigger value="plan" className="flex items-center gap-1.5 py-2 text-xs sm:text-sm">
            <Zap className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Plan</span>
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="flex items-center gap-1.5 py-2 text-xs sm:text-sm">
            <Webhook className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Webhooks</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card className="border-primary/20 bg-background/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-primary flex items-center gap-2">
                User Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center text-center gap-6 py-8">
              <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-primary/20 shadow-[0_0_20px_rgba(var(--primary),0.3)]">
                <Image
                  src={userImageUrl || "/placeholder-user.jpg"}
                  alt={userFullName || "User Avatar"}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">{userFullName}</h2>
                <p className="text-sm font-medium text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
                  {userEmail}
                </p>
              </div>
              <div className="w-full pt-4">
                <div className="text-xs text-muted-foreground uppercase tracking-widest mb-2 font-semibold">
                  Verification
                </div>
                <div className="flex justify-center gap-2 flex-wrap">
                  <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-green-500/20">
                    Email Verified
                  </Badge>
                  <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                    Clerk Identity
                  </Badge>
                  <Badge
                    variant="secondary"
                    className={
                      initialPlan === "PREMIUM"
                        ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                        : "bg-muted text-muted-foreground"
                    }
                  >
                    {initialPlan} Plan
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Wallet Tab */}
        <TabsContent value="wallet">
          {displayWallet ? (
            <div className="space-y-4">
              <WalletSummary
                normalizedPublicKey={displayWallet.wallet.normalizedPublicKey}
                walletPublicKey={displayWallet.wallet.publicKey}
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
                It seems you don't have a wallet yet. Complete onboarding to get started.
              </p>
              <Button onClick={() => router.push("/onboarding")}>Secure Account</Button>
            </Card>
          )}
        </TabsContent>

        {/* API Keys Tab */}
        <TabsContent value="keys">
          <ApiKeysTab />
        </TabsContent>

        {/* Usage Tab */}
        <TabsContent value="usage">
          <UsageTab plan={initialPlan} />
        </TabsContent>

        {/* Plan Tab */}
        <TabsContent value="plan">
          <PlanTab plan={initialPlan} />
        </TabsContent>

        {/* Webhooks Tab */}
        <TabsContent value="webhooks">
          <WebhooksTab plan={initialPlan} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
