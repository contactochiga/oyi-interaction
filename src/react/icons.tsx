// Minimal inline icons (no icon-library dependency). Decorative only:
// every control carries its own accessible label.
import type { SVGProps } from "react";

function Svg(props: SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" {...props} />;
}

export const IconPlus = () => <Svg><path d="M12 5v14M5 12h14" /></Svg>;
export const IconMic = () => <Svg><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></Svg>;
export const IconSend = () => <Svg><path d="M5 12h13M13 6l6 6-6 6" /></Svg>;
export const IconStop = () => <Svg><rect x="7" y="7" width="10" height="10" rx="1.5" /></Svg>;
export const IconClose = () => <Svg><path d="M6 6l12 12M18 6L6 18" /></Svg>;
export const IconArrow = () => <Svg><path d="M9 6l6 6-6 6" /></Svg>;
export const IconCheck = () => <Svg><path d="M5 12.5l4.5 4.5L19 7.5" /></Svg>;
export const IconAlert = () => <Svg><path d="M12 8v5M12 16.5v.5" /><circle cx="12" cy="12" r="9" /></Svg>;
export const IconDashed = () => <Svg><circle cx="12" cy="12" r="8" strokeDasharray="3 3" /></Svg>;
export const IconClock = () => <Svg><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></Svg>;
export const IconBan = () => <Svg><circle cx="12" cy="12" r="8.5" /><path d="M6 6l12 12" /></Svg>;
export const IconSpark = () => <Svg><path d="M12 4l1.8 5.2L19 11l-5.2 1.8L12 18l-1.8-5.2L5 11l5.2-1.8z" /></Svg>;
export const IconHistory = () => <Svg><path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4h4M12 8v4l3 2" /></Svg>;
