import assert from "node:assert/strict";
import fs from "node:fs";
import { test } from "node:test";
import * as core from "../dist/core/index.js";
import { computeInteractionExpectations } from "../scripts/expectations-lib.mjs";

const fixture = JSON.parse(fs.readFileSync(new URL("../fixtures/oyi-action-truth.fixture.json", import.meta.url), "utf8"));
const caseById = (id) => fixture.cases.find((c) => c.id === id);
const { createInteractionModel: create, interactionReducer: reduce, deriveInteractionView: view } = core;

function run(events, init) {
  return events.reduce(reduce, create(init));
}
const respond = (response, turnId = "t1") => [{ type: "turn.submitted", turnId }, { type: "turn.response", turnId, response }, { type: "turn.presented", turnId }];

// ---------------- action truth ----------------
test("action truth: status vocabulary equals the Backend canonical list", () => {
  assert.deepEqual([...core.OYI_ACTION_STATUSES].sort(), [...fixture.canonical_statuses].sort());
});

test("action truth: only canonical confirmed is verified, for every fixture case", () => {
  for (const item of fixture.cases) {
    const live = core.actionResultView(item.response);
    const restored = core.actionResultView(item.restored_metadata);
    assert.deepEqual(restored, live, `${item.id}: restored == live`);
    if (!live) continue;
    assert.equal(live.verified, live.status === "confirmed", item.id);
    if (!live.verified) assert.doesNotMatch(`${live.headline} ${live.detail}`, /\b(completed|success(ful)?|done)\b|(?<!not )\bverified the\b/i, item.id);
  }
});

test("action truth: approved != sent != accepted != verified", () => {
  const base = { action_id: "a1", requested_operation: "device.power.on", requested_state: true, target: { label: "Room 2 AC" } };
  const views = ["approved", "sent", "provider_accepted", "confirmed"].map((status) => core.actionResultView({ action: { ...base, status } }));
  assert.deepEqual(views.map((v) => v.stage), ["approved", "sent", "accepted", "verified"]);
  assert.equal(new Set(views.map((v) => v.detail)).size, 4);
  assert.deepEqual(views.map((v) => v.verified), [false, false, false, true]);
});

test("action truth: verified statement only when the contract supports it", () => {
  assert.equal(core.actionResultView(caseById("D").response).detail, "Hall Light is on.");
  const noState = core.actionResultView({ action: { action_id: "a", status: "confirmed", requested_operation: "device.power.on", requested_state: null, target: { label: "Lamp" } } });
  assert.equal(noState.detail, "Oyi verified the final device state.");
  const mismatch = core.actionResultView({ action: { action_id: "a", status: "confirmed", requested_operation: "device.power.off", requested_state: false, target: { label: "Room 2 AC" }, truth: { physical_effect_status: "unknown" } } });
  assert.equal(mismatch.detail, "Oyi verified the final device state.");
  const off = core.actionResultView({ action: { action_id: "a", status: "confirmed", requested_operation: "device.power.off", requested_state: false, target: { label: "Room 2 AC" }, truth: { physical_effect_status: "confirmed" } } });
  assert.equal(off.detail, "Room 2 AC is off.");
});

test("action truth: hostile and unknown inputs present nothing", () => {
  for (const raw of [{ execution: { action: { action_id: "a", status: "success" } } }, { execution: { action: { action_id: "a", status: "executed" } } }, { execution: { status: "executed" } }, { action: { status: "confirmed" } }, null, "confirmed"]) {
    assert.equal(core.actionResultView(raw), null);
  }
});

test("action truth: async future -- canonical updates only, terminal never replaced, other actions ignored", () => {
  const accepted = core.readCanonicalAction({ action: { action_id: "a1", status: "provider_accepted" } });
  const verifying = core.applyCanonicalActionUpdate(accepted, { action_id: "a1", status: "verifying" });
  assert.equal(verifying.status, "verifying");
  const verified = core.applyCanonicalActionUpdate(verifying, { action: { action_id: "a1", status: "confirmed" } });
  assert.equal(verified.status, "confirmed");
  assert.equal(core.applyCanonicalActionUpdate(verified, { action_id: "a1", status: "failed" }), verified, "terminal is final");
  assert.equal(core.applyCanonicalActionUpdate(accepted, { action_id: "other", status: "confirmed" }), accepted, "different action ignored");
  assert.equal(core.applyCanonicalActionUpdate(accepted, { action_id: "a1", status: "success" }), accepted, "non-canonical ignored");
});

