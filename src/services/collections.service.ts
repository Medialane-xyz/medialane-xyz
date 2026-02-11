import { RpcProvider, Contract, CallData, num, validateAndParseAddress } from "starknet"
import { starknetService } from "./starknet.service"
import type { Collection, AssetIP } from "@/src/types/asset"
import { ip_collection_abi } from "@/src/abi/ip_collection"
import { rateLimiter } from "./rate-limiter.service"

// MIP Protocol Contract ABI for collections
const MIP_COLLECTIONS_ABI = ip_collection_abi;
// MIP Protocol Contract Address (from environment or default)
const MIP_COLLECTIONS_CONTRACT = process.env.NEXT_PUBLIC_COLLECTION_FACTORY_ADDRESS;

// Enhanced interfaces for better type safety
export interface MIPCollection {
    id: string
    name: string
    description: string
    creator: string
    coverImage: string
    category: string
    isPublic: boolean
    isFeatured: boolean
    createdAt: number
    updatedAt: number
    assetCount: number
    contractAddress: string
}

export interface CollectionFilters {
    search?: string
    category?: string
    creator?: string
    sortBy?: "recent" | "name" | "assets" | "views" | "likes"
    featured?: boolean
    isPublic?: boolean
}

export interface PaginatedCollections {
    collections: Collection[]
    total: number
    page: number
    limit: number
    hasMore: boolean
}

export interface CollectionStats {
    total_minted: bigint | string | number
    total_burned: bigint | string | number
    total_transfers: bigint | string | number
    last_mint_time: bigint | string | number
    last_burn_time: bigint | string | number
    last_transfer_time: bigint | string | number
}

export interface ContractToken {
    collection_id: bigint | string | number
    token_id: bigint | string | number
    owner: string
    metadata_uri: string
}

export interface ContractCollection {
    name: string
    symbol: string
    base_uri: string
    owner: string
    ip_nft: string
    is_active: boolean
}

export interface CollectionMetadata {
    name: string
    description: string
    image: string
    coverImage?: string
    banner_image?: string
    external_url?: string
    seller_fee_basis_points?: number
    fee_recipient?: string
    attributes?: Array<{ trait_type: string; value: string }>
    category?: string
    visibility?: string
    type?: string
    tags?: string[]
    created_at?: string
    createdAt?: string
    timestamp?: string
    creator?: string
}

// Enhanced caching interfaces
interface CacheEntry<T> {
    data: T
    timestamp: number
    expiresAt: number
    version: string
}

interface CollectionCache {
    collections: Map<string, CacheEntry<Collection>>
    assets: Map<string, CacheEntry<AssetIP[]>>
    stats: Map<string, CacheEntry<CollectionStats>>
    discovery: CacheEntry<number[]> // Known collection IDs
    lastDiscovery: number
}

// Improved CollectionsService with better data management
export class CollectionsService {
    private provider: RpcProvider
    private contract: Contract | null = null
    private contractAvailable: boolean = false

    // Enhanced caching system
    private cache: CollectionCache = {
        collections: new Map(),
        assets: new Map(),
        stats: new Map(),
        discovery: { data: [], timestamp: 0, expiresAt: 0, version: '1.0' },
        lastDiscovery: 0
    }
    
    // Configuration
    private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
    private readonly DISCOVERY_CACHE_DURATION = 10 * 60 * 1000 // 10 minutes
    private readonly MAX_DISCOVERY_RANGE = 100 // Maximum collections to discover
    private readonly DISCOVERY_BATCH_SIZE = 10 // Collections to check in parallel
    private readonly TOKEN_BATCH_SIZE = 5 // Tokens to check in parallel

    /**
     * Force refresh of collection discovery
     */
    public async refreshDiscovery(): Promise<void> {
        console.log("Forcing collection discovery refresh...")
        this.cache.discovery.expiresAt = 0 // Invalidate cache
        await this.discoverCollections()
    }

    /**
     * Persist cache to localStorage for offline support
     */
    private persistCache(): void {
        try {
            if (typeof window !== 'undefined') {
                // Convert BigInt values to strings for JSON serialization
                const collectionsData = Array.from(this.cache.collections.entries()).map(([key, entry]) => [
                    key,
                    {
                        ...entry,
                        data: this.serializeForStorage(entry.data)
                    }
                ])
                
                const assetsData = Array.from(this.cache.assets.entries()).map(([key, entry]) => [
                    key,
                    {
                        ...entry,
                        data: entry.data.map(asset => this.serializeForStorage(asset))
                    }
                ])
                
                const statsData = Array.from(this.cache.stats.entries()).map(([key, entry]) => [
                    key,
                    {
                        ...entry,
                        data: this.serializeForStorage(entry.data)
                    }
                ])
                
                const cacheData = {
                    collections: collectionsData,
                    assets: assetsData,
                    stats: statsData,
                    discovery: this.cache.discovery,
                    lastDiscovery: this.cache.lastDiscovery,
                    timestamp: Date.now()
                }
                localStorage.setItem('mip_collections_cache', JSON.stringify(cacheData))
                console.debug('Cache persisted to localStorage')
            }
        } catch (error) {
            console.warn('Failed to persist cache:', error)
        }
    }

    /**
     * Serialize data for localStorage storage (convert BigInt to string)
     */
    private serializeForStorage(data: any): any {
        if (data === null || data === undefined) {
            return data
        }
        
        if (typeof data === 'bigint') {
            return data.toString()
        }
        
        if (Array.isArray(data)) {
            return data.map(item => this.serializeForStorage(item))
        }
        
        if (typeof data === 'object') {
            const serialized: any = {}
            for (const [key, value] of Object.entries(data)) {
                serialized[key] = this.serializeForStorage(value)
            }
            return serialized
        }
        
        return data
    }

