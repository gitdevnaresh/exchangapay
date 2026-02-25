import * as Yup from 'yup';

export const withDrawSchema = Yup.object().shape({
    amount:Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
    currency: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
    network: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
})