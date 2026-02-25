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
const DOCUMENT_NUMBER_REGEX = /^[a-zA-Z0-9]+$/;
const ONLY_NUMBER_NOT_ALLOWED_REGEX = /^(?!\d+$).+/;
const AT_NOT_ALLOWED_REGEX = /@/;
const FIRST_CHAR_REGEX = /^[A-Za-z0-9]/;
const NAME_REGEX = /^[a-zA-Z][a-zA-Z0-9\s]*$/;
const emailRegex = /^[\w-]+(?:\.[\w-]+)*@(?:[\w-]+\.)*\w[\w-]{0,66}\.[a-z]{2,200}(?:\.[a-z]{2})?$/;
const SPECIAL_CHAR_REGEX = /[!@#$%^&*(),.?":{}|<>]/;

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


export const KybAddUobsSchema = (isRepresentativeMode = false, isDirectorMode = false, kybRequirements?: any) => {
    const baseSchema: any = {
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
            .matches(/^\d{6,15}$/, " Invalid phone number"),
        phoneCode: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
        gender: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
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
        country: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED")
    };

    // Dynamic validation based on KYB requirements
    if (kybRequirements) {
        // Identification fields - only validate if required for this entity type
        const needsIdentification =
            (!isDirectorMode && !isRepresentativeMode && kybRequirements.showUBOIdentification) ||
            (isDirectorMode && kybRequirements.showDirectorIdentification) ||
            (isRepresentativeMode && kybRequirements.showRepresentativeIdentification);

        if (needsIdentification) {
            baseSchema.docType = Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED");
            baseSchema.docNumber = Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED");

            baseSchema.docIssueDate = Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED");
            baseSchema.docExpiryDate = Yup.string().when('docType', {
                is: (docType: string) => !['ID Card', 'National Id', 'Resident Card'].includes(docType),
                then: (schema) => schema.required("GLOBAL_CONSTANTS.IS_REQUIRED"),
                otherwise: (schema) => schema.nullable()
            });
            baseSchema.frontId = Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED");
            baseSchema.backImgId = Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED");
        }

        // Selfie validation - only validate if required for this entity type
        const needsSelfie =
            (!isDirectorMode && !isRepresentativeMode && kybRequirements.showUBOSelfie) ||
            (isDirectorMode && kybRequirements.showDirectorSelfie) ||
            (isRepresentativeMode && kybRequirements.showRepresentativeSelfie);

        if (needsSelfie) {
            baseSchema.selfi = Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED");
        }

        // Address validation - only validate if required for this entity type
        const needsAddress =
            (!isDirectorMode && !isRepresentativeMode && kybRequirements.showUBOAddress) ||
            (isDirectorMode && kybRequirements.showDirectorAddress) ||
            (isRepresentativeMode && kybRequirements.showRepresentativeAddress) ||
            kybRequirements.showPersonalInformationAddress;

        if (needsAddress) {
            baseSchema.addressCountry = Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED");
            baseSchema.addressType = Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED").nullable();
            baseSchema.addressLine1 = Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED").test('no-emojis', "GLOBAL_CONSTANTS.INVALID_ADDRESS_LINE1", value => {
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
            ).test('no-special-characters', "GLOBAL_CONSTANTS.INVALID_ADDRESS_LINE1", (value) => !SPECIAL_CHAR_REGEX.test(value))
                .test("no-@at-symbol", "GLOBAL_CONSTANTS.INVALID_ADDRESS_LINE1", (value) =>
                    value ? !AT_NOT_ALLOWED_REGEX.test(value) : true
                );
            baseSchema.addressLine2 = Yup.string().nullable().test('no-emojis', "GLOBAL_CONSTANTS.INVALID_ADDRESS_LINE2", value => {
                if (!value) return true;
                return !EMOJI_REGEX.test(value);
            }).test('no-html', "GLOBAL_CONSTANTS.INVALID_ADDRESS_LINE2", value => {
                if (!value) return true;
                return !HTML_REGEX.test(value);
            }).test("no-only-numbers", "GLOBAL_CONSTANTS.INVALID_ADDRESS_LINE2", (value) => {
                if (!value) return true;
                return ONLY_NUMBER_NOT_ALLOWED_REGEX.test(value);
            }).test('no-special-characters', "GLOBAL_CONSTANTS.INVALID_ADDRESS_LINE2", (value) => !SPECIAL_CHAR_REGEX.test(value))
                .test("no-@at-symbol", "GLOBAL_CONSTANTS.INVALID_ADDRESS_LINE2", (value) =>
                    value ? !AT_NOT_ALLOWED_REGEX.test(value) : true
                );
            baseSchema.city = Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED").test('no-emojis', "GLOBAL_CONSTANTS.INVALID_CITY", value => {
                if (!value) return true;
                return !EMOJI_REGEX.test(value);
            }).test('no-special-characters', "GLOBAL_CONSTANTS.INVALID_CITY", (value) => !SPECIAL_CHAR_REGEX.test(value))
                .test('no-html', "GLOBAL_CONSTANTS.INVALID_CITY", value => {
                    if (!value) return true;
                    return !HTML_REGEX.test(value);
                });
            baseSchema.state = Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED");
            baseSchema.postalCode = Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED")
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
                .max(8, "GLOBAL_CONSTANTS.POSTAL_CODE_MAX");
        }
    } else {
        // Fallback to static validation if no requirements provided
        baseSchema.docType = Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED");
        baseSchema.docNumber = Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED");
        baseSchema.docIssueDate = Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED");
        baseSchema.docExpiryDate = Yup.string().when('docType', {
            is: (docType: string) => !['ID Card', 'National Id', 'Resident Card'].includes(docType),
            then: (schema) => schema.required("GLOBAL_CONSTANTS.IS_REQUIRED"),
            otherwise: (schema) => schema.nullable()
        });
        baseSchema.frontId = Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED");
        baseSchema.backImgId = Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED");
        baseSchema.selfi = Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED");
        baseSchema.addressCountry = Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED");
        baseSchema.addressType = Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED").nullable();
        baseSchema.state = Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED");
    }

    return Yup.object().shape(baseSchema);
};

// Legacy function for backward compatibility
export const KybAddUobsSchemaLegacy = (isUboMode: boolean) => {
    const baseSchema: any = {
        firstName: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
        lastName: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
        email: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
        country: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
        phoneNumber: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
        phoneCode: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
        shareHolderPercentage: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
        dob: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
        gender: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
        uboPosition: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
    };

    if (isUboMode) {
        baseSchema.docType = Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED");
        baseSchema.docNumber = Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED");
        baseSchema.docIssueDate = Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED");
        baseSchema.docExpiryDate = Yup.string().when('docType', {
            is: (docType: string) => !['ID Card', 'National Id', 'Resident Card'].includes(docType),
            then: (schema) => schema.required("GLOBAL_CONSTANTS.IS_REQUIRED"),
            otherwise: (schema) => schema.nullable()
        });
        baseSchema.frontId = Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED");
        baseSchema.backImgId = Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED");
        baseSchema.selfi = Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED");
    }

    return Yup.object().shape(baseSchema);
};

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