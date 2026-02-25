import { NavigationProp, ParamListBase, RouteProp } from "@react-navigation/native";
import { AddressFormValues, AssetForSelector } from "./constants";

export interface ApplyCardList {

    name: string,
    value: string,
}

export interface Card { // Define the Card interface
    amount: number | null;
    image: string;
    metadata: any | null; // Consider creating a specific interface for metadata if its structure is known
    name: string;
    programId: string | null;
    state: string | null;
    type: string;
    supportedPlatforms?: any; // This seems to come from a different data source
    cardPrice?: number | null;
    currency?: string | null;
    cardCurrency?: string | null;
    cardName?: string | null;
    cardType?: string

}


export interface CardDetailsInterface {
    amount: number | null;
    image: string;
    metadata: any; // 👉 If you know the structure, replace `any`. Example: `Record<string, unknown>` or a proper interface.
    name: string;
    programId: string;
    state: string | null;
    type: string; // Could also be: 'Virtual' | 'Physical' if you want to restrict
}
export interface ApiResponse<T> {
    ok: boolean;
    data?: T;
    error?: string;
    status?: number; // Assuming status code is part of the response
}

export interface Coin {
    id: string;
    currencyCode: string;
    name: string;
    logo: string;
}
export interface Network<T> {
    ok: boolean;
    data?: T;
    error?: string;
}



export interface RBSheetRef {
    open: () => void;
    close: () => void;
}


export interface CardDetails {
    info?: { title: string; value: string, length?: number | undefined }[];
    note?: string;
    noteType?: string;
    rules?: { id: string; rule: string }[];
    kycRequirements?: string;
    isCustomerCreated?: boolean;
    kycType?: string;
}

export interface FaqItem {
    question: string;
    answer: string;
}


export interface UserDetailsInfo {
    id: string;
    userName: string;
    kycStatus: 'Draft' | 'Submitted' | 'Approved' | 'Rejected' | null;
    country: string;
    phoneNo: string;
    email: string; // This appears to be encrypted
    phonecode: string;
    accountType?: string | null;
}

export interface RootState {
    userReducer: {
        userDetails: UserDetailsInfo | null;
        applyCardData?: ApplyCardData | null;
        kycRequiredWhileApplyCard?: any;
        kybApplyCardData?: any;
        kycFormData?:any
    };
}

export interface KycDetails {
    customerId: string;
    cardId: string;
    firstName: string;
    lastName: string;
    addressLine1: string;
    city: string;
    state: string;
    country: string;
    town: string;
    idType: string;
    idNumber: string;
    profilePicFront: string;
    profilePicBack: string;
    signature: string;
    docExpiryDate: string;
    docIssueDate: string;
    dob: string;
    biometric: string;
    backDocImage: string;
    gender: string;
    kycRequirements: string;
    email: string;
    mobileCode: string;
    mobile: string;
    faceImage: string;
    handHoldingIDPhoto: string;
    emergencyContactName: string;
    postalCode: string;
    cardHandHoldingIDPhoto: string;
    occupation: string;
    ipAddress: string;
    annualSalary: number;
    accountPurpose: string;
    expectedMonthlyVolume: number;
    addressId?: string;
}



export interface ApplyCardData {
    KycUpdateModel?: KycDetails;

}

export interface CardRequirements {
    metadata: Record<string, string>;
    applyCarddetails?: CardDetails | null;
    kycRequiredWhileApplyCard?: boolean;
    kycRequirements: any;
    kybApplyCardData?: any;
}

export interface CardsFeeInfo {
    amountPaid?: number | null;
    paymentCurrency: string;
    cardCurrency?: string;
    cardType: 'Physical' | 'Virtual';
    cardName: string;
    logo?: string;
    issuingFee: number | string;
    firstRecharge: number | string;
    freightFee: number | string;
    estimatedPaymentAmount: number | string;
    paidNetwork?: string;
    envelopeNoRequired?: boolean;
    needPhotoForActiveCard?: boolean;
    additionaldocForActiveCard?: string | null;
}

// For Formik's setFieldValue function
export type FormikSetFieldValue = (field: string, value: any, shouldValidate?: boolean) => void;

export interface InternalCurrencySelectorProps {
    currencyList: AssetForSelector[];
    onSelect: (selectedItem: AssetForSelector, setFieldValue: FormikSetFieldValue) => void;
    currentSelectedCurrency: AssetForSelector | null;
    formikSetFieldValue: FormikSetFieldValue;
    commonStyles: any; // Assuming commonStyles is an object with various style properties
    NEW_COLOR: any; // Assuming NEW_COLOR is an object with various color properties
    s: (value: number) => number; // Assuming s is a scaling function
}


