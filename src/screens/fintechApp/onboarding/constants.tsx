import { getThemedCommonStyles } from "../../../components/CommonStyles";
import { useThemeColors } from "../../../hooks/themedHook/useThemeColors";
import ParagraphComponent from "../../../components/textComponets/paragraphText/paragraph";

const NEW_COLOR = useThemeColors();
const commonStyles = getThemedCommonStyles(NEW_COLOR);

export const KycStepsContents = [
    <ParagraphComponent key={'Personal \n Information'} style={[commonStyles.fs12, commonStyles.fw600]} text={'Persional Information'} />,
    <ParagraphComponent key={'Personal \n Address'} style={[commonStyles.fs12, commonStyles.fw600]} text={'Persional Address'} />,
    <ParagraphComponent key={'Identification \n Documents'} style={[commonStyles.fs12, commonStyles.fw600]} text={'Identification Documents'} />,
    <ParagraphComponent key={'Review'} style={[commonStyles.fs12, commonStyles.fw600,]} text={'Review'} />,
];

export const KYC_PROFILE_PRIVEW_CONSTANTS = {
    PERSONAL_ADDRESS: "Personal Address",
    KYC_INFORMATION_TITLE: "KYC Information",
    PERSIONAL_INFORMATION: "Personal Information",
    BASIC_INFORMATION_TITLE: 'Basic Information',
    FIRST_NAME: "First Name",
    LAST_NAME: "Last Name",
    GENDER: "Gender",
    DATE_OF_BIRTH: "Date Of Birth",
    COUNTRY: "ID Issuance Country",
    DOCUMENT_NUMBER: "Document Number",
    DOCUMENT_EXPIRY_DATE: "Document Expiry Date",
    DOCUMENT_TITLE: "Identification Document",
    DOCUMNET_TYPE: "Document Type",
    FRONT_ID_PHOTO: "Front ID Photo",
    FACE_IMAGE: "Face Image",
    SIGNATURE_PHOTO: "Signature Photo",
    SUBMIT_BUTTON: "Submit",
    SUCCESS: "Success",
    KYC_SUCCESS_MESSAGE: "KYC information Successfully Submited!.",
    KYB_SUCCESS_MESSAGE: "KYB information Successfully Submited!.",
    EDIT_TITLE: "Edit",
    BACK_ID_PHOTO: "Back ID Photo",
    HANDLE_HOLDING_PHOTO: "Hand Holding Photo",
    FILE_SIZE_SHOULD_2MB: 'File size should be max 2MB',
    FILE_SIZE_SHOULD_15MB: 'File size should be max 15MB',
    GUID_FORMATE: "00000000-0000-0000-0000-000000000000",
    REFERRAL_CODE: "referralCode",



}
export const getFileExtension = (uri: string): string | null => {
    const match = uri.match(/\.(\w+)$/);
    return match ? match[1] : null;
};
export const genderLookups = [{ "label": "GLOBAL_CONSTANTS.MALE", "name": "male", "recorder": 1 }, { "label": "GLOBAL_CONSTANTS.FEMALE", "name": "female", "recorder": 2 }, { "label": "GLOBAL_CONSTANTS.OTHER", "name": "others", "recorder": 3 }];

const acceptedExtensions = ['.jpg', '.jpeg', '.png'];

export const verifyFileTypes = (fileList: string) => {
    const fileName = fileList;
    if (!hasAcceptedExtension(fileName)) {
        return false;
    }

    return true;
};
const hasAcceptedExtension = (fileName: string) => {
    const extension = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
    return acceptedExtensions.includes(extension);
};

export const NAVIGATION_CONSTS = {
    KYB_INFO_PREVIEW: "KybInfoPreview",
    KYB_DIRECTORS_DETAILS_LIST: 'KybDirectorDetailsList',
    ADD_DIRECTORS_DETAILS_FORM: 'KybAddDirectorsDetailsForm',
    KYB_UBOS_LIST: 'KybUboList',
};

export const GENDER_LOOKUPS = [
    { "label": "GLOBAL_CONSTANTS.MALE", "name": "male" },
    { "label": "GLOBAL_CONSTANTS.FEMALE", "name": "female" },
    { "label": "GLOBAL_CONSTANTS.OTHER", "name": "others" }
];