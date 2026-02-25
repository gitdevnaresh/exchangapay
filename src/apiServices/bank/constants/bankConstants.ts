// Bank API Endpoints - Only used endpoints
export const BANK_ENDPOINTS = {
  // Account endpoints
  ACCOUNT: {
    KPI: '/api/v1/banks/kpi',
    DETAILS: '/api/v1/accounts',
    CREATION: 'api/v1/Bank/AccountCreation',
    WITHDRAW_FEE: 'api/v1/accounts/withdraw/fee',
    WITHDRAW: '/api/v1/accounts/withdraw',
    SUMMARY: '/api/v1/banks',
    ACCOUNT_CREATION: '/api/v1/banks',
    PAYMENT_FIAT_FEE: '/api/v1/banks/payments',
    PAYMENT_CRYPTO_FEE: '/api/v1/banks/payments'
  },
  
  // KYB endpoints
  KYB: {
    REQUIREMENTS: 'api/v1/banks',
    UBO_DETAILS: 'api/v1/uboDetails',
    SECTORS: 'api/v1/sectors',
    TYPES: 'api/v1/types',
    BENEFICIARIES: 'api/v1/beneficiaries'
  },
  
  // Common endpoints
  COMMON: {
    LOOKUP: 'api/v1/kyc/lookup',
    ADDRESSES: '/api/v1/addresses',
    ADDRESS_LOOKUP: 'api/v1/addresses/lookup',
    ADDRESS_TYPES: 'api/v1/addresstypes',
    COUNTRIES: 'api/v1/registration/lookup',
    STATES: 'api/v1/Common/States',
    PAYEES_FIAT: 'api/v1/payees/fiat',
    PAYEES_UPDATE: 'api/v1/payees/fiat',
    PAYEES_SAVE: 'api/v1/Payees/Fiat',
    PAYEES_PAYMENTS: '/api/v1/payees/payments',
    PAYEES_LOOKUP: 'api/v1/payees/lookup',
    PAYMENT_TYPES: '/api/v1/paymenttypes',
    BRANCHES: '/api/v1/payees/branches',
    NOTIFICATIONS: '/api/v1/notifications',
    UNREAD_COUNT: '/api/v1/UnReadCount',
    READ_NOTIFICATIONS: 'api/v1/read',
    PHONE_SEND: '/api/v1/confirmations/phone/send',
    PHONE_RESEND: '/api/v1/confirmations/phone/resend',
    PHONE_VERIFY: '/api/v1/confirmations/phone/verify',
    IBAN_VALIDATE: 'api/v1/iban',
    CURRENCY_COUNTRIES: 'api/v1/payee/currencywithcountries',
    PROVIDER_BANKS: 'api/v1/payees/providerbanks',
    BANKS_LOOKUP: '/api/v1/banks/lookup',
    DYNAMIC_LOOKUP: '/api/v1',
    PROFILE_PERSONAL: '/api/v1/customers/profile/personal',
    PROFILE_BUSINESS: '/api/v1/customers/profile/business',
    PRIVACY_POLICY: '/api/v1',
    SUMSUB_TOKEN: '/api/v1/Tiers/AccessToken',
    POA_CREATION: '/api/v1/bank/poacreation',
    RECIPIENT_FIAT: 'api/v1/payees/recipient/PayeeFiat',
    RECIPIENT_CRYPTO: 'api/v1/payees/recipient/PayeeCrypto',
    PHONE_VERIFY_ONBOARDING: '/api/v1/phone/verify',
    PAYMENT_SCHEME: (currency: string, payeeId: string) => `/api/v1/bankwithdraw/paymentScheme/${currency}/${payeeId}`
  }
};

// Action types
export const BANK_ACTION_TYPES = {
  DEPOSIT: 'deposit',
  WITHDRAW: 'withdraw',
  CREATE: 'create'
};

// Account types
export const ACCOUNT_TYPES = {
  PERSONAL: 'personal',
  BUSINESS: 'business'
};