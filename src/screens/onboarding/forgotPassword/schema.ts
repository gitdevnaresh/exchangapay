import * as Yup from 'yup';

export interface ForgotPasswordFormValues {
  email: string;
  termsAccepted: boolean;
}

export const ForgotPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .email('GLOBAL_CONSTANTS.INVALID_EMAIL_ADDRESS') 
    .test(
            'valid-email-format',
            'GLOBAL_CONSTANTS.INVALID_EMAIL_ADDRESS',
            value => {
                if (!value) return true;
                const [localPart] = value.split('@');
                if (!localPart) return false;
                // Check for consecutive dots, leading/trailing dots in local part
                return !/\.{2,}/.test(localPart) && !/^\./.test(localPart) && !/\.$/.test(localPart);
            }
        )// Ensure this key exists in your translations
    // .required('GLOBAL_CONSTANTS.IS_REQUIRED'), // Ensure this key exists in your translations
    
});