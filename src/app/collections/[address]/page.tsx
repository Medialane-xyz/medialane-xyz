import { CollectionDetailPageClient } from "./client"
import { fetchCollectionMetadataServer } from "@/src/lib/server/metadata-utils"
import { Metadata } from "next"

type Props = {
    params: Promise<{ address: string }>
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata(
    { params }: Props
): Promise<Metadata> {
    const address = (await params).address

    // We need to resolve address to collection metadata
    // Our util can handle address -> ID -> metadata lookup
    const data = await fetchCollectionMetadataServer(address)

    if (!data) {
        return {
            title: "Not Found",
            description: "Collection not found"
        }
    }

    return {
        title: data.name,
        description: data.description,
        alternates: {
            canonical: `/collections/${address}`
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

export default async function CollectionPage(props: {
    params: Promise<{ address: string }>
    searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const address = (await props.params).address
    const data = await fetchCollectionMetadataServer(address)

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
                name: 'Collections',
                item: 'https://medialane.xyz/collections'
            },
            {
                '@type': 'ListItem',
                position: 3,
                name: data?.name || 'Collection',
                item: `https://medialane.xyz/collections/${address}`
            }
        ]
    }

    const collectionLd = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: data?.name || "IP Collection",
        description: data?.description,
        primaryImageOfPage: {
            '@type': 'ImageObject',
            contentUrl: data?.image
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
                dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }}
            />
            <CollectionDetailPageClient />
        </>
    )
}
