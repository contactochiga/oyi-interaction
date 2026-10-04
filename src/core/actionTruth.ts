// Canonical action truth -- the ONE interpretation of the Backend
// conversation action contract (Ochiga-backend
// src/oyi-core/actions/actionTruthProjection.ts, docs/OYI_ACTION_TRUTH_CONTRACT.md).
//
// Promoted from the Slice 1 surface copies (Consumer src/lib/oyiActionTruth.ts,
// Facility lib/oyiActionTruth.ts), which are removed on adoption.
//
// Rules:
//   USER APPROVED  !=  COMMAND SENT  !=  PROVIDER ACCEPTED  !=  PHYSICAL EFFECT VERIFIED
//   - only canonical status "confirmed" is verified;
//   - "verifying" / "confirmed" are only ever read from a canonical action,
//     never synthesized here;
//   - this module holds no action state machine: Backend owns transitions.
//     Later canonical evidence for the same action simply replaces a
//     non-terminal action (applyCanonicalActionUpdate).

export const OYI_ACTION_STATUSES = [
  "draft",
  "awaiting_confirmation",
  "approved",
  "queued",
  "sent",
  "provider_accepted",
  "provider_rejected",
  "verifying",
  "confirmed",
  "unobservable",
  "timed_out",
  "failed",
  "cancelled",
  "superseded",
] as const;

export type OyiActionStatus = (typeof OYI_ACTION_STATUSES)[number];

const TERMINAL_STATUSES: ReadonlySet<OyiActionStatus> = new Set(["confirmed", "unobservable", "timed_out", "failed", "cancelled", "superseded", "provider_rejected"]);

export type OyiCanonicalAction = {
  action_id: string;
  status: OyiActionStatus;
  requested_operation: string | null;
  requested_state: boolean | null;
  target_label: string | null;
  truth: Readonly<Record<string, string | boolean>> | null;
};

// User-facing lifecycle stage. Several canonical statuses share a stage;
// the canonical status is always preserved beside it for diagnostics.
export type OyiActionStage =
  | "proposed"
  | "approved"
  | "sent"
  | "accepted"
  | "verifying"
  | "verified"
  | "unobservable"
  | "failed"
  | "timed_out"
  | "cancelled"
  | "superseded"
  | "rejected";

export type OyiActionTone = "awaiting" | "progress" | "verified" | "unverified" | "failed" | "closed";

export type OyiActionResultView = {
  action_id: string;
  status: OyiActionStatus;
  stage: OyiActionStage;
  tone: OyiActionTone;
  headline: string;
  detail: string;
  verified: boolean;
  terminal: boolean;
  awaiting_user: boolean;
  target_label: string | null;
  // For diagnostic contexts only. Normal presentation never shows raw keys.
  diagnostic: { status: OyiActionStatus; truth: Readonly<Record<string, string | boolean>> | null };
};

const STAGE: Record<OyiActionStatus, OyiActionStage> = {
  draft: "proposed",
  awaiting_confirmation: "proposed",
  approved: "approved",
  queued: "approved",
  sent: "sent",
  provider_accepted: "accepted",
  verifying: "verifying",
  confirmed: "verified",
  unobservable: "unobservable",
  timed_out: "timed_out",
  failed: "failed",
  provider_rejected: "rejected",
  cancelled: "cancelled",
  superseded: "superseded",
};

