import moment from 'moment';
import * as Yup from 'yup';
export interface refKycDetailsInterface {
    firstName: any,
    lastName: any,
    country: any,
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
    occupation: any,
    annualSalary: any,
    accountPurpose: any,
    expectedMonthlyVolume: any,
    docissueDate: any
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
    emergencyContactName: string;
    kycRequirements: string;
    occupation: string,
    annualSalary: any,
    accountPurpose: string,
    expectedMonthlyVolume: any,
    docissueDate: string
}
export interface LoadingState {
    profilePicFront: boolean;
    handHoldingIDPhoto: boolean;
    faceImage: boolean;
    signature: boolean;
    biometric: boolean;
    signModelVisible: boolean,
    drawSignModel: boolean,
    facePopup: boolean
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
    disableFields: {}
    cardId: any;

}
const emailRegex = /^[\w-]+(?:\.[\w-]+)*@(?:[\w-]+\.)*\w[\w-]{0,66}\.[a-z]{2,200}(?:\.[a-z]{2})?$/;
const ONLY_NUMBERS_REGEX = /^\d+$/;
const HTML_REGEX = /<[^>]*>?/g;
const EMOJI_REGEX = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{1FAB0}-\u{1FAB6}\u{1FAC0}-\u{1FAC2}\u{1FAD0}\u{200D}\u{2640}\u{200D}\u{2642}]/gu;
const SPACE_NUMBERS_REGEX = /^(?=.*\S).+$/;
const kycValidationMap: Record<string, Record<string, Yup.AnySchema>> = {
    fullname: {
        firstName: Yup.string().required('is required')
            .matches(/^[a-zA-Z ]*$/, "First Name must contain only characters")
            .test('no-emojis', 'First Name cannot contain emojis.', value => {
                if (!value) return true;
                return !EMOJI_REGEX.test(value);
            })
            .test('no-html', 'First Name cannot contain HTML tags.', value => {
                if (!value) return true;
                return !HTML_REGEX.test(value);
            })
            .test('no-whitespace', 'First Name cannot contain whitespace.', value => {
                if (!value) return true;
                return SPACE_NUMBERS_REGEX.test(value);
            }),
        lastName: Yup.string().required('is required')
            .matches(/^[a-zA-Z ]*$/, "Last Name must contain only characters")
            .test('no-emojis', 'Last Name cannot contain emojis.', value => {
                if (!value) return true;
                return !EMOJI_REGEX.test(value);
            })
            .test('no-html', 'Last Name cannot contain HTML tags.', value => {
                if (!value) return true;
                return !HTML_REGEX.test(value);
            })
            .test('no-whitespace', 'Last Name cannot contain whitespace.', value => {
                if (!value) return true;
                return SPACE_NUMBERS_REGEX.test(value);
            }),
        gender: Yup.string().required('is required'),
        dob: Yup.date().nullable().required('Is required')
            .test('is-18-years-old', 'You must be at least 18 years old', function (value) {
                if (!value) return false;
                const today = moment();
                const birthDate = moment(value);
                return today.diff(birthDate, 'years') >= 18;
            }),
    },
    fullnameonly: {
        firstName: Yup.string().required('is required').matches(/^[a-zA-Z ]*$/, "First Name must contain only characters")
            .test('no-emojis', 'First Name cannot contain emojis.', value => {
                if (!value) return true;
                return !EMOJI_REGEX.test(value);
            })
            .test('no-html', 'First Name cannot contain HTML tags.', value => {
                if (!value) return true;
                return !HTML_REGEX.test(value);
            })
            .test('no-whitespace', 'First Name cannot contain whitespace.', value => {
                if (!value) return true;
                return SPACE_NUMBERS_REGEX.test(value);
            }),
        lastName: Yup.string().required('is required')
            .matches(/^[a-zA-Z ]*$/, "Last Name must contain only characters")
            .test('no-emojis', 'Last Name cannot contain emojis.', value => {
                if (!value) return true;
                return !EMOJI_REGEX.test(value);
            })
            .test('no-html', 'Last Name cannot contain HTML tags.', value => {
                if (!value) return true;
                return !HTML_REGEX.test(value);
            })
            .test('no-whitespace', 'Last Name cannot contain whitespace.', value => {
                if (!value) return true;
                return SPACE_NUMBERS_REGEX.test(value);
            }),
    },
    passportonly: {
        idType: Yup.string().required('is required'),
        idNumber: Yup.string().required('is required')
            .matches(/^[a-zA-Z0-9]*$/, "Document Number must contain only characters and numbers")
            .matches(/^(?=.*\S).+$/, "Document Number cannot contain whitespace")
            .test('no-emojis', 'Document Number cannot contain emojis.', value => {
                if (!value) return true;
                return !EMOJI_REGEX.test(value);
            })
            .test('no-html', 'Document Number cannot contain HTML tags.', value => {
                if (!value) return true;
                return !HTML_REGEX.test(value);
            })
            .max(20, "Document Number must be at most 20 characters"),
        profilePicFront: Yup.string().required('is required'),
    },
    passport: {
        docExpiryDate: Yup.date().required('is required')
            .min(moment().startOf('day').toDate(), 'Expiry date must be greater than current date.'),
        idType: Yup.string().required('is required'),
        idNumber: Yup.string().required('is required')
            .matches(/^[a-zA-Z0-9]*$/, "Document Number must contain only characters and numbers")
            .matches(/^(?=.*\S).+$/, "Document Number cannot contain whitespace")
            .test('no-emojis', 'Document Number cannot contain emojis.', value => {
                if (!value) return true;
                return !EMOJI_REGEX.test(value);
            })
            .test('no-html', 'Document Number cannot contain HTML tags.', value => {
                if (!value) return true;
                return !HTML_REGEX.test(value);
            })
            .max(20, "Document Number must be at most 20 characters"),
        profilePicFront: Yup.string().required('is required'),
    },
    comms: {
        mobileCode: Yup.string().required('is required'),
        mobile: Yup.string()
            .test('only numbers', 'Invalid phone number.', value => {
                if (!value) return true;
                return ONLY_NUMBERS_REGEX.test(value);
            })
            .matches(/^\d{5,15}$/, 'Please enter a valid mobile number.'),

        email: Yup.string()
            .required('is required')
            .test(
                'no-html-tags',
                'Please enter valid content',
                (value) => !(/<.*>/.test(value))
            )
            .test(
                'valid-email-format',
                'Invalid email format',
                (value) => {
                    if (!value) return true;
                    return emailRegex.test(value);
                }
            ),
    },
    handedpassport: {
        handHoldingIDPhoto: Yup.string().required('is required'),
    },
    face: {
        faceImage: Yup.string().required('is required'),
    },
    sign: {
        signature: Yup.string().required('is required')
    },

    fulladdress: {
        addressLine1: Yup.string().required('is required').max(100, "Address Line1 must be at most 100 characters")
            .test('no-emojis', 'Address Line1 cannot contain emojis.', value => {
                if (!value) return true;
                return !EMOJI_REGEX.test(value);
            })
            .test('no-html', 'Address Line1 cannot contain HTML tags.', value => {
                if (!value) return true;
                return !HTML_REGEX.test(value);
            })
            .test('no-whitespace', 'Address Line1 cannot contain whitespace.', value => {
                if (!value) return true;
                return SPACE_NUMBERS_REGEX.test(value);
            }),
        city: Yup.string().required('is required').test('no-emojis', 'City cannot contain emojis.', value => {
            if (!value) return true;
            return !EMOJI_REGEX.test(value);
        })
            .test('no-html', 'City cannot contain HTML tags.', value => {
                if (!value) return true;
                return !HTML_REGEX.test(value);
            })
            .test('no-whitespace', 'City cannot contain whitespace.', value => {
                if (!value) return true;
                return SPACE_NUMBERS_REGEX.test(value);
            }).max(50, "City should be max 50"),
        country: Yup.string().required('is required'),
        state: Yup.string().required('is required')
            .test('no-emojis', 'State cannot contain emojis.', value => {
                if (!value) return true;
                return !EMOJI_REGEX.test(value);
            })
            .test('no-html', 'State cannot contain HTML tags.', value => {
                if (!value) return true;
                return !HTML_REGEX.test(value);
            })
            .test('no-whitespace', 'State cannot contain whitespace.', value => {
                if (!value) return true
                return SPACE_NUMBERS_REGEX.test(value);
            }).max(50, "State should be max 50"),
        postalCode: Yup.string()
            .required("Is required")
            .min(4, 'Postal code must be at least 4 characters')
            .max(10, 'Postal code must be at most 8 characters')
            .matches(/^[A-Za-z0-9]+(?:[ -][A-Za-z0-9]+)*$/, 'Invalid Postal Code')
            .test('no-emojis', 'Postal code cannot contain emojis.', value => {
                if (!value) return true;
                return !EMOJI_REGEX.test(value);
            })
            .test('no-html', 'Postal code cannot contain HTML tags.', value => {
                if (!value) return true;
                return !HTML_REGEX.test(value);
            })
            .test('no-whitespace', 'Postal code cannot contain whitespace.', value => {
                if (!value) return true;
                return SPACE_NUMBERS_REGEX.test(value);
            }),
        town: Yup.string().required('is required'),
    },
    emergencycontact: {
        emergencyContactName: Yup.string().required('is required')
    },
    address: {
        addressLine1: Yup.string().required('is required')
    },
    financialprofile: {
        occupation: Yup.string()
            .required('is required')
            .test('no-emojis', 'Occupation cannot contain emojis.', value => {
                if (!value) return true;
                return !EMOJI_REGEX.test(value);
            })
            .test('no-html', 'Occupation cannot contain HTML tags.', value => {
                if (!value) return true;
                return !HTML_REGEX.test(value);
            }),
        annualSalary: Yup.number()
            .required('is required')
            .typeError('Annual Salary must be a number')
            .min(0, 'Annual Salary must be greater than or equal to 0'),
        accountPurpose: Yup.string()
            .required('is required')
            .test('no-emojis', 'Account Purpose cannot contain emojis.', value => {
                if (!value) return true;
                return !EMOJI_REGEX.test(value);
            })
            .test('no-html', 'Account Purpose cannot contain HTML tags.', value => {
                if (!value) return true;
                return !HTML_REGEX.test(value);
            }),
        expectedMonthlyVolume: Yup.number()
            .required('is required')
            .typeError('Expected Monthly Volume must be a number')
            .min(0, 'Expected Monthly Volume must be greater than or equal to 0'),
    }, issuedate: {
        docissueDate: Yup.date()
            .required('is required')
            .max(moment().endOf('day').toDate(), 'Issue date cannot be in the future.')
    },

};

