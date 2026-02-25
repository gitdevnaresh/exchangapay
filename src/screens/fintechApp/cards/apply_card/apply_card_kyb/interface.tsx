export interface CompanyFieldsProps {
  touched: any;
  errors: any;
  handleBlur: any;
  values: any;
  kybRequriments: any;
  handleChange?: any;
  setFieldValue?: any;
  setFieldTouched?: any;
  sectors?: any;
  types?: any;
  KybFeildInitialValues?:any;
}

export interface PersonalFieldsProps {
    touched: any;
    errors: any;
    handleBlur: any;
    values: any;
    kybRequriments: any;
    handleChange?: any;
    setFieldValue?: any;
    setFieldTouched?: any;
    countries?:any;
    countryCodelist?:any;
    documentTypesLookUp?:any;
    countryIdType?:any;
    fetchDocuments?:any;
    uboCountries?:any;
    uboFormDataList?:any;
    handleUboChange?: (selectedUbo: any, setFieldValue: any) => void;
    isdocTypeBasedOnCountry?:any;
    cardDocTypes?:any;
}


export interface CountryCodeInterface {
  [key: string]: string | number | boolean | null;
}

export interface documentTypesInterface {
  [key: string]: string | number | boolean | null;
}

export interface countriesInterface {
  [key: string]: string | number | boolean | null;
}
export interface addressesInterface {
  [key: string]: string | number | boolean | null;
}

export interface addressesDetailsInterface {
  [key: string]: string | number | boolean | null;
}

export interface CurrentFormValuesInterface {
  [key: string]: string | number | boolean | null | undefined;
}


export interface payloadInterface {
  company: Company;
  personaldetails: PersonalDetails;
  representatives: Representative[];
  directors: Director[];
  ubos: Ubo[];
}

/* ---------------------- Company ---------------------- */
export interface Company {
  companyName: string;
  type: string;
  description: string;
  industry: string;
  registrationNumber: string;
  taxId: string;
  website: string;
  certificateofincorporation: string;
  shareholderregistry: string;
  companyAddress: CompanyAddress;
}

export interface CompanyAddress {
  addressType: string;
  line1: string;
  line2: string;
  city: string;
  postalCode: string;
  country: string;
}

/* ---------------------- Personal Details ---------------------- */
export interface PersonalDetails {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  country: string;
  email: string;
  phoneCode: string;
  phoneNumber: string;
  identification: Identification;
  personalInfoAddress: PersonalInfoAddress;
  gender:string;
}

export interface Identification {
  idType: string;
  idNumber: string;
  countryOfIssue: string;
  docExpireDate: string;
  docIssueDate: string;
  frontDocument: string;
  backDocument: string;
}

export interface PersonalInfoAddress {
  line1: string;
  line2: string;
  city: string;
  postalCode: string;
  country: string;
  state: string;
  addressType: string;
}

/* ---------------------- Representatives ---------------------- */
export interface Representative {
  id: string;
  recordStatus: string;
  selfie: string;
  personDetails: PersonDetails;
  identification: RepresentativeIdentification;
  representativesAddress: RepresentativesAddress;
}

export interface PersonDetails {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  country: string;
  email: string;
  phoneCode: string;
  phoneNumber: string;
  shareHolderPercentage: string;
}

export interface RepresentativeIdentification {
  id: string;
  idType: string;
  idNumber: string;
  countryOfIssue: string;
  docExpireDate: string;
  docIssueDate: string;
  frontDocument: string;
  backDocument: string;
}

export interface RepresentativesAddress {
  addressType: string;
  line1: string;
  line2: string;
  city: string;
  postalCode: string;
  country: string;
}

/* ---------------------- Directors ---------------------- */
export interface Director {
  id: string;
  recordStatus: string;
  selfie: string;
  personDetails: PersonDetails;
  directorAddress: DirectorAddress;
  identification: DirectorIdentification;
}

export interface DirectorAddress {
  addressType: string;
  line1: string;
  line2: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface DirectorIdentification {
  id: string;
  idType: string;
  idNumber: string;
  docExpireDate: string;
  docIssueDate: string;
  frontDocument: string;
  backDocument: string;
}

/* ---------------------- UBO ---------------------- */
export interface Ubo {
  id: string;
  recordStatus: string;
  selfie: string;
  personDetails: PersonDetails;
  identification: UboIdentification;
  ubosAddress: UbosAddress;
}

export interface UboIdentification {
  idType: string;
  idNumber: string;
  countryOfIssue: string;
  docExpireDate: string;
  docIssueDate: string;
  frontDocument: string;
  backDocument: string;
}

export interface UbosAddress {
  addressType: string;
  line1: string;
  line2: string;
  city: string;
  postalCode: string;
  country: string;
}





