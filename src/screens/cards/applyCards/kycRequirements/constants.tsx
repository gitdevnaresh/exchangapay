import moment from 'moment';
import * as Yup from 'yup';
export interface RefKycDetailsInterface {
    firstName: any,
    lastName: any,
    middleName: any,
    country: any,
    addressCountry: any,
    state: any,
    dob: any,
    gender: any,
    city: any,
    town: any,
    addressLine1: any,
    mobile: any,
    mobileCode: any,
    email: any,
    idType: any,
    idNumber: any,
    docExpiryDate: any,
    postalCode: any,
    faceImage: any,
    signature: any,
    profilePicBack: any,
    profilePicFront: any,
    handHoldingIDPhoto: any,
    biometric: any,
    emergencyContactName: any,
    kycRequirements: any,
    idImage: any,
    address: any,
    addressId: any,
    docNumber: any,
    faceImage1: any,
    mixedPhoto: any,
    occupation: any,
    annualSalary: any,
    sourceOfIncome: any,
    accountPurpose: any,
    expectedMonthlyVolume: any,
    docissueDate: any,
    addressLine2: any
}
export interface FormData {
    firstName: string;
    lastName: string;
    middleName: string;
    country: string;
    state: string;
    dob: string;
    gender: string;
    city: string;
    town: string;
    addressLine1: string;
    mobile: string;
    mobileCode: string;
    email: string;
    idType: string;
    idNumber: string;
    docExpiryDate: string;
    postalCode: string;
    faceImage: string;
    signature: string;
    profilePicBack: string;
    profilePicFront: string;
    handHoldingIDPhoto: string;
    biometric: string;
    emergencyContactName: string;
    kycRequirements: string;
    beneficiaryType: string;
    beneficiary: string;
    mixedPhoto: string | null;
    occupation: string | null,
    annualSalary: string | null,
    sourceOfIncome: string | null,
    accountPurpose: string | null,
    expectedMonthlyVolume: string | null,
    docissueDate: string | null,
    addressLine2: string | null,
    isDefault?: boolean,
    documentTypeCode?: string,
    isDocumentsRequriedOrNot?: boolean,
    addressCountry?: string,

}
export interface LoadingState {
    profilePicFront: boolean;
    handHoldingIDPhoto: boolean;
    faceImage: boolean;
    signature: boolean;
    biometric: boolean;
    signModelVisible: boolean,
    drawSignModel: boolean,
    facePopup: boolean,
    idImage: boolean,
    faceImage1: boolean,
    profilePicBack: boolean,
    mixedPhoto: boolean
}
export interface KycAddressProps {
    kycReqList: any[];
    formData: { [key: string]: any };
    touched: any;
    errors: any;
    handleBlur: any;
    values: any;
    setFieldValue: any;
    handleChange: any;
    handleCloseKyc?: any;
    setErrors?: any;
    countries?: any[];
    countriesWithStates?: any[];
    cardId?: any;
    keyRequirements?: any;

}
const HTML_REGEX = /<[^>]*>?/g;
const NAME_REGEX = /^[a-zA-Z][a-zA-Z0-9\s]*$/;
const EMOJI_REGEX = /[\p{Extended_Pictographic}]/u;
const POSTAL_CODE_REGEX = /^[A-Za-z0-9\s-]+$/;
const emailRegex = /^[\w-]+(?:\.[\w-]+)*@(?:[\w-]+\.)*\w[\w-]{0,66}\.[a-z]{2,200}(?:\.[a-z]{2})?$/;
const SPECIAL_CHAR_REGEX = /[!@#$%^&*(),.?":{}|<>]/;
const DOCUMENT_NUMBER_REGEX = /^[a-zA-Z0-9]+$/;
const ONLY_NUMBER_NOT_ALLOWED_REGEX = /^(?!\d+$).+/;
const AT_NOT_ALLOWED_REGEX = /@/;
const FIRST_CHAR_REGEX = /^[A-Za-z0-9]/;
const DROP_DOWN_SPECIAL_CHAR_REGEX = /[!@#$%^&*().?":{}|<>]/;


const kycValidationMap: Record<string, (values?: any, kycReqList?: string[]) => Record<string, Yup.AnySchema>> = {
    fullname: () => ({
        firstName: Yup.string()
            .required("")
            .test('no-html-tags', "GLOBAL_CONSTANTS.INVALID_FIRST_NAME", (value) => !HTML_REGEX.test(value))
            .test('no-emojis', "GLOBAL_CONSTANTS.INVALID_FIRST_NAME", (value) => !EMOJI_REGEX.test(value))
            .test('no-special-characters', "GLOBAL_CONSTANTS.INVALID_FIRST_NAME", (value) => !SPECIAL_CHAR_REGEX.test(value),
            ).test('valid-name-format', "GLOBAL_CONSTANTS.INVALID_FIRST_NAME", (value) => {
                if (!value) return true;
                return NAME_REGEX.test(value);
            }),
        lastName: Yup.string()
            .required("")
            .test('no-html-tags', "GLOBAL_CONSTANTS.INVALID_LAST_NAME", (value) => !HTML_REGEX.test(value))
            .test('no-emojis', "GLOBAL_CONSTANTS.INVALID_LAST_NAME", (value) => !EMOJI_REGEX.test(value))
            .test('no-special-characters', "GLOBAL_CONSTANTS.INVALID_LAST_NAME", (value) => !SPECIAL_CHAR_REGEX.test(value),
            ).test('valid-name-format', "GLOBAL_CONSTANTS.INVALID_LAST_NAME", (value) => {
                if (!value) return true;
                return NAME_REGEX.test(value);
            }),
        dob: Yup.date().nullable().required("")
            .test('is-18-years-old', "GLOBAL_CONSTANTS.AT_LEAST_18_YEARS", function (value) {
                if (!value) return false;
                const today = moment();
                const birthDate = moment(value);
                return today.diff(birthDate, 'years') >= 18;
            }),
        gender: Yup.string().required(""),
        country: Yup.string().required(""),

    }),
    fullnameonly: () => ({
        firstName: Yup.string()
            .required("")
            .test('no-html-tags', "GLOBAL_CONSTANTS.INVALID_FIRST_NAME", (value) => !HTML_REGEX.test(value))
            .test('no-emojis', "GLOBAL_CONSTANTS.INVALID_FIRST_NAME", (value) => !EMOJI_REGEX.test(value))
            .test('no-special-characters', "GLOBAL_CONSTANTS.INVALID_FIRST_NAME", (value) => !SPECIAL_CHAR_REGEX.test(value),
            ).test('valid-name-format', "GLOBAL_CONSTANTS.INVALID_FIRST_NAME", (value) => {
                if (!value) return true;
                return NAME_REGEX.test(value);
            }),
        lastName: Yup.string()
            .required("")
            .test('no-html-tags', "GLOBAL_CONSTANTS.INVALID_LAST_NAME", (value) => !HTML_REGEX.test(value))
            .test('no-emojis', "GLOBAL_CONSTANTS.INVALID_LAST_NAME", (value) => !EMOJI_REGEX.test(value))
            .test('no-special-characters', "GLOBAL_CONSTANTS.INVALID_LAST_NAME", (value) => !SPECIAL_CHAR_REGEX.test(value),
            ).test('valid-name-format', "GLOBAL_CONSTANTS.INVALID_LAST_NAME", (value) => {
                if (!value) return true;
                return NAME_REGEX.test(value);
            }),
        country: Yup.string().required(""),
    }),
    address: () => ({
        address: Yup.string().required(""),
        addressLine1: Yup.string().required("")
            .test('no-html-tags', "GLOBAL_CONSTANTS.INVALID_ADDRESS_LINE1", (value) => !HTML_REGEX.test(value))
            .test('no-emojis', "GLOBAL_CONSTANTS.INVALID_ADDRESS_LINE1", (value) => !EMOJI_REGEX.test(value))
            .test("no-only-numbers", "GLOBAL_CONSTANTS.INVALID_ADDRESS_LINE1", (value) => {
                if (!value) return true;
                return ONLY_NUMBER_NOT_ALLOWED_REGEX.test(value);
            }).test("first-not-special", "GLOBAL_CONSTANTS.INVALID_ADDRESS_LINE1", (value) =>
                value ? FIRST_CHAR_REGEX.test(value) : true
            )
            // ✅ @ is NOT allowed anywhere
            .test("no-at-symbol", "GLOBAL_CONSTANTS.INVALID_ADDRESS_LINE1", (value) =>
                value ? !AT_NOT_ALLOWED_REGEX.test(value) : true
            ),
    }),
    passport: (values?: any, kycReqList?: string[]) => {
        const list = Array.isArray(kycReqList) ? kycReqList : [];
        return {
            docExpiryDate: Yup.date().required(""),
            idType: Yup.string().required("")
                .test('no-html-tags', "GLOBAL_CONSTANTS.INVALID_DOC_TYPE", (value) => !HTML_REGEX.test(value))
                .test('no-emojis', "GLOBAL_CONSTANTS.INVALID_DOC_TYPE", (value) => !EMOJI_REGEX.test(value))
                .test('no-special-characters', "GLOBAL_CONSTANTS.INVALID_DOC_TYPE", (value) => !SPECIAL_CHAR_REGEX.test(value)),
            idNumber: Yup.string().required("")
                .test('valid-format', "Document number can only contain letters and numbers", value => {
                    if (!value) return true;
                    return DOCUMENT_NUMBER_REGEX.test(value);
                })
                .test('no-emojis', "Document number cannot contain emojis", value => {
                    if (!value) return true;
                    return !EMOJI_REGEX.test(value);
                })
                .test('no-html', "Document number cannot contain HTML tags", value => {
                    if (!value) return true;
                    return !HTML_REGEX.test(value);
                })
                .max(30, "Document number must not exceed 30 characters"),
            profilePicFront: Yup.string().required(""),
            docissueDate: Yup.date().required(""),
        }
    },
    comms: () => ({
        mobileCode: Yup.string().required("s"),
        mobile: Yup.number().required(""),
        email: Yup.string()
            .required("")
            .test(
                'no-html-tags',
                "GLOBAL_CONSTANTS.INVALID_EMAIL_ADDRESS",
                (value) => !(/<.*>/.test(value))
            )
            .test(
                'valid-email-format',
                "GLOBAL_CONSTANTS.INVALID_EMAIL_ADDRESS",
                (value) => {
                    if (!value) return true;
                    return emailRegex.test(value);
                }
            ),
    }),
    sign: () => ({
        signature: Yup.string().required("")
    }),
    fulladdress: () => ({
        addressLine1: Yup.string().required("")
            .test('no-emojis', "GLOBAL_CONSTANTS.INVALID_ADDRESS_LINE1", value => {
                if (!value) return true;
                return !EMOJI_REGEX.test(value);
            }).test('no-html', "GLOBAL_CONSTANTS.INVALID_ADDRESS_LINE1", value => {
                if (!value) return true;
                return !HTML_REGEX.test(value);
            }).test("no-only-numbers", "GLOBAL_CONSTANTS.INVALID_ADDRESS_LINE1", (value) => {
                if (!value) return true;
                return ONLY_NUMBER_NOT_ALLOWED_REGEX.test(value);
            }).test("first-not-special", "GLOBAL_CONSTANTS.INVALID_ADDRESS_LINE1", (value) =>
                value ? FIRST_CHAR_REGEX.test(value) : true
            )
            // ✅ @ is NOT allowed anywhere
            .test("no-@at-symbol", "GLOBAL_CONSTANTS.INVALID_ADDRESS_LINE1", (value) =>
                value ? !AT_NOT_ALLOWED_REGEX.test(value) : true
            ),
        // addressLine2: Yup.string().nullable().test('no-emojis', "GLOBAL_CONSTANTS.INVALID_ADDRESS_LINE2", value => {
        //     if (!value) return true;
        //     return !EMOJI_REGEX.test(value);
        // }).test('no-html', "GLOBAL_CONSTANTS.INVALID_ADDRESS_LINE2", value => {
        //     if (!value) return true;
        //     return !HTML_REGEX.test(value);
        // }).test("no-only-numbers", "GLOBAL_CONSTANTS.INVALID_ADDRESS_LINE2", (value) => {
        //     if (!value) return true;
        //     return ONLY_NUMBER_NOT_ALLOWED_REGEX.test(value);
        // })
        //     .test("no-@at-symbol", "GLOBAL_CONSTANTS.INVALID_ADDRESS_LINE2", (value) =>
        //         value ? !AT_NOT_ALLOWED_REGEX.test(value) : true
        //     ),
        city: Yup.string().required("")
            .test('no-emojis', "GLOBAL_CONSTANTS.INVALID_CITY", value => {
                if (!value) return true;
                return !EMOJI_REGEX.test(value);
            }).test('no-special-characters', "GLOBAL_CONSTANTS.INVALID_CITY", (value) => !SPECIAL_CHAR_REGEX.test(value))

            .test('no-html', "GLOBAL_CONSTANTS.INVALID_CITY", value => {
                if (!value) return true;
                return !HTML_REGEX.test(value);
            }),

        addressCountry: Yup.string().required(""),
        state: Yup.string().required("")
            .test('no-emojis', "GLOBAL_CONSTANTS.INVALID_STATE", value => {
                if (!value) return true;
                return !EMOJI_REGEX.test(value);
            }).test('no-special-characters', "GLOBAL_CONSTANTS.INVALID_STATE", (value) => !SPECIAL_CHAR_REGEX.test(value))
            .test('no-html', "GLOBAL_CONSTANTS.INVALID_STATE", value => {
                if (!value) return true;
                return !HTML_REGEX.test(value);
            }).test('no-special-characters', "GLOBAL_CONSTANTS.INVALID_STATE", (value) => !SPECIAL_CHAR_REGEX.test(value)),
        postalCode: Yup.string()
             .required("")
            .test('valid-format', "GLOBAL_CONSTANTS.INVALID_POSTAL_CODE", value => {
                if (!value) return true;
                return POSTAL_CODE_REGEX.test(value);
            })
            .test('no-emojis', "GLOBAL_CONSTANTS.INVALID_POSTAL_CODE", value => {
                if (!value) return true;
                return !EMOJI_REGEX.test(value);
            }).test('no-special-characters', "GLOBAL_CONSTANTS.INVALID_POSTAL_CODE", (value) => !SPECIAL_CHAR_REGEX.test(value))
            .test('no-html', "GLOBAL_CONSTANTS.INVALID_POSTAL_CODE", value => {
                if (!value) return true;
                return !HTML_REGEX.test(value);
            })
            .min(3, "GLOBAL_CONSTANTS.POSTAL_CODE_AT_LEAST")
            .max(8, "GLOBAL_CONSTANTS.POSTAL_CODE_MAX"),
    }),
    emergencycontact: () => ({
        emergencyContactName: Yup.string()
             .required("")
            .test('no-emojis', "GLOBAL_CONSTANTS.INVALID_EMERGENCY_CONTACT_NAME", value => {
                if (!value) return true;
                return !EMOJI_REGEX.test(value);
            })
            .test('no-html', "GLOBAL_CONSTANTS.INVALID_EMERGENCY_CONTACT_NAME", value => {
                if (!value) return true;
                return !HTML_REGEX.test(value);
            }),
    }),
    financialprofile: () => ({
        occupation: Yup.string()
            .required("")
            .test('no-emojis', 'Invalid Occupation', value => {
                if (!value) return true;
                return !EMOJI_REGEX.test(value);
            })
            .test('no-html', 'Invalid Occupation', value => {
                if (!value) return true;
                return !HTML_REGEX.test(value);
            }).test('no-special-characters', "Invalid Occupation", (value) => !DROP_DOWN_SPECIAL_CHAR_REGEX.test(value)),

        annualSalary: Yup.number()
            .required("")
            .typeError('Annual Salary must be a number')
            .min(1, 'Annual Salary must be greater than 0'),

        accountPurpose: Yup.string()
            .required("")
            .test('no-emojis', "GLOBAL_CONSTANTS.INVALID_ACCOUNT_PURPOSE", value => {
                if (!value) return true;
                return !EMOJI_REGEX.test(value);
            }).test('no-special-characters', "GLOBAL_CONSTANTS.INVALID_ACCOUNT_PURPOSE", (value) => !SPECIAL_CHAR_REGEX.test(value))
            .test('no-html', "GLOBAL_CONSTANTS.INVALID_ACCOUNT_PURPOSE", value => {
                if (!value) return true;
                return !HTML_REGEX.test(value);
            }),
        expectedMonthlyVolume: Yup.number()
            .required("")
            .typeError('Expected Monthly Volume must be a number')
            .min(1, 'Expected Monthly Volume must be greater than 0'),
    }),
    handedpassport: () => ({
        handHoldingIDPhoto: Yup.string().required(""),
    }),
    face: () => ({
        faceImage: Yup.string().required(""),
    }),
    idtypes: (values?: any) => {
        const normalizedIdType = values?.idType?.toLowerCase()?.replace(/\s+/g, '').trim();
        return {
            idType: Yup.string()
                .required("")
                .test('no-html-tags', "GLOBAL_CONSTANTS.INVALID_DOC_TYPE", (value) => !HTML_REGEX.test(value))
                .test('no-emojis', "GLOBAL_CONSTANTS.INVALID_DOC_TYPE", (value) => !EMOJI_REGEX.test(value))
                .test('no-special-characters', "GLOBAL_CONSTANTS.INVALID_DOC_TYPE", (value) => !SPECIAL_CHAR_REGEX.test(value)),

            ...(["passport", "driverslicense", "nationalid", "hongkongid"].includes(normalizedIdType)
                ? {
                    idNumber: Yup.string()
                         .required("")
                        .test('valid-format', "Document number can only contain letters and numbers", (value) => {
                            if (!value) return true;
                            return DOCUMENT_NUMBER_REGEX.test(value);
                        })
                        .test('no-emojis', "Document number cannot contain emojis", (value) => {
                            if (!value) return true;
                            return !EMOJI_REGEX.test(value);
                        })
                        .test('no-html', "Document number cannot contain HTML tags", (value) => {
                            if (!value) return true;
                            return !HTML_REGEX.test(value);
                        })
                        .max(30, "Document number must not exceed 30 characters"),
                }
                : {}),
            ...(["passport", "driverslicense", "nationalid", "hongkongid"].includes(normalizedIdType)
                ? {
                    profilePicFront: Yup.string().required(""),
                }
                : {}),

            // ...(["passport", "driverslicense", "nationalid", "hongkongid"].includes(normalizedIdType)
            //     ? {
            //         profilePicBack: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
            //     }
            //     : {}),

            ...(["passport", "driverslicense"].includes(normalizedIdType)
                ? {

                    docissueDate: Yup.date().required(""),
                }
                : {}),
            ...(["passport", "driverslicense"].includes(normalizedIdType)
                ? {
                    docExpiryDate: Yup.date().required(""),
                }
                : {}),



        };
    },

};

export const generateValidationSchema = (kycReqList: string[], values?: any) => {
    const shape: Record<string, Yup.AnySchema> = {};
    kycReqList.forEach((requirement) => {
        if (kycValidationMap[requirement]) {
            Object.assign(shape, kycValidationMap[requirement](values, kycReqList));
        }
    });

    return Yup.object().shape(shape);
};
export const CREATE_KYC_ADDRESS_CONST = {
    ACCEPTS_ONLY_JPG_OR_PNG_FORMATE: 'Accepts only jpg or png or jpeg format',
    IMAGE_SIZE_SHOULD_BE_LESS_THAN_20MB: 'Image size should be less than 20MB',
    EXPIRY_DATE_VALIDATION_VALIDATION: "Expiry date must be greater than Date of Birth",
    ISSUE_DATE_VALIDATION_VALIDATION: "Expiry date must be greater than Issue date",
    TITTLE_FULL_NAME: "Personal Information",
    TITTLE_CONTACT_INFORMATION: "Contact Information",
    TITTLE_ID_PROOFS: "ID Proofs",
    TITTLE_ADDRESS_INFORMATION: "Address Information",
    TITTLE_EMERGENCY_CONTACT: "Emergency Contact",
    CONTENT_NOT_AVAILABLE: "Content not available",
};
export const FORM_DATA_CONSTANTS = {
    FIRST_NAME: "firstName",
    LAST_NAME: "lastName",
    MIDDLE_NAME: "midddleName",
    DOB: "dob",
    MOBILE: "mobile",
    EMAIL: "email",
    ID_TYPE: "idType",
    ID_NUMBER: "idNumber",
    ADDRESS_LINE1: "addressLine1",
    COUNTRY: "country",
    ADDRESS_COUNTRY: "addressCountry",
    STATE: "state",
    TOWN: "town",
    CITY: "city",
    POSTAL_CODE: "postalCode",
    EMERGENCY_CONTACT_NAME: "emergencyContactName",
    SLIDE: "slide",
    SIGN_HERE: "Sign Here",
    CLOSE: "close",
    SAVE: "Save",
    RESET: "Reset",
    FACE_IMAGE: "faceImage",
    FRONT: "front",
    PHOTO: 'photo',
    DOCUMENT: 'document',
    SIGNATURE: 'signature',
    ERROR_RESETTING_SIGNATURE: "Error resetting signature:",
    IMAGE_BYTES: "imageBytes",
    TAKE_SELFIE: "Take Selfie",
    UPLOAD_FROM_GALLERY: "Upload From Gallery",
    ADDRESS: "address",
    SEND_CARD: "sendCard",
    HAVE_CARD: "haveCard",
    DOC_NUMBER: "docNumber",
    ADDRESS_LINE2: "addressLine2",
    GENDER: "gender",
    MOBILE_CODE: "mobileCode",
    PASSPORT: "passport",
    PROFILE_PIC_FORNT: "profilePicFront",
    PROFILE_PIC_BACK: "profilePicBack",
    DOC_EXPIRY_DATE: 'docExpiryDate',
    SELECT_STATE: "Select State",
    SELECT_TOWN: "Select Town",
    ENTER_CITY: "Enter City",
    OCCUPATION: "occupation",
    ANNUAL_SALARY: "annualSalary",
    ACCOUNT_PURPOSE: "accountPurpose",
    EXPECTED_MONTHLY_VOLUME: "expectedMonthlyVolume",
    ISSUE_DATE: 'docissueDate',
    ALRET_MSG: "Permission Denied ,You need to enable permissions to access the image library.",
    ACCEPT_IMG_MSG: "Accepts only jpg ,png and jpeg format",
    ADDRESS_ID: "addressId",
    BIND_CARD_SCREEN: "BindCard",
    IS_DEFAULT: "isDefault",
    PROFILE_ADDRESS_ADD: "profileAddressAdd",
    DOCUMENT_TYPE_CODE: "documentTypeCode",
    IS_DOCUMENT_REQUIRED_OR_NOT: "isDocumentsRequriedOrNot",
    ADDRESS_TYPE: 'addressType',
    COMPANY_CITY: "companyCity",
    COMPANY_ADDRESS_COUNTRY: "companyAddressCountry",
    COMPANY_POSTAL_CODE: "companyPostalCode",
    COMPANY_ADDRESS_LINE1: "companyAddressLine1",
    COMPANY_ADDRESS_LINE2: "companyAddressLine2",
    COMPANY_ADDRESS: "companyAddress",
    COMPANY_STATE: "companyState",
    COMPANY_TOWN: "companyTown",


}
export const FORM_DATA_LABEL = {
    FIRST_NAME: "First Name",
    LAST_NAME: "Last Name",
    GENDER: "Gender",
    DATE_OF_BIRTH: "Date Of Birth ",
    PHONE_NUMBER: "Phone Number ",
    COUNTRY_CODE: "Select Country Code",
    EMAIL: "Email ",
    DOCUMENT_TYPE: "Document Type",
    DOCUMENT_NUMBER: "Document Number",
    DOCUMENT_EXPIRY_DATE: "Document Expiry Date",
    UPLOAD_YOUR_FRONT_PHOTO_ID_20MB: "Upload Your Front Photo ID (20 MB)",
    UPLOAD_YOUR_FRONT_PHOTO_ID: "Upload Your Front Photo ID",
    UPLOAD_YOUR_HAND_HOLD_PHOTO_ID_20MB: "Upload Your Hand Holding Photo ID (20 MB)",
    UPLOAD_YOUR_HAND_HOLD_ID_PHOTO: "Upload Your HandHoldId Photo",
    UPLOAD_YOUR_FACE_PHOTO_20MB: "Upload Your Face Photo (20 MB)",
    UPLOAD_YOUR_FACE_PHOTO: "Upload Your Face Photo",
    UPLOAD_YOUR_SIGNATURE_PHOTO_ID_20MB: "Signature Photo (20 MB)",
    UPLOAD_YOUR_SIGNATURE_PHOTO: "Upload Your Signature Photo",
    UPLOAD_YOUR_BIOMETRIC_PHOTO_ID_20MB: "Upload Your Biometric Photo (20 MB)",
    UPLOAD_YOUR_BIOMETRIC_PHOTO: "Upload Your biometric Photo",
    ADDRESS_LINE1: "Address Line1",
    COUNTRY: "Country ",
    STATE: "State ",
    TOWN: "Town ",
    CITY: "City ",
    POSTAL_CODE: "Postal Code ",
    EMERGENCY_CONTACT_NAME: "Emergency Contact Name ",
    ADD_YOUR_SIGNATURE: "Add Your Signature",
    VIRTUAL: 'virtual',
    ADDRESS_LINE2: "Address Line2",
    OCCUPATION: "Occupation",
    ANNUAL_SALARY: "Annual Salary",
    ACCOUNT_PURPOSE: "Account Purpose",
    EXPECTED_MONTHLY_VOLUME: "Expected Monthly Volume",
    ISSUE_DATE: "Document Issue Date",

}
export const FORM_DATA_PLACEHOLDER = {
    ENTER_FIRST_NAME: "Enter First Name",
    ENTER_LAST_NAME: "Enter Last Name",
    SELECT: "Select",
    ENTER_PHONE_NUMBER: "Enter Phone Number",
    PHONE_PAD: "phone-pad",
    ENTER_EMAIL: "Enter Email",
    UPLOAD_NOTE1: "Please upload the photo of the information page with your profile pictures ",
    UPLOAD_NOTE2: "Ensures that the ID frame is complete, the font is clear, and the brightness is uniform ",
    SELECT_DOCUMENT_TYPE: "Select Document Type",
    ENTER_DOCUMENT_NUMBER: "Enter Document Number",
    ADDRESS_LINE1: "Eg.Room2,Bulding A,888XXX Street,XX",
    SELECT_COUNTRY: "Select Country",
    ENTER_STATE: "Enter State",
    SELECT_TOWN: "Select Town",
    ENTER_CITY: "Enter City",
    ENTER_POSTAL_CODE: "Enter Postal Code",
    NUMERIC: "numeric",
    EMERGENCY_CONTACT_NAME: " Enter Emergency Contact Name",
    ENTER_ADDRESS_LINE_1: "Enter Address Line1",
    ENTER_ADDRESS_LINE_2: "Enter Address Line2",
    SELECT_OCCUPATION: "Select Occupation",
    ENTER_ANNUAL_SALARY: "Enter Annual Salary",
    ENTER_ACCOUNT_PURPOSE: "Enter Account Purpose",
    ENTER_EXCEPTED_MONTHLY_VOLUME: "Enter Expected Monthly Volume",
    SEARCH_OCCUPATION: "Search Occupation",


}

export const feePhysicalCardApplyValidation = (applyCardsInfo: any) => {
    return Yup.object({
        cardNumber:
            applyCardsInfo?.cardType === "Physical"
                ? Yup.string()
                    .required("")
                    .matches(/^\d+$/, "GLOBAL_CONSTANTS.INVALID_CARD_NUMBER")
                    .length(16, "GLOBAL_CONSTANTS.CARD_NUMBER_MUST_16_DIGITS")
                : Yup.string().notRequired(),

        envelopenumber: applyCardsInfo?.envelopeNoRequired
            ? Yup.string().required("").matches(/^[a-zA-Z0-9]+$/, "GLOBAL_CONSTANTS.ENVELOPE_NUMBER_MUST_BE_ALPHANUMERIC")
                .test('no-emojis', "GLOBAL_CONSTANTS.INVALID_ENVELOPE_NUMBER", (value) => {
                    if (!value) return true;
                    return !EMOJI_REGEX.test(value);
                })
                .test('no-html-tags', "GLOBAL_CONSTANTS.INVALID_ENVELOPE_NUMBER", (value) => {
                    if (!value) return true;
                    return !HTML_REGEX.test(value);
                })
            : Yup.string().notRequired(),

        handHoldingIdPhoto: applyCardsInfo?.additionaldocForActiveCard !== null
            ? Yup.string().required("")
            : Yup.string().notRequired(),
    });
};

export interface FeePhysicalCardApplyProps {
    touched: any;
    errors: any;
    handleBlur: any;
    values: any;
    setFieldValue: any;
    handleChange: any;
    envelopeNoRequired: any;
    needPhotoForActiveCard: any;
    additionalDocforActiveCard: any;
}
export interface FormData {
    firstName: string;
    lastName: string;
    country: string;
    state: string;
    dob: string;
    gender: string;
    city: string;
    town: string;
    addressLine1: string;
    mobile: string;
    mobileCode: string;
    email: string;
    idType: string;
    idNumber: string;
    docExpiryDate: string;
    postalCode: string;
    faceImage: string;
    signature: string;
    profilePicBack: string;
    profilePicFront: string;
    handHoldingIDPhoto: string;
    biometric: string;
    idImage: null,
    address: null,
    addressId: null,
    docNumber: null,
    faceImage1: null

}

interface PlaceholderConstants {
    ENTER_FIRST_NAME: string;
    REQUIRED_STAR: string;
    ENTER_LAST_NAME: string;
    GENDER: string;
    SELECT_COUNRY: string;
    SELECT_DOCUMENT_TYPE: string;
    ENTER_DOCUMENT_NUMBER: string;
    UPLOAD_YOUR_FRONT_PHOTO_ID: string;
    PLEASE_UPLOAD_THE_A_PHOTO_OF_THE_INFORMATION_PAGE_ALONG_WITH_YOUR_PRIFILE_PICTURE: string;
    ENSURE_THAT_THE_ID_FRAME_IS_FULLY_VISIBLE_THE_FRONT_IS_CLEAR_AND_THE_BRIGHTNESS_IS_UNIFORM: string;
    UPLOAD_YOUR_BACK_PHOTO_ID: string;
    UPLOAD_YOUR_HAND_HOLDING_PHOTO_ID_20MB: string;
    UPLOAD_YOUR_FACE_PHOTO: string;
    ENTER_EMERGENCY_CONTACT_NAME: string;
    TAKE_SELFIE: string;
    UPLOAD_FROM_GALLERY: string;
    FILE_SIZE_ERROR: string;
    FILE_TYPE_ERROR: string;
}
export const PLACEHOLDER_CONSTANTS: PlaceholderConstants = {
    ENTER_FIRST_NAME: "Enter First Name",
    REQUIRED_STAR: " *",
    ENTER_LAST_NAME: "Enter Last Name",
    GENDER: 'gender',
    SELECT_COUNRY: "Select Country",
    SELECT_DOCUMENT_TYPE: "Select Document Type",
    ENTER_DOCUMENT_NUMBER: "Enter Document Number",
    UPLOAD_YOUR_FRONT_PHOTO_ID: "Upload Your Front Photo ID",
    PLEASE_UPLOAD_THE_A_PHOTO_OF_THE_INFORMATION_PAGE_ALONG_WITH_YOUR_PRIFILE_PICTURE: "Please upload a photo of the information page along with your profile picture.",
    ENSURE_THAT_THE_ID_FRAME_IS_FULLY_VISIBLE_THE_FRONT_IS_CLEAR_AND_THE_BRIGHTNESS_IS_UNIFORM: "Ensure that the ID frame is fully visible, the front is clear, and the brightness is uniform.",
    UPLOAD_YOUR_BACK_PHOTO_ID: "Upload Your Back Photo ID",
    UPLOAD_YOUR_HAND_HOLDING_PHOTO_ID_20MB: "Upload Your Hand Holding  Photo ID (20 MB)",
    UPLOAD_YOUR_FACE_PHOTO: "Upload Your Face Photo",
    ENTER_EMERGENCY_CONTACT_NAME: " Enter Emergency Contact Name",
    TAKE_SELFIE: "Take Selfie",
    UPLOAD_FROM_GALLERY: "Upload From Gallery",
    FILE_SIZE_ERROR: "File size exceeds the 15MB limit.",
    FILE_TYPE_ERROR: "Invalid file type. Only JPG, JPEG, and PNG are allowed." // Example message
};
export const PROFILE_CONSTANTS = {
    ADD_YOUR_SIGNATURE: "Add Your Signature",
    UPLOAD_YOUR_SIGNATURE: "Upload Your Signature",
    CLOSE: "close",
    DRAW_YOUR_SIGNATURE: "Draw Your Signature",
    CLOUD_UPLOAD_OUTLINE: "cloud-upload-outline",
    DD_MM_YYYY: "DD-MM-YYYY",
    HANDLED: "handled",
    ARROW_LEFT: "arrowleft",
    NOTE_PLEASE_WRITE_IN_ENGLISH: "Note : Please Write In English",
    ADD_KYC_INFORMATION: "Add KYC Information",
    EDIT_KYC_INFORMATION: "Edit KYC Informaion",
    DATE: "date",
    DARK: "dark",
    CALENDER: "calendar",
    WHITE_COLOR: "#FFF",
    TRANSPARENT: "transparent",
    CENTER: "center",
    LARGE: "large",
    INFO: "info",
    SLIDE: "slide",
    SIGN_HERE: "Sign Here",
    SAVE: "Save",
    RESET: "Reset",
    IS_REQUIRED: "Is required",
    ACCEPTS_ONLY_JPG_OR_PNG_FPRMAT: 'Accepts only jpg or png format.',
    IMAGE_SIZE_SHOULD_BE_LESS_THAN_20MB: 'Image size should be less than 20MB.',
    PHOTO: 'photo',
    DOCUMENT: 'document',
    IMAGE_BYTES: "imageBytes",
    HARDWARE_BACK_PRESSS: 'hardwareBackPress',
    APPLY_EXCHANGE_CARD: "ApplyExchangaCard",
    IOS: 'ios',
    PERMISSION: "Permission Denied",
    CAMERA_ACCESS_IS_NEEDED_TO_TAKE_A_SELFIE: "Camera access is needed to take a selfie.",
    PERMISSION_BLOCKED: "Permission Blocked",
    PLEASE_ENABLE_CAMERA_ACCESS_IN_YOUR_DEVICE_SETTINGS: "Please enable camera access in your device settings.",
    HARDWARE_BACKPRESS: "hardwareBackPress",
    ARROW: "arrowleft",
    REFERRALS_S: "Referral's",
    REFERRAL_CODE: 'Referral Code',
    MY_REFERRALS: 'My Referral',
    CUSTOMER_NAME: "Customer Name",
    JOIN_DATE: "Join Date",
};
export const CONSTANTS = {
    CLOUD_UPLOAD_OUTLINE: "cloud-upload-outline",
    SPLASH_SCREEN: "SplashScreen",
    APPROVED: "Approved",
    DASHBOARD: "Dashboard",
    TRANSPARENT: "transparent",
    EXCHNAGE_LOGO: "https://prdexchangapaystorage.blob.core.windows.net/images/logox_white.svg",
    EXCHANGA_PAY: "Exchanga Pay",
    DRAWER_MODEL: 'DrawerModal',
    COVER: "cover",
    YOUR_ACCOUNT_IS_INPROGRESS: "Your account is Inprogress",
    PLEASE_CONTACT_SUPPORT: "please contact support",
    REFRESH: "Refresh",
    LOG_OUT: "Logout",
    EXCLAMATION_CIRCLE: "exclamationcircleo",
    GO_BACK: "Go Back",
    ACTION_RESTRICTED: "Action Restricted",
    ADMIN_ACCOUNTS_CANNOT_SWITH_TO_USER_MODE_PLASE_LOG_IN_WITH_THE_APPROPRIATE_ACCOUNT_TO_CONTINUE: "Admin accounts cannot switch to user mode. Please log in with the appropriate account to continue.",
}

export interface AssetForSelector {
    id: string; // Unique key for FlatList, e.g., `${coinAPI_ID}_${networkAPI_ID}`
    coinName: string;
    coinCode: string;
    coinImage: string;
    networkName: string; // Display name of network
    networkCode: string; // Code/identifier of network
    amount: number | null; // Balance
    originalCoinId: string; // The ID of the coin from the API
    originalNetworkId: string; // The ID of the network from the API (this is the walletId for getApplyCardDeatilsInfo)
}


export interface AssetForSelector {
    id: string;
    coinName: string;
    coinCode: string;
    coinImage: string;
    networkName: string;
    networkCode: string;
    amount: number | null;
    originalCoinId: string;
    originalNetworkId: string;
}

export interface ApplyCardFormValues {
    handHoldingIdPhoto: string;
    cardNumber: string;
    envelopenumber: string;
    currency: string;
    network: string;
    membernumber: string;
    address: string;
    shippingAddressId: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    postalCode: string;
    addressCountry: string;
    town: string;
}

export interface ApplyCardFormProps {
    commonStyles: any;
    NEW_COLOR: any;
    t: (key: string) => string;
    initialFormValues: ApplyCardFormValues;
    iHaveCard: { haveCard: boolean, sendCard: boolean };
    setIHaveCard: React.Dispatch<React.SetStateAction<{ haveCard: boolean, sendCard: boolean }>>;
    cardsFeeInfo: any;
    onSubmitForm: (values: any) => Promise<void>;
    selectedAssetForDisplay?: AssetForSelector | null;
    setSelectedAssetForDisplay?: React.Dispatch<React.SetStateAction<AssetForSelector | null>>;
    coinWithCurrencyListForSelector?: AssetForSelector[];
    getApplyCardDeatilsInfo?: (networkId?: string, haveCardValue?: boolean) => Promise<void>;
    cardFeeDetailsLoading: boolean;
    cardFeeLoader?: JSX.Element;
    btnLoading: boolean;
    setShippingAddressId?: React.Dispatch<React.SetStateAction<string | null>>;
    selectedCurrency: any;
    selectedNetwork: any;
    currencyList: any[];
    networkList: any[];
    setSelectedCurrency: React.Dispatch<React.SetStateAction<any>>;
    setSelectedNetwork: React.Dispatch<React.SetStateAction<any>>;
    selectHaveCard?: (type: string) => void;
    getNetworkList?: (currencyCode: string) => Promise<void>;
}

export interface CardsFeeInfo {
    cardType: string;
    amountPaid: number;
    issuingFee: number;
    freightFee: number;
    paymentCurrency: string;
    paidNetwork: string;
    firstRecharge: number;
    estimatedPaymentAmount: number;
    cardCurrency: string;
    reviewTime: string;
    additionalDocforActiveCard: string | null;
    setPinRequiredDocs: string | null;
    envelopeNoRequired: string | null;
    kycRequiredWhileApplyCard: string | null;
    needPhotoForActiveCard: string | null;
    needSignforFreezeCard: string | null;
    cardName: string;
}

export interface DocumentType {
    id: string | number; // Assuming documents have an ID
    name: string; // Used for display and value in picker
    // Add other relevant properties from KycDocumentTypes/KybDocumentTypes if needed
}

export interface Town {
    id: string | number;
    name: string;
    // Add other relevant properties if needed
}

export interface Country {
    id: string | number;
    name: string;
    countryWithTowns: string | any[];
    towns: Town[];

}

export interface PhoneCode {
    code: string;
    name: string; // e.g., country name for display
}

export interface MappedAddress {
    id: string | number;
    name: string; // This is the mapped 'fullName'
    [key: string]: any; // To accommodate other properties from the original address object
}

export interface AddressFormValues {
    country: string;
    state: string;
    town: string;
    city: string;
    addressLine1: string;
    addressLine2?: string;
    postalCode?: string;
    [key: string]: any; // optional if you have dynamic keys
}


export interface CountryIdTypesInterface {
    code: string;
    name: string;
    isDocumentsRequriedOrNot: boolean;
}

export const titleMapping: { [key: string]: string | undefined } = {
    fullname: "GLOBAL_CONSTANTS.PERSIONAL_INFORMATION",
    fullnameonly: "GLOBAL_CONSTANTS.PERSIONAL_INFORMATION",
    comms: "GLOBAL_CONSTANTS.CONTACT_INFORMATION",
    passport: "GLOBAL_CONSTANTS.ID_PROOFS",
    passportonly: "GLOBAL_CONSTANTS.ID_PROOFS",
    address: "GLOBAL_CONSTANTS.ADDRESS_INFO",
    fulladdress: "GLOBAL_CONSTANTS.ADDRESS_INFO",
    emergencycontact: "GLOBAL_CONSTANTS.EMERGENCY_CONTACT",
    financialprofile: "GLOBAL_CONSTANTS.FINANCIAL_PROFILE",
    idtypes: "GLOBAL_CONSTANTS.ID_TYPES",
    face: "GLOBAL_CONSTANTS.FACE_IMAGE_TITTLE"
};