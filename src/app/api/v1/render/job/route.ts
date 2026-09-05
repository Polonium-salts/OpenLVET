import { handleApiError, ValidationError, NotFoundError } from "@/errors";
import { TRACE_HEADERS, generateTraceId } from "@/logger/tracing";

// In-memory jobs map for headless/API render jobs
interface RenderJob {
	jobId: string;
	status: "queued" | "rendering" | "completed" | "failed";
	progress: number; // 0..100
	createdAt: string;
	completedAt?: string;
	outputFormat: string;
	downloadUrl?: string;
	error?: string;
}

const renderJobs = new Map<string, RenderJob>();

export async function POST(req: Request) {
	try {
		const traceId = req.headers.get(TRACE_HEADERS.TRACE_ID) || undefined;
		const body = await req.json().catch(() => null);

		if (!body || (!body.projectId && !body.timeline)) {
			throw new ValidationError("Must provide either 'projectId' or 'timeline' payload to start a render job");
		}

		const jobId = `job-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
		const outputFormat = body.format || "mp4";

		const job: RenderJob = {
			jobId,
			status: "queued",
			progress: 0,
			createdAt: new Date().toISOString(),
			outputFormat,
		};

		renderJobs.set(jobId, job);

		// Simulate background render progress
		setTimeout(() => {
			const j = renderJobs.get(jobId);
			if (j) {
				j.status = "rendering";
				j.progress = 50;
			}
		}, 1000);

		setTimeout(() => {
			const j = renderJobs.get(jobId);
			if (j) {
				j.status = "completed";
				j.progress = 100;
				j.completedAt = new Date().toISOString();
				j.downloadUrl = `/api/v1/render/download/${jobId}.${outputFormat}`;
			}
		}, 3000);

		return Response.json(
			{
				success: true,
				data: job,
			},
			{
				status: 202,
				headers: {
					...(traceId ? { [TRACE_HEADERS.TRACE_ID]: traceId } : {}),
				},
			},
		);
	} catch (error) {
		return handleApiError(error, req);
	}
}

export async function GET(req: Request) {
	try {
		const traceId = req.headers.get(TRACE_HEADERS.TRACE_ID) || undefined;
		const url = new URL(req.url);
		const jobId = url.searchParams.get("jobId");

		if (!jobId) {
			return Response.json(
				{
					success: true,
					data: Array.from(renderJobs.values()),
				},
				{
					headers: {
						...(traceId ? { [TRACE_HEADERS.TRACE_ID]: traceId } : {}),
					},
				},
			);
		}

		const job = renderJobs.get(jobId);
		if (!job) {
			throw new NotFoundError("RenderJob", jobId);
		}

		return Response.json(
			{
				success: true,
				data: job,
			},
			{
				headers: {
					...(traceId ? { [TRACE_HEADERS.TRACE_ID]: traceId } : {}),
				},
			},
		);
	} catch (error) {
		return handleApiError(error, req);
	}
}
