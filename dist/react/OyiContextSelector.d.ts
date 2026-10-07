export type OyiContextOption = {
    id: string;
    label: string;
    detail?: string | null;
    active: boolean;
};
export declare function OyiContextSelector({ options, onSelect, busy, label, placeholder, className }: {
    options: OyiContextOption[];
    onSelect: (option: OyiContextOption) => void;
    busy?: boolean;
    label?: string;
    placeholder?: string;
    className?: string;
}): import("react").JSX.Element;
