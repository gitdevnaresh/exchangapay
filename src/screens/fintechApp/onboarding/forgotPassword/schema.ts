import * as Yup from 'yup';

export interface ForgotPasswordFormValues {
  email: string;
}

export const ForgotPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .email('GLOBAL_CONSTANTS.INVALID_EMAIL_FORMAT') // Ensure this key exists in your translations
    .required('GLOBAL_CONSTANTS.IS_REQUIRED'), // Ensure this key exists in your translations
});