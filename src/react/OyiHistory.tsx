"use client";

// Conversation history presentation over the canonical thread APIs (the
// surface fetches GET /oyi/threads and GET /oyi/threads/:id/messages and
// passes normalized threads in). No history store lives here.
import type { OyiHistoryThread, OyiHistoryView } from "../core/history.js";
import { IconPlus } from "./icons.js";

function when(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "";
}

export function OyiHistory({ view, onSelect, onNewConversation, onRetry, restoringThreadId, className }: {
  view: OyiHistoryView;
  onSelect: (thread: OyiHistoryThread) => void;
  onNewConversation?: () => void;
  onRetry?: () => void;
  restoringThreadId?: string | null;
  className?: string;
}) {
  return (
    <nav className={["oyi-history", className].filter(Boolean).join(" ")} aria-label="Conversation history" aria-busy={view.status === "loading" ? true : undefined}>
      {onNewConversation ? <button type="button" className="oyi-history-new" onClick={onNewConversation}><IconPlus /> New conversation</button> : null}
      {view.status === "loading" ? <p className="oyi-history-state" role="status">Loading conversations…</p> : null}
      {view.status === "error" ? (
        <p className="oyi-history-state" role="alert">
          {view.error || "Conversations could not be loaded."}
          {onRetry ? <> <button type="button" className="oyi-link-button" onClick={onRetry}>Try again</button></> : null}
        </p>
      ) : null}
      {view.status === "empty" ? <p className="oyi-history-state">No conversations yet.</p> : null}
      {view.threads.length ? (
        <ul className="oyi-history-list">
          {view.threads.map((thread) => (
            <li key={thread.id}>
              <button type="button" className="oyi-history-item" aria-current={thread.active ? "true" : undefined} aria-busy={restoringThreadId === thread.id ? true : undefined} onClick={() => onSelect(thread)}>
                <span className="oyi-history-title">{thread.title}</span>
                <span className="oyi-history-meta">
                  {when(thread.updatedAt)}
                  {thread.source === "local" ? " · On this device only" : ""}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </nav>
  );
}
