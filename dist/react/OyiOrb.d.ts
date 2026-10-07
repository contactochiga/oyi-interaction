import { type OyiOrbState } from "../core/orbContract.js";
export type OyiOrbProps = {
    state: OyiOrbState;
    size?: "icon" | "small" | "medium" | "large";
    onActivate?: () => void;
    actionLabel?: string;
    controlsId?: string;
    expanded?: boolean;
    hasPopup?: "dialog" | "menu";
    className?: string;
};
export declare function OyiOrb({ state, size, onActivate, actionLabel, controlsId, expanded, hasPopup, className }: OyiOrbProps): import("react").JSX.Element;
