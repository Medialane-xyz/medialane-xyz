// Use configured gateway or fallback to dweb.link (more reliable for public reads than pinata)
export const IPFS_GATEWAY = process.env.NEXT_PUBLIC_IPFS_GATEWAY || "https://gateway.pinata.cloud/ipfs/"

/**
 * Resolves an IPFS URI to a HTTP URL using a public gateway.
 * Handles "ipfs://" prefix and direct CIDs.
 */
export function resolveIpfsUrl(uri: string): string {
    if (!uri) return ""

    // Check if it's already an HTTP URL
    if (uri.startsWith("http://") || uri.startsWith("https://")) {
        return uri
    }

    // Remove "ipfs://" prefix if present
    const cleanUri = uri.replace("ipfs://", "")

    // Remove "ipfs/" path prefix if present (sometimes happens with double prefix)
    const cidPath = cleanUri.startsWith("ipfs/") ? cleanUri.replace("ipfs/", "") : cleanUri

    return `${IPFS_GATEWAY}${cidPath}`
}

/**
 * Fetches JSON metadata from an IPFS URI.
 * Uses a local API proxy to avoid CORS issues.
 * Returns null if fetching fails.
 */
export async function fetchIpfsJson<T = any>(uri: string): Promise<T | null> {
    if (!uri) return null

    try {
        const ipfsUrl = resolveIpfsUrl(uri)
        // Use local proxy to bypass CORS
        const proxyUrl = `/api/proxy?url=${encodeURIComponent(ipfsUrl)}`

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 30000) // 30s timeout

        try {
            const response = await fetch(proxyUrl, { signal: controller.signal })
            clearTimeout(timeoutId)

            if (!response.ok) {
                console.warn(`Failed to fetch IPFS metadata from ${ipfsUrl} via proxy: ${response.statusText}`)
                return null
            }

            const data = await response.json()
            return data as T
        } catch (error) {
            clearTimeout(timeoutId)
            throw error
        }
    } catch (error) {
        console.error(`Error fetching IPFS metadata from ${uri}:`, error)
        return null
    }
}