// ---------------- interaction state ----------------
test("state: request in flight is WORKING, never a fabricated stage", () => {
  const model = run([{ type: "turn.submitted", turnId: "t1" }]);
  assert.equal(view(model).phase, "working");
  for (const stage of ["thinking", "finding_what_matters", "evidence_planning", "reasoning", "response_composition"]) {
    const next = reduce(model, { type: "turn.stage", turnId: "t1", stage });
    assert.equal(next, model, `stage ${stage} must be ignored`);
  }
  assert.equal(core.OYI_CANONICAL_STREAM_STAGES.length, 0);
});

test("state: transitions idle -> working -> responding -> answer", () => {
  let model = create();
  assert.equal(view(model).phase, "idle");
  model = reduce(model, { type: "turn.submitted", turnId: "t1" });
  assert.equal(view(model).phase, "working");
  model = reduce(model, { type: "turn.response", turnId: "t1", response: { reply: "Hello", execution: { status: "read_only", action: null } } });
  assert.equal(view(model).phase, "responding");
  model = reduce(model, { type: "turn.presented", turnId: "t1" });
  assert.equal(view(model).phase, "idle");
  assert.equal(view(model).canonical.text, "Hello");
});

test("precedence: offline overrides idle, working and old results", () => {
  assert.equal(view(run([{ type: "connectivity.changed", online: false }])).phase, "offline");
  assert.equal(view(run([{ type: "turn.submitted", turnId: "t1" }, { type: "connectivity.changed", online: false }])).phase, "offline");
  assert.equal(view(run([...respond(caseById("D").response), { type: "connectivity.changed", online: false }])).phase, "offline");
  assert.equal(view(run([{ type: "connectivity.changed", online: false }, { type: "connectivity.changed", online: true }])).phase, "idle");
});

test("precedence: an active microphone always shows listening/transcribing", () => {
  assert.equal(view(run([{ type: "connectivity.changed", online: false }, { type: "voice.listening" }])).phase, "listening");
  assert.equal(view(run([{ type: "turn.submitted", turnId: "t1" }, { type: "voice.listening" }, { type: "voice.transcribing" }])).phase, "transcribing");
  const final = run([{ type: "voice.listening" }, { type: "voice.interim", text: "turn of" }, { type: "voice.final", text: "turn off the AC" }]);
  assert.equal(view(final).phase, "idle");
  assert.equal(view(final).voice.final, "turn off the AC");
});

test("precedence: pending confirmation never looks completed; accepted never looks verified; unobservable != failed", () => {
  const a = view(run(respond(caseById("A").response)));
  assert.equal(a.phase, "confirmation_required");
  assert.equal(a.action.verified, false);
  const c2 = view(run(respond(caseById("C2").response)));
  assert.equal(c2.phase, "action_accepted");
  assert.notEqual(core.orbStateForView(c2), "verified");
  const e = view(run(respond(caseById("E").response)));
  const f = view(run(respond(caseById("F").response)));
  assert.equal(e.phase, "action_unobservable");
  assert.equal(f.phase, "action_failed");
  assert.notEqual(core.orbStateForView(e), core.orbStateForView(f));
});

test("precedence: verified only from canonical verification evidence", () => {
  assert.equal(view(run(respond(caseById("D").response))).phase, "action_verified");
  let model = run(respond(caseById("C2").response));
  model = reduce(model, { type: "action.updated", action: { action_id: "action-C2", status: "verifying" } });
  assert.equal(view(model).phase, "action_verifying");
  model = reduce(model, { type: "action.updated", action: { action_id: "action-C2", status: "confirmed", requested_operation: "device.power.on", requested_state: true, target: { label: "Hall Light" } } });
  assert.equal(view(model).phase, "action_verified");
  // No event other than canonical evidence can produce verified.
  const nonCanonical = [{ type: "turn.presented", turnId: "t1" }, { type: "voice.ended" }, { type: "connectivity.changed", online: true }, { type: "action.updated", action: { action_id: "action-C2", status: "verified" } }];
  let other = run(respond(caseById("C2").response));
  for (const event of nonCanonical) other = reduce(other, event);
  assert.equal(view(other).phase, "action_accepted");
});

