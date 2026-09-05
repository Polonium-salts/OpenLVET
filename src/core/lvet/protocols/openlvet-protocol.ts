/**
 * OpenLVET Project Interchange Protocol Specification (v1.0)
 * Defines schema validation, data integrity checksum verification,
 * and project version migration pipeline.
 */

import { ValidationError, ProtocolError } from "@/errors";

export const CURRENT_PROTOCOL_VERSION = "openlvet.project.v1";

export interface OpenLVETProjectPackage {
	protocol: typeof CURRENT_PROTOCOL_VERSION | string;
	version: number;
	checksum: string;
	exportedAt: string;
	generator: string;
	project: {
		id: string;
		name: string;
		fps: number;
		width: number;
		height: number;
		durationUs: number;
		tracks: Array<{
			id: string;
			name: string;
			type: string;
			elements: Array<Record<string, unknown>>;
		}>;
		metadata?: Record<string, unknown>;
	};
}

export class OpenLVETProtocol {
	/**
	 * Compute integrity checksum for project payload
	 */
	static computeChecksum(data: unknown): string {
		const str = JSON.stringify(data);
		let hash = 5381;
		for (let i = 0; i < str.length; i++) {
			hash = (hash * 33) ^ str.charCodeAt(i);
		}
		// Convert to 8-char hex string
		return (hash >>> 0).toString(16).padStart(8, "0");
	}

	/**
	 * Package an OpenLVET project into a verifiable package
	 */
	static packageProject(project: OpenLVETProjectPackage["project"]): OpenLVETProjectPackage {
		const checksum = this.computeChecksum(project);
		return {
			protocol: CURRENT_PROTOCOL_VERSION,
			version: 1,
			checksum,
			exportedAt: new Date().toISOString(),
			generator: "OpenLVET Engine v1.0.0",
			project,
		};
	}

	/**
	 * Unpackage and validate an OpenLVET project package
	 */
	static unpackageProject(pkg: unknown): OpenLVETProjectPackage["project"] {
		if (!pkg || typeof pkg !== "object") {
			throw new ValidationError("Invalid project package: must be a JSON object");
		}

		const p = pkg as Partial<OpenLVETProjectPackage>;

		if (!p.project) {
			throw new ValidationError("Project package missing 'project' payload");
		}

		// Verify checksum if present
		if (p.checksum) {
			const expected = this.computeChecksum(p.project);
			if (p.checksum !== expected) {
				throw new ProtocolError(
					"OpenLVETProtocol",
					`Checksum mismatch! Expected ${expected}, got ${p.checksum}. Project data may be corrupted.`,
				);
			}
		}

		// Version migration pipeline
		const migratedProject = this.migrateProject(p.project, p.version || 1);
		return migratedProject;
	}

	/**
	 * Schema migration pipeline
	 */
	private static migrateProject(
		project: OpenLVETProjectPackage["project"],
		fromVersion: number,
	): OpenLVETProjectPackage["project"] {
		let current = { ...project };

		if (fromVersion < 1) {
			// Migrate legacy format if needed
			current = {
				...current,
				fps: current.fps || 30,
				width: current.width || 1920,
				height: current.height || 1080,
			};
		}

		return current;
	}
}
