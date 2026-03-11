export interface Network {
    id: string;
    name: string;
    code: string;
    minLimit: number;
    maxLimit: number;
    depositMinLimit: number;
    depositMaxLimit: number;
    address: string | null;
    amount: number;
    chainId: string | null;
    decimals: number | null;
    hexId: string | null;
    multiSendAddress: string | null;
    logo?: string; // The component uses this property, but it's not in the provided JSON
}
