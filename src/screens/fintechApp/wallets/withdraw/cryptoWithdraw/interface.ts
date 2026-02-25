export interface Coin {
  id: string;
  code: string;
  name: string;
  amount: number;
  image: string;
  amountInBase?: number;
  accountCreationFee?: number | null;
  accountStatus?: string | null;
  actionType?: string | null;
  coinCode?: string | null;
  kycState?: string | null;
  maxLimit?: number | null;
  minLimit?: number | null;
  note?: string | null;
  productId?: string | null;
  remarks?: string | null;
}

export interface CoinData {
  id: string;
  code: string;
  name: string;
  amount: number;
  amountInBase: number;
  image: string;
  coinCode?: string;
  accountCreationFee?: number | null;
  accountStatus?: string | null;
  actionType?: string | null;
  kycState?: string | null;
  maxLimit?: number | null;
  minLimit?: number | null;
  note?: string | null;
  productId?: string | null;
  remarks?: string | null;
}

export interface Payee {
    id: string;
    favoriteName: string;
    network: string; 
    currency: string; 
    state: string; 
    status: string; 
    type: string; 
    walletAddress: string;
}
  export interface Network {
    id: string;
    code: string;
    name: string;
    amount: number;
    minLimit: number;
    maxLimit: number;
  }
  

  export interface NetworkData {
    id: string;
    code: string; 
    name: string; 
    address: string; 
    amount: number | null; 
    minLimit: number; 
    maxLimit: number; 
    fee?: number;
    feeType?: string;
    amountInBase?: number | null; 
    image?: string;
    network?: string | null; 
    remarks?: string | null; 
    type?: string | null;
    coinCode?: string;
    accountCreationFee?: number | null;
    accountStatus?: string | null;
    actionType?: string | null;
    kycState?: string | null;
    note?: string | null;
    productId?: string | null;
}
  export interface Currency {
    currency: string;
  }
  
  export interface FormValues {
    amount: number | null;
    currency: string;
    network: string;
  }
  
  export interface OrderSummaryData {
    [key: string]: any;
  }

  export interface OrderSummaryData {
  amount: number;
  addressBookId: number;
  coin: string;
  feeCommission: number;
  networkId: string;
  network: string;
  address: string;
  customerWalletId: number;
  beforeDiscountCommission: number;
  requestedAmount: number;
  formValues?: FormValues;
  selectedPayee?: any;
  displayAsset?: any;
}

export interface SelectedAsset {
  id: string;
  code: string;
  name: string;
  amount: number | string;
  amountInBase?: number;
  image?: string;
  coinCode?: string;
  coinImage?: string;
  coinName?: string;
  networkName?: string;
  networkCode?: string;
  minLimit?: number;
  maxLimit?: number;
  fee?: number;
  feeType?: string;
}
export interface CryptoWithdrawSummaryProps {
    data: {
      amount: number;
      addressBookId: number;
      coin: string;
      feeCommission: number;
      networkId: string;
      network: string;
      address: string;
      customerWalletId: number;
      beforeDiscountCommission: number;
      requestedAmount: number;
      formValues?:any;
      selectedPayee?:any;
      displayAsset?:any;
    };
  }
  
  export interface VerificationFields {
    isPhoneVerified?: boolean;
    isEmailVerification?: boolean;
    isTwoFactorEnabled?: boolean;
  }
  
  export interface UserDetails {
    id: number;
    userName: string;
    phoneNumber?: string;
    phoneNo?: string;
  }
  
  export interface CryptoWithdrawSummaryState {
    otp: string;
    isOTP: string;
    emailOtp: string;
    isEmailOTP: boolean;
    isOTPVerified: boolean;
    isEmailOTPVerified: boolean;
    errormsg: string;
    btnDisabled: boolean;
    btnDtlLoading: boolean;
    showOtpError: boolean;
    showEmailOtpError: boolean;
    verficationFeild: VerificationFields;
    isAuthenticationOTP:any;
    isAuthenticationOTPVerified:any
    showAuthenticationOtpError: boolean;
  }
  export interface CryptoWithdrawalObject {
    amount: number;
    payeeId: string| number;
    cryptorWalletId: string;
  }