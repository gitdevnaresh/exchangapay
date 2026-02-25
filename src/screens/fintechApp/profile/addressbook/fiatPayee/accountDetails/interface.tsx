export interface Loaders {
    btnDisabled: boolean,
    summryLoading: boolean,
    module: boolean
};

export interface BankDetails {
    routingNumber: string;    
    bankName: string;         
    bankAddress: string;    
    country: string;          
    state: string;           
    city: string;             
    branch: string;           
    zipCode: string;       
  }

  export interface DynamicFieldRendererProps {
  fields: any[];
  values: any;
  touched: any;
  errors: any;
  handleBlur: any;
  handleChange: any;
  setFieldValue: any;
  countryCodelist?: any;
  relationTypes?: any;
  countries?: any;
  states?: any;
  setCountryStates?: any;
  NEW_COLOR: any;
  commonStyles: any;
  t?: any;
  handlePhoneCode?: (item: any, setFieldValue: any) => void;
  recipentDetails?: any;
  isRecipientLoading?: boolean;
  props?: any;
  decryptAES?: (value: string) => string;
  addressType?:any;
  context: {
    isFirstParty: boolean;
    accountTypeDetails: string;
    addressTypeDetails: boolean;
  };
  isRelationTypeFeildDisplay?: boolean;
}



export interface RecipientDetailsSectionProps {
    values: any;
    touched: any;
    errors: any;
    handleBlur: any;
    handleChange: any;
    setFieldValue: any;
    nameRef: any;
    countryCodelist: any;
    relationTypes: any;
    NEW_COLOR: any;
    commonStyles: any;
    t: any;
    handlePhoneCode: (item: any, setFieldValue: any) => void;
    props: any;
    userProfile?: (value: any) => void;
    countries?: any;
    states?: any;
    setCountryStates?: any;
    setRelationTypes: any;
    lookUpData: any;
    setFieldError: any;
    fields?: any[];
    addressFields?: any[];
    dynamicRecipientDetails?:any;
    dynamicAddressDetails?:any;
    setInitValues?:any;
    setErrors?:any;
    setPaymentFeildInfo?:any;
    dynamicAddressTypeDetails?:any;
}
