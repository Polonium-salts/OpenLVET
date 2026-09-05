import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => ({
	plugins: [react()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
			"next/navigation": path.resolve(__dirname, "./src/compat/next/navigation.ts"),
			"next/link": path.resolve(__dirname, "./src/compat/next/link.tsx"),
			"next/image": path.resolve(__dirname, "./src/compat/next/image.tsx"),
		},
	},
	server: {
		port: 3000,
		host: "0.0.0.0",
		headers: {
			"Cross-Origin-Opener-Policy": "same-origin",
			"Cross-Origin-Embedder-Policy": "credentialless",
		},
	},
	define: {
		"process.env.NODE_ENV": JSON.stringify(mode),
		"process.env.NEXT_PUBLIC_SITE_URL": JSON.stringify("http://localhost:3000"),
		"process.env": {
			NODE_ENV: mode,
			NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
		},
	},
	build: {
		outDir: "dist",
		sourcemap: mode === "development",
		chunkSizeWarningLimit: 2000,
	},
}));
