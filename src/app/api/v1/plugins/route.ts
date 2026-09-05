import { handleApiError } from "@/errors";
import { getPresetPlugins } from "@/plugins/preset-plugins";
import { TRACE_HEADERS } from "@/logger/tracing";

export async function GET(req: Request) {
	try {
		const traceId = req.headers.get(TRACE_HEADERS.TRACE_ID) || undefined;
		const presets = getPresetPlugins();

		const pluginList = Object.entries(presets).map(([id, record]) => ({
			id,
			name: record.manifest.name,
			version: record.manifest.version,
			description: record.manifest.description,
			author: record.manifest.author,
			category: record.manifest.category,
			tags: record.manifest.tags,
			sourceType: record.sourceType,
			enabled: record.enabled,
			homepage: record.manifest.homepage,
		}));

		return Response.json(
			{
				success: true,
				data: {
					total: pluginList.length,
					plugins: pluginList,
					capabilities: {
						zipInstaller: true,
						gitInstaller: true,
						customSandbox: true,
					},
				},
			},
			{
				headers: {
					...(traceId ? { [TRACE_HEADERS.TRACE_ID]: traceId } : {}),
				},
			},
		);
	} catch (error) {
		return handleApiError(error, req);
	}
}
