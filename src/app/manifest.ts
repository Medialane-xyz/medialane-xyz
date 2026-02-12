import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'MediaLane',
        short_name: 'MediaLane',
        description: 'Monetization hub for the integrity web. Launch, share and monetize your creative works',
        start_url: '/',
        display: 'standalone',
        background_color: '#000000',
        theme_color: '#000000',
        icons: [
            {
                src: '/favicon.ico',
                sizes: 'any',
                type: 'image/x-icon',
            },
            {
                src: '/icon.png',
                sizes: '32x32',
                type: 'image/png',
            },
        ],
    }
}
