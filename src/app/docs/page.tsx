import { Badge } from "@/src/components/ui/badge"
import Link from "next/link"
import { DocH2, DocH3, DocCodeBlock } from "@/src/components/docs/typography"

const ERROR_CODES = [
  { code: "400", name: "Bad Request", desc: "Missing or invalid parameters" },
  { code: "401", name: "Unauthorized", desc: "Missing or invalid x-api-key" },
  { code: "403", name: "Forbidden", desc: "Key exists but lacks required permission" },
  { code: "404", name: "Not Found", desc: "Resource does not exist" },
  { code: "409", name: "Conflict", desc: "Duplicate resource or state conflict" },
  { code: "429", name: "Too Many Requests", desc: "Rate limit or monthly quota exceeded" },
  { code: "500", name: "Server Error", desc: "Internal error — try again or contact support" },
]

const RATE_LIMITS = [
  { plan: "FREE", monthly: "50 requests", perMinute: "—", reset: "1st of each month" },
  { plan: "PREMIUM", monthly: "Unlimited", perMinute: "3,000 req/min", reset: "—" },
]

export default function DocsPage() {
  return (
    <div className="space-y-2">
      <Badge className="bg-primary/10 text-primary border-primary/30 px-3 py-1 text-xs">
        Getting Started
      </Badge>

      <h1 className="text-4xl font-extrabold text-white leading-tight">
        Medialane API — Getting Started
      </h1>

      <p className="text-muted-foreground text-lg mt-2 mb-8">
        One REST API for all Starknet IP data. Get a key, make a request, and integrate in minutes.
      </p>

      {/* Quick Start */}
      <DocH2 id="quick-start">Quick Start</DocH2>
      <ol className="space-y-6">
        <li className="flex gap-4">
          <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/20 text-primary text-sm font-bold flex items-center justify-center">1</span>
          <div>
            <p className="text-white font-medium mb-1">Get your API key</p>
            <p className="text-muted-foreground text-sm">
              Sign in at <Link href="/account" className="text-primary hover:underline">/account</Link> and create a free API key from the portal dashboard. You can create up to 5 keys.
            </p>
          </div>
        </li>
        <li className="flex gap-4">
          <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/20 text-primary text-sm font-bold flex items-center justify-center">2</span>
          <div>
            <p className="text-white font-medium mb-1">Make your first request</p>
            <DocCodeBlock lang="bash">{`curl https://medialane-backend-production.up.railway.app/v1/orders \\
  -H "x-api-key: ml_live_YOUR_KEY"`}</DocCodeBlock>
          </div>
        </li>
        <li className="flex gap-4">
          <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/20 text-primary text-sm font-bold flex items-center justify-center">3</span>
          <div>
            <p className="text-white font-medium mb-1">Integrate in your app</p>
            <p className="text-muted-foreground text-sm">
              Use the <Link href="/docs/sdk" className="text-primary hover:underline">medialane-sdk</Link> for a typed client, or call the REST API directly from any language.
            </p>
          </div>
        </li>
      </ol>

      {/* Authentication */}
      <DocH2 id="authentication">Authentication</DocH2>
      <p className="text-muted-foreground mb-3">
        All requests require an API key. Pass it in the <code className="font-mono text-xs bg-white/10 px-1.5 py-0.5 rounded">x-api-key</code> header:
      </p>
      <DocCodeBlock lang="bash">{`curl https://medialane-backend-production.up.railway.app/v1/orders \\
  -H "x-api-key: ml_live_YOUR_KEY"

# Bearer token also accepted:
# -H "Authorization: Bearer ml_live_YOUR_KEY"`}</DocCodeBlock>
      <p className="text-muted-foreground text-sm">
        API keys are prefixed <code className="font-mono text-xs bg-white/10 px-1.5 py-0.5 rounded">ml_live_</code>. Keep them secret — treat them like passwords.
      </p>

      {/* Base URL */}
      <DocH2 id="base-url">Base URL</DocH2>
      <DocCodeBlock>{`https://medialane-backend-production.up.railway.app`}</DocCodeBlock>
      <p className="text-muted-foreground text-sm">All endpoints are versioned under <code className="font-mono text-xs bg-white/10 px-1.5 py-0.5 rounded">/v1/</code>.</p>

      {/* Response format */}
      <DocH2 id="response-format">Response Format</DocH2>
      <p className="text-muted-foreground mb-3">All responses are JSON. Successful list responses wrap data in a <code className="font-mono text-xs bg-white/10 px-1.5 py-0.5 rounded">data</code> array with pagination in <code className="font-mono text-xs bg-white/10 px-1.5 py-0.5 rounded">meta</code>.</p>
      <DocH3>Success</DocH3>
      <DocCodeBlock>{`{
  "data": [...],
  "meta": { "total": 128, "page": 1, "limit": 20 }
}`}</DocCodeBlock>
      <DocH3>Error</DocH3>
      <DocCodeBlock>{`{
  "error": "Unauthorized",
  "message": "Invalid or missing API key"
}`}</DocCodeBlock>

      {/* Error codes */}
      <DocH2 id="error-codes">Error Codes</DocH2>
      <div className="rounded-xl border border-white/10 overflow-hidden">
        <div className="grid grid-cols-3 px-5 py-3 bg-white/[0.03] border-b border-white/10 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          <span>Code</span>
          <span>Name</span>
          <span>Description</span>
        </div>
        {ERROR_CODES.map((row, i) => (
          <div key={row.code} className={`grid grid-cols-3 px-5 py-3 items-center text-sm ${i < ERROR_CODES.length - 1 ? "border-b border-white/5" : ""}`}>
            <span className="font-mono font-semibold text-red-400">{row.code}</span>
            <span className="text-white">{row.name}</span>
            <span className="text-muted-foreground">{row.desc}</span>
          </div>
        ))}
      </div>

      {/* Rate limits */}
      <DocH2 id="rate-limits">Rate Limits</DocH2>
      <p className="text-muted-foreground mb-3 text-sm">
        Portal management calls (<code className="font-mono text-xs bg-white/10 px-1.5 py-0.5 rounded">/v1/portal/*</code>) never count toward the monthly quota.
      </p>
      <div className="rounded-xl border border-white/10 overflow-hidden">
        <div className="grid grid-cols-4 px-5 py-3 bg-white/[0.03] border-b border-white/10 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          <span>Plan</span>
          <span>Monthly</span>
          <span>Per Minute</span>
          <span>Reset</span>
        </div>
        {RATE_LIMITS.map((row, i) => (
          <div key={row.plan} className={`grid grid-cols-4 px-5 py-3 items-center text-sm ${i < RATE_LIMITS.length - 1 ? "border-b border-white/5" : ""}`}>
            <span className="font-semibold text-white">{row.plan}</span>
            <span className="text-muted-foreground">{row.monthly}</span>
            <span className="text-muted-foreground">{row.perMinute}</span>
            <span className="text-muted-foreground">{row.reset}</span>
          </div>
        ))}
      </div>

      <p className="text-muted-foreground text-sm mt-6">
        When you exceed a limit, you receive a <code className="font-mono text-xs bg-white/10 px-1.5 py-0.5 rounded">429</code> response. PREMIUM users see no monthly cap — only the per-minute rate limit applies.
      </p>
    </div>
  )
}
