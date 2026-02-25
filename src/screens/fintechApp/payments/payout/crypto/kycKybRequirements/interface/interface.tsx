export interface CurrencyDetail {
  id?: string | null;
  parentId?: string | null;
  name: string;
  code?: string;
}

 export interface Currency {
  id: string;
  name: string;
  code: string;
  image?: string | null;
  recorder?: any;
  remarks?: any;
  states?: any;
  details?: CurrencyDetail[] | null;
  isMandatory?: boolean | null;
}

 export interface CountryDetail {
  id?: string | null;
  parentId?: string | null;
  name: string;
  code?: string;
}

export interface Country {
  id: string;
  name: string;
  code?: string | null;
  image?: string | null;
  recorder?: any;
  remarks?: any;
  states?: any;
  details?: CountryDetail[] | null;
  isMandatory?: boolean | null;
}

 export interface Document {
  id: string;
  name: string;
  code: string;
  image?: string | null;
  recorder?: any;
  remarks?: any;
  states?: any;
  details?: any;
  isMandatory?: boolean | null;
}

 export interface BusinessRegistrationProof extends Document {}

 export interface PaymentLookup extends Document {}

 export interface BusinessType {
  id: string;
  name: string;
  code: string;
  image?: string | null;
  recorder?: any;
  remarks?: any;
  states?: any;
  details?: any;
  isMandatory?: boolean | null;
}

 export interface Data {
  fiatCurrency: Currency[];
  cryptoCurrency: Currency[];
  Country: Country[];
  countryWithStates: Country[];
  Documents: Document[];
  BusinessRegistrationProof: BusinessRegistrationProof[];
  paymentlookup: PaymentLookup[];
  BusinessTypes: BusinessType[];
  Payout: Currency[];
}





// kyc requirements




export interface PersonName {
  firstName: string;
  lastName: string;
  businessName?: string | null;
}

export interface BasicContact {
  email: string;
  phoneNo: string;
  phoneCode: string;
  dob: string | null;
}

export interface AddressDto {
  addressId: string;
}

export interface DocumentDetails {
  id?: string;
  documentType?: string;
  documentFront?: string;
  documentBack?: string;
  documentNumber?: string;
  docExpiryDate?: string;
  frontImage?: string;
  backImage?: string;
  type?: string;
  docNumber?: string;
  documenttype?: string;
}

export interface UBO {
  id: string;
  productId?: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  uboPosition?: string;
  dob: string;
  phoneCode: string;
  phoneNumber?: string;
  companyName?: string | null;
  registrationNumber?: string | null;
  dateOfRegistration?: string | null;
  phoneNo?: string;
  email: string;
  shareHolderPercentage: number;
  addressDto?: AddressDto;
  country: string;
  note?: string;
  createdDate?: string;
  recordStatus?: string;
  docDetails?: DocumentDetails;
}

export interface DocumentType {
  type: string | null;
  blob: string | null;
}

export interface Document {
  id: string;
  fileName?: string | null;
  type: DocumentType;
  createdDate?: string | null;
}

export interface KyCPFC {
  id?: string;
  registrationDate?: string;
  businessType?: string | null;
  identificationNumber?: string;
}

 export interface KyB {
  id?: string;
  requirement?: string | null;
  fullName?: PersonName;
  basic?: BasicContact;
  addressDto?: AddressDto | null;
  kybpfc?: KyCPFC | null;
  ubo?: UBO[];
  documents?: Document[];
}

export interface KyC {
  requirement?: string | null;
  fullName?: PersonName | null;
  basic?: BasicContact | null;
  addressDto?: AddressDto | null;
  kybpfc?: KyCPFC | null;
}

export interface KycKyb {
  kyc: KyC;
  kyb: KyB;
}
export interface PersonalKycFormFieldsProps {
    touched: any;
    errors: any;
    handleBlur: any;
    values: any;
    setFieldValue: any;
    Lookups: any;
    addressesList: any[];
    imagesLoader: { frontId: boolean; backId: boolean };
    fileNames: { frontId: string | null; backId: string | null };
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
    countryList?:any[];
    initialFormData?:any;
}
