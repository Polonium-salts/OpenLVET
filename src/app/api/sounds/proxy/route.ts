import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const targetUrl = searchParams.get("url");

		if (!targetUrl) {
			return NextResponse.json(
				{ error: "Missing url parameter" },
				{ status: 400 },
			);
		}

		// Validate URL format
		let parsed: URL;
		try {
			parsed = new URL(targetUrl);
		} catch {
			return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
		}

		if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
			return NextResponse.json(
				{ error: "Invalid protocol" },
				{ status: 400 },
			);
		}

		const response = await fetch(targetUrl, {
			headers: {
				"User-Agent":
					"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
				Accept: "audio/*,*/*;q=0.8",
			},
		});

		if (!response.ok) {
			return NextResponse.json(
				{ error: `Failed to fetch audio: ${response.statusText}` },
				{ status: response.status },
			);
		}

		const contentType =
			response.headers.get("content-type") || "audio/mpeg";
		const buffer = await response.arrayBuffer();

		return new NextResponse(buffer, {
			status: 200,
			headers: {
				"Content-Type": contentType,
				"Cache-Control": "public, max-age=86400",
				"Access-Control-Allow-Origin": "*",
				"Access-Control-Allow-Methods": "GET, OPTIONS",
				"Access-Control-Allow-Headers": "Content-Type",
			},
		});
	} catch (error) {
		console.error("Audio proxy download error:", error);
		return NextResponse.json(
			{
				error:
					error instanceof Error
						? error.message
						: "Audio proxy download failed",
			},
			{ status: 500 },
		);
	}
}

export async function OPTIONS() {
	return new NextResponse(null, {
		status: 204,
		headers: {
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": "GET, OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type",
		},
	});
}
