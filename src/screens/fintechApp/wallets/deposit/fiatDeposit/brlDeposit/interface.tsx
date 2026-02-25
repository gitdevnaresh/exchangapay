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

// KYC Form Interfaces
export interface KycFormData {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    phoneCode: string;
    birthDate: string;
    occupation: string;
    country: string;
    address: string;
    docType: string;
    docNumber: string;
    expiryDate: string;
    frontId: string;
    backId: string;
    taxIdNumber: string;
    selfie: string;
    productId: string;
}

export interface KycRequirements {
    kyc: {
        requirement: string;
    };
}

export interface KycSections {
    PersonalInformation: {
        firstName: string;
        lastName: string;
        email: string;
        phoneNumber: string;
        phoneCode: string;
        dateOfBirth: string;
    };
    Address: Array<{
        country: string;
        favoriteName: string;
    }>;
    IdentificationDocuments: Array<{
        documentType: string;
        documentNumber: string;
        expiryDate: string;
        frontDoc: string;
        backDoc: string;
    }>;
}

export interface KycFormDetailsResponse {
    sections: KycSections;
}

export interface AddressItem {
    id: string;
    favoriteName: string;
    name: string;
    [key: string]: any;
}

export interface PhoneCodeItem {
    code: string;
    name: string;
}

export interface FileNames {
    frontId: string | null;
    backId: string | null;
    selfie: string | null;
}

export interface ImagesLoader {
    frontId: boolean;
    backId: boolean;
    selfie: boolean;
}

export interface UserInfo {
    id: string;
    userName: string;
    [key: string]: any;
}

export interface ReduxState {
    userReducer: {
        userDetails: UserInfo;
    };
}

export interface RouteParams {
    VaultData?: {
        productId: string;
    };
}

export interface NavigationProp {
    navigate: (screen: string, params?: any) => void;
}

export interface PersonalKycFormProps {
    route: {
        params: RouteParams;
    };
}

export interface KycObject {
    kyc: {
        requirement: string;
        fullName: {
            firstName: string;
            lastName: string;
        };
        basic: {
            dob: string;
            email: string;
            phoneCode: string;
            phoneNo: string;
            occupation: string;
        };
        addressDto: {
            addressId: string;
        };
        kycpfc: {
            documentType: string;
            documentNumber: string;
            documentFront: string;
            documentBack: string;
        };
    };
}

export interface AddressObject {
    id: string;
    customerId: string;
    favoriteName: string;
    addressType: string;
    country: string;
    state: string;
    city: string;
    addressLine1: string;
    addressLine2: string;
    postalCode: string;
    phoneNumber: string;
    phoneCode: string;
    email: string;
    isDefault: boolean;
    createdBy: string;
    town: string;
    createdDate: Date;
}

export interface DocumentPickerResult {
    canceled: boolean;
    assets: Array<{
        uri: string;
        mimeType: string;
        name: string;
        size: number;
    }>;
}

export interface ImagePickerResult {
    canceled: boolean;
    assets: Array<{
        uri: string;
        type: string;
        fileName?: string;
        fileSize?: number;
    }>;
}

export interface UploadResponse {
    status: number;
    data: string[];
}

export interface LookupData {
    Occupations?: Array<{ name: string; code: string }>;
    Country?: Array<{ name: string; code: string }>;
    documentTypes?: Array<{ name: string; code: string }>;
}

export interface AddressData {
    id: string;
    favoriteName: string;
    [key: string]: unknown;
}

 export interface PhoneCodeData {
    PhoneCodes: PhoneCodeItem[];
}
export interface PersonalKycFormFieldsProps {
    touched: any;
    errors: any;
    handleBlur: any;
    values: any;
    setFieldValue: any;
    Lookups: any;
    addressesList: any[];
    imagesLoader: { frontId: boolean; backId: boolean; selfie: boolean };
    fileNames: { frontId: string | null; backId: string | null; selfie: string | null };
    setFileNames: (updater: (prev: any) => any) => void;
    handleUploadImg: (item: string, setFieldValue: any, source?: 'camera' | 'library' | 'documents') => void;
    handleAddAddress: () => void;
    maxDate: Date;
    commonStyles: any;
    NEW_COLOR: any;
    t: (key: string) => string;
    kycRequirements?: any;
    countryCodelist: any[];
    handlePhoneCode: (item: any, setFieldValue: any) => void;
}