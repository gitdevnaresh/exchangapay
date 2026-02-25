export const CREATE_CONST = {
    ACCOUNT: "Create Account",
    REVIEW_DEATAILS: "Review Details",
    ACCOUNT_ALREADY_EXIST: "Account already exist",
    PLEASE_SELECT_THE_DATE_OF_BIRTH: "Please select the date of birth",
    REVIEW_YOUR_DETAILS: "Review Your Details",
    IDENTIFICATION_DETAILS: " Identification Details",
    ADDRESS_DETAILS: "Address Details",
    FIRST_NAME: "First Name",
    COMPANY_NAME: "Company Name",
    LAST_NAME: "Last Name",
    PHONE: "Phone",
    EMAIL: "Email",
    CURRENCY: "Currency",
    DATE_OF_BIRTH: "Date of Birth",
    COUNTRY: "Country",
    COUNTRY1: "Country",
    CONFORM_AND_CONTINUE: "Confirm and continue",
    BEFORE_YOU_PROCEED: "Before you proceed",
    ACCOUNT_CREATION: "Account creation",
    MONTHLY_FEES: "Monthly fees",
    UNDER_CONSTRUCTION: "Under Construction",
    PENDING: "Pending",
    YOUR_ACCOUNT_CREATION_IS_IN_PROGRESS_CONTACT: "Your Bank Account creation is in progress Contact ",
    GO_BACK: "Go back",
    PASSPORT_NUMBER: "Passport Number",
    ADDRESS: "Address",
    ENTITY_TYPE: "Entity Type",
    BACK_TO_ACCOUNT: "Back to Account",
    SELECT_BANK: "Select Bank",
    BANK: "Bank",
    ADDRESS_TYPE: "Address Type",
    ADDRESS_TYPE_PLACEHOLDER: " Select Address Type",
    ADDRESS_LINE_VALIDATION: 'Address Line cannot contain HTML tags.',
    ADDRESS_LINE_EMOJIS_VALIDATION: 'Address Line cannot contain emojis.',
    SELECT_ADDRESS: "Select Address",
    USER_NAME: "User Name",
    ENTER_ADDRESS: "Enter Address",
    SELECT_COUNTRY: "Select Country",
    SELECT_STATE: "Select State",
    ENTER_PINCODE: "Enter Pin Code",
    ENTER_CITY: "Enter City",
    ENTER_PASSPORT_NUMBER: "Enter Passport Number",

}
export interface Banks {
    id: string;
    name: string;
    code: string;
    logo: string | null;
};

export interface Currency {
    id: string;
    name: string;
    code: string;
    logo: string;
}
export interface Lists {
    banksList: Banks[],
    currenciesList: Currency[],

}
export interface Loaders {
    isPayBtnLoading: boolean,
    isCreateBtnLoading: boolean
};

export interface CurrencyDetails {
    id: string;
    currency: string;
    code: string;
    logo: string;
    amount: number;
    amountInUSD: number | null;
    minLimit: number;
    maxLimit: number;
}

export interface PayWithWalletFiatLists {
    currenciesList: CurrencyDetails[],
    currenciesPrevList: CurrencyDetails[]
};

export interface FiatLoadingstate {
    currencyLoading: boolean,
    isActive: boolean,
    isCurencySelected: boolean,
    btnLoading: boolean
};
export interface PayWithWalletFiatConfirm {
    walletId: string;
    amount?: number;
    metadata?: any;
    documents?:{}
    address?:{}
    isTradingAddress?: boolean;
    director?:{}
    ubo?:{}
    ipAddress?: string;
    isReapply?: boolean;
    dob?:any;
    sector?:any;
    type?:any;
};

export interface FiatAccountSave {
    bankId: string;
    accountToCreate: string;
    payingWalletCoin: string;
    networkId: string | null;
    accountToCreateId: string;
    payingWalletId: string;
    network: string | null;
    payingWalletAddress: string | null;
    amount: number;
    payingWalletType: string;
    customerId: string;
    createdBy: string;
};
export interface CryptoSaveObj {
    customerId?: string;
    networkId?: string;
    network?: string;
    payingWalletCoin?: string;
    accountToCreate?: string;
    amount?: number;
    payingWalletAddress?: string;
    payingVaultName?: string;
};

export interface MerchantDetail {
    id?: string | null;
    coin?: string;
    code?: string;
    coinName?: string;
    logo?: string;
    balance?: number;
    oneCoinValue?: number;
    amountInUSD?: number;
    networks?: any;
}

export interface Merchant {
    id: string;
    customerId: string;
    customerName?: string | null;
    merchantName: string;
    marchantTotalBanlance: number;
    isDefault: boolean;
    createdBy?: string | null;
    modifiedBy?: string | null;
    createdDate: string;
    modifiedDate?: string | null;
    amountInUSD: number;
    merchantsDetails: MerchantDetail[];
};

export interface NetworkDetail {
    id: string;
    name: string;
    code: string;
    amount: number;
    minLimit: number;
    maxLimit: number;
    chainId?: string | null;
    hexId?: string | null;
    decimals?: number | null;
    address: string;
    logo: string;
    note?: string;
    multiSendAddress?: string | null;
    amountInUsd: number;
};

export interface PaywithCryptoLists {
    vaultsList: Merchant[],
    coinList: MerchantDetail[],
    coinListPrev: MerchantDetail[],
    networkList: NetworkDetail[],
};

export interface PayWIthCryptoSelectedItems {
    selectedVault: Merchant,
    selectedCoin: MerchantDetail,
    selectedNetwork: NetworkDetail
};
export const CRYPTO_CONSTANTS = {
    
   SEARCH_ICON: "search1"}
