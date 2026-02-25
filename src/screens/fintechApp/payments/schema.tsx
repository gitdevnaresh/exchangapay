import * as Yup from 'yup';
import { PAYMENT_LINK_CONSTENTS } from "./constants";
import { REGEXS } from '../../../utils/helpers';
const EMOJI_REGEX = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{1FAB0}-\u{1FAB6}\u{1FAC0}-\u{1FAC2}\u{1FAD0}\u{200D}\u{2640}\u{200D}\u{2642}]/gu;
const HTML_REGEX = /<[^>]*>?/g;
const VALID_GLOBAL_REGEX = /^[A-Za-z\s-]+$|^[A-Za-z\s-]+\d+$/;
export const validationSchema = Yup.object().shape({
    // merchantId: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
    invoiceType: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
    orderId: Yup.string().test('no-emojis', "GLOBAL_CONSTANTS.INVALID_ORDER_ID", value => {
        if (!value) return true;
        return !REGEXS.EMOJI_REGEX.test(value);
    })
        .test('no-html', "GLOBAL_CONSTANTS.INVALID_ORDER_ID", value => {
            if (!value) return true;
            return !REGEXS.HTML_REGEX.test(value);
        })
        .test('no-whitespace', "GLOBAL_CONSTANTS.INVALID_ORDER_ID", value => {
            if (!value) return true;
            return REGEXS.ALPHA_NUMERIC_WITH_HYPHEN.test(value);
        })
        .test("min length ", "GLOBAL_CONSTANTS.ORDER_ID_RULE",
            value => {
                if (!value) return true;
                return REGEXS.MIN_MAX_LENTH.test(value)
            }),
   amount: Yup.string()
  .required("GLOBAL_CONSTANTS.IS_REQUIRED")
  .matches(/^\d+(\.\d{1,4})?$/, "Invalid value")
  .test("greater-than-zero", "Amount must be greater than 0", (value) => {
    if (!value) return false;
    return parseFloat(value) > 0;
  }),
    // currency: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
    // networkName: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
    dueDate: Yup.date().required("GLOBAL_CONSTANTS.IS_REQUIRED").min(new Date(), "GLOBAL_CONSTANTS.DUE_DATE_MUST_BE_GREATER_THAN_CURRENT_DATE"),
});

export const transferSchema = Yup.object().shape({
    merchantId: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
    amount: Yup.number().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
    coin: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
    network: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
    toAddress: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
});

