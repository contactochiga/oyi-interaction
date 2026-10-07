import assert from "node:assert/strict";
import fs from "node:fs";
import { test } from "node:test";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import * as oyi from "../dist/index.js";

const fixture = JSON.parse(fs.readFileSync(new URL("../fixtures/oyi-action-truth.fixture.json", import.meta.url), "utf8"));
const render = (el) => renderToStaticMarkup(el);
const css = fs.readFileSync(new URL("../dist/styles/oyi-interaction.css", import.meta.url), "utf8");

test("orb: semantic state, accessible label, button semantics only when interactive", () => {
  const status = render(h(oyi.OyiOrb, { state: "working" }));
  assert.match(status, /role="img"/);
  assert.match(status, /aria-label="Oyi is working on your request"/);
  assert.match(status, /data-state="working"/);
  assert.doesNotMatch(status, /<button/);
  const button = render(h(oyi.OyiOrb, { state: "verified", onActivate: () => {}, actionLabel: "Talk to Oyi", controlsId: "panel", expanded: false, hasPopup: "dialog" }));
  assert.match(button, /<button type="button"/);
  assert.match(button, /aria-label="Talk to Oyi\. Action verified"/);
  assert.match(button, /aria-controls="panel"/);
  assert.match(button, /aria-haspopup="dialog"/);
  for (const state of oyi.OYI_ORB_STATES) assert.match(render(h(oyi.OyiOrb, { state })), new RegExp(`aria-label="${oyi.OYI_ORB_TOKENS[state].label}"`));
});

test("orb: reduced motion and background pause are honoured in CSS", () => {
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.oyi-orb \.oyi-orb-halo[\s\S]*animation: none !important/);
  assert.match(css, /\.oyi-orb\[data-paused="true"\][\s\S]*animation-play-state: paused/);
});

test("identity Orb reuses the same layers with an accessible Oyi name", () => {
  const html = render(h(oyi.OyiOrb, { state: "idle", size: "identity" }));
  assert.match(html, /data-size="identity"/);
  assert.match(html, /role="img" aria-label="Oyi" aria-description="Oyi is ready"/);
  for (const layer of ["halo", "core", "wordmark"]) assert.equal((html.match(new RegExp(`class="oyi-orb-${layer}"`, "g")) || []).length, 1);
  assert.equal((html.match(/>Oyi</g) || []).length, 1);
  assert.match(css, /data-size="identity"\] \{ --oyi-orb-size: 44px/);
  assert.match(css, /data-size="identity"\] \.oyi-orb-wordmark \{ font-size: 13px; line-height: 1/);
  assert.match(css, /data-size="icon"\] \.oyi-orb-wordmark \{ display: none/);
  assert.match(css, /data-size="large"\] \{ --oyi-orb-size: 136px/);
});

test("confirmation: approval with 'Nothing has been sent yet', never success", () => {
  const html = render(h(oyi.OyiConfirmation, { proposal: "Turn off Room 2 AC", targetLabel: "Room 2 AC", onConfirm() {}, onCancel() {} }));
  assert.match(html, /Confirm action\?/);
  assert.match(html, /Nothing has been sent yet\./);
  assert.match(html, />Confirm</);
  assert.match(html, />Cancel</);
  assert.doesNotMatch(html, /verified|success|completed/i);
});

