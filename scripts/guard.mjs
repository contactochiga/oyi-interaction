// Architectural guards for the shared interaction package.
//  1. FACILITY REALTIME FIREWALL: zero references to Facility realtime or
//     socket lifecycle. Opening/closing/mounting Oyi must never own sockets.
//  2. No network/transport: the package never talks to Backend itself.
//  3. No surface imports, no app aliases, no Tailwind, no icon/state libs.
//  4. No fake semantic progress stages.
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const dirs = ["src", "dist"].map((d) => path.join(root, d)).filter((d) => fs.existsSync(d));
function files(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files(full, out);
    else if (/\.(ts|tsx|js|mjs|cjs|css)$/.test(entry.name)) out.push(full);
  }
  return out;
}

const RULES = [
  ["realtime firewall", /facilityRealtime|connectFacilityRealtime|socket\.io|subscribe:estate|subscribe:user|scope:replace|\bio\(\s*['"`]/],
  ["no transport", /\bnew\s+WebSocket\b|\bWebSocket\s*\(|\bEventSource\b|\bXMLHttpRequest\b|\bfetch\s*\(|\baxios\b|navigator\.sendBeacon/],
  ["no surface/app imports", /from\s+["'](@\/|next\/|\.\.\/\.\.\/\.\.\/)|require\(["']@\//],
  ["no extra runtime deps", /from\s+["'](lucide-react|zustand|framer-motion|three|@react-three|tailwindcss|socket\.io-client|@tanstack\/)/],
  ["no tailwind directives", /@tailwind|@apply\b/],
  ["no fake progress stages", /["'`](Thinking|Finding what matters|Evidence planning|Reasoning|Response composition)(…|\.\.\.)?["'`]/],
];

const violations = [];
for (const dir of dirs) {
  for (const file of files(dir)) {
    const source = fs.readFileSync(file, "utf8");
    for (const [name, pattern] of RULES) {
      const match = source.match(pattern);
      if (match) violations.push(`${name}: ${path.relative(root, file)} -> ${match[0]}`);
    }
  }
}
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const runtimeDeps = Object.keys(pkg.dependencies || {});
if (runtimeDeps.length) violations.push(`package has runtime dependencies: ${runtimeDeps.join(", ")} (only the react peer is allowed)`);
if (violations.length) {
  console.error(violations.join("\n"));
  process.exit(1);
}
console.log(`guards passed (${dirs.map((d) => path.relative(root, d)).join(", ")}): realtime firewall, no transport, no surface imports, no extra deps, no Tailwind, no fake progress stages`);
