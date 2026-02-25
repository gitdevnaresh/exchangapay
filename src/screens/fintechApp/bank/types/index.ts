// Consolidated Bank Types
export interface BankAccount {
  id: string;
  currency: string;
  amount: number;
  accountNumber: string;
  availableBalance: number;
  productid: string;
  logo: string;
  name: string;
  code: string;
  bankStatus?: string;
}

export interface UserInfo {
  id: string;
  kycStatus: string;
  currency?: string;
  customerState?: string;
  isInitialSubscriptionRequired?: boolean;
  isSubscribed?: boolean;
  accountType?: string;
}

export interface VerificationField {
  isEmailVerification: boolean;
  isPhoneVerified: boolean;
}

export interface ApiResponse<T = any> {
  ok: boolean;
  data?: T;
  message?: string;
}

export interface ChartData {
  date: string;
  amount: number;
}

export interface ReduxState {
  userReducer: {
    userDetails: UserInfo;
    screenPermissions: ScreenPermissions;
    menuItems: MenuItem[];
    bankDashboardDetails?: {
      createAccDetails: BankAccount[];
      totalBalance: string;
    };
  };
}

export interface ScreenPermissions {
  Banks?: {
    permissions: {
      tabs: TabPermission[];
    };
  };
}

export interface TabPermission {
  name: string;
  isEnabled: boolean;
}

export interface MenuItem {
  featureName: string;
  id: string;
}

// Account Creation Types
export interface Currency {
  name: string;
  banks: Bank[];
}

export interface Bank {
  name: string;
  productId: string;
  accountCreationFee?: number;
  note?: string;
}

// KYC Types
export interface KycInfo {
  requirement?: string;
  basic?: BasicInfo;
}

export interface BasicInfo {
  country?: string;
  phoneCode?: string;
  phoneNo?: string;
  email?: string;
}

// KYB Types
export interface KybDetails {
  companyName?: string;
  country?: string;
  registrationNumber?: string;
  incorporationDate?: string;
  ubo?: UboDirectorItem;
  director?: UboDirectorItem;
}

export interface UboDirectorItem {
  id: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  dob?: string;
  country?: string;
  shareHolderPercentage?: number;
  email?: string;
  phoneCode?: string;
  phoneNumber?: string;
  isDirector?: boolean;
  isComplete?: boolean;
}

// Transaction Types
export interface TransactionData {
  id: string;
  amount: number;
  currency: string;
  type: string;
  status: string;
  date: string;
}

// Payee Types
export interface Payee {
  id: string;
  favoriteName: string;
  walletAddress: string;
  currency: string;
  type: string;
  status: string;
  isEditable: boolean;
}
