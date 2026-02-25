import * as Yup from "yup";
const HTML_REGEX = /<[^>]*>?/g;
const EMOJI_REGEX = /\p{Extended_Pictographic}/u;
const ONLY_NUMBERS_REGEX = /^\d+$/;
const SPACE_NUMBERS_REGEX = /^(?=.*\S).+$/;
const POSTAL_CODE_REGEX = /^[A-Za-z0-9\s-]+$/;
const CONTAINS_NUMBER = /\d/;
const CONTAINS_LETTER = /[A-Za-z]/;
const CONTAINS_SPECIAL_CHAR = /[\/\-,.#()&'"]/;
const VALID_GLOBAL_REGEX = /^[A-Za-z\s-]+$|^[A-Za-z\s-]+\d+$/;
const IP_ADDRESS_REGEX = /^(\d{1,3}\.){3}\d{1,3}$/;

export const CreateAccSchema = Yup.object().shape({
    email: Yup.string()
        .required("GLOBAL_CONSTANTS.IS_REQUIRED")
        .matches(
            /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            "GLOBAL_CONSTANTS.INVALID_EMAIL"),
    phoneNumber: Yup.string()
        .required("GLOBAL_CONSTANTS.IS_REQUIRED")
        .test('only numbers', "GLOBAL_CONSTANTS.INVALID_PHONE_NUMBER", value => {
            if (!value) return true;
            return ONLY_NUMBERS_REGEX.test(value);
        })
        .min(6, "GLOBAL_CONSTANTS.PHONE_NUMBER_AT_LEAST")
        .max(13, "GLOBAL_CONSTANTS.PHONE_NUMBER_MAX"),
    phoneCode: Yup.string()
        .required("GLOBAL_CONSTANTS.IS_REQUIRED"),
    postalCode: Yup.string()
        .required("GLOBAL_CONSTANTS.IS_REQUIRED")
        .test('valid-format', "GLOBAL_CONSTANTS.INVALID_POSTAL_CODE", value => {
            if (!value) return true;
            return POSTAL_CODE_REGEX.test(value);
        })

        .test('no-emojis', "GLOBAL_CONSTANTS.INVALID_POSTAL_CODE", value => {
            if (!value) return true;
            return !EMOJI_REGEX.test(value);
        })
        .test('no-html', "GLOBAL_CONSTANTS.INVALID_POSTAL_CODE", value => {
            if (!value) return true;
            return !HTML_REGEX.test(value);
        })
        .min(3, "GLOBAL_CONSTANTS.POSTAL_CODE_AT_LEAST")
        .max(8, "GLOBAL_CONSTANTS.POSTAL_CODE_MAX"),
    addressLine2: Yup.string()
        .nullable()
        .test(
            'valid-state',
            "GLOBAL_CONSTANTS.INVAIDE_ADDRESS_LINE2",
            (value) => {
                if (!value) return true;
                const VALID_STATE_REGEX = /^(?=.*[A-Za-z0-9]).+$/
                return (
                    VALID_STATE_REGEX.test(value.trim()) &&
                    !EMOJI_REGEX.test(value) &&
                    (
                        CONTAINS_LETTER.test(value) ||
                        (CONTAINS_NUMBER.test(value) && CONTAINS_SPECIAL_CHAR.test(value))
                    )
                );
            }
        )
        .max(100, "GLOBAL_CONSTANTS.ADDRESS_LINE2_MAX"),
    addressLine1: Yup.string()
        .required("GLOBAL_CONSTANTS.IS_REQUIRED")
        .test(
            'valid-address',
            "GLOBAL_CONSTANTS.INVAIDE_ADDRESS_LINE1",
            (value) => {
                if (!value) return true;
                const VALID_STATE_REGEX = /^(?=.*[A-Za-z0-9]).+$/
                return (
                    VALID_STATE_REGEX.test(value.trim()) &&
                    !EMOJI_REGEX.test(value) &&
                    (
                        CONTAINS_LETTER.test(value) ||
                        (CONTAINS_NUMBER.test(value) && CONTAINS_SPECIAL_CHAR.test(value))
                    )
                );
            }
        )
        .max(100, "GLOBAL_CONSTANTS.ADDRESS_LINE1_MAX"),
    city: Yup.string()
        .required("GLOBAL_CONSTANTS.IS_REQUIRED")
        .test(
            'valid-state',
            "GLOBAL_CONSTANTS.INVALID_CITY",
            (value) => {
                if (!value) return true;
                const VALID_STATE_REGEX = /^[A-Za-z\s-]+$|^[A-Za-z\s-]+\d+$/;
                return VALID_STATE_REGEX.test(value.trim());
            }
        )
        .max(50, "GLOBAL_CONSTANTS.INVALID_CITY"),
    state: Yup.string()
        .required("GLOBAL_CONSTANTS.IS_REQUIRED")
        .matches(VALID_GLOBAL_REGEX, "GLOBAL_CONSTANTS.INVALID_STATE")
        .test('no-emojis', "GLOBAL_CONSTANTS.INVALID_STATE", value => {
            if (!value) return true;
            return !EMOJI_REGEX.test(value);
        })
        .max(50, "GLOBAL_CONSTANTS.INVALID_STATE"),

    town: Yup.string()
        .required("GLOBAL_CONSTANTS.IS_REQUIRED")
        .matches(VALID_GLOBAL_REGEX, "GLOBAL_CONSTANTS.INVALID_TOWN")
        .test('no-emojis', "GLOBAL_CONSTANTS.INVALID_TOWN", value => {
            if (!value) return true;
            return !EMOJI_REGEX.test(value);
        })
        .max(50, "GLOBAL_CONSTANTS.INVALID_TOWN"),

    country: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED").nullable(),
    lastName: Yup.string()
        .required("GLOBAL_CONSTANTS.IS_REQUIRED")
        .matches(/^[a-zA-Z0-9 ]*$/, "GLOBAL_CONSTANTS.INVALID_LAST_NAME")
        .test('no-emojis', "GLOBAL_CONSTANTS.INVALID_LAST_NAME", value => {
            if (!value) return true;
            return !EMOJI_REGEX.test(value);
        })
        .test('no-only-numbers', "GLOBAL_CONSTANTS.INVALID_LAST_NAME", value => {
            if (!value) return true;
            return /[a-zA-Z]/.test(value);
        })
        .test('no-html', "GLOBAL_CONSTANTS.INVALID_LAST_NAME", value => {
            if (!value) return true;
            return !HTML_REGEX.test(value);
        })
        .test('no-whitespace', "GLOBAL_CONSTANTS.INVALID_LAST_NAME", value => {
            if (!value) return true;
            return SPACE_NUMBERS_REGEX.test(value);
        })
        .max(50, "GLOBAL_CONSTANTS.LAST_NAME_MUST_50CHARACTER"),
    firstName: Yup.string()
        .required("GLOBAL_CONSTANTS.IS_REQUIRED")
        .matches(/^[a-zA-Z0-9 ]*$/, "GLOBAL_CONSTANTS.INVALID_FIRST_NAME")
        .test('no-only-numbers', "GLOBAL_CONSTANTS.INVALID_FIRST_NAME", value => {
            if (!value) return true;
            return /[a-zA-Z]/.test(value);
        })
        .test('no-emojis', "GLOBAL_CONSTANTS.INVALID_FIRST_NAME", value => {
            if (!value) return true;
            return !EMOJI_REGEX.test(value);
        })
        .test('no-html', "GLOBAL_CONSTANTS.INVALID_FIRST_NAME", value => {
            if (!value) return true;
            return !HTML_REGEX.test(value);
        })
        .test('no-whitespace', "GLOBAL_CONSTANTS.INVALID_FIRST_NAME", value => {
            if (!value) return true;
            return SPACE_NUMBERS_REGEX.test(value);
        })
        .max(50, "GLOBAL_CONSTANTS.LAST_NAME_MUST_50CHARACTER"),

    favoriteName: Yup.string()
        .required("GLOBAL_CONSTANTS.IS_REQUIRED")
        .matches(/^[a-zA-Z0-9 ]*$/, "GLOBAL_CONSTANTS.INVALID_FAVORITE_NAME")
        .test('no-only-numbers', "GLOBAL_CONSTANTS.INVALID_FAVORITE_NAME", value => {
            if (!value) return true;
            return /[a-zA-Z]/.test(value);
        })
        .test('no-emojis', "GLOBAL_CONSTANTS.INVALID_FAVORITE_NAME", value => {
            if (!value) return true;
            return !EMOJI_REGEX.test(value);
        })
        .test('no-html', "GLOBAL_CONSTANTS.INVALID_FAVORITE_NAME", value => {
            if (!value) return true;
            return !HTML_REGEX.test(value);
        })
        .test('no-whitespace', "GLOBAL_CONSTANTS.INVALID_FAVORITE_NAME", value => {
            if (!value) return true;
            return SPACE_NUMBERS_REGEX.test(value);
        })
        .max(50, "GLOBAL_CONSTANTS.FAVORITE_NAME_MUST_50CHARACTER"),
    addressType: Yup.string()
        .required("GLOBAL_CONSTANTS.IS_REQUIRED")
        .nullable(),
});


const DOCUMENT_NUMBER_REGEX = /^[a-zA-Z0-9]+$/;

const createDocumentNumberValidation = () => {
    return Yup.string()
        .required("GLOBAL_CONSTANTS.IS_REQUIRED")
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
        .min(6, "Document number must be at least 6 characters")
        .max(30, "Document number must not exceed 30 characters");
};



export const KybAddUobsSchema = Yup.object().shape({
    firstName: Yup.string()
        .required("GLOBAL_CONSTANTS.IS_REQUIRED")
        .matches(/^[a-zA-Z0-9 ]*$/, "GLOBAL_CONSTANTS.INVALID_FIRST_NAME")  // Allow letters, numbers, and spaces
        .test('no-only-numbers', "GLOBAL_CONSTANTS.INVALID_FIRST_NAME", value => {
            if (!value) return true;
            return /[a-zA-Z]/.test(value);
        })
        .test('no-emojis', "GLOBAL_CONSTANTS.INVALID_FIRST_NAME", value => {
            if (!value) return true;
            return !EMOJI_REGEX.test(value);
        })
        .test('no-html', "GLOBAL_CONSTANTS.INVALID_FIRST_NAME", value => {
            if (!value) return true;
            return !HTML_REGEX.test(value);
        })
        .max(50, "GLOBAL_CONSTANTS.FIRST_NAME_MUST_50CHARACTER"),
    lastName: Yup.string()
        .required("GLOBAL_CONSTANTS.IS_REQUIRED")
        .matches(/^[a-zA-Z0-9 ]*$/, "GLOBAL_CONSTANTS.INVALID_LAST_NAME")
        .test('no-emojis', "GLOBAL_CONSTANTS.INVALID_LAST_NAME", value => {
            if (!value) return true;
            return !EMOJI_REGEX.test(value);
        })
        .test('no-only-numbers', "GLOBAL_CONSTANTS.INVALID_LAST_NAME", value => {
            if (!value) return true;
            return /[a-zA-Z]/.test(value);
        })
        .test('no-html', "GLOBAL_CONSTANTS.INVALID_LAST_NAME", value => {
            if (!value) return true;
            return !HTML_REGEX.test(value);
        })
        .max(50, "GLOBAL_CONSTANTS.LAST_NAME_MUST_50CHARACTER"),
    middleName: Yup.string()
        .nullable()
        .matches(/^[a-zA-Z0-9 ]*$/, "GLOBAL_CONSTANTS.INVALID_MIDDLE_NAME")
        .test('no-emojis', "GLOBAL_CONSTANTS.INVALID_MIDDLE_NAME", value => {
            if (!value) return true;
            return !EMOJI_REGEX.test(value);
        })
        .test('no-html', "GLOBAL_CONSTANTS.INVALID_MIDDLE_NAME", value => {
            if (!value) return true;
            return !HTML_REGEX.test(value);
        })
        .test('valid-characters', "GLOBAL_CONSTANTS.INVALID_MIDDLE_NAME", value => {
            if (!value) return true;
            return /^[A-Za-z]+(?:\s+[A-Za-z0-9]+)*$/.test(value.trim());
        })
        .max(50, "GLOBAL_CONSTANTS.MIDLE_NAME_MUST_50CHARACTER"),
    uboPosition: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
    dob: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED").test(
        "is-18-years-old",
        "GLOBAL_CONSTANTS.AT_LEAST_18_YEARS",
        (value) => {
            if (!value) return true;
            const today = new Date();
            const dob = new Date(value);
            const age = today.getFullYear() - dob.getFullYear();
            const monthDiff = today.getMonth() - dob.getMonth();
            const dayDiff = today.getDate() - dob.getDate();
            return (
                age > 18 ||
                (age === 18 && (monthDiff > 0 || (monthDiff === 0 && dayDiff >= 0)))
            );
        }
    ),
    phoneNumber: Yup.string()
        .required("GLOBAL_CONSTANTS.IS_REQUIRED")
        .matches(/^\d{6,12}$/, " Invalid phone number"),
    phoneCode: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
    shareHolderPercentage: Yup.string()
        .required("GLOBAL_CONSTANTS.IS_REQUIRED")
        .matches(
            /^(?:\d+(?:\.\d{1,2})?)$/,
            "GLOBAL_CONSTANTS.ONLY_TWO_DECIMALS"
        )
        .test(
            "min-value",
            "GLOBAL_CONSTANTS.VALUE_MUST_25_OR_MORE",
            (value) => parseFloat(value || "0") >= 25
        )
        .test(
            "max-value",
            "GLOBAL_CONSTANTS.VALUE_MUST_100",
            (value) => parseFloat(value || "0") <= 100
        ),
    email: Yup.string()
        .transform(value => value?.trim())
        .required("GLOBAL_CONSTANTS.IS_REQUIRED")
        .matches(
            /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            "GLOBAL_CONSTANTS.INVALID_EMAIL"),
    country: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
    docType: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
    // idIssuedCountry: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
    docNumber: Yup.string()
        .required("GLOBAL_CONSTANTS.IS_REQUIRED")
        .test('valid-format', "GLOBAL_CONSTANTS.INVALID_DOCUMENT_NUMBER", value => {
            if (!value) return true;
            return POSTAL_CODE_REGEX.test(value);
        })
        .test('no-emojis', "GLOBAL_CONSTANTS.INVALID_DOCUMENT_NUMBER", value => {
            if (!value) return true;
            return !EMOJI_REGEX.test(value);
        })
        .test('no-html', "GLOBAL_CONSTANTS.INVALID_DOCUMENT_NUMBER", value => {
            if (!value) return true;
            return !HTML_REGEX.test(value);
        })
        .min(6, "GLOBAL_CONSTANTS.INVALID_DOCUMENT_NUMBER")
        .max(30, "GLOBAL_CONSTANTS.INVALID_DOCUMENT_NUMBER"),
    docExpiryDate: Yup.string().when('docType', {
        is: (docType: string) => !['ID Card', 'National Id', 'Resident Card'].includes(docType),
        then: (schema) => schema.required("GLOBAL_CONSTANTS.IS_REQUIRED"),
        otherwise: (schema) => schema.nullable()
    }),
    frontId: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
    backImgId: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED")
});
export const getBankKycDocumentsSchema = (requirements: { showPFC: boolean; showPPHS: boolean; showNationalId: boolean }) => {
    let schema: any = {};

    // Add passport fields if PFC or PPHS is required
    if (requirements.showPFC || requirements.showPPHS) {
        schema.idNumber = createDocumentNumberValidation();
        schema.docExpiryDate = Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED");
    }

    // Add National ID fields if NI is required
    if (requirements.showNationalId) {
        schema.nationalIdNumber = createDocumentNumberValidation();
        // National ID expiry date is optional
        schema.nationalIdDocExpiryDate = Yup.string();
    }

    return Yup.object().shape(schema);
};

