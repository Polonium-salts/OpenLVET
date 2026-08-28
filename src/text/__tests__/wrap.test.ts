import { describe, it, expect, mock } from "bun:test";

mock.module("opencut-wasm", () => ({
	TICKS_PER_SECOND: () => 1000000,
	ZERO_MEDIA_TIME: 0,
	mediaTimeFromSeconds: (s: number) => Math.round(s * 1000000),
	mediaTimeToSeconds: (t: number) => t / 1000000,
	roundToFrame: (t: number) => t,
	snappedSeekTime: (t: number) => t,
	lastFrameTime: (t: number) => t,
	parseTimecode: () => 0,
}));

import {
	wrapTextLines,
	tokenizeForWrapping,
	resolveTextLayout,
	measureTextLayout,
} from "../primitives";

describe("tokenizeForWrapping", () => {
	it("tokenizes English words and spaces", () => {
		const tokens = tokenizeForWrapping("Hello world test");
		expect(tokens.join("")).toBe("Hello world test");
	});

	it("tokenizes CJK characters properly", () => {
		const tokens = tokenizeForWrapping("你好世界");
		expect(tokens.join("")).toBe("你好世界");
		expect(tokens.length).toBeGreaterThanOrEqual(2);
	});

	it("handles mixed Chinese and English text", () => {
		const text = "OpenLVET 文本 自动换行 123";
		const tokens = tokenizeForWrapping(text);
		expect(tokens.join("")).toBe(text);
	});
});

describe("wrapTextLines", () => {
	// Mock canvas measurement context
	const mockCtx = {
		measureText: (text: string) => ({
			width: text.length * 10,
		}),
	} as any;

	it("returns original lines when maxWidth is 0 or unconstrained", () => {
		const result = wrapTextLines({
			content: "Line 1\nLine 2",
			maxWidth: 0,
			ctx: mockCtx,
		});
		expect(result).toEqual(["Line 1", "Line 2"]);
	});

	it("wraps long lines exceeding maxWidth", () => {
		// Each character is 10px width; 50px max width allows 5 chars
		const result = wrapTextLines({
			content: "1234567890",
			maxWidth: 50,
			ctx: mockCtx,
		});
		expect(result.length).toBe(2);
		expect(result[0]).toBe("12345");
		expect(result[1]).toBe("67890");
	});

	it("preserves explicit newlines and wraps within paragraphs", () => {
		const result = wrapTextLines({
			content: "1234567890\nABC",
			maxWidth: 50,
			ctx: mockCtx,
		});
		expect(result.length).toBe(3);
		expect(result[0]).toBe("12345");
		expect(result[1]).toBe("67890");
		expect(result[2]).toBe("ABC");
	});
});

describe("measureTextLayout with autoWrap and boxWidth", () => {
	const mockCtx = {
		save: () => {},
		restore: () => {},
		measureText: (text: string) => ({
			width: text.length * 10,
			actualBoundingBoxAscent: 10,
			actualBoundingBoxDescent: 2,
		}),
	} as any;

	it("measures unwrapped text when boxWidth is 0", () => {
		const layout = measureTextLayout({
			text: {
				content: "Hello World",
				fontSize: 15,
				fontFamily: "Arial",
				fontWeight: "normal",
				fontStyle: "normal",
				textAlign: "center",
				autoWrap: true,
				boxWidth: 0,
			},
			canvasHeight: 90,
			ctx: mockCtx,
		});

		expect(layout.lines).toEqual(["Hello World"]);
	});

	it("wraps lines when autoWrap is true and boxWidth > 0", () => {
		const layout = measureTextLayout({
			text: {
				content: "1234567890",
				fontSize: 15,
				fontFamily: "Arial",
				fontWeight: "normal",
				fontStyle: "normal",
				textAlign: "center",
				autoWrap: true,
				boxWidth: 50,
			},
			canvasHeight: 90,
			ctx: mockCtx,
		});

		expect(layout.lines.length).toBe(2);
		expect(layout.lines[0]).toBe("12345");
		expect(layout.lines[1]).toBe("67890");
	});
});
