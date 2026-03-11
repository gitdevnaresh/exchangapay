import * as Yup from 'yup';
import { getTabsConfigation } from '../../../../configuration';

const Configuration: any = getTabsConfigation("PASSWORD_LEVEL");
const criteria = Configuration.criteria[Configuration.passwordLevel];



export const SignupValidationSchema = Yup.object().shape({
    email: Yup.string()
        .email('GLOBAL_CONSTANTS.INVALID_EMAIL_ADDRESS')
        .matches(
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            'GLOBAL_CONSTANTS.INVALID_EMAIL_ADDRESS'
        )
        .required('GLOBAL_CONSTANTS.IS_REQUIRED'),
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
        .min(criteria.minLength, `${criteria.minLength} to ${criteria.maxLength || 32} characters`)
        .max(criteria.maxLength || 128, `${criteria.minLength} to ${criteria.maxLength || 23} characters`)
        .matches(/[A-Z]/, 'At least one uppercase letter')
        .matches(/[a-z]/, 'At least one lowercase letter')
        .matches(/[0-9]/, 'At least one number')
        .matches(/[!@#$%^&*_-]/, 'At least one special character'),
    confirmPassword: Yup.string()
        .required(''),
});
