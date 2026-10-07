"use client";
import { jsx as _jsx } from "react/jsx-runtime";
// Real input level meter. Renders nothing when no measured levels exist --
// it never draws a synthetic waveform.
export function OyiVoiceLevel({ levels, label = "Microphone input level", className }) {
    const measured = (levels || []).filter(Number.isFinite).slice(-64).map((level) => Math.max(0, Math.min(1, level)));
    if (!measured.length)
        return null;
    const latest = measured[measured.length - 1] ?? 0;
    return (_jsx("span", { className: ["oyi-voice-level", className].filter(Boolean).join(" "), role: "meter", "aria-label": label, "aria-valuemin": 0, "aria-valuemax": 100, "aria-valuenow": Math.round(latest * 100), children: measured.map((level, index) => (_jsx("span", { className: "oyi-voice-level-bar", style: { transform: `scaleY(${Math.max(0.08, Math.min(1, level))})` }, "aria-hidden": "true" }, index))) }));
}