    /**
     * Load cache from localStorage on initialization
     */
    private loadPersistedCache(): void {
        try {
            if (typeof window !== 'undefined') {
                const cached = localStorage.getItem('mip_collections_cache')
                if (cached) {
                    const cacheData = JSON.parse(cached)
                    const now = Date.now()
                    
                    // Only load if cache is not too old (24 hours)
                    if (now - cacheData.timestamp < 24 * 60 * 60 * 1000) {
                        this.cache.collections = new Map(cacheData.collections)
                        this.cache.assets = new Map(cacheData.assets)
                        this.cache.stats = new Map(cacheData.stats)
                        this.cache.discovery = cacheData.discovery
                        this.cache.lastDiscovery = cacheData.lastDiscovery
                        console.log('Cache loaded from localStorage')
                    } else {
                        console.log('Persisted cache is too old, starting fresh')
                        localStorage.removeItem('mip_collections_cache')
                    }
                }
            }
        } catch (error) {
            console.warn('Failed to load persisted cache:', error)
        }
    }

    /**
     * Enhanced constructor with persistence
     */
    constructor() {
        this.provider = starknetService["provider"]
        this.loadPersistedCache() // Load persisted cache first
        this.initializeContract()
        this.startPeriodicDiscovery()
        this.startCachePersistence()
    }

    /**
     * Start periodic cache persistence
     */
    private startCachePersistence() {
        // Persist cache every 5 minutes
        setInterval(() => {
            this.persistCache()
        }, 5 * 60 * 1000)
        
        // Also persist on page unload
        if (typeof window !== 'undefined') {
            window.addEventListener('beforeunload', () => {
                this.persistCache()
            })
        }
    }

    /**
     * Get comprehensive system status
     */
    public getSystemStatus(): {
        contract: { available: boolean; address?: string; error?: string }
        cache: { collections: number; assets: number; stats: number; discoveryAge: number }
        discovery: { lastRun: number; totalCollections: number; isStale: boolean }
        performance: { avgResponseTime: number; cacheHitRate: number }
    } {
        const now = Date.now()
        const contractStatus = this.getContractStatus()
        const cacheStats = this.getCacheStats()
        
        return {
            contract: contractStatus,
            cache: cacheStats,
            discovery: {
                lastRun: this.cache.lastDiscovery,
                totalCollections: this.cache.discovery.data.length,
                isStale: this.cache.discovery.expiresAt < now
            },
            performance: {
                avgResponseTime: 0, // Could be implemented with metrics tracking
                cacheHitRate: 0 // Could be implemented with hit/miss tracking
            }
        }
    }

    private async initializeContract() {
        try {
            if (!MIP_COLLECTIONS_CONTRACT) {
                console.warn("MIP Collections contract address not configured")
                return
            }
            this.contract = new Contract(MIP_COLLECTIONS_ABI, MIP_COLLECTIONS_CONTRACT, this.provider)
            this.contractAvailable = true
            console.log("CollectionsService initialized successfully")
        } catch (error) {
            console.error("Failed to initialize MIP Collections contract:", error)
            this.contractAvailable = false
        }
    }

    /**
     * Start periodic collection discovery to keep cache fresh
     */
    private startPeriodicDiscovery() {
        // Run discovery every 10 minutes
        setInterval(async () => {
            if (this.contractAvailable) {
                console.log("Running periodic collection discovery...")
                await this.discoverCollections()
            }
        }, 10 * 60 * 1000)
    }

    /**
     * Smart collection discovery using binary search and caching
     */
    private async discoverCollections(): Promise<number[]> {
        const now = Date.now()
        
        // Check if we have recent discovery data
        if (this.cache.discovery.expiresAt > now) {
            console.log("Using cached collection discovery data")
            return this.cache.discovery.data
        }

        console.log("Starting new collection discovery...")
        const discoveredIds: number[] = []
        
        // Use binary search approach to find the highest collection ID
        let low = 1
        let high = this.MAX_DISCOVERY_RANGE
        let highestValidId = 0

        // Find the highest valid collection ID
        while (low <= high) {
            const mid = Math.floor((low + high) / 2)
            try {
                const isValid = await this.contract!.call("is_valid_collection", [mid])
                if (isValid) {
                    highestValidId = mid
                    low = mid + 1
                } else {
                    high = mid - 1
                }
                await this.delay(50) // Be gentle on RPC
            } catch (error) {
                // If error, assume collection doesn't exist
                high = mid - 1
            }
        }

        // Now check all collections up to the highest valid ID
        if (highestValidId > 0) {
            const checkPromises: Promise<{ id: number; isValid: boolean }>[] = []
            
            for (let id = 1; id <= highestValidId; id++) {
                checkPromises.push(
                    this.contract!.call("is_valid_collection", [id])
                        .then(isValid => ({ id, isValid: Boolean(isValid) }))
                        .catch(() => ({ id, isValid: false }))
                )
                
                // Process in batches to avoid overwhelming RPC
                if (checkPromises.length >= this.DISCOVERY_BATCH_SIZE) {
                    const results = await Promise.all(checkPromises)
                    discoveredIds.push(...results.filter(r => r.isValid).map(r => r.id))
                    checkPromises.length = 0
                    await this.delay(100)
                }
            }
            
            // Process remaining promises
            if (checkPromises.length > 0) {
                const results = await Promise.all(checkPromises)
                discoveredIds.push(...results.filter(r => r.isValid).map(r => r.id))
            }
        }

        // Update cache
        this.cache.discovery = {
            data: discoveredIds,
            timestamp: now,
            expiresAt: now + this.DISCOVERY_CACHE_DURATION,
            version: '1.0'
        }
        this.cache.lastDiscovery = now

        console.log(`Discovery complete: found ${discoveredIds.length} collections`)
        return discoveredIds
    }

