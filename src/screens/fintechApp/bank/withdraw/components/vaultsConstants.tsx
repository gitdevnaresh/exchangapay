import { RouteProp, NavigationProp } from "@react-navigation/native";

type IdType = string | number | undefined;
type OptionalString = string | undefined;
type AmountType = string | number | undefined;
export interface MerchantDetails {
    coin: string;
    code: string;
    logo: string;
    balance: number;

}

export interface Merchant {
    id: string;
    merchantName: string;
    marchantTotalBanlance: number;
    amountInUSD:number;
    merchantsDetails: MerchantDetails[];
};


export interface Merchants {
    vaultsList: Merchant[],
    vaultsPrevList: Merchant[],
};

export interface MerchentCoins {
    coinsList: MerchantDetails[],
    coinsPrevList: MerchantDetails[]
}

export interface PayeeObj {
    customerId: IdType;
    addressBookId: IdType;
    network: OptionalString;
    coin: OptionalString;
    amount: AmountType;
    address: OptionalString;
    info:string
};

export interface LoadingState {
    addressListLoader: boolean;
    btnLoading: boolean;
    isSelectedPayee: boolean;
};
export interface Currency {
    id: string;
    customerId: string;
    walletCode: string;
    walletName: string | null;
    netWork: string | null;
    avilable: number;
    logo: string;
    referenceId: string | null;
    recorder: number;
}


export const FIAT_CONSTANTS = {
    SEARCH_COIN: "Search Coin",
    SEND_AMOUNT: "SendAmount",
    PAYMENTLINK: "paymentLink",
    SEND_AMOUNTS: "SendAmounts",
    SEARCH_VAULT: 'Search Vault',
    NO_DATA_AVAILABLE: "No data available",
    SEARCH1: "search1",
    DASHBOARD: "Dashboard",
    PAY_OUT: 'Pay-Out',
    FIRST: "first",
    SECOND: "second",
    CRYPTO: "Crypto",
    FIAT: "Fiat",
    TRANSPARENT: "transparent",
    SEND_FIAT_WITHDRAW:"sendFiatWithdraw",
    PLEASE_ENTER_THE_AMOUNT: "Plase enter the amount.",
    PLEASE_ENTER_VALID_AMOUNT: "Please enter valid amount.",
    INSUFICIENT_FUND: "Insuficient funds.",
    SELECT_NETWORK: "Select network",
    NUMERIC: "numeric",
    TEXT_PLACEHOLDER: "0.00",
    CONTINUE: "Continue",
    AMOUNT:"Amount",
    CANCEL:'Cancel',
    FEE:"Fee",
   EXCHANGE_RATE: "Exchange Rate : ",
    TOTAL:"Total",
    SEND_NOW:"Send Now",
    SEND_CRYPTO_SUCCESS:"payoutCryptoSuccess",
    SELECT_CRYPTO_VAULT:"payoutDashboard",
    WITHDRAW_AGAIN:'Send  again',
    BACK_TO_HOME:'Back to Home',
    WITHDRAW_SUMMARY:"Withdraw Summary",
    PLUS_CIRCLE:"pluscircle",
    THANL_YOU:'Thank you !',
    YOUR_TRANSACTION_OF:"Your Transaction of",
    IS_SUCCESSFULLY_COMPLETED:"is Successfully Completed",
    SLIDE:"slide",
    VAULT:"Vault",
    COIN:"Coin",
    FIAT_SELECTION:"Select Fiat"

   
};
export interface Loaders {
    btnDisabled: boolean,
    summryLoading: boolean,
    coinsModel: boolean,
    fiatCoinsModel:boolean
};
export interface Coin {
    avilable: number,
    customerId: string,
    id: string,
    logo: string,
    netWork: string | null,
    recorder: number,
    referenceId: string | null,
    walletCode: string,
    walletName: string | null,
};
export interface Coins {
    address:string,
    logo:string,
    amount:AmountType,
    chainId: string,
    code: string,
    decimals: string,
    hexId: string,
    id: string,
    maxLimit: number,
    minLimit: number,
    name: string,
    multiSendAddress: string,
    customerWalletId:string,
};

export interface SavePayOutCryptoObj {
    customerId: string,
    memberWalletId: string,
    walletCode: string,
    network: string,
    walletAddress: string,
    amount: number,
    feeComission: number,
    addressbookId: string,
    createdby: string,
    info: string,
    payeeId:string,
};

export interface PaymentLinkProps {
    navigation: NavigationProp<any>;
    route: RouteProp<any, any>;
    walletCode?: string,
    coinCode?: string,
    available?: number,  
    logo?: string,
    networks?: string,
    merchantId?: string,
    screenName?: string,
    coin?:string,
   code?:string,
   balance?:string,
   maxLimit?:number,
   minLimit?:number,
   customerWalletId?:string,
  };

  export interface Coin {
    id: string,
    name: string,
    code: string,
    amount: number,
    minLimit: number,
    maxLimit: number,
    chainId?: string | null,
    hexId?: string | null,
    decimals?: number | null,
    address: string,
    multiSendAddress?: string | null
  };

  export interface PaymentFiatLinkProps {
    walletCode: string;
    coinCode: string;
    available: number;
    logo: string;
    network: string;
    merchantId: string;
    screenName: string;
    navigation: NavigationProp<any>;
    route: RouteProp<any, any>;
  };

  export interface PaymentLinCruptoWithdrawkProps {
    coinName: string,     
    coinCode: string,     
    available?: number,     
    logo?: string,         
    withdrawMin?: number,   
    network?: string,       
    merchantId?: string,   
    screenName: string,   
    vault?: string,
    navigation: NavigationProp<any>,
    route: RouteProp<any, any>,
  }
 

