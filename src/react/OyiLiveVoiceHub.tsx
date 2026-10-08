"use client";
import type { OyiLiveVoiceSnapshot } from "../core/liveVoice.js";
import { OyiOrb } from "./OyiOrb.js";
import { OyiVoiceLevel } from "./OyiVoiceLevel.js";
import { IconClose, IconMic } from "./icons.js";

/** Non-modal dock panel; never owns transport, authority or a second composer. */
export function OyiLiveVoiceHub({ state, levels, onEnd, onMute, onResume }: {
  state: OyiLiveVoiceSnapshot; levels?: readonly number[];
  onEnd: () => void; onMute: () => void; onResume: () => void;
}) {
  if (state.phase === "closed") return null;
  const resume = state.phase === "muted" || state.phase === "error";
  return <section className="oyi-live-voice-hub" aria-label="Browser Live Voice" data-phase={state.phase}>
    <div className="oyi-live-voice-controls">
      <button type="button" className="oyi-icon-button" onClick={resume ? onResume : onMute} disabled={state.phase === "unsupported" || (resume && state.requestPending)} aria-label={resume ? "Resume live microphone" : "Mute live microphone"} aria-pressed={state.phase === "muted"}><IconMic /></button>
      <span className="oyi-live-voice-label">Browser Live Voice</span>
      <button type="button" className="oyi-icon-button" onClick={onEnd} aria-label="End Live Voice"><IconClose /></button>
    </div>
    <div className="oyi-live-voice-orb"><OyiOrb size="medium" state={state.phase === "listening" ? "listening" : state.phase === "speaking" ? "responding" : state.phase === "working" ? "working" : "idle"} /></div>
    {state.phase === "listening" ? <OyiVoiceLevel levels={levels} /> : null}
    <p className="oyi-live-voice-caption" role="status" aria-live="polite">{state.caption}</p>
  </section>;
}
