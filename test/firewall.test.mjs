// FACILITY REALTIME FIREWALL -- runtime proof. Every network/socket
// constructor is trapped, then the whole package is loaded and exercised
// (all primitives rendered, the reducer driven through a full turn, the
// voice translator and history/suggestion normalizers run). Nothing may
// open a socket, stream or request.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import { test } from "node:test";

const calls = [];
const trap = (name) => new Proxy(function () {}, {
  construct() { calls.push(name); throw new Error(`${name} constructed`); },
  apply() { calls.push(name); throw new Error(`${name} called`); },
});
globalThis.WebSocket = trap("WebSocket");
globalThis.EventSource = trap("EventSource");
globalThis.XMLHttpRequest = trap("XMLHttpRequest");
const realFetch = globalThis.fetch;
globalThis.fetch = trap("fetch");

test("runtime: loading and exercising the package opens no socket, stream or request", async () => {
  const { createElement: h } = await import("react");
  const { renderToStaticMarkup } = await import("react-dom/server");
  const oyi = await import("../dist/index.js");
  const fixture = JSON.parse(fs.readFileSync(new URL("../fixtures/oyi-action-truth.fixture.json", import.meta.url), "utf8"));
  let model = oyi.createInteractionModel();
  for (const item of fixture.cases) {
    for (const event of [{ type: "turn.submitted", turnId: item.id }, { type: "turn.response", turnId: item.id, response: item.response }, { type: "turn.presented", turnId: item.id }]) model = oyi.interactionReducer(model, event);
    const view = oyi.deriveInteractionView(model);
    renderToStaticMarkup(h("div", null,
      h(oyi.OyiOrb, { state: oyi.orbStateForView(view), onActivate() {} }),
      h(oyi.OyiCaption, { entries: oyi.buildCaption(view) }),
      h(oyi.OyiActionResult, { view: view.action }),
      h(oyi.OyiConfirmation, { proposal: "x", onConfirm() {}, onCancel() {} }),
      h(oyi.OyiComposer, { value: "x", onChange() {}, onSubmit() {} }),
      h(oyi.OyiSuggestions, { items: oyi.normalizeOyiSuggestions([{ label: "a" }], { source: "seed" }), onSelect() {} }),
      h(oyi.OyiHistory, { view: oyi.oyiHistoryView({ threads: oyi.normalizeOyiThreads([{ id: "t" }]) }), onSelect() {} }),
      h(oyi.OyiShell, { layout: "mobile", mainCanvas: "m" }),
    ));
  }
  oyi.voiceSnapshotEvents(oyi.OYI_VOICE_IDLE_SNAPSHOT, { ...oyi.OYI_VOICE_IDLE_SNAPSHOT, status: "listening" });
  assert.deepEqual(calls, []);
  globalThis.fetch = realFetch;
});

test("static: package guard (realtime firewall, no transport, no surface imports) passes", () => {
  const out = execFileSync(process.execPath, [new URL("../scripts/guard.mjs", import.meta.url).pathname], { encoding: "utf8" });
  assert.match(out, /guards passed/);
});
