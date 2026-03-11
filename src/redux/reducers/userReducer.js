import { ref } from "yup";
import * as types from "../actionTypes/actionsType";


const initialState = {
  login: false,
  userDetails: null,
  signupInfo: {
    email: "",
    referralCode: "",
    guid: ""
  },
  userInfo: "",
  personalInfo: "",
  accountInfo: "",
  screenName: "",
  isCustodial: "",
  usersWalletsList: [],
  allCards: [],
  isOnboardingSteps: false,
  appTheme: "dark",
  cartCount: '',
  referralCode: "",
  showBiometricPrompt: true,
  applyCardData: {},
  securityLevelInfo: {},
  autoLockTime: 5,
  isBiometricEnabled: false,
  isPatternEnabled: false,
  pattern: null,
  storeValues: {
    feildOne: '',
    feildTwo: '',
  },
  applyCardTerms: {

  }
};

export default (state = initialState, action) => {
  switch (action.type) {
    case types.IS_LOGIN:
      return {
        ...state,
        login: action.payload,
      };

    case types.USER_DETAILS: {
      return {
        ...state,
        userDetails: action.payload,
      };
    }
    case types.USER_INFO: {
      return {
        ...state,
        userInfo: action.payload,
      };
    }
    case types.PERSONAL_INFO: {
      return {
        ...state,
        personalInfo: action.payload,
      };
    }
    case types.ACCOUNT_INFO: {
      return {
        ...state,
        accountInfo: action.payload,
      };
    }
    case types.SCREEN_NAME: {
      return {
        ...state,
        screenName: action.payload,
      };
    }
    case types.ISCUSTODIAL: {
      return {
        ...state,
        isCustodial: action.payload,
      };
    }
    case types.IS_ONBOARDING_STEPS:
      return {
        ...state,
        isOnboardingSteps: action.payload,
      };
    case types.SHOWBIOMETRICPROMT:
      return {
        ...state,
        showBiometricPrompt: action.payload,
      };
    case types.LOGOUT:
      return {
        initialState,
      };
    case types.ALL_CARDS_LIST:
      return {
        ...state, allCards: action.payload

      };
    case types.APP_THEME:
      return {
        ...state, appTheme: action.payload

      };
    case types.CART_COUNT:
      return {
        ...state, cartCount: action.payload

      };
    case types.REFERRAL_CODE:
      return {
        ...state, referralCode: action.payload

      };
    case types.APPLY_CARD_DATA:
      return {
        ...state, applyCardData: action.payload

      };
    case types.SET_APPLY_CARD_DATA_FIELD:
      return {
        ...state, 
        applyCardData: {
          ...state.applyCardData,
          ...action.payload
        }
      };
    case types.SIGNUP_INFO:
      return {
        ...state, signupInfo: action.payload

      };
    case types.SET_SECURITY_LEVEL_INFO:
      return {
        ...state, securityLevelInfo: action.payload
      };
    case types.SET_FEILD_ONE: {
      return {
        ...state,
        storeValues: {
          ...state.storeValues,
          feildOne: action.payload,
        },
      };
    }
    case types.SET_FEILD_TWO: {
      return {
        ...state,
        storeValues: {
          ...state.storeValues,
          feildTwo: action.payload,
        },
      };
    }
    case types.SET_AUTO_LOCK_TIME:
      return { ...state, autoLockTime: action.payload };
    case types.SET_BIOMETRIC_ENABLED:
      return { ...state, isBiometricEnabled: action.payload };
    case types.SET_PATTERN_ENABLED:
      return { ...state, isPatternEnabled: action.payload };
    case types.SET_PATTERN:
      return { ...state, pattern: action.payload };
    case types.CLEAR_PATTERN:
      return { ...state, pattern: null };
    case types.SET_STORED_VALUES: {
      return {
        ...state,
        storeValues: {
          feildOne: action.payload.fieldOne,
          feildTwo: action.payload.fieldTwo,
        },
      };
    }
    case types.SET_APPLY_CARD_TERMS: {
      return {
        ...state,
        applyCardTerms: action.payload,
      };
    }
    default:
      return state;
  }
};
