export const CONSTANTS = {
  HARDWARE_BACK_PRESS: "hardwareBackPress",
  ARROW_LEFT: "arrowleft",
  NO_NOTIFICATION_AVAILABLE: "No Notification Available",
  NOTIFICATIONS: 'Notifications',
  NOTICES: "Notices",
  TOPUP: "topup",
  WITHDRAW: "withdraw",
  APPLY: "apply",
  ACCOUNT: "account",
  ONLINE_PAYMENT: "online payment",
  CLOSE: "close",
  DOCUMENT_TEXT_OUTLINE: "document-text-outline",
  NOTICE: "Notice"

};

export interface NotificationDetails {
  actionBy: string,
  customerId: string,
  id: string,
  message: string,
  notificationType: string | null,
  notifiedDate: string
};

export const DRAWER_CONSTATNTS = {
  HARDWARE_BACK_PRESS: "hardwareBackPress",
  SPLASH_SCREEN: "SplashScreen",
  ADD_KYC_INFORMATION: "addKycInfomation",
  APPROVED: "Approved",
  DASHBOARD: 'Dashboard',
  HOME: "Home",
  PERSONAL_INFo_VIEW: "PersonalInfoView",
  SECURITY: "Security",
  PERSONAL_INFO: "PersonalInfo",
  HELP_CENTER: "HelpCenter",
  ARROW_LEFT: "arrowleft",
  PROFILE: "Profile",
  LARGE: "large",
  COVER: "cover",
  SECURITY_CENTER: "Security Center",
  ACCOUNT_INFORMATION: "Account Information",
  PERSONAL_INFORMATION: "Personal Information ",
  KYC_INFORMATION: "KYC Information",
  GIFT_OUTLINE: "gift-outline",
  MY_REFERRALS: "My Referrals",
  PRICING_CURRENCY: "Pricing Currency ",
  DISPLAY_LANGUAGE: "Display Language",
  ENGLISH: "English",
  VERSION: "Version",
  HELP_CENTER_FAQ: "Help Center (FAQ)",
  LOG_OUT: "Logout",
  MY_REFERRAL_SCREEN: "MyReferrals",

}

export const CRYPTO_CONSTANTS = {
  GREETING_MORNING: "Good Morning!",
  GREETING_AFTERNOON: "Good Afternoon!",
  GREETING_EVENING: "Good Evening!",
  TOTAL_ASSETS: "Total Assets",
  DEPOSIT: "Deposit",
  WITHDRAW: "Withdraw",
  CARDS: "Cards",
  ASSETS: "Assets",
  CRYPTO_WALLET: "Crypto Wallet",
  SELECT_CURRENCY: "Select Currency",
  INACTIVE_ACCOUNT: "Your account is inactive.",
  CRYPTO_WALLET_ROUTE: "CryptoWallet",
  SELECT_ASSET_ROUTE: "SelectAsset",
  CRYPTO_COIN_RECEIVE: "CryptoCoinReceive",
  INACTIVE: "Inactive",
  EXCHANGA_CARD: "ExchangaCard",
  CLOSE: "close"

};


export interface CurrencyItem {
  name: string;
  coin: string;
};

export const DASHBOARD_CONSTANTS = {
  EXCHANGA_PAY: "Exchanga Pay",
  EXIT_APP_TITLE: "Exit App",
  EXIT_APP_MESSAGE: "Do you want to exit?",
  CANCEL: "cancel",
  NO: "No",
  CONFIRM: "Confirm",
  YES: "Yes",
  HOME: "Home",
  CARDS: "Cards",
  TRANSACTIONS: "Transactions",
  NOTIFICATIONS: "Notifications",
  DRAWER_MODAL: "DrawerModal",
  ICON_HOME: "home",
  ICON_HOME_OUTLINE: "home-outline",
  ICON_CARDS: "card",
  ICON_CARDS_OUTLINE: "card-outline",
  ICON_TRANSACTIONS: "swap-horizontal",
  FIRST: "first",
  SECOND: "second",
  THIRD: "third",
  EXCHANGE: "exchange",
  TRANSACTION: "transaction",
  INACTIVE: "Inactive",
  SETTINGS: 'Settings',
  SETTINGS_ICON: 'ios-list',
  SETTINGS_OUTLINE: 'ios-list-outline',

};
export interface SecurityInfo {
  percentage: number;
  level: string;
  email: string;  // encrypted string
  phone: string;  // encrypted string
  isSecurityQuestionsEnabled: boolean;
  isGoogleAuthEnabled: boolean;
  isFaceResgEnabled: boolean;
  isAuth0Enabled: boolean | null;
}
export interface AlertItem {
  id: string;
  title: string;
  message: string;
  typeId: string;
}