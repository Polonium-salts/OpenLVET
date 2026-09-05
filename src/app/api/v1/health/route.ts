import { handleApiError } from "@/errors";
import { TRACE_HEADERS } from "@/logger/tracing";

export async function GET(req: Request) {
	try {
		const traceId = req.headers.get(TRACE_HEADERS.TRACE_ID) || undefined;
		const memory = typeof process !== "undefined" ? process.memoryUsage?.() : undefined;

		const healthData = {
			status: "healthy",
			service: "OpenLVET Core Engine API",
			version: "1.0.0",
			environment: process.env.NODE_ENV || "development",
			timestamp: new Date().toISOString(),
			uptime: typeof process !== "undefined" ? Math.floor(process.uptime?.() || 0) : 0,
			capabilities: {
				wasm: true,
				webcodecs: true,
				storage: ["opfs", "indexeddb", "memory"],
				protocols: ["cmx3600", "otio", "fcpxml", "openlvet.project.v1"],
				renderEngines: ["mediabunny", "opencut-wasm", "webcodecs"],
			},
			memory: memory
				? {
						heapUsedMb: Math.round(memory.heapUsed / (1024 * 1024)),
						heapTotalMb: Math.round(memory.heapTotal / (1024 * 1024)),
						rssMb: Math.round(memory.rss / (1024 * 1024)),
					}
				: undefined,
		};

		return Response.json(
			{
				success: true,
				data: healthData,
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
