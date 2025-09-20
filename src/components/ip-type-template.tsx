"use client"

import { useState } from "react"
import {
  FileText,
  Music,
  Palette,
  Video,
  Lightbulb,
  BookOpen,
  Briefcase,
  Download,
  Shield,
  Globe,
  DollarSign,
  Clock,
  Users,
  CheckCircle2,
  Star,
  TrendingUp,
  Zap,
  Copy,
  ExternalLink,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import { Separator } from "@/src/components/ui/separator"
import { toast } from "@/src/hooks/use-toast"

interface IPTypeTemplateProps {
  ipType: string
  assetData: any
  creatorData: any
}

const getIPTypeConfig = (type: string) => {
  const configs = {
    "Digital Art": {
      icon: Palette,
      gradient: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-50 dark:bg-purple-950/20",
      borderColor: "border-purple-200 dark:border-purple-800",
      rights: ["Commercial Use", "Modification Rights", "Distribution", "Resale Rights"],
      formats: ["PNG", "JPG", "SVG", "PSD"],
      licensing: "Royalty-free with attribution",
    },
    Music: {
      icon: Music,
      gradient: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50 dark:bg-green-950/20",
      borderColor: "border-green-200 dark:border-green-800",
      rights: ["Sync Rights", "Performance Rights", "Mechanical Rights", "Master Rights"],
      formats: ["WAV", "MP3", "FLAC", "STEMS"],
      licensing: "Performance royalties apply",
    },
    Patent: {
      icon: Lightbulb,
      gradient: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50 dark:bg-blue-950/20",
      borderColor: "border-blue-200 dark:border-blue-800",
      rights: ["Manufacturing", "Distribution", "Sublicensing", "Improvements"],
      formats: ["PDF", "Technical Docs", "Blueprints", "Specifications"],
      licensing: "Exclusive or non-exclusive terms",
    },
    Literature: {
      icon: BookOpen,
      gradient: "from-orange-500 to-red-500",
      bgColor: "bg-orange-50 dark:bg-orange-950/20",
      borderColor: "border-orange-200 dark:border-orange-800",
      rights: ["Publishing", "Translation", "Adaptation", "Derivative Works"],
      formats: ["PDF", "EPUB", "DOCX", "TXT"],
      licensing: "Traditional publishing terms",
    },
    Brand: {
      icon: Briefcase,
      gradient: "from-indigo-500 to-purple-500",
      bgColor: "bg-indigo-50 dark:bg-indigo-950/20",
      borderColor: "border-indigo-200 dark:border-indigo-800",
      rights: ["Trademark Use", "Brand Guidelines", "Logo Usage", "Merchandising"],
      formats: ["AI", "EPS", "PNG", "Brand Kit"],
      licensing: "Licensed trademark usage",
    },
    "Film/Video": {
      icon: Video,
      gradient: "from-red-500 to-pink-500",
      bgColor: "bg-red-50 dark:bg-red-950/20",
      borderColor: "border-red-200 dark:border-red-800",
      rights: ["Distribution", "Broadcasting", "Streaming", "Merchandising"],
      formats: ["MP4", "MOV", "ProRes", "Raw Footage"],
      licensing: "Distribution and exhibition rights",
    },
  }

  return configs[type] || configs["Digital Art"]
}

export function IPTypeTemplate({ ipType, assetData, creatorData }: IPTypeTemplateProps) {
  const [copied, setCopied] = useState(false)
  const config = getIPTypeConfig(ipType)
  const IconComponent = config.icon

  const handleCopyLicense = async () => {
    const licenseText = `${assetData.name} - ${ipType} License
Creator: ${creatorData?.name || assetData.creator}
License Type: ${config.licensing}
Rights Included: ${config.rights.join(", ")}
Asset ID: ${assetData.id}`

    try {
      await navigator.clipboard.writeText(licenseText)
      setCopied(true)
      toast({
        title: "License copied!",
        description: "License details copied to clipboard",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  const handleDownloadLicense = () => {
    toast({
      title: "Download started",
      description: "License agreement is being prepared",
    })
  }

  return (
    <Card className={`${config.borderColor} border-2 ${config.bgColor}`}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-gradient-to-r ${config.gradient} text-white`}>
              <IconComponent className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg md:text-xl">{ipType} License</CardTitle>
              <p className="text-sm text-muted-foreground">Professional IP licensing template</p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
            <Star className="h-3 w-3 mr-1" />
            Premium
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="text-center p-3 rounded-lg bg-white/50 dark:bg-black/20">
            <Shield className="h-4 w-4 mx-auto mb-1 text-green-500" />
            <div className="text-sm font-semibold">Protected</div>
            <div className="text-xs text-muted-foreground">IP Rights</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-white/50 dark:bg-black/20">
            <Globe className="h-4 w-4 mx-auto mb-1 text-blue-500" />
            <div className="text-sm font-semibold">Global</div>
            <div className="text-xs text-muted-foreground">Coverage</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-white/50 dark:bg-black/20">
            <DollarSign className="h-4 w-4 mx-auto mb-1 text-green-500" />
            <div className="text-sm font-semibold">{assetData.royalty || 5}%</div>
            <div className="text-xs text-muted-foreground">Royalty</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-white/50 dark:bg-black/20">
            <Clock className="h-4 w-4 mx-auto mb-1 text-purple-500" />
            <div className="text-sm font-semibold">Perpetual</div>
            <div className="text-xs text-muted-foreground">Duration</div>
          </div>
        </div>

        <Separator />

        {/* Rights Included */}
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            Rights Included
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {config.rights.map((right, index) => (
              <div key={index} className="flex items-center gap-2 text-sm p-2 rounded bg-white/30 dark:bg-black/20">
                <CheckCircle2 className="h-3 w-3 text-green-500 flex-shrink-0" />
                <span>{right}</span>
              </div>
            ))}
          </div>
        </div>

        {/* File Formats */}
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Available Formats
          </h4>
          <div className="flex flex-wrap gap-2">
            {config.formats.map((format, index) => (
              <Badge key={index} variant="outline" className="bg-white/50 dark:bg-black/20">
                {format}
              </Badge>
            ))}
          </div>
        </div>

        {/* Licensing Terms */}
        <div className="p-4 rounded-lg bg-white/50 dark:bg-black/20 border border-white/20 dark:border-white/10">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Zap className="h-4 w-4 text-yellow-500" />
            Licensing Terms
          </h4>
          <p className="text-sm text-muted-foreground mb-3">{config.licensing}</p>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button size="sm" className="flex-1" onClick={handleDownloadLicense}>
              <Download className="h-4 w-4 mr-2" />
              Download License
            </Button>
            <Button size="sm" variant="outline" className="flex-1 bg-transparent" onClick={handleCopyLicense}>
              <Copy className="h-4 w-4 mr-2" />
              {copied ? "Copied!" : "Copy Details"}
            </Button>
          </div>
        </div>

        {/* Market Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 rounded-lg bg-white/30 dark:bg-black/20">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="font-medium text-sm">Market Demand</span>
            </div>
            <div className="text-lg font-bold text-green-500">High</div>
            <p className="text-xs text-muted-foreground">Strong interest in {ipType.toLowerCase()} assets</p>
          </div>
          <div className="p-3 rounded-lg bg-white/30 dark:bg-black/20">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-blue-500" />
              <span className="font-medium text-sm">Usage Potential</span>
            </div>
            <div className="text-lg font-bold text-blue-500">Commercial</div>
            <p className="text-xs text-muted-foreground">Suitable for business applications</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/20 dark:border-white/10">
          <Button className={`flex-1 bg-gradient-to-r ${config.gradient} hover:opacity-90 text-white`}>
            <FileText className="h-4 w-4 mr-2" />
            Get Full License Agreement
          </Button>
          <Button variant="outline" className="flex-1 bg-white/20 dark:bg-black/20">
            <ExternalLink className="h-4 w-4 mr-2" />
            Legal Documentation
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
