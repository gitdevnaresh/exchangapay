import * as Yup from "yup";
const HTML_REGEX = /<[^>]*>?/g;
const EMOJI_REGEX = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{1FAB0}-\u{1FAB6}\u{1FAC0}-\u{1FAC2}\u{1FAD0}\u{200D}\u{2640}\u{200D}\u{2642}]/gu;
export const SecurityQuestionSchema = Yup.object().shape({
    question1: Yup.string().required("Question1 is required"),
    answer: Yup.string().required('Answer1 is required')
        .matches(/^(?=.*\S).+$/, "Answer1 cannot contain whitespace")
        .test('no-emojis', 'Answer1 cannot contain emojis.', value => {
            if (!value) return true;
            return !EMOJI_REGEX.test(value);
        })
        .test('no-html', 'Answer1 cannot contain HTML tags.', value => {
            if (!value) return true;
            return !HTML_REGEX.test(value);
        })
        .max(256, "Answer1 must be at most 256 characters"),
    question2: Yup.string().required('Question2 is required')
        .notOneOf([Yup.ref('question1')], 'Question 2 cannot have the same'),
    answer2: Yup.string().required("Answer2 is required")
        .matches(/^(?=.*\S).+$/, "Answer2 cannot contain whitespace")
        .test('no-emojis', 'Answer2 cannot contain emojis.', value => {
            if (!value) return true;
            return !EMOJI_REGEX.test(value);
        })
        .test('no-html', 'Answer2 cannot contain HTML tags.', value => {
            if (!value) return true;
            return !HTML_REGEX.test(value);
        })
        .max(256, "Answer2 must be at most 256 characters"),
    question3: Yup.string().required("Question3 is required")
        .notOneOf([Yup.ref('question1'), Yup.ref('question2')], 'Question 3 cannot have the same'),
    answer3: Yup.string().required("Answer3 is required")
        .matches(/^(?=.*\S).+$/, "Answer3 cannot contain whitespace")
        .test('no-emojis', 'Answer3 cannot contain emojis.', value => {
            if (!value) return true;
            return !EMOJI_REGEX.test(value);
        })
        .test('no-html', 'Answer3 cannot contain HTML tags.', value => {
            if (!value) return true;
            return !HTML_REGEX.test(value);
        })
        .max(256, "Answer3 must be at most 256 characters"),
});
