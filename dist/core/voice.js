export const OYI_VOICE_IDLE_SNAPSHOT = Object.freeze({
    available: false,
    permissionState: "unsupported",
    status: "idle",
    interimTranscript: "",
    finalTranscript: "",
    audioLevel: null,
    error: null,
});
export function createUnavailableVoiceAdapter() {
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
export function voiceSnapshotEvents(previous, next) {
    const events = [];
    const wasActive = previous.status === "listening" || previous.status === "transcribing";
    if (next.status === "listening" && previous.status !== "listening" && previous.status !== "transcribing")
        events.push({ type: "voice.listening" });
    if (next.status === "transcribing" && previous.status !== "transcribing") {
        if (!wasActive)
            events.push({ type: "voice.listening" });
        events.push({ type: "voice.transcribing" });
    }
    if ((next.status === "listening" || next.status === "transcribing") && next.interimTranscript !== previous.interimTranscript)
        events.push({ type: "voice.interim", text: next.interimTranscript });
    if (next.status === "error" && previous.status !== "error")
        events.push({ type: "voice.error", message: next.error || "Voice input failed." });
    if (next.status === "idle" && wasActive) {
        events.push(next.finalTranscript && next.finalTranscript !== previous.finalTranscript ? { type: "voice.final", text: next.finalTranscript } : { type: "voice.ended" });
    }
    return events;
}
