import type { OyiInteractionView } from "./interactionState.js";
export type OyiCaptionKind = "user_interim" | "user_final" | "oyi_response" | "clarification" | "truth_note" | "degraded_note";
export type OyiCaptionEntry = {
    kind: OyiCaptionKind;
    text: string;
    spokenRange?: {
        start: number;
        end: number;
    } | null;
};
export declare const OYI_NOT_SAVED_NOTE = "This reply could not be saved to your history.";
export declare function buildCaption(view: Pick<OyiInteractionView, "voice" | "canonical" | "action" | "degradedReasons">, options?: {
    spokenRange?: {
        start: number;
        end: number;
    } | null;
}): OyiCaptionEntry[];
