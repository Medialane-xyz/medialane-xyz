import React from "react"
import { Badge } from "@/src/components/ui/badge"
import Link from "next/link"
import { DocH2, DocCodeBlock } from "@/src/components/docs/typography"

export default function SdkPage() {
  return (
    <div className="space-y-2">
      <Badge className="bg-primary/10 text-primary border-primary/30 px-3 py-1 text-xs">
        SDK
      </Badge>
      <h1 className="text-4xl font-extrabold text-white">@medialane/sdk</h1>
      <p className="text-muted-foreground text-lg mb-8">
        Framework-agnostic TypeScript SDK for the Medialane API. Bundles a full REST client and on-chain marketplace helpers in one package.
      </p>

      {/* Install */}
      <DocH2 id="install" border>Install</DocH2>
      <DocCodeBlock lang="bash">{`# bun
bun add @medialane/sdk starknet

# npm
npm install @medialane/sdk starknet

# yarn
yarn add @medialane/sdk starknet`}</DocCodeBlock>
      <p className="text-sm text-muted-foreground">
        Peer dependency: <code className="font-mono text-xs bg-white/10 px-1.5 py-0.5 rounded">starknet@^6</code>
      </p>

      {/* Configure */}
      <DocH2 id="configure" border>Configure</DocH2>
      <p className="text-muted-foreground text-sm mb-3">
        Create a <code className="font-mono text-xs bg-white/10 px-1.5 py-0.5 rounded">MedialaneClient</code> with your network and API key.
      </p>
      <DocCodeBlock>{`import { MedialaneClient } from "@medialane/sdk"

const client = new MedialaneClient({
  network: "mainnet",        // "mainnet" | "sepolia"
  rpcUrl: "https://starknet-mainnet.g.alchemy.com/starknet/version/rpc/v0_7/YOUR_KEY",
  backendUrl: "https://medialane-backend-production.up.railway.app",
  apiKey: "ml_live_YOUR_KEY",
  marketplaceContract: "0x059deafbbafbf7051c315cf75a94b03c5547892bc0c6dfa36d7ac7290d4cc33a",
  // Optional: configure retry for transient failures
  retryOptions: {
    maxAttempts: 3,      // default
    baseDelayMs: 300,    // default
    maxDelayMs: 5000,    // default
  },
})`}</DocCodeBlock>
      <p className="text-sm text-muted-foreground">
        The <code className="font-mono text-xs bg-white/10 px-1.5 py-0.5 rounded">apiKey</code> is sent as <code className="font-mono text-xs bg-white/10 px-1.5 py-0.5 rounded">x-api-key</code> on every request. Get your key at <Link href="/account" className="text-primary hover:underline">/account</Link>.
      </p>

      {/* Minting */}
      <DocH2 id="minting" border>Minting & Launchpad</DocH2>
      <p className="text-muted-foreground text-sm mb-3">
        The SDK provides two ways to mint assets: direct on-chain calls (requires signer) and backend-orchestrated intents.
      </p>

      <h3 className="text-lg font-semibold text-white mt-6 mb-3">Mint an asset into a collection</h3>
      <DocCodeBlock>{`// 1. Direct on-chain (client.marketplace)
await client.marketplace.mint(account, {
  collectionId: "42",
  recipient: "0x0591...",
  tokenUri: "ipfs://...",
})

// 2. Via backend intent (client.api)
// No SNIP-12 signing required for mint/create-collection intents
const { intentId, calls } = await client.api.createMintIntent({
  owner: "0x0591...", // collection owner
  collectionId: "42",
  recipient: "0x0592...",
  tokenUri: "ipfs://...",
})`}</DocCodeBlock>

      <h3 className="text-lg font-semibold text-white mt-6 mb-3">Register a new collection</h3>
      <DocCodeBlock>{`// 1. Direct on-chain
await client.marketplace.createCollection(account, {
  name: "My Collection",
  symbol: "MYC",
  baseUri: "ipfs://...",
})

// 2. Via backend intent
const { intentId, calls } = await client.api.createCollectionIntent({
  owner: "0x0591...",
  name: "My Collection",
  symbol: "MYC",
  baseUri: "ipfs://...",
})`}</DocCodeBlock>

      {/* Marketplace */}
      <DocH2 id="marketplace" border>Marketplace (on-chain)</DocH2>
      <p className="text-muted-foreground text-sm mb-3">
        <code className="font-mono text-xs bg-white/10 px-1.5 py-0.5 rounded">client.marketplace</code> provides typed wrappers for direct contract calls via starknet.js.
      </p>
      <DocCodeBlock>{`// Get order details directly from the contract
const order = await client.marketplace.getOrderDetails("0x04f7a1...")

// Get the current nonce for signing
const nonce = await client.marketplace.getNonce("0x0591...")`}</DocCodeBlock>

      {/* API client */}
      <DocH2 id="api-client" border>API Client (REST)</DocH2>
      <p className="text-muted-foreground text-sm mb-3">
        <code className="font-mono text-xs bg-white/10 px-1.5 py-0.5 rounded">client.api</code> mirrors the full REST API surface.
      </p>

      <h3 className="text-lg font-semibold text-white mt-6 mb-3">List open orders</h3>
      <DocCodeBlock>{`const orders = await client.api.getOrders({ status: "ACTIVE", limit: 20 })

console.log(orders.data[0].orderHash, orders.data[0].price)`}</DocCodeBlock>

      <h3 className="text-lg font-semibold text-white mt-6 mb-3">Get a token with metadata</h3>
      <DocCodeBlock>{`const token = await client.api.getToken("0x05e7...", "42")

console.log(token.data.metadata?.name)`}</DocCodeBlock>

      <h3 className="text-lg font-semibold text-white mt-6 mb-3">Get collections by owner</h3>
      <DocCodeBlock>{`// Fetch collections owned by a wallet address
// Addresses are normalized automatically — pass any valid Starknet format
const result = await client.api.getCollectionsByOwner("0x0591...")
result.data.forEach((col) => {
  console.log(col.name, col.collectionId) // collectionId = on-chain registry ID
})`}</DocCodeBlock>

      <h3 className="text-lg font-semibold text-white mt-6 mb-3">Create a listing intent</h3>
      <DocCodeBlock>{`import { toSignatureArray } from "@medialane/sdk"

// 1. Create the intent — get typed data back
const intent = await client.api.createListingIntent({
  nftContract: "0x05e7...",
  tokenId: "42",
  price: "500000",
  currency: "USDC",
  offerer: walletAddress,
  endTime: Math.floor(Date.now() / 1000) + 86400 * 30,
})

// 2. Sign with starknet.js
import { Account } from "starknet"
const account = new Account(provider, walletAddress, privateKey)
const signature = await account.signMessage(intent.data.typedData)

// 3. Submit the signature
await client.api.submitIntentSignature(intent.data.id, toSignatureArray(signature))`}</DocCodeBlock>

      <h3 className="text-lg font-semibold text-white mt-6 mb-3">Search</h3>
      <DocCodeBlock>{`const results = await client.api.search("genesis", 10)
results.data.tokens.forEach((t) => console.log(t.metadata?.name))
results.data.collections.forEach((c) => console.log(c.name))`}</DocCodeBlock>

      <h3 className="text-lg font-semibold text-white mt-6 mb-3">Portal — manage keys</h3>
      <DocCodeBlock>{`// List your API keys
const keys = await client.api.getApiKeys()

// Create a new key
const newKey = await client.api.createApiKey("Agent Key")
console.log(newKey.data.key) // shown once — save it!

// Get usage
const usage = await client.api.getUsage()`}</DocCodeBlock>

      <h3 className="text-lg font-semibold text-white mt-6 mb-3">Batch token fetch</h3>
      <DocCodeBlock>{`// Fetch up to 50 tokens in one request
const result = await client.api.getTokensBatch([
  { contract: "0x05e7...", tokenId: "1" },
  { contract: "0x05e7...", tokenId: "2" },
])
result.data.forEach((token) => console.log(token.tokenId, token.metadata?.name))`}</DocCodeBlock>

      <h3 className="text-lg font-semibold text-white mt-6 mb-3">Batch checkout intent</h3>
      <DocCodeBlock>{`import { toSignatureArray } from "@medialane/sdk"

// Create fulfillment intents for up to 20 orders at once
const intents = await client.api.createCheckoutIntent({
  fulfiller: walletAddress,
  orderHashes: ["0xabc...", "0xdef..."],
})

for (const item of intents.data) {
  if (item.error) {
    console.warn("Failed for order", item.orderHash, item.error)
    continue
  }
  // Sign and submit each successful intent
  const sig = await account.signMessage(item.typedData)
  await client.api.submitIntentSignature(item.id!, toSignatureArray(sig))
}`}</DocCodeBlock>

      <h3 className="text-lg font-semibold text-white mt-6 mb-3" id="real-time-events">Real-time events (SSE)</h3>
      <DocCodeBlock>{`// Get the SSE endpoint URL (includes your API key automatically)
const url = client.api.getEventsUrl()
const source = new EventSource(url)

source.addEventListener("order.fulfilled", (e) => {
  const order = JSON.parse(e.data)
  console.log("Order fulfilled:", order.orderHash)
})

source.addEventListener("transfer", (e) => {
  const transfer = JSON.parse(e.data)
  console.log("Transfer:", transfer.contractAddress, transfer.tokenId)
})

source.addEventListener("order.created", (e) => {
  const order = JSON.parse(e.data)
  console.log("New listing:", order.orderHash, order.price)
})

// Resume from last event on reconnect
source.addEventListener("error", () => {
  source.close()
  const resumeUrl = client.api.getEventsUrl(source.lastEventId || undefined)
  // reconnect: new EventSource(resumeUrl)
})`}</DocCodeBlock>

      <h3 className="text-lg font-semibold text-white mt-6 mb-3">CollectionSort — typed sort options</h3>
      <DocCodeBlock>{`import type { CollectionSort } from "@medialane/sdk"

// "recent" | "supply" | "floor" | "volume" | "name"
const sort: CollectionSort = "floor"
await client.api.getCollections(1, 20, true, sort)`}</DocCodeBlock>

      {/* Error Handling */}
      <DocH2 id="errors" border>Error Handling</DocH2>
      <p className="text-muted-foreground text-sm mb-3">
        The SDK throws <code className="font-mono text-xs bg-white/10 px-1.5 py-0.5 rounded">MedialaneError</code> for marketplace issues and <code className="font-mono text-xs bg-white/10 px-1.5 py-0.5 rounded">MedialaneApiError</code> for REST API failures. Both carry a typed <code className="font-mono text-xs bg-white/10 px-1.5 py-0.5 rounded">.code</code> field from the <code className="font-mono text-xs bg-white/10 px-1.5 py-0.5 rounded">MedialaneErrorCode</code> union.
      </p>
      <DocCodeBlock>{`import { MedialaneError, MedialaneApiError } from "@medialane/sdk"

try {
  await client.marketplace.mint(account, params)
} catch (err) {
  if (err instanceof MedialaneError) {
    console.error(err.code, err.message) // e.g. "TRANSACTION_FAILED"
  }
  if (err instanceof MedialaneApiError) {
    console.error(err.code, err.status, err.message) // e.g. "TOKEN_NOT_FOUND", 404
  }
}`}</DocCodeBlock>

      <DocH2 id="error-codes" border>Error Codes</DocH2>
      <p className="text-muted-foreground text-sm mb-3">
        All errors expose a <code className="font-mono text-xs bg-white/10 px-1.5 py-0.5 rounded">MedialaneErrorCode</code> typed union:
      </p>
      <DocCodeBlock>{`type MedialaneErrorCode =
  | "TOKEN_NOT_FOUND"
  | "COLLECTION_NOT_FOUND"
  | "ORDER_NOT_FOUND"
  | "INTENT_NOT_FOUND"
  | "INTENT_EXPIRED"
  | "RATE_LIMITED"
  | "NETWORK_NOT_SUPPORTED"
  | "APPROVAL_FAILED"
  | "TRANSACTION_FAILED"
  | "INVALID_PARAMS"
  | "UNAUTHORIZED"
  | "UNKNOWN"`}</DocCodeBlock>

      <div className="mt-4 rounded-lg border border-white/10 overflow-hidden">
        <div className="grid grid-cols-[auto_1fr] text-xs">
          <div className="grid grid-cols-subgrid col-span-2 bg-white/5 border-b border-white/10 px-4 py-2 font-semibold text-white">
            <span>Code</span>
            <span>Trigger</span>
          </div>
          {[
            ["TOKEN_NOT_FOUND", "404 response or missing token"],
            ["COLLECTION_NOT_FOUND", "404 on collection lookup"],
            ["ORDER_NOT_FOUND", "404 on order lookup"],
            ["INTENT_NOT_FOUND", "404 on intent lookup"],
            ["INTENT_EXPIRED", "410 response — intent TTL exceeded"],
            ["RATE_LIMITED", "429 response — too many requests"],
            ["NETWORK_NOT_SUPPORTED", "Sepolia selected with no contract addresses"],
            ["APPROVAL_FAILED", "NFT approval missing before listing"],
            ["TRANSACTION_FAILED", "On-chain call reverted"],
            ["INVALID_PARAMS", "400 response — bad request parameters"],
            ["UNAUTHORIZED", "401/403 — missing or invalid API key"],
            ["UNKNOWN", "Unexpected errors"],
          ].map(([code, trigger], i, arr) => (
            <div key={code} className={`grid grid-cols-subgrid col-span-2 px-4 py-2.5 items-start ${i < arr.length - 1 ? "border-b border-white/5" : ""}`}>
              <code className="font-mono text-primary whitespace-nowrap mr-6">{code}</code>
              <span className="text-muted-foreground">{trigger}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="text-sm text-muted-foreground mt-3">
        Note: 4xx errors are <span className="text-white font-medium">not retried</span> automatically. Only transient network and 5xx errors trigger the retry logic configured via <code className="font-mono text-xs bg-white/10 px-1.5 py-0.5 rounded">retryOptions</code>.
      </p>

      <div className="mt-10 p-5 rounded-xl border border-primary/20 bg-primary/5">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-white">Full API reference</span> — all REST endpoints, parameters, and response schemas are documented in the{" "}
          <Link href="/docs/api" className="text-primary hover:underline">API Reference</Link>.
        </p>
      </div>
    </div >
  )
}
