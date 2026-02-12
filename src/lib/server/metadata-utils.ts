import { Contract, RpcProvider, shortString, num } from "starknet"
import { ipCollectionAbi } from "@/src/abis/ip_collection"

// Re-using environment variables
const COLLECTION_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_COLLECTION_CONTRACT_ADDRESS || ""
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || ""
const START_BLOCK = Number(process.env.NEXT_PUBLIC_COLLECTION_CONTRACT_START_BLOCK) || 0
const COLLECTION_CREATED_SELECTOR = "0xfca650bfd622aeae91aa1471499a054e4c7d3f0d75fbcb98bdb3bbb0358b0c"

// Helper to decode ByteArray from Starknet response
function decodeByteArray(data: any[] | string): string {
    if (!data) return ""

    try {
        if (typeof data === "string") {
            if (!data.startsWith("0x")) {
                return data
            }
            return shortString.decodeShortString(data)
        }

        if (Array.isArray(data)) {
            if (data.length === 0) return ""
            return data.map((felt) => {
                try {
                    const str = String(felt)
                    return shortString.decodeShortString(str)
                } catch {
                    return ""
                }
            }).join("")
        }

        return String(data)
    } catch (e) {
        console.warn("Error decoding ByteArray, returning input:", data)
        return typeof data === "string" ? data : String(data)
    }
}

function getProvider() {
    return new RpcProvider({ nodeUrl: RPC_URL })
}

function getContract() {
    const provider = getProvider()
    return new Contract(ipCollectionAbi, COLLECTION_CONTRACT_ADDRESS, provider)
}

// Simple IPFS fetcher for server side
async function fetchIpfsJsonServer(uri: string) {
    if (!uri) return null;
    try {
        let url = uri;
        if (uri.startsWith("ipfs://")) {
            url = uri.replace("ipfs://", "https://ipfs.io/ipfs/");
        }

        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch IPFS");
        return await res.json();
    } catch (e) {
        console.error("Error fetching IPFS JSON:", e);
        return null;
    }
}

function resolveMediaUrlServer(uri: string | undefined): string {
    if (!uri) return "/placeholder.svg";
    if (uri.startsWith("ipfs://")) {
        return uri.replace("ipfs://", "https://ipfs.io/ipfs/");
    }
    return uri;
}

// Event scanning to find collection IDs
export async function getAllCollectionIds(): Promise<bigint[]> {
    const provider = getProvider()
    const allIds: bigint[] = []
    let continuationToken: string | undefined = undefined

    // Safety break
    let pages = 0
    const MAX_PAGES = 50 // Limit pages for server-side to avoid timeouts

    try {
        do {
            // @ts-ignore
            const response = await provider.getEvents({
                address: COLLECTION_CONTRACT_ADDRESS,
                keys: [[COLLECTION_CREATED_SELECTOR]],
                from_block: { block_number: START_BLOCK },
                chunk_size: 100,
                continuation_token: continuationToken
            })

            for (const event of response.events) {
                try {
                    const data = event.data
                    const dataIter = data[Symbol.iterator]()
                    const collectionIdLow = dataIter.next().value
                    const collectionIdHigh = dataIter.next().value
                    if (collectionIdLow && collectionIdHigh) {
                        const id = BigInt(collectionIdLow) + (BigInt(collectionIdHigh) * BigInt("340282366920938463463374607431768211456"))
                        allIds.push(id)
                    }
                } catch (e) { }
            }

            continuationToken = response.continuation_token
            pages++
        } while (continuationToken && pages < MAX_PAGES)
    } catch (e) {
        console.error("Error fetching collection events:", e)
    }

    return allIds
}


async function findCollectionIdByAddress(address: string): Promise<number | null> {
    if (!address) return null
    const normalizedAddr = address.toLowerCase()

    try {
        const contract = getContract()
        const ids = await getAllCollectionIds()

        for (const id of ids) {
            try {
                const data = await contract.get_collection(id)
                const ipNft = num.toHex(data.ip_nft).toLowerCase()

                // Normalization check
                const normIpNft = ipNft.replace(/^0x0+/, "0x")
                const normAddr = normalizedAddr.replace(/^0x0+/, "0x")

                if (normIpNft === normAddr) {
                    return Number(id)
                }
            } catch (e) { }
        }

    } catch (e) {
        console.error("Error finding collection ID by address:", e)
    }

    return null
}


