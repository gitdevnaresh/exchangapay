import * as Yup from 'yup';

export const addressInitialValues = {
  cardholder: '',
  country: '',
  address1: '',
  address2: '',
  province: '',
  city: '',
  zip: '',
};

export interface AddressFormProps {
  initialValues?: {
    cardholder?: string;
    country?: string;
    address1?: string;
    address2?: string;
    province?: string;
    city?: string;
    zip?: string;
  };
  onSave: (values: any) => void;
  countryList?: { id: string; name: string }[];
}


 export type AddressFormRouteParams = {
  addressType?: 'billing' | 'shipping';
  mode?: 'add' | 'edit' | 'change';
  initialValues?: any;
};

const HTML_REGEX = /<[^>]*>?/g;
const EMOJI_REGEX = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2300}-\u{23FF}\u{2B50}\u{1F004}-\u{1F0CF}\u{2B06}\u{2194}\u{1F201}-\u{1F251}]/gu;
const ONLY_NUMBERS_REGEX = /^\d+$/;
const ONLY_SPECIAL_CHARS_REGEX = /^[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/;
export const POSTAL_CODE_REGEX = /^[A-Za-z0-9\s\-]{3,10}$/;


export const addressValidationSchema = Yup.object().shape({
  cardholderName: Yup.string()
    .required("")
    .test('no-emojis', 'GLOBAL_CONSTANTS.INVALID_CARD_HOLDER_NAME', value => !value || !EMOJI_REGEX.test(value))
    .test('no-html', 'GLOBAL_CONSTANTS.INVALID_CARD_HOLDER_NAME', value => !value || !HTML_REGEX.test(value)),
  country: Yup.string().required(''),
  address1: Yup.string()
    .required('')
    .test('no-emojis', 'GLOBAL_CONSTANTS.INVAIDE_ADDRESS_LINE1', value => !value || !EMOJI_REGEX.test(value))
    .test('no-html', 'GLOBAL_CONSTANTS.INVAIDE_ADDRESS_LINE1', value => !value || !HTML_REGEX.test(value)),
  address2: Yup.string()
    .test('no-emojis', 'GLOBAL_CONSTANTS.INVAIDE_ADDRESS_LINE2', value => !value || !EMOJI_REGEX.test(value))
    .test('no-html', 'GLOBAL_CONSTANTS.INVAIDE_ADDRESS_LINE2', value => !value || !HTML_REGEX.test(value)),
  state: Yup.string()
    .required('')
    .test('no-emojis', 'GLOBAL_CONSTANTS.INVALID_STATE', value => !value || !EMOJI_REGEX.test(value))
    .test('no-html', 'GLOBAL_CONSTANTS.INVALID_STATE', value => !value || !HTML_REGEX.test(value))
    .test('no-only-numbers', 'GLOBAL_CONSTANTS.INVALID_STATE', value => !value || !ONLY_NUMBERS_REGEX.test(value))
    .test('no-only-special-chars', 'GLOBAL_CONSTANTS.INVALID_STATE', value => !value || !ONLY_SPECIAL_CHARS_REGEX.test(value)),
  city: Yup.string()
    .required('')
    .test('no-emojis', 'GLOBAL_CONSTANTS.INVALID_CITY', value => !value || !EMOJI_REGEX.test(value))
    .test('no-html', 'GLOBAL_CONSTANTS.INVALID_CITY', value => !value || !HTML_REGEX.test(value))
    .test('no-only-numbers', 'GLOBAL_CONSTANTS.INVALID_CITY', value => !value || !ONLY_NUMBERS_REGEX.test(value))
    .test('no-only-special-chars', 'GLOBAL_CONSTANTS.INVALID_CITY', value => !value || !ONLY_SPECIAL_CHARS_REGEX.test(value)),
postalCode: Yup.string()
    .required('') // Or a more user-friendly message
    .matches(POSTAL_CODE_REGEX, 'GLOBAL_CONSTANTS.INVALID_POSTAL_CODE') // Validation message for format error
    .max(9, 'GLOBAL_CONSTANTS.INVALID_POSTAL_CODE'),
  town: Yup.string()
    .required('')
    .test('no-emojis', 'GLOBAL_CONSTANTS.INVALID_TOWN', value => !value || !EMOJI_REGEX.test(value))
    .test('no-html', 'GLOBAL_CONSTANTS.INVALID_TOWN', value => !value || !HTML_REGEX.test(value)),
});