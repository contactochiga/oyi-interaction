"use client";

// Caption / transcript primitive. Shows text exactly as received (no
// simulated streaming). A spoken range is highlighted only when the surface
// passes real speech-boundary positions.
import type { OyiCaptionEntry } from "../core/caption.js";

const KIND_LABEL: Record<OyiCaptionEntry["kind"], string> = {
  user_interim: "You (still listening)",
  user_final: "You",
  oyi_response: "Oyi",
  clarification: "Oyi needs more information",
  truth_note: "Action status",
  degraded_note: "Notice",
};

function Spoken({ text, range }: { text: string; range?: { start: number; end: number } | null }) {
  if (!range) return <>{text}</>;
  return (
    <>
      {text.slice(0, range.start)}
      <mark className="oyi-caption-spoken">{text.slice(range.start, range.end)}</mark>
      {text.slice(range.end)}
    </>
  );
}

export function OyiCaption({ entries, live = true, className }: { entries: OyiCaptionEntry[]; live?: boolean; className?: string }) {
  if (!entries.length) return null;
  return (
    <div className={["oyi-caption", className].filter(Boolean).join(" ")} aria-live={live ? "polite" : undefined} aria-atomic="false">
      {entries.map((entry, index) => (
        <p key={`${entry.kind}-${index}`} className="oyi-caption-line" data-kind={entry.kind}>
          <span className="oyi-visually-hidden">{KIND_LABEL[entry.kind]}: </span>
          <Spoken text={entry.text} range={entry.spokenRange} />
        </p>
      ))}
    </div>
  );
}
