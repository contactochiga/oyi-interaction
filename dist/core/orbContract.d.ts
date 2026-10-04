import type { OyiInteractionPhase, OyiInteractionView } from "./interactionState.js";
export declare const OYI_ORB_STATES: readonly ["idle", "listening", "working", "responding", "confirmation", "action_pending", "verified", "unobservable", "failed", "degraded", "offline"];
export type OyiOrbState = (typeof OYI_ORB_STATES)[number];
export type OyiOrbMotion = "none" | "breathe" | "pulse" | "ripple";
export type OyiOrbTone = "accent" | "accent-strong" | "attention" | "success" | "neutral" | "warning" | "muted";
export declare const OYI_ORB_TOKENS: Readonly<Record<OyiOrbState, {
    motion: OyiOrbMotion;
    tone: OyiOrbTone;
    label: string;
}>>;
export declare function orbStateForPhase(phase: OyiInteractionPhase): OyiOrbState;
export declare function orbStateForView(view: Pick<OyiInteractionView, "phase" | "degraded">): OyiOrbState;
