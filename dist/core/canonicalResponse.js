// Projection of ONE canonical conversation response (POST
// /oyi/runtime/conversation, or a restored thread message) into what the
// interaction layer may present. Pure: it reads canonical fields only and
// never infers success, progress or verification.
import { readCanonicalAction } from "./actionTruth.js";
function isRecord(value) {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
function text(value) {
    return typeof value === "string" ? value.trim() : "";
}
export function projectCanonicalResponse(response) {
    if (!isRecord(response))
        return null;
    const execution = isRecord(response.execution) ? response.execution : {};
    const action = readCanonicalAction(response);
    const confirmations = Array.isArray(response.confirmations) ? response.confirmations : [];
    const capabilityResult = text(execution.capability_result) || null;
    const executionStatus = text(execution.status).toLowerCase();
    const clarification = executionStatus === "clarification_required" ||
        capabilityResult === "draft" ||
        isRecord(execution.pending_clarification) ||
        /clarification/i.test(text(response.intent));
    const confirmation = action?.status === "awaiting_confirmation" || confirmations.length > 0 || response.requiresConfirmation === true || response.approvalRequired === true || executionStatus === "pending_confirmation";
    const kind = action && action.status !== "awaiting_confirmation" && action.status !== "draft"
        ? "action"
        : confirmation
            ? "confirmation"
            : clarification || action?.status === "draft"
                ? "clarification"
                : "answer";
    return {
        kind,
        text: text(response.reply) || text(response.message) || text(response.answer) || text(response.content),
        action,
        persistence_saved: response.persistence_saved !== false,
        capability_result: capabilityResult,
    };
}
