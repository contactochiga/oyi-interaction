export const OYI_SURFACES = ["consumer", "facility"];
const ALLOWED_KEYS = new Set(["surface", "context", "navigation", "starterSeeds", "operationalObject", "historyPolicy", "uiHints"]);
const FORBIDDEN_KEY = /authority|authori[sz]e|grant|permission(s)?Override|override|execute|execution|truth|verify|capabilit(y|ies)|orchestrat|runtime/i;
export class OyiSurfaceAdapterError extends Error {
}
export function defineOyiSurfaceAdapter(adapter) {
    if (!adapter || typeof adapter !== "object")
        throw new OyiSurfaceAdapterError("Surface adapter must be an object.");
    if (!OYI_SURFACES.includes(adapter.surface))
        throw new OyiSurfaceAdapterError(`Unknown surface: ${String(adapter.surface)}`);
    for (const key of Object.keys(adapter)) {
        if (FORBIDDEN_KEY.test(key))
            throw new OyiSurfaceAdapterError(`Surface adapters cannot carry "${key}": authority and execution truth belong to Oyi Core.`);
        if (!ALLOWED_KEYS.has(key))
            throw new OyiSurfaceAdapterError(`Unknown surface adapter field: ${key}`);
    }
    for (const fn of ["context", "navigation", "starterSeeds", "operationalObject"]) {
        if (typeof adapter[fn] !== "function")
            throw new OyiSurfaceAdapterError(`Surface adapter ${fn} must be a function.`);
    }
    const policy = adapter.historyPolicy;
    if (!policy || policy.source !== "backend_threads" || !["none", "unsaved_turns_only", "backend_cache"].includes(policy.localFallback) || !(policy.maxThreads > 0)) {
        throw new OyiSurfaceAdapterError("Surface adapter historyPolicy must use backend_threads with a valid local fallback policy.");
    }
    if (!adapter.uiHints || typeof adapter.uiHints.voiceEntry !== "boolean")
        throw new OyiSurfaceAdapterError("Surface adapter uiHints.voiceEntry must be boolean.");
    return Object.freeze({ ...adapter, historyPolicy: Object.freeze({ ...policy }), uiHints: Object.freeze({ ...adapter.uiHints }) });
}
// Navigation sanity: in-app routes only, unique keys. The adapter remains
// responsible for permission filtering through its own registry.
export function normalizeOyiNavigation(items) {
    const seen = new Set();
    return items.filter((item) => {
        if (!item || typeof item.key !== "string" || typeof item.href !== "string" || !/^\/(?!\/)/.test(item.href) || seen.has(item.key))
            return false;
        seen.add(item.key);
        return true;
    }).map((item) => ({ key: item.key, label: String(item.label || item.key), href: item.href }));
}
