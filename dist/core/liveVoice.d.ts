import type { OyiVoiceAdapter } from "./voice.js";
/** Half-duplex presentation/session contract. Hosts own recognition, speech
 * output and the EXISTING governed conversation request. No network here. */
export type OyiLiveVoicePhase = "closed" | "permission" | "listening" | "finalizing" | "working" | "speaking" | "muted" | "error" | "unsupported";
export type OyiLiveVoiceSnapshot = {
    phase: OyiLiveVoicePhase;
    caption: string;
    requestPending: boolean;
};
export interface OyiSpeechOutput {
    available: boolean;
    speak(text: string, onStart: () => void): Promise<void>;
    cancel(): void;
}
export declare function createOyiLiveVoiceSession(options: {
    input: OyiVoiceAdapter;
    output: OyiSpeechOutput;
    submit: (text: string) => Promise<string>;
}): {
    getSnapshot: () => OyiLiveVoiceSnapshot;
    subscribe(fn: (state: OyiLiveVoiceSnapshot) => void): () => void;
    start(): void;
    mute(reason?: string): void;
    resume(): void;
    end(): void;
    dispose(): void;
};
