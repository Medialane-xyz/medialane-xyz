"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import {
  Github,
  Twitter,
  Instagram,
  Linkedin,
  Zap,
  Shield,
  Globe,
  Users,
  Sparkles,
  Search,
  LayoutGrid,
  Wallet,
  PlusCircle,
  BarChart3,
  BookOpen,
  FileText,
  HelpCircle,
  Settings,
  ChevronRight,
  Heart,
  Award,
  Layers,
  Code,
  Lightbulb,
  Flame,
} from "lucide-react"
import { ThemeToggle } from "@/src/components/theme-toggle"
import { useMobile } from "@/src/hooks/use-mobile"

export default function Footer() {
  const isMobile = useMobile()

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  }

  // Main navigation categories with icons and links
  const mainNavigation = [
    {
      title: "Explore",
      icon: Search,
      color: "text-purple-400",
      links: [
        { name: "All Assets", href: "/explore" },
        { name: "Collections", href: "/collections" },
        { name: "Trending", href: "/explore?sort=trending" },
        { name: "New Releases", href: "/explore/new" },
        { name: "Categories", href: "/explore?view=categories" },
      ],
    },
    {
      title: "Create",
      icon: PlusCircle,
      color: "text-blue-400",
      links: [
        { name: "New Asset", href: "/create" },
        { name: "New Collection", href: "/create?type=collection" },
        { name: "Batch Upload", href: "/create?type=batch" },
        { name: "Templates", href: "/create?view=templates" },
      ],
    },
    {
      title: "Marketplace",
      icon: LayoutGrid,
      color: "text-cyan-400",
      links: [
        { name: "Buy", href: "/marketplace?type=buy" },
        { name: "Sell", href: "/marketplace?type=sell" },
        { name: "Auctions", href: "/marketplace?type=auctions" },
        { name: "Offers", href: "/marketplace?type=offers" },
        { name: "Licensing", href: "/licensing" },
      ],
    },
    {
      title: "Portfolio",
      icon: Wallet,
      color: "text-green-400",
      links: [
        { name: "Dashboard", href: "/portfolio/dashboard" },
        { name: "My Assets", href: "/portfolio?tab=assets" },
        { name: "My Collections", href: "/portfolio?tab=collections" },
        { name: "Licensing", href: "/portfolio/licensings" },
        { name: "Analytics", href: "/portfolio?tab=analytics" },
      ],
    },
  ]

  // Resources and support links
  const resourceLinks = [
    {
      title: "Resources",
      icon: BookOpen,
      color: "text-amber-400",
      links: [
        { name: "Documentation", href: "/docs" },
        { name: "API Reference", href: "/docs/api" },
        { name: "Tutorials", href: "/tutorials" },
        { name: "Developer Hub", href: "/developers" },
      ],
    },
    {
      title: "Legal",
      icon: FileText,
      color: "text-red-400",
      links: [
        { name: "Terms of Service", href: "/legal/terms" },
        { name: "Privacy Policy", href: "/legal/privacy" },
        { name: "IP Protection", href: "/legal/ip-protection" },
        { name: "Licensing Terms", href: "/legal/licensing" },
      ],
    },
    {
      title: "Support",
      icon: HelpCircle,
      color: "text-indigo-400",
      links: [
        { name: "Help Center", href: "/help" },
        { name: "Contact Us", href: "/contact" },
        { name: "FAQs", href: "/faqs" },
        { name: "Report Issue", href: "/support/report" },
      ],
    },
    {
      title: "Company",
      icon: Settings,
      color: "text-orange-400",
      links: [
        { name: "About Us", href: "/about" },
        { name: "Careers", href: "/careers" },
        { name: "Blog", href: "/blog" },
        { name: "Press Kit", href: "/press" },
      ],
    },
  ]

  // Platform features with icons
  const features = [
    { icon: Zap, text: "Zero-Fee Trading" },
    { icon: Shield, text: "IP Protection" },
    { icon: Globe, text: "Global Marketplace" },
    { icon: Users, text: "Creator Community" },
    { icon: BarChart3, text: "Analytics Dashboard" },
    { icon: Layers, text: "Multi-Chain Support" },
  ]

  // Platform stats
  const stats = [
    { label: "Active Creators", value: "10K+", color: "text-purple-400", icon: Users },
    { label: "IP Assets", value: "50K+", color: "text-blue-400", icon: Layers },
    { label: "Trading Volume", value: "$5M+", color: "text-green-400", icon: BarChart3 },
    { label: "Transactions", value: "120K+", color: "text-cyan-400", icon: Zap },
  ]

  return (
    <footer className="relative bg-gradient-to-br from-black via-gray-900 to-black border-t border-gray-800/50 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-cyan-500/5" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />

      {/* Main Navigation Section */}
      <div className="relative border-b border-gray-800/50">
        <motion.div
          className="container mx-auto px-4 py-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.h2
            className="text-2xl font-bold mb-8 text-center bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent"
            variants={itemVariants}
          >
            Explore MediaLane
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {mainNavigation.map((category, idx) => (
              <motion.div key={idx} className="space-y-4" variants={itemVariants}>
                <h3 className={`text-lg font-semibold flex items-center ${category.color}`}>
                  <category.icon className="h-5 w-5 mr-2" />
                  {category.title}
                </h3>
                <ul className="space-y-2">
                  {category.links.map((link, linkIdx) => (
                    <li key={linkIdx}>
                      <Link
                        href={link.href}
                        className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center group"
                      >
                        <ChevronRight className="h-3 w-3 mr-1 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-200" />
                        <span>{link.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Resources and Support Section */}
      <div className="relative border-b border-gray-800/50">
        <motion.div
          className="container mx-auto px-4 py-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {resourceLinks.map((category, idx) => (
              <motion.div key={idx} className="space-y-4" variants={itemVariants}>
                <h3 className={`text-lg font-semibold flex items-center ${category.color}`}>
                  <category.icon className="h-5 w-5 mr-2" />
                  {category.title}
                </h3>
                <ul className="space-y-2">
                  {category.links.map((link, linkIdx) => (
                    <li key={linkIdx}>
                      <Link
                        href={link.href}
                        className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center group"
                      >
                        <ChevronRight className="h-3 w-3 mr-1 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-200" />
                        <span>{link.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Stats Section */}
      <motion.div
        className="relative container mx-auto px-4 py-12 border-b border-gray-800/50"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        <motion.h2
          className="text-xl font-bold mb-8 text-center bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent"
          variants={itemVariants}
        >
          Platform Statistics
        </motion.h2>

        <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-6" variants={itemVariants}>
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-4 text-center"
              whileHover={{ scale: 1.03, y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <stat.icon className={`h-6 w-6 mx-auto mb-2 ${stat.color}`} />
              <div className={`text-2xl md:text-3xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
              <div className="text-gray-400 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Brand and Features Section */}
      <motion.div
        className="relative container mx-auto px-4 py-12"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Brand Section */}
          <motion.div className="lg:col-span-4" variants={itemVariants}>
            <div className="flex items-center space-x-3 mb-6">
              <div className="relative">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 h-4 w-4 bg-green-500 rounded-full animate-pulse" />
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  MediaLane
                </span>
                <div className="text-xs text-purple-400 font-medium">BETA</div>
              </div>
            </div>

            <p className="text-gray-300 text-lg leading-relaxed mb-6 max-w-md">
              The world's first <span className="text-purple-400 font-semibold">zero-fee</span> marketplace for
              programmable IP. Empowering creators to monetize their digital assets and intellectual property.
            </p>

            {/* Feature Highlights */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className="flex items-center space-x-2 text-sm text-gray-400"
                  whileHover={{ scale: 1.05, color: "#a855f7" }}
                  transition={{ duration: 0.2 }}
                >
                  <feature.icon className="h-4 w-4 text-purple-400" />
                  <span>{feature.text}</span>
                </motion.div>
              ))}
            </div>

            {/* Social Links */}
            <div className="flex space-x-4">
              {[
                { icon: Twitter, href: "#", label: "Twitter" },
                { icon: Instagram, href: "#", label: "Instagram" },
                { icon: Github, href: "#", label: "GitHub" },
                { icon: Linkedin, href: "#", label: "LinkedIn" },
              ].map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  className="p-3 rounded-xl bg-gray-800/50 border border-gray-700/50 text-gray-400 hover:text-white hover:bg-purple-500/20 hover:border-purple-500/50 transition-all duration-300"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <social.icon className="h-5 w-5" />
                  <span className="sr-only">{social.label}</span>
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Quick Access Links */}
          <motion.div className="lg:col-span-4" variants={itemVariants}>
            <h3 className="text-lg font-semibold mb-6 flex items-center text-white">
              <Flame className="h-5 w-5 mr-2 text-orange-400" />
              Popular Features
            </h3>

            <div className="grid grid-cols-1 gap-3">
              {[
                {
                  icon: Heart,
                  color: "from-pink-500 to-purple-500",
                  text: "Favorite Collections",
                  href: "/collections?filter=popular",
                },
                { icon: Award, color: "from-amber-500 to-orange-500", text: "Top Creators", href: "/creators" },
                {
                  icon: Lightbulb,
                  color: "from-blue-500 to-cyan-500",
                  text: "IP Licensing Guide",
                  href: "/guides/licensing",
                },
                { icon: Code, color: "from-green-500 to-emerald-500", text: "Developer API", href: "/developers/api" },
              ].map((feature, index) => (
                <Link key={index} href={feature.href}>
                  <motion.div
                    className="p-4 rounded-xl border border-gray-800/50 bg-gray-900/30 hover:bg-gray-800/50 transition-all duration-300 flex items-center space-x-3"
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div
                      className={`h-10 w-10 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center`}
                    >
                      <feature.icon className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-medium text-white">{feature.text}</span>
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Theme and Language */}
          <motion.div className="lg:col-span-4" variants={itemVariants}>
            <h3 className="text-lg font-semibold mb-6 flex items-center text-white">
              <Settings className="h-5 w-5 mr-2 text-blue-400" />
              Preferences
            </h3>

            <div className="space-y-6">
              {/* Theme Toggle */}
              <div className="p-4 rounded-xl border border-gray-800/50 bg-gray-900/30">
                <h4 className="text-sm font-medium text-gray-300 mb-3">Theme</h4>
                <div className="flex items-center justify-between">
                  <span className="text-white">Toggle Light/Dark Mode</span>
                  <ThemeToggle />
                </div>
              </div>

              {/* Language Selector */}
              <div className="p-4 rounded-xl border border-gray-800/50 bg-gray-900/30">
                <h4 className="text-sm font-medium text-gray-300 mb-3">Language</h4>
                <select className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white">
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                  <option value="ja">日本語</option>
                  <option value="zh">中文</option>
                </select>
              </div>

              {/* App Version */}
              <div className="p-4 rounded-xl border border-gray-800/50 bg-gray-900/30">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">App Version</span>
                  <span className="text-white font-mono bg-gray-800 px-2 py-1 rounded text-xs">v0.9.2-beta</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Bottom Section */}
      <motion.div
        className="relative container mx-auto px-4 py-6 border-t border-gray-800/50"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <motion.div
          className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0"
          variants={itemVariants}
        >
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
            <p className="text-gray-400 text-sm">© {new Date().getFullYear()} MediaLane. All rights reserved.</p>
            <div className="flex space-x-4 text-sm">
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <Shield className="h-4 w-4 text-green-400" />
            <span>Secured by blockchain technology</span>
          </div>
        </motion.div>
      </motion.div>
    </footer>
  )
}
