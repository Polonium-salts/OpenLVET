import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const url = searchParams.get("url");

	if (!url) {
		return new NextResponse("Missing url parameter", { status: 400 });
	}

	try {
		const targetUrl = decodeURIComponent(url);

		// Security check: Only allow fetching images from valid image hosts
		const parsed = new URL(targetUrl);
		const allowedHosts = [
			"hdslb.com",
			"bilibili.com",
			"bilivideo.com",
		];
		const isAllowed = allowedHosts.some(
			(host) => parsed.hostname === host || parsed.hostname.endsWith(`.${host}`),
		);

		if (!isAllowed) {
			return new NextResponse("Forbidden image host", { status: 403 });
		}

		const res = await fetch(targetUrl, {
			headers: {
				"User-Agent":
					"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
				Referer: "https://cool.bilibili.com",
			},
		});

		if (!res.ok) {
			return new NextResponse(`Upstream returned ${res.status}`, { status: res.status });
		}

		const contentType = res.headers.get("content-type") || "image/png";
		const arrayBuffer = await res.arrayBuffer();

		return new NextResponse(arrayBuffer, {
			headers: {
				"Content-Type": contentType,
				"Cache-Control": "public, max-age=31536000, immutable",
				"Access-Control-Allow-Origin": "*",
				"Access-Control-Allow-Methods": "GET, OPTIONS",
			},
		});
	} catch (err) {
		console.error("Failed to proxy sticker image:", err);
		return new NextResponse("Internal Server Error", { status: 500 });
	}
}