export type ApplyCardRouteParams = {
    cardId: string;
    logo?: string;
    cardName?: string;
    cardType?: string;
    supportedPlatforms?: string;
    isCustomerCreated?: boolean;
    refreshFromSumsub?: boolean;
    cardProcessType?: string;
    cardHolderStatus?: string;
};

export type ApplyCardRouteProp = RouteProp<{ ApplyCard: ApplyCardRouteParams }, 'ApplyCard'>;

export interface ApplyCardProps {
    route: ApplyCardRouteProp;
    navigation: NavigationProp<ParamListBase>;
}

export interface ApplyCardFormValues {
    handHoldingIdPhoto: string;
    cardNumber: string;
    envelopenumber: string;
    currency: string;
    network: string;
    membernumber?: string;
    address?: string,
    shippingAddressId?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    addressCountry?: string;
    town?: string;
    agreedToTerms?: boolean;

}
interface CountryDetail { name: string; code: string | null; }
export interface CountryWithDetails { name: string; code: string; details?: CountryDetail[]; }
export interface OccupationInterface {
    id: string | number;
    name: string;
    code?: string;
    description?: string;
}
export interface TownsList {
    name: string;
    code: string;
}
export interface StateList { name: string; code: string | null; }


export interface AddressFieldsProps {
    t: any; // translation function
    values: any;
    errors: any;
    touched: any;
    setFieldValue: (field: string, value: any) => void;
    handleBlur: (field: string) => void;
    handleAddAddress: () => void;
    handleEditAddress?: () => void;
    addresses?: any[];
    countries?: any[];
    statesList?: any[];
    townsList?: any[];
    kycDetailsRef?: any;
    type?: any // "address" = only address, "fulladdress" = all fields
    handleAddress: (value: any) => void;
    handleAddressCountry: (value: any, setFieldValue: any) => void;
    prefix?: 'personal' | 'company'; // Determines if it's personal or company addres
    addressInitialValues?: any;
}


export interface UserDetails {
    id: string;
    kycStatus?: string;
    customerState?: string;
    isInitialSubscriptionRequired?: boolean;
    isSubscribed?: boolean;
    accountType?: string;
    userName?:string;
}

export interface KybDetails {
    companyName?: string;
    country?: string;
    registrationNumber?: string;
    incorporationDate?: string;
    ubo?: UboDirectorItem;
    director?: UboDirectorItem;
    kycRequirements:any;
    company?:any;
    personaldetails?:any;
}

export interface BasicInfo {
    country?: string;
    phoneCode?: string;
    phoneNo?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
    middleName?: string;
    phoneNumber?:string;
}

export interface KycInfo {
    requirement?: string;
    basic?: BasicInfo;
}

export interface AddressDetails {
    lastName?: string;
    country?: string;
    state?: string;
    town?: string;
    city?: string;
    addressLine1?: string;
    addressLine2?: string;
    postalCode?: string;
    phoneCode?: string;
    phoneNumber?: string;
    email?: string;
}

export interface BusinessCustomerDetails {
    kybDocs?: KybDocument[];
    addressDetails?: AddressDetails;
}

export interface KybDocument {
    docType?: string;
    url?: string;
}

export interface UboDirectorItem {
    id: string;
    uboPosition?: string;
    firstname?: string;
    firstName?: string;
    lastName?: string;
    lastname?: string;
    middleName?: string;
    dob?: string;
    createdDate?: string;
    phoneCode?: string;
    phoneNumber?: string;
    country?: string;
    shareHolderPercentage?: number;
    email?: string;
    note?: string;
    frontId?: string;
    backImgId?: string;
    docType?: string;
    docDetailsid?: string;
    beneficiaryId?: string;
    beneficiaryName?: string;
    idIssuedCountry?: string;
    docNumber?: string;
    docExpiryDate?: string;
    registrationNumber?: string;
    isComplete?: boolean;
    isDirector?: boolean;
    isRepresentative?:boolean;
    docDetails?: {
        type?: string;
        frontImage?: string;
        backImage?: string;
        id?: string;
        idIssuedCountry?: string;
        docNumber?: string;
        docExpiryDate?: string;
    };
}

export interface PersonalDetails {
    kyb?: KybDetails;
    kyc?: KycInfo;
    businessCustomerDetails?: BusinessCustomerDetails;
    ubos?: UboDirectorItem[];
    directors?: UboDirectorItem[];
    kycRequirements?:any;
}

export interface DocumentData {
    passport?: PassportDocument;
    nationalId?: NationalIdDocument;
    shareholderregistry?: string;
    certificateofincorporation?: string;
}

export interface PassportDocument {
    docNumber?: string;
    docExpiryDate?: string;
    dateOfBirth?: string;
    frontImage?: string;
    backImage?: string;
    handHoldingImage?: string;
    selfieImage?: string;
    signatureImage?: string;
}

