import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
    const url = req.nextUrl.searchParams.get("url")
    if (!url) {
        return new NextResponse("Missing url", { status: 400 })
    }

    try {
        const response = await fetch(url)
        if (!response.ok) {
            return new NextResponse(`Failed to fetch: ${response.statusText}`, { status: response.status })
        }

        // Forward the image/json stream with appropriate headers
        return new NextResponse(response.body, {
            status: response.status,
            headers: {
                "Content-Type": response.headers.get("Content-Type") || "application/octet-stream",
                "Cache-Control": "public, max-age=86400" // Cache for 24 hours
            }
        })
    } catch (error) {
        console.error("Proxy fetch error:", error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}
