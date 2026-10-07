// oyi-interaction -- core contracts + React primitives.
// Import "oyi-interaction/styles.css" once in the surface (it defines the
// --oyi-* tokens and primitive styles; no Tailwind dependency).
export * from "./core/index.js";
export * from "./react/hooks.js";
export { OyiOrb, type OyiOrbProps } from "./react/OyiOrb.js";
export { OyiCaption } from "./react/OyiCaption.js";
export { OyiComposer, type OyiComposerProps } from "./react/OyiComposer.js";
export { OyiSuggestions } from "./react/OyiSuggestions.js";
export { OyiConfirmation, type OyiConfirmationProps } from "./react/OyiConfirmation.js";
export { OyiActionResult } from "./react/OyiActionResult.js";
export { OyiHistory } from "./react/OyiHistory.js";
export { OyiShell, OYI_SHELL_SLOTS, type OyiShellProps, type OyiShellSlot } from "./react/OyiShell.js";
export { OyiProgress } from "./react/OyiProgress.js";
export { OyiVoiceLevel } from "./react/OyiVoiceLevel.js";
export { OyiNotice } from "./react/OyiNotice.js";
export { OyiContextSelector, type OyiContextOption } from "./react/OyiContextSelector.js";
