  export interface receiveInterrface { // Renamed from NetworkDetails to be specific to getDepositData response
    code: string; // e.g., "USDT"
    address: string;
    network: string; // e.g., "TRC-20"
    logo: string;
    networkName: string; // e.g., "Tether"
    info: string | null;
    amount: number;
    depositMinimumamount: number;
    walletCode?: string;
  };

    export interface receiveFromWalletInterface { // For items in coinWithCurrenyList from WithDrawServices.getWalletNetwork
    address: string;
    amount: number;
    amountInUsd: number;
    chainId: string | null;
    code: string;
    decimals: number | null;
    hexId: string | null;
    id: string;
    coinCode: string;
    maxLimit: number;
    minLimit: number;
    multiSendAddress: string | null;
    name: string;
    note: string;
    walletCode?: string;

    logo?: string; // Added as it might be useful or present
  };