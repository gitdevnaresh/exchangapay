import * as Yup from 'yup';

const HTML_REGEX = /<[^>]*>?/g;
const EMOJI_REGEX = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2300}-\u{23FF}\u{2B50}\u{1F004}-\u{1F0CF}\u{2B06}\u{2194}\u{1F201}-\u{1F251}]/gu;
const ONLY_NUMBERS_REGEX = /^\d+$/;
const ONLY_SPECIAL_CHARS_REGEX = /^[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/;
const POSTAL_CODE_REGEX = /^[A-Za-z0-9\s\-]{3,10}$/;

// Validation Schema
export const AddBeneficiaryValidationSchema = Yup.object().shape({
    firstName: Yup.string()
        .required('')
        .matches(/^[a-zA-Z\s]+$/, 'GLOBAL_CONSTANTS.ONLY_CHARACTERS_ARE_ALLOWED')
        .min(2, 'GLOBAL_CONSTANTS.INVALID_FIRST_NAME')
        .max(50, 'GLOBAL_CONSTANTS.FIRST_NAME_MUST_50CHARACTER')
        .test('no-emojis', 'GLOBAL_CONSTANTS.INVALID_FIRST_NAME', value => !value || !EMOJI_REGEX.test(value))
        .test('no-html', 'GLOBAL_CONSTANTS.INVALID_FIRST_NAME', value => !value || !HTML_REGEX.test(value)),
    lastName: Yup.string()
        .required('')
        .matches(/^[a-zA-Z\s]+$/, 'GLOBAL_CONSTANTS.ONLY_CHARACTERS_ARE_ALLOWED')
        .min(1, 'GLOBAL_CONSTANTS.INVALID_LAST_NAME')
        .max(50, 'GLOBAL_CONSTANTS.LAST_NAME_MUST_50CHARACTER')
        .test('no-emojis', 'GLOBAL_CONSTANTS.INVALID_LAST_NAME', value => !value || !EMOJI_REGEX.test(value))
        .test('no-html', 'GLOBAL_CONSTANTS.INVALID_LAST_NAME', value => !value || !HTML_REGEX.test(value)),
    dateOfBirth: Yup.date()
        .nullable()
        .required('')
        .max(new Date(new Date().getFullYear() - 18, new Date().getMonth(), new Date().getDate()), 'GLOBAL_CONSTANTS.AT_LEAST_18_YEARS')
        .typeError('GLOBAL_CONSTANTS.INVALID_DOB'),
    email: Yup.string()
        .required('')
        .email('GLOBAL_CONSTANTS.INVALID_EMAIL')
        .max(50, 'GLOBAL_CONSTANTS.MAXIMUM_50_CHARACTERS_ALLOWED'),
    beneficiaryCountry: Yup.string().required(''),
    countryCode: Yup.string().required(''),
    phoneNumber: Yup.string()
        .required('')
        .matches(/^[0-9]+$/, 'GLOBAL_CONSTANTS.INVALID_PHONE_NUMBER')
        .min(6, 'GLOBAL_CONSTANTS.PHONE_NUMBER_AT_LEAST')
        .max(15, 'GLOBAL_CONSTANTS.PHONE_NUMBER_MAX'),
    documentType: Yup.string(),
    documentNumber: Yup.string()
        .min(5, 'GLOBAL_CONSTANTS.DOCUMENT_NUMBER_AT_LEAST_6_CHARACTERS')
        .max(30, 'GLOBAL_CONSTANTS.DOCUMENT_NUMBER_MUST_50_CHARACTERS'),
    docImage: Yup.mixed().nullable(),
    addressLine1: Yup.string()
        .required('')
        .min(3, 'GLOBAL_CONSTANTS.INVAIDE_ADDRESS_LINE1')
        .max(100, 'GLOBAL_CONSTANTS.ADDRESS_LINE1_MAX')
        .test('no-emojis', 'GLOBAL_CONSTANTS.INVAIDE_ADDRESS_LINE1', value => !value || !EMOJI_REGEX.test(value))
        .test('no-html', 'GLOBAL_CONSTANTS.INVAIDE_ADDRESS_LINE1', value => !value || !HTML_REGEX.test(value)),
    addressLine2: Yup.string()
        .max(100, 'GLOBAL_CONSTANTS.ADDRESS_LINE2_MAX')
        .test('no-emojis', 'GLOBAL_CONSTANTS.INVAIDE_ADDRESS_LINE2', value => !value || !EMOJI_REGEX.test(value))
        .test('no-html', 'GLOBAL_CONSTANTS.INVAIDE_ADDRESS_LINE2', value => !value || !HTML_REGEX.test(value)),
    province: Yup.string()
        .required('')
        .matches(/^[a-zA-Z\s]+$/, 'GLOBAL_CONSTANTS.ONLY_CHARACTERS_ARE_ALLOWED')
        .max(50, 'GLOBAL_CONSTANTS.STATE_MUST_BE_AT_MOST_50')
        .test('no-emojis', 'GLOBAL_CONSTANTS.INVALID_STATE', value => !value || !EMOJI_REGEX.test(value))
        .test('no-html', 'GLOBAL_CONSTANTS.INVALID_STATE', value => !value || !HTML_REGEX.test(value))
        .test('no-only-numbers', 'GLOBAL_CONSTANTS.INVALID_STATE', value => !value || !ONLY_NUMBERS_REGEX.test(value))
        .test('no-only-special-chars', 'GLOBAL_CONSTANTS.INVALID_STATE', value => !value || !ONLY_SPECIAL_CHARS_REGEX.test(value)),
    city: Yup.string()
        .required('')
        .matches(/^[a-zA-Z\s]+$/, 'GLOBAL_CONSTANTS.ONLY_CHARACTERS_ARE_ALLOWED')
        .max(50, 'GLOBAL_CONSTANTS.CITY_MUST_BE_AT_MOST_50')
        .test('no-emojis', 'GLOBAL_CONSTANTS.INVALID_CITY', value => !value || !EMOJI_REGEX.test(value))
        .test('no-html', 'GLOBAL_CONSTANTS.INVALID_CITY', value => !value || !HTML_REGEX.test(value))
        .test('no-only-numbers', 'GLOBAL_CONSTANTS.INVALID_CITY', value => !value || !ONLY_NUMBERS_REGEX.test(value))
        .test('no-only-special-chars', 'GLOBAL_CONSTANTS.INVALID_CITY', value => !value || !ONLY_SPECIAL_CHARS_REGEX.test(value)),
    postalCode: Yup.string()
        .required('')
        .matches(POSTAL_CODE_REGEX, 'GLOBAL_CONSTANTS.INVALID_POSTAL_CODE')
        .max(10, 'GLOBAL_CONSTANTS.POSTAL_CODE_MAX'),
});

export interface Country {
    id: string;
    name: string;
    code: string;
    countryCode?: string;
}

export interface DocumentType {
    id: string;
    name: string;
}

export interface KYCRequirement {
    countries: string;
    documentRequirement: string;
}