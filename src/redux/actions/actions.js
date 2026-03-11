import { IS_LOGIN, SET_WALLET_LIST } from "../actionTypes/actionsType";
import * as types from "../actionTypes/actionsType";
export const setLogin = (loginData) => ({
  type: IS_LOGIN,
  payload: loginData
});



export const setUserWallatesList = (data) => (
  {
    type: SET_WALLET_LIST,
    payload: data
  }
);

export const isLogin = (payload) => {
  return {
    type: types.IS_LOGIN,
    payload,
  };
};
export const isCustodial = (payload) => {
  return {
    type: types.ISCUSTODIAL,
    payload,
  };
};
export const loginAction = (payload) => {
  return async (dispatch) => {
    dispatch({ type: types.USER_DETAILS, payload: payload });
  };
};

export const setUserInfo = (payload) => {
  return async (dispatch) => {
    dispatch({ type: types.USER_INFO, payload: payload });
  };
};
export const setPersonalInfo = (payload) => {
  return async (dispatch) => {
    dispatch({ type: types.PERSONAL_INFO, payload: payload });
  };
};
export const logout = () => {
  return {
    type: types.LOGOUT,
  };
};
export const setAccountInfo = (payload) => {
  return async (dispatch) => {
    dispatch({ type: types.ACCOUNT_INFO, payload: payload });
  };
}
export const setScreenInfo = (payload) => {
  return async (dispatch) => {
    dispatch({ type: types.SCREEN_NAME, payload: payload });
  };
}
export const getAllCards = (payload) => {
  return async (dispatch) => {
    dispatch({ type: types.ALL_CARDS_LIST, payload: payload });
  };
};

export const isOnboardingStepsUpdated = (payload) => {
  return {
    type: types.IS_ONBOARDING_STEPS,
    payload,
  };
}
export const showBiometricPrompt = (payload) => {
  return {
    type: types.SHOWBIOMETRICPROMT,
    payload,
  };
}
export const setAppTheme = (payload) => {
  return {
    type: types.APP_THEME,
    payload: payload,
  };
}
export const setCartCount = (payload) => {
  return {
    type: types.CART_COUNT,
    payload: payload,
  };
}
export const setReferralCode = (payload) => {
  return {
    type: types.REFERRAL_CODE,
    payload: payload,
  };
}

export const setApplyCardData = (payload) => {
  return {
    type: types.APPLY_CARD_DATA,
    payload: payload,
  };
}
export const setApplyCardDataField = (payload) => {
  return {
    type: types.SET_APPLY_CARD_DATA_FIELD,
    payload: payload,
  };
}
export const setSignupInfo = (payload) => {
  return {
    type: types.SIGNUP_INFO,
    payload: payload,
  };
}

export const setSecurityLevelInfo = (details) => ({
  type: types.SET_SECURITY_LEVEL_INFO,
  payload: details,
});

export const setFeildOne = (payload) => {
  return {
    type: types.SET_FEILD_ONE,
    payload,
  };
};

export const setFeildTwo = (payload) => {
  return {
    type: types.SET_FEILD_TWO,
    payload,
  };
};

export const setStoredValues = (payload) => {
  // payload should be: { fieldOne: string, fieldTwo: string }
  return {
    type: types.SET_STORED_VALUES,
    payload,
  };
};


export const setAutoLockTime = (time) => ({
  type: types.SET_AUTO_LOCK_TIME,
  payload: time,
});

export const setBiometricEnabled = (enabled) => ({
  type: types.SET_BIOMETRIC_ENABLED,
  payload: enabled,
});

export const setPatternsEnabled = (enabled) => ({
  type: types.SET_PATTERN_ENABLED,
  payload: enabled,
});

export const setPattern = (pattern) => ({
  type: types.SET_PATTERN,
  payload: pattern
});

export const clearPattern = () => ({
  type: types.CLEAR_PATTERN
});
export const applyCardTerms = (payload) => {
  return {
    type: types.SET_APPLY_CARD_TERMS,
    payload,
  };
};