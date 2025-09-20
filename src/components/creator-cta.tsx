"use client"

import { motion } from "framer-motion"
import { ArrowRight, Sparkles, Shield, Zap } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { useRouter } from "next/navigation"

export default function CreatorCTA() {
  const router = useRouter()

  return (
    <section className="py-16 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/30 to-primary/30 -z-10" />

      {/* Animated background elements */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-purple-600/20 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        />
        <motion.div
          className="absolute bottom-1/3 right-1/4 w-96 h-96 rounded-full bg-primary/20 blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.2, 0.4],
          }}
          transition={{
            duration: 10,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        />
      </div>

      <div className="max-w-5xl mx-auto">
        <div className="glass-effect rounded-xl border border-white/20 p-8 md:p-12 relative overflow-hidden">
          <motion.div
            className="absolute -right-24 -top-24 w-64 h-64 rounded-full bg-primary/30 blur-3xl"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 5,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
            }}
          />

          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex flex-col md:flex-row md:items-center md:justify-between gap-8"
            >
              <div className="max-w-2xl">
                <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-full mb-4">
                  <Sparkles className="w-4 h-4 mr-2 text-primary" />
                  <span className="text-sm font-medium">Decentralized IP Marketplace</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">
                  Start Creating Programmable IP Today
                </h2>
                <p className="text-zinc-300 mb-6">
                  Join the future of intellectual property on Starknet. Create, license, and monetize your creative work
                  with zero gas fees and programmable rules.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" className="rounded-full gap-2" onClick={() => router.push("/create/asset")}>
                    Create Your First Asset
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="rounded-full"
                    onClick={() => router.push("/learn/guides")}
                  >
                    Learn More
                  </Button>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-primary/20 p-2">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">Secure & Permissionless</h4>
                    <p className="text-sm text-zinc-400">No gatekeepers or middlemen</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-primary/20 p-2">
                    <Zap className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">Fast & Free Transactions</h4>
                    <p className="text-sm text-zinc-400">Zero gas fees on Starknet</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
