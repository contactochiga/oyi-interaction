// Caption / transcript model. No fake streaming: text is shown exactly as
// received. If a reply arrives whole, the caption receives it whole; a
// typewriter effect must never be presented as model streaming.
import type { OyiInteractionView } from "./interactionState.js";

export type OyiCaptionKind = "user_interim" | "user_final" | "oyi_response" | "clarification" | "truth_note" | "degraded_note";

export type OyiCaptionEntry = {
  kind: OyiCaptionKind;
  text: string;
  // Character range currently being spoken, only when the platform's speech
  // engine reports real word boundaries (e.g. SpeechSynthesis boundary
  // events). Never simulated.
  spokenRange?: { start: number; end: number } | null;
};

export const OYI_NOT_SAVED_NOTE = "This reply could not be saved to your history.";

export function buildCaption(view: Pick<OyiInteractionView, "voice" | "canonical" | "action" | "degradedReasons">, options: { spokenRange?: { start: number; end: number } | null } = {}): OyiCaptionEntry[] {
  const entries: OyiCaptionEntry[] = [];
  if (view.voice.interim) entries.push({ kind: "user_interim", text: view.voice.interim });
  if (view.voice.final) entries.push({ kind: "user_final", text: view.voice.final });
  const canonical = view.canonical;
  if (canonical?.text) {
    const range = options.spokenRange && options.spokenRange.end > options.spokenRange.start && options.spokenRange.end <= canonical.text.length ? options.spokenRange : null;
    entries.push({ kind: canonical.kind === "clarification" ? "clarification" : "oyi_response", text: canonical.text, spokenRange: range });
  }
  if (view.action && !view.action.awaiting_user) entries.push({ kind: "truth_note", text: view.action.detail });
  if (view.degradedReasons.includes("not_saved")) entries.push({ kind: "degraded_note", text: OYI_NOT_SAVED_NOTE });
  return entries;
}
