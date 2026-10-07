// Composer state machine.
//
//   EMPTY        +   "Write a message or tap to speak…"   MIC
//   TYPING       +   [text]                               MIC  SEND
//   VOICE        listening/transcribing                  CANCEL  STOP
//   PROCESSING   a turn is in flight: the input stays editable (the user
//                may draft the next message) but SEND and Enter are inert,
//                so a turn can never be submitted twice.
//   CONFIRMATION a proposal awaits approval. Confirm/Cancel live in the
//                confirmation primitive, never on the send button; the
//                composer behaves as TYPING/EMPTY for ordinary messages.
//   DISABLED     the surface disabled the composer (e.g. offline policy).
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

export const OYI_COMPOSER_PLACEHOLDER = "Write a message";

export function composerMode(input: { value: string; voiceActive: boolean; turnInFlight: boolean; confirmationPending: boolean; disabled?: boolean }): OyiComposerMode {
  if (input.disabled) return "disabled";
  if (input.voiceActive) return "voice";
  if (input.turnInFlight) return "processing";
  if (input.confirmationPending && !input.value.trim()) return "confirmation";
  return input.value.trim() ? "typing" : "empty";
}

export function composerControls(input: { value: string; voiceActive: boolean; turnInFlight: boolean; confirmationPending: boolean; disabled?: boolean; voiceAvailable: boolean }): OyiComposerControls {
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

export function composerControlsForView(view: Pick<OyiInteractionView, "voice" | "turnInFlight" | "action" | "canonical">, input: { value: string; disabled?: boolean; voiceAvailable: boolean }): OyiComposerControls {
  return composerControls({
    value: input.value,
    disabled: input.disabled,
    voiceAvailable: input.voiceAvailable,
    voiceActive: view.voice.status === "listening" || view.voice.status === "transcribing",
    turnInFlight: view.turnInFlight,
    confirmationPending: Boolean(view.action?.awaiting_user) || view.canonical?.kind === "confirmation",
  });
}
