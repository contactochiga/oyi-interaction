"use client";
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
// CSS fallback / reference orb renderer. It renders the semantic state it is
// given and owns no intelligence state. A WebGL renderer will later implement
// the same props. Motion stops under prefers-reduced-motion and while the
// page is hidden; the accessible label always carries the state.
import { OYI_ORB_TOKENS } from "../core/orbContract.js";
import { useOyiPageVisible, useOyiReducedMotion } from "./hooks.js";
export function OyiOrb({ state, size = "medium", onActivate, actionLabel, controlsId, expanded, hasPopup, className }) {
    const token = OYI_ORB_TOKENS[state];
    const reducedMotion = useOyiReducedMotion();
    const visible = useOyiPageVisible();
    const motion = reducedMotion ? "none" : token.motion;
    const common = {
        className: ["oyi-orb", className].filter(Boolean).join(" "),
        "data-oyi-orb": "true",
        "data-state": state,
        "data-size": size,
        "data-tone": token.tone,
        "data-motion": motion,
        "data-paused": visible ? "false" : "true",
    };
    const body = (_jsxs(_Fragment, { children: [_jsx("span", { className: "oyi-orb-halo", "aria-hidden": "true" }), _jsx("span", { className: "oyi-orb-core", "aria-hidden": "true" }), _jsx("span", { className: "oyi-orb-wordmark", "aria-hidden": "true", children: "Oyi" })] }));
    if (onActivate) {
        return (_jsx("button", { type: "button", ...common, onClick: onActivate, "aria-label": actionLabel ? `${actionLabel}. ${token.label}` : token.label, "aria-controls": controlsId, "aria-expanded": expanded === undefined ? undefined : expanded, "aria-haspopup": hasPopup, children: body }));
    }
    return (_jsx("span", { ...common, role: "img", "aria-label": token.label, children: body }));
}
