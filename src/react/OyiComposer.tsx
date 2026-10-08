"use client";

// Composer primitive implementing the composer state machine
// (core/composer.ts). Voice is callback-only: the surface wires its voice
// adapter (Web Speech today, native later) to onStartVoice/onStopVoice/
// onCancelVoice. Confirmation controls never live here.
import { useRef, type ReactNode } from "react";
import { composerControls } from "../core/composer.js";
import { IconClose, IconMic, IconPlus, IconSend, IconStop } from "./icons.js";
import { OyiVoiceLevel } from "./OyiVoiceLevel.js";

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
  // Opt-in keeps older hosts' compact composer unchanged.
  controlsLayout?: "compact" | "expanded";
  voiceElapsedSeconds?: number;
  voiceStopping?: boolean;
  voiceInterim?: string;
  // Real measured input levels (0..1); omitted/empty = no meter is drawn.
  voiceLevels?: readonly number[] | null;
  onStartVoice?: () => void;
  onStartLiveVoice?: () => void;
  onEndLiveVoice?: () => void;
  liveVoiceActive?: boolean;
  onStopVoice?: () => void;
  // Host finalizes recognition before submitting through its normal turn path.
  onSendVoice?: () => void;
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
  const expanded = props.controlsLayout === "expanded";
  const elapsed = Math.max(0, Math.floor(props.voiceElapsedSeconds || 0));

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
      <div className={["oyi-composer", props.className].filter(Boolean).join(" ")} data-mode="voice" data-finalizing={props.voiceStopping || undefined}>
        {expanded && props.onCancelVoice ? <button type="button" className="oyi-icon-button" onClick={props.onCancelVoice} aria-label="Cancel voice input"><IconClose /></button> : null}
        <div className="oyi-composer-voice" role="status" aria-live="polite">
          <span className="oyi-composer-voice-dot" aria-hidden="true" />
          <span className={expanded ? "oyi-visually-hidden" : "oyi-composer-voice-label"}>{props.voiceStatusLabel || "Listening…"}</span>
          {expanded ? <span className="oyi-composer-timer" aria-label="Recording duration" aria-live="off">{Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, "0")}</span> : null}
          <OyiVoiceLevel levels={props.voiceLevels} />
          {!expanded && props.voiceInterim ? <span className="oyi-composer-voice-interim">{props.voiceInterim}</span> : null}
        </div>
        {!expanded && controls.showCancelVoice && props.onCancelVoice ? <button type="button" className="oyi-icon-button" onClick={props.onCancelVoice} aria-label="Cancel voice input"><IconClose /></button> : null}
        {controls.showStopVoice && props.onStopVoice ? <button type="button" className="oyi-icon-button is-active" onClick={props.onStopVoice} disabled={props.voiceStopping} aria-label="Stop voice input"><IconStop /></button> : null}
        {expanded && props.onSendVoice ? <button type="button" className="oyi-send-button" onClick={props.onSendVoice} disabled={props.voiceStopping || props.disabled || props.turnInFlight} aria-label="Finalize and send voice message"><IconSend /></button> : null}
      </div>
    );
  }

  return (
    <form
      className={["oyi-composer", props.className].filter(Boolean).join(" ")}
      data-mode={controls.mode}
      aria-busy={controls.mode === "processing" ? true : undefined}
      onKeyDown={(event) => { if (event.key === "Escape" && props.liveVoiceActive && props.onEndLiveVoice) { event.stopPropagation(); props.onEndLiveVoice(); } }}
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
        onChange={(event) => { event.target.style.height = "auto"; event.target.style.height = `${Math.min(event.target.scrollHeight, 144)}px`; props.onChange(event.target.value); }}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
            event.preventDefault();
            submit();
          }
        }}
      />
      {expanded || controls.showMic ? <button type="button" className="oyi-icon-button" onClick={props.onStartVoice} disabled={props.liveVoiceActive || controls.inputDisabled || controls.mode === "processing" || !props.onStartVoice} aria-label={props.liveVoiceActive ? "One-shot microphone unavailable while Live Voice is active" : "Speak to Oyi"}><IconMic /></button> : null}
      {props.onStartLiveVoice && !props.value.trim() && controls.mode !== "processing" ? (!props.liveVoiceActive ? <button type="button" className="oyi-icon-button" onClick={props.onStartLiveVoice} disabled={props.disabled} aria-label="Start Live Voice"><svg viewBox="0 0 24 24" width="1em" height="1em" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M4 10v4M8 6v12M12 3v18M16 6v12M20 10v4" /></svg></button> : null) : expanded || controls.showSend ? <button type="submit" className="oyi-send-button" disabled={!controls.sendEnabled} aria-label={controls.mode === "processing" ? "Sending is paused while Oyi is working" : "Send message"}><IconSend /></button> : null}
      {props.liveVoiceActive && props.onEndLiveVoice ? <button type="button" className="oyi-icon-button" onClick={props.onEndLiveVoice} aria-label="End Live Voice"><IconClose /></button> : null}
    </form>
  );
}
