"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { IconPlus } from "./icons.js";
function when(value) {
    if (!value)
        return "";
    const date = new Date(value);
    return Number.isFinite(date.getTime()) ? date.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "";
}
export function OyiHistory({ view, onSelect, onNewConversation, onRetry, restoringThreadId, className }) {
    return (_jsxs("nav", { className: ["oyi-history", className].filter(Boolean).join(" "), "aria-label": "Conversation history", "aria-busy": view.status === "loading" ? true : undefined, children: [onNewConversation ? _jsxs("button", { type: "button", className: "oyi-history-new", onClick: onNewConversation, children: [_jsx(IconPlus, {}), " New conversation"] }) : null, view.status === "loading" ? _jsx("p", { className: "oyi-history-state", role: "status", children: "Loading conversations\u2026" }) : null, view.status === "error" ? (_jsxs("p", { className: "oyi-history-state", role: "alert", children: [view.error || "Conversations could not be loaded.", onRetry ? _jsxs(_Fragment, { children: [" ", _jsx("button", { type: "button", className: "oyi-link-button", onClick: onRetry, children: "Try again" })] }) : null] })) : null, view.status === "empty" ? _jsx("p", { className: "oyi-history-state", children: "No conversations yet." }) : null, view.threads.length ? (_jsx("ul", { className: "oyi-history-list", children: view.threads.map((thread) => (_jsx("li", { children: _jsxs("button", { type: "button", className: "oyi-history-item", "aria-current": thread.active ? "true" : undefined, "aria-busy": restoringThreadId === thread.id ? true : undefined, onClick: () => onSelect(thread), children: [_jsx("span", { className: "oyi-history-title", children: thread.title }), _jsxs("span", { className: "oyi-history-meta", children: [when(thread.updatedAt), thread.source === "local" ? " · On this device only" : ""] })] }) }, thread.id))) })) : null] }));
}
