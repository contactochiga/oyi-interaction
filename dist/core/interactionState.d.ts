import { type OyiActionResultView } from "./actionTruth.js";
import { type OyiCanonicalProjection } from "./canonicalResponse.js";
export declare const OYI_INTERACTION_PHASES: readonly ["idle", "listening", "transcribing", "working", "responding", "clarification_required", "confirmation_required", "action_pending", "action_accepted", "action_verifying", "action_verified", "action_unobservable", "action_failed", "action_timed_out", "action_cancelled", "action_superseded", "action_rejected", "degraded", "offline"];
export type OyiInteractionPhase = (typeof OYI_INTERACTION_PHASES)[number];
export declare const OYI_WORKING_TEXT = "Working on your request\u2026";
export declare const OYI_CANONICAL_STREAM_STAGES: readonly string[];
export type OyiVoiceStatus = "idle" | "listening" | "transcribing" | "error";
export type OyiTurnFailure = "offline" | "network" | "server" | "timeout";
export type OyiDegradedReason = "not_saved" | "turn_failed" | "voice_error";
export type OyiInteractionEvent = {
    type: "connectivity.changed";
    online: boolean;
} | {
    type: "voice.listening";
} | {
    type: "voice.interim";
    text: string;
} | {
    type: "voice.transcribing";
} | {
    type: "voice.final";
    text: string;
} | {
    type: "voice.ended";
} | {
    type: "voice.cancelled";
} | {
    type: "voice.error";
    message: string;
} | {
    type: "turn.submitted";
    turnId: string;
} | {
    type: "turn.response";
    turnId: string;
    response: unknown;
} | {
    type: "turn.failed";
    turnId: string;
    reason: OyiTurnFailure;
} | {
    type: "turn.presented";
    turnId: string;
} | {
    type: "turn.stage";
    turnId: string;
    stage: string;
} | {
    type: "action.updated";
    action: unknown;
} | {
    type: "thread.restored";
    latestAssistant: unknown | null;
} | {
    type: "conversation.reset";
};
export type OyiInteractionModel = {
    readonly local: {
        readonly online: boolean;
        readonly voice: {
            readonly status: OyiVoiceStatus;
            readonly interim: string;
            readonly final: string;
            readonly error: string | null;
        };
        readonly turn: {
            readonly id: string | null;
            readonly status: "idle" | "in_flight" | "responding";
            readonly failure: OyiTurnFailure | null;
        };
        readonly stage: string | null;
    };
    readonly canonical: {
        readonly turnId: string | null;
        readonly projection: OyiCanonicalProjection;
    } | null;
};
export type OyiInteractionView = {
    phase: OyiInteractionPhase;
    degraded: boolean;
    degradedReasons: OyiDegradedReason[];
    online: boolean;
    voice: OyiInteractionModel["local"]["voice"];
    turnInFlight: boolean;
    canonical: OyiCanonicalProjection | null;
    action: OyiActionResultView | null;
    label: string;
};
export declare function createInteractionModel(init?: {
    online?: boolean;
}): OyiInteractionModel;
export declare function interactionReducer(model: OyiInteractionModel, event: OyiInteractionEvent): OyiInteractionModel;
export declare function interactionPhaseLabel(phase: OyiInteractionPhase): string;
export declare function deriveInteractionView(model: OyiInteractionModel): OyiInteractionView;
