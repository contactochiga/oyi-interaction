"use client";
import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Caption / transcript primitive. Shows text exactly as received (no
// simulated streaming). A spoken range is highlighted only when the surface
// passes real speech-boundary positions.
import { useState } from "react";
const KIND_LABEL = {
    user_interim: "You (still listening)",
    user_final: "You",
    oyi_response: "Oyi",
    clarification: "Oyi needs more information",
    truth_note: "Action status",
    degraded_note: "Notice",
};
function Spoken({ text, range }) {
    if (!range)
        return _jsx(_Fragment, { children: text });
    return (_jsxs(_Fragment, { children: [text.slice(0, range.start), _jsx("mark", { className: "oyi-caption-spoken", children: text.slice(range.start, range.end) }), text.slice(range.end)] }));
}
export function OyiCaption({ entries, live = true, collapseAfter = 0, className }) {
    // Long replies stay readable without breaking the calm composition: the
    // reply collapses after `collapseAfter` characters behind an explicit,
    // accessible expand control (the full text is never altered).
    const [expanded, setExpanded] = useState(false);
    if (!entries.length)
        return null;
    return (_jsx("div", { className: ["oyi-caption", className].filter(Boolean).join(" "), "aria-live": live ? "polite" : undefined, "aria-atomic": "false", children: entries.map((entry, index) => {
            const long = collapseAfter > 0 && (entry.kind === "oyi_response" || entry.kind === "clarification") && entry.text.length > collapseAfter;
            const collapsed = long && !expanded;
            return (_jsxs("div", { className: "oyi-caption-entry", "data-kind": entry.kind, children: [_jsxs("p", { className: "oyi-caption-line", "data-kind": entry.kind, "data-collapsed": collapsed ? "true" : undefined, children: [_jsxs("span", { className: "oyi-visually-hidden", children: [KIND_LABEL[entry.kind], ": "] }), _jsx(Spoken, { text: entry.text, range: entry.spokenRange })] }), long ? _jsx("button", { type: "button", className: "oyi-link-button oyi-caption-toggle", "aria-expanded": expanded, onClick: () => setExpanded((value) => !value), children: expanded ? "Show less" : "Show more" }) : null] }, `${entry.kind}-${index}`));
        }) }));
}
