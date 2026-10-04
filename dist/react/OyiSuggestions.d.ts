import type { ReactNode } from "react";
import type { OyiSuggestion } from "../core/suggestions.js";
export declare function OyiSuggestions({ items, onSelect, showArrow, renderIcon, label, className }: {
    items: OyiSuggestion[];
    onSelect: (item: OyiSuggestion) => void;
    showArrow?: boolean;
    renderIcon?: (item: OyiSuggestion) => ReactNode;
    label?: string;
    className?: string;
}): import("react").JSX.Element | null;
