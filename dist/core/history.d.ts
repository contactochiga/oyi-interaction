export type OyiHistoryStatus = "idle" | "loading" | "ready" | "empty" | "error";
export type OyiHistoryThread = {
    id: string;
    title: string;
    preview: string | null;
    updatedAt: string | null;
    messageCount: number | null;
    active: boolean;
    source: "backend" | "local";
};
export type OyiHistoryView = {
    status: OyiHistoryStatus;
    threads: OyiHistoryThread[];
    activeThreadId: string | null;
    error: string | null;
};
export declare function normalizeOyiThread(raw: unknown, options?: {
    activeThreadId?: string | null;
    source?: "backend" | "local";
}): OyiHistoryThread | null;
export declare function normalizeOyiThreads(raw: unknown, options?: {
    activeThreadId?: string | null;
    source?: "backend" | "local";
}): OyiHistoryThread[];
export declare function oyiHistoryView(input: {
    loading?: boolean;
    error?: string | null;
    threads?: OyiHistoryThread[];
    activeThreadId?: string | null;
}): OyiHistoryView;
export declare function latestAssistantMessage(messages: unknown): Record<string, unknown> | null;
