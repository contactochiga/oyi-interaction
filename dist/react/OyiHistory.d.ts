import type { OyiHistoryThread, OyiHistoryView } from "../core/history.js";
export declare function OyiHistory({ view, onSelect, onNewConversation, onRetry, restoringThreadId, className }: {
    view: OyiHistoryView;
    onSelect: (thread: OyiHistoryThread) => void;
    onNewConversation?: () => void;
    onRetry?: () => void;
    restoringThreadId?: string | null;
    className?: string;
}): import("react").JSX.Element;
