export const ONBOARDING_API_ENDPOINTS = {
  // Email Verification
  RESEND_VERIFY_MAIL: 'api/v1/Customer/VerifyEmail',
  V3_RESEND_VERIFY_MAIL: 'api/v1/verifications/email/resend',
  SEND_EMAIL_OTP: 'api/v1/confirmations/email/send',
  VERIFY_EMAIL_OTP: 'api/v1/confirmations/email/verify',
  GET_EMAIL_OTP: (type: string) => `api/v1/ExchangeWallet/SendEmailOTP/${type}`,

  // User Registration & Info
  SAVE_USER_INFO: (accType: string) => `api/v1/customers/register/${accType}`,
  GET_MEMBER_INFO: 'api/v1/Registration/App/Exchange',
  GET_CUSTOMER: 'api/v1/customer',
  GET_WEB3_MEMBER_INFO: (address: string) => `api/v1/Customer/customerCreation/${address}`,
  GET_CUSTOMER_PROFILE: (accountType: string) => `api/v1/customers/profile/${accountType}`,

  // Mobile/Phone Verification
  VERIFY_MOBILE_CODE: (customerId: string, otp: string) => `api/v1/Security/PhoneVerification/${customerId}/${otp}`,
  SEND_MOBILE_CODE: 'api/v1/confirmations/phone/send',
  VERIFY_MOBILE_OTP: 'api/v1/confirmations/phone/verify',
  GET_OTP: (customerId: string, type: string) => `api/v1/Security/SendOTP/${customerId}/${type}`,

  // App Version & Updates
  NEO_MOBILE_VERSION_CHECK: 'api/v1/Common/AppVersions/NeoMobileBank',

  // Sumsub Integration
  SUMSUB_TOKEN: (userid: string) => `api/v1/Sumsub/AccessToken1?applicantId=${userid}&levelName=basic-kyc`,
  SUMSUB_ACCESS_TOKEN: (userid: string, levelName: string) => `api/AccessToken1?applicantId=${userid}&levelName=${levelName}`,

  // MFA (Multi-Factor Authentication)
  MFA_ASSOCIATE: 'api/v1/mfa/associate',
  MFA_TOKEN: 'api/v1/mfa/Token',

  // Authentication & Account
  GET_ACCOUNT_INFO: '/connect/userinfo',
  LOGIN_LOG: 'api/v1/Common/Login',
  LOGOUT_LOG: 'api/v1/Common/Logout',
  GET_MENU_ITEMS: 'api/v1/security/menu',

  // Business Operations
  UPDATE_BUSINESS_LOGO: 'api/business/logo',
  GET_BUSINESS_WEB_URL: (application: string) => `api/v1/m/business/sdklinks?applicantId=${application}`
} as const;