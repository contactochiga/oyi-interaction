export type OyiSuggestionSource = "seed" | "awareness" | "backend";
export type OyiSuggestionIcon = "prompt" | "navigate" | "device" | "security" | "visitor" | "wallet" | "report" | "maintenance";
export type OyiSuggestionInput = {
    id?: string;
    label?: string;
    prompt?: string;
    value?: string;
    href?: string;
    route?: string;
    icon?: string;
    type?: string;
    [key: string]: unknown;
};
export type OyiSuggestion = {
    id: string;
    label: string;
    kind: "prompt" | "navigate";
    prompt: string | null;
    href: string | null;
    icon: OyiSuggestionIcon;
    source: OyiSuggestionSource;
};
export declare function normalizeOyiSuggestions(inputs: ReadonlyArray<OyiSuggestionInput | null | undefined>, options: {
    source: OyiSuggestionSource;
    max?: number;
}): OyiSuggestion[];
