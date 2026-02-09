"use client"

import { useContract, useReadContract, useSendTransaction, useAccount, useSignTypedData, useNetwork } from "@starknet-react/core"
import { useMemo, useState } from "react"
import {
    MedialaneABI,
    OrderParameters,
    Order,
    OrderDetails,
    FulfillmentRequest,
    CancelRequest,
    OrderStatus,
    ItemType,
    OfferItem,
    ConsiderationItem
} from "@/src/abis/medialane"
import { shortString, uint256 } from "starknet"

const MEDIALANE_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_MEDIALANE_CONTRACT_ADDRESS || ""

// Domain for SNIP-12
const domain = {
    name: 'Medialane',
    version: '1',
    chainId: shortString.encodeShortString('SN_MAIN'), // Default to mainnet, logic should adjust based on network
    revision: '1'
}

// Type definitions for SNIP-12 signing
const orderTypes = {
    StarkNetDomain: [
        { name: 'name', type: 'felt' },
        { name: 'version', type: 'felt' },
        { name: 'chainId', type: 'felt' },
        { name: 'revision', type: 'felt' },
    ],
    // Note: We need to match the Cairo struct structure exactly for hashing
    OfferItem: [
        { name: 'item_type', type: 'felt' },
        { name: 'token', type: 'ContractAddress' },
        { name: 'identifier_or_criteria', type: 'u256' },
        { name: 'start_amount', type: 'u256' },
        { name: 'end_amount', type: 'u256' },
    ],
    ConsiderationItem: [
        { name: 'item_type', type: 'felt' },
        { name: 'token', type: 'ContractAddress' },
        { name: 'identifier_or_criteria', type: 'u256' },
        { name: 'start_amount', type: 'u256' },
        { name: 'end_amount', type: 'u256' },
        { name: 'recipient', type: 'ContractAddress' },
    ],
    OrderParameters: [
        { name: 'offerer', type: 'ContractAddress' },
        { name: 'offer', type: 'OfferItem' },
        { name: 'consideration', type: 'ConsiderationItem' },
        { name: 'start_time', type: 'felt' },
        { name: 'end_time', type: 'felt' },
        { name: 'salt', type: 'felt' },
        { name: 'nonce', type: 'felt' },
    ],
}

export function useMedialaneContract() {
    const { contract } = useContract({
        address: MEDIALANE_CONTRACT_ADDRESS,
        abi: MedialaneABI as any,
    })
    return contract
}

export function useOrderDetails(orderHash: string | undefined) {
    const { data, isLoading, error, refetch } = useReadContract({
        address: MEDIALANE_CONTRACT_ADDRESS,
        abi: MedialaneABI as any,
        functionName: "get_order_details",
        args: orderHash ? [orderHash] : undefined,
        enabled: !!orderHash,
    })

    return {
        order: data as OrderDetails | undefined,
        isLoading,
        error,
        refetch,
    }
}

export function useRegisterOrder() {
    const { account } = useAccount()
    const { chain } = useNetwork()
    const { signTypedDataAsync } = useSignTypedData({})
    const { sendAsync, data, isPending, error } = useSendTransaction({ calls: undefined })

    const registerOrder = async (parameters: OrderParameters) => {
        if (!account) throw new Error("Wallet not connected")

        // 1. Sign the OrderParameters (SNIP-12)
        const chainId = chain.id || shortString.encodeShortString('SN_MAIN')

        const typedData = {
            domain: {
                ...domain,
                chainId: typeof chainId === 'bigint' ? '0x' + chainId.toString(16) : chainId
            },
            types: orderTypes,
            primaryType: 'OrderParameters',
            message: {
                ...parameters,
                offer: parameters.offer,
                consideration: parameters.consideration
            }
        }

        console.log("Signing Order:", typedData)
        const signature = await signTypedDataAsync(typedData)

        // 2. Convert signature to array of felts if it's not already
        const signatureArray = Array.isArray(signature) ? signature : [signature]

        // 3. Construct the full Order object
        const order: Order = {
            parameters,
            signature: signatureArray
        }

        // 4. Send transaction to register_order
        const call = {
            contractAddress: MEDIALANE_CONTRACT_ADDRESS,
            entrypoint: "register_order",
            calldata: [order] // The ABI encoding handled by starknet-react usually expects the arguments spread or as array
        }

        // @ts-ignore
        return await sendAsync([call])
    }

    return {
        registerOrder,
        data,
        isPending,
        error
    }
}

