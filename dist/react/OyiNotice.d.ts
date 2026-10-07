import type { ReactNode } from "react";
export declare function OyiNotice({ tone, children, actionLabel, onAction, className }: {
    tone?: "neutral" | "warning" | "offline";
    children: ReactNode;
    actionLabel?: string;
    onAction?: () => void;
    className?: string;
}): import("react").JSX.Element;
