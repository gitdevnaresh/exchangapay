import { Text } from "react-native";
import { getThemedCommonStyles } from "../../../../../../components/CommonStyles";


export const getKybStepsContents = (NEW_COLOR: any) => {
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  return [
    <Text key="CompanyData" style={[commonStyles.fs12, commonStyles.fw600, commonStyles.textCenter]}>
      Company{'\n'}Data
    </Text>,
    <Text key="PersonalAddress" style={[commonStyles.fs12, commonStyles.fw600, commonStyles.textCenter]}>
      Personal{'\n'}Address
    </Text>,
    <Text key="UBOsDetails" style={[commonStyles.fs12, commonStyles.fw600, commonStyles.textCenter]}>
      UBOs{'\n'}Details
    </Text>,
    <Text key="DirectorsDetails" style={[commonStyles.fs12, commonStyles.fw600, commonStyles.textCenter]}>
      Directors{'\n'}Details
    </Text>,
    <Text key="Review" style={[commonStyles.fs12, commonStyles.fw600, commonStyles.textCenter]}>
      Review
    </Text>,
  ];
};

export const KybStepsContents = getKybStepsContents;

export const getFileExtension = (uri: string): string | null => {
  const match = uri.match(/\.(\w+)$/);
  return match ? match[1] : null;
};
  export const verifyFileTypes = (fileName: string) => {
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'pdf'];
    const extension = getFileExtension(fileName);
    return allowedExtensions.includes(extension || '');
  };
export const KYB_INFO_CONSTANTS = {
  REVIEW: "Review",
  FOLLOWING_RULES1: "Document confirming the company's legal existence (e.g., the certificate of incorporation or a recent excerpt from a state company registry).",
  FOLLOWING_RULES2: "Document identifying the company's beneficial owners.",
  COMPANY_DATA_TITLE: "Company Data",
  COMPANY_TITLE: "Company",
  COMPANY_NAME: "Company Name",
  COUNTRY: "Country",
  REGISTRATON_NUMBER: "Registration Number",
  DO_REGISTRATION: "Date Of Registration",
  UPLOAD_DOCUMENT_TITLE: "Upload Document",
  SHARE_REGISTRY: "Shareholder Registry",
  CERTIFICATE_INCORPORATION: "Certificate of Incorporation",
  CERTIFICATION_IMAGE: 'certificationImage',
  UBO_DETAILS_TITLE: "UBO Details",
  DIRECTORS_DETAILS: "Directors Details",
  KYB_INFO: "KYB Information",
  EDIT_TITLE: "Edit",
  SUBMIT_BUTTON: "SUMBIT",
  ADDRESS_TITLE: "Address",
  FIRST_NAME: "First Name",
  LAST_NAME: "Last Name",
  STATE: "State",
  TOWN: "Town",
  CITY: "City",
  ADDRESS1: "Address Line1",
  ADDRESS2: "Address Line2",
  POSTAL_CODE: "Postal Code",
  PHONE_NUMBER: "Phone Number",
  EMAIL: "Email",
  CERTIFICATE_INCORPORATION_LABLE: 'Certification Of Incorporation',
  SHARE_HOLDER_REGISTRY: "ShareHolder Registry",
  ALRET_MSG: "Permission Denied ,You need to enable permissions to access the image library.",
  ACCEPT_IMG_MSG: "Accepts only jpg ,png and jpeg format",
  DOCUMENT: "document",
  BACK_PRESS: "hardwareBackPress",
  APLY_CARD_NAV: "ApplyExchangaCard",
  IS_REQUIRED: 'Is required',
  GUID_FORMATE: "00000000-0000-0000-0000-000000000000",
  ADD_PERSONALINFO_NAV: 'AddPersonalInfo',
  REGISTRY_IMG_FIELD: "registryImage",
  PAGE_TITLE: "KYB Information",
  TRANSPARENT: "transparent",
  MODIFIED: "Modified",
  ADDED: "Added",
  UPLOAD_THE_DOC: "Upload the documents",
  AT_LEAST_ONE_RECORD: "Please add atleast one UBO",
  AT_LEAST_ONE_DIRECTOR: "Please add atleast one director",
  OK: "OK",
  CLOSE: "CLOSE",
  PLUS: "plus",
  NEW: "New",
  DELETE: "delete",
  NEXT: 'Next',
  BACK: 'Back',
  CANCEL: 'Cancel',
  NUMURIC_KEYPAD: 'numeric',
  COMPANY_FORM_NAMES: {
    COMPANY_NAME: "companyName",
    COUNTRY: "country",
    REGISTER_NAME: "registrationNumber",
    DOF_REGISTER: "dateOfRegistration",
  },
  COMPANY_FORM_FEILDS: {
    COMPANY_NAME: "Company Name ",
    COUNTRY: "Country ",
    REGISTER_NAME: "Registration Number ",
    DOF_REGISTER: "Date Of Registration ",
  },
  COMPANY_FORM_PLACEHOLDER: {
    COMPANY_NAME: "Enter Company Name",
    COUNTRY: "Select Country",
    REGISTER_NAME: "Enter Registration Number",
    DOF_REGISTER: "Select Date Of Registration",
  }
}

