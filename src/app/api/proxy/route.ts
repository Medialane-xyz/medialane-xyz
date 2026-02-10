import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
    const url = req.nextUrl.searchParams.get("url")
    if (!url) {
        return new NextResponse("Missing url", { status: 400 })
    }

    try {
        // Basic URL validation
        if (!url.startsWith("http")) {
            console.warn(`[Proxy] Blocked invalid URL: ${url}`)
            return new NextResponse("Invalid URL", { status: 400 })
        }

        console.log(`[Proxy] Fetching: ${url}`)

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 15000) // 15s timeout

        try {
            const response = await fetch(url, { signal: controller.signal })
            clearTimeout(timeoutId)

            if (!response.ok) {
                console.warn(`[Proxy] Failed to fetch ${url}: ${response.status} ${response.statusText}`)
                return new NextResponse(`Failed to fetch from source: ${response.statusText}`, { status: response.status })
            }

            // Forward the image/json stream with appropriate headers
            const contentType = response.headers.get("Content-Type") || "application/octet-stream"

            return new NextResponse(response.body, {
                status: response.status,
                headers: {
                    "Content-Type": contentType,
                    "Cache-Control": "public, max-age=86400" // Cache for 24 hours
                }
            })
        } catch (error: any) {
            clearTimeout(timeoutId)
            if (error.name === 'AbortError') {
                console.warn(`[Proxy] Timeout fetching ${url}`)
                return new NextResponse("Gateway Timeout", { status: 504 })
            }
            throw error
        }
    } catch (error: any) {
        console.error(`[Proxy] Error fetching ${url}:`, error.message)
        return new NextResponse(`Internal Server Error: ${error.message}`, { status: 500 })
    }
}
