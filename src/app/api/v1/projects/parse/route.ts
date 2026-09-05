import { handleApiError, ValidationError } from "@/errors";
import { LVETEngine } from "@/core/lvet";
import { TRACE_HEADERS } from "@/logger/tracing";

export async function POST(req: Request) {
	try {
		const traceId = req.headers.get(TRACE_HEADERS.TRACE_ID) || undefined;
		const body = await req.json().catch(() => null);

		if (!body || !body.content || typeof body.content !== "string") {
			throw new ValidationError("Missing or invalid 'content' field in request body. Must be a string.");
		}

		const format = body.format || "auto";
		const parsed = LVETEngine.parseTimelineFile(body.content, format);

		return Response.json(
			{
				success: true,
				data: {
					format,
					parsed,
				},
			},
			{
				status: 200,
				headers: {
					...(traceId ? { [TRACE_HEADERS.TRACE_ID]: traceId } : {}),
				},
			},
		);
	} catch (error) {
		return handleApiError(error, req);
	}
}
