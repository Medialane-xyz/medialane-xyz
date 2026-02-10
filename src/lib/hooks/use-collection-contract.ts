"use client"

import { useContract, useReadContract, useAccount } from "@starknet-react/core"
import { useMemo } from "react"
import ipCollectionAbi from "@/src/lib/abi/ip-collection.json"

// Contract address from environment
// Contract address from environment
const COLLECTION_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_COLLECTION_CONTRACT_ADDRESS || ""
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || ""

// Types matching the Cairo structs
export interface Collection {
    name: string
    symbol: string
    base_uri: string
    owner: string
    ip_nft: string
    is_active: boolean
}

export interface CollectionStats {
    total_minted: bigint
    total_burned: bigint
    total_transfers: bigint
    last_mint_time: number
    last_burn_time: number
    last_transfer_time: number
}

export interface TokenData {
    collection_id: bigint
    token_id: bigint
    owner: string
    metadata_uri: string
}

// Extract just the ABI array from the contract class JSON
const abi = ipCollectionAbi.abi || []

/**
 * Hook to get the IP Collection contract instance
 */
export function useIPCollectionContract() {
    const { contract } = useContract({
        address: COLLECTION_CONTRACT_ADDRESS,
        abi,
    })
    return contract
}

/**
 * Hook to fetch a collection by ID
 */
export function useCollection(collectionId: number | bigint | undefined) {
    const { data, isLoading, error, refetch } = useReadContract({
        address: COLLECTION_CONTRACT_ADDRESS,
        abi,
        functionName: "get_collection",
        args: collectionId ? [collectionId] : undefined,
        enabled: !!collectionId,
    })

    return {
        collection: data as Collection | undefined,
        isLoading,
        error,
        refetch,
    }
}

/**
 * Hook to fetch collection stats by ID
 */
export function useCollectionStats(collectionId: number | bigint | undefined) {
    const { data, isLoading, error, refetch } = useReadContract({
        address: COLLECTION_CONTRACT_ADDRESS,
        abi,
        functionName: "get_collection_stats",
        args: collectionId ? [collectionId] : undefined,
        enabled: !!collectionId,
    })

    return {
        stats: data as CollectionStats | undefined,
        isLoading,
        error,
        refetch,
    }
}

/**
 * Hook to fetch a token by its identifier (format: "collection_id:token_id")
 */
export function useToken(tokenIdentifier: string | undefined) {
    const { data, isLoading, error, refetch } = useReadContract({
        address: COLLECTION_CONTRACT_ADDRESS,
        abi,
        functionName: "get_token",
        args: tokenIdentifier ? [tokenIdentifier] : undefined,
        enabled: !!tokenIdentifier,
    })

    return {
        token: data as TokenData | undefined,
        isLoading,
        error,
        refetch,
    }
}

/**
 * Hook to check if a collection ID is valid
 */
export function useIsValidCollection(collectionId: number | bigint | undefined) {
    const { data, isLoading, error } = useReadContract({
        address: COLLECTION_CONTRACT_ADDRESS,
        abi,
        functionName: "is_valid_collection",
        args: collectionId ? [collectionId] : undefined,
        enabled: !!collectionId,
    })

    return {
        isValid: data as boolean | undefined,
        isLoading,
        error,
    }
}

/**
 * Hook to fetch all collections owned by the connected user
 */
export function useUserCollections(userAddress?: string) {
    const { address: connectedAddress } = useAccount()
    const address = userAddress || connectedAddress

    const { data, isLoading, error, refetch } = useReadContract({
        address: COLLECTION_CONTRACT_ADDRESS,
        abi,
        functionName: "list_user_collections",
        args: address ? [address] : undefined,
        enabled: !!address,
    })

    return {
        collectionIds: data as bigint[] | undefined,
        isLoading,
        error,
        refetch,
    }
}

/**
 * Hook to fetch all tokens owned by a user in a specific collection
 */
export function useUserTokensInCollection(
    collectionId: number | bigint | undefined,
    userAddress?: string
) {
    const { address: connectedAddress } = useAccount()
    const address = userAddress || connectedAddress

    const { data, isLoading, error, refetch } = useReadContract({
        address: COLLECTION_CONTRACT_ADDRESS,
        abi,
        functionName: "list_user_tokens_per_collection",
        args: collectionId && address ? [collectionId, address] : undefined,
        enabled: !!(collectionId && address),
    })

    return {
        tokenIds: data as bigint[] | undefined,
        isLoading,
        error,
        refetch,
    }
}

/**
 * Hook to check if an address is the owner of a collection
 */
export function useIsCollectionOwner(
    collectionId: number | bigint | undefined,
    ownerAddress?: string
) {
    const { address: connectedAddress } = useAccount()
    const address = ownerAddress || connectedAddress

    const { data, isLoading, error } = useReadContract({
        address: COLLECTION_CONTRACT_ADDRESS,
        abi,
        functionName: "is_collection_owner",
        args: collectionId && address ? [collectionId, address] : undefined,
        enabled: !!(collectionId && address),
    })

    return {
        isOwner: data as boolean | undefined,
        isLoading,
        error,
    }
}
