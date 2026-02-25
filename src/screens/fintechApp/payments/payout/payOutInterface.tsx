export type fiatSummeryObj = {
  id: string;
  customerId: string;
  merchantId: string;
  merchantName: string;
  invoiceType: string;
  orderId: string;
  amount: number;
  currency: string;
  networkName: string;
  dueDate: string;
};
export interface SummeryObj {
  customerId: string;
  customerWalletId: string;
  amount: number;
  fiatCurrency?: string;
}
export interface CryptoSummery {
  customerId: string;
  customerWalletId: string;
  amount: number;
}
export interface PostObj {
  createdby: string;
  feeComission: number|undefined;
  merchantId: string;
  customerId: string;
  customerWalletId: string;
  requestedAmount: number|undefined;
  finalAmount: number |undefined;
  payeeId: string;
  fiatCurrency?: string;
  quoteId?: string;
  [key:string]:any;
}
export interface MerchantsDetail {
  coin: string;
  code: string;
  logo: string;
  balance: number;
  oneCoinValue: number;
  networks: Network[];
}
export interface Network {
  name: string;
  code: string;
  logo: string;
  balance?: string | number;
  minLimit: number;
  maxLimit: number;
  customerWalletId: string;
}
export interface MarchantList {
    id: string;
    customerId: string;
    customerName?: any;
    merchantName: string;
    marchantTotalBanlance: number;
    isDefault?: any;
    createdBy?: any;
    modifiedBy?: any;
    createdDate: string;
    modifiedDate?: any;
    amountInUSD: number;
    merchantsDetails: MerchantsDetail[];
    [key:string]:any;
  }
  export interface WalletData {
    id: string;                 
    customerId: string;         
    walletCode: string;         
    walletName: string | null;  
    netWork: string | null;     
    avilable: number;           
    logo: string;               
    referenceId: string | null; 
    recorder: number;           
    percent_change_1h: number; 
  }
export interface IPayOutFormState {
  values: {
    merchantId: string;
    currency: string;
    networkName: string;
    payee: string;
    amount: number | null;
    customerWalletId: string;
    fiatCurrency: string;
    finalAmount: number | null;
    fee: string;
    flatFee: string;
    type: string;
    payeeName: string;
  };
  dataLoader: boolean;
  buttonLoader: boolean;
  fiatCurrencyLoader: boolean;
  summeryLoader: boolean;
  lookups: {
    vaults: MarchantList[]; 
    currency: string[]; 
    network: string[]; 
    payeeLu: string[]; 
  };
  fiatCoins: string[]; 
  errors: string | null; 
}
export interface FeeInfo {
  Fee: string; 
  FlatFee: string; 
}


export interface SummeryData {
  expiresIn: string; 
  feeCommission: number; 
  feeInfo: FeeInfo; 
  finalAmount: number; 
  quoteId: string; 
  requestedAmount: number; 
}
export interface TransactionResponse {
  amount: number;
  id: string;
  logo: string;
  merchantName: string;
  network: string;
  status: string;
  transactionDate: string;
  transactionType: string;
  trasactionOrderId: string;
  txId: string;
  value: number;
  wallet: string;
}
export interface TransactionList {
  amount: number;
  id: string;
  logo: string;
  merchantName: string;
  network: string;
  status: string;
  transactionDate: string;
  transactionType: string;
  trasactionOrderId: string;
  txId: string;
  value: number;
  wallet: string;
}
export interface Coin {
  avilable: number,
  customerId: string,
  id: string,
  logo: string,
  code:string|null,
  netWork: string | null,
  recorder: number,
  referenceId: string | null,
  walletCode: string,
  walletName: string | null,
};
export interface LoadingState {
  payeeLoading: boolean;
  btnLoading: boolean;
  isSelectedPayee: boolean;
};
export interface CoinInfo {
  balance: number;
  code: string;
  coinName: string;
  customerWalletId: string;
  id: string;
  logo: string;
  maxLimit:number;
  minLimit: number;
  name: string;
}
export interface LimitInfo {
  minLimit: string|number;
  maxLimit:string| number;
}