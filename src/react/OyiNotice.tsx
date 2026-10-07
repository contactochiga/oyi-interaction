"use client";

import type { ReactNode } from "react";

// Calm, explicit status notices (offline, unavailable, continuity warnings).
// Never success language: notices only describe what is NOT working.
export function OyiNotice({ tone = "neutral", children, actionLabel, onAction, className }: {
  tone?: "neutral" | "warning" | "offline";
  children: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}) {
  return (
    <div className={["oyi-notice", className].filter(Boolean).join(" ")} data-tone={tone} role={tone === "warning" ? "alert" : "status"}>
      <span className="oyi-notice-text">{children}</span>
      {actionLabel && onAction ? <button type="button" className="oyi-link-button" onClick={onAction}>{actionLabel}</button> : null}
    </div>
  );
}
