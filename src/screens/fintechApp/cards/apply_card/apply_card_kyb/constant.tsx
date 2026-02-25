import { Text } from "react-native";
import { getThemedCommonStyles } from "../../../../../components/CommonStyles";
import { useThemeColors } from "../../../../../hooks/themedHook/useThemeColors";
import * as Yup from 'yup';
import moment from "moment";
const NEW_COLOR = useThemeColors();
const commonStyles = getThemedCommonStyles(NEW_COLOR);


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
  ID_TYPE: 'idType',
  FRONT_ID: 'frontId',
  BACK_IMG_ID: 'backImgId',
  POSITION_WITHIN_COMPANY: "positionWithCompany",
  SHARE_HOLDER_PERCENTAGE: "shareHolderPercentage",
  NOTE: "note",
  COMPANY_NAME: "companyName",
  TYPE: "type",
  DESCRIPTION: "description",
  INDUSTRY: "industry",
  REGISTRATION_NUMBER: "registrationNumber",
  TAX_ID: "taxId",
  WEBSITE: "website",
  SHAREHOLDER_REGISTRY: "shareholderRegistry",
  CERTIFICATION_OF_INCORPORATION: "certificationOfIncorporation",


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




export const KybStepsContents = [
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
export const getFileExtension = (uri: string): string | null => {
  const match = uri.match(/\.(\w+)$/);
  return match ? match[1] : null;
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
  EXISTING: "Existing",
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



export type RootStackParamList = {
  KybCompanyData: { customerId?: string; cardId?: string; logo?: string };
  AddPersonalInfo: { KybCompanyInfo: any; KybInformation: boolean; isKybEdit: boolean };
  ApplyExchangaCard: { cardId?: string; logo?: string };
  // ... other routes
};

const HTML_REGEX = /<[^>]*>?/g;
const EMOJI_REGEX = /[\p{Extended_Pictographic}]/u;
const POSTAL_CODE_REGEX = /^[A-Za-z0-9\s-]+$/;
const SPECIAL_CHAR_REGEX = /[!@#$%^&*(),.?":{}|<>]/;
const ONLY_NUMBER_NOT_ALLOWED_REGEX = /^(?!\d+$).+/;
const AT_NOT_ALLOWED_REGEX = /@/;
const FIRST_CHAR_REGEX = /^[A-Za-z0-9]/;
const DOCUMENT_NUMBER_REGEX = /^[a-zA-Z0-9]+$/;
const WEB_SITE_REGEX = /^(https?:\/\/|www\.)([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}(:\d{1,5})?(\/[^\s]*)?$/;


// Accepts:

// https://example.com
// http://www.example.com
// www.example.com

// ❌ Rejects:

// example.com
// (because it has no https, http, or www)


export const AddressValidationSchema = (requirements: string, values: any) => {
  const includes = (key: string) => requirements?.toLowerCase()?.includes(key.toLowerCase());
  const schemaShape: Record<string, Yup.StringSchema> = {};
  // Personal address validation
  // if (includes("personalinformationaddress")) {
  //   Object.assign(schemaShape, {
  //     address: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
  //     addressLine1: Yup.string()
  //       .required("GLOBAL_CONSTANTS.IS_REQUIRED")
  //       .test("no-emojis", "GLOBAL_CONSTANTS.INVALID_ADDRESS_LINE1", value => !value || !EMOJI_REGEX.test(value))
  //       .test("no-html", "GLOBAL_CONSTANTS.INVALID_ADDRESS_LINE1", value => !value || !HTML_REGEX.test(value))
  //       .test("no-only-numbers", "GLOBAL_CONSTANTS.INVALID_ADDRESS_LINE1", value => !value || ONLY_NUMBER_NOT_ALLOWED_REGEX.test(value))
  //       .test("first-not-special", "GLOBAL_CONSTANTS.INVALID_ADDRESS_LINE1", value => !value || FIRST_CHAR_REGEX.test(value))
  //       .test("no-@at-symbol", "GLOBAL_CONSTANTS.INVALID_ADDRESS_LINE1", value => !value || !AT_NOT_ALLOWED_REGEX.test(value)),

  //     addressLine2: Yup.string()
  //       .nullable()
  //       .test("no-emojis", "GLOBAL_CONSTANTS.INVALID_ADDRESS_LINE2", value => !value || !EMOJI_REGEX.test(value))
  //       .test("no-html", "GLOBAL_CONSTANTS.INVALID_ADDRESS_LINE2", value => !value || !HTML_REGEX.test(value))
  //       .test("no-only-numbers", "GLOBAL_CONSTANTS.INVALID_ADDRESS_LINE2", value => !value || ONLY_NUMBER_NOT_ALLOWED_REGEX.test(value))
  //       .test("no-@at-symbol", "GLOBAL_CONSTANTS.INVALID_ADDRESS_LINE2", value => !value || !AT_NOT_ALLOWED_REGEX.test(value)),

  //     city: Yup.string()
  //       .required("GLOBAL_CONSTANTS.IS_REQUIRED")
  //       .test("no-emojis", "GLOBAL_CONSTANTS.INVALID_CITY", value => !value || !EMOJI_REGEX.test(value))
  //       .test("no-special-characters", "GLOBAL_CONSTANTS.INVALID_CITY", value => !SPECIAL_CHAR_REGEX.test(value))
  //       .test("no-html", "GLOBAL_CONSTANTS.INVALID_CITY", value => !value || !HTML_REGEX.test(value)),

  //     country: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),

  //     postalCode: Yup.string()
  //       .required("GLOBAL_CONSTANTS.IS_REQUIRED")
  //       .test("valid-format", "GLOBAL_CONSTANTS.INVALID_POSTAL_CODE", value => !value || POSTAL_CODE_REGEX.test(value))
  //       .test("no-emojis", "GLOBAL_CONSTANTS.INVALID_POSTAL_CODE", value => !value || !EMOJI_REGEX.test(value))
  //       .test("no-special-characters", "GLOBAL_CONSTANTS.INVALID_POSTAL_CODE", value => !SPECIAL_CHAR_REGEX.test(value))
  //       .test("no-html", "GLOBAL_CONSTANTS.INVALID_POSTAL_CODE", value => !value || !HTML_REGEX.test(value))
  //       .min(3, "GLOBAL_CONSTANTS.POSTAL_CODE_AT_LEAST")
  //       .max(8, "GLOBAL_CONSTANTS.POSTAL_CODE_MAX"),

  //     state: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
  //   });
  // }
  // Company address validation (separate fields)
  if (includes("companyaddress")) {
    Object.assign(schemaShape, {
      companyAddress: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
      companyAddressLine1: Yup.string()
        .required("GLOBAL_CONSTANTS.IS_REQUIRED")
        .test("no-emojis", "GLOBAL_CONSTANTS.INVALID_ADDRESS_LINE1", value => !value || !EMOJI_REGEX.test(value))
        .test("no-html", "GLOBAL_CONSTANTS.INVALID_ADDRESS_LINE1", value => !value || !HTML_REGEX.test(value))
        .test("no-only-numbers", "GLOBAL_CONSTANTS.INVALID_ADDRESS_LINE1", value => !value || ONLY_NUMBER_NOT_ALLOWED_REGEX.test(value))
        .test("first-not-special", "GLOBAL_CONSTANTS.INVALID_ADDRESS_LINE1", value => !value || FIRST_CHAR_REGEX.test(value))
        .test("no-@at-symbol", "GLOBAL_CONSTANTS.INVALID_ADDRESS_LINE1", value => !value || !AT_NOT_ALLOWED_REGEX.test(value)),

      companyAddressLine2: Yup.string()
        .nullable()
        .test("no-emojis", "GLOBAL_CONSTANTS.INVALID_ADDRESS_LINE2", value => !value || !EMOJI_REGEX.test(value))
        .test("no-html", "GLOBAL_CONSTANTS.INVALID_ADDRESS_LINE2", value => !value || !HTML_REGEX.test(value))
        .test("no-only-numbers", "GLOBAL_CONSTANTS.INVALID_ADDRESS_LINE2", value => !value || ONLY_NUMBER_NOT_ALLOWED_REGEX.test(value))
        .test("no-@at-symbol", "GLOBAL_CONSTANTS.INVALID_ADDRESS_LINE2", value => !value || !AT_NOT_ALLOWED_REGEX.test(value)),

      companyCity: Yup.string()
        .required("GLOBAL_CONSTANTS.IS_REQUIRED")
        .test("no-emojis", "GLOBAL_CONSTANTS.INVALID_CITY", value => !value || !EMOJI_REGEX.test(value))
        .test("no-special-characters", "GLOBAL_CONSTANTS.INVALID_CITY", value => !SPECIAL_CHAR_REGEX.test(value))
        .test("no-html", "GLOBAL_CONSTANTS.INVALID_CITY", value => !value || !HTML_REGEX.test(value)),

      companyAddressCountry: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),

      companyPostalCode: Yup.string()
        .required("GLOBAL_CONSTANTS.IS_REQUIRED")
        .test("valid-format", "GLOBAL_CONSTANTS.INVALID_POSTAL_CODE", value => !value || POSTAL_CODE_REGEX.test(value))
        .test("no-emojis", "GLOBAL_CONSTANTS.INVALID_POSTAL_CODE", value => !value || !EMOJI_REGEX.test(value))
        .test("no-special-characters", "GLOBAL_CONSTANTS.INVALID_POSTAL_CODE", value => !SPECIAL_CHAR_REGEX.test(value))
        .test("no-html", "GLOBAL_CONSTANTS.INVALID_POSTAL_CODE", value => !value || !HTML_REGEX.test(value))
        .min(3, "GLOBAL_CONSTANTS.POSTAL_CODE_AT_LEAST")
        .max(8, "GLOBAL_CONSTANTS.POSTAL_CODE_MAX"),

      companyState: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
    });
  }
  if (includes("companyinforamtion")) {
    Object.assign(schemaShape, {
      companyName: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED")
        .test("no-emojis", "GLOBAL_CONSTANTS.INVALID_COMAPANY_NAME", value => !value || !EMOJI_REGEX.test(value))
        .test("no-html", "GLOBAL_CONSTANTS.INVALID_COMAPANY_NAME", value => !value || !HTML_REGEX.test(value))
        .test("no-only-numbers", "GLOBAL_CONSTANTS.INVALID_COMAPANY_NAME", value => !value || ONLY_NUMBER_NOT_ALLOWED_REGEX.test(value))
        .test("first-not-special", "GLOBAL_CONSTANTS.INVALID_COMAPANY_NAME", value => !value || FIRST_CHAR_REGEX.test(value))
        .test("no-@at-symbol", "GLOBAL_CONSTANTS.INVALID_COMAPANY_NAME", value => !value || !AT_NOT_ALLOWED_REGEX.test(value))
        .test("no-special-characters", "GLOBAL_CONSTANTS.INVALID_COMAPANY_NAME", value => !SPECIAL_CHAR_REGEX.test(value))
      ,
      type: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED")
        .test("no-emojis", "GLOBAL_CONSTANTS.INVALID_TYPE", value => !value || !EMOJI_REGEX.test(value))
        .test("no-html", "GLOBAL_CONSTANTS.INVALID_TYPE", value => !value || !HTML_REGEX.test(value))
        .test("no-only-numbers", "GLOBAL_CONSTANTS.INVALID_TYPE", value => !value || ONLY_NUMBER_NOT_ALLOWED_REGEX.test(value))
        .test("first-not-special", "GLOBAL_CONSTANTS.INVALID_TYPE", value => !value || FIRST_CHAR_REGEX.test(value))
        .test("no-@at-symbol", "GLOBAL_CONSTANTS.INVALID_TYPE", value => !value || !AT_NOT_ALLOWED_REGEX.test(value))
        .test("no-special-characters", "GLOBAL_CONSTANTS.INVALID_TYPE", value => !SPECIAL_CHAR_REGEX.test(value))
      ,
      description: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED")
        .test("no-emojis", "GLOBAL_CONSTANTS.INVALID_DESCRIPTION", value => !value || !EMOJI_REGEX.test(value))
        .test("no-html", "GLOBAL_CONSTANTS.INVALID_DESCRIPTION", value => !value || !HTML_REGEX.test(value))
        .test("no-only-numbers", "GLOBAL_CONSTANTS.INVALID_DESCRIPTION", value => !value || ONLY_NUMBER_NOT_ALLOWED_REGEX.test(value))
        .test("first-not-special", "GLOBAL_CONSTANTS.INVALID_DESCRIPTION", value => !value || FIRST_CHAR_REGEX.test(value))
        .test("no-@at-symbol", "GLOBAL_CONSTANTS.INVALID_DESCRIPTION", value => !value || !AT_NOT_ALLOWED_REGEX.test(value))
      ,
      industry: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
      registrationNumber: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED")
        .test("no-emojis", "GLOBAL_CONSTANTS.INVALID_REGISTRATION_NUMBER", value => !value || !EMOJI_REGEX.test(value))
        .test("no-html", "GLOBAL_CONSTANTS.INVALID_REGISTRATION_NUMBER", value => !value || !HTML_REGEX.test(value))
        .test("first-not-special", "GLOBAL_CONSTANTS.INVALID_REGISTRATION_NUMBER", value => !value || FIRST_CHAR_REGEX.test(value))
        .test("no-@at-symbol", "GLOBAL_CONSTANTS.INVALID_REGISTRATION_NUMBER", value => !value || !AT_NOT_ALLOWED_REGEX.test(value))
        .test("no-special-characters", "GLOBAL_CONSTANTS.INVALID_REGISTRATION_NUMBER", value => !SPECIAL_CHAR_REGEX.test(value)),
      taxId: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED")
        .test("no-emojis", "GLOBAL_CONSTANTS.INVALID_TAXID", value => !value || !EMOJI_REGEX.test(value))
        .test("no-html", "GLOBAL_CONSTANTS.INVALID_TAXID", value => !value || !HTML_REGEX.test(value))
        .test("first-not-special", "GLOBAL_CONSTANTS.INVALID_TAXID", value => !value || FIRST_CHAR_REGEX.test(value))
        .test("no-@at-symbol", "GLOBAL_CONSTANTS.INVALID_TAXID", value => !value || !AT_NOT_ALLOWED_REGEX.test(value))
        .test("no-special-characters", "GLOBAL_CONSTANTS.INVALID_TAXID", value => !SPECIAL_CHAR_REGEX.test(value)),
      website: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED")
        .test("no-emojis", "GLOBAL_CONSTANTS.INVALID_WEBSITE", value => !value || !EMOJI_REGEX.test(value))
        .test("no-html", "GLOBAL_CONSTANTS.INVALID_WEBSITE", value => !value || !HTML_REGEX.test(value))
        .test("first-not-special", "GLOBAL_CONSTANTS.INVALID_WEBSITE", value => !value || FIRST_CHAR_REGEX.test(value))
        .test("no-@at-symbol", "GLOBAL_CONSTANTS.INVALID_WEBSITE", value => !value || !AT_NOT_ALLOWED_REGEX.test(value))
        .test("website-format", "GLOBAL_CONSTANTS.INVALID_WEBSITE_URL", value => !value || WEB_SITE_REGEX.test(value)
        )

      ,
    });
  }
  if (includes('companydocuments')) {
    Object.assign(schemaShape, {
      shareholderRegistry: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
      certificateofincorporation: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED")
    })
  }
  // Personal information validation
  if(includes("personalinformation")){
    Object.assign(schemaShape, {
    ubo:Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED")
    })
  }
  // if (includes("personalinformation")) {
  //   Object.assign(schemaShape, {
  //     firstName: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED")
  //       .test("no-emojis", "GLOBAL_CONSTANTS.INVALID_FIRST_NAME", value => !value || !EMOJI_REGEX.test(value))
  //       .test("no-html", "GLOBAL_CONSTANTS.INVALID_FIRST_NAME", value => !value || !HTML_REGEX.test(value))
  //       .test("first-not-special", "GLOBAL_CONSTANTS.INVALID_FIRST_NAME", value => !value || FIRST_CHAR_REGEX.test(value))
  //       .test("no-@at-symbol", "GLOBAL_CONSTANTS.INVALID_FIRST_NAME", value => !value || !AT_NOT_ALLOWED_REGEX.test(value))
  //       .test("no-special-characters", "GLOBAL_CONSTANTS.INVALID_FIRST_NAME", value => !SPECIAL_CHAR_REGEX.test(value)),
  //     lastName: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED")
  //       .test("no-emojis", "GLOBAL_CONSTANTS.INVALID_LAST_NAME", value => !value || !EMOJI_REGEX.test(value))
  //       .test("no-html", "GLOBAL_CONSTANTS.INVALID_LAST_NAME", value => !value || !HTML_REGEX.test(value))
  //       .test("first-not-special", "GLOBAL_CONSTANTS.INVALID_LAST_NAME", value => !value || FIRST_CHAR_REGEX.test(value))
  //       .test("no-@at-symbol", "GLOBAL_CONSTANTS.INVALID_LAST_NAME", value => !value || !AT_NOT_ALLOWED_REGEX.test(value))
  //       .test("no-special-characters", "GLOBAL_CONSTANTS.INVALID_LAST_NAME", value => !SPECIAL_CHAR_REGEX.test(value)),
  //     dateOfBirth: Yup.date().nullable().required("GLOBAL_CONSTANTS.IS_REQUIRED")
  //       .test('is-18-years-old', "GLOBAL_CONSTANTS.AT_LEAST_18_YEARS", function (value) {
  //         if (!value) return false;
  //         const today = moment();
  //         const birthDate = moment(value);
  //         return today.diff(birthDate, 'years') >= 18;
  //       }),
  //     country: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
  //     email: Yup.string().email("GLOBAL_CONSTANTS.INVALID_EMAIL").required("GLOBAL_CONSTANTS.IS_REQUIRED"),
  //     phoneCode: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
  //     phoneNumber: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED")
  //       .test("no-emojis", "GLOBAL_CONSTANTS.INVALID_PHONE_NUMBER", value => !value || !EMOJI_REGEX.test(value))
  //       .test("no-html", "GLOBAL_CONSTANTS.INVALID_PHONE_NUMBER", value => !value || !HTML_REGEX.test(value))
  //       .test("first-not-special", "GLOBAL_CONSTANTS.INVALID_PHONE_NUMBER", value => !value || FIRST_CHAR_REGEX.test(value))
  //       .test("no-@at-symbol", "GLOBAL_CONSTANTS.INVALID_PHONE_NUMBER", value => !value || !AT_NOT_ALLOWED_REGEX.test(value))
  //       .test("no-special-characters", "GLOBAL_CONSTANTS.INVALID_PHONE_NUMBER", value => !SPECIAL_CHAR_REGEX.test(value))
  //   });
  // }
  // // Personal identification documents
  // if (includes("personalidentification")) {
  //   const normalizedIdType = values?.idType?.toLowerCase()?.replace(/\s+/g, '').trim();

  //   Object.assign(schemaShape, {
  //     idType: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
  //     ...(["passport", "driverslicense", "nationalid", "hongkongid"].includes(normalizedIdType)
  //       ? {
  //         idNumber: Yup.string()
  //           .required("GLOBAL_CONSTANTS.IS_REQUIRED")
  //           .test('valid-format', "Document number can only contain letters and numbers", (value) => {
  //             if (!value) return true;
  //             return DOCUMENT_NUMBER_REGEX.test(value);
  //           })
  //           .test('no-emojis', "Document number cannot contain emojis", (value) => {
  //             if (!value) return true;
  //             return !EMOJI_REGEX.test(value);
  //           })
  //           .test('no-html', "Document number cannot contain HTML tags", (value) => {
  //             if (!value) return true;
  //             return !HTML_REGEX.test(value);
  //           })
  //           .max(30, "Document number must not exceed 30 characters"),
  //       }
  //       : {}),
  //     ...(["passport", "driverslicense", "nationalid", "hongkongid"].includes(normalizedIdType)
  //       ? {
  //         profilePicFront: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
  //       }
  //       : {}),

  //     ...(["passport", "driverslicense", "nationalid", "hongkongid"].includes(normalizedIdType)
  //       ? {
  //         profilePicBack: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
  //       }
  //       : {}),

  //     ...(["passport", "driverslicense"].includes(normalizedIdType)
  //       ? {

  //         docIssueDate: Yup.date().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
  //       }
  //       : {}),
  //     ...(["passport", "driverslicense"].includes(normalizedIdType)
  //       ? {
  //         docExpireDate: Yup.date().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
  //       }
  //       : {}),

  //   });
  // }


  return Yup.object().shape(schemaShape);
};

