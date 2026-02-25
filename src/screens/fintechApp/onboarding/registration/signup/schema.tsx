import * as Yup from 'yup';

export interface Auth0SignupFormValues {
  email: string;
  username: string;
  password: string;
}
const EMOJI_REGEX = /\p{Extended_Pictographic}/u;
const VALID_USERNAME_REGEX = /^(?=.*[a-zA-Z0-9])[a-zA-Z0-9_\+\-\.\!#\$"\^'~@]+$/;

export const Auth0SignupSchema = Yup.object().shape({
  email: Yup.string()
    .email("GLOBAL_CONSTANTS.INVALID_EMAIL")
    .required('GLOBAL_CONSTANTS.IS_REQUIRED')
    .matches(
      /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      "GLOBAL_CONSTANTS.INVALID_EMAIL"),
  username: Yup.string()
    .min(3, 'Username must be at least 3 characters')
    // Add the .matches() test here
    .matches(
      VALID_USERNAME_REGEX,
      // Use a new translation key for the specific error message
      'GLOBAL_CONSTANTS.USERNAME_INVALID'
    )
    .test(
      'no-emojis',
      'GLOBAL_CONSTANTS.USERNAME_NO_EMOJIS',
      (value) => !EMOJI_REGEX.test(value || '')
    )
    .required('GLOBAL_CONSTANTS.IS_REQUIRED'),
  password: Yup.string()
    .min(8, 'GLOBAL_CONSTANTS.PASSWORD_MIN_LENGTH')
    .matches(/^[A-Za-z0-9@$!%*?&#]+$/, 'GLOBAL_CONSTANTS.PASSWORD_CANTAIN')
    .matches(/[A-Z]/, 'GLOBAL_CONSTANTS.THE_PASSWORD_IS_TOO_WEAK')
    .matches(/[a-z]/, 'GLOBAL_CONSTANTS.THE_PASSWORD_IS_TOO_WEAK')
    .matches(/[0-9]/, 'GLOBAL_CONSTANTS.THE_PASSWORD_IS_TOO_WEAK')
    .matches(/[@$!%*?&#]/, 'GLOBAL_CONSTANTS.THE_PASSWORD_IS_TOO_WEAK')
    .required('GLOBAL_CONSTANTS.IS_REQUIRED')

});