export async function fetchTokenMetadataServer(slug: string[]) {
    try {
        if (!slug || slug.length === 0) return null;

        let collectionId: string | number | undefined;
        let tokenId: string | undefined;

        // Determine format
        const isOnChainFormat = slug.length === 2 && slug[0].startsWith("0x");

        if (isOnChainFormat) {
            const address = slug[0];
            tokenId = slug[1];
            // Resolve address to ID
            const resolvedId = await findCollectionIdByAddress(address);
            if (resolvedId !== null) collectionId = resolvedId;
        } else {
            if (slug.length === 1) {
                const part = slug[0];
                if (part.includes(":")) {
                    [collectionId, tokenId] = part.split(":");
                }
            } else if (slug.length >= 2) {
                collectionId = slug[0];
                tokenId = slug[1];
            }
        }

        if (!collectionId || !tokenId) return null;

        const contract = getContract();
        const identifier = `${collectionId}:${tokenId}`;

        const tokenData = await contract.get_token(identifier);

        if (BigInt(tokenData.owner) === BigInt(0)) return null;

        let metadataUri = decodeByteArray(tokenData.metadata_uri);

        // If empty, try base URI
        if (!metadataUri) {
            const collectionData = await contract.get_collection(collectionId);
            const baseUri = decodeByteArray(collectionData.base_uri);
            if (baseUri) {
                const cleanBaseUri = baseUri.endsWith('/') ? baseUri : `${baseUri}/`;
                metadataUri = `${cleanBaseUri}${tokenId}.json`;
            }
        }

        const basicData = {
            name: `Token #${tokenData.token_id}`,
            description: "Asset on MediaLane",
            image: "/og-image.jpg" // Default
        };

        if (metadataUri) {
            const json = await fetchIpfsJsonServer(metadataUri);
            if (json) {
                return {
                    name: json.name || basicData.name,
                    description: json.description || basicData.description,
                    image: resolveMediaUrlServer(json.image) || basicData.image
                };
            }
        }

        return basicData;
    } catch (e) {
        console.warn("Error fetching token metadata server:", e);
        return {
            name: "MediaLane Asset",
            description: "View this asset on MediaLane",
            image: "/og-image.jpg"
        };
    }
}

export async function fetchCollectionMetadataServer(address: string) {
    try {
        if (!address) return null;

        // 1. Resolve ID
        const collectionId = await findCollectionIdByAddress(address);
        if (collectionId === null) return null;

        const contract = getContract();
        const collectionData = await contract.get_collection(collectionId);
        const stats = await contract.get_collection_stats(collectionId);

        const baseUri = decodeByteArray(collectionData.base_uri);
        const name = decodeByteArray(collectionData.name);

        let offChainMetadata: any = {};

        if (baseUri) {
            // Try strict structure first
            const uriWithSlash = baseUri.endsWith('/') ? baseUri : `${baseUri}/`;
            const metadataUriDir = `${uriWithSlash}collection.json`;
            let data = await fetchIpfsJsonServer(metadataUriDir);

            if (!data) {
                data = await fetchIpfsJsonServer(baseUri);
            }

            if (data) offChainMetadata = data;
        }

        return {
            name: offChainMetadata.name || name || `Collection #${collectionId}`,
            description: offChainMetadata.description || "View this collection on MediaLane",
            image: resolveMediaUrlServer(offChainMetadata.image) || resolveMediaUrlServer(offChainMetadata.banner) || "/og-image.jpg"
        };

    } catch (e) {
        console.warn("Error fetching collection metadata server:", e);
        return {
            name: "MediaLane Collection",
            description: "View this collection on MediaLane",
            image: "/og-image.jpg"
        };
    }
}
