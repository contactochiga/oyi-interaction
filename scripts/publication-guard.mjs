// PUBLICATION-SAFETY GUARD. contactochiga/oyi-interaction is PUBLIC: it may
// contain interaction mechanics and presentation ONLY. This fails if any
// shipped or committed file contains patterns representing credentials or
// secrets, production URLs, service-role material, private knowledge corpus,
// Ochiga internal commercial content, authority/business policy code,
// resident/customer data, or internal prompts/system instructions.
// Runs before every build (scripts/build.mjs) and in `npm run check`.
// Usage: node scripts/publication-guard.mjs [--root <dir>]
import fs from "node:fs";
import path from "node:path";

const argRoot = process.argv.indexOf("--root");
const root = argRoot > 0 ? path.resolve(process.argv[argRoot + 1]) : path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const SELF = path.join(root, "scripts", "publication-guard.mjs");
const SKIP_DIRS = new Set(["node_modules", ".git"]);
const TEXT = /\.(ts|tsx|js|mjs|cjs|json|css|md|txt|yml|yaml|html|d\.ts)$/;

function files(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files(full, out);
    else if (TEXT.test(entry.name) || entry.name === ".gitignore") out.push(full);
  }
  return out;
}

// Only loopback, this repository, and RFC 2606 reserved example domains.
const ALLOWED_URL = /^https?:\/\/(localhost|127\.0\.0\.1|github\.com\/contactochiga\/oyi-interaction|([a-z0-9-]+\.)*example(\.(com|org|net|test))?(?=[\/:?#]|$))/i;
const RULES = [
  ["credential/secret", /sk-[A-Za-z0-9_-]{16,}|sk_live_[A-Za-z0-9]{8,}|gh[pousr]_[A-Za-z0-9]{20,}|xox[abpr]-[A-Za-z0-9-]{10,}|AKIA[0-9A-Z]{16}|AIza[0-9A-Za-z_-]{30,}|-----BEGIN [A-Z ]*PRIVATE KEY-----/],
  ["credential/secret (JWT)", /eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/],
  ["credential/secret (assignment)", /\b(api[_-]?key|secret|password|passwd|access[_-]?token|auth[_-]?token|private[_-]?key)\b\s*[:=]\s*["'][^"'\s]{12,}["']/i],
  ["service-role material", /service[_-]?role|SUPABASE_SERVICE|OYI_LOCAL_SUPABASE|APP_JWT_SECRET|OYI_TRACE_REFERENCE_KEY|OFFICE_SYNC_API_KEY/i],
  ["production infrastructure", /zcpgtdakqxyvjkmiibei|onrender\.com|\.supabase\.co\b|vercel\.app|ochiga-lead-agents|oyi-os\.onrender/i],
  ["private knowledge corpus", /do_not_state_verbatim|knowledge[_-]?pack|knowledge[_-]?corpus|INTERNAL_COMMERCIAL|OFFICE_INTERNAL_KNOWLEDGE/i],
  ["internal commercial content", /\b(price list|pricing tier|commission rate|sales playbook|lead score|crm\.leads|opportunit(y|ies) pipeline)\b/i],
  ["authority/business policy code", /\bhasPermission\s*\(|\bpermissionsForRole\b|\bcapabilityService\b|DeviceCommandAuthority|\bcanUse\s*\(|requireOfficeExportKey|rolloutStatus\s*:/],
  ["resident/customer data (email)", /[A-Za-z0-9._%+-]+@(?!example\.(com|org|test)\b)[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/],
  ["resident/customer data (phone)", /\+234\s?\d{3}\s?\d{3}\s?\d{3,4}|\b0[789][01]\d{8}\b/],
  ["resident/customer data (real id)", /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/i],
  ["internal prompt/system instruction", /system[ _-]?prompt|system[ _-]?instruction|developer message|\bYou are (Oyi|an? (AI|assistant|agent))\b|^\s*SYSTEM:/im],
];

const violations = [];
for (const file of files(root)) {
  if (file === SELF) continue;
  const rel = path.relative(root, file);
  const source = fs.readFileSync(file, "utf8");
  const lockfile = rel === "package-lock.json";
  for (const [name, pattern] of RULES) {
    // The lockfile only carries registry metadata; scan it for secrets only.
    if (lockfile && !name.startsWith("credential")) continue;
    const match = source.match(pattern);
    if (match) violations.push(`${name}: ${rel} (matched content redacted)`);
  }
  for (const url of source.match(/https?:\/\/[^\s"'`)<>\]]+/g) || []) {
    if (lockfile && /^https:\/\/registry\.npmjs\.org\//.test(url)) continue;
    if (!ALLOWED_URL.test(url)) violations.push(`external/production URL: ${rel} (matched content redacted)`);
  }
}
if (violations.length) {
  console.error("PUBLICATION GUARD FAILED -- this public package may contain interaction mechanics and presentation only:");
  console.error(violations.join("\n"));
  process.exit(1);
}
console.log(`publication guard passed (${files(root).length - 1} files scanned)`);
