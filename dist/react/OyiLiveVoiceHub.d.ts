import type { OyiLiveVoiceSnapshot } from "../core/liveVoice.js";
/** Standalone dock Orb. Session controls belong to the host's composer. */
export declare function OyiLiveVoiceHub({ state, onEnd, onResume }: {
    state: OyiLiveVoiceSnapshot;
    levels?: readonly number[];
    onEnd?: () => void;
    onMute?: () => void;
    onResume?: () => void;
}): import("react").JSX.Element | null;