export const invoiceDetailsSchema = Yup.object().shape({
    issuedDate: Yup.date().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
    dueDate: Yup.date().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
    companyName: Yup.string()
    .required("GLOBAL_CONSTANTS.IS_REQUIRED")
    // Block emojis and special characters - only allow ASCII printable characters
    .matches(
        /^[\x20-\x7E]+$/, 
        'GLOBAL_CONSTANTS.NO_SPECIAL_CHARACTERS_OR_EMOJIS'
    )
    // Allow letters, numbers, spaces, and common business punctuation
    .matches(
        /^[a-zA-Z0-9\s\-\.\&\'\,\(\)]+$/, 
        'GLOBAL_CONSTANTS.INVALID_COMPANY_NAME'
    )
    // Must contain at least one letter
    .matches(
        /.*[a-zA-Z].*/, 
        'Invalid value'
    )
    .min(2, 'GLOBAL_CONSTANTS.MIN_2_CHARACTERS')
    .max(100, 'GLOBAL_CONSTANTS.MAX_100_CHARACTERS')
    .trim(),
    emails: Yup.string()
        .required("GLOBAL_CONSTANTS.IS_REQUIRED")
        .test(
            'valid-emails',
            "GLOBAL_CONSTANTS.PLEASE_SAPARATE",
            (value) => {
                if (!value || value.trim() === '') return true;
                const emails = value.split(',').map((email) => email.trim());
                return emails.every((email) => {
                    // Check basic email format and domain length
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
                    return emailRegex.test(email);
                });
            }
        ),
    country: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
    streetAddress: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED")
        .min(5, "GLOBAL_CONSTANTS.MIN_5_CHARACTERS")
        .max(50, "GLOBAL_CONSTANTS.MUST_BE_50_CHARACTERS")
        .test('no-emojis', PAYMENT_LINK_CONSTENTS.ADDRESS_LINE_CONNOT_CONTAIN_EMOJIS, value => {
            if (!value) return true;
            return !EMOJI_REGEX.test(value);
        })
        .test('no-html', PAYMENT_LINK_CONSTENTS.ADDRESS_LINE_CANNOT_CONTAIN_HTML_TAGS, value => {
            if (!value) return true;
            return !HTML_REGEX.test(value);
        }),
    city: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED")
        .min(2, "GLOBAL_CONSTANTS.MIN_2_CHARACTERS")
        .max(35, "GLOBAL_CONSTANTS.MUST_BE_35_CHARACTERS")
        .matches(/^(?=.*[a-zA-Z])[a-zA-Z0-9\s]*$/, "GLOBAL_CONSTANTS.INVALID_CITY"),
       state: Yup.string()
            .required("GLOBAL_CONSTANTS.IS_REQUIRED")
            .matches(VALID_GLOBAL_REGEX, "GLOBAL_CONSTANTS.INVALID_STATE")
            .test('no-emojis', "GLOBAL_CONSTANTS.INVALID_STATE", value => !value || !EMOJI_REGEX.test(value)),
    zipCode: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED")
        .matches(/^\d{4,10}$/, "GLOBAL_CONSTANTS.INVALID_POSTAL_CODE"),
    taxIdentificationNumber: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED")
        .matches(/^[a-zA-Z0-9\s-]{8,15}$/, "GLOBAL_CONSTANTS.INVALID_TAX_IDENTIFICATION_NUMBER").max(18, "GLOBAL_CONSTANTS.MUST_BE_18_CHARACTERS"),
    invoiceCurrency: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
    clientName: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED")
        .min(2, "GLOBAL_CONSTANTS.MIN_2_CHARACTERS")
        .max(50, "GLOBAL_CONSTANTS.MUST_BE_50_CHARACTERS")
        .matches(/^(?=.*[a-zA-Z])[a-zA-Z0-9\s]*$/, "GLOBAL_CONSTANTS.INVALID_CLIENT_NAME"),
    orderId: Yup.string().nullable().test('no-emojis',"GLOBAL_CONSTANTS.INVALID_ORDER_ID", value => {
        if (!value) return true;
        return !REGEXS.EMOJI_REGEX.test(value);
    })
        .test('no-html', "GLOBAL_CONSTANTS.INVALID_ORDER_ID", value => {
            if (!value) return true;
            return !REGEXS.HTML_REGEX.test(value);
        })
        .test('no-whitespace', "GLOBAL_CONSTANTS.INVALID_ORDER_ID", value => {
            if (!value) return true;
            return REGEXS.ALPHA_NUMERIC_WITH_HYPHEN.test(value);
        })
        .test("min length ", "GLOBAL_CONSTANTS.ORDER_ID_RULE",
            value => {
                if (!value) return true;
                return REGEXS.MIN_MAX_LENTH.test(value)
            }),
});
export const invoiceItemDetailsSchema = Yup.object().shape({
    // merchantName: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
    currency: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
    networkName: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
    paymentNote: Yup.string().optional().max(255, "GLOBAL_CONSTANTS.MAX_255_CHARACTERS"),
});
export const addVaultSchema = Yup.object().shape({
    merchantName: Yup.string()
    .required("GLOBAL_CONSTANTS.IS_REQUIRED")
    .matches(/^[a-zA-Z0-9 ]*$/, "GLOBAL_CONSTANTS.INVALID_VAULT")  // Allow letters, numbers, and spaces
    .test('no-only-numbers', "GLOBAL_CONSTANTS.INVALID_VAULT", value => {
        if (!value) return true;
        return /[a-zA-Z]/.test(value); 
    })
    .test('no-emojis', "GLOBAL_CONSTANTS.INVALID_VAULT", value => {
        if (!value) return true;
        return !EMOJI_REGEX.test(value);
    })
    .test('no-html', "GLOBAL_CONSTANTS.INVALID_VAULT", value => {
        if (!value) return true;
        return !HTML_REGEX.test(value);
    })
})
export const invoiceAddItemDetailsSchema = Yup.object().shape({
    itemName: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED").matches(/^(?=.*[a-zA-Z])[a-zA-Z0-9\s]+$/, "GLOBAL_CONSTANTS.INVALID_ITEM_NAME").max(30, "GLOBAL_CONSTANTS.MUST_BE_30_CHARACTERS_OR_LESS"),
    quantity: Yup.string()
        .required("GLOBAL_CONSTANTS.IS_REQUIRED")
        .matches(/^[0-9,]+(\.\d{1,2})?$/, "GLOBAL_CONSTANTS.INVALID_QUANTITY")
        .transform((value) => (value === '' ? undefined : value))
        .test('is-valid-number', "GLOBAL_CONSTANTS.MUST_BE_VALUE_10000000", (value) => {
            if (!value) return false;
            const numberValue = parseFloat(value.replace(/,/g, ''));
            return numberValue <= 10000000;
        }),
    unitPrice: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED").matches(/^\d+(\.\d{1,2})?$/, "GLOBAL_CONSTANTS.INVALID_UNIT_PRICE").transform((value) => (value === '' ? undefined : value))
        .test('is-valid-number', "GLOBAL_CONSTANTS.MUST_BE_VALUE_10000000", (value) => {
            if (!value) return false;
            const numberValue = parseFloat(value.replace(/,/g, ''));
            return numberValue <= 10000000;
        }),
    discountPercentage: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED").matches(/^\d+(\.\d{1,2})?$/, "GLOBAL_CONSTANTS.INVALID_DISCOUNT_PERCENTAGE").transform((value) => (value === '' ? undefined : value))
        .test('is-valid-number', "GLOBAL_CONSTANTS.MUST_BE_VALUE_100", (value) => {
            if (!value) return true;
            const numberValue = parseFloat(value.replace(/,/g, ''));
            return numberValue <= 100;
        }),
    taxPercentage: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED")
        .matches(/^\d+(\.\d{1,2})?$/, "GLOBAL_CONSTANTS.INVALID_TAX_PERCENTAGE")
        .transform((value) => (value === '' ? undefined : value))
        .test('is-valid-number', "GLOBAL_CONSTANTS.MUST_BE_VALUE_100", (value) => {
            if (!value) return true;
            const numberValue = parseFloat(value.replace(/,/g, ''));
            return numberValue <= 100;
        }),
})

export const addFiatPayinSchema = Yup.object().shape({
    orderId: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED").test('no-emojis',"GLOBAL_CONSTANTS.INVALID_ORDER_ID", value => {
        if (!value) return true;
        return !REGEXS.EMOJI_REGEX.test(value);
    })
        .test('no-html', "GLOBAL_CONSTANTS.INVALID_ORDER_ID", value => {
            if (!value) return true;
            return !REGEXS.HTML_REGEX.test(value);
        })
        .test('no-whitespace', "GLOBAL_CONSTANTS.INVALID_ORDER_ID", value => {
            if (!value) return true;
            return REGEXS.ALPHA_NUMERIC_WITH_HYPHEN.test(value);
        })
        .test("min length ", "GLOBAL_CONSTANTS.ORDER_ID_RULE",
            value => {
                if (!value) return true;
                return REGEXS.MIN_MAX_LENTH.test(value)
            }),
    amount: Yup.number().required("GLOBAL_CONSTANTS.IS_REQUIRED").positive('Amount must be positive'),
    currency: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
});