test("precedence: persistence_saved:false adds degraded without erasing the answer", () => {
  const v = view(run(respond({ reply: "Your wallet balance is shown.", persistence_saved: false, execution: { status: "read_only" } })));
  assert.equal(v.phase, "idle");
  assert.equal(v.degraded, true);
  assert.deepEqual(v.degradedReasons, ["not_saved"]);
  assert.equal(v.canonical.text, "Your wallet balance is shown.");
  assert.equal(core.orbStateForView(v), "degraded");
  const withAction = view(run(respond({ ...caseById("E").response, persistence_saved: false })));
  assert.equal(withAction.phase, "action_unobservable");
  assert.equal(withAction.degraded, true);
});

test("precedence: a stale action result cannot override a new active turn", () => {
  let model = run(respond(caseById("D").response, "t1"));
  model = reduce(model, { type: "turn.submitted", turnId: "t2" });
  assert.equal(view(model).phase, "working");
  assert.equal(view(model).action, null, "old action no longer drives presentation");
  // A late response for the old turn is ignored.
  const late = reduce(model, { type: "turn.response", turnId: "t1", response: caseById("J").response });
  assert.equal(late, model);
  model = reduce(model, { type: "turn.response", turnId: "t2", response: { reply: "Hi", execution: { status: "read_only" } } });
  model = reduce(model, { type: "turn.presented", turnId: "t2" });
  assert.equal(view(model).phase, "idle");
  assert.equal(view(model).action, null);
});

test("state: turn failure is degraded (offline failure shows offline); restore/reset clear the turn", () => {
  const failed = run([{ type: "turn.submitted", turnId: "t1" }, { type: "turn.failed", turnId: "t1", reason: "server" }]);
  assert.equal(view(failed).phase, "degraded");
  assert.deepEqual(view(failed).degradedReasons, ["turn_failed"]);
  const offline = run([{ type: "turn.submitted", turnId: "t1" }, { type: "turn.failed", turnId: "t1", reason: "offline" }]);
  assert.equal(view(offline).phase, "offline");
  assert.equal(view(reduce(offline, { type: "connectivity.changed", online: true })).phase, "idle");
  const restored = reduce(run([{ type: "turn.submitted", turnId: "t1" }]), { type: "thread.restored", latestAssistant: { content: "Earlier", ...caseById("E").restored_metadata } });
  assert.equal(view(restored).phase, "action_unobservable");
  assert.equal(reduce(restored, { type: "turn.response", turnId: "t1", response: caseById("J").response }), restored, "in-flight response from before the restore is stale");
  assert.equal(view(reduce(restored, { type: "conversation.reset" })).phase, "idle");
});

test("state: clarification and confirmation without an action object", () => {
  assert.equal(view(run(respond({ reply: "Which light?", execution: { status: "clarification_required" } }))).phase, "clarification_required");
  assert.equal(view(run(respond({ reply: "Confirm?", confirmations: [{ ledger_id: "x" }], requiresConfirmation: true, execution: { status: "pending_confirmation" } }))).phase, "confirmation_required");
});

