export interface UboFormDetailsProps {
    isDirectorMode?: boolean;
    onSave?: (data: any) => void;
    onBack?: () => void;
    title?: string;
    validationSchema?: any;
    editId?: string;
    productId?: string;
    customFields?: React.ReactNode;
    route?: {
        params: {
            isDirectorMode?: boolean;
            isRepresentativeMode?: boolean;
            editId?: string;
            title?: string;
            isUboMode?: boolean;
            cardId?: string;
        };
    };
}

export interface FormValues {
    firstName: string;
    lastName: string;
    middleName: string;
    uboPosition: string;
    dob: string;
    gender: string;
    country: string;
    shareHolderPercentage: string;
    phoneCode: string;
    phoneNumber: string;
    note: string;
    frontId: string;
    backImgId: string;
    docType: string;
    docDetailsid: string;
    email: string;
    docNumber: string;
    docIssueDate: string;
    docExpiryDate: string;
    selfi: string;
    addressCountry: string;
    state: string;
    city: string;
    addressLine1: string;
    addressLine2: string;
    postalCode: string;
    addressType: string;
}

export interface FileNames {
    frontId: string | null;
    backImgId: string | null;
    selfi: string | null;
}

export interface ImagesLoader {
    frontId: boolean;
    backImgId: boolean;
    selfi: boolean;
}

export interface LookupData {
    KycDocumentTypes?: LookupItem[];
    PhoneCodes?: LookupItem[];
    countryWithTowns?: LookupItem[];
    countryWithStates?: CountryWithStates[];
}

export interface CountryWithStates {
    name: string;
    details?: any[];
}

export interface KybRequirements {
    showUBOIdentification?: boolean;
    showDirectorIdentification?: boolean;
    showRepresentativeIdentification?: boolean;
    showUBOSelfie?: boolean;
    showDirectorSelfie?: boolean;
    showRepresentativeSelfie?: boolean;
    showUBOAddress?: boolean;
    showDirectorAddress?: boolean;
    showRepresentativeAddress?: boolean;
    showPersonalInformationAddress?: boolean;
}

export interface PersonalDetails {
    kyb?: {
        kycRequirements?: any;
        ubos?: any[];
        directors?: any[];
        representatives?: any[];
    };
}

export interface ReduxState {
    userReducer: {
        uboCardFormData: any[];
        directorCardFormData: any[];
        representativeFormDataList: any[];
        selectedBank: any;
        userDetails: any;
        cardId: string;
        deletedCardsApiItems?: any[];
    };
}

export interface LookupItem {
    name?: string;
    code?: string;
    id?: string;
    value?: string;
}
