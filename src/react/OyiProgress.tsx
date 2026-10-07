"use client";

// Temporary progress presentation: renders ONLY the known steps from
// oyiProgressSteps(); renders nothing when the list is empty. No timers.
import type { OyiProgressStep } from "../core/progress.js";

export function OyiProgress({ steps, className }: { steps: OyiProgressStep[]; className?: string }) {
  if (!steps.length) return null;
  return (
    <ol className={["oyi-progress", className].filter(Boolean).join(" ")} aria-label="Progress">
      {steps.map((step) => (
        <li key={step.key} className="oyi-progress-step" data-state={step.state} aria-current={step.state === "active" ? "step" : undefined}>
          <span className="oyi-progress-dot" aria-hidden="true" />
          <span className="oyi-progress-label">{step.label}</span>
        </li>
      ))}
    </ol>
  );
}
