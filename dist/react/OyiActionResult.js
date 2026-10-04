"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { IconAlert, IconBan, IconCheck, IconClock, IconDashed } from "./icons.js";
function ToneIcon({ view }) {
    if (view.tone === "verified")
        return _jsx(IconCheck, {});
    if (view.tone === "failed")
        return _jsx(IconAlert, {});
    if (view.tone === "closed")
        return _jsx(IconBan, {});
    if (view.tone === "unverified")
        return _jsx(IconDashed, {});
    return _jsx(IconClock, {});
}
export function OyiActionResult({ view, diagnostic = false, showTerminalNote = false, className }) {
    if (!view)
        return null;
    return (_jsxs("section", { className: ["oyi-action-result", className].filter(Boolean).join(" "), "data-oyi-action-result": "true", "data-tone": view.tone, "data-stage": view.stage, "data-action-status": view.status, "data-action-verified": view.verified ? "true" : "false", "data-terminal-action": view.terminal ? "true" : "false", role: "status", "aria-label": `${view.headline}${view.target_label ? `: ${view.target_label}` : ""}`, children: [_jsx("span", { className: "oyi-action-result-icon", "aria-hidden": "true", children: _jsx(ToneIcon, { view: view }) }), _jsxs("div", { className: "oyi-action-result-body", children: [_jsxs("p", { className: "oyi-action-result-headline", children: [view.headline, view.target_label ? _jsxs("span", { className: "oyi-action-result-target", children: [" \u00B7 ", view.target_label] }) : null] }), _jsx("p", { className: "oyi-action-result-detail", children: view.detail }), showTerminalNote && view.terminal ? _jsx("p", { className: "oyi-action-result-note", children: "This action is finished. Its confirm and cancel controls cannot be reused." }) : null, diagnostic ? _jsxs("p", { className: "oyi-action-result-diagnostic", children: [_jsx("code", { children: view.diagnostic.status }), view.diagnostic.truth ? _jsxs(_Fragment, { children: [" \u00B7 ", _jsx("code", { children: Object.entries(view.diagnostic.truth).map(([k, v]) => `${k}=${String(v)}`).join(" ") })] }) : null] }) : null] })] }));
}
