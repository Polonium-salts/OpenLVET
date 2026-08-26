import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const targetUrl = searchParams.get("url");

		if (!targetUrl) {
			return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
		}

		// Security check: allow trusted media CDN domains
		const parsed = new URL(targetUrl);
		const hostname = parsed.hostname;
		const isAllowed =
			hostname.endsWith("doodl.co") ||
			hostname.endsWith("sourcesplash.com") ||
			hostname.endsWith("picsum.photos") ||
			hostname.endsWith("unsplash.com") ||
			hostname.endsWith("pexels.com") ||
			hostname.endsWith("pixabay.com") ||
			hostname.endsWith("vimeocdn.com") ||
			hostname.endsWith("wikimedia.org") ||
			hostname.endsWith("wikipedia.org");

		if (!isAllowed) {
			return NextResponse.json(
				{ error: "Domain not allowed for proxy download" },
				{ status: 403 },
			);
		}

		const response = await fetch(targetUrl, {
			headers: {
				"User-Agent": "OpenCut/1.0",
			},
		});

		if (!response.ok) {
			return NextResponse.json(
				{ error: `Failed to fetch asset: ${response.statusText}` },
				{ status: response.status },
			);
		}

		const contentType = response.headers.get("content-type") || "application/octet-stream";
		const buffer = await response.arrayBuffer();

		return new NextResponse(buffer, {
			status: 200,
			headers: {
				"Content-Type": contentType,
				"Cache-Control": "public, max-age=86400",
				"Access-Control-Allow-Origin": "*",
			},
		});
	} catch (error) {
		console.error("Proxy download error:", error);
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : "Proxy download failed" },
			{ status: 500 },
		);
	}
}
