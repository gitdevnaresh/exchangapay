// Teams Module Constants
export const TEAMS_CONSTANTS = {
  // API Status Values
  STATUS: {
    ALL: 'All',
    ACTIVE: 'Active',
    INACTIVE: 'Inactive',
    DISABLED: 'Disabled',
    ENABLED: 'Enabled'
  },

  // Navigation Screen Names
  SCREENS: {
    TEAM_INDEX: 'TeamIndex',
    TEAM_LIST: 'TeamList',
    TEAM_CARDS_VIEW: 'TeamCardsView',
    TEAM_CARDS_LIST_VIEW: 'TeamCardsListView',
    CARD_DETAIL_VIEW: 'CardDetailView',
    CARD_HISTORY_LIST: 'CardHistoryList',
    TEAM_TRANSACTIONS_LIST_VIEW: 'TeamTransactionsListView',
    TRANSACTION_DETAIL_VIEW: 'TransactionDetailView',
    INVITE_MEMBER: 'InviteMember',
    NEW_PROFILE: 'NewProfile'
  },

  // Account Types
  ACCOUNT_TYPES: {
    TEAM_MEMBER_TRANSACTIONS: 'TeamMemberTransactions',
    TEAM_CARD_DETAIL: 'TeamCardDetail'
  },

  // Card Types
  CARD_TYPES: {
    ABC_VIRTUAL_CARD: 'abcvirtualcard'
  },

  // Image URLs
  URLS: {
    VISA_LOGO: {
      ABC_CARD: 'https://devtstarthaone.blob.core.windows.net/arthaimages/arthapay-mobile-images/cardvisalogo.svg',
      DEFAULT: 'https://devtstarthaone.blob.core.windows.net/arthaimages/arthapay-mobile-images/card_visa_logo.svg'
    },
    RAPIZ_LOGO: 'https://rapidzstoragespacetst.blob.core.windows.net/images/cardsrapizlogo.svg'
  },

  // Transaction Types
  TRANSACTION_TYPES: {
    BUY: 'buy',
    WITHDRAW: 'withdraw',
    DEPOSIT: 'deposit'
  },

  // Crypto/Fiat Types
  CURRENCY_TYPES: {
    CRYPTO: 'crypto',
    FIAT: 'fiat'
  },

  // Decimal Places
  DECIMAL_PLACES: {
    CRYPTO: 4,
    FIAT: 2
  },

  // Pagination
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_PAGE_SIZE: 10,
    SMALL_PAGE_SIZE: 5,
    LARGE_PAGE_SIZE: 50
  },

  // UI Constants
  UI: {
    CARD_ASPECT_RATIO: 133 / 75,
    CARD_WIDTH_PERCENTAGE: 20,
    TARGET_CAROUSEL_ITEM_HEIGHT: 185,
    SPACE_FOR_DOTS: 24,
    MAX_NAME_LENGTH: 16,
    NAME_TRUNCATE_START: 8,
    NAME_TRUNCATE_END: 8,
    EMAIL_TRUNCATE_START: 8,
    EMAIL_TRUNCATE_END: 8,
    MEMBER_NAME_WIDTH: 240,
    LIST_BOTTOM_PADDING: 200,
    CARDS_LIST_BOTTOM_PADDING: 150,
    TAB_BOTTOM_PADDING: 40,
    FILTER_SHEET_HEIGHT: 500,
    SPACE_CHAR: ' ',
    EMPTY_STRING: '',
    DEFAULT_CARD_NAME: '',
    DEFAULT_CARDS_NAME: 'Cards',
    ACTIVE_STATUS: 'Active',
    CARD_HISTORY_TITLE: 'Card History',
    KEYBOARD_SHOULD_PERSIST_TAPS: 'handled',
    KEYBOARD_TYPE_PHONE_PAD: 'phone-pad'
  },

  // Form Validation
  FORM: {
    MAX_LENGTH: {
      USERNAME: 50,
      FIRST_NAME: 50,
      LAST_NAME: 50,
      EMAIL: 50,
      PHONE_NUMBER: 13,
      MEMBER_ID: 20
    },
    FIELD_NAMES: {
      USERNAME: 'userName',
      FIRST_NAME: 'firstName',
      LAST_NAME: 'lastName',
      GENDER: 'gender',
      COUNTRY: 'country',
      PHONE_CODE: 'phoneCode',
      PHONE_NUMBER: 'phoneNumber',
      EMAIL: 'email',
      MEMBER_ID: 'memberId'
    },
    RADIO_BUTTON_FIELDS: {
      LABEL: 'label',
      VALUE: 'value'
    }
  },

  // Animation Types
  ANIMATIONS: {
    SLIDE_FROM_LEFT: 'slide_from_left'
  },

  // Tab Routes
  TAB_ROUTES: {
    TRANSACTIONS: 'transactions',
    HISTORY: 'history'
  },

  // Tab Titles
  TAB_TITLES: {
    CARD_TRANSACTIONS: 'Card Transactions',
    CARD_HISTORY: 'Card History',
    CARD_DETAILS: 'Card Details'
  },

  // Date Conversion Types
  DATE_CONVERSION: {
    UTC_TO_LOCAL: 'UTC-to-local'
  },

  // Platform Types
  PLATFORMS: {
    IOS: 'ios',
    ANDROID: 'android'
  },

  // Keyboard Behavior
  KEYBOARD_BEHAVIOR: {
    PADDING: 'padding',
    HEIGHT: 'height'
  },

  // Toast Types
  TOAST_TYPES: {
    SUCCESS: 'success',
    ERROR: 'error'
  },

  // Member Actions
  MEMBER_ACTIONS: {
    DISABLE: 'disable',
    ENABLE: 'enable'
  },

  // Filter Types
  FILTER_TYPES: {
    ALL: 'All'
  },

  // Account Types
  ACCOUNT_TYPES_EXTENDED: {
    TEAM_CARD_DETAIL: 'TeamCardDetail'
  },

  // Toast Types
  TOAST_TYPES_EXTENDED: {
    SUCCESS: 'success',
    ERROR: 'error'
  },

  // Animation Values
  ANIMATION_VALUES: {
    KEYBOARD_OFFSET_IOS: 64,
    KEYBOARD_OFFSET_ANDROID: 100
  },

  // Input Styles
  INPUT_STYLES: {
    BORDER_RIGHT_WIDTH: 0,
    BORDER_TOP_RIGHT_RADIUS: 0,
    BORDER_BOTTOM_RIGHT_RADIUS: 0,
    BORDER_TOP_LEFT_RADIUS: 0,
    BORDER_BOTTOM_LEFT_RADIUS: 0,
    MARGIN_LEFT: 0
  }
};

// Export individual constants for easier imports
export const { STATUS, SCREENS, ACCOUNT_TYPES, CARD_TYPES, URLS, TRANSACTION_TYPES, CURRENCY_TYPES, DECIMAL_PLACES, PAGINATION, UI, FORM, ANIMATIONS, TAB_ROUTES, TAB_TITLES, DATE_CONVERSION, PLATFORMS, KEYBOARD_BEHAVIOR, TOAST_TYPES, MEMBER_ACTIONS, FILTER_TYPES, ACCOUNT_TYPES_EXTENDED, TOAST_TYPES_EXTENDED, ANIMATION_VALUES } = TEAMS_CONSTANTS;