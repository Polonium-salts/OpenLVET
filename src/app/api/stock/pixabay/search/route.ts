import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	return NextResponse.json({
		total: 0,
		totalHits: 0,
		hits: [],
		page: 1,
		pageSize: 20,
		hasMore: false,
		message: "Material library is now unified and local.",
	});
}
