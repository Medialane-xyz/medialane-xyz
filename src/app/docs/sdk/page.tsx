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

      {/* Error Handling */}
      <DocH2 id="errors" border>Error Handling</DocH2>
      <p className="text-muted-foreground text-sm mb-3">
        The SDK throws <code className="font-mono text-xs bg-white/10 px-1.5 py-0.5 rounded">MedialaneError</code> for marketplace issues and <code className="font-mono text-xs bg-white/10 px-1.5 py-0.5 rounded">MedialaneApiError</code> for REST API failures.
      </p>
      <DocCodeBlock>{`try {
  await client.marketplace.mint(account, params)
} catch (err) {
  if (err instanceof MedialaneError) {
    console.error("Marketplace error:", err.message, err.cause)
  }
}`}</DocCodeBlock>

      <div className="mt-10 p-5 rounded-xl border border-primary/20 bg-primary/5">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-white">Full API reference</span> — all REST endpoints, parameters, and response schemas are documented in the{" "}
          <Link href="/docs/api" className="text-primary hover:underline">API Reference</Link>.
        </p>
      </div>
    </div >
  )
}
