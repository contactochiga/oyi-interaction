"use client";

// Composer primitive implementing the composer state machine
// (core/composer.ts). Voice is callback-only: the surface wires its voice
// adapter (Web Speech today, native later) to onStartVoice/onStopVoice/
// onCancelVoice. Confirmation controls never live here.
import { useRef, type ReactNode } from "react";
import { composerControls } from "../core/composer.js";
import { IconClose, IconMic, IconPlus, IconSend, IconStop } from "./icons.js";

export type OyiComposerProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  turnInFlight?: boolean;
  confirmationPending?: boolean;
  disabled?: boolean;
  voiceAvailable?: boolean;
  voiceActive?: boolean;
  voiceStatusLabel?: string;
  voiceInterim?: string;
  onStartVoice?: () => void;
  onStopVoice?: () => void;
  onCancelVoice?: () => void;
  // Attachment / capability trigger slot ("+"). When omitted, a "+" button
  // calling onOpenCapabilities is shown if that callback exists.
  capabilitySlot?: ReactNode;
  onOpenCapabilities?: () => void;
  inputLabel?: string;
  className?: string;
};

export function OyiComposer(props: OyiComposerProps) {
  const lastSubmitted = useRef<{ value: string; at: number } | null>(null);
  const controls = composerControls({
    value: props.value,
    voiceActive: Boolean(props.voiceActive),
    turnInFlight: Boolean(props.turnInFlight),
    confirmationPending: Boolean(props.confirmationPending),
    disabled: props.disabled,
    voiceAvailable: Boolean(props.voiceAvailable && props.onStartVoice),
  });

  function submit() {
    if (!controls.sendEnabled) return;
    const value = props.value.trim();
    // Guard against double activation (Enter + click, double tap) before the
    // surface has had a chance to mark the turn in flight.
    const now = Date.now();
    if (lastSubmitted.current && lastSubmitted.current.value === value && now - lastSubmitted.current.at < 800) return;
    lastSubmitted.current = { value, at: now };
    props.onSubmit(value);
  }

  if (controls.mode === "voice") {
    return (
      <div className={["oyi-composer", props.className].filter(Boolean).join(" ")} data-mode="voice">
        <div className="oyi-composer-voice" role="status" aria-live="polite">
          <span className="oyi-composer-voice-dot" aria-hidden="true" />
          <span className="oyi-composer-voice-label">{props.voiceStatusLabel || "Listening…"}</span>
          {props.voiceInterim ? <span className="oyi-composer-voice-interim">{props.voiceInterim}</span> : null}
        </div>
        {controls.showCancelVoice && props.onCancelVoice ? <button type="button" className="oyi-icon-button" onClick={props.onCancelVoice} aria-label="Cancel voice input"><IconClose /></button> : null}
        {controls.showStopVoice && props.onStopVoice ? <button type="button" className="oyi-icon-button is-active" onClick={props.onStopVoice} aria-label="Stop voice input"><IconStop /></button> : null}
      </div>
    );
  }

  return (
    <form
      className={["oyi-composer", props.className].filter(Boolean).join(" ")}
      data-mode={controls.mode}
      aria-busy={controls.mode === "processing" ? true : undefined}
      onSubmit={(event) => { event.preventDefault(); submit(); }}
    >
      {props.capabilitySlot ?? (props.onOpenCapabilities ? <button type="button" className="oyi-icon-button" onClick={props.onOpenCapabilities} disabled={controls.inputDisabled} aria-label="Add or attach"><IconPlus /></button> : null)}
      <textarea
        className="oyi-composer-input"
        value={props.value}
        rows={1}
        disabled={controls.inputDisabled}
        placeholder={controls.placeholder}
        aria-label={props.inputLabel || "Message Oyi"}
        onChange={(event) => props.onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
            event.preventDefault();
            submit();
          }
        }}
      />
      {controls.showMic ? <button type="button" className="oyi-icon-button" onClick={props.onStartVoice} disabled={controls.mode === "processing"} aria-label="Speak to Oyi"><IconMic /></button> : null}
      {controls.showSend ? <button type="submit" className="oyi-send-button" disabled={!controls.sendEnabled} aria-label={controls.mode === "processing" ? "Sending is paused while Oyi is working" : "Send message"}><IconSend /></button> : null}
    </form>
  );
}
