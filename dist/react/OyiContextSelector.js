"use client";
import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
export function OyiContextSelector({ options, onSelect, busy, label = "Active home", placeholder = "No home selected", className }) {
    const active = options.find((option) => option.active);
    if (options.length <= 1)
        return _jsxs("div", { className: ["oyi-context", className].filter(Boolean).join(" "), "data-mode": "label", children: [_jsxs("span", { className: "oyi-visually-hidden", children: [label, ": "] }), _jsx("span", { className: "oyi-context-label", children: active?.label || placeholder })] });
    return _jsxs("label", { className: ["oyi-context", className].filter(Boolean).join(" "), children: [_jsx("span", { className: "oyi-visually-hidden", children: label }), _jsxs("select", { className: "oyi-context-button", value: active?.id || "", disabled: busy, onChange: (event) => {
                    const selected = options.find((option) => option.id === event.target.value);
                    if (selected && !selected.active)
                        onSelect(selected);
                }, children: [!active ? _jsx("option", { value: "", disabled: true, children: placeholder }) : null, options.map((option) => _jsxs("option", { value: option.id, children: [option.label, option.detail ? ` — ${option.detail}` : ""] }, option.id))] })] });
}
