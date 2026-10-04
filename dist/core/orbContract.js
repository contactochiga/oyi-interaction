export const OYI_ORB_STATES = [
    "idle",
    "listening",
    "working",
    "responding",
    "confirmation",
    "action_pending",
    "verified",
    "unobservable",
    "failed",
    "degraded",
    "offline",
];
// Restrained visual tokens. CSS maps data-state/data-motion/data-tone to
// custom properties; reduced motion forces motion "none".
export const OYI_ORB_TOKENS = Object.freeze({
    idle: { motion: "breathe", tone: "accent", label: "Oyi is ready" },
    listening: { motion: "ripple", tone: "accent-strong", label: "Oyi is listening" },
    working: { motion: "pulse", tone: "accent", label: "Oyi is working on your request" },
    responding: { motion: "breathe", tone: "accent-strong", label: "Oyi is responding" },
    confirmation: { motion: "none", tone: "attention", label: "Oyi is waiting for your confirmation" },
    action_pending: { motion: "pulse", tone: "neutral", label: "Action in progress. Not verified yet" },
    verified: { motion: "none", tone: "success", label: "Action verified" },
    unobservable: { motion: "none", tone: "neutral", label: "Command accepted. Not verified" },
    failed: { motion: "none", tone: "warning", label: "Action failed" },
    degraded: { motion: "none", tone: "warning", label: "Oyi is running with reduced reliability" },
    offline: { motion: "none", tone: "muted", label: "Oyi is offline" },
});
const PHASE_TO_ORB = {
    idle: "idle",
    listening: "listening",
    transcribing: "listening",
    working: "working",
    responding: "responding",
    clarification_required: "confirmation",
    confirmation_required: "confirmation",
    action_pending: "action_pending",
    action_accepted: "action_pending",
    action_verifying: "action_pending",
    action_verified: "verified",
    action_unobservable: "unobservable",
    action_failed: "failed",
    action_timed_out: "failed",
    action_rejected: "failed",
    action_cancelled: "idle",
    action_superseded: "idle",
    degraded: "degraded",
    offline: "offline",
};
export function orbStateForPhase(phase) {
    return PHASE_TO_ORB[phase];
}
export function orbStateForView(view) {
    const state = PHASE_TO_ORB[view.phase];
    // An idle orb with a degraded flag (e.g. reply not saved) shows degraded.
    return state === "idle" && view.degraded ? "degraded" : state;
}
