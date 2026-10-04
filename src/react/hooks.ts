"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef, useState, type RefObject } from "react";
import { createInteractionModel, deriveInteractionView, interactionReducer, type OyiInteractionEvent, type OyiInteractionModel, type OyiInteractionView } from "../core/interactionState.js";

// The interaction reducer as a React hook. Surfaces dispatch genuine local
// events (voice, connectivity, submit) and canonical responses; the view is
// always derived, never stored.
export function useOyiInteraction(init?: { online?: boolean }): [OyiInteractionView, (event: OyiInteractionEvent) => void, OyiInteractionModel] {
  const [model, dispatch] = useReducer(interactionReducer, init, (value) => createInteractionModel(value || {}));
  const view = useMemo(() => deriveInteractionView(model), [model]);
  return [view, dispatch, model];
}

// Feeds browser connectivity into the reducer.
export function useOyiConnectivity(dispatch: (event: OyiInteractionEvent) => void) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const update = () => dispatch({ type: "connectivity.changed", online: window.navigator.onLine !== false });
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, [dispatch]);
}

function useMediaQuery(query: string, fallback = false) {
  const [matches, setMatches] = useState(fallback);
  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener?.("change", update);
    return () => media.removeEventListener?.("change", update);
  }, [query]);
  return matches;
}

export function useOyiReducedMotion() {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

// Animations pause while the document is hidden (background tab / app).
export function useOyiPageVisible() {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    if (typeof document === "undefined") return;
    const update = () => setVisible(document.visibilityState !== "hidden");
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);
  return visible;
}

export type OyiLayoutClass = "mobile" | "tablet" | "desktop";
export const OYI_LAYOUT_BREAKPOINTS = Object.freeze({ tablet: 768, desktop: 1024 });

export function oyiLayoutForWidth(width: number): OyiLayoutClass {
  if (width >= OYI_LAYOUT_BREAKPOINTS.desktop) return "desktop";
  if (width >= OYI_LAYOUT_BREAKPOINTS.tablet) return "tablet";
  return "mobile";
}

export function useOyiLayout(): OyiLayoutClass {
  const tablet = useMediaQuery(`(min-width: ${OYI_LAYOUT_BREAKPOINTS.tablet}px)`);
  const desktop = useMediaQuery(`(min-width: ${OYI_LAYOUT_BREAKPOINTS.desktop}px)`);
  return desktop ? "desktop" : tablet ? "tablet" : "mobile";
}

const FOCUSABLE = 'button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';

// Dialog focus management (promoted from Facility's OyiInteractionShell):
// initial focus, Tab/Shift+Tab containment, Escape to close, focus return.
export function useOyiFocusTrap(options: {
  active: boolean;
  containerRef: RefObject<HTMLElement | null>;
  initialFocusRef?: RefObject<HTMLElement | null>;
  returnFocusRef?: RefObject<HTMLElement | null>;
  onEscape?: () => void;
}) {
  const onEscapeRef = useRef(options.onEscape);
  useEffect(() => { onEscapeRef.current = options.onEscape; }, [options.onEscape]);
  const { active, containerRef, initialFocusRef, returnFocusRef } = options;
  useEffect(() => {
    if (!active || typeof document === "undefined") return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    initialFocusRef?.current?.focus({ preventScroll: true });
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && onEscapeRef.current) {
        event.preventDefault();
        onEscapeRef.current();
        return;
      }
      if (event.key !== "Tab" || !containerRef.current) return;
      const focusable = Array.from(containerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      (returnFocusRef?.current || previouslyFocused)?.focus?.({ preventScroll: true });
    };
  }, [active, containerRef, initialFocusRef, returnFocusRef]);
}

// Stable turn ids for turn.submitted / turn.response pairing.
export function useOyiTurnIds() {
  const counter = useRef(0);
  return useCallback(() => {
    counter.current += 1;
    return `turn-${Date.now().toString(36)}-${counter.current}`;
  }, []);
}
