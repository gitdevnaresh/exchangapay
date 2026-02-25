import * as Yup from "yup";
const EMOJI_REGEX = /\p{Extended_Pictographic}/u;

export const Auth0SigninSchema = (t: (key: string, params?: object) => string) => Yup.object().shape({

  email: Yup.string()
    .required('GLOBAL_CONSTANTS.IS_REQUIRED')
    .test(
      'no-emojis',
      'GLOBAL_CONSTANTS.USERNAME_NO_EMOJIS',
      (value) => !EMOJI_REGEX.test(value || '')
  ),
  password: Yup.string()
    .min(8, "GLOBAL_CONSTANTS.INVALID_PASSWORD")
    .required('GLOBAL_CONSTANTS.IS_REQUIRED'),
});

export interface Auth0SigninFormValues {
  email: string;
  password: string;
}