test("state invariants hold over random event sequences", () => {
  const events = [
    { type: "connectivity.changed", online: false }, { type: "connectivity.changed", online: true },
    { type: "voice.listening" }, { type: "voice.transcribing" }, { type: "voice.interim", text: "x" }, { type: "voice.final", text: "y" }, { type: "voice.cancelled" }, { type: "voice.error", message: "e" },
    { type: "turn.submitted", turnId: "t1" }, { type: "turn.submitted", turnId: "t2" },
    ...fixture.cases.flatMap((c) => [{ type: "turn.response", turnId: "t1", response: c.response }, { type: "turn.response", turnId: "t2", response: c.response }]),
    { type: "turn.presented", turnId: "t1" }, { type: "turn.presented", turnId: "t2" }, { type: "turn.failed", turnId: "t2", reason: "network" },
    { type: "turn.stage", turnId: "t1", stage: "reasoning" }, { type: "action.updated", action: { action_id: "action-C2", status: "confirmed" } },
    { type: "thread.restored", latestAssistant: caseById("C").restored_metadata }, { type: "conversation.reset" },
  ];
  let seed = 7;
  const rand = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
  for (let i = 0; i < 400; i += 1) {
    let model = create();
    for (let j = 0; j < 25; j += 1) {
      model = reduce(model, events[Math.floor(rand() * events.length)]);
      const v = view(model);
      assert.ok(core.OYI_INTERACTION_PHASES.includes(v.phase));
      if (v.phase === "action_verified") assert.equal(v.action?.status, "confirmed");
      if (v.action?.verified) assert.equal(v.action.status, "confirmed");
      if (v.phase === "working") assert.equal(model.local.turn.status, "in_flight");
      if (model.local.voice.status === "listening") assert.equal(v.phase, "listening");
      if (!model.local.online && !["listening", "transcribing"].includes(v.phase)) assert.equal(v.phase, "offline");
      if (model.local.turn.status === "in_flight") assert.equal(v.action, null, "no action truth while a new turn is in flight");
      assert.equal(model.local.stage, null, "no fabricated stages");
      assert.ok(v.label.length > 0);
    }
  }
});

test("orb: every phase maps to a token; failure states never share verified", () => {
  for (const phase of core.OYI_INTERACTION_PHASES) {
    const orb = core.orbStateForPhase(phase);
    assert.ok(core.OYI_ORB_STATES.includes(orb), phase);
    assert.ok(core.OYI_ORB_TOKENS[orb].label);
  }
  for (const phase of ["action_failed", "action_timed_out", "action_rejected", "action_unobservable", "action_accepted", "confirmation_required"]) assert.notEqual(core.orbStateForPhase(phase), "verified");
  assert.equal(core.orbStateForPhase("action_verified"), "verified");
});

// ---------------- composer ----------------
test("composer: empty / typing / voice / processing / confirmation / disabled", () => {
  const base = { value: "", voiceActive: false, turnInFlight: false, confirmationPending: false, voiceAvailable: true };
  const empty = core.composerControls(base);
  assert.equal(empty.mode, "empty");
  assert.deepEqual([empty.showMic, empty.showSend], [true, false]);
  assert.equal(empty.placeholder, "Write a message or tap to speak…");
  const typing = core.composerControls({ ...base, value: "hi" });
  assert.deepEqual([typing.mode, typing.showMic, typing.showSend, typing.sendEnabled], ["typing", true, true, true]);
  const voice = core.composerControls({ ...base, voiceActive: true, value: "hi" });
  assert.deepEqual([voice.mode, voice.showStopVoice, voice.showCancelVoice, voice.showSend, voice.inputDisabled], ["voice", true, true, false, true]);
  const processing = core.composerControls({ ...base, value: "next", turnInFlight: true });
  assert.deepEqual([processing.mode, processing.sendEnabled, processing.inputDisabled], ["processing", false, false], "draft allowed, duplicate submission impossible");
  const confirmation = core.composerControls({ ...base, confirmationPending: true });
  assert.equal(confirmation.mode, "confirmation");
  assert.equal(confirmation.showSend, false, "confirm/cancel are not the send button");
  assert.equal(core.composerControls({ ...base, confirmationPending: true, value: "cancel" }).mode, "typing");
  assert.equal(core.composerControls({ ...base, disabled: true, value: "x" }).sendEnabled, false);
  assert.equal(core.composerControls({ ...base, voiceAvailable: false }).showMic, false);
});

// ---------------- caption ----------------
test("caption: interim/final/response/clarification/truth/degraded; no simulated streaming", () => {
  const v = view(run([...respond({ ...caseById("E").response, reply: "Done sending.", persistence_saved: false })]));
  const entries = core.buildCaption(v);
  assert.deepEqual(entries.map((e) => e.kind), ["oyi_response", "truth_note", "degraded_note"]);
  assert.equal(entries[0].text, "Done sending.", "whole reply, as received");
  const ranged = core.buildCaption(v, { spokenRange: { start: 0, end: 4 } });
  assert.deepEqual(ranged[0].spokenRange, { start: 0, end: 4 });
  assert.equal(core.buildCaption(v, { spokenRange: { start: 2, end: 999 } })[0].spokenRange, null, "invalid range dropped");
  const voice = view(run([{ type: "voice.listening" }, { type: "voice.interim", text: "turn" }]));
  assert.deepEqual(core.buildCaption(voice).map((e) => e.kind), ["user_interim"]);
  const clar = view(run(respond({ reply: "Which room?", execution: { status: "clarification_required" } })));
  assert.equal(core.buildCaption(clar)[0].kind, "clarification");
});

