import * as types from "./ActionsTypes";

export const isLogin = (payload) => {
  return {
    type: types.IS_LOGIN,
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
export const EnableSandBox = (payload) => {
  return async (dispatch) => {
    dispatch({ type: types.ENABLE_SANDBOX, payload: payload });
  };
};
export const setNotificationCount = (payload) => {
  return async (dispatch) => {
    dispatch({ type: types.NOTIFICATION_COUNT, payload: payload || 0 });
  };
};
export const logout = () => {
  return {
    type: types.LOGOUT,
  };
};
export const isMFAVerified = (payload) => {
  return {
    type: types.IS_MFA_COMPLETED,
    payload,
  };

};
export const isCardKycCompleted = (payload) => {
  return {
    type: types.IS_CARD_KYC_COMPLETED,
    payload,
  }
};
export const updateChatCount = (payload) => {
  return {
    type: types.UPDATE_MESSAGE_COUNT,
    payload,
  }
};
export const isSessionExpired = (payload) => {
  return {
    type: types.IS_SESSION_EXPIRED,
    payload,
  }
};
export const isSetIpInfo = (payload) => {
  return {
    type: types.IS_SET_IP_INFO,
    payload,
  }
};
