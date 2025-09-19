import * as Yup from "yup";
const HTML_REGEX = /<[^>]*>?/g;
const EMOJI_REGEX = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{1FAB0}-\u{1FAB6}\u{1FAC0}-\u{1FAC2}\u{1FAD0}\u{200D}\u{2640}\u{200D}\u{2642}]/gu;
const ONLY_NUMBERS_REGEX = /^\d+$/;
export const RegistrationSchema = Yup.object().shape({
    firstName:  Yup.string().required("Is Required")
    .matches(/^(?=.*\S).+$/, "First Name cannot contain whitespace.")
    .matches(/^[a-zA-Z ]*$/, "First Name must contain only characters")
        .test('no-emojis', 'First Name cannot contain emojis.', value => {
            if (!value) return true;
            return !EMOJI_REGEX.test(value);
        })
        .test('no-html', 'First Name cannot contain HTML tags.', value => {
            if (!value) return true;
            return !HTML_REGEX.test(value);
        })
        .max(50, "First Name should be max 50"),
    lastName: Yup.string().required("Is Required")
    .matches(/^(?=.*\S).+$/, "Last Name cannot contain whitespace.")
    .matches(/^[a-zA-Z ]*$/, "First Name must contain only characters")
        .test('no-emojis', 'Last Name cannot contain emojis.', value => {
            if (!value) return true;
            return !EMOJI_REGEX.test(value);
        })
        .test('no-html', 'Last Name cannot contain HTML tags.', value => {
            if (!value) return true;
            return !HTML_REGEX.test(value);
        })
        .max(50, "Last Name should be max 50"),
    phoneNumber: Yup.string().required('Is Required')
    .test('only numbers', 'Invalid phone number.', value => {
        if (!value) return true;
        return ONLY_NUMBERS_REGEX.test(value);
    })
    .min(5, "Please enter a valid mobile number.")
    .max(10, "Please enter a valid mobile number."),
    country: Yup.string().required('Is Required'),
    phoneCode: Yup.string().required("Phone code is required"),
});
