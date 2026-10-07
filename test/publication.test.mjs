// The public-package safety guard must catch every protected category.
// Violation samples are assembled at runtime so this file itself stays clean.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";

const guard = new URL("../scripts/publication-guard.mjs", import.meta.url).pathname;
const j = (...parts) => parts.join("");

function scan(content, file = "src/sample.ts") {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "oyi-pubguard-"));
  fs.mkdirSync(path.dirname(path.join(dir, file)), { recursive: true });
  fs.writeFileSync(path.join(dir, file), content);
  const result = spawnSync(process.execPath, [guard, "--root", dir], { encoding: "utf8" });
  fs.rmSync(dir, { recursive: true, force: true });
  return result;
}

const SAMPLES = {
  "credential/secret": `const k = "${j("sk", "-", "A".repeat(24))}";`,
  "credential/secret (JWT)": `const t = "${j("eyJ", "a".repeat(12), ".eyJ", "b".repeat(12), ".", "c".repeat(12))}";`,
  "credential/secret (assignment)": `const ${j("pass", "word")} = "${"x".repeat(16)}";`,
  [j("service", "-role material")]: `const role = "${j("service", "_role")}";`,
  "production infrastructure": `fetch("${j("https:", "//", "oyi-os", ".onrender", ".com")}")`,
  "private knowledge corpus": `const flag = "${j("do_not_", "state_verbatim")}";`,
  "internal commercial content": `// ${j("commission", " rate")} for partners`,
  "authority/business policy code": `if (${j("hasPer", "mission")}(user, "x")) {}`,
  "resident/customer data (email)": `const e = "${j("chiamaka", "@", "gmail", ".com")}";`,
  "resident/customer data (phone)": `const p = "${j("+234", "8031234567")}";`,
  "resident/customer data (real id)": `const id = "${j("3f2a9c1e", "-", "1b2c", "-", "4d5e", "-", "8f90", "-", "abcdef123456")}";`,
  [j("internal prompt/system", " instruction")]: `const s = "${j("You are ", "Oyi", ", the home assistant")}";`,
  "external/production URL": `const u = "${j("https:", "//", "internal.", "ochiga", ".io/api")}";`,
};

for (const [category, sample] of Object.entries(SAMPLES)) {
  test(`publication guard catches: ${category}`, () => {
    const result = scan(sample);
    assert.equal(result.status, 1, `${category} must fail the guard`);
    assert.match(result.stderr, new RegExp(category.replace(/[()/]/g, "\\$&")));
  });
}

test("publication guard passes interaction mechanics and reserved example URLs", () => {
  const result = scan(`export const label = "Command accepted"; const u = "https://evil.example"; const v = "http://localhost:3000";`);
  assert.equal(result.status, 0, result.stderr);
});

test("publication guard passes on this repository", () => {
  const result = spawnSync(process.execPath, [guard], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
});
