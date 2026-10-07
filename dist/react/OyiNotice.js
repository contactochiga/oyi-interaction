"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Calm, explicit status notices (offline, unavailable, continuity warnings).
// Never success language: notices only describe what is NOT working.
export function OyiNotice({ tone = "neutral", children, actionLabel, onAction, className }) {
    return (_jsxs("div", { className: ["oyi-notice", className].filter(Boolean).join(" "), "data-tone": tone, role: tone === "warning" ? "alert" : "status", children: [_jsx("span", { className: "oyi-notice-text", children: children }), actionLabel && onAction ? _jsx("button", { type: "button", className: "oyi-link-button", onClick: onAction, children: actionLabel }) : null] }));
}
