#!/usr/bin/env node

/**
 * OpenLVET CLI Executable Runner
 */

const { spawnSync } = require("child_process");
const path = require("path");

const cliPath = path.resolve(__dirname, "../src/cli/index.ts");
const npxCmd = process.platform === "win32" ? "npx.cmd" : "npx";

const result = spawnSync(npxCmd, ["tsx", cliPath, ...process.argv.slice(2)], {
	stdio: "inherit",
	shell: true,
});

process.exit(result.status ?? 0);