    /**
     * Get all collections with smart caching and discovery
     */
    public async getCollections(
        filters: CollectionFilters = {},
        page: number = 1,
        limit: number = 20
    ): Promise<PaginatedCollections> {
        try {
            if (!this.contractAvailable || !this.contract) {
                return {
                    collections: [],
                    total: 0,
                    page,
                    limit,
                    hasMore: false
                }
            }

            // Get discovered collection IDs
            const collectionIds = await this.discoverCollections()

            if (collectionIds.length === 0) {
                return {
                    collections: [],
                    total: 0,
                    page,
                    limit,
                    hasMore: false
                }
            }

            // Fetch collections with smart caching
            const collections: Collection[] = []
            const fetchPromises: Promise<Collection | null>[] = []

            for (const collectionId of collectionIds) {
                fetchPromises.push(this.getCollectionWithCache(collectionId.toString()))
                
                // Process in batches
                if (fetchPromises.length >= this.DISCOVERY_BATCH_SIZE) {
                    const results = await Promise.all(fetchPromises)
                    collections.push(...results.filter((c): c is Collection => c !== null))
                    fetchPromises.length = 0
                    await this.delay(50)
                }
            }

            // Process remaining promises
            if (fetchPromises.length > 0) {
                const results = await Promise.all(fetchPromises)
                collections.push(...results.filter((c): c is Collection => c !== null))
            }

            // Apply filters and sorting
            const filteredCollections = collections.filter(c => this.matchesFilters(c, filters))
            const sortedCollections = this.sortCollections(filteredCollections, filters.sortBy)

            // Apply pagination
            const startIndex = (page - 1) * limit
            const endIndex = startIndex + limit
            const paginatedCollections = sortedCollections.slice(startIndex, endIndex)

            console.log(`Returning ${paginatedCollections.length} collections (page ${page}, total ${sortedCollections.length})`)
            return {
                collections: paginatedCollections,
                total: sortedCollections.length,
                page,
                limit,
                hasMore: endIndex < sortedCollections.length
            }
        } catch (error) {
            console.error("Error in getCollections:", error)
            return {
                collections: [],
                total: 0,
                page,
                limit,
                hasMore: false
            }
        }
    }

    /**
     * Get collection with smart caching
     */
    private async getCollectionWithCache(collectionId: string): Promise<Collection | null> {
        const cacheKey = `collection_${collectionId}`
        const now = Date.now()
        
        // Check cache first
        const cached = this.cache.collections.get(cacheKey)
        if (cached && cached.expiresAt > now) {
            console.debug(`Cache hit for collection ${collectionId}`)
            return cached.data
        }

        // Fetch from contract
        const collection = await this.getCollection(collectionId)
        
                        if (collection) {
            // Update cache
            this.cache.collections.set(cacheKey, {
                data: collection,
                timestamp: now,
                expiresAt: now + this.CACHE_DURATION,
                version: '1.0'
            })
        }

        return collection
    }

    /**
     * Get a specific collection by ID with enhanced error handling
     */
    public async getCollection(collectionId: string): Promise<Collection | null> {
        try {
            if (!this.contractAvailable || !this.contract) {
                return null
            }

            const id = Number(collectionId)
            
            // Check validity with rate limiting
            const isValid = await rateLimiter.executeWithRateLimit(
                () => this.contract!.call("is_valid_collection", [id]),
                `is_valid_collection_${id}`,
                30000 // 30 second cache
            )
            
            if (!isValid) {
                console.log(`Collection ${id} is not valid`)
                return null
            }

            // Get collection data with rate limiting
            const collectionResult = await rateLimiter.executeWithRateLimit(
                () => this.contract!.call("get_collection", [id]),
                `get_collection_${id}`,
                60000 // 1 minute cache for collection data
            ) as ContractCollection
            
            return await this.parseCollectionData(collectionResult, id)
        } catch (error) {
            console.error(`Error fetching collection ${collectionId}:`, error)
            return null
        }
    }

    /**
     * Get collection assets with smart token discovery
     */
    public async getCollectionAssets(collectionId: string): Promise<AssetIP[]> {
        try {
            if (!this.contractAvailable || !this.contract) {
                return []
            }

            const cacheKey = `assets_${collectionId}`
            const now = Date.now()
            
            // Check cache first
            const cached = this.cache.assets.get(cacheKey)
            if (cached && cached.expiresAt > now) {
                console.debug(`Cache hit for collection assets ${collectionId}`)
                return cached.data
            }

            const id = Number(collectionId)
            const assets: AssetIP[] = []

            // Get collection stats to determine token range
            const stats = await this.getCollectionStatsWithCache(collectionId)
            const totalMinted = Number(stats?.total_minted || 0)
            
            if (totalMinted === 0) {
                console.log(`Collection ${id} has no minted tokens`)
                return []
            }

            // Use smart token discovery
            const discoveredTokens = await this.discoverTokens(id, totalMinted)
            
            // Fetch token data in batches
            for (let i = 0; i < discoveredTokens.length; i += this.TOKEN_BATCH_SIZE) {
                const batch = discoveredTokens.slice(i, i + this.TOKEN_BATCH_SIZE)
                const batchPromises = batch.map(tokenId => 
                    this.getTokenWithCache(`${id}:${tokenId}`)
                )
                
                const batchResults = await Promise.all(batchPromises)
                assets.push(...batchResults.filter((asset): asset is AssetIP => asset !== null))
                
                if (i + this.TOKEN_BATCH_SIZE < discoveredTokens.length) {
                    await this.delay(50)
                }
            }

            // Update cache
            this.cache.assets.set(cacheKey, {
                data: assets,
                timestamp: now,
                expiresAt: now + this.CACHE_DURATION,
                version: '1.0'
            })

            console.log(`Found ${assets.length} assets in collection ${id}`)
            return assets
        } catch (error) {
            console.error(`Error fetching collection assets ${collectionId}:`, error)
            return []
        }
    }