// IP Address validation schema
export const IPAddressSchema = Yup.object().shape({
    ipAddress: Yup.string()
        .required("GLOBAL_CONSTANTS.IS_REQUIRED")
        .test('valid-ip', "GLOBAL_CONSTANTS.INVALID_IP_ADDRESS", value => {
            if (!value) return true;
            if (!IP_ADDRESS_REGEX.test(value)) return false;
            const parts = value.split('.');
            return parts.every(part => parseInt(part) >= 0 && parseInt(part) <= 255);
        })
        .test('no-emojis', "GLOBAL_CONSTANTS.INVALID_IP_ADDRESS", value => {
            if (!value) return true;
            return !EMOJI_REGEX.test(value);
        })
        .test('no-html', "GLOBAL_CONSTANTS.INVALID_IP_ADDRESS", value => {
            if (!value) return true;
            return !HTML_REGEX.test(value);
        })
});

// DOB validation schema
export const DOBSchema = Yup.object().shape({
    dob: Yup.string()
        .required("GLOBAL_CONSTANTS.IS_REQUIRED")
        .test(
            "is-18-years-old",
            "GLOBAL_CONSTANTS.AT_LEAST_18_YEARS",
            (value) => {
                if (!value) return true;
                const today = new Date();
                const dob = new Date(value);
                const age = today.getFullYear() - dob.getFullYear();
                const monthDiff = today.getMonth() - dob.getMonth();
                const dayDiff = today.getDate() - dob.getDate();
                return (
                    age > 18 ||
                    (age === 18 && (monthDiff > 0 || (monthDiff === 0 && dayDiff >= 0)))
                );
            }
        )
});

// KYB Sector and Type validation schema
export const KybSectorTypeSchema = Yup.object().shape({
    sector: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
    type: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED")
});

// Static schema for backward compatibility
export const BankKycDocumentsSchema = Yup.object().shape({
    idNumber: createDocumentNumberValidation(),
    docExpiryDate: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
    nationalIdNumber: createDocumentNumberValidation(),
    nationalIdDocExpiryDate: Yup.string()
});