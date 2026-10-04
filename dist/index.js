// oyi-interaction -- core contracts + React primitives.
// Import "oyi-interaction/styles.css" once in the surface (it defines the
// --oyi-* tokens and primitive styles; no Tailwind dependency).
export * from "./core/index.js";
export * from "./react/hooks.js";
export { OyiOrb } from "./react/OyiOrb.js";
export { OyiCaption } from "./react/OyiCaption.js";
export { OyiComposer } from "./react/OyiComposer.js";
export { OyiSuggestions } from "./react/OyiSuggestions.js";
export { OyiConfirmation } from "./react/OyiConfirmation.js";
export { OyiActionResult } from "./react/OyiActionResult.js";
export { OyiHistory } from "./react/OyiHistory.js";
export { OyiShell, OYI_SHELL_SLOTS } from "./react/OyiShell.js";
