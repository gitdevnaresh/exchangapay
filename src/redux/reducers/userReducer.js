import * as types from "../actionTypes/actionsType";

// Helper function to serialize data (convert Date objects to strings)
const serializeData = (data) => {
  if (data === null || data === undefined) return data;
  if (Array.isArray(data)) {
    return data.map(item => serializeData(item));
  }
  if (typeof data === 'object' && data instanceof Date) {
    return data.toISOString();
  }
  if (typeof data === 'object') {
    const serialized = {};
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        serialized[key] = serializeData(data[key]);
      }
    }
    return serialized;
  }
  return data;
};


const initialState = {
  login: false,
  userDetails: null,
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
  menuItems: [],
  screenPermissions: {},
  identityDocuments: [],
  selectedCurrency: null,
  selectedBank: null,
  selectedAddresses: [],
  ipAddress: '',
  personalDob: null,
  uboFormData: null,
  uboFormDataList: [],
  directorFormData: null,
  directorFormDataList: [],
  representativeFormDataList:[],
  documentsData: null,
  deletedApiItems: [],
  isReapply: false,
  sectors: '',
  types: '',
  hasAccountCreationFee: null,
  isSessionExpired: false,
  uboCardFormData: [],
  directorCardFormData: [],
  documentsCardsData:null,
  kybApplyCardData: {},
  acceptedTerms: {},
  cardId: null,
  allBalanceInfo: 0,
  homeDashboardCards: { myCards: [] },
  homeWallets: [],
  navigationSource: "", // Track where user navigated from
    // Wallets Dashboard Reducer - Single Object
  walletsDashboard: {
    balance: [],
    cryptoAssets: { assets: [], defaultVault: {} },
    fiatAssets: []
  },
  // Exchange Dashboard Reducer - Single Object
  exchangeDashboard: {
    balance: [],
    cryptoAssets: { assets: [] },
    fiatAssets: []
  },
  bankDashboardDetails: { createAccDetails: [], totalBalance: "" },
  // Cards Dashboard Reducer - Single Object
  cardsDashboard: {
    balance: {},
    cards: []
  },
  paymentsDashboardData: { recentPaymentLinksData: [], payoutBalance: {}, cryptoData: {}, kpiData: [] },
  walletActionFilter: null, // 'deposit', 'withdraw', or null
  notificationShown: false,
  appUpdateVisible: false,
  setUserProfileDetails:{},
  // DEV: Notices System - Displays important app-wide notifications to users
  // Purpose: Show critical announcements, updates, or alerts that users must acknowledge
  // Behavior: Shows once per app session, resets on logout/login or app restart
  shouldShowNotices: true, // Controls if notices should be displayed
  noticesShownThisSession: false, // Tracks if notices were already shown in current app session
  kycFormData: null
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
        ...initialState,
        noticesShownThisSession: false,
      };
    case types.ALL_CARDS_LIST:
      return {
        ...state, allCards: action.payload

      };
    case types.SET_SESSION_EXPIRED:
      return {
        ...state,
        isSessionExpired: action.payload,
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
    case types.CARD_HOLDER_STATUS_ID:
      return {
        ...state, cardHolderStatusId: action.payload

      };
    case types.MENU_ITEMS:
      return {
        ...state,
        menuItems: action.payload,
      };
    case types.SCREEN_PERMISSIONS:
      return {
        ...state,
        screenPermissions: {
          ...state.screenPermissions,
          ...action.payload,
        }
      };
       case types.DELETE_SCREEN_PERMISSIONS:
      return {
        ...state,
        screenPermissions: {}
      };
    case "SET_IDENTITY_DOCUMENTS":
      return {
        ...state,
        identityDocuments: action.payload,
      };
    case "SET_SELECTED_CURRENCY":
      return {
        ...state,
        selectedCurrency: action.payload,
      };
    case "SET_SELECTED_BANK":
      return {
        ...state,
        selectedBank: action.payload,
      };
    case "SET_SELECTED_ADDRESSES":
      return {
        ...state,
        selectedAddresses: action.payload,
      };

       case "SET_CARDS_SELECTED_ADDRESSES":
      return {
        ...state,
        selectedCardsAddresses: action.payload,
      };
    case "SET_IP_ADDRESS":
      return {
        ...state,
        ipAddress: action.payload,
      };
    case "SET_PERSONAL_DOB":
      return {
        ...state,
        personalDob: action.payload,
      };
    case "SET_DOCUMENTS_DATA":
      return {
        ...state,
        documentsData: serializeData(action.payload),
      };

       case "SET_CARDS_DOCUMENTS_DATA":
      return {
        ...state,
        documentsCardsData: serializeData(action.payload),
      };
    case "SET_UBO_FORM_DATA":
      return {
        ...state,
        uboFormDataList: serializeData(action.payload),
      };
    case "SET_CARD_UBO_FORM_DATA":
      return {
        ...state,
        uboCardFormData: serializeData(action.payload),
      };
    case "SET_DIRECTOR_FORM_DATA":
      return {
        ...state,
        directorFormDataList: serializeData(action.payload),
      };
    case "SET_CARDS_DIRECTOR_FORM_DATA":
      return {
        ...state,
        directorCardFormData: serializeData(action.payload),
      };
    case "SET_CARDS_REPRESENTATIVE_FORM_DATA":
      return {
        ...state,
        representativeFormDataList: serializeData(action.payload)
      };  
    case "SET_DELETED_API_ITEMS":
      return {
        ...state,
        deletedApiItems: action.payload,
      };
       case "SET_CARDS_DELETED_API_ITEMS":
      return {
        ...state,
        deletedCardsApiItems: action.payload,
      };
    case "SET_IS_REAPPLY":
      return {
        ...state,
        isReapply: action.payload,
      };
    case "SET_SECTORS":
      return {
        ...state,
        sectors: action.payload,
      };

       case "SET_CARDS_SECTORS":
      return {
        ...state,
        cardsSectors: action.payload,
      };
    case "SET_TYPES":
      return {
        ...state,
        types: action.payload,
      };
      case types.KYB_APPLY_CARD_DATA:
      return {
        ...state, kybApplyCardData: action.payload

      };
    case types.ACCEPTED_TERMS:
      return {
        ...state, acceptedTerms: action.payload

      };
    case types.SET_CARD_ID:
      return {
        ...state,
        cardId: action.payload
      };
    case types.SET_ALL_BALANCE_INFO:
      return {
        ...state,
        allBalanceInfo: action.payload,
      };

    case types.SET_HOME_DASHBOARD_CARDS:
      return {
        ...state,
        homeDashboardCards: action.payload,
      };

    case types.SET_HOME_WALLETS:
      return {
        ...state,
        homeWallets: action.payload,
      };

         case "SET_CARDS_TYPES":
      return {
        ...state,
        cardTypes: action.payload,
      };
    case "SET_HAS_ACCOUNT_CREATION_FEE":
      return {
        ...state,
        hasAccountCreationFee: action.payload,
      };
    case types.SET_WALLETS_DASHBOARD:
      // If payload is null, clear the walletsDashboard
      if (action.payload === null) {
        return {
          ...state,
          walletsDashboard: {
            balance: [],
            cryptoAssets: { assets: [], defaultVault: {} },
            fiatAssets: []
          }
        };
      }
      // Otherwise merge the payload
      return {
        ...state,
        walletsDashboard: {
          ...state.walletsDashboard,
          ...action.payload
        }
      };
    case types.CLEAR_WALLETS_DASHBOARD:
      return {
        ...state,
        walletsDashboard: {
          balance: [],
          cryptoAssets: { assets: [], defaultVault: {} },
          fiatAssets: []
        }
      };
    case types.SET_EXCHANGE_DASHBOARD:
      // If payload is null, clear the exchangeDashboard
      if (action.payload === null) {
        return {
          ...state,
          exchangeDashboard: {
            balance: [],
            cryptoAssets: { assets: [] },
            fiatAssets: []
          }
        };
      }
      // Otherwise merge the payload
      return {
        ...state,
        exchangeDashboard: {
          ...state.exchangeDashboard,
          ...action.payload
        }
      }
    case types.SET_BANK_DASHBOARD:
      return {
        ...state,
        bankDashboardDetails: action.payload
      };
       case types.SET_CARDS_DASHBOARD:
      // If payload is null, clear the cardsDashboard
      if (action.payload === null) {
        return {
          ...state,
          cardsDashboard: {
            balance: {},
            cards: []
          }
        };
      }
      // Otherwise merge the payload
      return {
        ...state,
        cardsDashboard: {
          ...state.cardsDashboard,
          ...action.payload
        }
      }
      case types.SET_PAYMENTS_DASHBOARD:
      return {
        ...state,
        paymentsDashboardData: {
          ...state.paymentsDashboardData,
          ...action.payload
        }
      };
    case types.SET_NAVIGATION_SOURCE:
      return {
        ...state,
        navigationSource: action.payload,
      };
    case types.SET_WALLET_ACTION_FILTER:
      return {
        ...state,
        walletActionFilter: action.payload,
      };
       case types.SET_USER_PROFILE_DETAILS:
            return {
              ...state,
              userProfileDetails: action.payload,
            };
    case types.UBO_FORM_DATA: {
      const serializedPayload = serializeData(action.payload);
      const payload = Array.isArray(serializedPayload) ? serializedPayload : [serializedPayload];
      // Separate UBO and Director data
      const uboData = payload.filter(item => item.uboPosition !== 'Director');
      const directorData = payload.filter(item => item.uboPosition === 'Director');
      const uboCardFormData = payload.filter(item => item.uboPosition !== 'Director');
      const directorCardFormData = payload.filter(item => item.uboPosition === 'Director');
      const representativeFormData = payload.filter(item => item.uboPosition === 'Representative');


      return {
        ...state,
        uboFormDataList: uboData,
        directorFormDataList: directorData,
        uboFormData: serializedPayload,
        uboCardFormData: uboCardFormData,
        directorCardFormData: directorCardFormData,
        representativeFormDataList: representativeFormData
      };
    }
    case types.SET_NOTIFICATION_SHOWN:
      return {
        ...state,
        notificationShown: action.payload,
      };
    case types.SET_APP_UPDATE_VISIBLE:
      return {
        ...state,
        appUpdateVisible: action.payload,
      };
    // DEV: Notices System - Reset notices state on logout to show fresh notices on next login
    case types.SET_SHOULD_SHOW_NOTICES:
      return {
        ...state,
        shouldShowNotices: action.payload,
      };
    // DEV: Notices System - Track if notices were shown in current app session to prevent re-showing
    case types.SET_NOTICES_SHOWN_THIS_SESSION:
      return {
        ...state,
        noticesShownThisSession: action.payload,
      };
    case "SET_KYC_FORM_DATA":
      return {
        ...state,
        kycFormData: action.payload,
      };

    default:
      return state;
  }
};
