export interface Notification {
    action: string;
    customerId: string;
    id: string;
    message: string;
    notificationType: string | null;
    date: string;
    transactionId: string | number;
    actionBy: string;
    notifiedDate: string;
}
export const CONSTS = {
    DASHBOARD: "Dashboard",
    ADD_DETAILS: "Additional Details",
    TRANSACTION_ID: "Transaction ID:",
    NOTIFICATIONS: "Notifications",
    DATE: "Date:",
    NO_DATA_AVAILABLE: "No data available",
};

export interface Icons {
    name: string;
    flag: string | null;
    length: number;
    logo: string | null;
    recorder: number;
}