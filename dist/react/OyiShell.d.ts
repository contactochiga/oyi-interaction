import { type ReactNode } from "react";
import { type OyiLayoutClass } from "./hooks.js";
export declare const OYI_SHELL_SLOTS: readonly ["topRail", "contextSelector", "topRailEnd", "sidebar", "surfaceNavigation", "history", "mainCanvas", "temporaryProgress", "caption", "suggestions", "composer"];
export type OyiShellSlot = (typeof OYI_SHELL_SLOTS)[number];
export type OyiShellProps = Partial<Record<OyiShellSlot, ReactNode>> & {
    layout?: OyiLayoutClass;
    sidebarOpen?: boolean;
    sidebarCollapsed?: boolean;
    historyOpen?: boolean;
    onDismissSidebar?: () => void;
    onDismissHistory?: () => void;
    sidebarLabel?: string;
    historyLabel?: string;
    label?: string;
    className?: string;
};
export declare function OyiShell(props: OyiShellProps): import("react").JSX.Element;
