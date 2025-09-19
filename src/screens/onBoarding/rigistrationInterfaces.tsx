
export interface Mandatory {
  isRequired: boolean;
};

export interface Referral {
  referral: boolean
};
export interface RegVals {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  country: string;
  referralCode: string;
  isBusiness: string;
  businessName: string;
  type: string;
  phoneCode: string;
  phoneOTP: string;
};
export interface ReferralInfo {
  isRequired: boolean,
  isMandatoy: boolean
};

export interface Loaders {
  isPhoneNoEditable: boolean;
  isOTPButtonDisable: boolean;
  isOTPEditable: boolean;
  isPhoneNoEditVisible: boolean;
  isTimerShow: boolean;
  actionBtnName: string;
};

export interface User {
  id: string | number;
  userId: string | number;
  userName: string;
  firstName: string;
  lastName: string;
  isEmialVerified: boolean;
  isbusines: boolean;
  phoneNo: string;
  PhoneCode: string;
  country: string;
  email: string;
  businessName: string;
  accountManager: string | null;
  isAdmin: boolean;
  referralCode: string;
  accountType: string;
};
export interface CustomerAccount {
  accountType: string;
};

export interface AccountType {
  accountType: string,
  cardType: string,
  description: string,
  account: string,
};

export interface LoadersState {
  isAccountSelected: boolean,
  isBtnLoading: boolean,
  isDataLoading: boolean
};



