import * as Yup from 'yup';

export const addNickNameSchema = Yup.object().shape({
    nickname: Yup.string()
        .required("")
        .matches(
            /^[a-zA-Z0-9 !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]*$/,
            "GLOBAL_CONSTANTS.NICK_NAME_REQUIRED"
        ) // Allow letters, numbers, spaces, and common special characters
        .test('no-only-numbers', "GLOBAL_CONSTANTS.NICK_NAME_REQUIRED", value => {
            if (!value) return true;
            return /[a-zA-Z]/.test(value); 
        })
    })