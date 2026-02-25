import * as Yup from "yup";
export const MembershipSchema=Yup.object().shape({
    currency: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
    network: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
})