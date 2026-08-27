import { type NextRequest, NextResponse } from "next/server";
import { BUILTIN_TEXT_TEMPLATES, TEXT_TEMPLATE_CATEGORIES } from "@/text/text-templates";

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const category = searchParams.get("category") || "all";
		const query = (searchParams.get("q") || "").trim().toLowerCase();

		let list = [...BUILTIN_TEXT_TEMPLATES];

		if (category !== "all") {
			list = list.filter((item) => item.category === category);
		}

		if (query) {
			const parts = query.split(/\s+/).filter(Boolean);
			list = list.filter((item) =>
				parts.some(
					(p) =>
						item.name.toLowerCase().includes(p) ||
						item.tags.some((t) => t.toLowerCase().includes(p)) ||
						item.previewText.toLowerCase().includes(p),
				),
			);
		}

		return NextResponse.json({
			categories: TEXT_TEMPLATE_CATEGORIES,
			templates: list,
			total: list.length,
		});
	} catch (error) {
		console.error("Text template API error:", error);
		return NextResponse.json(
			{ error: "Failed to fetch text templates" },
			{ status: 500 },
		);
	}
}