    /**
     * Smart token discovery using binary search
     */
    private async discoverTokens(collectionId: number, totalMinted: number): Promise<number[]> {
        const discoveredTokens: number[] = []
        const maxCheck = Math.min(totalMinted, 200) // Cap at 200 tokens
        
        // Use binary search to find valid token ranges
        let low = 1
        let high = maxCheck
        
        while (low <= high) {
            const mid = Math.floor((low + high) / 2)
            const tokenIdentifier = `${collectionId}:${mid}`
            
            try {
                const isValid = await this.contract!.call("is_valid_token", [tokenIdentifier])
                if (isValid) {
                    // Found a valid token, check around it
                    for (let i = Math.max(1, mid - 5); i <= Math.min(maxCheck, mid + 5); i++) {
                        const checkTokenId = `${collectionId}:${i}`
                        try {
                            const checkValid = await this.contract!.call("is_valid_token", [checkTokenId])
                            if (checkValid && !discoveredTokens.includes(i)) {
                                discoveredTokens.push(i)
                            }
                        } catch {
                            // Token doesn't exist, continue
                        }
                    }
                    low = mid + 6
                } else {
                    high = mid - 1
                }
                await this.delay(30)
            } catch {
                high = mid - 1
            }
        }

        return discoveredTokens.sort((a, b) => a - b)
    }

    /**
     * Get token with caching
     */
    private async getTokenWithCache(tokenIdentifier: string): Promise<AssetIP | null> {
        const cacheKey = `token_${tokenIdentifier}`
        const now = Date.now()
        
        // Check cache first
        const cached = this.cache.assets.get(cacheKey)
        if (cached && cached.expiresAt > now) {
            return cached.data[0] // Single token stored as array
        }
                        
                        try {
                            const token = await this.contract!.call("get_token", [tokenIdentifier]) as ContractToken
            const asset = await this.parseTokenToAsset(token, tokenIdentifier)
            
            if (asset) {
                // Cache single token
                this.cache.assets.set(cacheKey, {
                    data: [asset],
                    timestamp: now,
                    expiresAt: now + this.CACHE_DURATION,
                    version: '1.0'
                })
            }
            
            return asset
                        } catch (error) {
                        return null
        }
    }

    /**
     * Get collection stats with caching
     */
    private async getCollectionStatsWithCache(collectionId: string): Promise<CollectionStats | null> {
        const cacheKey = `stats_${collectionId}`
        const now = Date.now()
        
        // Check cache first
        const cached = this.cache.stats.get(cacheKey)
        if (cached && cached.expiresAt > now) {
            return cached.data
        }

        try {
            const stats = await rateLimiter.executeWithRateLimit(
                () => this.contract!.call("get_collection_stats", [Number(collectionId)]),
                `get_collection_stats_${collectionId}`,
                60000 // 1 minute cache
            ) as CollectionStats
            
            // Update cache
            this.cache.stats.set(cacheKey, {
                data: stats,
                timestamp: now,
                expiresAt: now + this.CACHE_DURATION,
                version: '1.0'
            })
            
            return stats
        } catch (error) {
            console.warn(`Could not fetch stats for collection ${collectionId}:`, error)
            return null
        }
    }

    /**
     * Helper to add a delay between RPC calls
     */
    private async delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    /**
     * Parse a contract token to AssetIP format with enhanced metadata handling
     */
    private async parseTokenToAsset(token: ContractToken, tokenIdentifier: string): Promise<AssetIP | null> {
        try {
            // Start with basic asset structure
            let registrationDate: string = "";
            let asset: AssetIP = {
                id: tokenIdentifier,
                slug: `asset-${tokenIdentifier}`,
                title: `Asset ${tokenIdentifier}`,
                author: token.owner || "Unknown",
                description: `IP Asset with token identifier ${tokenIdentifier}`,
                type: "digital art", // Default fallback, will be updated from IPFS metadata
                template: "default",
                collection: token.collection_id?.toString() || "unknown",
                collectionSlug: `collection-${token.collection_id}`,
                tags: "",
                mediaUrl: "/placeholder.svg",
                externalUrl: "",
                licenseType: "Standard",
                licenseDetails: "Default license",
                ipVersion: "1.0",
                commercialUse: true,
                modifications: true,
                attribution: true,
                registrationDate: "", // will be set after IPFS metadata
                protectionStatus: "Active",
                protectionScope: "Global",
                protectionDuration: "Perpetual",
                creator: {
                    id: this.formatAddressAsHex(token.owner) || "unknown",
                    username: `user-${this.formatAddressAsHex(token.owner)}`,
                    name: `User ${this.formatAddressAsHex(token.owner)}`,
                    avatar: "/placeholder.svg",
                    verified: false,
                    wallet: this.formatAddressAsHex(token.owner) || "0x0"
                },
                timestamp: new Date().toISOString(),
                blockchain: "Starknet",
                contractAddress: MIP_COLLECTIONS_CONTRACT,
                tokenId: token.token_id?.toString() || tokenIdentifier,
                metadataUri: token.metadata_uri
            }

            // Try to fetch metadata from IPFS using metadata_uri
            if (token.metadata_uri) {
                console.log(`Fetching IPFS metadata for token ${tokenIdentifier} from:`, token.metadata_uri)
                try {
                    const metadata = await this.fetchIPFSMetadata(token.metadata_uri)
                    if (metadata) {
                        console.log(`Successfully fetched metadata for token ${tokenIdentifier}:`, metadata)
                        
                        // Update asset with IPFS metadata
                        asset.title = metadata.name || asset.title
                        asset.description = metadata.description || asset.description
                        
                        // Handle image from either 'image' or 'coverImage' field
                        if (metadata.image) {
                        asset.mediaUrl = this.processImageData(metadata.image)
                        } else if (metadata.coverImage) {
                            asset.mediaUrl = this.processImageData(metadata.coverImage)
                        }
                        
                        asset.externalUrl = metadata.external_url || asset.externalUrl
                        
                        // Handle asset type and tags from attributes
                        if (metadata.attributes && Array.isArray(metadata.attributes)) {
                            const typeAttr = metadata.attributes.find(attr => attr.trait_type.toLowerCase() === 'type' || attr.trait_type.toLowerCase() === 'category')
                            if (typeAttr) {
                                asset.type = typeAttr.value.toLowerCase()
                            }
                            
                            const tagAttrs = metadata.attributes.filter(attr => attr.trait_type.toLowerCase() === 'tag')
                            if (tagAttrs.length > 0) {
                                asset.tags = tagAttrs.map(attr => attr.value).join(", ")
                            }
                            
                            // Handle IP-specific data from attributes
                            const licenseTypeAttr = metadata.attributes.find(attr => attr.trait_type.toLowerCase() === 'license_type')
                            if (licenseTypeAttr) {
                                asset.licenseType = licenseTypeAttr.value
                            }
                            
                            const licenseDetailsAttr = metadata.attributes.find(attr => attr.trait_type.toLowerCase() === 'license_details')
                            if (licenseDetailsAttr) {
                                asset.licenseDetails = licenseDetailsAttr.value
                            }
                            
                            const ipVersionAttr = metadata.attributes.find(attr => attr.trait_type.toLowerCase() === 'ip_version')
                            if (ipVersionAttr) {
                                asset.ipVersion = ipVersionAttr.value
                            }
                            
                            const commercialUseAttr = metadata.attributes.find(attr => attr.trait_type.toLowerCase() === 'commercial_use')
                            if (commercialUseAttr) {
                                asset.commercialUse = commercialUseAttr.value.toLowerCase() === 'true'
                            }
                            
                            const modificationsAttr = metadata.attributes.find(attr => attr.trait_type.toLowerCase() === 'modifications')
                            if (modificationsAttr) {
                                asset.modifications = modificationsAttr.value.toLowerCase() === 'true'
                            }
                            
                            const attributionAttr = metadata.attributes.find(attr => attr.trait_type.toLowerCase() === 'attribution')
                            if (attributionAttr) {
                                asset.attribution = attributionAttr.value.toLowerCase() === 'true'
                            }
                        }
                        // Prefer created_at, createdAt, or timestamp from IPFS metadata for registrationDate
                        if (metadata.created_at && !isNaN(Date.parse(metadata.created_at))) {
                            registrationDate = metadata.created_at;
                        } else if (metadata.createdAt && !isNaN(Date.parse(metadata.createdAt))) {
                            registrationDate = metadata.createdAt;
                        } else if (metadata.timestamp && !isNaN(Date.parse(metadata.timestamp))) {
                            registrationDate = metadata.timestamp;
                        }
                    } else {
                        // If metadata is null, the metadata_uri might be a direct image URL
                        console.log(`No JSON metadata found for token ${tokenIdentifier}, treating metadata_uri as direct image`)
                        const processedImageUrl = this.processImageData(token.metadata_uri)
                        console.log(`Processed image URL: ${processedImageUrl}`)
                        asset.mediaUrl = processedImageUrl
                    }
                } catch (metadataError) {
                    console.warn(`Could not fetch IPFS metadata for token ${tokenIdentifier}:`, metadataError)
                    // Fallback: treat metadata_uri as direct image URL
                    console.log(`Treating metadata_uri as direct image URL due to error`)
                    const processedImageUrl = this.processImageData(token.metadata_uri)
                    console.log(`Processed image URL (fallback): ${processedImageUrl}`)
                    asset.mediaUrl = processedImageUrl
                }
            }
            // Set registrationDate from IPFS metadata if available, otherwise fallback to undefined
            asset.registrationDate = registrationDate;
            return asset
        } catch (error) {
            console.error(`Error parsing token ${tokenIdentifier}:`, error)
            return null
        }
    }

