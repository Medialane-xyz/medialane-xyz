"use client"

import { motion } from "framer-motion"
import { ArrowLeft, Play, ExternalLink, Code, BookOpen, Terminal, CheckCircle2 } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function WorkshopPage() {
    const router = useRouter()

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            },
        },
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    }

    const steps = [
        {
            number: "01",
            title: "Configuração do ambiente",
            description: "Prepare sua máquina local com o conjunto de ferramentas de desenvolvimento Starknet. (Scarb, Foundry, ASDF).",
            content: (
                <div className="space-y-4">
                    <p className="text-sm text-zinc-400">
                        <strong className="text-white">Instale o Starkup:</strong> Script automatizado para configurar o ambiente.
                    </p>
                    <div className="bg-black/50 border border-white/10 rounded-lg p-3 font-mono text-xs text-cyan-300 overflow-x-auto">
                        curl --proto '=https' --tlsv1.2 -sSf https://sh.starkup.sh | sh
                    </div>
                    <div className="bg-zinc-900/50 rounded-lg p-3 border border-white/5 space-y-2">
                        <p className="text-xs text-zinc-500 uppercase tracking-wider">Verificar Instalação</p>
                        <div className="font-mono text-xs text-zinc-300">scarb -v</div>
                        <div className="font-mono text-xs text-zinc-300">snforge --version</div>
                    </div>
                </div>
            )
        },
        {
            number: "02",
            title: "Prototipagem de Front-end",
            description: "Gere uma UI moderna rapidamente com IA para focar na lógica Web3.",
            content: (
                <div className="space-y-4">
                    <p className="text-sm text-zinc-400">
                        Use o <strong className="text-white">v0.dev</strong> para gerar o frontend Next.js inicial.
                    </p>
                    <div className="bg-zinc-900/50 rounded-lg p-3 border border-white/5">
                        <p className="text-xs text-zinc-500 mb-2 uppercase tracking-wider">Prompt Sugerido</p>
                        <p className="text-sm italic text-zinc-300">"Projetar e implementar um frontend moderno, responsivo e funcional para o dApp de Mint de NFT. Este aplicativo é destinado para o lançamento de uma coleção de NFTs onde cada usuário pode realizar o mint de uma NFT.

                            O escopo desta fase é exclusivamente frontend. O aplicativo deve funcionar inteiramente usando dados simulados para reproduzir interações reais com blockchain. A estrutura final deve estar pronta para produção, para posterior integração com protocolos de backend/blockchain.

                            Funcionalidades Necessárias:
                            1. Configuração do Framework: Utilize Next.js, Tailwind CSS e componentes de UI/UX Shadcn para desenvolvimento rápido e de alta qualidade.
                            2. Responsividade: O design deve ser totalmente responsivo e otimizado para visualização em desktops e dispositivos móveis.
                            3. Estética: O design deve ser minimalista, limpo, confiável e futurista. Utilize o componente de tema shadcn para oferecer os modos claro e escuro.
                            4. Geração de Dados de Mockup: Todos os dados para o aplicativo devem ser gerados como dados de mockup estáticos. Tarefa: Crie uma estrutura de pastas dedicada: src/lib/mock-data/
                            5. Código Final e Documentação: O código final entregue deve ser limpo, modular e bem organizado, refletindo as melhores práticas para desenvolvimento frontend moderno. A lógica para buscar e exibir os dados de mockup deve estar claramente separada dos componentes da interface do usuário."</p>
                    </div>
                    <div className="space-y-2">
                        <p className="text-xs text-zinc-500 uppercase tracking-wider">Rodar Localmente</p>
                        <div className="bg-black/50 border border-white/10 rounded-lg p-2 font-mono text-xs text-cyan-300">
                            npm install
                        </div>
                        <div className="bg-black/50 border border-white/10 rounded-lg p-2 font-mono text-xs text-cyan-300">
                            npm run dev
                        </div>

                    </div>
                </div>
            )
        },
        {
            number: "03",
            title: "Identidade e Autenticação",
            description: "Elimine a fricção de carteiras com login social via Clerk.",
            content: (
                <div className="space-y-4">
                    <p className="text-sm text-zinc-400">
                        Configure o <strong className="text-white">Clerk</strong> para autenticação (Google, Email) e adicione o middleware.
                    </p>
                    <div className="bg-black/50 border border-white/10 rounded-lg p-3 font-mono text-xs text-cyan-300 overflow-x-auto">
                        npm install @clerk/nextjs
                    </div>
                    <div className="space-y-2">
                        <p className="text-xs text-zinc-500 uppercase tracking-wider">Configuração do Middleware</p>
                        <div className="bg-black/50 border border-white/10 rounded-lg p-2 font-mono text-xs text-cyan-300">
                            Utilize o Guia Clerk e crie um arquivo com conteúdo padrão em src/middleware.ts
                        </div>
                    </div>
                </div>
            )
        },
        {
            number: "04",
            title: "Chipipay SDK",
            description: "Configure o Chipipay SDK para experiência web3.",
            content: (
                <div className="space-y-4">
                    <div className="space-y-2">
                        <p className="text-sm text-zinc-400"><strong className="text-white">1. Instale o SDK:</strong></p>
                        <div className="bg-black/50 border border-white/10 rounded-lg p-3 font-mono text-xs text-cyan-300 overflow-x-auto">
                            npm install @chipi-stack/nextjs
                        </div>
                    </div>
                    <div className="space-y-4">
                        <p className="text-sm text-zinc-400">
                            Configure Chipipay API Keys (.env)
                        </p>
                        <div className="bg-black/50 border border-white/10 rounded-lg p-3 font-mono text-xs text-cyan-300 overflow-x-auto">
                            NEXT_PUBLIC_CHIPI_API_KEY=pk_prod_xxxx
                        </div>
                        <div className="space-y-2">
                            <p className="text-xs text-zinc-500 uppercase tracking-wider">Configuração do Provider (layout.tsx)</p>
                            <div className="bg-black/50 border border-white/10 rounded-lg p-2 font-mono text-xs text-cyan-300">
                                Importe e envolva seu aplicativo com o componente ChipiProvider.
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            number: "05",
            title: "Implantação em Produção",
            description: "Faça o deploy com todas as integrações.",
            content: (
                <div className="space-y-4">
                    <div className="bg-zinc-900/50 rounded-lg p-3 border border-white/5 space-y-2">
                        <p className="text-xs text-zinc-500 uppercase tracking-wider">Variáveis de Ambiente (.env)</p>
                        <div className="font-mono text-xs text-orange-300">NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</div>
                        <div className="font-mono text-xs text-orange-300">CLERK_SECRET_KEY</div>
                        <div className="font-mono text-xs text-orange-300">NEXT_PUBLIC_CHIPI_API_KEY</div>
                    </div>
                    <p className="text-sm text-zinc-400">
                        Adicione as chaves acima e sincronize seu repo GitHub com a Vercel (ou outra plataforma de deploy).
                    </p>
                </div>
            )
        }
    ]

    return (
        <div className="min-h-screen py-20 text-foreground selection:bg-cyan-500/30">
            {/* Background Gradients */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-900/20 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-cyan-900/20 blur-[120px] rounded-full" />
            </div>

            <div className="relative z-10 container mx-auto px-4 py-8 md:py-12">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                    className="max-w-5xl mx-auto space-y-16"
                >
                    {/* Header */}
                    <motion.div variants={itemVariants} className="space-y-8 text-center max-w-3xl mx-auto">
                        <div className="space-y-6">
                            <div className="inline-flex items-center rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-sm text-purple-300 backdrop-blur-sm">
                                <span className="flex h-2 w-2 rounded-full bg-purple-500 mr-2 animate-pulse"></span>
                                Workshop Gratuito
                            </div>
                            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-gray-500">
                                Da Web 2 para Web 3 <br className="hidden md:block" />em 1 hora
                            </h1>
                            <p className="text-xl text-zinc-400 leading-relaxed">
                                Transforme qualquer app em uma plataforma web3 de forma simples e rápida com o ecossistema Starknet.
                            </p>
                        </div>

                        {/* Partners */}
                        <div className="flex flex-col items-center gap-3">
                            <div className="text-sm font-medium text-zinc-500 uppercase tracking-widest">
                                Apresentado por
                            </div>
                            <div className="flex flex-wrap justify-center gap-3">
                                {['Starknet', 'Chipipay', 'Medialane'].map((partner) => (
                                    <div key={partner} className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10 hover:border-white/20 transition-colors">
                                        <span className="font-bold text-white tracking-tight">{partner}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Video Section */}
                    <motion.div variants={itemVariants} className="relative aspect-video w-full rounded-2xl overflow-hidden border border-white/10 bg-zinc-900 shadow-2xl shadow-purple-900/20 group max-w-4xl mx-auto">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 pointer-events-none" />
                        <iframe
                            width="100%"
                            height="100%"
                            src="https://www.youtube.com/embed/XC_jgphiu5M?si=mYhBzOeeuozC7Urv"
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            referrerPolicy="strict-origin-when-cross-origin"
                            allowFullScreen
                            className="w-full h-full"
                        ></iframe>
                    </motion.div>

                    {/* Content Grid */}
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Guide Section (Left - Wider) */}
                        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                                    <Code className="h-6 w-6" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">Guia do Desenvolvedor</h2>
                                    <p className="text-sm text-zinc-400">Da Web 2 para a Web 3 em 1 hora</p>
                                    <p className="text-sm text-zinc-400">Este guia fornece um fluxo de trabalho estruturado para desenvolvedores criarem um aplicativo Web 3 na Starknet sem complicações.</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {steps.map((step, index) => (
                                    <div key={index} className="group relative bg-zinc-900/40 border border-white/5 rounded-2xl p-6 hover:border-cyan-500/30 transition-all duration-300 hover:bg-zinc-900/60">
                                        <div className="absolute top-6 right-6 text-4xl font-black text-white/5 group-hover:text-cyan-500/10 transition-colors">
                                            {step.number}
                                        </div>
                                        <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                                            {step.title}
                                        </h3>
                                        <p className="text-zinc-400 text-sm mb-4 leading-relaxed pr-8">
                                            {step.description}
                                        </p>
                                        {step.content}
                                    </div>
                                ))}
                            </div>

                            <div className="pt-4">
                                <Link href="https://drive.google.com/file/d/1ew9A0AO5PsRlqS4Zib9l7p-pmC9TzVA0/view?usp=drive_link" target="_blank" className="w-full">
                                    <Button className="w-full h-12 text-base font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white border-0 shadow-lg shadow-cyan-900/20">
                                        <Terminal className="mr-2 h-5 w-5" />
                                        Baixar Código Fonte (Template Starknet + Chipipay)
                                    </Button>
                                </Link>
                            </div>
                        </motion.div>

                        {/* Resources Section (Right - Narrower) */}
                        <motion.div variants={itemVariants} className="space-y-6">
                            <div className="sticky top-24 space-y-6">
                                <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                            <BookOpen className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-white">Links</h2>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        {[
                                            { name: "Workshop Medialane", url: "https://medialane.xyz/workshop" },
                                            { name: "Documentação Starknet", url: "https://docs.starknet.io/" },
                                            { name: "Chipipay SDK Guide", url: "https://docs.Chipipay.com/" },
                                            { name: "Starknet.js GitHub", url: "https://github.com/starknet-io/starknet.js" },
                                            { name: "Starkup Toolchain", url: "https://github.com/software-mansion/starkup" },
                                        ].map((link) => (
                                            <Link key={link.url} href={link.url} target="_blank" className="block group">
                                                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-purple-500/50 hover:bg-white/10 transition-all">
                                                    <span className="font-medium text-sm text-zinc-300 group-hover:text-white transition-colors">{link.name}</span>
                                                    <ExternalLink className="h-4 w-4 text-zinc-600 group-hover:text-purple-400 transition-colors" />
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-purple-900/20 to-cyan-900/20 border border-white/10 rounded-2xl p-6 text-center">
                                    <p className="text-sm text-zinc-300 mb-3">Dúvidas?</p>
                                    <Link href="https://t.me/integrityweb" target="_blank">
                                        <Button variant="outline" className="w-full border-white/10 hover:bg-white/5 text-white">
                                            Comunidade Telegram
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </div>

            <Button
                variant="ghost"
                className="fixed top-24 left-4 z-50 hidden xl:flex group pl-0 hover:pl-2 transition-all text-muted-foreground hover:text-white"
                onClick={() => router.back()}
            >
                <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                Voltar
            </Button>
        </div>
    )
}
