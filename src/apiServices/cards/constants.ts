export const CARD_API_ENDPOINTS = {
  // Wallet & Balance
  GET_CARD_BALANCE: (customerId: string) => `api/v1/ExchangeWallet/M/TotalWalletAmount/${customerId}`,
  GET_ALL_CARDS: 'api/v1/CardsWallet/MyCards',
  TOTAL_BALANCE: 'api/v1/cards/balances/summary',
  GET_CARD_TOTAL_AMOUNT: (customerId: string) => `api/v1/ExchangeWallet/MyCardsInfo/${customerId}`,
  GET_CARDS_TOTAL_AMOUNT: 'api/v1/cards/balances/summary',

  // Card Operations
  CREATE_CARDS: (id: string) => `api/v1/Cards/CreateCards/${id}`,
  SAVE_DEPOSIT: 'api/v1/cards/topup',
  GET_CARDS_BY_ID: (cardId: string) => `api/v1/cards/${cardId}/reveal`,
  FETCH_CVV: (customerId: string, cardId: string) => `api/v1/Cards/FetchCVV/${customerId}/${cardId}`,
  
  // Freeze/Unfreeze
  FREEZE_CARD: 'api/v1/Cards/FreezeCard',
  UNFREEZE_CARD: 'api/v1/Cards/UnFreezeCard',
  SAVE_FREEZE_UNFREEZE: (cardId: string, action: string) => `api/v1/cards/${cardId}/${action}`,

  // Card Management
  REISSUE_CARD: (customerId: string, cardId: string) => `api/v1/CardsWallet/Customer/${customerId}/Card/${cardId}/Replacecard`,
  TERMINATE_CARD: (customerId: string, cardId: string) => `api/v1/CardsWallet/Customer/${customerId}/Card/${cardId}/ReportLoss`,
  GET_REISSUE_CARD: (id: string) => `api/v1/Cards/ReActivateCard/${id}`,
  TERMINATE_CARD_ALT: 'api/v1/Cards/terminateCard',

  // PIN Operations
  SET_CARD_PIN: (customerId: string, cardId: string) => `/api/v1/CardsWallet/M/Admin/${customerId}/Card/${cardId}/SetPin`,
  GET_CARD_PIN: (id: string, customerId: string) => `api/v1/Cards/GetCardPin/${id}/${customerId}`,
  RESET_PIN: (customerId: string, cardId: string) => `api/v1/CardsWallet/Customer/${customerId}/Card/${cardId}/Resendpin`,
  SET_PIN: (id: string) => `api/v1/cards/${id}/pin`,

  // Fees & Deposits
  GET_TOPUP_BALANCE: (customerId: string, cardId: string) => `api/v1/CardsWallet/Deposit/${customerId}/Card/${cardId}/Fee`,
  GET_DEPOSIT_FEE: (cardId: string, amount: string, coin: string) => `api/v1/cards/${cardId}/estimatefee?amount=${amount}&Currency=${coin}`,
  GET_CARD_TOPUP_BALANCE: (cardId: string) => `api/v1/cards/${cardId}/topup`,

  // Notes & Info
  SAVE_CARD_NOTES: 'api/v1/Cards/NoteSave',
  GET_ALL_CARDS_INFO: (pageSize: string, pageNo: string, customerId: string) => `api/v1/Common/Cards/NewCards/${pageSize}/${pageNo}/${customerId}`,
  GET_MY_CARDS_INFO: (customerId: string) => `api/v1/CardsWallet/MyCards/${customerId}`,
  GET_MY_CARDS: '/api/v1/Common/MyCardsLu',

  // Apply Cards
  GET_APPLY_CARDS: (pageSize: number, pageNo: number) => `api/v1/cards/available?pagesize=${pageSize}&pageno=${pageNo}`,
  GET_ALL_MY_CARDS: (url: string) => `api/v1/${url}`,
  GET_APPLY_CARD_DETAILS: (cardId: string) => `api/v1/cards/${cardId}/apply`,
  GET_APPLY_CARD_FAQ: 'api/v1/faq',
  GET_APPLY_CARDS_REQUIREMENTS: (cardId: string) => `/api/v1/cards/${cardId}/cardskycrequirements`,
  GET_APPLY_CARDS_CUSTOMER_FEE_INFO: (cardId: string, walletId: string, haveCard: boolean) => `api/v1/applycards/${cardId}/info/${walletId}/${haveCard}`,
  SAVE_CUSTOMER_CARDS_WALLET: 'api/v1/CardsWallet/Customer/ApplyCard',
  GET_APPLY_CARD_STATUS: (cardId: string) => `api/v1/CardsWallet/CustomerCardStatus/${cardId}`,
  APPLY_CARD_POST_SERVICE: 'api/v1/CardsWallet/Customer/ApplyCard',

  // Address & Location
  GET_ADDRESS_LU: 'api/v1/addresses/lookup',
  CARDS_ADDRESS_GET: (page: string, pageSize: string) => `api/v1/customer/addresses?page=${page}&pageSize=${pageSize}`,
  GET_LIST_OF_COUNTRIES: 'api/v1/Common/CountryLu',
  GET_ADDRESS_DETAILS: (addressId: string) => `/api/v1/Common/Customer/Address/${addressId}`,
  CARDS_ADDRESS_POST: '/api/v1/customer/address',
  CARDS_ADDRESS_PUT: 'api/v1/customer/address',
  GET_COUNTRY_CODES: 'api/v1/Common/AddressLu',
  GET_TOWNS: 'api/v1/Common/countrytownlu',
  GET_PERSONAL_ADDRESS_LU: 'api/v1/Common/AddressLu',
  GET_COUNTRY_LU: 'api/v1/Common/CountryLu',
  GET_ADDRESS_LOOKUP: '/api/v1/addresses',

  // Physical Cards
  GET_PHYSICAL_CARDS: (customerId: string) => `/api/v1/CardsWallet/Customer/PhysicalCards/${customerId}`,
  GET_CARDS_APPLICATION_INFO: (customerId: string, cardId: string) => `/api/v1/Common/Customer/${customerId}/Physical/ApplicationInformation/${cardId}`,
  GET_SUPPORT_PLATFORMS: (customerId: string, pageSize: string, pageNo: string) => `api/v1/CardsWallet/AllCards/${customerId}/${pageSize}/${pageNo}`,

  // Crypto & Coins
  CARDS_CRYPTO_AMOUNT: (coin: string, customerId: string) => `/api/v1/CardsWallet/availablebalance/${coin}/${customerId}`,
  GET_COINS: (cardId: string) => `/api/v1/cards/walletcode/${cardId}`,
  GET_NETWORK_LOOKUP: (coin: string, cardId: string) => `api/v1/cards/networks/${coin}/Card/${cardId}`,
  GET_NETWORK_LU: (coin: string) => `/api/v1/Common/Wallets/NetWorksLu/${coin}`,

  // KYC & Compliance
  UPDATE_KYC: 'api/v1/CardsWallet/kycUpdate',
  POST_KYC_INFORMATION: 'api/v1/CardsWallet/Customer/Physical/ApplyCard',
  GET_QUICK_LINK_APPLICATION_INFO: (customerId: string, cardId: string) => `/api/v1/Common/Customer/${customerId}/Card/${cardId}/KYCInformation`,
  GET_BENEFICIARY_TYPE: '/api/v1/Kyc/BeneficiaryTypeLu',
  GET_BENEFICIARIES: (type: string) => `/api/v1/beneficiaries?beneficiaryType=${type}`,
  GET_UBOS_DETAILS: (id: string) => `/api/v1/UboDetails?id=${id}`,
  GET_UBO_DETAILS: 'api/v1/beneficiaries?beneficiaryType=Ubo',
  GET_UBO_DETAILS_BY_ID: (id: string) => `api/v1/UboDetails?id=${id}`,

  // Quick Links & Binding
  POST_QUICK_LINKS: '/api/v1/cards/physical/bind',
  GET_BIND_CARD_DATA: 'api/v1/cards/physical/bind',
  POST_QUICK_LINK_APPLY_CARD: 'api/v1/CardsWallet/Customer/Physical/ApplyCard',

  // Employee & Assignment
  GET_EMPLOYEE_LU: '/api/v1/cards/employees?search=null',
  GET_ASSIGNED_CARDS: (customerId: string, pageSize: string, pageNo: string) => `api/v1/CardsWallet//AssignCards/${customerId}/${pageSize}/${pageNo}`,
  ASSIGN_CARD_SAVE: '/api/v1/cards/assign',

  // Card Info & Details
  CARD_INFO: (cardId: string) => `api/v1/Cards/${cardId}`,
  GET_CARDS: (pageSize: string, pageNo: string) => `api/v1/cards?pageSize=${pageSize}&pageNo=${pageNo}`,
  GET_CORE_LOOKUPS: 'api/v1/cards/lookup',
  GET_OCCUPATION_LOOKUP: (cardId: string) => `api/v1/cards/Occupations/${cardId}`,

  // Countries & Documents
  GET_CARD_COUNTRIES: 'api/v1/countrytownlu',
  GET_CARD_COUNTRIES_TOWNS: (cardId: string, countryCode: string) => `api/v1/CardTownLu/${cardId}/${countryCode}`,
  GET_DOCUMENTS: (country: string) => `api/v1/Countries/lookup/${country}`,
  GET_CARD_DOC_TYPES: 'api/v1/cards/DocTypes',

  // Legal & Agreements
  GET_E_SIGN_CONSENT: 'api/v1/cards/E-SignConsent',
  GET_CARD_TERMS: 'api/v1/card/Terms',
  GET_PRIVACY_POLICY: 'api/v1/cards/PrivacyPolicy',
  GET_AUTHORIZED_USER_AGREEMENT: 'api/v1/cards/AuthorizedUserAgreement',

  // Industry & Limits
  GET_INDUSTRY_LU: 'api/v1/cards/IndustryLU',
  GET_ACTIVE_CARD_DYNAMIC_FIELDS: (id: string) => `api/v1/cards/ActivateCardDetails/${id}`,
  GET_CARD_LIMITS_INFO: (cardId: string) => `api/v1/CardLimitTypes/${cardId}`,
  SET_CARD_LIMITS: 'api/v1/SetTransactionLimit',

  // iFrame Operations
  GET_VIEW_IFRAME: (id: string) => `api/v1/cards/iframe/cardview/${id}`,
  GET_SET_PIN_IFRAME: (id: string) => `api/v1/cards/iframe/pin/${id}`,

  // Withdraw Operations
  GET_CARD_WITHDRAW_BALANCE: (cardId: string) => `api/v1/cards/${cardId}/withdraw`,
  SAVE_CARD_WITHDRAW: 'api/v1/withdraw',

  // Platform Support & Activation
  GET_SUPPORTED_PLATFORMS: (cardId: string) => `api/v1/supportedplatforms/${cardId}`,
  GET_ACTIVATE_CARD_FIELDS: (cardId: string) => `api/v1/cards/waitingtoactivatecarddetails/${cardId}`,
  ACTIVATE_CARD: 'api/v1/cards/activatecard',

  // Virtual & Physical Card Applications
  VIRTUAL_CARD_APPLY: 'api/v1/cards/virtual/apply',
  PHYSICAL_CARD_APPLY: 'api/v1/cards/customerphysical/apply',

  // Double Step Card Application
  GET_MY_CARD_POST: 'api/v1/cards/getmycard',
  POST_DOUBLE_STEP_CARD_APPLY: 'api/v1/cards/customer/holdercreation',
  POST_DOUBLE_STEP_FEE_STEP_VIRTUAL: 'api/v1/cards/virtual/applycard',
  GET_CARD_HOLDER_STATUS: (cardId: string) => `api/v1/getcardholderStatus/${cardId}`
} as const;