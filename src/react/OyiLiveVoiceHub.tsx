"use client";
import type { OyiLiveVoiceSnapshot } from "../core/liveVoice.js";
import { OyiOrb } from "./OyiOrb.js";

/** Standalone dock Orb. Session controls belong to the host's composer. */
export function OyiLiveVoiceHub({ state, onEnd, onResume }: {
  state: OyiLiveVoiceSnapshot; levels?: readonly number[];
  // Retained callback/level props keep existing host integrations source compatible.
  onEnd?: () => void; onMute?: () => void; onResume?: () => void;
}) {
  if (state.phase === "closed") return null;
  const resume = state.phase === "muted" || state.phase === "error";
  const details = resume || state.phase === "unsupported";
  const caption = state.phase === "permission" ? "Connecting…"
    : state.phase === "listening" ? "Listening…"
    : state.phase === "speaking" ? "Speaking…"
    : state.phase === "working" ? "Working…"
    : state.phase === "finalizing" ? (state.caption.startsWith("Starting speech") ? "Preparing speech…" : "Finalizing…")
    : state.phase === "muted" ? (/offline/i.test(state.caption) ? "Connection interrupted" : "Voice paused")
    : state.phase === "unsupported" ? "Voice unavailable" : "Voice interrupted";
  return <section className="oyi-live-voice-hub" aria-label="Browser Live Voice" data-phase={state.phase} onKeyDown={(event) => { if (event.key === "Escape" && onEnd) { event.stopPropagation(); onEnd(); } }}>
    <div className="oyi-live-voice-orb"><OyiOrb size="medium" state={state.phase === "listening" ? "listening" : state.phase === "speaking" ? "responding" : state.phase === "working" ? "working" : "idle"} /></div>
    <p className="oyi-live-voice-caption" role="status" aria-live="polite">{caption}</p>
    {details ? <details className="oyi-live-voice-details" key={state.phase}>
      <summary>Voice details</summary>
      <p>{state.caption}</p>
      {resume && onResume ? <button type="button" onClick={onResume} disabled={state.requestPending}>Resume voice</button> : null}
    </details> : null}
  </section>;
}
