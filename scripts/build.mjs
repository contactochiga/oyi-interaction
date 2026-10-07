// Build: tsc -> dist (ESM + .d.ts), then copy the stylesheet.
// Usage: node scripts/build.mjs [outDir]
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const outDir = path.resolve(root, process.argv[2] || "dist");
// Publication safety first: never build or release unsafe content.
execFileSync(process.execPath, [path.join(root, "scripts/publication-guard.mjs")], { stdio: "inherit" });
fs.rmSync(outDir, { recursive: true, force: true });
execFileSync(process.execPath, [path.join(root, "node_modules/typescript/bin/tsc"), "-p", path.join(root, "tsconfig.json"), "--outDir", outDir], { stdio: "inherit" });
fs.mkdirSync(path.join(outDir, "styles"), { recursive: true });
fs.copyFileSync(path.join(root, "src/styles/oyi-interaction.css"), path.join(outDir, "styles/oyi-interaction.css"));
console.log(`built ${path.relative(root, outDir) || "."}`);
