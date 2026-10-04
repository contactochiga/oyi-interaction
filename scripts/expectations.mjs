// Canonical-response fixture -> interaction state + action truth, as one
// deterministic expectation document. Consumer and Facility run the SAME
// computation through the package they install and must match it exactly.
// Usage: node scripts/expectations.mjs [--write]
import fs from "node:fs";
import path from "node:path";
import { computeInteractionExpectations } from "./expectations-lib.mjs";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const fixture = JSON.parse(fs.readFileSync(path.join(root, "fixtures/oyi-action-truth.fixture.json"), "utf8"));
const core = await import(path.join(root, "dist/core/index.js"));
const serialized = `${JSON.stringify(computeInteractionExpectations(core, fixture), null, 2)}\n`;
const target = path.join(root, "fixtures/oyi-interaction-expectations.json");
if (process.argv.includes("--write")) {
  fs.writeFileSync(target, serialized);
  console.log("wrote fixtures/oyi-interaction-expectations.json");
} else if (!fs.existsSync(target) || fs.readFileSync(target, "utf8") !== serialized) {
  console.error("fixtures/oyi-interaction-expectations.json is stale (node scripts/expectations.mjs --write)");
  process.exit(1);
} else {
  console.log("interaction expectations verified");
}
