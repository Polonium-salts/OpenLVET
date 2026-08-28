import type { NextConfig } from "next";
import { withBotId } from "botid/next/config";

const nextConfig: NextConfig = {
	compiler: {
		removeConsole: process.env.NODE_ENV === "production",
	},
	reactStrictMode: true,
	productionBrowserSourceMaps: true,
	output: "standalone",
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "plus.unsplash.com",
			},
			{
				protocol: "https",
				hostname: "images.unsplash.com",
			},
			{
				protocol: "https",
				hostname: "images.marblecms.com",
			},
			{
				protocol: "https",
				hostname: "lh3.googleusercontent.com",
			},
			{
				protocol: "https",
				hostname: "avatars.githubusercontent.com",
			},
			{
				protocol: "https",
				hostname: "api.iconify.design",
			},
			{
				protocol: "https",
				hostname: "api.simplesvg.com",
			},
			{
				protocol: "https",
				hostname: "api.unisvg.com",
			},
			{
				protocol: "https",
				hostname: "cdn.brandfetch.io",
			},
			{
				protocol: "https",
				hostname: "pixabay.com",
			},
			{
				protocol: "https",
				hostname: "cdn.pixabay.com",
			},
			{
				protocol: "https",
				hostname: "i.vimeocdn.com",
			},
			{
				protocol: "https",
				hostname: "images.doodl.co",
			},
			{
				protocol: "https",
				hostname: "doodl.co",
			},
			{
				protocol: "https",
				hostname: "www.sourcesplash.com",
			},
			{
				protocol: "https",
				hostname: "picsum.photos",
			},
			{
				protocol: "https",
				hostname: "upload.wikimedia.org",
			},
			{
				protocol: "https",
				hostname: "i0.hdslb.com",
			},
			{
				protocol: "https",
				hostname: "i1.hdslb.com",
			},
			{
				protocol: "https",
				hostname: "i2.hdslb.com",
			},
			{
				protocol: "https",
				hostname: "*.hdslb.com",
			},
			{
				protocol: "https",
				hostname: "*.bilibili.com",
			},
		],
	},
};

export default withBotId(nextConfig);

