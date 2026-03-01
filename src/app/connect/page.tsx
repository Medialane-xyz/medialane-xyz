"use client"

import { useRef, useState } from "react"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Textarea } from "@/src/components/ui/textarea"
import { Twitter, Github, Globe2, MessageCircle, ExternalLink, Send, Loader2 } from "lucide-react"
import { useToast } from "@/src/components/ui/use-toast"
import { BackgroundGradients } from "@/src/components/background-gradients"

const COMMUNITY_LINKS = [
  {
    icon: Twitter,
    name: "X / Twitter",
    handle: "@medialane_xyz",
    desc: "Latest updates, threads, and announcements.",
    href: "https://x.com/medialane_xyz",
    color: "text-sky-400",
    bg: "bg-sky-500/10",
    border: "border-sky-500/20",
  },
  {
    icon: MessageCircle,
    name: "Telegram",
    handle: "t.me/medialane",
    desc: "Join the community chat. Ask questions, share projects.",
    href: "https://t.me/medialane",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  {
    icon: Github,
    name: "GitHub",
    handle: "medialane-io",
    desc: "Open source code, SDK, and protocol contracts.",
    href: "https://github.com/medialane-io",
    color: "text-white",
    bg: "bg-white/10",
    border: "border-white/20",
  },
  {
    icon: Globe2,
    name: "medialane.org",
    handle: "DAO",
    desc: "Protocol governance and DAO participation.",
    href: "https://medialane.org",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
  },
]

export default function ConnectPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" })
  const hpRef = useRef("")

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, _hp: hpRef.current }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to send")
      toast({ title: "Message sent!", description: "We'll get back to you soon." })
      setForm({ name: "", email: "", subject: "", message: "" })
    } catch (err: unknown) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to send message.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative w-full overflow-hidden">
      <BackgroundGradients />

      <div className="relative z-10">
        {/* Hero */}
        <section className="container mx-auto px-4 pt-28 pb-16 max-w-4xl text-center space-y-5">
          <Badge className="bg-primary/10 text-primary border-primary/30 px-4 py-1.5 text-sm">
            Connect
          </Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">
            Join the community
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Follow us for updates, join the conversation, or reach out directly.
          </p>
        </section>

        {/* Community links */}
        <section className="container mx-auto px-4 pb-16 max-w-4xl">
          <div className="grid md:grid-cols-2 gap-5">
            {COMMUNITY_LINKS.map((link) => (
              <a
                key={link.name}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Card className={`${link.border} ${link.bg} hover:bg-white/10 transition-colors cursor-pointer`}>
                  <CardContent className="p-6 flex gap-4 items-start">
                    <div className={`p-3 rounded-xl bg-black/20`}>
                      <link.icon className={`w-6 h-6 ${link.color}`} />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-white">{link.name}</h3>
                        <ExternalLink className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <p className="text-xs text-muted-foreground font-mono">{link.handle}</p>
                      <p className="text-sm text-muted-foreground">{link.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>
        </section>

        {/* DAO card */}
        <section className="container mx-auto px-4 pb-16 max-w-4xl">
          <Card className="border-purple-500/20 bg-gradient-to-br from-purple-900/20 to-background/50">
            <CardContent className="p-8 flex flex-col md:flex-row gap-6 items-center">
              <div className="space-y-3 flex-1">
                <h2 className="text-xl font-bold text-white">Medialane DAO</h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Medialane DAO governs the protocol. Holders participate in governance decisions, treasury allocation, and protocol upgrades. Join at medialane.org.
                </p>
              </div>
              <Button asChild variant="outline" className="flex-shrink-0 border-purple-500/30 hover:bg-purple-500/10 text-purple-300">
                <a href="https://medialane.org" target="_blank" rel="noopener noreferrer">
                  medialane.org
                  <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* Contact form */}
        <section className="container mx-auto px-4 pb-24 max-w-4xl">
          <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="space-y-2 mb-8">
                <h2 className="text-2xl font-bold text-white">Send us a message</h2>
                <p className="text-muted-foreground text-sm">We read every message. Expect a reply within 48 hours.</p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Honeypot field — hidden from humans, ignored by React render cycle */}
                <input
                  type="text"
                  name="_hp"
                  defaultValue=""
                  onChange={(e) => { hpRef.current = e.target.value }}
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  style={{ display: "none" }}
                />

                <div className="grid md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      placeholder="Your name"
                      value={form.name}
                      onChange={set("name")}
                      required
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={set("email")}
                      required
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="What's this about?"
                    value={form.subject}
                    onChange={set("subject")}
                    required
                    className="bg-white/5 border-white/10"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Tell us more..."
                    rows={5}
                    value={form.message}
                    onChange={set("message")}
                    required
                    className="bg-white/5 border-white/10 resize-none"
                  />
                </div>

                <Button type="submit" disabled={loading} className="w-full" size="lg">
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
