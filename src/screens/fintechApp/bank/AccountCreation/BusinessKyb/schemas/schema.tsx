import * as Yup from "yup";
const HTML_REGEX = /<[^>]*>?/g;
const POSTAL_CODE_REGEX = /^[A-Za-z0-9\s-]+$/;
const EMOJI_REGEX = /[\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FAFF}\u{2640}\u{2642}]|\u{200D}/gu;
export const KycStep1Schema = Yup.object().shape({
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
    gender: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
    idIssuingCountry: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
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
    docExpireDate: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
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
});
export const KycStep2Schema = Yup.object().shape({
    documentType: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
});
export const KybCompanyDataSchema = Yup.object().shape({
    companyName: Yup.string()
        .required("GLOBAL_CONSTANTS.IS_REQUIRED")
        .test('no-emojis', "GLOBAL_CONSTANTS.INVALID_COMAPANY_NAME", value => {
            if (!value) return true;
            return !EMOJI_REGEX.test(value);
        })
        .test('no-html', "GLOBAL_CONSTANTS.INVALID_COMAPANY_NAME", value => {
            if (!value) return true;
            return !HTML_REGEX.test(value);
        })
        .test('valid-characters', "GLOBAL_CONSTANTS.INVALID_COMAPANY_NAME", value => {
            if (!value) return true;
            return /^[A-Za-z0-9]+(?:\s+[A-Za-z0-9]+)*$/.test(value.trim());
        })
        .max(50, "GLOBAL_CONSTANTS.COMPANY_NAME_MUST_50CHARACTER"),
    dateOfRegistration: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
    registryImage: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
    certificationImage: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
    country: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
    docType: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
    secondDocument: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
    registrationNumber: Yup.string()
        .required("GLOBAL_CONSTANTS.IS_REQUIRED")
        .matches(/^[a-zA-Z0-9-]*$/, "GLOBAL_CONSTANTS.INVALID_REGISTRATION_NUMBER")
        .test('no-emojis', "GLOBAL_CONSTANTS.INVALID_REGISTRATION_NUMBER", value => {
            if (!value) return true;
            return !EMOJI_REGEX.test(value);
        })
        .test('no-html', "GLOBAL_CONSTANTS.INVALID_REGISTRATION_NUMBER", value => {
            if (!value) return true;
            return !HTML_REGEX.test(value);
        })
        .test('valid-hyphen-usage', "GLOBAL_CONSTANTS.INVALID_REGISTRATION_NUMBER", value => {
            if (!value) return true;
            return !/^-|-$|--/.test(value);
        })
        .max(40, "GLOBAL_CONSTANTS.REGISTRATION_NUMBER_MUST_40CHARACTER")
});

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
    backImgId: Yup.string().when('docType', {
        is: (docType: string) => docType?.toLowerCase() === 'passport',
        then: (schema) => schema.nullable(),
        otherwise: (schema) => schema.required("GLOBAL_CONSTANTS.IS_REQUIRED")
    })
});

export const BankKybDocumentsSchema = Yup.object().shape({
    // Passport fields
    passportDocNumber: Yup.string()
        .required("GLOBAL_CONSTANTS.IS_REQUIRED")
        .test('valid-format', "Invalid document number", value => {
            if (!value) return true;
            return POSTAL_CODE_REGEX.test(value);
        })
        .test('no-emojis', "Invalid document number", value => {
            if (!value) return true;
            return !EMOJI_REGEX.test(value);
        })
        .test('no-html', "Invalid document number", value => {
            if (!value) return true;
            return !HTML_REGEX.test(value);
        })
        .min(6, "Document number must be at least 6 characters")
        .max(30, "Document number must not exceed 30 characters"),
    passportExpiryDate: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
    passportFrontImage: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
    passportBackImage: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
    passportHandHoldingImage: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
    passportSelfieImage: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
    passportSignatureImage: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
    
    // National ID fields
    nationalIdDocNumber: Yup.string()
        .required("GLOBAL_CONSTANTS.IS_REQUIRED")
        .test('valid-format', "Invalid document number", value => {
            if (!value) return true;
            return POSTAL_CODE_REGEX.test(value);
        })
        .test('no-emojis', "Invalid document number", value => {
            if (!value) return true;
            return !EMOJI_REGEX.test(value);
        })
        .test('no-html', "Invalid document number", value => {
            if (!value) return true;
            return !HTML_REGEX.test(value);
        })
        .min(6, "Document number must be at least 6 characters")
        .max(30, "Document number must not exceed 30 characters"),
    nationalIdExpiryDate: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
    nationalIdFrontImage: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
    nationalIdBackImage: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED")
});
export const KybAddDirectorsSchema = Yup.object().shape({
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
        "You must be at least 18 years old",
        (value) => {
            if (!value) return true; // Allow other validations to handle empty cases
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
        .required("Phone number is required")
        .matches(/^\d{6,12}$/, "Invalid phone number"),
    phoneCode: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
    frontId: Yup.string().test(
        "Is required ",
        "GLOBAL_CONSTANTS.IS_REQUIRED",
        function (value) {
            const { backImgId, docType } = this.parent;
            if (!value && (backImgId || docType)) return false;
            return true;
        }
    ),
    backImgId: Yup.string().test(
        "GLOBAL_CONSTANTS.IS_REQUIRED",
        "GLOBAL_CONSTANTS.IS_REQUIRED",
        function (value) {
            const { frontId, docType } = this.parent;
            if (!value && (frontId || docType)) return false;
            return true;
        }
    ),
    docType: Yup.string().test(
        "GLOBAL_CONSTANTS.IS_REQUIRED",
        "GLOBAL_CONSTANTS.IS_REQUIRED",
        function (value) {
            const { frontId, backImgId } = this.parent;
            if (!value && (frontId || backImgId)) return false;
            return true;
        }
    ),
});

export const validateFirastName = (name: string) => {
    const trimmedName = name.trim();
    const namePattern = /^(?=.*[A-Za-z])[A-Za-z0-9]+(?:\s+[A-Za-z0-9]+)*$/;
    return namePattern.test(trimmedName) && trimmedName.length <= 40;
};




