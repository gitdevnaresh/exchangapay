import * as Yup from "yup";
const HTML_REGEX = /<[^>]*>?/g;
const EMOJI_REGEX = /[\p{Extended_Pictographic}]/u;
const ONLY_NUMBERS_REGEX = /^\d+$/;
const SPACE_NUMBERS_REGEX = /^(?=.*\S).+$/;
const POSTAL_CODE_REGEX = /^[A-Za-z0-9\s-]+$/;
const CONTAINS_NUMBER = /\d/;
const CONTAINS_LETTER = /[A-Za-z]/;
const CONTAINS_SPECIAL_CHAR = /[\/\-,.#()&'"]/;
const VALID_GLOBAL_REGEX = /^[A-Za-z\s-]+$|^[A-Za-z\s-]+\d+$/;


export const CreateAccSchema = Yup.object().shape({
    // email: Yup.string()
    //     .required("GLOBAL_CONSTANTS.IS_REQUIRED")
    //     .matches(
    //         /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
    //         "GLOBAL_CONSTANTS.INVALID_EMAIL"),
    // phoneNumber: Yup.string()
    //     .required("GLOBAL_CONSTANTS.IS_REQUIRED")
    //     .test('only numbers', "GLOBAL_CONSTANTS.INVALID_PHONE_NUMBER", value => {
    //         if (!value) return true;
    //         return ONLY_NUMBERS_REGEX.test(value);
    //     })
    //     .min(6, "GLOBAL_CONSTANTS.PHONE_NUMBER_AT_LEAST")
    //     .max(13, "GLOBAL_CONSTANTS.PHONE_NUMBER_MAX"),
    // phoneCode: Yup.string()
    //     .required("GLOBAL_CONSTANTS.IS_REQUIRED"),
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

    // town: Yup.string()
    //     .required("GLOBAL_CONSTANTS.IS_REQUIRED")
    //     .matches(VALID_GLOBAL_REGEX, "GLOBAL_CONSTANTS.INVALID_TOWN")
    //     .test('no-emojis', "GLOBAL_CONSTANTS.INVALID_TOWN", value => {
    //         if (!value) return true;
    //         return !EMOJI_REGEX.test(value);
    //     })
    //     .max(50, "GLOBAL_CONSTANTS.INVALID_TOWN"),

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

});

export const AddressShema = () => Yup.object().shape({
    favoriteName: Yup.string()
        .required("GLOBAL_CONSTANTS.IS_REQUIRED")
        .matches(/^[a-zA-Z0-9 ]*$/, "GLOBAL_CONSTANTS.INVALID_FAVORITE_NAME")
        .test('no-only-numbers', "GLOBAL_CONSTANTS.INVALID_FAVORITE_NAME", value => !value || /[a-zA-Z]/.test(value))
        .test('no-emojis', "GLOBAL_CONSTANTS.INVALID_FAVORITE_NAME", value => !value || !EMOJI_REGEX.test(value))
        .test('no-html', "GLOBAL_CONSTANTS.INVALID_FAVORITE_NAME", value => !value || !HTML_REGEX.test(value))
        .test('no-whitespace', "GLOBAL_CONSTANTS.INVALID_FAVORITE_NAME", value => !value || SPACE_NUMBERS_REGEX.test(value))
        .max(50, "GLOBAL_CONSTANTS.FAVORITE_NAME_MUST_50CHARACTER"),


    addressType: Yup.string()
        .required("GLOBAL_CONSTANTS.IS_REQUIRED"),

    // email: Yup.string()
    //     .required("GLOBAL_CONSTANTS.IS_REQUIRED")
    //     .matches(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, "GLOBAL_CONSTANTS.INVALID_EMAIL"),
    // phoneNumber: Yup.string()
    //     .required("GLOBAL_CONSTANTS.IS_REQUIRED")
    //     .test('only numbers', "GLOBAL_CONSTANTS.INVALID_PHONE_NUMBER", value => !value || ONLY_NUMBERS_REGEX.test(value))
    //     .min(6, "GLOBAL_CONSTANTS.PHONE_NUMBER_AT_LEAST")
    //     .max(13, "GLOBAL_CONSTANTS.PHONE_NUMBER_MAX"),
    // phoneCode: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
    postalCode: Yup.string()
        .required("GLOBAL_CONSTANTS.IS_REQUIRED")
        .test('valid-format', "GLOBAL_CONSTANTS.INVALID_POSTAL_CODE", value => !value || POSTAL_CODE_REGEX.test(value))
        .test('no-emojis', "GLOBAL_CONSTANTS.INVALID_POSTAL_CODE", value => !value || !EMOJI_REGEX.test(value))
        .test('no-html', "GLOBAL_CONSTANTS.INVALID_POSTAL_CODE", value => !value || !HTML_REGEX.test(value))
        .min(3, "GLOBAL_CONSTANTS.POSTAL_CODE_AT_LEAST")
        .max(8, "GLOBAL_CONSTANTS.POSTAL_CODE_MAX"),
    addressLine2: Yup.string()
        .nullable()
        .test('valid-state', "GLOBAL_CONSTANTS.INVAIDE_ADDRESS_LINE2", value => {
            if (!value) return true;
            const VALID_STATE_REGEX = /^(?=.*[A-Za-z0-9]).+$/;
            return (
                VALID_STATE_REGEX.test(value.trim()) &&
                !EMOJI_REGEX.test(value) &&
                (CONTAINS_LETTER.test(value) || (CONTAINS_NUMBER.test(value) && CONTAINS_SPECIAL_CHAR.test(value)))
            );
        })
        .max(100, "GLOBAL_CONSTANTS.ADDRESS_LINE2_MAX"),
    addressLine1: Yup.string()
        .required("GLOBAL_CONSTANTS.IS_REQUIRED")
        .test('valid-address', "GLOBAL_CONSTANTS.INVAIDE_ADDRESS_LINE1", value => {
            if (!value) return true;
            const VALID_STATE_REGEX = /^(?=.*[A-Za-z0-9]).+$/;
            return (
                VALID_STATE_REGEX.test(value.trim()) &&
                !EMOJI_REGEX.test(value) &&
                (CONTAINS_LETTER.test(value) || (CONTAINS_NUMBER.test(value) && CONTAINS_SPECIAL_CHAR.test(value)))
            );
        })
        .max(100, "GLOBAL_CONSTANTS.ADDRESS_LINE1_MAX"),
    city: Yup.string()
        .required("GLOBAL_CONSTANTS.IS_REQUIRED")
        .test('valid-state', "GLOBAL_CONSTANTS.INVALID_CITY", value => {
            if (!value) return true;
            const VALID_STATE_REGEX = /^[A-Za-z\s-]+$|^[A-Za-z\s-]+\d+$/;
            return VALID_STATE_REGEX.test(value.trim());
        })
        .max(50, "GLOBAL_CONSTANTS.INVALID_CITY"),
    state: Yup.string()
        .required("GLOBAL_CONSTANTS.IS_REQUIRED")
        .matches(VALID_GLOBAL_REGEX, "GLOBAL_CONSTANTS.INVALID_STATE")
        .test('no-emojis', "GLOBAL_CONSTANTS.INVALID_STATE", value => !value || !EMOJI_REGEX.test(value))
        .max(50, "GLOBAL_CONSTANTS.INVALID_STATE"),
    // town: Yup.string()
    //     .required("GLOBAL_CONSTANTS.IS_REQUIRED")
    //     .matches(VALID_GLOBAL_REGEX, "GLOBAL_CONSTANTS.INVALID_TOWN")
    //     .test('no-emojis', "GLOBAL_CONSTANTS.INVALID_TOWN", value => !value || !EMOJI_REGEX.test(value))
    //     .max(50, "GLOBAL_CONSTANTS.INVALID_TOWN"),
    country: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED").nullable(),
});