export const ADD_UBOS_DETAILS_CONSTANTS = {
  PAGE_TITLE: "ADD UBO ",
  EDIT_TITLE: "Edit UBO",
  CHOOSE_UBOS_POSITION: "Choose the UBO's position within the company:",
  PARAGRAPH_CHOOSE_POSITION: "Provide information about the UBOs that hold 25% or more of the company We will send them an email asking them to go through the KYC/AML procedure.",
  GUID_FORMATE: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
  ADD_DIRECTORS_TITLE: "Add Directors",
  EDIT_DIRECTORS_TITLE: "Edit Directors",
  ADD_DIRECTORS_PARAGRAPH: "Enter information about the company's directors You can add one or several participants individuals or companies."
}

export const ubosPositionList = [
  { "label": "GLOBAL_CONSTANTS.UBO", "name": "Ubo", "recorder": 1 },
  { "label": "GLOBAL_CONSTANTS.DIRECTOR", "name": "Director", "recorder": 2 },
]

export const dirctorsPositionList = [
  { "label": "GLOBAL_CONSTANTS.INDIVIDUAL", "name": "Individual", "recorder": 1 },
]

export const acceptedExtensions = ['.jpg', '.jpeg', '.png'];

export const FORM_FIELD = {
  UBO_POSITION: "uboPosition",
  NAME: "name",
  FIRST_NAME: "firstName",
  MIDLE_NAME: "middleName",
  LAST_NAME: "lastName",
  START_REQUIRED: " *",
  DATE_OF_BIRTH: 'dob',
  PHONE_CODE: 'phoneCode',
  PHONE_NUMBER: 'phoneNumber',
  PHONE_PAD: "phone-pad",
  DOC_TYPE: 'docType',
  FRONT_ID: 'frontId',
  BACK_IMG_ID: 'backImgId',
  POSITION_WITHIN_COMPANY: "positionWithCompany",
  SHARE_HOLDER_PERCENTAGE: "shareHolderPercentage",
  NOTE: "note",

  MAX_LENGTH: {
    FIRST_NAME: 44,
    LAST_NAME: 44,
    MIDDLE_NAME: 44,
    DOCUMENT_NUMBER: 30
  },

  LABLES_CONSTS: {
    FIRST_NAME: "First Name",
    MIDLE_NAME: "Middle Name",
    LAST_NAME: "Last Name",
    DATE_OF_BIRTH: 'Date Of Birth',
    PHONE_NUMBER: 'Phone Number',
    CHOOSE_AC_TYPE: "Choose document type",
    FRONT_ID_PHPTO: "Front ID Photo",
    BACK_ID_PHPTO: "Back ID Photo",
    POSITION_WITHIN_COMPANY: "Position within the company",
    SHARE_HOLDER_PERCENTAGE: "Shareholder Percentage",
    NOTE: "Note",
  },
  PLACE_HOLDER_CONSTS: {
    FIRST_NAME: "Enter First Name",
    MIDLE_NAME: "Enter Middle Name",
    LAST_NAME: "Enter Last Name",
    DATE_OF_BIRTH: 'Select Date Of Birth',
    PHONE_NUMBER: 'Enter Phone Number',
    SELECT: "Select",
    CHOOSE_AC_TYPE: "Select document type",
    POSITION_WITHIN_COMPANY: "Enter position within the company",
    SHARE_HOLDER_PERCENTAGE: "Enter Shareholder Percentage",
    NOTE: "Enter Note",
  }
}

export type RootStackParamList = {
    KybCompanyData: { customerId?: string; cardId?: string; logo?: string };
    AddPersonalInfo: { KybCompanyInfo: any; KybInformation: boolean; isKybEdit: boolean };
    ApplyExchangaCard: { cardId?: string; logo?: string };
    // ... other routes
};