    /**
     * Get user tokens with enhanced caching
     */
    public async getUserTokens(userAddress: string): Promise<AssetIP[]> {
        try {
            console.log(`🔗 Getting tokens for user wallet: ${userAddress}`)
            
            if (!this.contractAvailable || !this.contract) {
                console.log(`❌ Contract not available for user tokens: ${userAddress}`)
                return []
            }

            const validAddress = starknetService.validateAddress(userAddress)
            if (!validAddress) {
                console.log(`❌ Invalid wallet address for tokens: ${userAddress}`)
                throw new Error("Invalid user address")
            }

            console.log(`✅ Valid wallet address for tokens: ${validAddress}`)

            // Get user's collections first
            const userCollections = await this.getUserCollections(userAddress)
            console.log(`📋 Found ${userCollections.length} collections for user tokens: ${validAddress}`)
            
            const allTokens: AssetIP[] = []

            // Get tokens from each collection
            for (const collection of userCollections) {
                try {
                    console.log(`🔍 Fetching tokens from collection ${collection.id} for user: ${validAddress}`)
                    const tokenIds = await rateLimiter.executeWithRateLimit(
                        () => this.contract!.call("list_user_tokens_per_collection", [collection.id, validAddress]),
                        `list_user_tokens_per_collection_${collection.id}_${validAddress}`,
                        60000 // 1 minute cache
                    )
                    
                    console.log(`🎯 Found ${Array.isArray(tokenIds) ? tokenIds.length : 0} tokens in collection ${collection.id} for user: ${validAddress}`)
                    
                    if (Array.isArray(tokenIds) && tokenIds.length > 0) {
                        for (const tokenId of tokenIds) {
                            try {
                                const tokenIdentifier = `${collection.id}:${tokenId}`
                                console.log(`🪙 Processing token ${tokenIdentifier} for user: ${validAddress}`)
                                const token = await rateLimiter.executeWithRateLimit(
                                    () => this.contract!.call("get_token", [tokenIdentifier]),
                                    `get_token_${tokenIdentifier}`,
                                    300000 // 5 minute cache for token data
                                ) as ContractToken
                                
                                const asset = await this.parseTokenToAsset(token, tokenIdentifier)
                                if (asset) {
                                    allTokens.push(asset)
                                    console.log(`✅ Added token ${tokenIdentifier} to user portfolio: ${validAddress}`)
                                }
                            } catch (error) {
                                console.error(`Error processing user token ${tokenId} in collection ${collection.id}:`, error)
                            }
                        }
                    }
                } catch (error) {
                    console.error(`Error fetching tokens for collection ${collection.id}:`, error)
                }
            }

            console.log(`🎉 Total tokens found for user ${validAddress}: ${allTokens.length}`)
            return allTokens
        } catch (error) {
            console.error(`❌ Error fetching user tokens for ${userAddress}:`, error)
            return []
        }
    }

