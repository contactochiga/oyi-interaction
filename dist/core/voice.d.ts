import type { OyiInteractionEvent } from "./interactionState.js";
export type OyiVoicePermissionState = "unknown" | "prompt" | "granted" | "denied" | "unsupported";
export type OyiVoiceAdapterStatus = "idle" | "listening" | "transcribing" | "error";
export type OyiVoiceSnapshot = {
    available: boolean;
    permissionState: OyiVoicePermissionState;
    status: OyiVoiceAdapterStatus;
    interimTranscript: string;
    finalTranscript: string;
    audioLevel: number | null;
    error: string | null;
};
export interface OyiVoiceAdapter {
    readonly kind: "web_speech" | "native" | "unavailable";
    getSnapshot(): OyiVoiceSnapshot;
    subscribe(listener: (snapshot: OyiVoiceSnapshot) => void): () => void;
    startListening(): void | Promise<void>;
    stopListening(): void | Promise<void>;
    cancelListening(): void | Promise<void>;
}
export declare const OYI_VOICE_IDLE_SNAPSHOT: OyiVoiceSnapshot;
export declare function createUnavailableVoiceAdapter(): OyiVoiceAdapter;
export declare function voiceSnapshotEvents(previous: OyiVoiceSnapshot, next: OyiVoiceSnapshot): OyiInteractionEvent[];
