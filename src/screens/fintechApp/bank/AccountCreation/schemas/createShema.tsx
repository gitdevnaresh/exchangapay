import * as Yup from "yup";
const VALID_STATE_REGEX = /^[A-Za-z\s-]+$|^[A-Za-z\s-]+\d+$/;
const EMOJI_REGEX = /\p{Extended_Pictographic}/u;
const CONTAINS_NUMBER = /\d/;
const CONTAINS_LETTER = /[A-Za-z]/;
const CONTAINS_SPECIAL_CHAR = /[/\-,.#()&'"]/;
export const CreateAccSchema = Yup.object().shape({
  country: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED").nullable(),
  city: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED").max(50, "GLOBAL_CONSTANTS.CITY_MUST_BE_AT_MOST_50").matches(/^[a-zA-Z\s]*$/, "GLOBAL_CONSTANTS.ONLY_CHARACTERS_ARE_ALLOWED").nullable(),
  address: Yup.string()
    .required("GLOBAL_CONSTANTS.IS_REQUIRED")
    .test(
      'valid-address',
      "GLOBAL_CONSTANTS.INVALID_ADDRESS",
      (value) => {
        if (!value) return true;
        const VALID_STATE_REGEX = /^(?=.*[A-Za-z0-9]).+$/;
        return (
          VALID_STATE_REGEX.test(value.trim()) &&
          !EMOJI_REGEX.test(value) &&
          (
            CONTAINS_LETTER.test(value) ||
            (CONTAINS_NUMBER.test(value) && CONTAINS_SPECIAL_CHAR.test(value))
          )
        );
      }
    )
    .max(100, "GLOBAL_CONSTANTS.ADDRESS_SHOULD_BE_MAX_100"),
  postalCode: Yup.string().matches(/^\d+$/, "GLOBAL_CONSTANTS.INVALID_POSTAL_CODE").min(4, "GLOBAL_CONSTANTS.POSTAL_CODE_AT_LEAST").max(8, "GLOBAL_CONSTANTS.POSTAL_CODE_MAX").required("GLOBAL_CONSTANTS.IS_REQUIRED").nullable(),
  idNumber: Yup.string().min(5, "GLOBAL_CONSTANTS.PASSPORT_NUMBER_MUST_BE_AT_LEAST5").max(15, "GLOBAL_CONSTANTS.MUST_BE_AT_MOST_15_CHARACTERS").required("GLOBAL_CONSTANTS.IS_REQUIRED").matches(/^[a-zA-Z0-9]*$/, "GLOBAL_CONSTANTS.ONLY_CHARACTERS_AND_NUMBER_ARE").nullable(),
  dateOfBirth: Yup.date().nullable().required("GLOBAL_CONSTANTS.IS_REQUIRED")
    .test('is-18-years-old', "GLOBAL_CONSTANTS.AT_LEAST_18_YEARS", function (value) {
      if (!value) return false;
      const today = new Date();
      const birthDate = new Date(value);

      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age >= 18;
    }),
  state: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED").nullable(),
  addressType: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED").nullable(),
  bank: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED").nullable(),
});

export const BussinessCreateSchema = Yup.object().shape({
  country: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED").nullable(),
  city: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED").max(100, "GLOBAL_CONSTANTS.MUST_BE_AT_MOST_100").matches(/^[a-zA-Z\s]*$/, "GLOBAL_CONSTANTS.ONLY_CHARACTERS_ARE_ALLOWED").nullable(),
  address: Yup.string()
    .required("GLOBAL_CONSTANTS.IS_REQUIRED")
    .test(
      'valid-Address',
      "GLOBAL_CONSTANTS.INVALID_ADDRESS",
      (value) => {
        if (!value) return true;
        return VALID_STATE_REGEX.test(value.trim());
      }
    )
    .max(100, "GLOBAL_CONSTANTS.ADDRESS_SHOULD_BE_MAX_100"),
  postalCode: Yup.string().matches(/^\d+$/, "GLOBAL_CONSTANTS.INVALID_POSTAL_CODE").min(4, "GLOBAL_CONSTANTS.POSTAL_CODE_AT_LEAST").max(8, "GLOBAL_CONSTANTS.POSTAL_CODE_MAX").required("GLOBAL_CONSTANTS.IS_REQUIRED").nullable(),
  idNumber: Yup.string().min(5, "GLOBAL_CONSTANTS.PASSPORT_NUMBER_MUST_BE_AT_LEAST5").max(15, "GLOBAL_CONSTANTS.MUST_BE_AT_MOST_15_CHARACTERS").required("GLOBAL_CONSTANTS.IS_REQUIRED").matches(/^[a-zA-Z0-9]*$/, "GLOBAL_CONSTANTS.ONLY_CHARACTERS_AND_NUMBER_ARE").nullable(),
  entityType: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED").nullable(),
  dateOfBirth: Yup.date().nullable().required("GLOBAL_CONSTANTS.IS_REQUIRED")
    .test('is-18-years-old', "GLOBAL_CONSTANTS.AT_LEAST_18_YEARS", function (value) {
      if (!value) return false;
      const today = new Date();
      const birthDate = new Date(value);

      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age >= 18;
    }),
  state: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED").nullable(),
  addressType: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED").nullable(),
});

export const CreateAccountSchema = Yup.object().shape({
  currency: Yup.string()
    .required("GLOBAL_CONSTANTS.IS_REQUIRED")
    .test('not-empty', "GLOBAL_CONSTANTS.IS_REQUIRED", value => !!value && value.trim() !== ''),
});

export const PayWithWalletCryptoSchema = Yup.object().shape({
  vault: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED").nullable(),
  coin: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED").nullable(),
  network: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED").nullable(),
});