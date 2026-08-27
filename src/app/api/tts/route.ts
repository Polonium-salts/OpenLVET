import { type NextRequest, NextResponse } from "next/server";
import { EdgeTTS } from "edge-tts-universal";

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { text, voice = "zh-CN-XiaoxiaoNeural", rate = "+0%", pitch = "+0Hz", volume = "+0%" } = body;

		if (!text || typeof text !== "string" || !text.trim()) {
			return NextResponse.json({ error: "Text is required" }, { status: 400 });
		}

		const cleanText = text.trim();
		const cleanVoice = voice || "zh-CN-XiaoxiaoNeural";

		const tts = new EdgeTTS(cleanText, cleanVoice, {
			rate: rate || "+0%",
			pitch: pitch || "+0Hz",
			volume: volume || "+0%",
		});

		const result = await tts.synthesize();
		const arrayBuffer = await result.audio.arrayBuffer();

		return new Response(arrayBuffer, {
			status: 200,
			headers: {
				"Content-Type": "audio/mpeg",
				"Content-Length": arrayBuffer.byteLength.toString(),
				"Cache-Control": "public, max-age=86400",
			},
		});
	} catch (error) {
		console.error("TTS API Error:", error);
		const message = error instanceof Error ? error.message : "Failed to synthesize speech";
		return NextResponse.json({ error: message }, { status: 500 });
	}
}
