// Shared by the package tests AND by the Consumer/Facility cross-surface
// smokes (exported as oyi-interaction/fixtures/expectations-lib.mjs). Pure.
export function computeInteractionExpectations(core, fixture) {
  const cases = fixture.cases.map((item) => {
    let model = core.createInteractionModel({ online: true });
    model = core.interactionReducer(model, { type: "turn.submitted", turnId: "t1" });
    model = core.interactionReducer(model, { type: "turn.response", turnId: "t1", response: { reply: `Fixture ${item.id}`, persistence_saved: true, ...item.response } });
    const responding = core.deriveInteractionView(model);
    model = core.interactionReducer(model, { type: "turn.presented", turnId: "t1" });
    const live = core.deriveInteractionView(model);
    const restored = core.deriveInteractionView(core.interactionReducer(core.createInteractionModel(), { type: "thread.restored", latestAssistant: { content: `Fixture ${item.id}`, ...item.restored_metadata } }));
    const action = live.action;
    return {
      id: item.id,
      matrix: item.matrix,
      responding_phase: responding.phase,
      phase: live.phase,
      restored_phase: restored.phase,
      orb: core.orbStateForView(live),
      label: live.label,
      action: action ? { status: action.status, stage: action.stage, tone: action.tone, headline: action.headline, detail: action.detail, verified: action.verified, terminal: action.terminal, awaiting_user: action.awaiting_user } : null,
      restored_action_equal: JSON.stringify(restored.action) === JSON.stringify(live.action),
    };
  });
  return { contract: "oyi.interaction.expectations", fixture_contract: fixture.contract, fixture_version: fixture.version, cases };
}
