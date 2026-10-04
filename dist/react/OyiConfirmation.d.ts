export type OyiConfirmationProps = {
    proposal: string;
    targetLabel?: string | null;
    onConfirm: () => void;
    onCancel: () => void;
    disabled?: boolean;
    confirmLabel?: string;
    cancelLabel?: string;
    className?: string;
};
export declare function OyiConfirmation({ proposal, targetLabel, onConfirm, onCancel, disabled, confirmLabel, cancelLabel, className }: OyiConfirmationProps): import("react").JSX.Element;