// Dynamic schema with min/max limits
export const createFiatPayinSchema = (minLimit: number = 200000, maxLimit: number = 10000000) => {
    return Yup.object().shape({
        orderId: Yup.string()
        .test('no-emojis',"GLOBAL_CONSTANTS.INVALID_ORDER_ID", value => {
            if (!value) return true;
            return !REGEXS.EMOJI_REGEX.test(value);
        })
            .test('no-html', "GLOBAL_CONSTANTS.INVALID_ORDER_ID", value => {
                if (!value) return true;
                return !REGEXS.HTML_REGEX.test(value);
            })
            .test('no-whitespace', "GLOBAL_CONSTANTS.INVALID_ORDER_ID", value => {
                if (!value) return true;
                return REGEXS.ALPHA_NUMERIC_WITH_HYPHEN.test(value);
            })
            .test("min length ", "GLOBAL_CONSTANTS.ORDER_ID_RULE",
                value => {
                    if (!value) return true;
                    return REGEXS.MIN_MAX_LENTH.test(value)
                }),
        amount: Yup.number()
            .required("GLOBAL_CONSTANTS.IS_REQUIRED")
            .positive('Amount must be positive')
            .min(minLimit, `Amount should be greater than or equal to ${minLimit.toLocaleString()}`)
            .max(maxLimit, `Amount should be greater than or equal to ${maxLimit.toLocaleString()}`),
        currency: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
    });
};