const COPY: Record<OyiActionStage, { headline: string; detail: string; tone: OyiActionTone }> = {
  proposed: { headline: "Confirm action?", detail: "Nothing has been sent yet.", tone: "awaiting" },
  approved: { headline: "Approved", detail: "You approved this action. It has not been confirmed as sent yet.", tone: "progress" },
  sent: { headline: "Command sent", detail: "Command sent. Oyi has not verified the physical result yet.", tone: "progress" },
  accepted: { headline: "Command accepted", detail: "Command accepted. Oyi has not verified the physical result yet.", tone: "unverified" },
  verifying: { headline: "Verifying", detail: "Oyi is checking the final state.", tone: "progress" },
  verified: { headline: "Verified", detail: "Oyi verified the final device state.", tone: "verified" },
  unobservable: { headline: "Command accepted", detail: "Command accepted. Oyi could not verify the final physical state.", tone: "unverified" },
  failed: { headline: "Action failed", detail: "The command failed. Nothing is confirmed as changed.", tone: "failed" },
  timed_out: { headline: "Not verified in time", detail: "Oyi could not verify the result within the allowed time.", tone: "failed" },
  cancelled: { headline: "Cancelled", detail: "Cancelled before execution. Nothing was sent.", tone: "closed" },
  superseded: { headline: "Replaced", detail: "Replaced by a newer action.", tone: "closed" },
  rejected: { headline: "Rejected by provider", detail: "The device provider rejected the command.", tone: "failed" },
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function isOyiActionStatus(value: unknown): value is OyiActionStatus {
  return typeof value === "string" && (OYI_ACTION_STATUSES as readonly string[]).includes(value);
}

export function isTerminalOyiActionStatus(status: OyiActionStatus) {
  return TERMINAL_STATUSES.has(status);
}

function readAction(raw: unknown): OyiCanonicalAction | null {
  if (!isRecord(raw) || !isOyiActionStatus(raw.status) || typeof raw.action_id !== "string" || !raw.action_id) return null;
  const target = isRecord(raw.target) ? raw.target : {};
  const truth: Record<string, string | boolean> = {};
  if (isRecord(raw.truth)) {
    for (const [key, value] of Object.entries(raw.truth)) {
      if (typeof value === "string" || typeof value === "boolean") truth[key] = value;
    }
  }
  return {
    action_id: raw.action_id,
    status: raw.status,
    requested_operation: typeof raw.requested_operation === "string" ? raw.requested_operation : null,
    requested_state: typeof raw.requested_state === "boolean" ? raw.requested_state : null,
    target_label: typeof target.label === "string" && target.label.trim() ? target.label.trim() : null,
    truth: Object.keys(truth).length ? Object.freeze(truth) : null,
  };
}

// Reads the canonical action from a live response (`execution.action`), an
// `execution` object, or a restored message's metadata (`metadata.action`).
export function readCanonicalAction(source: unknown): OyiCanonicalAction | null {
  if (!isRecord(source)) return null;
  if (isRecord(source.execution) && source.execution.action !== undefined) return readAction(source.execution.action);
  if (source.action !== undefined) return readAction(source.action);
  return null;
}

// "{target} is on/off." -- only when the canonical contract supports that
// verified statement: verified status, a boolean power/switch request, a
// target label, and (when device truth is present) a confirmed physical effect.
function verifiedStatement(action: OyiCanonicalAction): string | null {
  if (action.status !== "confirmed" || typeof action.requested_state !== "boolean" || !action.target_label) return null;
  if (!/(^|\.)(power|switch|channel)(\.|$)|turn_(on|off)/.test(String(action.requested_operation || ""))) return null;
  if (action.truth && action.truth.physical_effect_status !== "confirmed" && action.truth.final_status !== "state_confirmed") return null;
  return `${action.target_label} is ${action.requested_state ? "on" : "off"}.`;
}

export function presentCanonicalAction(action: OyiCanonicalAction | null): OyiActionResultView | null {
  if (!action) return null;
  const stage = STAGE[action.status];
  const copy = COPY[stage];
  return {
    action_id: action.action_id,
    status: action.status,
    stage,
    tone: copy.tone,
    headline: copy.headline,
    detail: stage === "verified" ? verifiedStatement(action) || copy.detail : copy.detail,
    verified: action.status === "confirmed",
    terminal: isTerminalOyiActionStatus(action.status),
    awaiting_user: action.status === "awaiting_confirmation",
    target_label: action.target_label,
    diagnostic: { status: action.status, truth: action.truth },
  };
}

export function actionResultView(source: unknown): OyiActionResultView | null {
  return presentCanonicalAction(readCanonicalAction(source));
}

// Later canonical evidence for the SAME action (e.g. a future async
// verification event) replaces a non-terminal action. A terminal action is
// never replaced, and a different action never overrides the current one.
export function applyCanonicalActionUpdate(current: OyiCanonicalAction | null, incoming: unknown): OyiCanonicalAction | null {
  const next = readAction(isRecord(incoming) && isRecord(incoming.action) ? incoming.action : incoming);
  if (!current || !next || next.action_id !== current.action_id) return current;
  if (isTerminalOyiActionStatus(current.status)) return current;
  return next;
}