    /**
     * Check if user owns a collection
     */
    public async isCollectionOwner(collectionId: string, userAddress: string): Promise<boolean> {
        try {
            console.log(`🔗 Checking ownership for collection ${collectionId} and user: ${userAddress}`)
            
            if (!this.contractAvailable || !this.contract) {
                console.log(`❌ Contract not available for ownership check: ${userAddress}`)
                return false
            }

            const validAddress = starknetService.validateAddress(userAddress)
            if (!validAddress) {
                console.log(`❌ Invalid wallet address for ownership check: ${userAddress}`)
                return false
            }

            console.log(`✅ Valid wallet address for ownership check: ${validAddress}`)

            const id = Number(collectionId)
            const isOwner = await rateLimiter.executeWithRateLimit(
                () => this.contract!.call("is_collection_owner", [id, validAddress]),
                `is_collection_owner_${id}_${validAddress}`,
                60000 // 1 minute cache
            )
            
            const ownershipResult = Boolean(isOwner)
            console.log(`👑 User ${validAddress} ${ownershipResult ? 'IS' : 'is NOT'} owner of collection ${collectionId}`)
            return ownershipResult
        } catch (error) {
            console.error(`❌ Error checking collection ownership for ${userAddress}:`, error)
            return false
        }
    }

    /**
     * Get token balance for a user in a specific collection
     */
    public async getUserTokenBalance(userAddress: string, collectionId?: string): Promise<number> {
        try {
            console.log(`🔗 Getting token balance for user: ${userAddress}${collectionId ? ` in collection ${collectionId}` : ''}`)
            
            if (!this.contractAvailable || !this.contract) {
                console.log(`❌ Contract not available for balance check: ${userAddress}`)
                return 0
            }

            const validAddress = starknetService.validateAddress(userAddress)
            if (!validAddress) {
                console.log(`❌ Invalid wallet address for balance check: ${userAddress}`)
                return 0
            }

            console.log(`✅ Valid wallet address for balance check: ${validAddress}`)

            if (collectionId) {
                // Get balance for specific collection
                const id = Number(collectionId)
                console.log(`🎯 Getting balance for collection ${id} and user: ${validAddress}`)
                const tokenIds = await rateLimiter.executeWithRateLimit(
                    () => this.contract!.call("list_user_tokens_per_collection", [id, validAddress]),
                    `list_user_tokens_per_collection_${id}_${validAddress}`,
                    60000 // 1 minute cache
                )
                const balance = Array.isArray(tokenIds) ? tokenIds.length : 0
                console.log(`💰 User ${validAddress} has ${balance} tokens in collection ${collectionId}`)
                return balance
            } else {
                // Get total balance across all collections
                console.log(`🎯 Getting total balance across all collections for user: ${validAddress}`)
                const userTokens = await this.getUserTokens(userAddress)
                const totalBalance = userTokens.length
                console.log(`💰 User ${validAddress} has ${totalBalance} total tokens across all collections`)
                return totalBalance
            }
        } catch (error) {
            console.error(`❌ Error getting user token balance for ${userAddress}:`, error)
            return 0
        }
    }

