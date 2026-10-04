import type { OyiSuggestionInput } from "./suggestions.js";
export declare const OYI_SURFACES: readonly ["consumer", "facility"];
export type OyiSurface = (typeof OYI_SURFACES)[number];
export type OyiSurfaceContext = {
    scopeKind: "home" | "unit" | "estate" | "building" | "none";
    scopeLabel: string | null;
    estateId: string | null;
    homeId: string | null;
    buildingId: string | null;
};
export type OyiNavigationItem = {
    key: string;
    label: string;
    href: string;
};
export type OyiHistoryPolicy = {
    source: "backend_threads";
    localFallback: "none" | "unsaved_turns_only" | "backend_cache";
    maxThreads: number;
};
export type OyiSurfaceAdapter = {
    readonly surface: OyiSurface;
    readonly context: () => OyiSurfaceContext;
    readonly navigation: () => readonly OyiNavigationItem[];
    readonly starterSeeds: () => readonly OyiSuggestionInput[];
    readonly operationalObject: () => Readonly<Record<string, unknown>> | null;
    readonly historyPolicy: OyiHistoryPolicy;
    readonly uiHints: {
        readonly voiceEntry: boolean;
    };
};
export declare class OyiSurfaceAdapterError extends Error {
}
export declare function defineOyiSurfaceAdapter(adapter: OyiSurfaceAdapter): OyiSurfaceAdapter;
export declare function normalizeOyiNavigation(items: readonly OyiNavigationItem[]): OyiNavigationItem[];
