"use client";

// Responsive shell PRIMITIVE. Layout is CSS-driven (media queries), so the
// first paint is already correct on every device (no layout shift waiting
// for JS). JS only manages modal behaviour of the drawers.
//
//   mobile  (< 768)      top rail | stage | dock; navigation drawer (left)
//                        and history drawer (right) are modal overlays.
//   tablet  (768-1023)   same composition, wider column; the same drawers
//                        as overlays (sidebar is not docked).
//   desktop (>= 1024)    sidebar DOCKED (open by default, collapsible):
//                        region A = surfaceNavigation, region B = sidebar
//                        (e.g. conversations). History drawer not used.
//
// Slots: topRail (leading), contextSelector (centre), topRailEnd (trailing),
// surfaceNavigation + sidebar (sidebar regions A/B), history (drawer at
// < 1024), mainCanvas + temporaryProgress + caption (scrolling stage),
// suggestions + composer (one continuous dock).
import { useRef, type ReactNode } from "react";
import { useOyiFocusTrap, useOyiLayout, type OyiLayoutClass } from "./hooks.js";

export const OYI_SHELL_SLOTS = [
  "topRail",
  "contextSelector",
  "topRailEnd",
  "sidebar",
  "surfaceNavigation",
  "history",
  "mainCanvas",
  "temporaryProgress",
  "caption",
  "suggestions",
  "composer",
] as const;

export type OyiShellSlot = (typeof OYI_SHELL_SLOTS)[number];

export type OyiShellProps = Partial<Record<OyiShellSlot, ReactNode>> & {
  // Retained for embedded hosts and deterministic previews.
  layout?: OyiLayoutClass;
  // < 1024: the navigation drawer is open (modal overlay).
  sidebarOpen?: boolean;
  // >= 1024: the docked sidebar is collapsed.
  sidebarCollapsed?: boolean;
  // < 1024: the history drawer is open (modal overlay).
  historyOpen?: boolean;
  onDismissSidebar?: () => void;
  onDismissHistory?: () => void;
  sidebarLabel?: string;
  historyLabel?: string;
  label?: string;
  className?: string;
};

export function OyiShell(props: OyiShellProps) {
  const detected = useOyiLayout();
  const layout = props.layout || detected;
  const sidebarRef = useRef<HTMLElement | null>(null);
  const historyRef = useRef<HTMLElement | null>(null);
  const overlaySidebar = Boolean(props.sidebarOpen) && !props.historyOpen && layout !== "desktop";
  const overlayHistory = Boolean(props.historyOpen) && layout !== "desktop";
  useOyiFocusTrap({ active: overlaySidebar, containerRef: sidebarRef, initialFocusRef: sidebarRef, onEscape: props.onDismissSidebar });
  useOyiFocusTrap({ active: overlayHistory, containerRef: historyRef, initialFocusRef: historyRef, onEscape: props.onDismissHistory });

  return (
    <div
      className={["oyi-shell", props.className].filter(Boolean).join(" ")}
      data-oyi-shell="true"
      data-layout={layout}
      data-layout-override={props.layout || undefined}
      data-sidebar-open={props.sidebarOpen ? "true" : "false"}
      data-sidebar-collapsed={props.sidebarCollapsed ? "true" : "false"}
      data-history-open={props.historyOpen ? "true" : "false"}
    >
      {props.surfaceNavigation || props.sidebar ? (
        <aside
          ref={sidebarRef}
          className="oyi-shell-sidebar"
          aria-label={props.sidebarLabel || "Navigation"}
          tabIndex={-1}
          inert={layout === "desktop" ? Boolean(props.sidebarCollapsed) : !overlaySidebar}
          {...(overlaySidebar ? { role: "dialog", "aria-modal": true } : {})}
        >
          {props.surfaceNavigation ? <div className="oyi-shell-sidebar-a">{props.surfaceNavigation}</div> : null}
          {props.sidebar ? <div className="oyi-shell-sidebar-b">{props.sidebar}</div> : null}
        </aside>
      ) : null}
      {overlaySidebar ? <button type="button" className="oyi-shell-scrim" aria-label="Close navigation" onClick={props.onDismissSidebar} /> : null}

      <div className="oyi-shell-column" aria-label={props.label} inert={overlaySidebar || overlayHistory}>
        {props.topRail || props.contextSelector || props.topRailEnd ? (
          <header className="oyi-shell-rail">
            <div className="oyi-shell-rail-start">{props.topRail}</div>
            <div className="oyi-shell-rail-center">{props.contextSelector}</div>
            <div className="oyi-shell-rail-end">{props.topRailEnd}</div>
          </header>
        ) : null}
        <main className="oyi-shell-stage">
          <div className="oyi-shell-stage-inner">
            {props.mainCanvas ? <div className="oyi-shell-main" data-slot="mainCanvas">{props.mainCanvas}</div> : null}
            <div className="oyi-shell-progress" role="status" aria-live="polite">{props.temporaryProgress}</div>
            {props.caption ? <div className="oyi-shell-caption" data-slot="caption">{props.caption}</div> : null}
          </div>
        </main>
        {props.suggestions || props.composer ? (
          <div className="oyi-shell-dock">
            {props.suggestions ? <div className="oyi-shell-suggestions" data-slot="suggestions">{props.suggestions}</div> : null}
            {props.composer ? <div className="oyi-shell-composer" data-slot="composer">{props.composer}</div> : null}
          </div>
        ) : null}
      </div>

      {props.history ? (
        <aside
          ref={historyRef}
          className="oyi-shell-history"
          aria-label={props.historyLabel || "Conversation history"}
          tabIndex={-1}
          inert={!overlayHistory}
          {...(overlayHistory ? { role: "dialog", "aria-modal": true } : {})}
        >
          {props.history}
        </aside>
      ) : null}
      {overlayHistory ? <button type="button" className="oyi-shell-scrim" aria-label="Close conversation history" onClick={props.onDismissHistory} /> : null}
    </div>
  );
}
