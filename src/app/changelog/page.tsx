import { Badge } from "@/src/components/ui/badge"
import { BackgroundGradients } from "@/src/components/background-gradients"

interface ChangelogEntry {
  date: string
  title: string
  items: string[]
  tag?: string
}

const ENTRIES: ChangelogEntry[] = [
  {
    date: "2026-03-12",
    title: "Backend v0.2.0 + SDK v0.4.0",
    tag: "Release",
    items: [
      "Batch token fetch: GET /v1/tokens/batch — fetch up to 50 tokens in one request",
      "Batch checkout intent: POST /v1/intents/checkout — fulfill up to 20 orders at once with per-item error handling",
      "Real-time SSE stream: GET /v1/events — subscribe to transfers, order lifecycle events, and keepalive pings",
      "Search upgraded to PostgreSQL full-text with ts_rank relevance scoring",
      "SDK v0.4.0: typed error codes (MedialaneErrorCode) on all errors — MedialaneError and MedialaneApiError now expose .code",
      "SDK v0.4.0: automatic retry with exponential backoff — configurable via retryOptions (maxAttempts, baseDelayMs, maxDelayMs); 4xx errors not retried",
      "SDK v0.4.0: Sepolia network guard — throws NETWORK_NOT_SUPPORTED unless contract addresses are explicitly provided",
      "SDK v0.4.0: CollectionSort named type — \"recent\" | \"supply\" | \"floor\" | \"volume\" | \"name\"",
    ],
  },
  {
    date: "2026-03-01",
    title: "Portal v1 Launch",
    tag: "Launch",
    items: [
      "API key management — create and revoke up to 5 keys per account",
      "Usage dashboard with 30-day daily chart",
      "Monthly quota progress bar (FREE: 50 req/month)",
      "Recent requests table with method, path, and status",
      "Quickstart cURL snippets in the portal",
      "Webhooks support for PREMIUM tenants (ORDER_CREATED, ORDER_FULFILLED, ORDER_CANCELLED, TRANSFER)",
    ],
  },
]

export default function ChangelogPage() {
  return (
    <div className="relative w-full overflow-hidden">
      <BackgroundGradients />

      <div className="relative z-10">
        <section className="container mx-auto px-4 pt-28 pb-16 max-w-3xl">
          <div className="mb-10 space-y-3">
            <Badge className="bg-primary/10 text-primary border-primary/30 px-4 py-1.5 text-sm">
              Changelog
            </Badge>
            <h1 className="text-4xl font-extrabold text-white">What&apos;s new</h1>
            <p className="text-muted-foreground">
              A running log of new features, improvements, and fixes.
            </p>
          </div>

          {/* Timeline */}
          <div className="relative pl-8">
            {/* Vertical line */}
            <div className="absolute left-2.5 top-2 bottom-0 w-px bg-white/10" />

            <div className="space-y-12">
              {ENTRIES.map((entry) => (
                <div key={entry.date} className="relative">
                  {/* Dot */}
                  <div className="absolute -left-8 top-1.5 w-4 h-4 rounded-full border-2 border-primary bg-black" />

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <time className="text-xs font-mono text-muted-foreground">{entry.date}</time>
                      {entry.tag && (
                        <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                          {entry.tag}
                        </Badge>
                      )}
                    </div>

                    <h2 className="text-xl font-bold text-white">{entry.title}</h2>

                    <ul className="space-y-2">
                      {entry.items.map((item, i) => (
                        <li key={i} className="flex gap-2.5 text-sm text-muted-foreground">
                          <span className="text-primary flex-shrink-0 mt-0.5">–</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
