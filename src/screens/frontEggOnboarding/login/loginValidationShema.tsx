import * as Yup from 'yup';

export const LoginValidationSchema = Yup.object().shape({
    email: Yup.string()
        .email('GLOBAL_CONSTANTS.INVALID_EMAIL_ADDRESS')
        .matches(
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            'GLOBAL_CONSTANTS.INVALID_EMAIL_ADDRESS'
        )
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
        )
        .required(''),
    password: Yup.string()
        .required('')
        .min(8, 'GLOBAL_CONSTANTS.INVALID_PASSWORD')
        .max(32, 'GLOBAL_CONSTANTS.INVALID_PASSWORD')
        .matches(/[A-Z]/, 'GLOBAL_CONSTANTS.INVALID_PASSWORD')
        .matches(/[a-z]/, 'GLOBAL_CONSTANTS.INVALID_PASSWORD')
        .matches(/[0-9]/, 'GLOBAL_CONSTANTS.INVALID_PASSWORD')
        .matches(/[!@#$%^&*_-]/, 'GLOBAL_CONSTANTS.INVALID_PASSWORD'),
});