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
  
  export interface NetworkDetails {
    address: string;
    amount: number;
    amountInUsd: number;
    chainId: string | null;
    code: string;
    decimals: number | null;
    hexId: string | null;
    id: string;
    logo: string;
    maxLimit: number;
    minLimit: number;
    multiSendAddress: string | null;
    name: string;
    note: string;
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
  networkCode: string;
  amount: number | null;
}