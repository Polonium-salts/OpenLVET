import { zhCN, type Translations } from "./zh-CN";

export type Locale = "zh-CN" | "en-US";

export const translations: Record<Locale, Translations> = {
	"zh-CN": zhCN,
	"en-US": zhCN, // default to zhCN for this project
};

export const currentLocale: Locale = "zh-CN";

export const t = zhCN;

export function useI18n() {
	return {
		locale: currentLocale,
		t: zhCN,
	};
}
