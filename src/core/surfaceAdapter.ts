// Surface adapter contract. A surface (Consumer, Facility) supplies CONTEXT,
// NAVIGATION, STARTER SEEDS, OPERATIONAL-OBJECT context and HISTORY POLICY.
//
// An adapter can NOT:
//   - grant capability authority or override Backend permission results;
//   - invent or alter execution truth;
//   - modify Core semantics.
// The contract has no field through which it could, and
// defineOyiSurfaceAdapter() rejects any attempt to add one.
import type { OyiSuggestionInput } from "./suggestions.js";

export const OYI_SURFACES = ["consumer", "facility"] as const;
export type OyiSurface = (typeof OYI_SURFACES)[number];

export type OyiSurfaceContext = {
  scopeKind: "home" | "unit" | "estate" | "building" | "none";
  scopeLabel: string | null;
  estateId: string | null;
  homeId: string | null;
  buildingId: string | null;
};

// Navigation items MUST already be filtered by the surface's existing
// permission-aware registry (Consumer CONSUMER_MODULES / Facility
// FACILITY_MODULES via visibleModules). Visibility is not authority.
export type OyiNavigationItem = { key: string; label: string; href: string };

export type OyiHistoryPolicy = {
  source: "backend_threads";
  // "unsaved_turns_only": the surface keeps on-device copies only of turns
  // Backend could not persist (or for signed-out use); never a second
  // synced history.
  localFallback: "none" | "unsaved_turns_only";
  maxThreads: number;
};

export type OyiSurfaceAdapter = {
  readonly surface: OyiSurface;
  readonly context: () => OyiSurfaceContext;
  readonly navigation: () => readonly OyiNavigationItem[];
  readonly starterSeeds: () => readonly OyiSuggestionInput[];
  readonly operationalObject: () => Readonly<Record<string, unknown>> | null;
  readonly historyPolicy: OyiHistoryPolicy;
  // UI capability hints only (e.g. whether a voice entry point is shown).
  // These never authorize anything: Backend decides every permission.
  readonly uiHints: { readonly voiceEntry: boolean };
};

const ALLOWED_KEYS = new Set(["surface", "context", "navigation", "starterSeeds", "operationalObject", "historyPolicy", "uiHints"]);
const FORBIDDEN_KEY = /authority|authori[sz]e|grant|permission(s)?Override|override|execute|execution|truth|verify|capabilit(y|ies)|orchestrat|runtime/i;

export class OyiSurfaceAdapterError extends Error {}

export function defineOyiSurfaceAdapter(adapter: OyiSurfaceAdapter): OyiSurfaceAdapter {
  if (!adapter || typeof adapter !== "object") throw new OyiSurfaceAdapterError("Surface adapter must be an object.");
  if (!(OYI_SURFACES as readonly string[]).includes(adapter.surface)) throw new OyiSurfaceAdapterError(`Unknown surface: ${String(adapter.surface)}`);
  for (const key of Object.keys(adapter)) {
    if (FORBIDDEN_KEY.test(key)) throw new OyiSurfaceAdapterError(`Surface adapters cannot carry "${key}": authority and execution truth belong to Oyi Core.`);
    if (!ALLOWED_KEYS.has(key)) throw new OyiSurfaceAdapterError(`Unknown surface adapter field: ${key}`);
  }
  for (const fn of ["context", "navigation", "starterSeeds", "operationalObject"] as const) {
    if (typeof adapter[fn] !== "function") throw new OyiSurfaceAdapterError(`Surface adapter ${fn} must be a function.`);
  }
  const policy = adapter.historyPolicy;
  if (!policy || policy.source !== "backend_threads" || !["none", "unsaved_turns_only"].includes(policy.localFallback) || !(policy.maxThreads > 0)) {
    throw new OyiSurfaceAdapterError("Surface adapter historyPolicy must use backend_threads with a valid local fallback policy.");
  }
  if (!adapter.uiHints || typeof adapter.uiHints.voiceEntry !== "boolean") throw new OyiSurfaceAdapterError("Surface adapter uiHints.voiceEntry must be boolean.");
  return Object.freeze({ ...adapter, historyPolicy: Object.freeze({ ...policy }), uiHints: Object.freeze({ ...adapter.uiHints }) });
}

// Navigation sanity: in-app routes only, unique keys. The adapter remains
// responsible for permission filtering through its own registry.
export function normalizeOyiNavigation(items: readonly OyiNavigationItem[]): OyiNavigationItem[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (!item || typeof item.key !== "string" || typeof item.href !== "string" || !/^\/(?!\/)/.test(item.href) || seen.has(item.key)) return false;
    seen.add(item.key);
    return true;
  }).map((item) => ({ key: item.key, label: String(item.label || item.key), href: item.href }));
}
