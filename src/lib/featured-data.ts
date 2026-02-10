export interface FeaturedItem {
    id: string
    title: string
    description: string
    image: string
    link: string
    ctaText: string
    tag: string
}

export const FEATURED_DATA: FeaturedItem[] = [
    {
        id: "workshop",
        title: "Da Web 2 para Web 3 em 1 hora",
        description: "Aprenda a criar dApps na Starknet com Chipipay neste workshop exclusivo.",
        image: "https://img.youtube.com/vi/XC_jgphiu5M/maxresdefault.jpg",
        link: "/workshop",
        ctaText: "Workshop",
        tag: "Starknet"
    },
    {
        id: "moma",
        title: "MoMA Collection",
        description: "MoMa Photography Collection",
        image: "/moma-banner.jpg",
        link: "/collections/", // Assuming this route exists or will be created/redirected
        ctaText: "Explore",
        tag: "Photography"
    },

]
