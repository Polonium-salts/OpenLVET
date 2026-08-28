import fs from "node:fs";
import path from "node:path";
import { unpackPluginZip } from "../src/plugins/installers/zip-installer";
import { evaluatePluginCode } from "../src/plugins/plugin-loader";

for (const zipFile of [
  "demo-watermark-hud.zip",
  "global-theme-master.zip",
  "third-party-stock-hub.zip",
  "cinematic-film-filters.zip",
  "plugin-feature-tester.zip",
]) {
  console.log("-----------------------------------------");
  console.log("Testing:", zipFile);
  const filePath = path.resolve(zipFile);
  const buf = fs.readFileSync(filePath);
  const { manifest, sourceCode } = unpackPluginZip(buf);
  console.log("Manifest Name:", manifest.name);
  console.log("Category:", manifest.category);
  const mod = evaluatePluginCode(sourceCode, manifest);
  console.log("Activate handler:", typeof mod.activate);
  console.log("Deactivate handler:", typeof mod.deactivate);
  console.log("Status: OK");
}
