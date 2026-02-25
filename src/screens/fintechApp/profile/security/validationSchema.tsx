import * as Yup from "yup";
export const CreateAccSchema = Yup.object().shape({
    currentPassword: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
    newPassword: Yup.string()
      .required("GLOBAL_CONSTANTS.IS_REQUIRED")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\\$%\\^&\\*])(?=.{8,})/,
        "GLOBAL_CONSTANTS.PASSWORD_VALIDATION_MESSAGE",
      ),
    confirmPassword: Yup.string()
      .required("GLOBAL_CONSTANTS.IS_REQUIRED")
      .oneOf([Yup.ref('newPassword'), ''], "GLOBAL_CONSTANTS.MISS_MATCH_PASSWORD"),
});