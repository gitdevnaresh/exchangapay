import { RouteProp } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"

export interface AssetList {
    id: string,
    walletCode: string,
    logo: string,
    avilable: number
}
export interface AddContact {
    createddate: string | any
    currencyType: string
    customerId: string
    favouriteName: string
    id: string
    modifiedBy: string
    modifiedDate: string | any
    network: string
    saveWhiteListName: string
    status: string
    token: string
    userCreated: string | any
    walletAddress: string
    walletCode: string
    whiteListState: string | null
    whiteilstRemarks: string | null
}
export interface SummryObj {
    customerId: string,
    customerWalletId: string,
    walletCode: string,
    toWalletAddress: string,
    totalValue: number | null,
    addressbookId: string,
    network: string,
    comission: number | null,
    memberWalletId: string,
    sbCredit: string,
    tierDiscount: number,
    totalFee: number | null,
    walletAddress: string,
    amount: number | null,
    feeComission: number | null,
    createdBy: any,
    PhoneNo: any,
    emailCode: any
}
export interface CryptoDetails {
    customerId?: string,
    addressBookId?: string,
    amount?: number | null,
    address?: string,
    coin?: string,
    network?: string,
    coinBalance?: string,
    saveWhiteListName?: string,
    id?:string,
    code?:string,
    name?: string,
    logo?: string
};

export const ADDPAYEE_CONSTANTS = {
    HARDWARE_BACK_PRESS: 'hardwareBackPress',
    SOURCE_TYPE: "Source Type",
}

export interface PayeesAddress {
    amount: number,
    email: string,
    entryNote: string,
    id: string,
    recipientAddress: string,
    recipientName: string,
    customerId?: string,
    walletCode?: string,
    network?: string,
    name?: string,
    walletAddress?: string,
    createdDate?: string,
    favoriteName?: string,
};
export interface Networks {
    address: string,
    amount: number | string,
    chainId: string | null,
    code: string,
    decimals: string | null,
    hexId: string | null,
    id: string,
    maxLimit: number | string,
    minLimit: number | string,
    name: string,
    multiSendAddress?: string | null,
    balance?: number,
}

export const CRYPTOPAYEES = {
    PAYMENTLINK: "paymentLink",
    SEND_CRYPTO_PREVIEW: "sendCryptoPreview",
    SEND_WALLE_PREVIEW: "SendWalletPreview",
    WITHDRAW: "Withdraw",
    RECENT_ADDRESSES: "Recent Addresses",
    NO_DATA_AVAILABLE: "No Data Available",
    ADD_CRYPTO_PAYEE: "addCryptoPayee",
    PLEASE_ENTER_AMOUNT: "Please Enter Amount.",
    AMOUNT_MUST_BE_GREATER_THAN_ZERO: " Amount must be greater than zero.",
    PLEASE_ENTER_VALID_AMOUNT: "Please enter valid amount.",
    YOU_HAVE_ENTERD_AN_AMOUNT_BELOW: "You have entered an amount below the minimum withdrawal. The minimum amount is",
    INSUFFIECIENT_BALANCE: "Insufficient Balance .",
    WALLET_SEND: "Walletsend",
    NETWORK: "Network",
    SELECT_NETWORK_LABEL: "Select Network",
    I_WANT_TO_WITHDRAW: 'I Want to Withdraw ',
    CONTINUE: "Continue",
    SELECT_NETWORk: "Select Network",
    SELECT_COIN: "Select Coin",
    VAULT: "Vault",
    NUMERIC: "numeric",
    AMOUNT: "Amount",
    AVAILABLE_BALANCE: "Available Balance : ",
    MIN: "Min : ",
    MAX: "Max : ",
    SELECT_ADDRESS: "Select Address",
    ADDRESSES: "Addresses",
    PLUSE: "plus",
    SELECT_NETWORKS: "Select Network",
    CLOSE: "close",
    TRANSAPARENT: "transparent",
    WITHDRAW_SUMMARY: "Withdraw Summary",
    ADD_CONTACT_COMPONENT: "AddContact",
    FEE: "Fee",
    FLAT_FEE: "Flat Fee",
    WALLET_SEND_SUCCESS: "WalletSendSuccess",
    SEND_NOW: "Send Now",
};
export interface LoadersState {
    summryLoading: boolean,
    btnDisabled: boolean,
};
export const SUCCESSPAGE_CONSTANTS = {
    CARDS_CYYPTO: 'cardsCrypto',
    CARDS_CYYPTO_COMPONENT: 'CardsCrypto',
    SELECT_ASSET: 'SelectAsset',

}
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
    navigation: NativeStackNavigationProp<any, any>,
    route: RouteProp<any, any>,
}
export interface LoadingState {
    addressListLoader: boolean;
    btnLoading: boolean;
    isSelectedPayee: boolean;
};
export interface PayeeObj {
    payeeId: string | number | undefined;
    amount: string | number | undefined;
    cryptorWalletId: string;
    fiatCurrency:string|number|undefined|null;
};
export interface CryptoObj {
    customerWalletId: string | undefined;
    amount: string | number | undefined;
    fiatCurrency:string|number|undefined|null;
    payeeId?:any;
    metadata?:string;
    moduleType?:string;



};
export interface FiatObj {
    customerId: string | number | undefined;
    customerWalletId: string | undefined;
    amount: string | number | undefined;
    fiatCurrency: string | number | undefined;
    metadata?:string;
    moduleType?:string;
};

export interface SaveObj {
    id: string;
    createdby: string;
    addressbookId: string | undefined;
    feeComission: number | undefined;
    customerId: string;
    memberWalletId: string | undefined;
    network: string | undefined;
    walletAddress: string | undefined;
    amount: number | undefined;
    walletCode: string | undefined;
    payeeId: string | undefined;
    cryptorWalletId: string | undefined;
};

export interface MarchentDetails {
    amountInUSD: number;
    balance: number;
    code: string;
    coin: string;
    coinName: string;
    id: string | null;
    logo: string;
    networks: any | null;
    oneCoinValue: number;
}

interface MarchantsList {
    amountInUSD: number;
    createdBy: string | null;
    createdDate: string;
    customerId: string;
    customerName: string | null;
    id: string;
    isDefault: boolean | null;
    marchantTotalBanlance: number;
    merchantName: string;
    merchantsDetails: MarchentDetails[];
    modifiedBy: string | null;
    modifiedDate: string | null;
};

export interface VaultsList {
    vaultsList: MarchantsList[],
    vaultsPrevList: MarchantsList[],
};

export interface CoinsList {
    coinsList: MarchentDetails[],
    coinsPrevList: MarchentDetails[]
};

export interface Lists {
    coinsList: MarchentDetails[],
    coinsPrevList: MarchentDetails[],
    vaultsList: MarchantsList[],
    vaultsPrevList: MarchantsList[],
};
export interface Loaders {
    addModelVisible: boolean,
    isDataLoading: boolean
};






