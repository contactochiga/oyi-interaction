"use client";

// Presentation only. Options and switching authority belong to the host.
// Native select supplies keyboard navigation, Escape and platform semantics.
export type OyiContextOption = { id: string; label: string; detail?: string | null; active: boolean };

export function OyiContextSelector({ options, onSelect, busy, label = "Active home", placeholder = "No home selected", className }: {
  options: OyiContextOption[];
  onSelect: (option: OyiContextOption) => void;
  busy?: boolean;
  label?: string;
  placeholder?: string;
  className?: string;
}) {
  const active = options.find((option) => option.active);
  if (options.length <= 1) return <div className={["oyi-context", className].filter(Boolean).join(" ")} data-mode="label"><span className="oyi-visually-hidden">{label}: </span><span className="oyi-context-label">{active?.label || placeholder}</span></div>;
  return <label className={["oyi-context", className].filter(Boolean).join(" ")}>
    <span className="oyi-visually-hidden">{label}</span>
    <select className="oyi-context-button" value={active?.id || ""} disabled={busy} onChange={(event) => {
      const selected = options.find((option) => option.id === event.target.value);
      if (selected && !selected.active) onSelect(selected);
    }}>
      {!active ? <option value="" disabled>{placeholder}</option> : null}
      {options.map((option) => <option key={option.id} value={option.id}>{option.label}{option.detail ? ` — ${option.detail}` : ""}</option>)}
    </select>
  </label>;
}
