// The ONE Oyi interaction state model.
//
// It keeps two things strictly apart:
//   LOCAL INTERACTION STATE   -- genuinely local facts: connectivity, the
//                                microphone, whether a request is in flight,
//                                whether a received reply is being presented.
//   CANONICAL RUNTIME TRUTH   -- what Backend actually returned for the
//                                current turn (answer, clarification,
//                                confirmation, canonical action truth).
//
// It is NOT an intelligence runtime, memory, authority layer or action state
// machine. It never fabricates semantic progress: a normal HTTP turn exposes
// no internal stages, so "request in flight" is simply WORKING. Streamed
// canonical stages can be admitted later by adding them to
// OYI_CANONICAL_STREAM_STAGES once Backend actually emits them; until then
// every stage event is ignored.
import { applyCanonicalActionUpdate, presentCanonicalAction } from "./actionTruth.js";
import { projectCanonicalResponse } from "./canonicalResponse.js";
export const OYI_INTERACTION_PHASES = [
    "idle",
    "listening",
    "transcribing",
    "working",
    "responding",
    "clarification_required",
    "confirmation_required",
    "action_pending",
    "action_accepted",
    "action_verifying",
    "action_verified",
    "action_unobservable",
    "action_failed",
    "action_timed_out",
    "action_cancelled",
    "action_superseded",
    "action_rejected",
    "degraded",
    "offline",
];
// The only in-flight text a surface may show for a normal HTTP turn. It
// claims nothing about what Oyi is internally doing.
export const OYI_WORKING_TEXT = "Working on your request…";
// Backend streams no canonical stages today. Do not add names here until a
// canonical stream contract delivers them.
export const OYI_CANONICAL_STREAM_STAGES = Object.freeze([]);
const SUPERSEDED_TURN = "\u0000superseded";
export function createInteractionModel(init = {}) {
    return {
        local: {
            online: init.online !== false,
            voice: { status: "idle", interim: "", final: "", error: null },
            turn: { id: null, status: "idle", failure: null },
            stage: null,
        },
        canonical: null,
    };
}
function withLocal(model, local) {
    return { ...model, local: { ...model.local, ...local } };
}
export function interactionReducer(model, event) {
    const { local } = model;
    switch (event.type) {
        case "connectivity.changed":
            // Reconnecting clears an "offline" turn failure (the turn did not run).
            return withLocal(model, { online: event.online, turn: event.online && local.turn.failure === "offline" ? { ...local.turn, failure: null } : local.turn });
        case "voice.listening":
            return withLocal(model, { voice: { status: "listening", interim: "", final: "", error: null } });
        case "voice.interim":
            if (local.voice.status !== "listening" && local.voice.status !== "transcribing")
                return model;
            return withLocal(model, { voice: { ...local.voice, interim: event.text } });
        case "voice.transcribing":
            if (local.voice.status !== "listening")
                return model;
            return withLocal(model, { voice: { ...local.voice, status: "transcribing" } });
        case "voice.final":
            return withLocal(model, { voice: { status: "idle", interim: "", final: event.text, error: null } });
        case "voice.ended":
            return withLocal(model, { voice: { ...local.voice, status: "idle", interim: "" } });
        case "voice.cancelled":
            return withLocal(model, { voice: { status: "idle", interim: "", final: "", error: null } });
        case "voice.error":
            return withLocal(model, { voice: { status: "error", interim: "", final: "", error: event.message } });
        case "turn.submitted":
            // A new turn: previous canonical truth stays visible as history but can
            // no longer drive the phase (precedence), and any stale response for an
            // older turn will be ignored.
            return {
                local: { ...local, turn: { id: event.turnId, status: "in_flight", failure: null }, stage: null, voice: { ...local.voice, final: "" } },
                // Demote the previous result: it belongs to no active turn any more,
                // even if a surface were to reuse a turn id.
                canonical: model.canonical ? { turnId: SUPERSEDED_TURN, projection: model.canonical.projection } : null,
            };
        case "turn.response": {
            if (event.turnId !== local.turn.id)
                return model; // stale turn
            const projection = projectCanonicalResponse(event.response);
            if (!projection)
                return model;
            return {
                local: { ...local, turn: { id: local.turn.id, status: "responding", failure: null }, stage: null },
                canonical: { turnId: event.turnId, projection },
            };
        }
        case "turn.failed":
            if (event.turnId !== local.turn.id)
                return model;
            return withLocal(model, { turn: { id: local.turn.id, status: "idle", failure: event.reason }, stage: null });
        case "turn.presented":
            if (event.turnId !== local.turn.id || local.turn.status !== "responding")
                return model;
            return withLocal(model, { turn: { ...local.turn, status: "idle" } });
        case "turn.stage":
            // No fake progress: only canonical stages Backend actually streams.
            if (event.turnId !== local.turn.id || local.turn.status !== "in_flight")
                return model;
            if (!OYI_CANONICAL_STREAM_STAGES.includes(event.stage))
                return model;
            return withLocal(model, { stage: event.stage });
        case "action.updated": {
            if (!model.canonical?.projection.action)
                return model;
            const updated = applyCanonicalActionUpdate(model.canonical.projection.action, event.action);
            if (updated === model.canonical.projection.action)
                return model;
            return { ...model, canonical: { ...model.canonical, projection: { ...model.canonical.projection, kind: "action", action: updated } } };
        }
        case "thread.restored": {
            const projection = event.latestAssistant ? projectCanonicalResponse(event.latestAssistant) : null;
            return {
                local: { ...local, turn: { id: null, status: "idle", failure: null }, stage: null },
                canonical: projection ? { turnId: null, projection } : null,
            };
        }
        case "conversation.reset":
            return { local: { ...local, turn: { id: null, status: "idle", failure: null }, stage: null, voice: { status: "idle", interim: "", final: "", error: null } }, canonical: null };
        default:
            return model;
    }
}
const ACTION_PHASE = {
    proposed: "confirmation_required",
    approved: "action_pending",
    sent: "action_pending",
    accepted: "action_accepted",
    verifying: "action_verifying",
    verified: "action_verified",
    unobservable: "action_unobservable",
    failed: "action_failed",
    timed_out: "action_timed_out",
    cancelled: "action_cancelled",
    superseded: "action_superseded",
    rejected: "action_rejected",
};
const PHASE_LABEL = {
    idle: "Oyi is ready",
    listening: "Oyi is listening",
    transcribing: "Oyi is transcribing what you said",
    working: "Oyi is working on your request",
    responding: "Oyi is responding",
    clarification_required: "Oyi needs more information",
    confirmation_required: "Oyi is waiting for your confirmation. Nothing has been sent yet",
    action_pending: "Action approved. Not verified yet",
    action_accepted: "Command accepted. Not verified yet",
    action_verifying: "Oyi is verifying the result",
    action_verified: "Action verified",
    action_unobservable: "Command accepted. Oyi could not verify the final state",
    action_failed: "Action failed",
    action_timed_out: "Action could not be verified in time",
    action_cancelled: "Action cancelled. Nothing was sent",
    action_superseded: "Action replaced by a newer action",
    action_rejected: "Action rejected by the provider",
    degraded: "Oyi is running with reduced reliability",
    offline: "Oyi is offline",
};
export function interactionPhaseLabel(phase) {
    return PHASE_LABEL[phase];
}
// STATE PRECEDENCE (highest first):
//   1. listening / transcribing  -- an active microphone is always shown
//   2. offline                   -- overrides idle, working and old results
//   3. working                   -- a request is in flight (no fake stages)
//   4. responding                -- a received reply is being presented
//   5. canonical truth of the CURRENT turn (or restored history when no turn
//      is active): confirmation/clarification/action phases
//   6. degraded                  -- a failed turn with nothing else to show
//   7. idle
// "degraded" is also a flag that coexists with any phase (e.g. an answer
// that was not saved keeps its answer but adds the degraded flag).
export function deriveInteractionView(model) {
    const { local, canonical } = model;
    const degradedReasons = [];
    if (local.turn.failure && local.turn.failure !== "offline")
        degradedReasons.push("turn_failed");
    if (local.voice.status === "error")
        degradedReasons.push("voice_error");
    // Canonical truth applies only when it belongs to the current turn, or it
    // is restored history and no new turn has started.
    const current = canonical && local.turn.status !== "in_flight" && (canonical.turnId === local.turn.id || (canonical.turnId === null && local.turn.id === null)) ? canonical.projection : null;
    if (current && !current.persistence_saved)
        degradedReasons.push("not_saved");
    const action = current ? presentCanonicalAction(current.action) : null;
    let phase;
    if (local.voice.status === "listening")
        phase = "listening";
    else if (local.voice.status === "transcribing")
        phase = "transcribing";
    else if (!local.online)
        phase = "offline";
    else if (local.turn.status === "in_flight")
        phase = "working";
    else if (local.turn.status === "responding")
        phase = "responding";
    else if (local.turn.failure === "offline")
        phase = "offline";
    else if (local.turn.failure)
        phase = "degraded";
    else if (action)
        phase = ACTION_PHASE[action.stage];
    else if (current?.kind === "confirmation")
        phase = "confirmation_required";
    else if (current?.kind === "clarification")
        phase = "clarification_required";
    else
        phase = "idle";
    return {
        phase,
        degraded: degradedReasons.length > 0,
        degradedReasons,
        online: local.online,
        voice: local.voice,
        turnInFlight: local.turn.status === "in_flight",
        canonical: current,
        action,
        label: PHASE_LABEL[phase],
    };
}