export interface NationalIdDocument {
    docNumber?: string;
    docExpiryDate?: string;
    frontImage?: string;
    backImage?: string;
}

export interface SelectedBank {
    productId: string;
}

export interface SelectedAddress {
    id: string;
    fullName: string;
    favoriteName: string;
}

export interface ReduxState {
    userReducer: {
        userDetails: UserDetails;
        uboCardFormData: UboDirectorItem[];
        directorCardFormData: UboDirectorItem[];
        selectedBank: SelectedBank;
        selectedAddresses: SelectedAddress[];
        documentsData: DocumentData;
        hasAccountCreationFee: boolean | string | number | null | undefined;
        ipAddress: string;
        deletedApiItems: string[];
        deletedCardsApiItems: string[];
        sectors: string;
        types: string;
        representativeFormDataList: any;
        kybFormValues:any;
        kycFormData?:any;
        userName?:string;
        
    };
}

export interface ApiResponse<T = unknown> {
    ok: boolean;
    data?: T;
}

export interface RouteParams {
    id?: string;
    addDirector?: boolean;
    isDirector?: boolean;
    clearForm?: boolean;
    cardId?: string;
    logo?: string;
    cardName?: string;
    cardType?: string;
    supportedPlatforms?: string;
    isCustomerCreated?: boolean;
    type?: string;
    cardPrice?: number | null;
    currency?: string | null;
    cardCurrency?: string | null;
    kycType?: string;
    cardProcessType?: string;
    screenName?: string;
}

export interface NavigationProps {
    route: {
        params: RouteParams;
    };
    navigation: {
        goBack: () => void;
        navigate: (screen: string, params?: unknown) => void;
    };
}

export interface CountryCode {
    name: string;
    code: string;
}

export interface Country {
    name: string;
}

export interface DocumentType {
    id: string;
    name: string;
}

export interface Beneficiary {
    id: string;
    name: string;
}

export interface Sector {
    id: string;
    name: string;
}

export interface Type {
    id: string;
    name: string;
}

export interface FormValues {
    firstName: string;
    lastName: string;
    middleName: string;
    uboPosition: string;
    dob: string;
    country: string;
    shareHolderPercentage: string;
    phoneCode: string;
    phoneNumber: string;
    note: string;
    frontId: string;
    backImgId: string;
    docType: string;
    docDetailsid: string;
    beneficiaryId: string;
    beneficiaryName: string;
    email: string;
    idIssuedCountry?: string;
    docNumber: string;
    docExpiryDate: string;
    registrationNumber?: string;
}

export interface ImageLoaderState {
    frontId: boolean;
    backImgId: boolean;
}

export interface FileNamesStateBase {
    frontId: string | null;
    backImgId: string | null;
}

export interface DocumentFormValues {
    passportDocNumber: string;
    passportExpiryDate: string;
    passportDateOfBirth: string;
    nationalIdDocNumber: string;
    nationalIdExpiryDate: string;
    passportFrontImage: string;
    passportBackImage: string;
    passportHandHoldingImage: string;
    passportSelfieImage: string;
    passportSignatureImage: string;
    nationalIdFrontImage: string;
    nationalIdBackImage: string;
}

export type ImageType = 'passportFront' | 'passportBack' | 'passportHandHolding' | 'passportSelfie' | 'passportSignature' | 'nationalIdFront' | 'nationalIdBack';

export interface DocumentFileNamesState {
    passportFrontFileName: string;
    passportBackFileName: string;
    passportHandHoldingFileName: string;
    passportSelfieFileName: string;
    passportSignatureFileName: string;
    nationalIdFrontFileName: string;
    nationalIdBackFileName: string;
}

export interface DocumentsNavigationProps {
    route: {
        params: {
            ProgramID?: string;
        };
    };
    navigation: {
        navigate: (screen: string, params?: any) => void;
        goBack: () => void;
    };
}

export interface KycData {
    pphs?: {
        docNumber?: string;
        docExpiryDate?: string;
        idImage?: string;
        backIdImage?: string;
        handHoldingIDPhoto?: string;
        faceImage?: string;
        signImage?: string;
    };
    nationalId?: {
        docNumber?: string;
        docExpiryDate?: string;
        frontDoc?: string;
        backDoc?: string;
    };
}

export interface DocumentsApiResponse {
    ok: boolean;
    data?: {
        kyc?: KycData;
        kyb?: any;
    };
}


export interface NoteItem {
    displayType: string;
    isRequired: boolean;
    title: string;
    accepted?: boolean;
}

export interface NoteGroup {
    title: string;
    note: NoteItem[];
}

export interface DocumentResponse {
    templateContent?: string;
    content?: string;
}



export interface BeneficiaryType {
  id: string;
  name: string;
  value: string;
}

