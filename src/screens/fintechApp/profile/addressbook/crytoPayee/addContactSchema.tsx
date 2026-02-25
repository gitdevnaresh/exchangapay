import * as Yup from 'yup';
import { REGEXS } from '../../../../../utils/helpers';
import { ADD_RECIPIENT } from './constant';

const HTML_REGEX = /<[^>]*>?/g;
const EMOJI_REGEX = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{1FAB0}-\u{1FAB6}\u{1FAC0}-\u{1FAC2}\u{1FAD0}\u{200D}\u{2640}\u{200D}\u{2642}]/gu;
const NAME_REGEX = /^[a-zA-Z][a-zA-Z0-9\s]*$/;
const POSTAL_CODE_REGEX = /^[A-Za-z0-9\s-]+$/;
const emailRegex = /^[\w-]+(?:\.[\w-]+)*@(?:[\w-]+\.)*\w[\w-]{0,66}\.[a-z]{2,200}(?:\.[a-z]{2})?$/;
const SPECIAL_CHAR_REGEX = /[!@#$%^&*(),.?":{}|<>]/;
const ONLY_NUMBER_NOT_ALLOWED_REGEX = /^(?!\d+$).+/;
export const validationSchema = (accountType: any, values: any, payeeCompliance: any, recipentFeilds: any = {}, addressFeilds: any[] = [] ,addressTypeFeilds: any[] = []) => {
    /**
     * Build dynamic recipient field validations
     */
    let recipientValidations: Record<string, any> = {};
    let addressValidations: Record<string, any> = {};
    let addressTypeValidations: Record<string, any> = {};

    if (payeeCompliance?.toLowerCase() !== ADD_RECIPIENT.BASIC) {
        recipentFeilds?.recipient?.forEach((field: any) => {
            if (!field.isEnable) return;

            const fieldKey = field.field;
            let validation = Yup.string();

            // Check field conditions to determine if field should be validated
            const shouldValidateField = field.conditions?.every((condition: any) => {
                if (condition.source === 'context') {
                    const isFirstParty = values?.addressType === 'First Party';
                    return isFirstParty === condition.equals;
                }
                if (condition.source === 'form') {
                    if (condition.key === 'accountTypeDetails') {
                        return accountType?.toLowerCase() === condition.equals;
                    }
                    if (condition.key === 'addressTypeDetails') {
                        return values?.addressType === condition.equals;
                    }
                }
                return true;
            }) ?? true;

            if (!shouldValidateField) return;

            // Apply field-specific validations
            if (fieldKey === 'firstName') {
                validation = validation
                    .matches(/^[a-zA-Z\s]*$/, "GLOBAL_CONSTANTS.INVALID_FIRST_NAME")
                    .test('no-emojis', "GLOBAL_CONSTANTS.INVALID_FIRST_NAME", value => {
                        if (!value) return true;
                        return !EMOJI_REGEX.test(value);
                    })
                    .test('no-html', "GLOBAL_CONSTANTS.INVALID_FIRST_NAME", value => {
                        if (!value) return true;
                        return !HTML_REGEX.test(value);
                    })
                    .max(50, "GLOBAL_CONSTANTS.FIRST_NAME_MUST_50CHARACTER");
            } else if (fieldKey === 'lastName') {
                validation = validation
                    .matches(/^[a-zA-Z\s]*$/, ADD_RECIPIENT.VALIDATION_CONSTANTS.LAST_NAME)
                    .test('no-emojis', ADD_RECIPIENT.VALIDATION_CONSTANTS.LAST_NAME, value => {
                        if (!value) return true;
                        return !EMOJI_REGEX.test(value);
                    })
                    .test('no-html', ADD_RECIPIENT.VALIDATION_CONSTANTS.LAST_NAME, value => {
                        if (!value) return true;
                        return !HTML_REGEX.test(value);
                    })
                    .max(50, "GLOBAL_CONSTANTS.LAST_NAME_MUST_50CHARACTER");
            } else if (fieldKey === 'businessName') {
                validation = validation
                    .matches(/^[a-zA-Z0-9\s&.,'-]*$/, "GLOBAL_CONSTANTS.INVALID_BUSINESS_NAME")
                    .test('no-emojis', "GLOBAL_CONSTANTS.INVALID_BUSINESS_NAME", value => {
                        if (!value) return true;
                        return !EMOJI_REGEX.test(value);
                    })
                    .test('no-html', "GLOBAL_CONSTANTS.INVALID_BUSINESS_NAME", value => {
                        if (!value) return true;
                        return !HTML_REGEX.test(value);
                    })
                    .max(100, "GLOBAL_CONSTANTS.BUSINESS_NAME_MUST_100CHARACTER");
            } else if (fieldKey === 'email') {
                validation = validation
                    .email("GLOBAL_CONSTANTS.INVALID_EMAIL")
                    .matches(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, "GLOBAL_CONSTANTS.INVALID_EMAIL");
            } else if (fieldKey === 'phone') {
                let phoneValidation = Yup.string().matches(/^\d{6,12}$/, ADD_RECIPIENT.VALIDATION_CONSTANTS.PH_NUMBER);
                let phoneCodeValidation = Yup.string();

                if (field.isMandatory === "true"|| field.isMandatory === true) {
                    phoneValidation = phoneValidation.required(ADD_RECIPIENT.IS_REQUIRED);
                    phoneCodeValidation = phoneCodeValidation.required(ADD_RECIPIENT.IS_REQUIRED);
                }

                recipientValidations['phoneNumber'] = phoneValidation;
                recipientValidations['phoneCode'] = phoneCodeValidation;
                return;
            }

            if ((field.isMandatory === "true" || field.isMandatory === true) && fieldKey !== 'relation') {
                validation = validation.required("GLOBAL_CONSTANTS.IS_REQUIRED");
            }

            recipientValidations[fieldKey] = validation;
        });

        /**
         * Build dynamic address field validations
         */
        addressFeilds.forEach((field: any) => {
            if (!field.isEnable) return;

            const fieldKey = field.field;
            let validation = Yup.string();

            if (fieldKey === 'country' || fieldKey === 'state') {
                if (field.isMandatory === "true"|| field.isMandatory === true) {
                    validation = validation.required("GLOBAL_CONSTANTS.IS_REQUIRED");
                }
            } else if (fieldKey === 'city') {
                validation = validation
                    .matches(/^[A-Za-z\s]+$/, "GLOBAL_CONSTANTS.INVALID_CITY")
                    .max(35, "GLOBAL_CONSTANTS.MUST_BE_35_CHARACTERS");
                if (field.isMandatory === "true"|| field.isMandatory === true) {
                    validation = validation.required("GLOBAL_CONSTANTS.IS_REQUIRED");
                }
            } else if (fieldKey === 'line1') {
                validation = validation
                    .nullable()
                    .matches(/^(?=.*[A-Za-z])[A-Za-z0-9\s!@#$%^&*(),.?":{}|<>/_-]*$/, "GLOBAL_CONSTANTS.INVALID_STREET")
                    .test('no-emojis', "GLOBAL_CONSTANTS.INVALID_STREET", value => {
                        if (!value) return true;
                        return !EMOJI_REGEX.test(value);
                    })
                    .test('no-html', "GLOBAL_CONSTANTS.INVALID_STREET", value => {
                        if (!value) return true;
                        return !HTML_REGEX.test(value);
                    })
                    .max(35, "GLOBAL_CONSTANTS.MUST_BE_35_CHARACTERS");
                if (field.isMandatory === "true"|| field.isMandatory === true) {
                    validation = validation.required("GLOBAL_CONSTANTS.IS_REQUIRED");
                }
                addressValidations['street'] = validation;
                return;
            } else if (fieldKey === 'postalCode') {
                validation = validation
                    .matches(/^\d+$/, "GLOBAL_CONSTANTS.INVALID_POSTAL_CODE")
                    .min(4, "GLOBAL_CONSTANTS.POSTAL_CODE_AT_LEAST")
                    .max(9, "GLOBAL_CONSTANTS.POSTAL_CODE_MAX");
                if (field.isMandatory === "true"|| field.isMandatory === true) {
                    validation = validation.required("GLOBAL_CONSTANTS.IS_REQUIRED");
                }
            }

            addressValidations[fieldKey] = validation;
        });

        addressTypeFeilds?.forEach((field: any) => {
                if (!field.isEnable) return;
                
                const fieldKey = field.field;
                if (fieldKey === 'addressType' && (field.isMandatory === "true" || field.isMandatory === true)) {
                    addressTypeValidations[fieldKey] = Yup.string().required(ADD_RECIPIENT.IS_REQUIRED);
                }
            });
    }
    let schema = Yup.object().shape({
        // saveWhiteListName: Yup.string()
        //     .required("GLOBAL_CONSTANTS.IS_REQUIRED")
        //     .matches(/^[a-zA-Z]/, "GLOBAL_CONSTANTS.INVALID_FAVORITE")
        //     .matches(/^(?=.*\S).+$/, "GLOBAL_CONSTANTS.INVALID_FAVORITE")
        //     .test("no-emojis", "GLOBAL_CONSTANTS.INVALID_FAVORITE", value => {
        //         if (!value) return true;
        //         return !REGEXS.EMOJI_REGEX.test(value);
        //     })
        //     .test("no-html", "GLOBAL_CONSTANTS.INVALID_FAVORITE", value => {
        //         if (!value) return true;
        //         return !REGEXS.HTML_REGEX.test(value);
        //     })
        //     .test("no-whitespace", "GLOBAL_CONSTANTS.INVALID_FAVORITE", value => {
        //         if (!value) return true;
        //         return REGEXS.SPACE_NUMBERS_REGEX.test(value);
        //     })
        //     .max(50, "GLOBAL_CONSTANTS.CRYPTO_FAVORITE_NAME_MUST_100CHARACTER"),

        saveWhiteListName: Yup.string()
                    .required(ADD_RECIPIENT.IS_REQUIRED)
        
                    // ❌ Do NOT allow ONLY special characters (no letters, no numbers)
                    .test(
                        "no-only-special",
                        ADD_RECIPIENT.VALIDATION_CONSTANTS.FAVOURITE_NAME,
                        (value) => {
                            if (!value) return true;
        
                            const hasLetter = /[a-zA-Z]/.test(value);
                            const hasNumber = /[0-9]/.test(value);
        
                            // if contains at least letter or number → allowed
                            return hasLetter || hasNumber;
                        }
                    )
        
                    // ❌ No emojis
                    .test("no-emojis", ADD_RECIPIENT.VALIDATION_CONSTANTS.FAVOURITE_NAME, (value) => {
                        if (!value) return true;
                        return !EMOJI_REGEX.test(value);
                    })
        
                    // ❌ No HTML tags
                    .test("no-html", ADD_RECIPIENT.VALIDATION_CONSTANTS.FAVOURITE_NAME, (value) => {
                        if (!value) return true;
                        return !HTML_REGEX.test(value);
                    })
        
                    .max(50, "GLOBAL_CONSTANTS.FAVOURITE_NAME_MUST_50CHARACTER"),
        network: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),

        walletAddress: Yup.string()
            .required("GLOBAL_CONSTANTS.IS_REQUIRED")
            .test("valid-address", "GLOBAL_CONSTANTS.INVALID_WALLET_ADDRESS", function (value) {
                const { network } = this.parent;
                const addressFormat = getaddressFormat(network, value);
                return addressFormat !== null;
            }),

        // token: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
        

        proofType: Yup.string().when("source", {
            is: "Self Hosted",
            then: schema => schema.required("GLOBAL_CONSTANTS.IS_REQUIRED"),
            otherwise: schema => schema.notRequired(),
        }),

        street: Yup.string()
            .nullable()
            .matches(
                /^(?=.*[A-Za-z])[A-Za-z0-9\s!@#$%^&*(),.?":{}|<>/_-]*$/,
                "GLOBAL_CONSTANTS.INVALID_STREET"
            )
            .test('no-emojis', "GLOBAL_CONSTANTS.INVALID_STREET", value => {
                if (!value) return true;
                return !EMOJI_REGEX.test(value);
            })
            .test('no-html', "GLOBAL_CONSTANTS.INVALID_STREET", value => {
                if (!value) return true;
                return !HTML_REGEX.test(value);
            }).test("no-only-numbers", "GLOBAL_CONSTANTS.INVALID_STREET", (value) => {
                if (!value) return true;
                return ONLY_NUMBER_NOT_ALLOWED_REGEX.test(value);
            })
            .max(35, "GLOBAL_CONSTANTS.MUST_BE_35_CHARACTERS"),

        remarks: Yup.string().nullable()
            .test("no-emojis", "GLOBAL_CONSTANTS.INVALID_REMARKS", value => {
                if (!value) return true;
                return !EMOJI_REGEX.test(value);
            })
            .test("no-html", "GLOBAL_CONSTANTS.INVALID_REMARKS", value => {
                if (!value) return true;
                return !HTML_REGEX.test(value);
            })
            .test("no-only-numbers", "GLOBAL_CONSTANTS.INVALID_REMARKS", (value) => {
                if (!value) return true;
                return ONLY_NUMBER_NOT_ALLOWED_REGEX.test(value);
            })
            .max(150, "GLOBAL_CONSTANTS.REMARKS_MUST_150CHARACTER"),
        
        // Dynamic recipient field validations
        ...recipientValidations,
        
        // Dynamic address field validations
        ...addressValidations,
        ...addressTypeValidations,
    });

    if (payeeCompliance?.toLowerCase() !== ADD_RECIPIENT.BASIC) {
        schema = schema.shape({
            source: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
            // addressType: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED")
        });
    }

    return schema;
};



export const withdrawValidateShema = Yup.object().shape({
    network: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
    coin: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
});

export const transactionIdSchema = Yup.object().shape({
    transactionId: Yup.string()
        .required("GLOBAL_CONSTANTS.IS_REQUIRED") // Make sure you have this translation key

});
export const assets = {
    "btc": 'btc',
    'erc-20': 'eth',
    'arbitrum sepolia': 'eth',
    'base sepolia': 'eth',
    'holesky': 'eth',
    'trc-20': 'trx',
    'algo': 'algo',
    'ada': 'cardano',
    'xlm': 'str',
    'sol': 'sol'
}

export const addressRegex = {
    'btc': /^(1[a-km-zA-HJ-NP-Z1-9]{25,34}|3[a-km-zA-HJ-NP-Z1-9]{25,34}|bc1[qpzry9x8gf2tvdw0s3jn54khce6mua7l]{39,59}|bc1p[qpzry9x8gf2tvdw0s3jn54khce6mua7l]{58})$/,
    'erc-20': /^0x[a-fA-F0-9]{40}$/,
    'arbitrum sepolia': /^0x[a-fA-F0-9]{40}$/,
    'base sepolia': /^0x[a-fA-F0-9]{40}$/,
    'holesky': /^0x[a-fA-F0-9]{40}$/,
    'trc-20': /^(T[1-9A-HJ-NP-Za-km-z]{33}|41[a-fA-F0-9]{40})$/,
    'algo': /^[A-Z2-7]{58}$/,
    'ada': /^((addr1|DdzFFzC)[0-9a-zA-Z]{58,})$/,
    'xlm': /^G[A-Z2-7]{55}$/,
    'sol': /^[1-9A-HJ-NP-Za-km-z]{32,44}$/,
}

export const bitcoinAddressFormats = {
    default: /^1[a-km-zA-HJ-NP-Z1-9]{25,34}$/,
    p2pkh: /^1[a-km-zA-HJ-NP-Z1-9]{25,34}$/,  // Legacy
    p2sh: /^3[a-km-zA-HJ-NP-Z1-9]{25,34}$/,   // Pay-to-Script-Hash
    bech32m: /^bc1p[qpzry9x8gf2tvdw0s3jn54khce6mua7l]{58}$/,    // Taproot (Bech32m)
    bech32: /^bc1[qpzry9x8gf2tvdw0s3jn54khce6mua7l]{39,59}$/,  // SegWit
};
export const tronAddressFormats = {
    default: /^T[1-9A-HJ-NP-Za-km-z]{33}$/,
    base58: /^T[1-9A-HJ-NP-Za-km-z]{33}$/,  // Base58 (starts with 'T')
    hex: /^41[a-fA-F0-9]{40}$/              // Hexadecimal (starts with '41')
};

export const evmAddressFormats = {
    default: /^0x[a-fA-F0-9]{40}$/,
    hexadecimal: /^0x[a-fA-F0-9]{40}$/              // EVM-compatible (starts with '0x')
};

export const stellarAddressFormats = {
    default: /^G[A-Z2-7]{55}$/,
}
export const cardanoAddressFormats = {
    default: /^addr1[0-9a-z]{58,}$/,
    base58: /^DdzFFzC[0-9a-zA-Z]{58,}$/,
    bech32: /^addr1[0-9a-z]{58,}$/,

}
export const algorandAddressFormats = {
    default: /^[A-Z2-7]{58}$/,
}
export const solanaAddressFormats = {
    default: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/,
}
const addressRegexBasedOnAsset = (asset: any) => {
    switch (asset) {
        case 'btc': return bitcoinAddressFormats
        case 'trx': return tronAddressFormats
        case 'eth': return evmAddressFormats
        case 'algo': return algorandAddressFormats
        case 'sol': return solanaAddressFormats
        case 'str': return stellarAddressFormats
        case 'cardano': return cardanoAddressFormats
        default: return evmAddressFormats
    }
}
const getaddressFormat = (network: any, address: any) => {
    const getExactFormat = (formats: any) => {
        for (const key in formats) {
            if (formats[key].test(address)) {
                return key;
            }
        }
        return null
    }
    switch (network) {
        case 'ERC-20': return getExactFormat(evmAddressFormats);
        case 'BTC': return getExactFormat(bitcoinAddressFormats);
        case 'TRC-20': return getExactFormat(tronAddressFormats);
        case 'Cardano': return getExactFormat(cardanoAddressFormats);
        case 'ALGO': return getExactFormat(algorandAddressFormats);
        case 'XLM': return getExactFormat(stellarAddressFormats);
        case 'SOL': return getExactFormat(solanaAddressFormats)
        default: return getExactFormat(evmAddressFormats)
    }
}