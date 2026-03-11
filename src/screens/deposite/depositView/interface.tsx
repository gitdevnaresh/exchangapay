export interface cryptoCoin {
    id: string,
    walletCode: string,
    walletName: string,
    logo: string,
    note: string,
    amount: number | null,
    withdrawMin: number | null,
    withdrawMax: number | null,
    percentage: number | null
  };
  
  export interface DepositNetworkData { // Renamed from NetworkDetails to be specific to getDepositData response
    code: string; // e.g., "USDT"
    address: string;
    network: string; // e.g., "TRC-20"
    logo: string;
    networkName: string; // e.g., "Tether"
    info: string | null;
    amount: number;
    depositMinimumamount: number;
  };

  export interface NetworkFromWalletNetwork { // For items in coinWithCurrenyList from WithDrawServices.getWalletNetwork
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
    logo?: string; // Added as it might be useful or present
  };
  export interface DepositLoaders {
    addModelVisible: boolean,
    isDataLoading: boolean
  }
    export interface DepositData {
    assetsList: any[];
    errorMessage: string;
    coin: string;
    coinListLoader:boolean;
    merchantId:string
}

export interface RBSheetRefType {
    open: () => void;
    close: () => void;
}

export interface SelectedAsset {
  id: string;
  coinName: string;
  coinCode: string;
  coinImage: string;
  networkName: string;
  network: string;
  amount: number | null;
}

export interface DepositViewProps {
  route: {
    params: {
      walletCode: string; // e.g., "USDT"
      network: string;    // e.g., "TRC-20"
      logo?: string;      // URL for the coin logo
    };
  };
}