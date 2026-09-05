/**
 * OpenLVET Traceability & Context System
 * Provides distributed/request trace ID generation and propagation across SDK, Core, and API layers.
 */

export interface TraceContext {
	traceId: string;
	spanId?: string;
	parentId?: string;
	timestamp: number;
	metadata?: Record<string, unknown>;
}

// Global or AsyncLocalStorage-like trace context holder
let currentGlobalTraceContext: TraceContext | null = null;

/**
 * Generate a cryptographically secure or pseudo-random trace identifier
 */
export function generateTraceId(prefix = "trace"): string {
	const rand = Math.random().toString(36).substring(2, 10);
	const time = Date.now().toString(36);
	return `${prefix}-${time}-${rand}`;
}

/**
 * Create a new trace context object
 */
export function createTraceContext(
	options: Partial<TraceContext> = {},
): TraceContext {
	return {
		traceId: options.traceId || generateTraceId(),
		spanId: options.spanId || generateTraceId("span"),
		parentId: options.parentId,
		timestamp: options.timestamp || Date.now(),
		metadata: options.metadata || {},
	};
}

/**
 * Get current active trace context (or null if none active)
 */
export function getCurrentTraceContext(): TraceContext | null {
	return currentGlobalTraceContext;
}

/**
 * Get current trace ID or generate a fallback one
 */
export function getActiveTraceId(): string {
	return currentGlobalTraceContext?.traceId || generateTraceId();
}

/**
 * Execute an async operation within an isolated trace context
 */
export async function withTrace<T>(
	contextOrTraceId: TraceContext | string,
	fn: (context: TraceContext) => Promise<T> | T,
): Promise<T> {
	const previous = currentGlobalTraceContext;
	const context: TraceContext =
		typeof contextOrTraceId === "string"
			? createTraceContext({ traceId: contextOrTraceId })
			: contextOrTraceId;

	currentGlobalTraceContext = context;
	try {
		return await fn(context);
	} finally {
		currentGlobalTraceContext = previous;
	}
}

/**
 * Trace headers constants for HTTP API requests & responses
 */
export const TRACE_HEADERS = {
	TRACE_ID: "x-trace-id",
	REQUEST_ID: "x-request-id",
} as const;
