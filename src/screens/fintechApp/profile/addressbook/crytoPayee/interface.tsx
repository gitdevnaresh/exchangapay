export interface RecipientDetailsSectionProps {
    values?: any;
    touched?: any;
    errors?: any;
    handleBlur?: any;
    handleChange?: any;
    setFieldValue?: any;
    nameRef?: any;
    countryCodelist?: any;
    NEW_COLOR?: any;
    commonStyles?: any;
    t?: any;
    handlePhoneCode: (item: any, setFieldValue: any) => void;
    props?: any;
    userProfile: (value: any) => void;
    countries?: any
    setCountryStates?: any
    setFieldError?: any
    formik?: any,
    countryStates?: any,
    currentCountry?: any,
    formatState: (state: any) => any;
    propsUpdateId?: any;
    screenName?: string;
    getCryptoCoins: (value: any) => void;
    accountType?: string;
    recepientDynamicFeieldDetails?:any
    setErrors?:any;
}

export interface RecipientProfileDetails {
    firstName?: string;
    lastName?: string;
    email?: string| null|undefined;
    phoneNumber?: string| null|undefined;
    phoneCode?: string| null|undefined;
    dateOfBirth?: string | Date | null;
    dob?: string | Date | null;
    country?: string;
    businessName?: string;
}

export interface ListsInterface {
  coinsList: any[];        // replace any[] with proper model if available
  networksList: any[];
  sourceList: any[];
  proofTypesList: any[];
}

export interface SathosiTestDetailsInterface {
  coin?: string;
  network?: string;
  source?: string;
  address?: string;
  amount?: number;
  proofType?: string;
  documentUrl?: string;
}

export interface PayeeDetailsInterface {
  [key: string]: any;
}

 interface CountryCodeItem {
  [key: string]: any;
}

export type CountryCodeList = CountryCodeItem[];

interface AccountType {
  [key: string]: any;
}

export type AccountTypesLuInterface = AccountType[];

interface CountryItem {
  [key: string]: any;
}

export type CountriesInterface = CountryItem[];


export interface LookUpDataInterface {
  [key: string]: any;
}


interface CountryStateItem {
  [key: string]: any;
}

export type CountryStatesInterface = CountryStateItem[] | undefined;


export interface CurrentCountryInterface {
  [key: string]: any;
}



