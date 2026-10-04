import { type RefObject } from "react";
import { type OyiInteractionEvent, type OyiInteractionModel, type OyiInteractionView } from "../core/interactionState.js";
export declare function useOyiInteraction(init?: {
    online?: boolean;
}): [OyiInteractionView, (event: OyiInteractionEvent) => void, OyiInteractionModel];
export declare function useOyiConnectivity(dispatch: (event: OyiInteractionEvent) => void): void;
export declare function useOyiReducedMotion(): boolean;
export declare function useOyiPageVisible(): boolean;
export type OyiLayoutClass = "mobile" | "tablet" | "desktop";
export declare const OYI_LAYOUT_BREAKPOINTS: Readonly<{
    tablet: 768;
    desktop: 1024;
}>;
export declare function oyiLayoutForWidth(width: number): OyiLayoutClass;
export declare function useOyiLayout(): OyiLayoutClass;
export declare function useOyiFocusTrap(options: {
    active: boolean;
    containerRef: RefObject<HTMLElement | null>;
    initialFocusRef?: RefObject<HTMLElement | null>;
    returnFocusRef?: RefObject<HTMLElement | null>;
    onEscape?: () => void;
}): void;
export declare function useOyiTurnIds(): () => string;