export const generateValidationSchema = (kycReqList: string[]) => {
    const shape: Record<string, Yup.AnySchema> = {};

    kycReqList.forEach((requirement) => {
        if (kycValidationMap[requirement]) {
            Object.assign(shape, kycValidationMap[requirement]);
        }
    });

    return Yup.object().shape(shape);
};
export const CREATE_KYC_ADDRESS_CONST = {
    ACCEPTS_ONLY_JPG_OR_PNG_FORMATE: 'Accepts only jpg or png or jpeg format',
    IMAGE_SIZE_SHOULD_BE_LESS_THAN_20MB: 'Image size should be less than 20MB',
    EXPIRY_DATE_VALIDATION_VALIDATION: "Expiry date must be greater than current date.",
    TITTLE_FULL_NAME: "Personal Information",
    TITTLE_CONTACT_INFORMATION: "Contact Information",
    TITTLE_ID_PROOFS: "ID Proofs",
    TITTLE_ADDRESS_INFORMATION: "Address Information",
    TITTLE_EMERGENCY_CONTACT: "Emergency Contact",
    TITTLE_FINANCIAL_PROFILE: "Financial Profile",
    TITTLE_ISSUE_DATE: "Issue Date"
};
export const FORM_DATA_CONSTANTS = {
    FIRST_NAME: "firstName",
    LAST_NAME: "lastName",
    DOB: "dob",
    MOBILE: "mobile",
    EMAIL: "email",
    ID_TYPE: "idType",
    ID_NUMBER: "idNumber",
    ADDRESS_LINE1: "addressLine1",
    COUNTRY: "country",
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
    ACCOUNT_PURPOSE: "accountPurpose",
    EXPECTED_MONTHLY_VOLUME: "expectedMonthlyVolume",
    ANNUAL_SALARY: "annualSalary",
    OCCUPATION: "occupation",

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
    UPLOAD_YOUR_HAND_HOLD_PHOTO_ID_20MB: "Upload Your Hand Holding Photo ID  (20 MB)",
    UPLOAD_YOUR_HAND_HOLD_ID_PHOTO: "Upload Your Hand Holding Photo ID",
    UPLOAD_YOUR_FACE_PHOTO_20MB: "Upload Your Face Photo (20 MB)",
    UPLOAD_YOUR_FACE_PHOTO: "Upload Your Face Photo",
    UPLOAD_YOUR_SIGNATURE_PHOTO_ID_20MB: "Signature Photo (20 MB)",
    UPLOAD_YOUR_SIGNATURE_PHOTO: "Upload Your Signature Photo",
    UPLOAD_YOUR_BIOMETRIC_PHOTO_ID_20MB: "Upload Your Biometric Photo (20 MB)",
    UPLOAD_YOUR_BIOMETRIC_PHOTO: "Upload Your biometric Photo",
    ADDRESS_LINE1: "Address Line 1",
    COUNTRY: "Country ",
    STATE: "State ",
    TOWN: "Town ",
    CITY: "City ",
    POSTAL_CODE: "Postal Code ",
    EMERGENCY_CONTACT_NAME: "Emergency Contact Name ",
    ADD_YOUR_SIGNATURE: "Add Your Signature",
    OCCUPATION: "Occupation",
    ANNUAL_SALARY: "Annual Salary",
    ACCOUNT_PURPOSE: "Account Purpose",
    EXPECTED_MONTHLY_VOLUME: "Expected Monthly Volume",
    ISSUE_DATE: "Issue Date"

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
    ENTER_ANNUAL_SALARY: " Enter Annual Salary",
    ENTER_ACCOUNT_PURPOSE: " Enter Account Purpose",
    ENTER_EXPECTED_MONTHLY_VOLUME: " Enter Expected Monthly Volume",
    SELECT_OCCUPATION: "Select Occupation",
}

export const feePhysicalCardApplyValidation = (applyCardsInfo: any) => {
    return Yup.object({
        cardNumber: Yup.string()
            .required("is required")
            .length(16, "Card number must be 16 digits long"),

        envelopenumber: applyCardsInfo?.envelopeNoRequired
            ? Yup.string().required("is required").matches(/^[a-zA-Z0-9]+$/, "Envelope number must be alphanumeric")
            : Yup.string().notRequired(),

        handHoldingIdPhoto: applyCardsInfo?.additionalDocforActiveCard !== null
            ? Yup.string().required("is required")
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
