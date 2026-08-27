export type VoiceCategory =
	| "hot"
	| "narrative"
	| "female"
	| "male"
	| "dialect"
	| "foreign";

export interface TTSVoice {
	id: string;
	name: string;
	gender: "Female" | "Male";
	locale: string;
	category: VoiceCategory;
	description: string;
	tags: string[];
	avatar?: string;
	sampleText?: string;
}

export interface TTSProsody {
	rate: number; // 0.5 to 2.0 (1.0 = normal)
	pitch: number; // -50 to 50 (0 = normal)
	volume: number; // 0 to 100 (100 = normal)
}

export interface TTSGenerateRequest {
	text: string;
	voice: string;
	rate?: string; // e.g. "+0%", "+20%", "-10%"
	pitch?: string; // e.g. "+0Hz", "+10Hz", "-10Hz"
	volume?: string; // e.g. "+0%", "-20%"
}

export interface TTSGenerateResponse {
	audioBase64: string;
	mimeType: string;
	duration?: number;
}
