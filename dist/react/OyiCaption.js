"use client";
import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
export function OyiCaption({ entries, live = true, className }) {
    if (!entries.length)
        return null;
    return (_jsx("div", { className: ["oyi-caption", className].filter(Boolean).join(" "), "aria-live": live ? "polite" : undefined, "aria-atomic": "false", children: entries.map((entry, index) => (_jsxs("p", { className: "oyi-caption-line", "data-kind": entry.kind, children: [_jsxs("span", { className: "oyi-visually-hidden", children: [KIND_LABEL[entry.kind], ": "] }), _jsx(Spoken, { text: entry.text, range: entry.spokenRange })] }, `${entry.kind}-${index}`))) }));
}
