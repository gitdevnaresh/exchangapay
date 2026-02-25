import * as Yup from "yup";
// import { validateAddress, validateBusinessName, validateFirastName, validateLastName } from './onBoardingSchema'; // Assuming these are exported
import { validateFirastName, validatePhoneNumber, validatePostalCode, validateAddress, validateBusinessName, validateLastName, } from "../../../../utils/helpers/validation/commonValidations";

const HTML_REGEX = /<[^>]*>?/g;
const EMOJI_REGEX = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{1FAB0}-\u{1FAB6}\u{1FAC0}-\u{1FAC2}\u{1FAD0}\u{200D}\u{2640}\u{200D}\u{2642}]/gu;

export const EditPersonalInfoSchema = (isAddressRequired: boolean, accountType?: "Personal" | "Business" | "Corporate") => Yup.object().shape({
    firstName: accountType !== 'Business'
        ? Yup.string()
            .required("GLOBAL_CONSTANTS.IS_REQUIRED")
            .test("validate-first-name", "GLOBAL_CONSTANTS.INVALID_FIRST_NAME", value => !value || validateFirastName(value))
        : Yup.string().nullable(),
    lastName: accountType !== 'Business'
        ? Yup.string()
            .required("GLOBAL_CONSTANTS.IS_REQUIRED")
            .test("validate-last-name", "GLOBAL_CONSTANTS.INVALID_LAST_NAME", value => !value || validateLastName(value))
        : Yup.string().nullable(),
    gender: accountType !== 'Business'
        ? Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED")
        : Yup.string().nullable(),
    businessName: accountType === 'Business'
        ? Yup.string()
            .required("GLOBAL_CONSTANTS.IS_REQUIRED")
            .test("validate-business-name", "GLOBAL_CONSTANTS.INVALID_BUSINESS_NAME", value => !value || validateBusinessName(value))
        : Yup.string().nullable(),
    incorporationDate: accountType === 'Business'
        ? Yup.date().nullable().required("GLOBAL_CONSTANTS.IS_REQUIRED")
        : Yup.date().nullable(),
    phoneNumber: Yup.string()
        .required("GLOBAL_CONSTANTS.IS_REQUIRED")
        .test("validate-phone-number", "GLOBAL_CONSTANTS.INVALID_PHONE_NUMBER", value => !value || validatePhoneNumber(value)),
    phoneCode: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
    country: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
    state: isAddressRequired
        ? Yup.string()
            .required("GLOBAL_CONSTANTS.IS_REQUIRED")
            .matches(/^[a-zA-Z0-9\s-]+$/, "INVALID_STATE_ERROR")
            .test('no-emojis', "INVALID_STATE_ERROR", value => !value || !EMOJI_REGEX.test(value))
            .test('no-html', "INVALID_STATE_ERROR", value => !value || !HTML_REGEX.test(value))
            .max(50, "STATE_MAX_LENGTH_ERROR")
        : Yup.string().nullable(),
    city: isAddressRequired
        ? Yup.string()
            .required("GLOBAL_CONSTANTS.IS_REQUIRED")
            .test("validate-city", "INVALID_CITY_ERROR", value => !value || validateAddress(value)) // Assuming validateAddress can be used for city
        : Yup.string().nullable(),
    addressLine1: isAddressRequired
        ? Yup.string()
            .required("GLOBAL_CONSTANTS.IS_REQUIRED")
            .test("validate-addressLine1", "INVALID_ADDRESS_LINE_1_ERROR", value => !value || validateAddress(value))
        : Yup.string().nullable(),
    postalCode: isAddressRequired
        ? Yup.string()
            .required("GLOBAL_CONSTANTS.IS_REQUIRED")
            .test("validate-postal-code", "INVALID_POSTAL_CODE_ERROR", value => !value || validatePostalCode(value))
        : Yup.string().nullable(),
});

