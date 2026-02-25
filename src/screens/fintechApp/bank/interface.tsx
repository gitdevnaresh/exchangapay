export interface AccountCardProps {
  item: any;
  handleChage: (value: any) => void;
}

export interface BankState {
  selectedCoin: string;
  coins: string;
  cardBalance: { usd: number; eur: number };
}

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
}

export interface VerificationField {
  isEmailVerification: boolean;
  isPhoneVerified: boolean;
}

export interface ApiResponse {
  ok: boolean;
  data: {
    totalAmount: string;
    accounts: BankAccount[];
    transactionsModels: ChartData[];
  };
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
  };
}

export interface UserInfo {
  kycStatus: string;
}

export interface ScreenPermissions {
  Banks: {
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