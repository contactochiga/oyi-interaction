// Conversation history normalization around the EXISTING canonical APIs:
//   GET /oyi/threads                 -> thread list
//   GET /oyi/threads/:id/messages    -> restore
// No new history store: this only shapes what those endpoints return (plus a
// surface's local fallback entries, when its history policy keeps one).

export type OyiHistoryStatus = "idle" | "loading" | "ready" | "empty" | "error";

export type OyiHistoryThread = {
  id: string;
  title: string;
  preview: string | null;
  updatedAt: string | null;
  messageCount: number | null;
  active: boolean;
  // "local" entries are unsaved turns a surface keeps on-device by policy;
  // they are never presented as synced history.
  source: "backend" | "local";
};

export type OyiHistoryView = {
  status: OyiHistoryStatus;
  threads: OyiHistoryThread[];
  activeThreadId: string | null;
  error: string | null;
};

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function iso(value: unknown): string | null {
  if (typeof value === "number" && Number.isFinite(value)) return new Date(value).toISOString();
  const raw = text(value);
  if (!raw) return null;
  const time = new Date(raw).getTime();
  return Number.isFinite(time) ? new Date(time).toISOString() : null;
}

export function normalizeOyiThread(raw: unknown, options: { activeThreadId?: string | null; source?: "backend" | "local" } = {}): OyiHistoryThread | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  const id = text(row.id);
  if (!id) return null;
  const count = Number(row.message_count ?? row.messageCount);
  return {
    id,
    title: (text(row.title) || text(row.summary) || "Oyi conversation").slice(0, 120),
    preview: text(row.preview) || text(row.last_message) || null,
    updatedAt: iso(row.updated_at ?? row.updatedAt ?? row.created_at),
    messageCount: Number.isFinite(count) && count >= 0 ? count : null,
    active: Boolean(options.activeThreadId) && id === options.activeThreadId,
    source: options.source || "backend",
  };
}

export function normalizeOyiThreads(raw: unknown, options: { activeThreadId?: string | null; source?: "backend" | "local" } = {}): OyiHistoryThread[] {
  const rows = Array.isArray(raw) ? raw : raw && typeof raw === "object" && Array.isArray((raw as Record<string, unknown>).threads) ? ((raw as Record<string, unknown>).threads as unknown[]) : [];
  const seen = new Set<string>();
  const threads: OyiHistoryThread[] = [];
  for (const row of rows) {
    const thread = normalizeOyiThread(row, options);
    if (!thread || seen.has(thread.id)) continue;
    seen.add(thread.id);
    threads.push(thread);
  }
  return threads.sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
}

export function oyiHistoryView(input: { loading?: boolean; error?: string | null; threads?: OyiHistoryThread[]; activeThreadId?: string | null }): OyiHistoryView {
  const threads = input.threads || [];
  const status: OyiHistoryStatus = input.loading ? "loading" : input.error ? "error" : threads.length ? "ready" : "empty";
  return { status, threads, activeThreadId: input.activeThreadId || null, error: input.error || null };
}

// The latest assistant message of a restored thread, for thread.restored.
export function latestAssistantMessage(messages: unknown): Record<string, unknown> | null {
  if (!Array.isArray(messages)) return null;
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const row = messages[index] as Record<string, unknown> | null;
    if (row && typeof row === "object" && row.role === "assistant") {
      const metadata = row.metadata && typeof row.metadata === "object" ? (row.metadata as Record<string, unknown>) : {};
      return { ...metadata, content: row.content, reply: row.content };
    }
  }
  return null;
}
