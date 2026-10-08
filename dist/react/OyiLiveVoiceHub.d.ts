import type { OyiLiveVoiceSnapshot } from "../core/liveVoice.js";
/** Non-modal dock panel; never owns transport, authority or a second composer. */
export declare function OyiLiveVoiceHub({ state, levels, onEnd, onMute, onResume }: {
    state: OyiLiveVoiceSnapshot;
    levels?: readonly number[];
    onEnd: () => void;
    onMute: () => void;
    onResume: () => void;
}): import("react").JSX.Element | null;
