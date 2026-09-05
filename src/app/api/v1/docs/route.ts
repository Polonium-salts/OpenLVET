export async function GET() {
	const openApiSpec = {
		openapi: "3.0.3",
		info: {
			title: "OpenLVET Core Engine RESTful API",
			description:
				"Official RESTful API for OpenLVET (Open Linear Video Editing Toolkit). Provides project schema parsing, format interchange (EDL, OTIO, FCPXML), headless render job queue, and plugin management.",
			version: "1.0.0",
			contact: {
				name: "OpenLVET Open Source Team",
				url: "https://openlvet.app",
			},
		},
		servers: [
			{
				url: "/api/v1",
				description: "Current OpenLVET Engine Instance",
			},
		],
		paths: {
			"/health": {
				get: {
					summary: "Health Check & Capabilities Diagnostic",
					responses: {
						"200": {
							description: "Service is healthy and returns system capabilities.",
						},
					},
				},
			},
			"/projects/parse": {
				post: {
					summary: "Parse and Validate Project / Timeline File",
					description: "Parses CMX 3600 EDL, OpenTimelineIO (OTIO), FCPXML, or OpenLVET JSON.",
					requestBody: {
						required: true,
						content: {
							"application/json": {
								schema: {
									type: "object",
									required: ["content"],
									properties: {
										content: { type: "string" },
										format: {
											type: "string",
											enum: ["auto", "edl", "otio", "fcpxml", "openlvet"],
										},
									},
								},
							},
						},
					},
					responses: {
						"200": { description: "Parsed timeline structure" },
						"400": { description: "Invalid file content or syntax error" },
					},
				},
			},
			"/projects/convert": {
				post: {
					summary: "Convert Timeline Between Interchange Formats",
					requestBody: {
						required: true,
						content: {
							"application/json": {
								schema: {
									type: "object",
									required: ["content", "toFormat"],
									properties: {
										content: { type: "string" },
										fromFormat: { type: "string" },
										toFormat: {
											type: "string",
											enum: ["edl", "otio", "fcpxml", "openlvet"],
										},
										fps: { type: "number" },
									},
								},
							},
						},
					},
					responses: {
						"200": { description: "Converted timeline string" },
					},
				},
			},
			"/render/job": {
				post: {
					summary: "Submit a Headless Render Job",
					responses: {
						"202": { description: "Render job accepted and queued" },
					},
				},
				get: {
					summary: "Query Render Job Status",
					parameters: [
						{
							name: "jobId",
							in: "query",
							required: false,
							schema: { type: "string" },
						},
					],
					responses: {
						"200": { description: "Render job status" },
					},
				},
			},
			"/plugins": {
				get: {
					summary: "List Installed and Preset Plugins",
					responses: {
						"200": { description: "Plugin catalog" },
					},
				},
			},
		},
	};

	return Response.json(openApiSpec, {
		status: 200,
		headers: {
			"Content-Type": "application/json",
		},
	});
}
