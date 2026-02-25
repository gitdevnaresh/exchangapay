export interface AddressInterface {
    id?: string;
    firstname?: string;
    lastname?: string;
    country?: string;
    lastName?: string;
    state?: string;
    firstName?: string;
    city?: string;
    phoneNumber?: string;
    phoneCode?: string;
    addressLine1?: string;
    addressLine2?: string;
    postalCode?: string;
    town?: string;
    email?: string;
    isDefault?: boolean;
    addressType?: string;
    isTradingAddress?: boolean;
    fullName?: string;
    kyc?: KycDetails['kyc'];
    addressDetails?: {
        firstName?: string;
        lastName?: string;
        country?: string;
        state?: string;
        city?: string;
        phoneNumber?: string;
        phoneCode?: string;
        addressLine1?: string;
        addressLine2?: string;
        postalCode?: string;
        town?: string;
        email?: string;
        favoriteName?: string;
        isDefault?: boolean;
        addressType?: string;
        isTradingAddress?: boolean;
    };
    name?: string;
    towns?: string[];
}

export interface KycProfileFormValues {
    firstName: string;
    lastName: string;
    gender: string;
    dob: string | Date;
    idIssuingCountry: string;
    documentType: string;
    docNumber: string;
    docExpireDate: string | Date;
}

export interface KycDetails {
    kyc?: {
        fullName?: {
            firstName: string;
            lastName: string;
        };
        basic?: {
            gender: string;
            dob: string;
            email: string;
            phoneCode: string;
            phoneNo: string;
            country: string;
        };
        pfc?: {
            docId: string;
            docExpiryDate: string;
            frontDoc?: string;
            backDoc?: string;
        };
        pphs?: {
            idImage: string;
            backIdImage: string;
            handHoldingIDPhoto: string;
            faceImage: string;
            signImage: string;
            [key: string]: string | undefined;
        };
        nationalId?: {
            frontDoc: string;
            backDoc: string;
            docId?: string;
            docExpiryDate?: string;
        };
    };
}

export interface IdentityDocument {
    frontImage?: string;
    backDocImage?: string;
    handHoldingImage?: string;
    selfieImage?: string;
    singatureImage?: string;
    [key: string]: string | undefined;
}

export interface SelectedAddress {
    id: string;
    fullName: string;
}

export interface DocumentPreviewProps {
    imageUri: string | null | undefined;
    label: string;
    commonStyles: Record<string, any>;
    isLast?: boolean;
}

export interface DocumentConfig {
    field: string;
    kycField: string;
    label: string;
}

export interface SectionProps {
    kycDetails?: KycDetails;
    commonStyles: Record<string, any>;
    decryptAES?: (value: string) => string;
    formatDate?: (date: string | undefined) => string;
    identityDocuments?: IdentityDocument[];
    selectedAddresses?: SelectedAddress[];
    handleEditIdentificationDocuments?: () => void;
    handleEditPersionalInfo?: () => void;
    s?: (value: number) => number;
    setErrormsg?: (msg: string) => void;
    t?: (key: string) => string;
    personalDob?: string;
    onEditDob?: () => void;
}

export interface RouteParams {
    cardId?: string;
    logo?: string;
    ProgramID?: string;
}

export interface NavigationProps {
    navigate: (screen: string, params?: any) => void;
    push: (screen: string, params?: any) => void;
    goBack: () => void;
}

export interface BankKycProfileStep2Props {
    route?: {
        params?: RouteParams;
    };
    navigation: NavigationProps;
}

export interface FileNames {
    nationalIdFrontFileName: string;
    nationalIdBackFileName: string;
    frontIdFileName: string;
    backIdFileName: string;
    handleHoldingImgFilename: string;
    selfieFileName: string;
    signFileName: string;
}

export interface ImageAsset {
    uri: string;
    type?: string;
    fileSize?: number;
    fileName?: string;
}

export interface ApiResponse {
    status?: number;
    data?: any;
    ok?: boolean;
}

export interface KycApiResponse extends ApiResponse {
    data?: {
        kyc?: any;
    };
}

export interface UploadApiResponse {
    status?: number;
    data?: any;
    ok?: boolean;
}

export interface FormikErrors {
    _generalImageError?: string;
    [key: string]: string | undefined;
}

export interface ImageFieldConfig {
    type: ImageType;
    value: string | null;
    errorMessageKey: string;
}

export type ImageType =
    | 'nationalIdFront'
    | 'nationalIdBack'
    | 'passportFront'
    | 'passportBack'
    | 'passportHandHolding'
    | 'passportSelfie'
    | 'passportSignature';

export interface CountryPickerItem {
    name: string;
    code: string;
    towns?: string[];
    details?: TownsList[];
}

export interface PhoneCodeItem {
    name: string;
    code: string;
}

export interface TownsList {
    name: string;
    code: string;
}

export interface BankAddressTypeItem {
    id: string | null;
    name: string;
    code: string;
}

export interface BankAddressLuResponse {
    KYC: BankAddressTypeItem[];
    KYB: BankAddressTypeItem[];
}

export interface AddressLookupDetailsResponse {
    countryWithTowns: CountryPickerItem[];
    PhoneCodes: PhoneCodeItem[];
}

export interface UpdateDetailsResponse {
    ok: boolean;
    data?: AddressInterface;
    status?: number;
}

export interface AddressFormValues {
    firstName: string;
    lastName: string;
    country: string;
    state: string;
    city: string;
    phoneNumber: string;
    addressLine1: string;
    addressLine2: string;
    postalCode: string;
    email: string;
    phoneCode: string;
    town: string;
    favoriteName: string;
    addressType: string;
    isDefault?: boolean;
}

export interface KycInfoDataForSubmission {
    id: string;
    firstName: string;
    lastName: string;
    gender: string;
    dob: string | Date;
    docExpireDate: string | Date;
    docNumber: string;
    idIssuingCountry: string;
}

export interface KybCompanyInfoForSubmission {
    customerId: string;
    companyName: string;
    country: string;
    registrationNumber: string;
    dateOfRegistration: string | Date;
    documents: unknown;
}

export interface AddPersonalInfoRouteParams {
    KycInformation?: boolean;
    kycInfoData?: KycInfoDataForSubmission;
    isKycEdit?: boolean;
    KybInformation?: boolean;
    KybCompanyInfo?: KybCompanyInfoForSubmission;
    isKybEdit?: boolean;
    cardId?: string;
    id?: string;
    logo?: unknown;
    addressDetails?: AddressInterface;
    screenName?: string;
    returnScreen?: string;
    returnParams?: unknown;
}

export interface UserInfo {
    id: string;
    userName: string;
    country: string;
    phoneNo: string;
    email: string;
    phoneCode: string;
    accountType: string;
}

export interface ReduxState {
    userReducer: {
        userDetails: UserInfo;
        selectedAddresses?: AddressListItem[];
    };
}

export interface AddressListItem {
    id: string;
    fullName: string;

    favoriteName?: string;
}

export interface AddressListResponse {
    ok: boolean;
    data?: AddressListItem[];
    status?: number;
}

export interface NavigationPropAddressList {
    navigate: (screen: string, params?: unknown) => void;
    goBack: () => void;
}

export interface RenderItemProps {
    item: AddressListItem;
}

export interface ReduxAction {
    type: string;
    payload: unknown;
    [key: string]: unknown;
}
    