export interface Beneficiary {
  id: string;
  name: string;
}

export interface UbosDetails {
  firstName?: string;
  lastName?: string;
  middleName?: string;
  email?: string;
  phoneNo?: string;
  phoneNumber?: string;
  phoneCode?: string;
  country?: string;
  addressCountry?: string;
  city?: string;
  gender?: string;
  dob?: string;
  idType?: string;
  docDetails?: {
    frontIdPhoto?: string;
  };
}

export interface DataState {
  beneficiaryType: BeneficiaryType[];
  beneficiary: Beneficiary[];
  ubosDetails: UbosDetails;
}

export interface UserInfo {
  id: string;
  phonecode?: string;
  accountType?: string;
}


export interface RBSheetRef {
    open: () => void;
    close: () => void;
}

export interface FormikContextType<T = Record<string, unknown>> {
    validateForm: () => Promise<Record<string, string>>;
    setTouched: (touched: Record<string, boolean>) => void;
    errors: Partial<Record<keyof T, string>>;
}

export interface ScrollViewRef {
    scrollTo: (options: { x?: number; y?: number; animated?: boolean }) => void;
}




export interface CoreLookupsResponse {
  ok: boolean;
  data: {
    BeneficiaryTypes: BeneficiaryType[];
  };
}

export interface BeneficiaryResponse {
  ok: boolean;
  data: Beneficiary[];
}

interface KycResponse {
  firstName?: string;
  lastName?: string;
  middleName?: string;
  email?: string;
  mobile?: string;
  mobileCode?: string;
  country?: string;
  addressCountry?: string;
  city?: string;
  town?: string;
  addressLine1?: string | null;
  state?: string;
  gender?: string;
  dob?: string;
  idNumber?: string;
  faceImage?: string | null;
  signature?: string | null;
  backDocImage?: string | null;
  profilePicBack?: string | null;
  profilePicFront?: string | null;
  handHoldingIDPhoto?: string | null;
  idImage?: string | null;
  docExpiryDate?: string;
  docissueDate?: string;
  occupation?: string;
  annualSalary?: number | null;
  sourceOfIncome?: string | null;
  accountPurpose?: string | null;
  expectedMonthlyVolume?: number | null;
  addressLine2?: string | null;
  postalCode?: string;
  emergencyContactName?: string;
  isDefault?: boolean;
  idType?: string;
  isdocTypeBasedOnCountry?: boolean;
  kycRequirements?: string;
}
export interface DocumentTypeBase {
    id: string | number;
    name: string;
    code?: string;
}

export interface AddressItem {
    id: string | number;
    favoriteName: string;
    name: string;
    isDefault: boolean;
    fullName?: string;
    addressType?: string;
}

export interface AddressDetail {
    id: string | number;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    town?: string;
}

export interface CountryCodeItem {
    name: string;
    code: string;
}







export interface FileNamesState {
    profilePicFront: string;
    handHoldingIDPhoto: string;
    biometric: string;
    faceImage: string;
    signature: string;
    profilePicBack: string;
    idImage: string;
    faceImage1: string;
    mixedPhoto: string;
}

export interface CountryForTowns {
    name: string;
    code: string;
}

export interface SelectedCountryForStates {
    name: string;
    details?: StateList[];
}

export interface DocumentTypeOptional {
    id?: string | number;
    name: string;
    code?: string;
}


export interface UpdateAddressObj {
    id?: string;
    favoriteName: string;
    addressType: string;
    email: string;
    country: string;
    state: string;
    phoneNumber: string;
    phoneCode: string;
    isDefault: boolean;
    addressLine1: string;
    addressLine2: string;
    city: string;
    postalCode: string;
    createdBy: string;
    modifiedBy: string;
    createdDate: Date;
    town: string;
    modifiedDate: Date;
    metadata: null;
}

export interface CreateAddressObj {
    id: string;
    customerId: string;
    favoriteName?: string;
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
    createdBy?: string;
    town: string;
    createdDate: Date;
}

export interface AddCardsAddressModalProps {
    isVisible: boolean;
    onClose: () => void;
    onSaveSuccess: () => void;
    value?: AddressFormValues & { id?: string };
}






export interface DynamicField {
    field: string;
    label?: string;
    isMandatory: string | boolean;
    validation?: string;
}


export interface NavigationType {
    navigate: (screen: string, params?: unknown) => void;
    goBack: () => void;
}

export interface FormikProps {
    touched: Record<string, boolean>;
    errors: Record<string, string>;
    handleBlur: (field: string) => void;
    values: ApplyCardFormValues;
    setFieldValue: (field: string, value: unknown, shouldValidate?: boolean) => void;
    handleChange: (field: string) => (value: string) => void;
    handleSubmit: () => void;
}