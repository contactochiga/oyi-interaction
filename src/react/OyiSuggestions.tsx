"use client";

// Lightweight suggestion list: icon + text + optional subtle arrow, with no
// per-item card container. Presentation only -- suggestions come from the
// surface adapter / Backend, never from this component.
import type { ReactNode } from "react";
import type { OyiSuggestion } from "../core/suggestions.js";
import { IconArrow, IconSpark } from "./icons.js";

export function OyiSuggestions({ items, onSelect, showArrow = true, renderIcon, label = "Suggestions", className }: {
  items: OyiSuggestion[];
  onSelect: (item: OyiSuggestion) => void;
  showArrow?: boolean;
  renderIcon?: (item: OyiSuggestion) => ReactNode;
  label?: string;
  className?: string;
}) {
  if (!items.length) return null;
  return (
    <ul className={["oyi-suggestions", className].filter(Boolean).join(" ")} aria-label={label}>
      {items.map((item) => (
        <li key={item.id}>
          <button type="button" className="oyi-suggestion" data-kind={item.kind} onClick={() => onSelect(item)}>
            <span className="oyi-suggestion-icon" aria-hidden="true">{renderIcon ? renderIcon(item) : <IconSpark />}</span>
            <span className="oyi-suggestion-label">{item.label}</span>
            {showArrow ? <span className="oyi-suggestion-arrow" aria-hidden="true"><IconArrow /></span> : null}
            {item.kind === "navigate" ? <span className="oyi-visually-hidden"> (opens a page)</span> : null}
          </button>
        </li>
      ))}
    </ul>
  );
}
