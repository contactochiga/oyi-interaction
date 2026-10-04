export const OYI_NOT_SAVED_NOTE = "This reply could not be saved to your history.";
export function buildCaption(view, options = {}) {
    const entries = [];
    if (view.voice.interim)
        entries.push({ kind: "user_interim", text: view.voice.interim });
    if (view.voice.final)
        entries.push({ kind: "user_final", text: view.voice.final });
    const canonical = view.canonical;
    if (canonical?.text) {
        const range = options.spokenRange && options.spokenRange.end > options.spokenRange.start && options.spokenRange.end <= canonical.text.length ? options.spokenRange : null;
        entries.push({ kind: canonical.kind === "clarification" ? "clarification" : "oyi_response", text: canonical.text, spokenRange: range });
    }
    if (view.action && !view.action.awaiting_user)
        entries.push({ kind: "truth_note", text: view.action.detail });
    if (view.degradedReasons.includes("not_saved"))
        entries.push({ kind: "degraded_note", text: OYI_NOT_SAVED_NOTE });
    return entries;
}