test("action result: canonical truth only; raw keys hidden unless diagnostic", () => {
  for (const item of fixture.cases) {
    const view = oyi.actionResultView(item.response);
    const html = render(h(oyi.OyiActionResult, { view }));
    if (!view) { assert.equal(html, ""); continue; }
    assert.match(html, new RegExp(`data-action-verified="${view.status === "confirmed"}"`));
    assert.doesNotMatch(html.replace(/data-[a-z-]+="[^"]*"/g, ""), new RegExp(`>${view.status}<`), `${item.id}: no raw key in normal presentation`);
    if (view.status !== "confirmed") assert.doesNotMatch(html, /data-tone="verified"/);
  }
  const diag = render(h(oyi.OyiActionResult, { view: oyi.actionResultView(fixture.cases.find((c) => c.id === "C").response), diagnostic: true }));
  assert.match(diag, /<code>unobservable<\/code>/);
});

test("composer: modes render the right controls and labels", () => {
  const empty = render(h(oyi.OyiComposer, { value: "", onChange() {}, onSubmit() {}, voiceAvailable: true, onStartVoice() {}, onOpenCapabilities() {} }));
  assert.match(empty, /data-mode="empty"/);
  assert.match(empty, /placeholder="Write a message"/);
  assert.match(empty, /aria-label="Message Oyi"/);
  assert.match(empty, /aria-label="Speak to Oyi"/);
  assert.match(empty, /aria-label="Add or attach"/);
  assert.doesNotMatch(empty, /Send message/);
  const typing = render(h(oyi.OyiComposer, { value: "hi", onChange() {}, onSubmit() {}, voiceAvailable: true, onStartVoice() {} }));
  assert.match(typing, /aria-label="Send message"/);
  assert.doesNotMatch(typing, /aria-label="Speak to Oyi"/);
  const processing = render(h(oyi.OyiComposer, { value: "next", onChange() {}, onSubmit() {}, turnInFlight: true }));
  assert.match(processing, /aria-busy="true"/);
  assert.match(processing, /disabled="" aria-label="Sending is paused while Oyi is working"/);
  const voice = render(h(oyi.OyiComposer, { value: "", onChange() {}, onSubmit() {}, voiceActive: true, voiceInterim: "turn off", onStopVoice() {}, onCancelVoice() {} }));
  assert.match(voice, /role="status" aria-live="polite"/);
  assert.match(voice, /aria-label="Stop voice input"/);
  assert.match(voice, /aria-label="Cancel voice input"/);
  assert.doesNotMatch(voice, /<textarea/);
});

test("expanded composer keeps mic/send visible and cancel before recording status", () => {
  const props = { controlsLayout: "expanded", value: "", onChange() {}, onSubmit() {}, onStartVoice() {}, onStopVoice() {}, onCancelVoice() {} };
  const empty = render(h(oyi.OyiComposer, props));
  assert.match(empty, /aria-label="Speak to Oyi"/);
  assert.match(empty, /disabled="" aria-label="Send message"/);
  const typed = render(h(oyi.OyiComposer, { ...props, value: "typed" }));
  assert.match(typed, /aria-label="Speak to Oyi"/);
  assert.match(typed, /aria-label="Send message"/);
  const voice = render(h(oyi.OyiComposer, { ...props, voiceActive: true, voiceElapsedSeconds: 65, voiceStopping: true }));
  assert.ok(voice.indexOf('aria-label="Cancel voice input"') < voice.indexOf('role="status"'));
  assert.match(voice, /1:05/);
  assert.match(voice, /disabled="" aria-label="Stop voice input"/);
  assert.doesNotMatch(voice, /Send message|Speak to Oyi/);
});

test("expanded voice keeps Stop/Send distinct, hides redundant words, bounds real meter", () => {
  const props = { controlsLayout: "expanded", value: "", voiceActive: true, voiceElapsedSeconds: 3, voiceStatusLabel: "Recording", voiceInterim: "interim", voiceLevels: [.2, .8], onChange() {}, onSubmit() {}, onStopVoice() {}, onSendVoice() {}, onCancelVoice() {} };
  const voice = render(h(oyi.OyiComposer, props));
  assert.match(voice, /class="oyi-visually-hidden">Recording/);
  assert.match(voice, /0:03/);
  assert.match(voice, /aria-label="Stop voice input"/);
  assert.match(voice, /aria-label="Finalize and send voice message"/);
  assert.doesNotMatch(voice, /voice-interim/);
  assert.ok(voice.indexOf('oyi-composer-timer') < voice.indexOf('oyi-voice-level'));
  const finalizing = render(h(oyi.OyiComposer, { ...props, voiceStopping: true }));
  assert.match(finalizing, /disabled="" aria-label="Stop voice input"/);
  assert.match(finalizing, /disabled="" aria-label="Finalize and send voice message"/);
  assert.match(css, /\.oyi-composer-voice-dot \{ animation: none !important; \}/);
});

test("caption: aria-live, speaker labels, spoken highlight only when given", () => {
  const html = render(h(oyi.OyiCaption, { entries: [{ kind: "user_final", text: "Turn off AC" }, { kind: "oyi_response", text: "Command accepted.", spokenRange: { start: 0, end: 7 } }] }));
  assert.match(html, /aria-live="polite"/);
  assert.match(html, /You: /);
  assert.match(html, /<mark class="oyi-caption-spoken">Command<\/mark> accepted\./);
});

test("suggestions: icon + text + arrow, no card container", () => {
  const items = oyi.normalizeOyiSuggestions([{ label: "What's happening?" }, { label: "Scenes", href: "/scenes" }], { source: "seed" });
  const html = render(h(oyi.OyiSuggestions, { items, onSelect() {} }));
  assert.match(html, /<ul class="oyi-suggestions" aria-label="Suggestions">/);
  assert.match(html, /oyi-suggestion-icon/);
  assert.match(html, /oyi-suggestion-arrow/);
  assert.match(html, /\(opens a page\)/);
  assert.doesNotMatch(css.match(/\.oyi-suggestion \{[\s\S]*?\}/)[0], /border: 1px/, "no per-item card border");
});

test("history: loading / empty / error / list with active thread", () => {
  const threads = oyi.normalizeOyiThreads([{ id: "a", title: "Lights", updated_at: "2026-10-01T10:00:00Z" }], { activeThreadId: "a" });
  assert.match(render(h(oyi.OyiHistory, { view: oyi.oyiHistoryView({ loading: true }), onSelect() {} })), /Loading conversations/);
  assert.match(render(h(oyi.OyiHistory, { view: oyi.oyiHistoryView({ threads: [] }), onSelect() {} })), /No conversations yet/);
  assert.match(render(h(oyi.OyiHistory, { view: oyi.oyiHistoryView({ error: "Offline" }), onSelect() {}, onRetry() {} })), /role="alert">Offline/);
  const list = render(h(oyi.OyiHistory, { view: oyi.oyiHistoryView({ threads, activeThreadId: "a" }), onSelect() {}, onNewConversation() {} }));
  assert.match(list, /aria-current="true"/);
  assert.match(list, /New conversation/);
});

test("shell: renders only provided slots, layout class, live progress region", () => {
  const html = render(h(oyi.OyiShell, { layout: "desktop", mainCanvas: "main", composer: "composer", temporaryProgress: "Working", label: "Oyi" }));
  assert.match(html, /data-layout="desktop"/);
  assert.match(html, /data-slot="mainCanvas"/);
  assert.match(html, /data-slot="composer"/);
  assert.match(html, /class="oyi-shell-progress" role="status" aria-live="polite">Working/);
  assert.doesNotMatch(html, /data-slot="sidebar"/);
  assert.equal(oyi.OYI_SHELL_SLOTS.length, 11);
  assert.equal(oyi.oyiLayoutForWidth(390), "mobile");
  assert.equal(oyi.oyiLayoutForWidth(820), "tablet");
  assert.equal(oyi.oyiLayoutForWidth(1280), "desktop");
});

test("tokens: brand custom properties exist and no Tailwind is required", () => {
  for (const token of ["--oyi-bg", "--oyi-accent", "--oyi-text", "--oyi-text-muted", "--oyi-border", "--oyi-focus-ring"]) assert.match(css, new RegExp(`${token}:`));
  assert.doesNotMatch(css, /@tailwind|@apply/);
});
