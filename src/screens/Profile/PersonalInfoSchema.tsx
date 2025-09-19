import * as Yup from "yup";
const HTML_REGEX = /<[^>]*>?/g;
const EMOJI_REGEX = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{1FAB0}-\u{1FAB6}\u{1FAC0}-\u{1FAC2}\u{1FAD0}\u{200D}\u{2640}\u{200D}\u{2642}]/gu;
const ONLY_NUMBERS_REGEX = /^\d+$/;
const SPACE_NUMBERS_REGEX = /^(?=.*\S).+$/;

export const CreateAccSchema = Yup.object().shape({
    postalCode: Yup.string()
        .required("Is required")
        .min(4, 'Postal code must be at least 4 characters')
        .max(10, 'Postal code must be at most 10 characters')
        .matches(/^[A-Za-z0-9]+(?:[ -][A-Za-z0-9]+)*$/, 'Invalid Postal Code')
        .test('no-emojis', 'Postal code cannot contain emojis.', value => {
            if (!value) return true;
            return !EMOJI_REGEX.test(value);
        })
        .test('no-html', 'Postal code cannot contain HTML tags.', value => {
            if (!value) return true;
            return !HTML_REGEX.test(value);
        })
        .test('no-whitespace', 'Postal code cannot contain whitespace.', value => {
            if (!value) return true;
            return SPACE_NUMBERS_REGEX.test(value);
        }),
    
    addressLine1: Yup.string().required("Is required ")
        .max(100, "Address Line1 must be at most 100 characters")
        .test('no-emojis', 'Address Line1 cannot contain emojis.', value => {
            if (!value) return true;
            return !EMOJI_REGEX.test(value);
        })
        .test('no-html', 'Address Line1 cannot contain HTML tags.', value => {
            if (!value) return true;
            return !HTML_REGEX.test(value);
        })
        .test('no-whitespace', 'Is required', value => {
            if (!value) return true;
            return SPACE_NUMBERS_REGEX.test(value);
        })
    ,
    city: Yup.string().required('Is required ')
        .test('no-emojis', 'City cannot contain emojis.', value => {
            if (!value) return true;
            return !EMOJI_REGEX.test(value);
        })
        .test('no-html', 'City cannot contain HTML tags.', value => {
            if (!value) return true;
            return !HTML_REGEX.test(value);
        })
        .test('no-whitespace', 'Is required', value => {
            if (!value) return true;
            return SPACE_NUMBERS_REGEX.test(value);
        }).max(50, "City should be max 50"),
    state: Yup.string().required('Is required ')
        .test('no-emojis', 'State cannot contain emojis.', value => {
            if (!value) return true;
            return !EMOJI_REGEX.test(value);
        })
        .test('no-html', 'State cannot contain HTML tags.', value => {
            if (!value) return true;
            return !HTML_REGEX.test(value);
        })
        .test('no-whitespace', 'Is required', value => {
            if (!value) return true
            return SPACE_NUMBERS_REGEX.test(value);
        }).max(50, "State should be max 50")

});




export const AccountInfoSchema = Yup.object().shape({
    email: Yup.string()
        .required("Is required")
        .matches(
            /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            "Invalid email address"),
    phoneNumber: Yup.string()
        .required("Is required")
        .test('only numbers', 'Invalid phone number.', value => {
            if (!value) return true;
            return ONLY_NUMBERS_REGEX.test(value);
        })
        .min(5, "Please enter a valid mobile number.")
        .max(10, "Please enter a valid mobile number."),
    phoneCode: Yup.string()
        .required("Phone code is required"),
    country: Yup.string().required("Is required ").nullable(),
    lastName: Yup.string()
        .required("Is required")
        .matches(/^[a-zA-Z ]*$/, "Last Name must contain only characters")
        .test('no-emojis', 'Last Name cannot contain emojis.', value => {
            if (!value) return true;
            return !EMOJI_REGEX.test(value);
        })
        .test('no-html', 'Last Name cannot contain HTML tags.', value => {
            if (!value) return true;
            return !HTML_REGEX.test(value);
        })
        .test('no-whitespace', 'Is required', value => {
            if (!value) return true;
            return SPACE_NUMBERS_REGEX.test(value);
        })
        .max(50, "Last Name must be at most 50 characters"),
    firstName: Yup.string()
        .required("Is required ")
        .matches(/^[a-zA-Z ]*$/, "First Name must contain only characters")
        .test('no-emojis', 'First Name cannot contain emojis.', value => {
            if (!value) return true;
            return !EMOJI_REGEX.test(value);
        })
        .test('no-html', 'First Name cannot contain HTML tags.', value => {
            if (!value) return true;
            return !HTML_REGEX.test(value);
        })
        .test('no-whitespace', 'Is required', value => {
            if (!value) return true;
            return SPACE_NUMBERS_REGEX.test(value);
        })
        .max(50, "First Name must be at most 50 characters"),

    userName: Yup.string()
        .required("Is required ")
        .matches(/^[a-zA-Z ]*$/, "User Name must contain only characters")
        .test('no-emojis', 'User Name cannot contain emojis.', value => {
            if (!value) return true;
            return !EMOJI_REGEX.test(value);
        })
        .test('no-html', 'User Name cannot contain HTML tags.', value => {
            if (!value) return true;
            return !HTML_REGEX.test(value);
        })
        .test('no-whitespace', 'Is required', value => {
            if (!value) return true;
            return SPACE_NUMBERS_REGEX.test(value);
        })
        .max(50, "User Name must be at most 50 characters"),
});

export const BusinessTypeSchema = Yup.object().shape({
    email: Yup.string()
        .required("Is required")
        .matches(
            /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            "Invalid email address"),
    phoneNumber: Yup.string()
        .required("Is required")
        .test('only numbers', 'Invalid phone number.', value => {
            if (!value) return true;
            return ONLY_NUMBERS_REGEX.test(value);
        })
        .matches(/^\d{5,15}$/, 'Please enter a valid mobile number.'),
    phoneCode: Yup.string()
        .required("Phone code is required"),
    country: Yup.string().required("Is required ").nullable(),
    companyName: Yup.string()
        .required("Is required ")
        .matches(/^[a-zA-Z ]*$/, "Company Name must contain only characters")
        .test('no-emojis', 'Company Name cannot contain emojis.', value => {
            if (!value) return true;
            return !EMOJI_REGEX.test(value);
        })
        .test('no-html', 'Company Name cannot contain HTML tags.', value => {
            if (!value) return true;
            return !HTML_REGEX.test(value);
        })
        .test('no-whitespace', 'Is required', value => {
            if (!value) return true;
            return SPACE_NUMBERS_REGEX.test(value);
        })
        .max(50, "Company Name must be at most 50 characters"),
    userName: Yup.string()
        .required("Is required ")
        .matches(/^[a-zA-Z ]*$/, "User Name must contain only characters")
        .test('no-emojis', 'User Name cannot contain emojis.', value => {
            if (!value) return true;
            return !EMOJI_REGEX.test(value);
        })
        .test('no-html', 'User Name cannot contain HTML tags.', value => {
            if (!value) return true;
            return !HTML_REGEX.test(value);
        })
        .test('no-whitespace', 'Is required', value => {
            if (!value) return true;
            return SPACE_NUMBERS_REGEX.test(value);
        })
        .max(50, "User Name must be at most 50 characters"),
})

