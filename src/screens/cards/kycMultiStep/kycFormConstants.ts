import * as Yup from 'yup';

// Screen configuration for Getting Started form
export const GETTING_STARTED_SCREENS = {
  SCREEN_1: 'screen1',
  SCREEN_2: 'screen2',
  SCREEN_3: 'screen3',
};

// Screen order for navigation
export const SCREEN_ORDER = [
  GETTING_STARTED_SCREENS.SCREEN_1,
  GETTING_STARTED_SCREENS.SCREEN_2,
  GETTING_STARTED_SCREENS.SCREEN_3,
];

// Screen titles
export const SCREEN_TITLES = {
  [GETTING_STARTED_SCREENS.SCREEN_1]: 'GLOBAL_CONSTANTS.GETTING_STARTED',
  [GETTING_STARTED_SCREENS.SCREEN_2]: 'GLOBAL_CONSTANTS.GETTING_STARTED',
  [GETTING_STARTED_SCREENS.SCREEN_3]: 'GLOBAL_CONSTANTS.GETTING_STARTED',
};

// Initial form values - EXACT FIELDS FROM DESIGN
export const INITIAL_FORM_VALUES = {
  // Screen 1: Personal & Address Information
  firstName: '',
  lastName: '',
  addressLine1: '',
  addressLine2: '',
  country: '',
  state: '',
  city: '',
  pincode: '',
  dob: null,
  
  // Screen 2: Contact Information
  phoneCode: '',
  phoneNumber: '',
  email: '',
  
  // Screen 3: Financial Information
  employmentStatus: '',
  occupation: '',
  annualSalary: '',
  estimatedMonthlyValue: '',
};

// Validation schemas for each screen
export const getValidationSchema = (screenName: string) => {
  switch (screenName) {
    case GETTING_STARTED_SCREENS.SCREEN_1:
      return Yup.object().shape({
        firstName: Yup.string()
          .required('')
          .matches(/^[a-zA-Z\s]+$/, 'GLOBAL_CONSTANTS.ONLY_CHARACTERS_ARE_ALLOWED')
          .min(2, 'GLOBAL_CONSTANTS.INVALID_FIRST_NAME')
          .max(50, 'GLOBAL_CONSTANTS.FIRST_NAME_MUST_50CHARACTER')
          .test('no-emoji', 'GLOBAL_CONSTANTS.INVALID_FIRST_NAME', (value) => {
            if (!value) return true;
            const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
            return !emojiRegex.test(value);
          }),
        lastName: Yup.string()
          .required('')
          .matches(/^[a-zA-Z\s]+$/, 'GLOBAL_CONSTANTS.ONLY_CHARACTERS_ARE_ALLOWED')
          .min(2, 'GLOBAL_CONSTANTS.INVALID_LAST_NAME')
          .max(50, 'GLOBAL_CONSTANTS.LAST_NAME_MUST_50CHARACTER')
          .test('no-emoji', 'GLOBAL_CONSTANTS.INVALID_LAST_NAME', (value) => {
            if (!value) return true;
            const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
            return !emojiRegex.test(value);
          }),
        addressLine1: Yup.string()
          .required('')
          .min(3, 'GLOBAL_CONSTANTS.INVALID_ADDRESS_LINE1')
          .max(100, 'GLOBAL_CONSTANTS.ADDRESS_LINE1_MAX'),
        addressLine2: Yup.string()
          .max(100, 'GLOBAL_CONSTANTS.ADDRESS_LINE2_MAX'),
        country: Yup.string()
          .required(''),
        state: Yup.string()
          .required('')
          .matches(/^[a-zA-Z\s]+$/, 'GLOBAL_CONSTANTS.ONLY_CHARACTERS_ARE_ALLOWED')
          .max(50, 'GLOBAL_CONSTANTS.STATE_MUST_BE_AT_MOST_50'),
        city: Yup.string()
          .required('')
          .matches(/^[a-zA-Z\s]+$/, 'GLOBAL_CONSTANTS.ONLY_CHARACTERS_ARE_ALLOWED')
          .max(50, 'GLOBAL_CONSTANTS.CITY_MUST_BE_AT_MOST_50'),
        pincode: Yup.string()
          .required('')
          .matches(/^[0-9]+$/, 'GLOBAL_CONSTANTS.INVALID_POSTAL_CODE')
          .min(3, 'GLOBAL_CONSTANTS.POSTAL_CODE_AT_LEAST')
          .max(10, 'GLOBAL_CONSTANTS.POSTAL_CODE_MAX'),
        dob: Yup.date()
          .nullable()
          .required('')
          .max(new Date(new Date().getFullYear() - 18, new Date().getMonth(), new Date().getDate()), 'GLOBAL_CONSTANTS.AT_LEAST_18_YEARS')
          .typeError('GLOBAL_CONSTANTS.INVALID_DOB'),
      });

    case GETTING_STARTED_SCREENS.SCREEN_2:
      return Yup.object().shape({
        phoneCode: Yup.string()
          .required(''),
        phoneNumber: Yup.string()
          .required('')
          .matches(/^[0-9]+$/, 'GLOBAL_CONSTANTS.INVALID_PHONE_NUMBER')
          .min(6, 'GLOBAL_CONSTANTS.PHONE_NUMBER_AT_LEAST')
          .max(15, 'GLOBAL_CONSTANTS.PHONE_NUMBER_MAX'),
        email: Yup.string()
          .required('')
          .email('GLOBAL_CONSTANTS.INVALID_EMAIL')
          .max(50, 'GLOBAL_CONSTANTS.MAXIMUM_50_CHARACTERS_ALLOWED'),
      });

    case GETTING_STARTED_SCREENS.SCREEN_3:
      return Yup.object().shape({
        employmentStatus: Yup.string()
          .required('')
          .max(50, 'GLOBAL_CONSTANTS.INVALID_ACCOUNT_PURPOSE'),
        occupation: Yup.string()
          .required(''),
        annualSalary: Yup.string()
          .required('')
          .test('not-all-zeros', 'GLOBAL_CONSTANTS.INVALID_ANNUAL_SALARY', (value) => {
            if (!value) return false;
            return parseFloat(value) > 0;
          }),
        estimatedMonthlyValue: Yup.string()
          .required('')
          .test('not-all-zeros', 'GLOBAL_CONSTANTS.INVALID_ESTIMATED_MONTHLY_VALUE', (value) => {
            if (!value) return false;
            return parseFloat(value) > 0;
          }),
          accountPurpose: Yup.string()
          .required('')
          .test('no-emoji', 'GLOBAL_CONSTANTS.INVALID_ACCOUNT_PURPOSE', (value) => {
            if (!value) return true;
            const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
            return !emojiRegex.test(value);
          })
      });

    default:
      return Yup.object().shape({});
  }
};
