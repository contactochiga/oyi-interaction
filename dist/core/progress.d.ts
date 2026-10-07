import type { OyiInteractionView } from "./interactionState.js";
export type OyiProgressStepState = "done" | "active" | "attention" | "failed";
export type OyiProgressStep = {
    key: string;
    label: string;
    state: OyiProgressStepState;
};
export declare function oyiProgressSteps(view: Pick<OyiInteractionView, "phase" | "action">, options?: {
    voiceTurn?: boolean;
}): OyiProgressStep[];
export declare function pushOyiVoiceLevel(levels: readonly number[], level: number, size?: number): number[];
