"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
import { useRef } from "react";
import { useOyiFocusTrap, useOyiLayout } from "./hooks.js";
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
    "voiceHub",
    "composer",
];
export function OyiShell(props) {
    const detected = useOyiLayout();
    const layout = props.layout || detected;
    const sidebarRef = useRef(null);
    const historyRef = useRef(null);
    const overlaySidebar = Boolean(props.sidebarOpen) && !props.historyOpen && layout !== "desktop";
    const overlayHistory = Boolean(props.historyOpen) && layout !== "desktop";
    useOyiFocusTrap({ active: overlaySidebar, containerRef: sidebarRef, initialFocusRef: sidebarRef, onEscape: props.onDismissSidebar });
    useOyiFocusTrap({ active: overlayHistory, containerRef: historyRef, initialFocusRef: historyRef, onEscape: props.onDismissHistory });
    return (_jsxs("div", { className: ["oyi-shell", props.className].filter(Boolean).join(" "), "data-oyi-shell": "true", "data-layout": layout, "data-layout-override": props.layout || undefined, "data-sidebar-open": props.sidebarOpen ? "true" : "false", "data-sidebar-collapsed": props.sidebarCollapsed ? "true" : "false", "data-history-open": props.historyOpen ? "true" : "false", children: [props.surfaceNavigation || props.sidebar ? (_jsxs("aside", { ref: sidebarRef, className: "oyi-shell-sidebar", "aria-label": props.sidebarLabel || "Navigation", tabIndex: -1, inert: layout === "desktop" ? Boolean(props.sidebarCollapsed) : !overlaySidebar, ...(overlaySidebar ? { role: "dialog", "aria-modal": true } : {}), children: [props.surfaceNavigation ? _jsx("div", { className: "oyi-shell-sidebar-a", children: props.surfaceNavigation }) : null, props.sidebar ? _jsx("div", { className: "oyi-shell-sidebar-b", children: props.sidebar }) : null] })) : null, overlaySidebar ? _jsx("button", { type: "button", className: "oyi-shell-scrim", "aria-label": "Close navigation", onClick: props.onDismissSidebar }) : null, _jsxs("div", { className: "oyi-shell-column", "aria-label": props.label, inert: overlaySidebar || overlayHistory, children: [props.topRail || props.contextSelector || props.topRailEnd ? (_jsxs("header", { className: "oyi-shell-rail", children: [_jsx("div", { className: "oyi-shell-rail-start", children: props.topRail }), _jsx("div", { className: "oyi-shell-rail-center", children: props.contextSelector }), _jsx("div", { className: "oyi-shell-rail-end", children: props.topRailEnd })] })) : null, _jsx("main", { className: "oyi-shell-stage", children: _jsxs("div", { className: "oyi-shell-stage-inner", children: [props.mainCanvas ? _jsx("div", { className: "oyi-shell-main", "data-slot": "mainCanvas", children: props.mainCanvas }) : null, _jsx("div", { className: "oyi-shell-progress", role: "status", "aria-live": "polite", children: props.temporaryProgress }), props.caption ? _jsx("div", { className: "oyi-shell-caption", "data-slot": "caption", children: props.caption }) : null] }) }), props.suggestions || props.voiceHub || props.composer ? (_jsxs("div", { className: "oyi-shell-dock", children: [props.suggestions ? _jsx("div", { className: "oyi-shell-suggestions", "data-slot": "suggestions", children: props.suggestions }) : null, props.voiceHub ? _jsx("div", { className: "oyi-shell-voice-hub", "data-slot": "voiceHub", children: props.voiceHub }) : null, props.composer ? _jsx("div", { className: "oyi-shell-composer", "data-slot": "composer", children: props.composer }) : null] })) : null] }), props.history ? (_jsx("aside", { ref: historyRef, className: "oyi-shell-history", "aria-label": props.historyLabel || "Conversation history", tabIndex: -1, inert: !overlayHistory, ...(overlayHistory ? { role: "dialog", "aria-modal": true } : {}), children: props.history })) : null, overlayHistory ? _jsx("button", { type: "button", className: "oyi-shell-scrim", "aria-label": "Close conversation history", onClick: props.onDismissHistory }) : null] }));
}
