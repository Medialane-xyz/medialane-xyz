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
      <h1 className="text-4xl font-extrabold text-white">medialane-sdk</h1>
      <p className="text-muted-foreground text-lg mb-8">
        Framework-agnostic TypeScript SDK for the Medialane API. Bundles a full REST client and on-chain marketplace helpers in one package.
      </p>

      {/* Install */}
      <DocH2 id="install" border>Install</DocH2>
      <DocCodeBlock lang="bash">{`# bun
bun add medialane-sdk

# npm
npm install medialane-sdk

# yarn
yarn add medialane-sdk`}</DocCodeBlock>
      <p className="text-sm text-muted-foreground">
        Peer dependency: <code className="font-mono text-xs bg-white/10 px-1.5 py-0.5 rounded">starknet@^6</code>
      </p>

      {/* Configure */}
      <DocH2 id="configure" border>Configure</DocH2>
      <p className="text-muted-foreground text-sm mb-3">
        Create a <code className="font-mono text-xs bg-white/10 px-1.5 py-0.5 rounded">MedialaneClient</code> with your network and API key.
      </p>
      <DocCodeBlock>{`import { MedialaneClient } from "medialane-sdk"

const client = new MedialaneClient({
  network: "mainnet",        // "mainnet" | "sepolia"
  rpcUrl: "https://starknet-mainnet.g.alchemy.com/starknet/version/rpc/v0_7/YOUR_KEY",
  backendUrl: "https://api.medialane.xyz",
  apiKey: "ml_live_YOUR_KEY",
  marketplaceContract: "0x059deafbbafbf7051c315cf75a94b03c5547892bc0c6dfa36d7ac7290d4cc33a",
})`}</DocCodeBlock>
      <p className="text-sm text-muted-foreground">
        The <code className="font-mono text-xs bg-white/10 px-1.5 py-0.5 rounded">apiKey</code> is sent as <code className="font-mono text-xs bg-white/10 px-1.5 py-0.5 rounded">x-api-key</code> on every request. Get your key at <Link href="/account" className="text-primary hover:underline">/account</Link>.
      </p>

      {/* Marketplace */}
      <DocH2 id="marketplace" border>Marketplace (on-chain)</DocH2>
      <p className="text-muted-foreground text-sm mb-3">
        <code className="font-mono text-xs bg-white/10 px-1.5 py-0.5 rounded">client.marketplace</code> provides typed wrappers for direct contract calls via starknet.js.
      </p>
      <DocCodeBlock>{`// Get order details directly from the contract
const order = await client.marketplace.getOrderDetails("0x04f7a1...")

// Get the current nonce for signing
const nonce = await client.marketplace.getNonce("0x0591...")

// Mint an NFT into a collection
const tx = await client.marketplace.mint(account, {
  collectionId: "1",
  recipient: "0x0591...",
  tokenUri: "ipfs://...",
})

// Create a new collection
const tx2 = await client.marketplace.createCollection(account, {
  name: "My Collection",
  symbol: "MYC",
  baseUri: "ipfs://...",
})`}</DocCodeBlock>

      {/* API client */}
      <DocH2 id="api-client" border>API Client (REST)</DocH2>
      <p className="text-muted-foreground text-sm mb-3">
        <code className="font-mono text-xs bg-white/10 px-1.5 py-0.5 rounded">client.api</code> mirrors the full REST API surface.
      </p>

      <h3 className="text-lg font-semibold text-white mt-6 mb-3">List open orders</h3>
      <DocCodeBlock>{`const { data, meta } = await client.api.orders.list({
  status: "OPEN",
  limit: 20,
})

console.log(data[0].orderHash, data[0].price)`}</DocCodeBlock>

      <h3 className="text-lg font-semibold text-white mt-6 mb-3">Get a token with metadata</h3>
      <DocCodeBlock>{`const token = await client.api.tokens.get({
  contract: "0x05e7...",
  tokenId: "42",
})

console.log(token.metadata?.name)`}</DocCodeBlock>

      <h3 className="text-lg font-semibold text-white mt-6 mb-3">Create a listing intent</h3>
      <DocCodeBlock>{`// 1. Create the intent — get typed data back
const { intentId, typedData } = await client.api.intents.createListing({
  nftContract: "0x05e7...",
  tokenId: "42",
  price: "500000",
  currency: "USDC",
  offerer: walletAddress,
})

// 2. Sign with starknet.js
import { Account } from "starknet"
const account = new Account(provider, walletAddress, privateKey)
const signature = await account.signMessage(typedData)

// 3. Submit the signature
await client.api.intents.submitSignature(intentId, signature)

// Create a mint intent (no SNIP-12 required)
const mintIntent = await client.api.createMintIntent({
  owner: "0x0591...",
  collectionId: "1",
  recipient: "0x0591...",
  tokenUri: "ipfs://...",
})

// Create a collection intent (no SNIP-12 required)
const collIntent = await client.api.createCollectionIntent({
  owner: "0x0591...",
  name: "My Collection",
  symbol: "MYC",
  baseUri: "ipfs://...",
})`}</DocCodeBlock>

      <h3 className="text-lg font-semibold text-white mt-6 mb-3">Search</h3>
      <DocCodeBlock>{`const results = await client.api.search({ q: "genesis", type: "collection" })
results.data.forEach((r) => console.log(r.name))`}</DocCodeBlock>

      <h3 className="text-lg font-semibold text-white mt-6 mb-3">Portal — manage keys</h3>
      <DocCodeBlock>{`// List your API keys
const { data: keys } = await client.api.portal.listKeys()

// Create a new key
const newKey = await client.api.portal.createKey({ name: "Agent Key" })
console.log(newKey.key) // shown once — save it!

// Get usage
const usage = await client.api.portal.getUsage()`}</DocCodeBlock>

      <div className="mt-10 p-5 rounded-xl border border-primary/20 bg-primary/5">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-white">Full API reference</span> — all REST endpoints, parameters, and response schemas are documented in the{" "}
          <Link href="/docs/api" className="text-primary hover:underline">API Reference</Link>.
        </p>
      </div>
    </div>
  )
}
