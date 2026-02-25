import RBSheet from 'react-native-raw-bottom-sheet';

export interface UserDetails {
    isEmployee?: boolean;
    businessReferralCode?: string;
    referralFullName?: string;
    referralCustomerId?: string;
    customerReferralFullName?: string;
    customerReferralCode?: string;
    metadata?: {
        chooseAccount?: {
            mobile?: {
                chooseAccount?: string;
            };
        } | string;
        IsReferralMandatory?: boolean;
        IsReferralRequiredOrNot?: boolean;
    };
}

export interface ReferralData {
    name?: string;
    isBusiness?: boolean;
    id?: string;
}

export interface AccountTypeItem {
    id: string;
    accountType: string;
    name: string;
    message?: string;
    isChecked: boolean;
    disable: boolean;
}

export type RootStackParamList = {
    CustomerRigister: {
        accountType: "Corporate" | "Personal" | "Business";
        referralCode?: string;
    };
};

export interface CountryListItem {
    name: string;
    code: string;
}

export interface PhoneCodeListItem {
    name: string;
    code: string;
}

export interface RegFormValues {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    country: string;
    businessName: string;
    phoneCode: string;
    gender: string;
    state: string;
    city: string;
    addressLine1: string;
    postalCode: string;
    incorporationDate: Date | null;
    isAccepted: boolean;
}

export interface CustomerProfileData {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    country?: string;
    phoneCode?: string;
    businessName?: string;
    gender?: string;
    state?: string;
    city?: string;
    addressLine1?: string;
    postalCode?: string;
    incorporationDate?: string | Date;
    isAddressRequiredWhileSignup?: boolean;
}

export interface UserInfo {
    isEmployee?: boolean;
    firstName?: string;
    lastName?: string;
    phoneNo?: string;
    country?: string;
    phonecode?: string;
    accountType?: "Personal" | "Business" | "Corporate";
    kycStatus?: string;
    id?: string;
    email?: string;
    customerState?: string;
     metadata?: any;
    reason?:string;
    remarks?:string;
    kycRemarks?:string;
    reKYC?:string;
    
}

export interface RootState {
    userReducer: {
        userDetails: UserInfo | null;
        referralCode?: string;
        appTheme?: string;
    };
}

export type CustomerRigisterRouteParams = {
    accountType: "Personal" | "Business" | "Corporate";
    referralCode?: string;
    referralId?: string;
    isEdit?: boolean;
};

export type LocalRootStackParamList = {
    CustomerRigister: CustomerRigisterRouteParams;
    ChooseAccountType: undefined;
    AccountProgress: undefined;
    KybCompanyData: undefined;
    KycProfile: { firstName?: string; lastName?: string };
    Dashboard: undefined;
    SplaceScreenW2: undefined;
};

export interface VerifyEmailProps {
    route?: {
        params?: {
            email?: string;
        };
    };
}

export interface AccountTypesResponse {
    ok: boolean;
    data?: {
        AccountTypes?: Array<{
            code: string;
            remarks?: string;
        }>;
    };
}

export interface ReferralCodeResponse {
    ok: boolean;
    data?: ReferralData & {
        isBusiness?: boolean;
    };
}

export interface ThemeColors {
    REFERRAL_TEXT: string;
    INPUT_BORDER: string;
    [key: string]: string;
}

export interface GenderOption {
    label: string;
    value: string;
}

export interface RBSheetRef {
    open: () => void;
    close: () => void;
}

export type RBSheetRefType = RBSheet;

export interface LookupResponse {
    ok: boolean;
    data?: {
        Gender?: { name: string }[];
    };
}

export interface PrivatePolicyResponse {
    ok: boolean;
    data?: {
        templateContent: string;
        renderTarget: string;
    };
}

export interface MemberInfo {
    customerState?: string;
    firstName?: string;
    lastName?: string;
    phoneNo?: string;
    [key: string]: unknown;
}

export interface MemberInfoResponse {
    data: MemberInfo;
}

export interface userLoginInfoProps {
    data?: {
        customerState?: string | undefined;
    };
}

export interface ForgotPasswordResponse {
    status?: number;
    success?: boolean;
}

export interface UserMetadata {
    IsSumsubShowOnPending?: boolean;
}

export interface UserData {
    metadata?: UserMetadata;
    customerState?: string;
}

export interface MemberInfoUserResponse {
    data: UserData;
}

//Mfa
export interface MfaLoginResult {
    data: string;
}

export interface ParsedMfaData {
    access_token?: string;
    error_description?: string;
    error?: string;
}

export interface MfaEnrollmentResult {
    success?: boolean;
    barcodeUri?: {
        barcode_uri: string;
    };
    secret?: string;
    error?: string;
    status?: number;
}



export interface SigninResponse {
  status: number;
  data: string;
}

export interface ParsedSigninData {
  error?: string;
  error_description?: string;
  mfa_token?: string;
  access_token?: string;
  refresh_token?: string;
}

export interface Auth0ErrorDetails {
  error?: string;
  error_description?: string;
}

 export interface ErrorWithParsedData {
  parsedData?: Auth0ErrorDetails;
}

export interface SignupBody {
  email: string;      // encrypted email
  password: string;   // encrypted password
  UserName: string;   // encrypted username
}

// Login request body
export interface LoginBody {
  email: string;      // encrypted email
  password: string;   // encrypted password
}
export interface SignupResponse {
  status: number;
  data?: {
    userId?: string;
  };
}

export interface SigninParsedResponse {
  access_token?: string;
  error?: string;
  error_description?: string;
  mfa_token?: string;
}

export interface SigninResponse {
  status: number;
  data: string;
}

//accessDenied
export interface AccessDeniedRouteParams {
    AccessDenied?: boolean;
}

export interface AccessDeniedProps {
    route?: {
        params?: AccessDeniedRouteParams;
    };
}
