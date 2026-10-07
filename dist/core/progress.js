export function oyiProgressSteps(view, options = {}) {
    switch (view.phase) {
        case "listening":
            return [{ key: "listening", label: "Listening", state: "active" }];
        case "transcribing":
            return [{ key: "transcribing", label: "Transcribing", state: "active" }];
        case "working":
            return [{ key: "working", label: "Working", state: "active" }];
        case "responding":
            return [{ key: "responding", label: "Responding", state: "active" }];
        default:
            break;
    }
    const action = view.action;
    if (!action)
        return [];
    switch (action.stage) {
        case "proposed":
            return [{ key: "confirm", label: "Confirmation required", state: "attention" }];
        case "approved":
            return [{ key: "approved", label: "Approved", state: "done" }];
        case "sent":
            return [{ key: "sent", label: "Command sent", state: "active" }];
        case "accepted":
            return [{ key: "accepted", label: "Accepted", state: "active" }];
        case "verifying":
            return [{ key: "verifying", label: "Verifying", state: "active" }];
        case "verified":
            return [{ key: "verified", label: "Verified", state: "done" }];
        case "unobservable":
            return [{ key: "unverified", label: "Not verifiable", state: "attention" }];
        case "timed_out":
            return [{ key: "timed_out", label: "Not verified in time", state: "failed" }];
        case "failed":
            return [{ key: "failed", label: "Failed", state: "failed" }];
        case "rejected":
            return [{ key: "rejected", label: "Rejected by provider", state: "failed" }];
        default:
            // cancelled / superseded: nothing in progress.
            return [];
    }
}
// Real audio level helper: keeps the last `size` measured levels (0..1).
// Never fills with synthetic values -- an empty array means "no meter".
export function pushOyiVoiceLevel(levels, level, size = 24) {
    if (!Number.isFinite(level))
        return levels.slice(-size);
    const clamped = Math.max(0, Math.min(1, level));
    return [...levels.slice(-(size - 1)), clamped];
}
