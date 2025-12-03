import * as Yup from "yup";
const HTML_REGEX = /<[^>]*>?/g;
const EMOJI_REGEX = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{1FAB0}-\u{1FAB6}\u{1FAC0}-\u{1FAC2}\u{1FAD0}\u{200D}\u{2640}\u{200D}\u{2642}]/gu;
const ONLY_NUMBERS_REGEX = /^\d+$/;
export const QuickLinkSchema = Yup.object().shape({
    cardNumber: Yup.string()
        .required("Is required")
        .test('only numbers', 'Card number caontain only numbers.', value => {
            if (!value) return true;
            return ONLY_NUMBERS_REGEX.test(value);
        }).max(16, "Card Number must be at most 16 digits.").min(16, "Card Number must be at leaast 16 digits")

        .matches(/^(?=.*\S).+$/, "Card Number cannot contain whitespace")
        .test('no-emojis', 'Card Number cannot contain emojis.', value => {
            if (!value) return true;
            return !EMOJI_REGEX.test(value);
        }),
    envelopNumber: Yup.string()
        .required("Is required").max(30, "Envelope number must be at most 30 characters").min(4, "envelope number must be at least 4 characters")
        .matches(/^[a-zA-Z0-9]*$/, "Envelope number must contain only characters and numbers")
        .matches(/^(?=.*\S).+$/, "Envelope number cannot contain whitespace")
        .test('no-emojis', 'Envelope number cannot contain emojis.', value => {
            if (!value) return true;
            return !EMOJI_REGEX.test(value);
        })
        .test('no-html', 'Envelope Number cannot contain HTML tags.', value => {
            if (!value) return true;
            return !HTML_REGEX.test(value);
        })


});

export const QuickLinksWithoutEnvolop = Yup.object().shape({
    cardNumber: Yup.string()
        .required("Is required")
        .test('only numbers', 'Card number caontain only numbers.', value => {
            if (!value) return true;
            return ONLY_NUMBERS_REGEX.test(value);
        }).max(16, "Card Number must be at most 16 digits.").min(16, "Card Number must be at least 16 digits")

        .matches(/^(?=.*\S).+$/, "Card Number cannot contain whitespace")
        .test('no-emojis', 'Card Number cannot contain emojis.', value => {
            if (!value) return true;
            return !EMOJI_REGEX.test(value);
        }),
});

