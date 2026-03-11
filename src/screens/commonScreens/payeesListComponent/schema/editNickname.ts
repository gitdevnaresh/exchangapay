
import * as Yup from "yup";
export const NickNameSchema = Yup.object().shape({
    nickName: Yup.string()
        .required("")
        .max(30, "GLOBAL_CONSTANTS.NICKNAME_MAX_LENGTH_ERROR")
        .matches(
            /^[A-Za-z0-9 !@#$%^&*()_.-]+$/, // Added a space to the character set
            "GLOBAL_CONSTANTS.INVALID_NICKNAME"
        ),
});