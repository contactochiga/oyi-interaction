import assert from "node:assert/strict";
import { test } from "node:test";
import { createElement as h } from "react";
import { renderToStaticMarkup as render } from "react-dom/server";
import * as oyi from "../dist/index.js";

test("progress never reconstructs earlier runtime facts from a later state", () => {
  for (const stage of ["proposed", "approved", "sent", "accepted", "verifying", "verified", "unobservable", "timed_out", "failed", "rejected"]) {
    const steps = oyi.oyiProgressSteps({ phase: "idle", action: { stage } });
    assert.equal(steps.length, 1, stage);
    if (stage !== "verifying") assert.ok(!steps.some((step) => step.label === "Verifying"));
    if (stage !== "verified") assert.ok(!steps.some((step) => step.label === "Verified"));
  }
  for (const phase of ["listening", "transcribing", "working", "responding"]) assert.equal(oyi.oyiProgressSteps({ phase, action: null }, { voiceTurn: true }).length, 1);
  for (const stage of ["cancelled", "superseded"]) assert.deepEqual(oyi.oyiProgressSteps({ phase: "idle", action: { stage } }), []);
  assert.deepEqual(oyi.oyiProgressSteps({ phase: "idle", action: null }), []);
});

test("drawer semantics isolate background and leave closed panels inert", () => {
  const closed = render(h(oyi.OyiShell, { layout: "mobile", surfaceNavigation: "navigation", history: "history", mainCanvas: "canvas" }));
  assert.match(closed, /class="oyi-shell-sidebar"[^>]*inert=""/);
  assert.match(closed, /class="oyi-shell-history"[^>]*inert=""/);
  const open = render(h(oyi.OyiShell, { layout: "mobile", sidebarOpen: true, surfaceNavigation: "navigation", mainCanvas: "canvas" }));
  assert.match(open, /role="dialog" aria-modal="true"/);
  assert.match(open, /class="oyi-shell-column"[^>]*inert=""/);
  const desktop = render(h(oyi.OyiShell, { layout: "desktop", surfaceNavigation: "navigation", mainCanvas: "canvas" }));
  assert.doesNotMatch(desktop, /inert|aria-modal/);
});

test("context reflects actual active option and uses native keyboard semantics", () => {
  assert.match(render(h(oyi.OyiContextSelector, { options: [{ id: "a", label: "Unit A", active: false }], onSelect() {} })), /No home selected/);
  const html = render(h(oyi.OyiContextSelector, { options: [{ id: "a", label: "Unit A", active: true }, { id: "b", label: "Unit B", active: false }], onSelect() {} }));
  assert.match(html, /<select/);
  assert.match(html, /value="a" selected=""/);
  assert.doesNotMatch(html, /role="listbox"/);
});

test("voice meter needs real finite readings; accessible notice and long captions", () => {
  assert.equal(render(h(oyi.OyiVoiceLevel, { levels: [] })), "");
  assert.equal(render(h(oyi.OyiVoiceLevel, { levels: [NaN] })), "");
  assert.match(render(h(oyi.OyiVoiceLevel, { levels: [2] })), /aria-valuenow="100"/);
  assert.match(render(h(oyi.OyiNotice, { tone: "offline" }, "Offline")), /role="status"/);
  const html = render(h(oyi.OyiCaption, { collapseAfter: 10, entries: [{ kind: "oyi_response", text: "An actual long response is retained in full." }] }));
  assert.match(html, /An actual long response is retained in full\./);
  assert.match(html, /aria-expanded="false"/);
});
