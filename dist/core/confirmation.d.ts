export type OyiConfirmationProposal = {
    proposal: string;
    targetLabel: string | null;
};
export declare function confirmationProposal(raw: unknown): OyiConfirmationProposal;
