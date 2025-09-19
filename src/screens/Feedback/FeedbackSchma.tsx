import * as Yup from "yup";
const HTML_REGEX = /<[^>]*>?/g;
const EMOJI_REGEX = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{1FAB0}-\u{1FAB6}\u{1FAC0}-\u{1FAC2}\u{1FAD0}\u{200D}\u{2640}\u{200D}\u{2642}]/gu;
const ONLY_NUMBERS_REGEX = /^\d+$/;
const SPACE_NUMBERS_REGEX = /^(?=.*\S).+$/;
const CHAR_SPACE_NUMBER = /^(?!.*\s$)(?!^\s)(?=.*[a-zA-Z0-9])[a-zA-Z0-9\s]+$/;

export const FeedbackSchema = Yup.object().shape({
    email: Yup.string()
        .required("Is required")
        .matches(
            /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            "Invalid email address").max(50, "Email must be at most 50 characters"),
    phoneCode: Yup.string()
        .required("Phone code is required"),
    phoneNumber: Yup.string()
        .required("Is required")
        .test('only numbers', 'Invalid phone number.', value => {
            if (!value) return true;
            return ONLY_NUMBERS_REGEX.test(value);
        })
        .min(5, "Please enter a valid mobile number.")
        .max(15, "Please enter a valid mobile number."),

    feedback: Yup.string()
        .required("Is required")
        .matches(
            /^(?=.*[a-zA-Z])[a-zA-Z0-9\s'_'-]*$/,
            "Please enter valid feedback."
        )
        .test('no-emojis', 'Feedback cannot contain emojis.', value => {
            if (!value) return true;
            return !EMOJI_REGEX.test(value);
        })
        .test('no-html', 'Feedback cannot contain HTML tags.', value => {
            if (!value) return true;
            return !HTML_REGEX.test(value);
        })
        .max(200, "Feedback must be at most 200 characters"),
});
