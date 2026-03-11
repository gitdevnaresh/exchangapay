import * as Yup from "yup";

const HTML_REGEX = /<[^>]*>?/g;
const EMOJI_REGEX = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2300}-\u{23FF}\u{2B50}\u{1F004}-\u{1F0CF}\u{2B06}\u{2194}\u{1F201}-\u{1F251}]/gu;
const SUBJECT_ALLOWED_CHARS_REGEX = /^[A-Za-z0-9\s_\.\(\)]*$/;

 export  const CreateTicketSchema = Yup.object().shape({
    subject: Yup.string()
      .min(3, "GLOBAL_CONSTANTS.SUBJECT_MUST_BE_AT_LEAST_3_CHARACTERS_LONG")
      .max(40, "GLOBAL_CONSTANTS.SUBJECT_CANNOT_EXCEED_40_CHARACTERS")
      .test('allowed-chars', 'GLOBAL_CONSTANTS.INVALID_SUBJECT', value => !value || SUBJECT_ALLOWED_CHARS_REGEX.test(value))
      .test('no-emojis', 'GLOBAL_CONSTANTS.INVALID_SUBJECT', value => !value || !EMOJI_REGEX.test(value))
      .test('no-html', 'GLOBAL_CONSTANTS.INVALID_SUBJECT', value => !value || !HTML_REGEX.test(value))
      .required(""),
    priority: Yup.string()
      .required(""),
    message: Yup.string()
      .min(10, "GLOBAL_CONSTANTS.MESSAGE_MUST_BE_AT_LEAST_10_CHARACTERS_LONG")
      .max(300, "GLOBAL_CONSTANTS.MESSAGE_CANNOT_EXCEED_300_CHARACTERS")
      .test('no-emojis', "GLOBAL_CONSTANTS.INVALID_MESSAGE", value => !value || !EMOJI_REGEX.test(value))
      .test('no-html', "GLOBAL_CONSTANTS.INVALID_MESSAGE", value => !value || !HTML_REGEX.test(value))
      .required(""),
  });