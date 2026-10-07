export const OYI_COMPOSER_PLACEHOLDER = "Write a message";
export function composerMode(input) {
    if (input.disabled)
        return "disabled";
    if (input.voiceActive)
        return "voice";
    if (input.turnInFlight)
        return "processing";
    if (input.confirmationPending && !input.value.trim())
        return "confirmation";
    return input.value.trim() ? "typing" : "empty";
}
export function composerControls(input) {
    const mode = composerMode(input);
    const hasText = Boolean(input.value.trim());
    return {
        mode,
        inputDisabled: mode === "disabled" || mode === "voice",
        showMic: input.voiceAvailable && !hasText && (mode === "empty" || mode === "confirmation" || mode === "processing"),
        showSend: hasText && (mode === "typing" || mode === "processing"),
        sendEnabled: mode === "typing" && hasText,
        showStopVoice: mode === "voice",
        showCancelVoice: mode === "voice",
        placeholder: OYI_COMPOSER_PLACEHOLDER,
    };
}
export function composerControlsForView(view, input) {
    return composerControls({
        value: input.value,
        disabled: input.disabled,
        voiceAvailable: input.voiceAvailable,
        voiceActive: view.voice.status === "listening" || view.voice.status === "transcribing",
        turnInFlight: view.turnInFlight,
        confirmationPending: Boolean(view.action?.awaiting_user) || view.canonical?.kind === "confirmation",
    });
}
