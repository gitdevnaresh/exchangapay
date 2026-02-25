export interface UserDetails {
    id: string;
    kycStatus?: string;
    customerState?: string;
    isInitialSubscriptionRequired?: boolean;
    isSubscribed?: boolean;
    accountType?: string;
}

export interface KybDetails {
    companyName?: string;
    country?: string;
    registrationNumber?: string;
    incorporationDate?: string;
    ubo?: UboDirectorItem;
    director?: UboDirectorItem;
}

export interface BasicInfo {
    country?: string;
    phoneCode?: string;
    phoneNo?: string;
    email?: string;
}
export interface ImageLoaderState {
    frontId: boolean;
    backImgId: boolean;
}

export interface FileNamesState {
    frontId: string | null;
    backImgId: string | null;
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
}

export interface DocumentData {
    passport?: PassportDocument;
    nationalId?: NationalIdDocument;
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
        uboFormDataList: UboDirectorItem[];
        directorFormDataList: UboDirectorItem[];
        selectedBank: SelectedBank;
        selectedAddresses: SelectedAddress[];
        documentsData: DocumentData;
        hasAccountCreationFee: boolean | string | number | null | undefined;
        ipAddress: string;
        deletedApiItems: string[];
        sectors: string;
        types: string;
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