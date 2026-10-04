"use client";

// Minimal proposal / confirmation primitive. Confirming is APPROVAL, not
// verification: this component never shows success. After a decision the
// surface renders OyiActionResult from canonical action truth instead.
export type OyiConfirmationProps = {
  // What Oyi proposes, in plain language ("Turn off Room 2 AC").
  proposal: string;
  // Target, only when safe to show to this user.
  targetLabel?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
  disabled?: boolean;
  confirmLabel?: string;
  cancelLabel?: string;
  className?: string;
};

export function OyiConfirmation({ proposal, targetLabel, onConfirm, onCancel, disabled, confirmLabel = "Confirm", cancelLabel = "Cancel", className }: OyiConfirmationProps) {
  return (
    <section className={["oyi-confirmation", className].filter(Boolean).join(" ")} data-oyi-confirmation="true" aria-label="Confirm action">
      <p className="oyi-confirmation-eyebrow">Confirm action?</p>
      <p className="oyi-confirmation-proposal">{proposal}</p>
      {targetLabel ? <p className="oyi-confirmation-target"><span className="oyi-visually-hidden">Applies to: </span>{targetLabel}</p> : null}
      <p className="oyi-confirmation-note">Nothing has been sent yet.</p>
      <div className="oyi-confirmation-actions">
        <button type="button" className="oyi-button" onClick={onCancel} disabled={disabled}>{cancelLabel}</button>
        <button type="button" className="oyi-button is-primary" onClick={onConfirm} disabled={disabled}>{confirmLabel}</button>
      </div>
    </section>
  );
}
