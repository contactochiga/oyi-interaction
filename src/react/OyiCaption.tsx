"use client";

// Caption / transcript primitive. Shows text exactly as received (no
// simulated streaming). A spoken range is highlighted only when the surface
// passes real speech-boundary positions.
import { useState } from "react";
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

export function OyiCaption({ entries, live = true, collapseAfter = 0, className }: { entries: OyiCaptionEntry[]; live?: boolean; collapseAfter?: number; className?: string }) {
  // Long replies stay readable without breaking the calm composition: the
  // reply collapses after `collapseAfter` characters behind an explicit,
  // accessible expand control (the full text is never altered).
  const [expanded, setExpanded] = useState(false);
  if (!entries.length) return null;
  return (
    <div className={["oyi-caption", className].filter(Boolean).join(" ")} aria-live={live ? "polite" : undefined} aria-atomic="false">
      {entries.map((entry, index) => {
        const long = collapseAfter > 0 && (entry.kind === "oyi_response" || entry.kind === "clarification") && entry.text.length > collapseAfter;
        const collapsed = long && !expanded;
        return (
          <div key={`${entry.kind}-${index}`} className="oyi-caption-entry" data-kind={entry.kind}>
            <p className="oyi-caption-line" data-kind={entry.kind} data-collapsed={collapsed ? "true" : undefined}>
              <span className="oyi-visually-hidden">{KIND_LABEL[entry.kind]}: </span>
              <Spoken text={entry.text} range={entry.spokenRange} />
            </p>
            {long ? <button type="button" className="oyi-link-button oyi-caption-toggle" aria-expanded={expanded} onClick={() => setExpanded((value) => !value)}>{expanded ? "Show less" : "Show more"}</button> : null}
          </div>
        );
      })}
    </div>
  );
}
