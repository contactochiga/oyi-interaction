export declare const OYI_ACTION_STATUSES: readonly ["draft", "awaiting_confirmation", "approved", "queued", "sent", "provider_accepted", "provider_rejected", "verifying", "confirmed", "unobservable", "timed_out", "failed", "cancelled", "superseded"];
export type OyiActionStatus = (typeof OYI_ACTION_STATUSES)[number];
export type OyiCanonicalAction = {
    action_id: string;
    status: OyiActionStatus;
    requested_operation: string | null;
    requested_state: boolean | null;
    target_label: string | null;
    truth: Readonly<Record<string, string | boolean>> | null;
};
export type OyiActionStage = "proposed" | "approved" | "sent" | "accepted" | "verifying" | "verified" | "unobservable" | "failed" | "timed_out" | "cancelled" | "superseded" | "rejected";
export type OyiActionTone = "awaiting" | "progress" | "verified" | "unverified" | "failed" | "closed";
export type OyiActionResultView = {
    action_id: string;
    status: OyiActionStatus;
    stage: OyiActionStage;
    tone: OyiActionTone;
    headline: string;
    detail: string;
    verified: boolean;
    terminal: boolean;
    awaiting_user: boolean;
    target_label: string | null;
    diagnostic: {
        status: OyiActionStatus;
        truth: Readonly<Record<string, string | boolean>> | null;
    };
};
export declare function isOyiActionStatus(value: unknown): value is OyiActionStatus;
export declare function isTerminalOyiActionStatus(status: OyiActionStatus): boolean;
export declare function readCanonicalAction(source: unknown): OyiCanonicalAction | null;
export declare function presentCanonicalAction(action: OyiCanonicalAction | null): OyiActionResultView | null;
export declare function actionResultView(source: unknown): OyiActionResultView | null;
export declare function applyCanonicalActionUpdate(current: OyiCanonicalAction | null, incoming: unknown): OyiCanonicalAction | null;
