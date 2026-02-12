import { AssetDetailPageClient } from "./client"
import { fetchTokenMetadataServer } from "@/src/lib/server/metadata-utils"
import { Metadata } from "next"

type Props = {
    params: Promise<{ slug: string[] }>
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata(
    { params }: Props
): Promise<Metadata> {
    const slug = (await params).slug
    const data = await fetchTokenMetadataServer(slug)

    if (!data) {
        return {
            title: "Not Found",
            description: "Asset not found on MediaLane"
        }
    }

    return {
        title: data.name,
        description: data.description,
        alternates: {
            // Using join to reconstruct path, ensuring no trailing slash issues if slug is empty (which shouldn't happen here)
            canonical: `/assets/${slug.join('/')}`
        },
        openGraph: {
            title: data.name,
            description: data.description,
            images: [data.image],
        },
        twitter: {
            card: "summary_large_image",
            title: data.name,
            description: data.description,
            images: [data.image],
        }
    }
}

export default async function AssetPage(props: {
    params: Promise<{ slug: string[] }>
    searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const slug = (await props.params).slug
    const data = await fetchTokenMetadataServer(slug)

    // Breadcrumb Schema
    const breadcrumbLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: 'https://medialane.xyz'
            },
            {
                '@type': 'ListItem',
                position: 2,
                name: 'Assets',
                item: 'https://medialane.xyz/assets'
            },
            {
                '@type': 'ListItem',
                position: 3,
                name: data?.name || 'Asset',
                item: `https://medialane.xyz/assets/${slug.join('/')}`
            }
        ]
    }

    const productLd = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: data?.name || "MediaLane Asset",
        description: data?.description,
        image: data?.image,
        offers: {
            '@type': 'Offer',
            availability: 'https://schema.org/InStock',
            price: "0",
            priceCurrency: "ETH"
        }
    }

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }}
            />
            <AssetDetailPageClient />
        </>
    )
}
