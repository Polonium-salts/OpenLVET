import { NextResponse } from "next/server";
import { TTS_VOICES, VOICE_CATEGORIES } from "@/tts/voices";

export async function GET() {
	return NextResponse.json({
		categories: VOICE_CATEGORIES,
		voices: TTS_VOICES,
	});
}
