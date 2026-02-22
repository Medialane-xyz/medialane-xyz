"use client";

import MintEventAsset, { DEMO_MINT_DROP_ASSET, type MintDropAsset } from "@/src/components/assets/mint-event-asset";
import { useEffect, useState } from "react";
import { CollectionsService } from "@/src/services/collections.service";

export default function MintDropPage({ params }: { params: { address: string } }) {
    const [asset, setAsset] = useState<MintDropAsset | undefined>(undefined);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchDropData() {
            try {
                // Instantiate the collections service to scan for deployed Factory Drops
                const collectionsService = new CollectionsService();

                const results = await collectionsService.getCollections({}, 1, 100);
                const collection = results.collections.find(
                    c => c.contractAddress?.toLowerCase() === params.address.toLowerCase()
                );

                if (collection) {
                    // Match found! Serve the fully permissionless IPFS/Starknet datastore

                    // Handle tags typing safely
                    let tags: string[] = ["event", "drop"];
                    if (collection.tags) {
                        tags = Array.isArray(collection.tags)
                            ? collection.tags
                            : typeof collection.tags === 'string'
                                ? [collection.tags]
                                : tags;
                    }

                    setAsset({
                        ...DEMO_MINT_DROP_ASSET,
                        title: collection.name,
                        description: collection.description,
                        mediaUrl: collection.coverImage || DEMO_MINT_DROP_ASSET.mediaUrl,
                        author: typeof collection.creator === 'object' && collection.creator !== null ? collection.creator.id || "Creator" : (collection.creator as string || "Creator"),
                        collection: collection.name,
                        collectionId: collection.id,
                        tags: tags,
                    });
                    setLoading(false);
                    return;
                }

                // Fallback to stylized mock using the contract address
                setAsset({
                    ...DEMO_MINT_DROP_ASSET,
                    title: `Exclusive Drop (${params.address.slice(0, 6)}...${params.address.slice(-4)})`,
                });
            } catch (e) {
                console.error("Failed to fetch drop metadata", e);
                setAsset({
                    ...DEMO_MINT_DROP_ASSET,
                    title: `Exclusive Drop (${params.address.slice(0, 6)}...${params.address.slice(-4)})`,
                });
            } finally {
                setLoading(false);
            }
        }

        fetchDropData();
    }, [params.address]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
            </div>
        );
    }

    return <MintEventAsset asset={asset} contractAddress={params.address} />;
}