export function useFulfillOrder() {
    const { account } = useAccount()
    const { chain } = useNetwork()
    const { signTypedDataAsync } = useSignTypedData({})
    const { sendAsync, data, isPending, error } = useSendTransaction({ calls: undefined })

    const fulfillOrder = async (orderHash: string, fulfillerTimestamp: number = 0) => {
        if (!account) throw new Error("Wallet not connected")

        const fulfillmentIntent = {
            order_hash: orderHash,
            fulfiller: account.address,
            nonce: Date.now().toString(),
        }

        const chainId = chain.id || shortString.encodeShortString('SN_MAIN')

        const fulfillmentTypes = {
            StarkNetDomain: orderTypes.StarkNetDomain,
            OrderFulfillment: [
                { name: 'order_hash', type: 'felt' },
                { name: 'fulfiller', type: 'ContractAddress' },
                { name: 'nonce', type: 'felt' },
            ]
        }

        const typedData = {
            domain: {
                ...domain,
                chainId: typeof chainId === 'bigint' ? '0x' + chainId.toString(16) : chainId
            },
            types: fulfillmentTypes,
            primaryType: 'OrderFulfillment',
            message: fulfillmentIntent
        }

        const signature = await signTypedDataAsync(typedData)
        const signatureArray = Array.isArray(signature) ? signature : [signature]

        const request: FulfillmentRequest = {
            fulfillment: fulfillmentIntent,
            signature: signatureArray
        }

        const call = {
            contractAddress: MEDIALANE_CONTRACT_ADDRESS,
            entrypoint: "fulfill_order",
            calldata: [request]
        }

        // @ts-ignore
        return await sendAsync([call])
    }

    return {
        fulfillOrder,
        data,
        isPending,
        error
    }
}

export function useCancelOrder() {
    const { account } = useAccount()
    const { sendAsync, data, isPending, error } = useSendTransaction({ calls: undefined })
    const { signTypedDataAsync } = useSignTypedData({})
    const { chain } = useNetwork()

    const cancelOrder = async (orderHash: string, nonce: string) => {
        if (!account) throw new Error("Wallet not connected")

        const cancelIntent = {
            order_hash: orderHash,
            offerer: account.address,
            nonce: nonce,
        }

        const chainId = chain.id || shortString.encodeShortString('SN_MAIN')
        const cancelTypes = {
            StarkNetDomain: orderTypes.StarkNetDomain,
            OrderCancellation: [
                { name: 'order_hash', type: 'felt' },
                { name: 'offerer', type: 'ContractAddress' },
                { name: 'nonce', type: 'felt' },
            ]
        }

        const typedData = {
            domain: {
                ...domain,
                chainId: typeof chainId === 'bigint' ? '0x' + chainId.toString(16) : chainId
            },
            types: cancelTypes,
            primaryType: 'OrderCancellation',
            message: cancelIntent
        }

        const signature = await signTypedDataAsync(typedData)
        const signatureArray = Array.isArray(signature) ? signature : [signature]

        const request: CancelRequest = {
            cancelation: cancelIntent,
            signature: signatureArray
        }

        const call = {
            contractAddress: MEDIALANE_CONTRACT_ADDRESS,
            entrypoint: "cancel_order",
            calldata: [request]
        }

        // @ts-ignore
        return await sendAsync([call])
    }

    return {
        cancelOrder,
        data,
        isPending,
        error
    }
}
