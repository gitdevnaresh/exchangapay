export interface WhiteListAddress {
    id: string;
    favouriteName: string;
    currency: string;
    network: string;
    walletaddress: string;
    createdBy: string;
    proofType: string | null;
    otherWallet: string | null;
    whiteListState: string;
    whiteListRemarks: string | null;
    rejectReason: string | null;
    reason: string | null;
    addressType: string | null;
    status: string;
    businessRegistrationNumber: string | null;
    businessType: string | null;
    walletSource: string | null;
    customerId: string | null;
    info: string | null;
}