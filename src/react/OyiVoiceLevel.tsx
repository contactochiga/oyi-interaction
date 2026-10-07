"use client";

// Real input level meter. Renders nothing when no measured levels exist --
// it never draws a synthetic waveform.
export function OyiVoiceLevel({ levels, label = "Microphone input level", className }: { levels: readonly number[] | null | undefined; label?: string; className?: string }) {
  const measured = (levels || []).filter(Number.isFinite).slice(-64).map((level) => Math.max(0, Math.min(1, level)));
  if (!measured.length) return null;
  const latest = measured[measured.length - 1] ?? 0;
  return (
    <span className={["oyi-voice-level", className].filter(Boolean).join(" ")} role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(latest * 100)}>
      {measured.map((level, index) => (
        <span key={index} className="oyi-voice-level-bar" style={{ transform: `scaleY(${Math.max(0.08, Math.min(1, level))})` }} aria-hidden="true" />
      ))}
    </span>
  );
}
