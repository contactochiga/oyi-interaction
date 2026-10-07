import type { OyiInteractionView } from "./interactionState.js";
export type OyiComposerMode = "empty" | "typing" | "voice" | "processing" | "confirmation" | "disabled";
export type OyiComposerControls = {
    mode: OyiComposerMode;
    inputDisabled: boolean;
    showMic: boolean;
    showSend: boolean;
    sendEnabled: boolean;
    showStopVoice: boolean;
    showCancelVoice: boolean;
    placeholder: string;
};
export declare const OYI_COMPOSER_PLACEHOLDER = "Write a message";
export declare function composerMode(input: {
    value: string;
    voiceActive: boolean;
    turnInFlight: boolean;
    confirmationPending: boolean;
    disabled?: boolean;
}): OyiComposerMode;
export declare function composerControls(input: {
    value: string;
    voiceActive: boolean;
    turnInFlight: boolean;
    confirmationPending: boolean;
    disabled?: boolean;
    voiceAvailable: boolean;
}): OyiComposerControls;
export declare function composerControlsForView(view: Pick<OyiInteractionView, "voice" | "turnInFlight" | "action" | "canonical">, input: {
    value: string;
    disabled?: boolean;
    voiceAvailable: boolean;
}): OyiComposerControls;
