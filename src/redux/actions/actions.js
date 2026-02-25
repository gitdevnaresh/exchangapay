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
  export const setMenuItems = (payload) => {
  return async (dispatch) => {
    dispatch({ type: types.MENU_ITEMS, payload: payload });
  };
};
  export const setScreenPermissions = (payload) => {
  return async (dispatch) => {
    dispatch({ type: types.SCREEN_PERMISSIONS, payload: payload });
  };
};
 export const setDeleteScreenPermissions = (payload) => {
  return async (dispatch) => {
    dispatch({ type: types.DELETE_SCREEN_PERMISSIONS, payload: payload });
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
export const setShowBiometricPrompt = (payload) => {
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
export const setCardHolderStatusId = (payload) => {
  return {
    type: types.CARD_HOLDER_STATUS_ID,
    payload: payload,
  };
}


export const setUboFormData = (payload) => {
  return {
    type: types.UBO_FORM_DATA,
    payload: payload,
  };
}
export const setSessionExpired = (payload) => {
  return {
    type: types.SET_SESSION_EXPIRED,
    payload: payload,
  };
}
export const setKybApplyCardData = (payload) => {
  return {
    type: types.KYB_APPLY_CARD_DATA,
    payload: payload,
  };
}
export const setWalletsDashboard = (payload) => {
  return {
    type: types.SET_WALLETS_DASHBOARD,
    payload: payload,
  };
}

export const clearWalletsDashboard = () => {
  // Dispatching SET_WALLETS_DASHBOARD with a null payload will instruct the reducer to clear
  return {
    type: types.SET_WALLETS_DASHBOARD,
    payload: null,
  };
}

export const setExchangeDashboard = (payload) => {
  return {
    type: types.SET_EXCHANGE_DASHBOARD,
    payload: payload,
  };
}

export const clearExchangeDashboard = () => {
  return {
    type: types.SET_EXCHANGE_DASHBOARD,
    payload: null,
  };
}
export const setAllBalanceInfo = (payload) => {
  return {
    type: types.SET_ALL_BALANCE_INFO,
    payload: payload,
  };
};

export const setHomeDashboardCards = (payload) => {
  return {
    type: types.SET_HOME_DASHBOARD_CARDS,
    payload: payload,
  };
};

export const setHomeWallets = (payload) => {
  return {
    type: types.SET_HOME_WALLETS,
    payload: payload,
  };
};
export const setBankDashboardDetails = (payload) => {
  return async (dispatch) => {
    dispatch({ 
      type: types.SET_BANK_DASHBOARD, 
      payload: { 
        createAccDetails: payload.createAccDetails || [], 
        totalBalance: payload.totalBalance || "" 
      } 
    });
  };
};

export const setCardsDashboard = (payload) => {
  return {
    type: types.SET_CARDS_DASHBOARD,
    payload: payload,
  }
}
export const setPaymentsDashboard = (payload) => {
  return {
    type: types.SET_PAYMENTS_DASHBOARD,
    payload: payload,
  };
};

export const setNavigationSource = (payload) => {
  return {
    type: types.SET_NAVIGATION_SOURCE,
    payload: payload,
  };
};

export const setWalletActionFilter = (payload) => {
  return {
    type: types.SET_WALLET_ACTION_FILTER,
    payload: payload,
  };
};

export const clearCardsDashboard = () => {
  return {
    type: types.SET_CARDS_DASHBOARD,
    payload: null,
  };
};

export const setNotificationShown = (payload) => {
  return {
    type: types.SET_NOTIFICATION_SHOWN,
    payload: payload,
  };
};

export const setAppUpdateVisible = (payload) => {
  return {
    type: types.SET_APP_UPDATE_VISIBLE,
    payload: payload,
  };
};

// DEV: Notices System - Action creators for managing app-wide notifications
// Purpose: Control when notices are displayed and track user acknowledgment
export const setShouldShowNotices = (payload) => {
  return {
    type: types.SET_SHOULD_SHOW_NOTICES,
    payload: payload,
  };
};

// DEV: Notices System - Track if notices were shown in current app session
export const setNoticesShownThisSession = (payload) => {
  return {
    type: types.SET_NOTICES_SHOWN_THIS_SESSION,
    payload: payload,
  };
};

export const setUserProfileDetails = (payload) => {
  return {
    type: types.SET_USER_PROFILE_DETAILS,
    payload: payload,
  };
};

const initialState = {
  menuItems: [],
  notificationShown: false,
  // ... other fields
};


export default function userReducer(state = initialState, action) {
  switch (action.type) {
    case types.MENU_ITEMS:
      return {
        ...state,
        menuItems: action.payload,
      };
    case types.SET_WALLETS_DASHBOARD:
      // If payload is null, treat this as a clear/reset of the walletsDashboard
      if (action.payload == null) {
        return {
          ...state,
          walletsDashboard: {
            balance: [],
            cryptoAssets: { assets: [], defaultVault: {} },
            fiatAssets: []
          }
        };
      }
      // Otherwise merge provided fields into the walletsDashboard object
      return {
        ...state,
        walletsDashboard: {
          ...state.walletsDashboard,
          ...action.payload
        }
      };
    // Remove or keep CLEAR_WALLETS_DASHBOARD case safely — keep for compatibility but delegate to SET behaviour
    case types.CLEAR_WALLETS_DASHBOARD:
      return {
        ...state,
        walletsDashboard: {
          balance: [],
          cryptoAssets: { assets: [], defaultVault: {} },
          fiatAssets: []
        }
      };
    case 'SET_NOTIFICATION_SHOWN':
      return {
        ...state,
        notificationShown: action.payload,
      };
    case types.LOGOUT:
      return {
        ...initialState,
      };
    default:
      return state;
  }
}