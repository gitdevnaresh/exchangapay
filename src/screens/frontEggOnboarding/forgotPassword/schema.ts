import * as Yup from 'yup';

export interface ForgotPasswordFormValues {
  email: string;
  termsAccepted: boolean;
}

export const ForgotPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .email('GLOBAL_CONSTANTS.INVALID_EMAIL_ADDRESS') // Ensure this key exists in your translations
    .required(''), // Ensure this key exists in your translations
});