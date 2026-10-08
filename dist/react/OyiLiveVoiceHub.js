"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { OyiOrb } from "./OyiOrb.js";
import { OyiVoiceLevel } from "./OyiVoiceLevel.js";
import { IconClose, IconMic } from "./icons.js";
/** Non-modal dock panel; never owns transport, authority or a second composer. */
export function OyiLiveVoiceHub({ state, levels, onEnd, onMute, onResume }) {
    if (state.phase === "closed")
        return null;
    const resume = state.phase === "muted" || state.phase === "error";
    const activity = state.phase === "listening" ? " · Listening" : state.phase === "speaking" ? " · Speaking" : state.phase === "muted" ? " · Muted" : "";
    return _jsxs("section", { className: "oyi-live-voice-hub", "aria-label": "Browser Live Voice", "data-phase": state.phase, onKeyDown: (event) => { if (event.key === "Escape") {
            event.stopPropagation();
            onEnd();
        } }, children: [_jsxs("div", { className: "oyi-live-voice-controls", children: [_jsx("button", { type: "button", className: "oyi-icon-button", onClick: resume ? onResume : onMute, disabled: state.phase === "unsupported" || (resume && state.requestPending), "aria-label": resume ? "Resume live microphone" : "Mute live microphone", "aria-pressed": state.phase === "muted", children: _jsx(IconMic, {}) }), _jsxs("span", { className: "oyi-live-voice-label", children: ["Live Voice", activity] }), _jsx("button", { type: "button", className: "oyi-icon-button", onClick: onEnd, "aria-label": "End Live Voice", children: _jsx(IconClose, {}) })] }), _jsx("div", { className: "oyi-live-voice-orb", children: _jsx(OyiOrb, { size: "medium", state: state.phase === "listening" ? "listening" : state.phase === "speaking" ? "responding" : state.phase === "working" ? "working" : "idle" }) }), state.phase === "listening" ? _jsx(OyiVoiceLevel, { levels: levels }) : null, _jsx("p", { className: "oyi-live-voice-caption", role: "status", "aria-live": "polite", children: state.caption })] });
}
