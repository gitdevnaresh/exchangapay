export interface RewardsTopic {
    id: string | number;
    name: string;
    title?: string;
    description?: string;
    category?: string;
    heading?: string; // Kept for LiveSearch compatibility
    [key: string]: any;
};

export interface KpiDetails {
    id: string;
    cashBackEarned: string;
    pending: string;
    approved: string;
    completed: string;
    cashBackCurrency: string;
    currency: string;
    minimumWithdraw: number;
};

