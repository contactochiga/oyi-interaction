// The committed dist/ must equal a fresh build of src/ (consumers install
// this repo by commit SHA and run dist/ directly).
import { execFileSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const fresh = fs.mkdtempSync(path.join(os.tmpdir(), "oyi-interaction-dist-"));
execFileSync(process.execPath, [path.join(root, "scripts/build.mjs"), fresh], { stdio: "ignore" });
function walk(dir, base = dir, out = {}) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, base, out);
    else out[path.relative(base, full)] = crypto.createHash("sha256").update(fs.readFileSync(full)).digest("hex");
  }
  return out;
}
const expected = walk(fresh);
const actual = fs.existsSync(path.join(root, "dist")) ? walk(path.join(root, "dist")) : {};
fs.rmSync(fresh, { recursive: true, force: true });
const problems = [];
for (const [file, hash] of Object.entries(expected)) if (actual[file] !== hash) problems.push(`stale or missing: dist/${file}`);
for (const file of Object.keys(actual)) if (!(file in expected)) problems.push(`unexpected: dist/${file}`);
if (problems.length) {
  console.error(problems.join("\n"));
  console.error("dist/ does not match src/. Run npm run build and commit dist/.");
  process.exit(1);
}
console.log(`dist verified (${Object.keys(expected).length} files)`);
