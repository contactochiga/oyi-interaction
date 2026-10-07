"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function OyiProgress({ steps, className }) {
    if (!steps.length)
        return null;
    return (_jsx("ol", { className: ["oyi-progress", className].filter(Boolean).join(" "), "aria-label": "Progress", children: steps.map((step) => (_jsxs("li", { className: "oyi-progress-step", "data-state": step.state, "aria-current": step.state === "active" ? "step" : undefined, children: [_jsx("span", { className: "oyi-progress-dot", "aria-hidden": "true" }), _jsx("span", { className: "oyi-progress-label", children: step.label })] }, step.key))) }));
}
