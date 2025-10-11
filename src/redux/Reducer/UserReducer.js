import * as types from "../Actions/ActionsTypes";

const initialState = {
  login: false,
  userDetails: "",
  userInfo: "",
  personalInfo: "",
  isEnableSandBox: false,
  notificationCount: 0,
  isMFACompleted: false,
  isCardKycComplete: false,
  supportMessgaeCount: 0,
  isSessionExpired: false,
  ipInfo: null,
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
        userDetails: action.payload
          ? JSON.parse(JSON.stringify(action.payload))
          : action.payload,
      };
    }
    case types.USER_INFO: {
      return {
        ...state,
        userInfo: action.payload
          ? JSON.parse(JSON.stringify(action.payload))
          : action.payload,
      };
    }
    case types.PERSONAL_INFO: {
      return {
        ...state,
        personalInfo: action.payload,
      };
    }
    case types.ENABLE_SANDBOX: {
      return {
        ...state,
        isEnableSandBox: action.payload,
      };
    }
    case types.NOTIFICATION_COUNT: {
      return {
        ...state,
        notificationCount: action.payload || 0,
      };
    }
    case types.LOGOUT:
      return {
        ...initialState,
      };
    case types.IS_MFA_COMPLETED:
      return {
        ...state,
        isMFACompleted: action.payload,
      };
    case types.IS_CARD_KYC_COMPLETED:
      return {
        ...state,
        isCardKycComplete: action.payload,
      };
    case types.UPDATE_MESSAGE_COUNT:
      return {
        ...state,
        supportMessgaeCount: action.payload,
      };
    case types.IS_SESSION_EXPIRED:
      return {
        ...state,
        isSessionExpired: action.payload,
      };
    case types.IS_SET_IP_INFO:
      return {
        ...state,
        ipInfo: action.payload,
      };
    default:
      return state;
  }
};
