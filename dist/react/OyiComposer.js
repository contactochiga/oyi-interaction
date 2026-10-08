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
    const expanded = props.controlsLayout === "expanded";
    const elapsed = Math.max(0, Math.floor(props.voiceElapsedSeconds || 0));
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
        return (_jsxs("div", { className: ["oyi-composer", props.className].filter(Boolean).join(" "), "data-mode": "voice", "data-finalizing": props.voiceStopping || undefined, children: [expanded && props.onCancelVoice ? _jsx("button", { type: "button", className: "oyi-icon-button", onClick: props.onCancelVoice, "aria-label": "Cancel voice input", children: _jsx(IconClose, {}) }) : null, _jsxs("div", { className: "oyi-composer-voice", role: "status", "aria-live": "polite", children: [_jsx("span", { className: "oyi-composer-voice-dot", "aria-hidden": "true" }), _jsx("span", { className: expanded ? "oyi-visually-hidden" : "oyi-composer-voice-label", children: props.voiceStatusLabel || "Listening…" }), expanded ? _jsxs("span", { className: "oyi-composer-timer", "aria-label": "Recording duration", "aria-live": "off", children: [Math.floor(elapsed / 60), ":", String(elapsed % 60).padStart(2, "0")] }) : null, _jsx(OyiVoiceLevel, { levels: props.voiceLevels }), !expanded && props.voiceInterim ? _jsx("span", { className: "oyi-composer-voice-interim", children: props.voiceInterim }) : null] }), !expanded && controls.showCancelVoice && props.onCancelVoice ? _jsx("button", { type: "button", className: "oyi-icon-button", onClick: props.onCancelVoice, "aria-label": "Cancel voice input", children: _jsx(IconClose, {}) }) : null, controls.showStopVoice && props.onStopVoice ? _jsx("button", { type: "button", className: "oyi-icon-button is-active", onClick: props.onStopVoice, disabled: props.voiceStopping, "aria-label": "Stop voice input", children: _jsx(IconStop, {}) }) : null, expanded && props.onSendVoice ? _jsx("button", { type: "button", className: "oyi-send-button", onClick: props.onSendVoice, disabled: props.voiceStopping || props.disabled || props.turnInFlight, "aria-label": "Finalize and send voice message", children: _jsx(IconSend, {}) }) : null] }));
    }
    return (_jsxs("form", { className: ["oyi-composer", props.className].filter(Boolean).join(" "), "data-mode": controls.mode, "aria-busy": controls.mode === "processing" ? true : undefined, onKeyDown: (event) => { if (event.key === "Escape" && props.liveVoiceActive && props.onEndLiveVoice) {
            event.stopPropagation();
            props.onEndLiveVoice();
        } }, onSubmit: (event) => { event.preventDefault(); submit(); }, children: [props.capabilitySlot ?? (props.onOpenCapabilities ? _jsx("button", { type: "button", className: "oyi-icon-button", onClick: props.onOpenCapabilities, disabled: controls.inputDisabled, "aria-label": "Add or attach", children: _jsx(IconPlus, {}) }) : null), _jsx("textarea", { className: "oyi-composer-input", value: props.value, rows: 1, disabled: controls.inputDisabled, placeholder: controls.placeholder, "aria-label": props.inputLabel || "Message Oyi", onChange: (event) => { event.target.style.height = "auto"; event.target.style.height = `${Math.min(event.target.scrollHeight, 144)}px`; props.onChange(event.target.value); }, onKeyDown: (event) => {
                    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                        event.preventDefault();
                        submit();
                    }
                } }), expanded || controls.showMic ? _jsx("button", { type: "button", className: "oyi-icon-button", onClick: props.onStartVoice, disabled: props.liveVoiceActive || controls.inputDisabled || controls.mode === "processing" || !props.onStartVoice, "aria-label": props.liveVoiceActive ? "One-shot microphone unavailable while Live Voice is active" : "Speak to Oyi", children: _jsx(IconMic, {}) }) : null, props.onStartLiveVoice && !props.value.trim() && controls.mode !== "processing" ? (!props.liveVoiceActive ? _jsx("button", { type: "button", className: "oyi-icon-button", onClick: props.onStartLiveVoice, disabled: props.disabled, "aria-label": "Start Live Voice", children: _jsx("svg", { viewBox: "0 0 24 24", width: "1em", height: "1em", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", "aria-hidden": "true", children: _jsx("path", { d: "M4 10v4M8 6v12M12 3v18M16 6v12M20 10v4" }) }) }) : null) : expanded || controls.showSend ? _jsx("button", { type: "submit", className: "oyi-send-button", disabled: !controls.sendEnabled, "aria-label": controls.mode === "processing" ? "Sending is paused while Oyi is working" : "Send message", children: _jsx(IconSend, {}) }) : null, props.liveVoiceActive && props.onEndLiveVoice ? _jsx("button", { type: "button", className: "oyi-icon-button", onClick: props.onEndLiveVoice, "aria-label": "End Live Voice", children: _jsx(IconClose, {}) }) : null] }));
}
