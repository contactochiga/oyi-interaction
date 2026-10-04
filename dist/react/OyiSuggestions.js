"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { IconArrow, IconSpark } from "./icons.js";
export function OyiSuggestions({ items, onSelect, showArrow = true, renderIcon, label = "Suggestions", className }) {
    if (!items.length)
        return null;
    return (_jsx("ul", { className: ["oyi-suggestions", className].filter(Boolean).join(" "), "aria-label": label, children: items.map((item) => (_jsx("li", { children: _jsxs("button", { type: "button", className: "oyi-suggestion", "data-kind": item.kind, onClick: () => onSelect(item), children: [_jsx("span", { className: "oyi-suggestion-icon", "aria-hidden": "true", children: renderIcon ? renderIcon(item) : _jsx(IconSpark, {}) }), _jsx("span", { className: "oyi-suggestion-label", children: item.label }), showArrow ? _jsx("span", { className: "oyi-suggestion-arrow", "aria-hidden": "true", children: _jsx(IconArrow, {}) }) : null, item.kind === "navigate" ? _jsx("span", { className: "oyi-visually-hidden", children: " (opens a page)" }) : null] }) }, item.id))) }));
}
