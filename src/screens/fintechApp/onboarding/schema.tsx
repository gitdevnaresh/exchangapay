import * as Yup from "yup";
const HTML_REGEX = /<[^>]*>?/g;
const POSTAL_CODE_REGEX = /^[A-Za-z0-9\s-]+$/;
const EMOJI_REGEX = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{1FAB0}-\u{1FAB6}\u{1FAC0}-\u{1FAC2}\u{1FAD0}\u{200D}\u{2640}\u{200D}\u{2642}]/gu;
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
    country: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
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
        .max(40, "GLOBAL_CONSTANTS.REGISTRATION_NUMBER_MUST_40CHARACTER"),
        documents: Yup.array()
        .of(
            Yup.object().shape({
                docType: Yup.string().required('Document type is required.'),
                url: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
            })
        )
        .test('unique-doc-type', 'Each document type must be unique.', (documents) => {
            if (!documents) return true;
            const docTypeSet = new Set(documents.map(doc => doc.docType));
            return docTypeSet.size === documents.length;
        }),
});
// Dynamic schema function that applies different validation based on screen
export const getKybAddUobsSchema = (screenName?: string, isDcoumentExpDate?: boolean, hideAddressField?: boolean) => {
    const isPayoutUboForm = screenName === 'PayoutUboForm';
    
    return Yup.object().shape({
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
            .test(
                "is-valid-number",
                "GLOBAL_CONSTANTS.INVALID_PERCENTAGE",
                (value) => {
                    if (!value) return false;
                    const num = Number(value);
                    return !isNaN(num) && num >= 0;
                }
            )
            .test(
                "max-two-decimals",
                "GLOBAL_CONSTANTS.ONLY_TWO_DECIMALS",
                (value) => {
                    if (!value) return true;
                    return /^\d+(\.\d{1,2})?$/.test(value);
                }
            )
            .test(
                "max-value",
                "GLOBAL_CONSTANTS.VALUE_MUST_100",
                (value) => {
                    if (!value) return true;
                    return parseFloat(value) <= 100;
                }
            ),
        address: hideAddressField 
            ? Yup.string().notRequired()
            : Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
    frontId: isPayoutUboForm 
            ? Yup.string().when('docType', {
                is: (docType: string) => {
                    if (!docType) return true; // If docType is empty, require the field
                    const type = docType.toLowerCase();
                    return type !== 'tax id' && type !== 'national id';
                },
                then: (schema) => schema.required("GLOBAL_CONSTANTS.IS_REQUIRED"),
                otherwise: (schema) => schema.notRequired()
            })
            : Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
        backImgId: isPayoutUboForm 
            ? Yup.string().when('docType', {
                is: (docType: string) => {
                    if (!docType) return true; // If docType is empty, require the field
                    const type = docType.toLowerCase();
                    return type !== 'tax id' && type !== 'national id';
                },
                then: (schema) => schema.required("GLOBAL_CONSTANTS.IS_REQUIRED"),
                otherwise: (schema) => schema.notRequired()
            })
            : Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
        docType: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
        country: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
        email: Yup.string()
            .email("GLOBAL_CONSTANTS.INVALID_EMAIL")
            .required('GLOBAL_CONSTANTS.IS_REQUIRED')
            .matches(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,"GLOBAL_CONSTANTS.INVALID_EMAIL"),
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
        docExpireDate: (isPayoutUboForm && isDcoumentExpDate === false) 
            ? Yup.string().notRequired()
            : isPayoutUboForm 
            ? Yup.string().when('docType', {
                is: (docType: string) => {
                    if (!docType) return false;
                    const type = docType.toLowerCase();
                    return type !== 'tax id' && type !== 'national id';
                },
                then: (schema) => schema.required("GLOBAL_CONSTANTS.IS_REQUIRED"),
                otherwise: (schema) => schema.notRequired()
            })
            : Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
    });
};

// Backward compatibility - default schema without screen-specific logic
export const KybAddUobsSchema = getKybAddUobsSchema();
export const KybRepresentativeSchema = Yup.object().shape({
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
        .test(
            "is-valid-number",
            "GLOBAL_CONSTANTS.INVALID_PERCENTAGE",
            (value) => {
                if (!value) return false;
                const num = Number(value);
                // Must be a number >= 0
                return !isNaN(num) && num >= 0;
            }
        )
        .test(
            "max-two-decimals",
            "GLOBAL_CONSTANTS.ONLY_TWO_DECIMALS",
            (value) => {
                if (!value) return true;
                // Allow only numbers with up to 2 decimals
                return /^\d+(\.\d{1,2})?$/.test(value);
            }
        )
        .test(
            "max-value",
            "GLOBAL_CONSTANTS.VALUE_MUST_100",
            (value) => {
                if (!value) return true;
                return parseFloat(value) <= 100;
            }
        ),
      frontId: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
    backImgId: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
    docType:  Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
    country: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
    email: Yup.string()
        .email("GLOBAL_CONSTANTS.INVALID_EMAIL")
        .required('GLOBAL_CONSTANTS.IS_REQUIRED')
        .matches(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, "GLOBAL_CONSTANTS.INVALID_EMAIL"),
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
     frontId: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
    backImgId: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
    docType:  Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
    docExpireDate: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),

});

export const validateFirastName = (name: string) => {
    const trimmedName = name.trim();
    const namePattern = /^[A-Za-z]+(?:\s+[A-Za-z]+)*$/;
    return namePattern.test(trimmedName) && trimmedName.length <= 40;
};
export const validateLastName = (name: string) => {
    const trimmedName = name.trim();
    const namePattern = /^[A-Za-z]+(?:\s+[A-Za-z]+)*$/;
    return namePattern.test(trimmedName) && trimmedName.length <= 40;
};
export const validateAddress = (address: string) => {
    const addressPattern = /^[a-zA-Z0-9\-]+(?:[\s]+[a-zA-Z0-9\-]+)*$/;
    return addressPattern.test(address) && address.length <= 400;
};
export const validateBusinessName = (value: string) => {
    if (!value) return true;
    const EMOJI_REGEX = /\p{Emoji}/u; 
    const ONLY_NUMBERS_REGEX = /^[0-9]+$/; 
    const ONLY_SPECIAL_CHAR_REGEX = /^[^A-Za-z0-9]+$/;
    return (
        !EMOJI_REGEX.test(value) && 
        !ONLY_NUMBERS_REGEX.test(value) && 
        !ONLY_SPECIAL_CHAR_REGEX.test(value)
    );
};