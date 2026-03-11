
export interface ReferralTopic {
    id: string | number;
    heading?: string;
    title?: string;
    description?: string;
}

export interface ReferralItem {
    id: string;
    imageUrl: string;
    title: string;
    description: string;
    status: number;
    isGoogleLink: boolean;
    googleLink: string;
}

export interface ReferralKpis {
    id: string;
    inviteFriends: number;
    refferalAmount: number | null;
    pending: string;
    approved: string;
    completed: string;
    cashBackCurrency: string;
    currency: string;
    minimumClaim: number;
}

import * as Yup from 'yup';

// Common validation regexes
export const FULL_NAME_REGEX = /^[a-zA-Z0-9\s.'-]{2,100}$/;
export const BULLSWIPE_UID_REGEX = /^[0-9]{6,20}$/;
export const URL_REGEX = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[-a-zA-Z0-9@:%_+.~#?&//=]*)?$/;

export const ReferralValidationSchema = Yup.object().shape({
    fullName: Yup.string()
        .matches(FULL_NAME_REGEX, 'GLOBAL_CONSTANTS.INVALID_FULL_NAME')
        .required(''),
    email: Yup.string()
        .email('GLOBAL_CONSTANTS.INVALID_EMAIL')
        .required('')
        .matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'GLOBAL_CONSTANTS.INVALID_EMAIL'),
    bullswipeUID: Yup.string()
        .matches(BULLSWIPE_UID_REGEX, 'GLOBAL_CONSTANTS.INVALID_BULLSWIPE_UID')
        .notRequired(),
    countryOfResidence: Yup.string().required(''),
    // preferredCommunication: Yup.string().required(''),
    socialMediaorCommunityURL: Yup.string()
        .matches(URL_REGEX, 'GLOBAL_CONSTANTS.INVALID_URL')
        .required(''),
    marketingCountry: Yup.string().required(''),
    briefintroduction: Yup.string().min(20, 'GLOBAL_CONSTANTS.MIN_20_CHARS').required(''),
    termsAccepted: Yup.boolean().oneOf([true], 'GLOBAL_CONSTANTS.TERMS_MUST_ACCEPT'),
});