// Suggestion normalization. The interaction layer never decides WHICH
// suggestions exist; surfaces supply them (starter seeds today; awareness
// and Backend suggested_actions later). This only normalizes and dedupes.

export type OyiSuggestionSource = "seed" | "awareness" | "backend";
export type OyiSuggestionIcon = "prompt" | "navigate" | "device" | "security" | "visitor" | "wallet" | "report" | "maintenance";

export type OyiSuggestionInput = {
  id?: string;
  label?: string;
  prompt?: string;
  value?: string;
  href?: string;
  route?: string;
  icon?: string;
  type?: string;
  [key: string]: unknown;
};

export type OyiSuggestion = {
  id: string;
  label: string;
  kind: "prompt" | "navigate";
  prompt: string | null;
  href: string | null;
  icon: OyiSuggestionIcon;
  source: OyiSuggestionSource;
};

const ICONS: ReadonlySet<string> = new Set(["prompt", "navigate", "device", "security", "visitor", "wallet", "report", "maintenance"]);

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function safeHref(value: string) {
  // In-app routes only; never javascript:, protocol-relative or external.
  return /^\/(?!\/)[A-Za-z0-9/_\-?=&.%#]*$/.test(value) ? value : null;
}

export function normalizeOyiSuggestions(inputs: ReadonlyArray<OyiSuggestionInput | null | undefined>, options: { source: OyiSuggestionSource; max?: number }): OyiSuggestion[] {
  const out: OyiSuggestion[] = [];
  const seen = new Set<string>();
  for (const input of inputs || []) {
    if (!input || typeof input !== "object") continue;
    const label = text(input.label) || text(input.prompt);
    if (!label || label.length > 120) continue;
    const href = safeHref(text(input.href) || text(input.route));
    const prompt = text(input.prompt) || text(input.value) || (href ? "" : label);
    const kind = href && !text(input.prompt) ? "navigate" : "prompt";
    if (kind === "prompt" && !prompt) continue;
    const key = label.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    const icon = ICONS.has(text(input.icon)) ? (text(input.icon) as OyiSuggestionIcon) : kind === "navigate" ? "navigate" : "prompt";
    out.push({ id: text(input.id) || `${options.source}:${key}`, label, kind, prompt: kind === "prompt" ? prompt : null, href: kind === "navigate" ? href : null, icon, source: options.source });
    if (options.max && out.length >= options.max) break;
  }
  return out;
}