    /**
     * Fetch IPFS metadata with enhanced error handling and caching
     */
    private async fetchIPFSMetadata(ipfsHash: string): Promise<CollectionMetadata | null> {
        try {
            // Handle different IPFS hash formats
            let url = ipfsHash
            if (ipfsHash.startsWith('ipfs://')) {
                url = ipfsHash.replace('ipfs://', 'https://ipfs.io/ipfs/')
            } else if (ipfsHash.startsWith('Qm') || ipfsHash.startsWith('bafy') || ipfsHash.startsWith('bafk')) {
                url = `https://ipfs.io/ipfs/${ipfsHash}`
            }

            console.log(`Fetching metadata from: ${url}`)
            
            const response = await fetch(url, {
                method: 'GET',
                        headers: {
                    'Accept': 'application/json, image/*, */*',
                        },
                // Add timeout
                signal: AbortSignal.timeout(10000) // 10 second timeout
                    })

                    if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`)
            }

            // Check if the response is JSON or an image
            const contentType = response.headers.get('content-type')
            console.log(`Content-Type: ${contentType}`)
            
            // If content-type is explicitly image, treat as direct image
            if (contentType && contentType.startsWith('image/')) {
                console.log(`IPFS hash ${ipfsHash} contains a direct image (${contentType}), not JSON metadata`)
                return null
            }

            // Try to parse as JSON regardless of content-type (some IPFS gateways return wrong content-type)
                    try {
                        const text = await response.text()
                console.log(`Response text preview: ${text.substring(0, 200)}...`)
                
                // Check if it looks like JSON
                if (text.trim().startsWith('{') || text.trim().startsWith('[')) {
                        const metadata = JSON.parse(text)
                    console.log(`Successfully parsed JSON metadata from ${ipfsHash}`)
                    return metadata as CollectionMetadata
                } else {
                    console.warn(`Response from ${ipfsHash} doesn't look like JSON, treating as direct image`)
                    return null
                }
            } catch (jsonError) {
                console.warn(`Failed to parse JSON from ${ipfsHash}, treating as direct image:`, jsonError)
                return null
            }
        } catch (error) {
            console.warn(`Failed to fetch IPFS metadata from ${ipfsHash}:`, error)
            return null
        }
    }

    /**
     * Format address as hex with validation
     */
    private formatAddressAsHex(address: any): string {
        try {
            if (!address) return "0x0"
            
            // Handle different address formats
            if (typeof address === 'string') {
                if (address.startsWith('0x')) {
                    return address.toLowerCase()
                }
                return `0x${address.toLowerCase()}`
            }
            
            // Handle bigint or number
            if (typeof address === 'bigint' || typeof address === 'number') {
                return `0x${address.toString(16)}`
            }
            
            return "0x0"
        } catch (error) {
            console.warn("Error formatting address:", error)
            return "0x0"
        }
    }

    /**
     * Get IPFS gateway URL with fallback options
     */
    private getIPFSGatewayUrl(ipfsHash: string): string {
        // Remove ipfs:// prefix if present
        const cleanHash = ipfsHash.replace('ipfs://', '')
        // Use custom gateway from env if set
        const customGateway = process.env.NEXT_PUBLIC_PINATA_GATEWAY;
        if (customGateway) {
            // Ensure trailing slash and /ipfs/ path
            return customGateway.replace(/\/$/, '') + '/ipfs/' + cleanHash;
        }
        // List of reliable IPFS gateways (in order of preference)
        const gateways = [
            'https://ipfs.io/ipfs/',
            'https://gateway.pinata.cloud/ipfs/',
            'https://cloudflare-ipfs.com/ipfs/',
            'https://ipfs.fleek.co/ipfs/'
        ];
        // Use the first fallback gateway
        return gateways[0] + cleanHash;
    }

    /**
     * Process image data with fallbacks and IPFS support
     */
    private processImageData(imageData: string): string {
        if (!imageData) return "/placeholder.svg"
        
        // Handle IPFS URLs with ipfs:// protocol
        if (imageData.startsWith('ipfs://')) {
            return this.getIPFSGatewayUrl(imageData)
        }
        
        // Handle IPFS URLs with different gateways (production might use different gateways)
        if (imageData.includes('ipfs.io/ipfs/') || 
            imageData.includes('gateway.pinata.cloud/ipfs/') ||
            imageData.includes('cloudflare-ipfs.com/ipfs/')) {
            return imageData
        }
        
        // Handle IPFS hashes (Qm... or bafy... or bafk...)
        if (imageData.match(/^(Qm[1-9A-HJ-NP-Za-km-z]{44}|bafy[a-z2-7]{55}|bafk[a-z2-7]{55,59})$/)) {
            return this.getIPFSGatewayUrl(imageData)
        }
        
        // Handle relative URLs
        if (imageData.startsWith('/')) {
            return imageData
        }
        
        // Handle data URLs
        if (imageData.startsWith('data:')) {
            return imageData
        }

        // Handle external URLs
        if (imageData.startsWith('http')) {
            return imageData
        }

        // If it looks like an IPFS hash but doesn't match the exact pattern, try it anyway
        if (imageData.length > 40 && !imageData.includes('/') && !imageData.includes('.')) {
            return this.getIPFSGatewayUrl(imageData)
        }
        
        // Default fallback
        return "/placeholder.svg"
    }

    /**
     * Parse collection data with enhanced metadata handling
     */
    private async parseCollectionData(data: ContractCollection, index: number): Promise<Collection | null> {
        try {
            // Default to contract data
            let creatorAddress = data.owner || "unknown"
            let createdAt: string = "";

            // Start with contract data
            let collection: Collection = {
                id: index.toString(),
                slug: `collection-${index}`,
                name: data.name || `Collection ${index}`,
                description: data.symbol || "",
                coverImage: "/placeholder.svg",
                bannerImage: "",
                creator: {
                    id: this.formatAddressAsHex(creatorAddress) || "unknown",
                    username: `user-${this.formatAddressAsHex(creatorAddress)}`,
                    name: `User ${this.formatAddressAsHex(creatorAddress)}`,
                    avatar: "/placeholder.svg",
                    verified: false,
                    wallet: this.formatAddressAsHex(creatorAddress) || "0x0"
                },
                assets: 0, // Will be populated by getCollectionStats
                views: undefined, // No views tracking in current contract
                likes: undefined,
                floorPrice: undefined,
                totalVolume: undefined,
                createdAt: "", // will be set after IPFS metadata
                updatedAt: "",
                category: "digital art", // Default fallback, will be updated from IPFS metadata
                tags: "",
                isPublic: Boolean(data.is_active),
                isFeatured: false,
                blockchain: "Starknet",
                contractAddress: MIP_COLLECTIONS_CONTRACT,
                requireApproval: (data as any).requireApproval || false
            }

            // Try to fetch metadata from IPFS using base_uri
            if (data.base_uri) {
                try {
                    const metadata = await this.fetchIPFSMetadata(data.base_uri)
                    if (metadata) {
                        // Use IPFS creator if available
                        if (metadata.creator) {
                            creatorAddress = this.formatAddressAsHex(metadata.creator)
                            collection.creator = {
                                id: creatorAddress || "unknown",
                                username: `user-${creatorAddress}`,
                                name: `User ${creatorAddress}`,
                                avatar: "/placeholder.svg",
                                verified: false,
                                wallet: creatorAddress || "0x0"
                            }
                        }
                        // Use IPFS createdAt if available (try created_at, createdAt, timestamp)
                        if (metadata.created_at && !isNaN(Date.parse(metadata.created_at))) {
                            createdAt = metadata.created_at;
                        } else if (metadata.createdAt && !isNaN(Date.parse(metadata.createdAt))) {
                            createdAt = metadata.createdAt;
                        } else if (metadata.timestamp && !isNaN(Date.parse(metadata.timestamp))) {
                            createdAt = metadata.timestamp;
                        }
                        if (createdAt) {
                            collection.createdAt = createdAt;
                            collection.updatedAt = createdAt;
                        }
                        // ...existing IPFS metadata parsing logic...
                        collection.name = metadata.name || collection.name
                        collection.description = metadata.description || collection.description
                        if (metadata.image) {
                            collection.coverImage = this.processImageData(metadata.image)
                        } else if (metadata.coverImage) {
                            collection.coverImage = this.processImageData(metadata.coverImage)
                        }
                        if (metadata.banner_image) {
                            collection.bannerImage = this.processImageData(metadata.banner_image)
                        }
                        if (metadata.category) {
                            collection.category = metadata.category.toLowerCase()
                        }
                        if (metadata.visibility) {
                            collection.isPublic = metadata.visibility.toLowerCase() === 'public'
                        }
                        if (metadata.tags && Array.isArray(metadata.tags)) {
                            collection.tags = metadata.tags.join(", ")
                        }
                        if (metadata.external_url) {
                            collection.externalUrl = metadata.external_url
                        }
                        if (metadata.seller_fee_basis_points) {
                            collection.sellerFeeBasisPoints = metadata.seller_fee_basis_points
                        }
                        if (metadata.fee_recipient) {
                            collection.feeRecipient = metadata.fee_recipient
                        }
                        if (metadata.attributes && Array.isArray(metadata.attributes)) {
                            collection.attributes = metadata.attributes
                        }
                        if (metadata.type) {
                            collection.type = metadata.type
                        }
                    } else {
                        // If metadata is null, the base_uri might be a direct image URL
                        collection.coverImage = this.processImageData(data.base_uri)
                    }
                } catch (metadataError) {
                    collection.coverImage = this.processImageData(data.base_uri)
                }
            }

            // Try to get collection stats if available
            try {
                const stats = await this.getCollectionStatsWithCache(index.toString())
                if (stats) {
                    collection.assets = Number(stats.total_minted || 0)
                }
            } catch (statsError) {}
            
            if (!collection.createdAt) {
                collection.createdAt = "";
            }
            if (!collection.updatedAt) {
                collection.updatedAt = collection.createdAt;
            }
            return collection
        } catch (error) {
            return null
        }
    }

    /**
     * Match collection against filters
     */
    private matchesFilters(collection: Collection, filters: CollectionFilters): boolean {
        if (filters.search) {
            const searchTerm = filters.search.toLowerCase()
            const searchableText = [
                collection.name,
                collection.description,
                collection.creator.name,
                collection.category,
                collection.tags
            ].join(' ').toLowerCase()
            
            if (!searchableText.includes(searchTerm)) {
                return false
            }
        }

        if (filters.category && filters.category !== 'all') {
            if (collection.category.toLowerCase() !== filters.category.toLowerCase()) {
                return false
            }
        }

        if (filters.creator) {
            if (!collection.creator.name.toLowerCase().includes(filters.creator.toLowerCase()) &&
                !collection.creator.username.toLowerCase().includes(filters.creator.toLowerCase())) {
                return false
            }
        }

        if (filters.featured !== undefined) {
            if (collection.isFeatured !== filters.featured) {
                return false
            }
        }

        if (filters.isPublic !== undefined) {
            if (collection.isPublic !== filters.isPublic) {
                return false
            }
        }

        return true
    }

    /**
     * Sort collections by various criteria
     */
    private sortCollections(collections: Collection[], sortBy?: string): Collection[] {
        const sorted = [...collections]

            switch (sortBy) {
            case 'name':
                return sorted.sort((a, b) => a.name.localeCompare(b.name))
            case 'assets':
                return sorted.sort((a, b) => b.assets - a.assets)
            case 'views':
                return sorted.sort((a, b) => (b.views || 0) - (a.views || 0))
            case 'likes':
                return sorted.sort((a, b) => (b.likes || 0) - (a.likes || 0))
            case 'recent':
                default:
                return sorted.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        }
    }

    /**
     * Get collections owned by a specific user
     */
    public async getUserCollections(userAddress: string): Promise<Collection[]> {
        try {
            console.log(`🔗 Connected user wallet address: ${userAddress}`)
            
            if (!this.contractAvailable || !this.contract) {
                console.log(`❌ Contract not available for user: ${userAddress}`)
                return []
            }

            const validAddress = starknetService.validateAddress(userAddress)
            if (!validAddress) {
                console.log(`❌ Invalid wallet address: ${userAddress}`)
                throw new Error("Invalid user address")
            }

            console.log(`✅ Valid wallet address: ${validAddress}`)
            
            const collectionIds = await rateLimiter.executeWithRateLimit(
                () => this.contract!.call("list_user_collections", [validAddress]),
                `list_user_collections_${validAddress}`,
                30000 // 30 second cache
            )

            console.log(`📋 Found ${Array.isArray(collectionIds) ? collectionIds.length : 0} collections for user: ${validAddress}`)

            if (Array.isArray(collectionIds) && collectionIds.length > 0) {
                const collectionFunctions = collectionIds.map((id) => {
                    return async () => {
                        try {
                            const collection = await this.getCollection(id.toString())
                            return collection
                        } catch (error) {
                            console.error(`Error fetching user collection ${id}:`, error)
                            return null
                        }
                    }
                })

                const collectionResults = await rateLimiter.executeBatch(collectionFunctions, 3)
                const validCollections = collectionResults.filter((collection): collection is Collection => collection !== null)
                console.log(`✅ Successfully fetched ${validCollections.length} collections for user: ${validAddress}`)
                return validCollections
            }

            console.log(`📭 No collections found for user: ${validAddress}`)
            return []
        } catch (error) {
            console.error(`❌ Error fetching user collections for ${userAddress}:`, error)
            return []
        }
    }

    /**
     * Check if contract is available
     */
    public isContractAvailable(): boolean {
        return this.contractAvailable
    }

    /**
     * Get contract status for debugging
     */
    public getContractStatus(): { available: boolean; address?: string; error?: string } {
        return {
            available: this.contractAvailable,
            address: MIP_COLLECTIONS_CONTRACT,
            error: !this.contractAvailable ? "Contract not initialized or address not configured" : undefined
        }
    }

    /**
     * Clear all caches (useful for testing or manual refresh)
     */
    public clearCache(): void {
        this.cache.collections.clear()
        this.cache.assets.clear()
        this.cache.stats.clear()
        this.cache.discovery = { data: [], timestamp: 0, expiresAt: 0, version: '1.0' }
        this.cache.lastDiscovery = 0
        console.log("CollectionsService cache cleared")
    }

    /**
     * Get cache statistics for monitoring
     */
    public getCacheStats(): {
        collections: number
        assets: number
        stats: number
        discoveryAge: number
    } {
        const now = Date.now()
                return {
            collections: this.cache.collections.size,
            assets: this.cache.assets.size,
            stats: this.cache.stats.size,
            discoveryAge: now - this.cache.lastDiscovery
        }
    }
}

// Export singleton instance
export const collectionsService = new CollectionsService() 