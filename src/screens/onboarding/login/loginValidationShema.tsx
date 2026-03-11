import * as Yup from 'yup';

export const LoginValidationSchema = Yup.object().shape({
    email: Yup.string()
        .email('GLOBAL_CONSTANTS.INVALID_EMAIL_ADDRESS')
        .matches(
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            'GLOBAL_CONSTANTS.INVALID_EMAIL_ADDRESS'
        )
        .required(''),
    password: Yup.string()
        .required('')
        .min(8, 'GLOBAL_CONSTANTS.PASSWORD_MIN_LENGTH')
        .max(32, 'GLOBAL_CONSTANTS.PASSWORD_MAX_LENGTH')
        .matches(/[A-Z]/, 'GLOBAL_CONSTANTS.PASSWORD_UPPERCASE')
        .matches(/[a-z]/, 'GLOBAL_CONSTANTS.PASSWORD_LOWERCASE')
        .matches(/[0-9]/, 'GLOBAL_CONSTANTS.PASSWORD_NUMBER')
        .matches(/[!@#$%^&*_-]/, 'GLOBAL_CONSTANTS.PASSWORD_SPECIAL'),
});