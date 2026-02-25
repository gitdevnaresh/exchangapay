import * as Yup from "yup";

export const withdrawSchema = Yup.object().shape({
    amount: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
    currency: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
})