// ---------------- suggestions ----------------
test("suggestions: normalize seeds, awareness and Backend suggested_actions without deciding them", () => {
  const items = core.normalizeOyiSuggestions([
    { label: "What's happening?", prompt: "What's happening?" },
    { label: "Scenes", href: "/scenes" },
    { label: "what's happening?", prompt: "dupe" },
    { label: "Evil", href: "javascript:alert(1)" },
    { label: "External", href: "https://evil.example" },
    { label: "", prompt: "no label" },
    null,
    { label: "Open devices", route: "/devices", icon: "device" },
  ], { source: "seed" });
  assert.deepEqual(items.map((i) => [i.label, i.kind, i.href, i.icon]), [
    ["What's happening?", "prompt", null, "prompt"],
    ["Scenes", "navigate", "/scenes", "navigate"],
    ["Evil", "prompt", null, "prompt"],
    ["External", "prompt", null, "prompt"],
    ["no label", "prompt", null, "prompt"],
    ["Open devices", "navigate", "/devices", "device"],
  ]);
  assert.equal(items[2].prompt, "Evil", "unsafe href is dropped, never followed");
  assert.equal(core.normalizeOyiSuggestions([{ label: "a" }, { label: "b" }, { label: "c" }], { source: "backend", max: 2 }).length, 2);
});

// ---------------- history ----------------
test("history: normalizes /oyi/threads rows, dedupes, sorts, marks active and local", () => {
  const threads = core.normalizeOyiThreads({ threads: [
    { id: "a", title: "Lights", updated_at: "2026-10-01T10:00:00Z", message_count: 4 },
    { id: "b", title: "", updated_at: "2026-10-03T10:00:00Z" },
    { id: "a", title: "dupe" },
    { title: "no id" },
  ] }, { activeThreadId: "a" });
  assert.deepEqual(threads.map((t) => [t.id, t.title, t.active, t.source]), [["b", "Oyi conversation", false, "backend"], ["a", "Lights", true, "backend"]]);
  assert.equal(core.oyiHistoryView({ loading: true }).status, "loading");
  assert.equal(core.oyiHistoryView({ error: "boom" }).status, "error");
  assert.equal(core.oyiHistoryView({ threads: [] }).status, "empty");
  assert.equal(core.oyiHistoryView({ threads }).status, "ready");
  assert.equal(core.normalizeOyiThreads([{ id: "l1", title: "x", updatedAt: 1 }], { source: "local" })[0].source, "local");
  const latest = core.latestAssistantMessage([{ role: "user", content: "hi", metadata: {} }, { role: "assistant", content: "Done", metadata: { action: { action_id: "x", status: "unobservable" } } }]);
  assert.equal(core.actionResultView(latest).status, "unobservable");
});

// ---------------- surface adapters ----------------
function adapter(overrides = {}) {
  return {
    surface: "consumer",
    context: () => ({ scopeKind: "home", scopeLabel: "A-101", estateId: "e", homeId: "h", buildingId: null }),
    navigation: () => [{ key: "devices", label: "Devices", href: "/devices" }],
    starterSeeds: () => [{ label: "What's happening?" }],
    operationalObject: () => null,
    historyPolicy: { source: "backend_threads", localFallback: "unsaved_turns_only", maxThreads: 24 },
    uiHints: { voiceEntry: true },
    ...overrides,
  };
}

