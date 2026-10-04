"use client";

// Responsive shell PRIMITIVE: named slots placed by CSS grid areas per
// layout class (mobile / tablet / desktop). It is not the final redesign:
// surfaces compose their own layouts from these slots.
import type { ReactNode } from "react";
import { useOyiLayout, type OyiLayoutClass } from "./hooks.js";

export const OYI_SHELL_SLOTS = [
  "topRail",
  "sidebar",
  "mainCanvas",
  "contextSelector",
  "history",
  "caption",
  "suggestions",
  "composer",
  "temporaryProgress",
  "surfaceNavigation",
] as const;

export type OyiShellSlot = (typeof OYI_SHELL_SLOTS)[number];

export type OyiShellProps = Partial<Record<OyiShellSlot, ReactNode>> & {
  // Override the detected layout (tests, previews, embedded docks).
  layout?: OyiLayoutClass;
  // On mobile the history and sidebar slots are drawers; the surface decides
  // when they are open.
  historyOpen?: boolean;
  sidebarOpen?: boolean;
  label?: string;
  className?: string;
};

const SLOT_CLASS: Record<OyiShellSlot, string> = {
  topRail: "oyi-shell-top-rail",
  sidebar: "oyi-shell-sidebar",
  mainCanvas: "oyi-shell-main",
  contextSelector: "oyi-shell-context",
  history: "oyi-shell-history",
  caption: "oyi-shell-caption",
  suggestions: "oyi-shell-suggestions",
  composer: "oyi-shell-composer",
  temporaryProgress: "oyi-shell-progress",
  surfaceNavigation: "oyi-shell-nav",
};

export function OyiShell(props: OyiShellProps) {
  const detected = useOyiLayout();
  const layout = props.layout || detected;
  return (
    <div
      className={["oyi-shell", props.className].filter(Boolean).join(" ")}
      data-oyi-shell="true"
      data-layout={layout}
      data-history-open={props.historyOpen ? "true" : "false"}
      data-sidebar-open={props.sidebarOpen ? "true" : "false"}
      aria-label={props.label}
    >
      {OYI_SHELL_SLOTS.map((slot) => {
        const content = props[slot];
        if (content === undefined || content === null || content === false) return null;
        if (slot === "temporaryProgress") return <div key={slot} className={SLOT_CLASS[slot]} role="status" aria-live="polite">{content}</div>;
        return <div key={slot} className={SLOT_CLASS[slot]} data-slot={slot}>{content}</div>;
      })}
    </div>
  );
}
