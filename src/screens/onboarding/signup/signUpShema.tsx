import * as Yup from 'yup';



export const SignupValidationSchema = Yup.object().shape({
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
    referralCode: Yup.string()
        .test(
            'referral-required-if-present',
            'GLOBAL_CONSTANTS.INVALID_REFERAL_CODE',
            value => !value || value.length === 0 || value.length >= 10
        ),
    termsAccepted: Yup.boolean()
        .oneOf([true], 'GLOBAL_CONSTANTS.ACCEPTING_THE_TERMS_OF_USE')
        .required('GLOBAL_CONSTANTS.ACCEPTING_THE_TERMS_OF_USE'),
});




export const PasswordScreenSchema = Yup.object().shape({
    password: Yup.string()
        .required('')
        .min(8, '8 to 32 characters')
        .max(32, '8 to 32 characters')
        .matches(/[A-Z]/, 'At least one uppercase letter')
        .matches(/[a-z]/, 'At least one lowercase letter')
        .matches(/[0-9]/, 'At least one number')
        .matches(/[!@#$%^&*_-]/, 'At least one special character'),
    confirmPassword: Yup.string()
        // .oneOf([Yup.ref('password')], 'Passwords do not match')
        .required(''),
});
