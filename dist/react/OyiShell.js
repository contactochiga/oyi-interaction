"use client";
import { jsx as _jsx } from "react/jsx-runtime";
import { useOyiLayout } from "./hooks.js";
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
];
const SLOT_CLASS = {
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
export function OyiShell(props) {
    const detected = useOyiLayout();
    const layout = props.layout || detected;
    return (_jsx("div", { className: ["oyi-shell", props.className].filter(Boolean).join(" "), "data-oyi-shell": "true", "data-layout": layout, "data-history-open": props.historyOpen ? "true" : "false", "data-sidebar-open": props.sidebarOpen ? "true" : "false", "aria-label": props.label, children: OYI_SHELL_SLOTS.map((slot) => {
            const content = props[slot];
            if (content === undefined || content === null || content === false)
                return null;
            if (slot === "temporaryProgress")
                return _jsx("div", { className: SLOT_CLASS[slot], role: "status", "aria-live": "polite", children: content }, slot);
            return _jsx("div", { className: SLOT_CLASS[slot], "data-slot": slot, children: content }, slot);
        }) }));
}