test("surface adapter: valid adapters are frozen; authority/truth fields are rejected", () => {
  const defined = core.defineOyiSurfaceAdapter(adapter());
  assert.ok(Object.isFrozen(defined));
  assert.ok(Object.isFrozen(defined.historyPolicy));
  assert.equal(core.defineOyiSurfaceAdapter(adapter({ surface: "facility" })).surface, "facility");
  for (const bad of [{ grantCapability: () => true }, { authority: {} }, { executeAction: () => null }, { permissionsOverride: [] }, { truth: {} }, { verify: () => true }, { capabilities: [] }, { runtime: {} }, { somethingElse: 1 }]) {
    assert.throws(() => core.defineOyiSurfaceAdapter(adapter(bad)), core.OyiSurfaceAdapterError, JSON.stringify(Object.keys(bad)));
  }
  assert.throws(() => core.defineOyiSurfaceAdapter(adapter({ surface: "office" })), core.OyiSurfaceAdapterError);
  assert.throws(() => core.defineOyiSurfaceAdapter(adapter({ historyPolicy: { source: "local_storage", localFallback: "none", maxThreads: 5 } })), core.OyiSurfaceAdapterError);
  assert.deepEqual(core.normalizeOyiNavigation([{ key: "a", label: "A", href: "/a" }, { key: "a", label: "dupe", href: "/b" }, { key: "x", label: "X", href: "https://x" }, { key: "y", label: "Y", href: "//y" }]), [{ key: "a", label: "A", href: "/a" }]);
});

// ---------------- voice ----------------
test("voice: interface-only; snapshots translate into reducer events", () => {
  const unavailable = core.createUnavailableVoiceAdapter();
  assert.equal(unavailable.kind, "unavailable");
  assert.equal(unavailable.getSnapshot().available, false);
  const idle = core.OYI_VOICE_IDLE_SNAPSHOT;
  const listening = { ...idle, available: true, status: "listening" };
  const interim = { ...listening, interimTranscript: "turn off" };
  const done = { ...interim, status: "idle", interimTranscript: "", finalTranscript: "turn off the AC" };
  const events = [...core.voiceSnapshotEvents(idle, listening), ...core.voiceSnapshotEvents(listening, interim), ...core.voiceSnapshotEvents(interim, done)];
  assert.deepEqual(events.map((e) => e.type), ["voice.listening", "voice.interim", "voice.final"]);
  const model = events.reduce(reduce, create());
  assert.equal(view(model).voice.final, "turn off the AC");
  assert.deepEqual(core.voiceSnapshotEvents(listening, { ...listening, status: "error", error: "denied" }).map((e) => e.type), ["voice.error"]);
  assert.deepEqual(core.voiceSnapshotEvents(listening, { ...idle, available: true }).map((e) => e.type), ["voice.ended"]);
});

// ---------------- cross-surface expectations ----------------
test("cross-surface: committed expectations equal a fresh computation", () => {
  const committed = JSON.parse(fs.readFileSync(new URL("../fixtures/oyi-interaction-expectations.json", import.meta.url), "utf8"));
  assert.deepEqual(computeInteractionExpectations(core, fixture), committed);
  for (const c of committed.cases) assert.equal(c.restored_action_equal, true, c.id);
});

test("confirmation proposal: built only from canonical confirmation fields", () => {
  assert.deepEqual(core.confirmationProposal({ type: "device_command_confirmation", label: "3Gang Living room", channel_code: "switch_2", desired_state: false }), { proposal: "Turn off channel 2 on 3Gang Living room", targetLabel: null });
  assert.deepEqual(core.confirmationProposal({ type: "device_command_confirmation", label: "Hall Light", desired_state: true }), { proposal: "Turn on Hall Light", targetLabel: null });
  assert.deepEqual(core.confirmationProposal({ summary: "Pay the service charge", label: "Wallet" }), { proposal: "Pay the service charge", targetLabel: "Wallet" });
  assert.deepEqual(core.confirmationProposal({ ledger_id: "x" }), { proposal: "Approve this action?", targetLabel: null });
  assert.equal(core.OYI_WORKING_TEXT, "Working on your request…");
});

test("empty response text: canonical action truth or an honest statement, never success", () => {
  assert.equal(core.emptyResponseText({ execution: { status: "read_only" } }), "Oyi did not return an answer for this request.");
  assert.equal(core.emptyResponseText(fixture.cases.find((c) => c.id === "E").response), "Command accepted. Oyi could not verify the final physical state.");
  assert.equal(core.emptyResponseText(fixture.cases.find((c) => c.id === "F").response), "Action failed. The command failed. Nothing is confirmed as changed.");
  assert.equal(core.defineOyiSurfaceAdapter(adapter({ historyPolicy: { source: "backend_threads", localFallback: "backend_cache", maxThreads: 24 } })).historyPolicy.localFallback, "backend_cache");
});
