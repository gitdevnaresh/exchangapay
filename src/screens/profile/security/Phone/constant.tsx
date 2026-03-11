import * as Yup from 'yup';
export const getFormattedPhoneNumber = (phone: string) => {
  if (!phone || typeof phone !== 'string' || phone.length < 7) {
    return phone || ''; // Return original phone or empty string if it's too short
  }
  const firstThree = phone.substring(0, 2);
  const lastFour = phone.substring(phone.length - 2);
  return `${firstThree}***${lastFour}`;
};


const ONLY_NUMBERS_REGEX = /^\d+$/;
export const PhoneNumberSchema = Yup.object().shape({
  phonenumber: Yup.string()
    .required("GLOBAL_CONSTANTS.IS_REQUIRED")
    .test('only numbers', "GLOBAL_CONSTANTS.INVALID_PHONE_NUMBER", value => {
      if (!value) return true;
      return ONLY_NUMBERS_REGEX.test(value);
    })
    .min(6, "GLOBAL_CONSTANTS.PHONE_NUMBER_AT_LEAST")
    .max(13, "GLOBAL_CONSTANTS.PHONE_NUMBER_MAX"),
  phonecode: Yup.string()
    .required("GLOBAL_CONSTANTS.IS_REQUIRED"),
});

