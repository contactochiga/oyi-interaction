"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { OyiOrb } from "./OyiOrb.js";
/** Standalone dock Orb. Session controls belong to the host's composer. */
export function OyiLiveVoiceHub({ state, onEnd, onResume }) {
    if (state.phase === "closed")
        return null;
    const resume = state.phase === "muted" || state.phase === "error";
    const details = resume || state.phase === "unsupported";
    const caption = state.phase === "permission" ? "Connecting…"
        : state.phase === "listening" ? "Listening…"
            : state.phase === "speaking" ? "Speaking…"
                : state.phase === "working" ? "Working…"
                    : state.phase === "finalizing" ? (state.caption.startsWith("Starting speech") ? "Preparing speech…" : "Finalizing…")
                        : state.phase === "muted" ? (/offline/i.test(state.caption) ? "Connection interrupted" : "Voice paused")
                            : state.phase === "unsupported" ? "Voice unavailable" : "Voice interrupted";
    return _jsxs("section", { className: "oyi-live-voice-hub", "aria-label": "Browser Live Voice", "data-phase": state.phase, onKeyDown: (event) => { if (event.key === "Escape" && onEnd) {
            event.stopPropagation();
            onEnd();
        } }, children: [_jsx("div", { className: "oyi-live-voice-orb", children: _jsx(OyiOrb, { size: "medium", state: state.phase === "listening" ? "listening" : state.phase === "speaking" ? "responding" : state.phase === "working" ? "working" : "idle" }) }), _jsx("p", { className: "oyi-live-voice-caption", role: "status", "aria-live": "polite", children: caption }), details ? _jsxs("details", { className: "oyi-live-voice-details", children: [_jsx("summary", { children: "Voice details" }), _jsx("p", { children: state.caption }), resume && onResume ? _jsx("button", { type: "button", onClick: onResume, disabled: state.requestPending, children: "Resume voice" }) : null] }, state.phase) : null] });
}
