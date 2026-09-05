/**
 * OpenLVET Structured Formatting Logger & Diagnostic System
 * Supports multi-level logging, module namespaces, trace ID correlation,
 * in-memory diagnostic buffer, and browser/Node.js color output.
 */

import { getActiveTraceId } from "./tracing";

export enum LogLevel {
	DEBUG = 0,
	INFO = 1,
	WARN = 2,
	ERROR = 3,
	SILENT = 4,
}

export interface LogRecord {
	id: string;
	timestamp: string;
	level: "DEBUG" | "INFO" | "WARN" | "ERROR";
	module: string;
	message: string;
	data?: unknown;
	traceId: string;
}

export interface LoggerOptions {
	level?: LogLevel;
	module?: string;
	enableBuffer?: boolean;
}

/**
 * In-memory circular ring buffer for logging diagnostics and bug report exports
 */
export class LogRingBuffer {
	private readonly capacity: number;
	private buffer: LogRecord[] = [];

	constructor(capacity = 500) {
		this.capacity = capacity;
	}

	push(record: LogRecord): void {
		if (this.buffer.length >= this.capacity) {
			this.buffer.shift();
		}
		this.buffer.push(record);
	}

	getAll(): LogRecord[] {
		return [...this.buffer];
	}

	filter(options: {
		level?: string;
		module?: string;
		search?: string;
		limit?: number;
	}): LogRecord[] {
		let res = this.buffer;
		if (options.level) {
			res = res.filter((r) => r.level === options.level);
		}
		if (options.module) {
			const m = options.module.toLowerCase();
			res = res.filter((r) => r.module.toLowerCase().includes(m));
		}
		if (options.search) {
			const s = options.search.toLowerCase();
			res = res.filter(
				(r) =>
					r.message.toLowerCase().includes(s) ||
					r.traceId.toLowerCase().includes(s),
			);
		}
		if (options.limit && options.limit > 0) {
			res = res.slice(-options.limit);
		}
		return res;
	}

	clear(): void {
		this.buffer = [];
	}

	exportToJson(): string {
		return JSON.stringify(this.buffer, null, 2);
	}

	exportToText(): string {
		return this.buffer
			.map((r) => `[${r.timestamp}] [${r.level}] [${r.module}] [${r.traceId}] ${r.message}`)
			.join("\n");
	}
}

// Global shared log buffer
export const globalLogBuffer = new LogRingBuffer(1000);

export class Logger {
	private level: LogLevel;
	private moduleName: string;
	private enableBuffer: boolean;

	constructor(options: LoggerOptions = {}) {
		this.level = options.level ?? LogLevel.INFO;
		this.moduleName = options.module ?? "OpenLVET";
		this.enableBuffer = options.enableBuffer ?? true;
	}

	setLevel(level: LogLevel): void {
		this.level = level;
	}

	getLevel(): LogLevel {
		return this.level;
	}

	child(moduleName: string, options: Partial<LoggerOptions> = {}): Logger {
		const fullModule = this.moduleName === "OpenLVET" ? moduleName : `${this.moduleName}:${moduleName}`;
		return new Logger({
			level: options.level ?? this.level,
			module: fullModule,
			enableBuffer: options.enableBuffer ?? this.enableBuffer,
		});
	}

	debug(message: string, data?: unknown): void {
		this.log(LogLevel.DEBUG, "DEBUG", message, data);
	}

	info(message: string, data?: unknown): void {
		this.log(LogLevel.INFO, "INFO", message, data);
	}

	warn(message: string, data?: unknown): void {
		this.log(LogLevel.WARN, "WARN", message, data);
	}

	error(message: string, errorOrData?: unknown): void {
		this.log(LogLevel.ERROR, "ERROR", message, errorOrData);
	}

	private log(
		levelVal: LogLevel,
		levelStr: "DEBUG" | "INFO" | "WARN" | "ERROR",
		message: string,
		data?: unknown,
	): void {
		if (levelVal < this.level) return;

		const timestamp = new Date().toISOString();
		const traceId = getActiveTraceId();
		const recordId = `log-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;

		const record: LogRecord = {
			id: recordId,
			timestamp,
			level: levelStr,
			module: this.moduleName,
			message,
			data,
			traceId,
		};

		if (this.enableBuffer) {
			globalLogBuffer.push(record);
		}

		// Output formatting based on runtime environment (Browser vs Node)
		const isBrowser = typeof window !== "undefined" && typeof window.document !== "undefined";

		if (isBrowser) {
			this.outputBrowser(levelStr, timestamp, this.moduleName, traceId, message, data);
		} else {
			this.outputNode(levelStr, timestamp, this.moduleName, traceId, message, data);
		}
	}

	private outputBrowser(
		level: string,
		timestamp: string,
		module: string,
		traceId: string,
		message: string,
		data?: unknown,
	): void {
		const badgeColors: Record<string, string> = {
			DEBUG: "background: #4b5563; color: #fff; padding: 2px 4px; border-radius: 3px; font-weight: bold;",
			INFO: "background: #2563eb; color: #fff; padding: 2px 4px; border-radius: 3px; font-weight: bold;",
			WARN: "background: #d97706; color: #fff; padding: 2px 4px; border-radius: 3px; font-weight: bold;",
			ERROR: "background: #dc2626; color: #fff; padding: 2px 4px; border-radius: 3px; font-weight: bold;",
		};

		const moduleStyle = "color: #06b6d4; font-weight: bold;";
		const traceStyle = "color: #9ca3af; font-size: 10px;";

		const prefix = `%c${level}%c [%c${module}%c] %c(${traceId})%c ${message}`;
		const styles = [
			badgeColors[level] || "",
			"",
			moduleStyle,
			"",
			traceStyle,
			"",
		];

		const method = level === "ERROR" ? console.error : level === "WARN" ? console.warn : level === "DEBUG" ? console.debug : console.log;

		if (data !== undefined) {
			method(prefix, ...styles, data);
		} else {
			method(prefix, ...styles);
		}
	}

	private outputNode(
		level: string,
		timestamp: string,
		module: string,
		traceId: string,
		message: string,
		data?: unknown,
	): void {
		const colors: Record<string, string> = {
			DEBUG: "\x1b[90m", // Gray
			INFO: "\x1b[34m", // Blue
			WARN: "\x1b[33m", // Yellow
			ERROR: "\x1b[31m", // Red
		};
		const reset = "\x1b[0m";
		const cyan = "\x1b[36m";
		const gray = "\x1b[90m";

		const c = colors[level] || "";
		const prefix = `${gray}${timestamp}${reset} ${c}[${level}]${reset} ${cyan}[${module}]${reset} ${gray}(${traceId})${reset} ${message}`;

		const method = level === "ERROR" ? console.error : level === "WARN" ? console.warn : console.log;

		if (data !== undefined) {
			method(prefix, data);
		} else {
			method(prefix);
		}
	}
}

/**
 * Root logger instance
 */
export const logger = new Logger({
	level: LogLevel.INFO,
	module: "OpenLVET",
});

/**
 * Factory to create namespaced module loggers
 */
export function createLogger(moduleName: string, options: Partial<LoggerOptions> = {}): Logger {
	return logger.child(moduleName, options);
}

export * from "./tracing";
