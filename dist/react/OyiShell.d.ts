import type { ReactNode } from "react";
import { type OyiLayoutClass } from "./hooks.js";
export declare const OYI_SHELL_SLOTS: readonly ["topRail", "sidebar", "mainCanvas", "contextSelector", "history", "caption", "suggestions", "composer", "temporaryProgress", "surfaceNavigation"];
export type OyiShellSlot = (typeof OYI_SHELL_SLOTS)[number];
export type OyiShellProps = Partial<Record<OyiShellSlot, ReactNode>> & {
    layout?: OyiLayoutClass;
    historyOpen?: boolean;
    sidebarOpen?: boolean;
    label?: string;
    className?: string;
};
export declare function OyiShell(props: OyiShellProps): import("react").JSX.Element;
