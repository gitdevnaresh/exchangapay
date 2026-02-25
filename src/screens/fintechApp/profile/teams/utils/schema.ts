import * as Yup from 'yup';

const EMOJI_REGEX = /\p{Extended_Pictographic}/u;
const HTML_REGEX = /<[^>]*>?/g;

/**
 * USERNAME VALIDATION REGEX
 * ACCEPTS: Letters, numbers, and special chars: _ + - . ! # $ " ^ ' ~ @
 * EXAMPLES: ✅ "john123", "user_name", "test@domain", "user.name", "user+tag"
 * REJECTS: ❌ Spaces, emojis, HTML tags, other special chars
 * MINIMUM: 3 characters, must contain at least one letter or number
 */
const VALID_USERNAME_REGEX = /^(?=.*[a-zA-Z0-9])[a-zA-Z0-9_\+\-\.\!#\$"\^'~@]+$/;
const MEMBER_ID_REGEX = /^[a-zA-Z0-9]+$/;

/**
 * NAME VALIDATION REGEX (First Name & Last Name)
 * ACCEPTS: Letters (including international), spaces, hyphens, apostrophes
 * EXAMPLES: ✅ "John", "López", "Anne-Marie", "O'Connor", "José María", "François"
 * REJECTS: ❌ Numbers, emojis, HTML tags, other special characters
 * SUPPORTS: International characters (À-Ö, Ø-ö, ø-ÿ)
 */
const NAME_REGEX = /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/;

export const getInviteMemberSchema = (t: (key: string) => string) => {
  return Yup.object().shape({
    /**
     * USERNAME VALIDATION
     * - Minimum 3 characters
     * - Must contain at least one letter or number
     * - Allows: a-z, A-Z, 0-9, _ + - . ! # $ " ^ ' ~ @
     * - Rejects: spaces, emojis, HTML tags
     */
    userName: Yup.string()
      .min(3, 'Username must be at least 3 characters')
      .matches(VALID_USERNAME_REGEX, 'GLOBAL_CONSTANTS.USERNAME_INVALID')
      .test('no-emojis', 'GLOBAL_CONSTANTS.USERNAME_NO_EMOJIS', (value) => !EMOJI_REGEX.test(value || ''))
      .required('GLOBAL_CONSTANTS.IS_REQUIRED'),
    /**
     * FIRST NAME VALIDATION
     * - Allows: Letters (including international), spaces, hyphens, apostrophes
     * - Examples: "John", "López", "Anne-Marie", "O'Connor", "José María"
     * - Rejects: Numbers, emojis, HTML tags, other special characters
     * - Max length: 50 characters
     */
    firstName: Yup.string()
      .required("GLOBAL_CONSTANTS.IS_REQUIRED")
      .matches(NAME_REGEX, "GLOBAL_CONSTANTS.INVALID_FIRST_NAME")
      .test('no-emojis', "GLOBAL_CONSTANTS.INVALID_FIRST_NAME", value => {
        if (!value) return true;
        return !EMOJI_REGEX.test(value);
      })
      .test('no-html', "GLOBAL_CONSTANTS.INVALID_FIRST_NAME", value => {
        if (!value) return true;
        return !HTML_REGEX.test(value);
      })
      .max(50, "GLOBAL_CONSTANTS.FIRST_NAME_MUST_50CHARACTER"),

    /**
     * LAST NAME VALIDATION
     * - Allows: Letters (including international), spaces, hyphens, apostrophes
     * - Examples: "Smith", "García", "Van Der Berg", "O'Neill", "Saint-Pierre"
     * - Rejects: Numbers, emojis, HTML tags, other special characters
     * - Max length: 50 characters
     */
    lastName: Yup.string()
      .required("GLOBAL_CONSTANTS.IS_REQUIRED")
      .matches(NAME_REGEX, "GLOBAL_CONSTANTS.INVALID_LAST_NAME")
      .test('no-emojis', "GLOBAL_CONSTANTS.INVALID_LAST_NAME", value => {
        if (!value) return true;
        return !EMOJI_REGEX.test(value);
      })
      .test('no-html', "GLOBAL_CONSTANTS.INVALID_LAST_NAME", value => {
        if (!value) return true;
        return !HTML_REGEX.test(value);
      })
      .max(50, "GLOBAL_CONSTANTS.LAST_NAME_MUST_50CHARACTER"),
    gender: Yup.string().required(t('GLOBAL_CONSTANTS.IS_REQUIRED')),
    country: Yup.string().required(t('GLOBAL_CONSTANTS.IS_REQUIRED')),
    phoneCode: Yup.string().required(t('GLOBAL_CONSTANTS.IS_REQUIRED')),
    phoneNumber: Yup.string()
      .matches(/^\d{6,15}$/, t('GLOBAL_CONSTANTS.INVALID_PHONE_NUMBER'))
      .required(t('GLOBAL_CONSTANTS.IS_REQUIRED')),
    email: Yup.string()
      .transform(value => value?.trim())
      .email(t('GLOBAL_CONSTANTS.INVALID_EMAIL'))
      .matches(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, t('GLOBAL_CONSTANTS.INVALID_EMAIL'))
      .max(50, t('GLOBAL_CONSTANTS.EMAIL_MAX_50_CHARACTERS'))
      .required(t('GLOBAL_CONSTANTS.IS_REQUIRED')),
  memberId: Yup.string().required(t('GLOBAL_CONSTANTS.IS_REQUIRED'))
  .matches(MEMBER_ID_REGEX, 'GLOBAL_CONSTANTS.INVALID_MEMBER_ID')
  .test('no-emojis', "GLOBAL_CONSTANTS.INVALID_MEMBER_ID", value => {
        if (!value) return true;
        return !EMOJI_REGEX.test(value);
      })
      .test('no-html', "GLOBAL_CONSTANTS.INVALID_MEMBER_ID", value => {
        if (!value) return true;
        return !HTML_REGEX.test(value);
      })
      .max(20, "GLOBAL_CONSTANTS.INVALID_MEMBER_ID"),
  });
};