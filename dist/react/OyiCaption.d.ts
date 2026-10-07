import type { OyiCaptionEntry } from "../core/caption.js";
export declare function OyiCaption({ entries, live, collapseAfter, className }: {
    entries: OyiCaptionEntry[];
    live?: boolean;
    collapseAfter?: number;
    className?: string;
}): import("react").JSX.Element | null;
