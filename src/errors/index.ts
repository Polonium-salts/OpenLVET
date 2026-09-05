/**
 * OpenLVET Unified Exception Architecture
 * Provides standard error classes, status codes, contextual data, and API error formatting.
 */

import { getActiveTraceId, TRACE_HEADERS } from "@/logger/tracing";
import { logger } from "@/logger";

export interface ErrorDetails {
	code: string;
	message: string;
	statusCode: number;
	context?: Record<string, unknown>;
	traceId: string;
	timestamp: number;
	stack?: string;
}

export class OpenLVETError extends Error {
	public readonly code: string;
	public readonly statusCode: number;
	public readonly context?: Record<string, unknown>;
	public readonly traceId: string;
	public readonly timestamp: number;

	constructor(
		message: string,
		options: {
			code?: string;
			statusCode?: number;
			context?: Record<string, unknown>;
			cause?: unknown;
		} = {},
	) {
		super(message);
		this.name = this.constructor.name;
		this.code = options.code || "ERR_OPENLVET_INTERNAL";
		this.statusCode = options.statusCode || 500;
		this.context = options.context;
		this.traceId = getActiveTraceId();
		this.timestamp = Date.now();

		if (options.cause) {
			this.cause = options.cause;
		}

		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, this.constructor);
		}
	}

	toJSON(): ErrorDetails {
		return {
			code: this.code,
			message: this.message,
			statusCode: this.statusCode,
			context: this.context,
			traceId: this.traceId,
			timestamp: this.timestamp,
			...(process.env.NODE_ENV !== "production" ? { stack: this.stack } : {}),
		};
	}
}

export class ValidationError extends OpenLVETError {
	constructor(message: string, context?: Record<string, unknown>) {
		super(message, {
			code: "ERR_VALIDATION",
			statusCode: 400,
			context,
		});
	}
}

export class NotFoundError extends OpenLVETError {
	constructor(resource: string, identifier?: string) {
		super(`${resource}${identifier ? ` '${identifier}'` : ""} not found`, {
			code: "ERR_NOT_FOUND",
			statusCode: 404,
			context: { resource, identifier },
		});
	}
}

export class TimelineError extends OpenLVETError {
	constructor(message: string, context?: Record<string, unknown>) {
		super(message, {
			code: "ERR_TIMELINE",
			statusCode: 422,
			context,
		});
	}
}

export class RenderError extends OpenLVETError {
	constructor(message: string, context?: Record<string, unknown>, cause?: unknown) {
		super(message, {
			code: "ERR_RENDER",
			statusCode: 500,
			context,
			cause,
		});
	}
}

export class PluginError extends OpenLVETError {
	constructor(pluginId: string, message: string, cause?: unknown) {
		super(`[Plugin: ${pluginId}] ${message}`, {
			code: "ERR_PLUGIN",
			statusCode: 500,
			context: { pluginId },
			cause,
		});
	}
}

export class MediaError extends OpenLVETError {
	constructor(message: string, context?: Record<string, unknown>) {
		super(message, {
			code: "ERR_MEDIA",
			statusCode: 415,
			context,
		});
	}
}

export class ProtocolError extends OpenLVETError {
	constructor(protocol: string, message: string, context?: Record<string, unknown>) {
		super(`[Protocol: ${protocol}] ${message}`, {
			code: "ERR_PROTOCOL",
			statusCode: 400,
			context: { protocol, ...context },
		});
	}
}

export class ConfigError extends OpenLVETError {
	constructor(message: string, context?: Record<string, unknown>) {
		super(message, {
			code: "ERR_CONFIG",
			statusCode: 500,
			context,
		});
	}
}

/**
 * Standardized API Route error response builder for Next.js endpoints
 */
export function handleApiError(error: unknown, req?: Request): Response {
	const traceId = req?.headers.get(TRACE_HEADERS.TRACE_ID) || getActiveTraceId();

	let normalizedError: OpenLVETError;

	if (error instanceof OpenLVETError) {
		normalizedError = error;
	} else if (error instanceof Error) {
		normalizedError = new OpenLVETError(error.message, {
			code: "ERR_INTERNAL_SERVER",
			statusCode: 500,
			cause: error,
		});
	} else {
		normalizedError = new OpenLVETError(String(error), {
			code: "ERR_UNKNOWN",
			statusCode: 500,
		});
	}

	logger.error(`API Error [${normalizedError.code}]: ${normalizedError.message}`, {
		statusCode: normalizedError.statusCode,
		traceId,
		context: normalizedError.context,
		stack: normalizedError.stack,
	});

	const body = {
		success: false,
		error: normalizedError.toJSON(),
		traceId,
	};

	return new Response(JSON.stringify(body, null, 2), {
		status: normalizedError.statusCode,
		headers: {
			"Content-Type": "application/json",
			[TRACE_HEADERS.TRACE_ID]: traceId,
		},
	});
}
