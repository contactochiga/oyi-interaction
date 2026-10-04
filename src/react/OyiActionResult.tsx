"use client";

// Compact action-truth presentation. Renders ONLY canonical action truth
// (actionTruth.ts). Verified semantics (success tone, check) appear only for
// canonical "confirmed". Raw status keys are hidden unless `diagnostic`.
import type { OyiActionResultView } from "../core/actionTruth.js";
import { IconAlert, IconBan, IconCheck, IconClock, IconDashed } from "./icons.js";

function ToneIcon({ view }: { view: OyiActionResultView }) {
  if (view.tone === "verified") return <IconCheck />;
  if (view.tone === "failed") return <IconAlert />;
  if (view.tone === "closed") return <IconBan />;
  if (view.tone === "unverified") return <IconDashed />;
  return <IconClock />;
}

export function OyiActionResult({ view, diagnostic = false, showTerminalNote = false, className }: { view: OyiActionResultView | null; diagnostic?: boolean; showTerminalNote?: boolean; className?: string }) {
  if (!view) return null;
  return (
    <section
      className={["oyi-action-result", className].filter(Boolean).join(" ")}
      data-oyi-action-result="true"
      data-tone={view.tone}
      data-stage={view.stage}
      data-action-status={view.status}
      data-action-verified={view.verified ? "true" : "false"}
      data-terminal-action={view.terminal ? "true" : "false"}
      role="status"
      aria-label={`${view.headline}${view.target_label ? `: ${view.target_label}` : ""}`}
    >
      <span className="oyi-action-result-icon" aria-hidden="true"><ToneIcon view={view} /></span>
      <div className="oyi-action-result-body">
        <p className="oyi-action-result-headline">{view.headline}{view.target_label ? <span className="oyi-action-result-target"> · {view.target_label}</span> : null}</p>
        <p className="oyi-action-result-detail">{view.detail}</p>
        {showTerminalNote && view.terminal ? <p className="oyi-action-result-note">This action is finished. Its confirm and cancel controls cannot be reused.</p> : null}
        {diagnostic ? <p className="oyi-action-result-diagnostic"><code>{view.diagnostic.status}</code>{view.diagnostic.truth ? <> · <code>{Object.entries(view.diagnostic.truth).map(([k, v]) => `${k}=${String(v)}`).join(" ")}</code></> : null}</p> : null}
      </div>
    </section>
  );
}
