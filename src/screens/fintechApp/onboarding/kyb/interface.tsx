export interface UboItem {
    id?: string;
    registrationNumber: string;
    uboPosition: string;
    firstName: string;
    lastName: string;
    middleName?: string;
    dob: string;
    phoneCode: string;
    phoneNumber: string;
}
export interface UserDetails {
    id: string | number;
}

export interface UboFormValues {
    firstName: string;
    lastName: string;
    middleName: string;
    uboPosition: string;
    dob: string | Date;
    shareHolderPercentage: string;
    phoneCode: string;
    phoneNumber: string;
    note: string;
    frontId: string;
    backImgId: string;
    docType: string;
    docDetailsid: string; 
}
export interface KybCompanyDataProps {
    route: any;
}
export interface FileNamesState {
    frontId: string | null;
    backImgId: string | null;
}

export interface ImagesLoaderState {
    frontId: boolean;
    backImgId: boolean;
}
    export interface SelectedRecordType { id?: any; fileName?: string };
    export interface SectionHeaderComponentProps {
    title: string;
    commonStyles: any;
    NEW_COLOR: any;
    editCondition?: boolean;
    onEditPress?: () => void;
    onAddPress?: () => void;
    statusText?: string;
    statusColorKey?: string;
}
export interface DetailRowProps {
    label: string;
    value?: string | number | null;
    isEncrypted?: boolean;
    decryptFn?: (text: string) => string;
    commonStyles: any;
    showSeparator?: boolean;
    customFormat?: () => string | null;
}
export interface ReviewListItemComponentProps {
    item: any; index: number; listLength: number; onEdit: (id: any) => void; onDelete: (id: any) => void;
    decryptFn: (text: string) => string; commonStyles: any; editCondition: boolean; dateToDisplayKey: string;
    nameKey?: string; positionKey?: string; phoneKey?: string;
}