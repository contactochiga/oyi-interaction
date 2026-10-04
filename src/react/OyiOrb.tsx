"use client";

// CSS fallback / reference orb renderer. It renders the semantic state it is
// given and owns no intelligence state. A WebGL renderer will later implement
// the same props. Motion stops under prefers-reduced-motion and while the
// page is hidden; the accessible label always carries the state.
import { OYI_ORB_TOKENS, type OyiOrbState } from "../core/orbContract.js";
import { useOyiPageVisible, useOyiReducedMotion } from "./hooks.js";

export type OyiOrbProps = {
  state: OyiOrbState;
  size?: "small" | "medium" | "large";
  // When provided the orb is a button; otherwise it is a status image.
  onActivate?: () => void;
  // Accessible label for the button action (e.g. "Talk to Oyi"); the state
  // label is appended so state is never conveyed by animation alone.
  actionLabel?: string;
  controlsId?: string;
  expanded?: boolean;
  hasPopup?: "dialog" | "menu";
  className?: string;
};

export function OyiOrb({ state, size = "medium", onActivate, actionLabel, controlsId, expanded, hasPopup, className }: OyiOrbProps) {
  const token = OYI_ORB_TOKENS[state];
  const reducedMotion = useOyiReducedMotion();
  const visible = useOyiPageVisible();
  const motion = reducedMotion ? "none" : token.motion;
  const common = {
    className: ["oyi-orb", className].filter(Boolean).join(" "),
    "data-oyi-orb": "true",
    "data-state": state,
    "data-size": size,
    "data-tone": token.tone,
    "data-motion": motion,
    "data-paused": visible ? "false" : "true",
  } as const;
  const body = (
    <>
      <span className="oyi-orb-halo" aria-hidden="true" />
      <span className="oyi-orb-core" aria-hidden="true" />
      <span className="oyi-orb-wordmark" aria-hidden="true">Oyi</span>
    </>
  );
  if (onActivate) {
    return (
      <button
        type="button"
        {...common}
        onClick={onActivate}
        aria-label={actionLabel ? `${actionLabel}. ${token.label}` : token.label}
        aria-controls={controlsId}
        aria-expanded={expanded === undefined ? undefined : expanded}
        aria-haspopup={hasPopup}
      >
        {body}
      </button>
    );
  }
  return (
    <span {...common} role="img" aria-label={token.label}>
      {body}
    </span>
  );
}
