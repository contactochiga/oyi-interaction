// Voice adapter INTERFACE. No implementation lives here.
//
// IMPORTANT: browser Web Speech (SpeechRecognition / webkitSpeechRecognition)
// is NOT a reliable installed-app solution: it is missing or restricted in
// iOS/Android WebViews (Capacitor), depends on vendor cloud services and
// fails silently in several engines. Consumer and Facility may temporarily
// wrap their existing Web Speech code behind this interface; a native
// implementation (Capacitor speech plugin) lands in a later slice behind the
// SAME interface.
import type { OyiInteractionEvent } from "./interactionState.js";

export type OyiVoicePermissionState = "unknown" | "prompt" | "granted" | "denied" | "unsupported";
export type OyiVoiceAdapterStatus = "idle" | "listening" | "transcribing" | "error";

export type OyiVoiceSnapshot = {
  available: boolean;
  permissionState: OyiVoicePermissionState;
  status: OyiVoiceAdapterStatus;
  interimTranscript: string;
  finalTranscript: string;
  // 0..1 when the implementation can measure input level; null otherwise.
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

export const OYI_VOICE_IDLE_SNAPSHOT: OyiVoiceSnapshot = Object.freeze({
  available: false,
  permissionState: "unsupported",
  status: "idle",
  interimTranscript: "",
  finalTranscript: "",
  audioLevel: null,
  error: null,
});

export function createUnavailableVoiceAdapter(): OyiVoiceAdapter {
  return {
    kind: "unavailable",
    getSnapshot: () => OYI_VOICE_IDLE_SNAPSHOT,
    subscribe: () => () => undefined,
    startListening: () => undefined,
    stopListening: () => undefined,
    cancelListening: () => undefined,
  };
}

// Translates adapter snapshots into interaction events, so any voice
// implementation drives the ONE interaction reducer the same way.
export function voiceSnapshotEvents(previous: OyiVoiceSnapshot, next: OyiVoiceSnapshot): OyiInteractionEvent[] {
  const events: OyiInteractionEvent[] = [];
  const wasActive = previous.status === "listening" || previous.status === "transcribing";
  if (next.status === "listening" && previous.status !== "listening" && previous.status !== "transcribing") events.push({ type: "voice.listening" });
  if (next.status === "transcribing" && previous.status !== "transcribing") {
    if (!wasActive) events.push({ type: "voice.listening" });
    events.push({ type: "voice.transcribing" });
  }
  if ((next.status === "listening" || next.status === "transcribing") && next.interimTranscript !== previous.interimTranscript) events.push({ type: "voice.interim", text: next.interimTranscript });
  if (next.status === "error" && previous.status !== "error") events.push({ type: "voice.error", message: next.error || "Voice input failed." });
  if (next.status === "idle" && wasActive) {
    events.push(next.finalTranscript && next.finalTranscript !== previous.finalTranscript ? { type: "voice.final", text: next.finalTranscript } : { type: "voice.ended" });
  }
  return events;
}
