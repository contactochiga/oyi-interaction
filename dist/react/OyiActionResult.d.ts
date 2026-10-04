import type { OyiActionResultView } from "../core/actionTruth.js";
export declare function OyiActionResult({ view, diagnostic, showTerminalNote, className }: {
    view: OyiActionResultView | null;
    diagnostic?: boolean;
    showTerminalNote?: boolean;
    className?: string;
}): import("react").JSX.Element | null;
