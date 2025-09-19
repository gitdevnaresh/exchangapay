import * as Yup from "yup";
import { USER_CONSTANTS } from "../onBoarding/constants";
const HTML_REGEX = /<[^>]*>?/g;
const EMOJI_REGEX = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{1FAB0}-\u{1FAB6}\u{1FAC0}-\u{1FAC2}\u{1FAD0}\u{200D}\u{2640}\u{200D}\u{2642}]/gu;
export const EditProfileSchema = Yup.object().shape({
    firstName: Yup.string()
  .min(2, USER_CONSTANTS?.FIRST_NAME_MIN)
  .matches(/^[a-zA-Z]+( [a-zA-Z]+)*$/, {
    message: USER_CONSTANTS?.FIRST_NAME_CHARACTERS,
    excludeEmptyString: true,
  })
  .required("Is required"),

lastName: Yup.string()
  .min(2, USER_CONSTANTS?.LAST_NAME_MIN)
  .matches(/^[a-zA-Z]+( [a-zA-Z]+)*$/, {
    message: USER_CONSTANTS?.LAST_NAME_CHARACTERS,
    excludeEmptyString: true,
  })
  .required("Is required"),
    gender: Yup.string().required("Is required"),
    idIssuranceCountry: Yup.string().required("Is required"),
    documentType: Yup.string().required("Is required"),
    documentNumber: Yup.string()
        .required("Is required")
        .matches(/^[a-zA-Z0-9]*$/, "Document Number must contain only characters and numbers")
        .matches(/^(?=.*\S).+$/, "Is required")
        .test('no-emojis', 'Document Number cannot contain emojis.', value => {
            if (!value) return true;
            return !EMOJI_REGEX.test(value);
        })
        .test('no-html', 'Document Number cannot contain HTML tags.', value => {
            if (!value) return true;
            return !HTML_REGEX.test(value);
        })
        .max(20, "Document Number must be at most 20 characters"),

});