import { type OyiCanonicalAction } from "./actionTruth.js";
export type OyiCanonicalKind = "answer" | "clarification" | "confirmation" | "action";
export type OyiCanonicalProjection = {
    kind: OyiCanonicalKind;
    text: string;
    action: OyiCanonicalAction | null;
    persistence_saved: boolean;
    capability_result: string | null;
};
export declare function projectCanonicalResponse(response: unknown): OyiCanonicalProjection | null;
export declare const OYI_EMPTY_RESPONSE_TEXT = "Oyi did not return an answer for this request.";
export declare function emptyResponseText(response: unknown): string;
