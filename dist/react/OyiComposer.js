"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Composer primitive implementing the composer state machine
// (core/composer.ts). Voice is callback-only: the surface wires its voice
// adapter (Web Speech today, native later) to onStartVoice/onStopVoice/
// onCancelVoice. Confirmation controls never live here.
import { useRef } from "react";
import { composerControls } from "../core/composer.js";
import { IconClose, IconMic, IconPlus, IconSend, IconStop } from "./icons.js";
import { OyiVoiceLevel } from "./OyiVoiceLevel.js";
export function OyiComposer(props) {
    const lastSubmitted = useRef(null);
    const controls = composerControls({
        value: props.value,
        voiceActive: Boolean(props.voiceActive),
        turnInFlight: Boolean(props.turnInFlight),
        confirmationPending: Boolean(props.confirmationPending),
        disabled: props.disabled,
        voiceAvailable: Boolean(props.voiceAvailable && props.onStartVoice),
    });
    function submit() {
        if (!controls.sendEnabled)
            return;
        const value = props.value.trim();
        // Guard against double activation (Enter + click, double tap) before the
        // surface has had a chance to mark the turn in flight.
        const now = Date.now();
        if (lastSubmitted.current && lastSubmitted.current.value === value && now - lastSubmitted.current.at < 800)
            return;
        lastSubmitted.current = { value, at: now };
        props.onSubmit(value);
    }
    if (controls.mode === "voice") {
        return (_jsxs("div", { className: ["oyi-composer", props.className].filter(Boolean).join(" "), "data-mode": "voice", children: [_jsxs("div", { className: "oyi-composer-voice", role: "status", "aria-live": "polite", children: [_jsx("span", { className: "oyi-composer-voice-dot", "aria-hidden": "true" }), _jsx("span", { className: "oyi-composer-voice-label", children: props.voiceStatusLabel || "Listening…" }), _jsx(OyiVoiceLevel, { levels: props.voiceLevels }), props.voiceInterim ? _jsx("span", { className: "oyi-composer-voice-interim", children: props.voiceInterim }) : null] }), controls.showCancelVoice && props.onCancelVoice ? _jsx("button", { type: "button", className: "oyi-icon-button", onClick: props.onCancelVoice, "aria-label": "Cancel voice input", children: _jsx(IconClose, {}) }) : null, controls.showStopVoice && props.onStopVoice ? _jsx("button", { type: "button", className: "oyi-icon-button is-active", onClick: props.onStopVoice, "aria-label": "Stop voice input", children: _jsx(IconStop, {}) }) : null] }));
    }
    return (_jsxs("form", { className: ["oyi-composer", props.className].filter(Boolean).join(" "), "data-mode": controls.mode, "aria-busy": controls.mode === "processing" ? true : undefined, onSubmit: (event) => { event.preventDefault(); submit(); }, children: [props.capabilitySlot ?? (props.onOpenCapabilities ? _jsx("button", { type: "button", className: "oyi-icon-button", onClick: props.onOpenCapabilities, disabled: controls.inputDisabled, "aria-label": "Add or attach", children: _jsx(IconPlus, {}) }) : null), _jsx("textarea", { className: "oyi-composer-input", value: props.value, rows: 1, disabled: controls.inputDisabled, placeholder: controls.placeholder, "aria-label": props.inputLabel || "Message Oyi", onChange: (event) => { event.target.style.height = "auto"; event.target.style.height = `${Math.min(event.target.scrollHeight, 144)}px`; props.onChange(event.target.value); }, onKeyDown: (event) => {
                    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                        event.preventDefault();
                        submit();
                    }
                } }), controls.showMic ? _jsx("button", { type: "button", className: "oyi-icon-button", onClick: props.onStartVoice, disabled: controls.mode === "processing", "aria-label": "Speak to Oyi", children: _jsx(IconMic, {}) }) : null, controls.showSend ? _jsx("button", { type: "submit", className: "oyi-send-button", disabled: !controls.sendEnabled, "aria-label": controls.mode === "processing" ? "Sending is paused while Oyi is working" : "Send message", children: _jsx(IconSend, {}) }) : null] }));
}
