import Link from "next/link"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { Card, CardContent } from "@/src/components/ui/card"
import { Code2, Key, BarChart2, Zap, Play, ArrowRight, Sparkles } from "lucide-react"

export default function Home() {
  return (
    <div className="relative w-full overflow-hidden">
      {/* Background gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-900/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-cyan-900/20 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10">
        {/* API Portal Hero */}
        <section className="container mx-auto px-4 pt-24 pb-16 max-w-5xl text-center space-y-8">
          <Badge className="bg-primary/10 text-primary border-primary/30 px-4 py-1.5 text-sm">
            <Sparkles className="w-3.5 h-3.5 mr-1.5 inline" />
            Developer API — Now in Early Access
          </Badge>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-gray-500 leading-tight">
            Build on Starknet IP
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Medialane is the open IP marketplace on Starknet. Get a free API key and start querying
            NFT metadata, collections, activities, and more — in minutes.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="px-8 h-12 text-base font-semibold">
              <Link href="/account">
                <Key className="w-5 h-5 mr-2" />
                Get Your Free API Key
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="px-8 h-12 text-base border-white/10 hover:bg-white/5">
              <Link href="/workshop">
                <Play className="w-5 h-5 mr-2" />
                Watch Workshop
              </Link>
            </Button>
          </div>

          {/* Feature chips */}
          <div className="flex flex-wrap justify-center gap-3 pt-4">
            {[
              { icon: Code2, label: "REST API" },
              { icon: BarChart2, label: "Usage Analytics" },
              { icon: Key, label: "API Key Management" },
              { icon: Zap, label: "Starknet Native" },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm text-muted-foreground"
              >
                <Icon className="w-3.5 h-3.5 text-primary" />
                {label}
              </div>
            ))}
          </div>
        </section>

        {/* Event + Workshop cards */}
        <section className="container mx-auto px-4 pb-20 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Tec de Monterrey Mint Event */}
            <Card className="border-purple-500/20 bg-gradient-to-br from-purple-900/20 to-background/50 backdrop-blur-sm overflow-hidden group hover:border-purple-500/40 transition-all">
              <CardContent className="p-8 space-y-4">
                <div className="inline-flex items-center rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs text-purple-300">
                  <span className="flex h-2 w-2 rounded-full bg-purple-500 mr-2 animate-pulse" />
                  Live Event
                </div>
                <h2 className="text-2xl font-bold text-white">
                  Tec de Monterrey NFT Mint
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Gasless NFT minting experience powered by ChipiPay and Starknet.
                  Mint your unique digital collectible — no wallet setup required.
                </p>
                <Button asChild variant="outline" className="border-purple-500/30 hover:bg-purple-500/10 text-purple-300 hover:text-purple-200">
                  <Link href="/mint">
                    Mint Now
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Workshop */}
            <Card className="border-cyan-500/20 bg-gradient-to-br from-cyan-900/20 to-background/50 backdrop-blur-sm overflow-hidden group hover:border-cyan-500/40 transition-all">
              <CardContent className="p-8 space-y-4">
                <div className="inline-flex items-center rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-300">
                  <Play className="w-3 h-3 mr-2" />
                  Free Workshop
                </div>
                <h2 className="text-2xl font-bold text-white">
                  Web 2 → Web 3 in 1 Hour
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Full video guide: from zero to a deployed Starknet dApp using
                  Clerk, ChipiPay, and Medialane. In Portuguese.
                </p>
                <Button asChild variant="outline" className="border-cyan-500/30 hover:bg-cyan-500/10 text-cyan-300 hover:text-cyan-200">
                  <Link href="/workshop">
                    Watch Workshop
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  )
}
