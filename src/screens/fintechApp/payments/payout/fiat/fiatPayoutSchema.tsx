import * as Yup from 'yup';

export const PAYOUT_CONSTANTS = {
    FIELD_NAMES: {
        FROM_CURRENCY: 'fromCurrency',
        AMOUNT: 'amount',
        TO_CURRENCY: 'toCurrency',
        PAYEE: 'payee',
        PURPOSE: 'purpose',
        SOURCE_OF_FUNDS: 'sourceOfFunds',
    },
    NAVIGATION: {
        PAYOUT_SUMMARY: 'PayoutSummary',
        ADD_PAYEE: 'AddPayeeScreen', // Example navigation route
    }
};

const formatNumber = (num: number | undefined) => {
    if (num === undefined) return '';
    return num.toLocaleString('en-US');
};

// --- Dynamic Validation Schema ---
 export const createValidationSchema = (selectedNetwork: any, t: any) => Yup.object().shape({
    fromCurrency: Yup.string().required(t('GLOBAL_CONSTANTS.IS_REQUIRED')),
    amount: Yup.number()
        .required(t('GLOBAL_CONSTANTS.IS_REQUIRED'))
        .positive(t('GLOBAL_CONSTANTS.AMOUNT_MUST_BE_POSITIVE'))
        .min(selectedNetwork?.minLimit , `${t('GLOBAL_CONSTANTS.MINIMUM_AMOUNT_IS')} ${formatNumber(selectedNetwork?.minLimit) ||'200,000'}`)
        .max(selectedNetwork?.maxLimit, `${t('GLOBAL_CONSTANTS.MAXIMUM_AMOUNT_IS')} ${formatNumber(selectedNetwork?.maxLimit) || '10,000,000'}`),
    // toCurrency: Yup.string().required(t('GLOBAL_CONSTANTS.IS_REQUIRED')),
});
