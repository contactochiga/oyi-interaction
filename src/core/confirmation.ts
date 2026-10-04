// Proposal text for a pending confirmation, built only from the canonical
// confirmation object Backend returns (e.g. device_command_confirmation:
// label, channel_code, desired_state) or its explicit summary/prompt. The
// proposal describes what WOULD happen; nothing has been sent.

export type OyiConfirmationProposal = {
  proposal: string;
  targetLabel: string | null;
};

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function channelLabel(code: string) {
  const match = /^switch_(\d+)$/i.exec(code);
  return match ? `channel ${match[1]}` : "";
}

export function confirmationProposal(raw: unknown): OyiConfirmationProposal {
  const row = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const explicit = text(row.summary) || text(row.prompt);
  const label = text(row.label) || text(row.target_label) || null;
  if (explicit) return { proposal: explicit, targetLabel: label && !explicit.includes(label) ? label : null };
  if (row.type === "device_command_confirmation" && label && typeof row.desired_state === "boolean") {
    const channel = channelLabel(text(row.channel_code));
    return { proposal: `Turn ${row.desired_state ? "on" : "off"} ${channel ? `${channel} on ` : ""}${label}`, targetLabel: null };
  }
  return { proposal: "Approve this action?", targetLabel: label };
}
