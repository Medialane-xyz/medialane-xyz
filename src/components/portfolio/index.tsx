"use client";

import { useState } from "react";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/components/ui/tabs";
import { Input } from "@/src/components/ui/input";
import {
  Search,
  Grid3X3,
  List,
  Plus,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Layers,
  Palette,
  ArrowRight,
} from "lucide-react";
import type { AssetIP } from "@/src/types/asset";
import Link from "next/link";
import { ExpandableAssetCard } from "@/src/components/expandable-asset-card";
import { useGetPortfolioAssets } from "@/src/hooks/use-wallet-assets";
import { useUser } from "@clerk/nextjs";
import { useCollectionsScanner } from "@/src/lib/hooks/use-collections-scanner";
import CollectionCard from "@/src/components/collection-card";

export default function PortfolioView() {
  const { user } = useUser();
  const [selectedTab, setSelectedTab] = useState("mints");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const publicKey = user?.publicMetadata?.publicKey as string;

  const {
    data: portfolioAsset,
    loading: asset_loading,
    error: asset_error,
    refetchAsset,
  } = useGetPortfolioAssets(publicKey || null);

  const {
    collections: scannedCollections,
    loading: scanner_loading,
  } = useCollectionsScanner(50);

  // Transform NFTs to asset format for display
  const portfolioAssets: AssetIP[] = (portfolioAsset || []).map((nft) => ({
    id: `${nft.contractAddress}_${nft.tokenId}`,
    slug: `${nft.contractAddress}-${nft.tokenId}`,
    title: nft.metadata?.name || `Token #${nft.tokenId}`,
    author: "You",
    description: nft.metadata?.description || "Your NFT Asset",
    type: "NFT",
    template: "standard",
    collection:
      nft.contractAddress === process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_MIP
        ? "Mediolano"
        : "External",
    collectionSlug: nft.contractAddress,
    tags:
      nft.metadata?.attributes?.map((attr: any) => attr.value).join(", ") || "nft",
    mediaUrl: nft.metadata?.image || "/placeholder.svg",
    externalUrl: nft.metadata?.external_url || `${process.env.NEXT_PUBLIC_EXPLORER_URL}/contract/${nft.contractAddress}/token/${nft.tokenId}`,
    licenseType: "all-rights",
    licenseDetails: "Full ownership rights",
    ipVersion: "1.0",
    commercialUse: true,
    modifications: true,
    attribution: false,
    registrationDate: new Date().toISOString().split("T")[0],
    protectionStatus: "Onchain",
    protectionScope: "Global",
    protectionDuration: "Immutable",
    creator: {
      id: "current-user",
      username: "you",
      name: "You",
      avatar: "/placeholder.svg",
      verified: true,
      wallet: publicKey || "",
      bio: "Creator",
      followers: 0,
      following: 0,
      assets: portfolioAsset?.length,
    },
    timestamp: "Owned",
    attributes: nft.metadata?.attributes || [],
    blockchain: "Starknet",
    contractAddress: nft.contractAddress,
    tokenId: nft.tokenId,
    metadataUri: nft.tokenURI,
  })) as any;

  // Filter user-created collections
  const userCreatedCollections = scannedCollections.filter(
    (c) => c.owner?.toLowerCase() === publicKey?.toLowerCase()
  );

  // Filter by search query
  const filteredAssets = portfolioAssets.filter((asset) =>
    asset.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCollections = userCreatedCollections.filter((c: any) =>
    (c.name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort mints by tokenId descending (newest first)
  const sortedAssets = [...filteredAssets].sort((a, b) => {
    const aId = BigInt(a.tokenId || "0");
    const bId = BigInt(b.tokenId || "0");
    return aId > bId ? -1 : aId < bId ? 1 : 0;
  });

  const isLoading = selectedTab === "mints" ? asset_loading : scanner_loading;
  const mintCount = portfolioAssets.length;
  const collectionCount = userCreatedCollections.length;

  return (
    <div className="min-h-screen py-20">
      <main>
        <div className="px-4 py-8">
          <div className="max-w-6xl mx-auto">

            {/* Header */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-foreground tracking-tight">
                    Mint Portfolio
                  </h1>
                  {publicKey && (
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                      <span className="text-sm text-muted-foreground font-mono">
                        {publicKey.slice(0, 6)}...{publicKey.slice(-4)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <Link href="/mint">
                    <Button size="sm" variant="outline" className="gap-2">
                      <Sparkles className="w-3.5 h-3.5" />
                      Mint
                    </Button>
                  </Link>
                  <Link href="/create/mint-drop">
                    <Button size="sm" className="gap-2">
                      <Plus className="w-3.5 h-3.5" />
                      Create Drop
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Error State */}
            {asset_error && (
              <div className="flex items-center gap-3 p-4 mb-6 rounded-lg border border-destructive/20 bg-destructive/5">
                <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
                <p className="text-sm text-destructive flex-1">
                  Failed to load assets: {asset_error}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={refetchAsset}
                  className="shrink-0"
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                  Retry
                </Button>
              </div>
            )}

            {/* Tabs */}
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <TabsList className="bg-muted/50 h-10">
                  <TabsTrigger value="mints" className="gap-2 data-[state=active]:bg-background px-4">
                    <Palette className="w-3.5 h-3.5" />
                    Mints
                    <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0 h-4 min-w-[1.25rem] justify-center">
                      {asset_loading ? "..." : mintCount}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="collections" className="gap-2 data-[state=active]:bg-background px-4">
                    <Layers className="w-3.5 h-3.5" />
                    Collections
                    <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0 h-4 min-w-[1.25rem] justify-center">
                      {scanner_loading ? "..." : collectionCount}
                    </Badge>
                  </TabsTrigger>
                </TabsList>

                <div className="flex items-center gap-2">
                  {/* Show search only when there are items */}
                  {(mintCount > 0 || collectionCount > 0) && (
                    <div className="relative flex-1 sm:w-56">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                      <Input
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 h-9 text-sm bg-background/50"
                      />
                    </div>
                  )}
                  <div className="flex border rounded-md overflow-hidden">
                    <Button
                      variant={viewMode === "grid" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                      className="rounded-none h-9 w-9 p-0"
                    >
                      <Grid3X3 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("list")}
                      className="rounded-none h-9 w-9 p-0"
                    >
                      <List className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Mints Tab */}
              <TabsContent value="mints" className="mt-0">
                {asset_loading ? (
                  <LoadingState label="Loading your minted assets..." />
                ) : sortedAssets.length === 0 ? (
                  <EmptyState
                    icon={<Sparkles className="w-8 h-8" />}
                    title="No mints yet"
                    description="Mint your first IP asset on the blockchain — it only takes a moment."
                    actionLabel="Mint Now"
                    actionHref="/mint"
                  />
                ) : (
                  <AssetGrid assets={sortedAssets} viewMode={viewMode} />
                )}
              </TabsContent>

              {/* Collections Tab */}
              <TabsContent value="collections" className="mt-0">
                {scanner_loading ? (
                  <LoadingState label="Scanning for your collections..." />
                ) : filteredCollections.length === 0 ? (
                  <EmptyState
                    icon={<Layers className="w-8 h-8" />}
                    title="No collections yet"
                    description="Create a Mint Drop collection to organize and distribute your IP assets."
                    actionLabel="Create Drop"
                    actionHref="/create/mint-drop"
                  />
                ) : (
                  <CollectionGrid collections={filteredCollections} viewMode={viewMode} />
                )}
              </TabsContent>
            </Tabs>

          </div>
        </div>
      </main>
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────

function LoadingState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
      <Loader2 className="w-6 h-6 animate-spin mb-3" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-5 text-muted-foreground">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-sm">{description}</p>
      <Link href={actionHref}>
        <Button className="gap-2">
          {actionLabel}
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </Link>
    </div>
  );
}

function AssetGrid({
  assets,
  viewMode,
}: {
  assets: AssetIP[];
  viewMode: "grid" | "list";
}) {
  if (viewMode === "list") {
    return (
      <div className="space-y-3">
        {assets.map((asset) => (
          <ExpandableAssetCard
            key={asset.id}
            asset={asset}
            variant="list"
            isOwner={true}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {assets.map((asset) => (
        <ExpandableAssetCard
          key={asset.id}
          asset={asset}
          variant="grid"
          isOwner={true}
        />
      ))}
    </div>
  );
}

function CollectionGrid({
  collections,
  viewMode,
}: {
  collections: any[];
  viewMode: "grid" | "list";
}) {
  return (
    <div
      className={
        viewMode === "grid"
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          : "flex flex-col gap-3"
      }
    >
      {collections.map((collection) => (
        <CollectionCard
          key={collection.id}
          collection={
            {
              ...collection,
              itemCount: collection.totalSupply || 0,
              items: collection.totalSupply || 0,
              image: collection.image,
              banner: collection.headerImage,
              ipNft: collection.nftAddress,
              type: collection.type,
            } as any
          }
        />
      ))}
    </div>
  );
}
