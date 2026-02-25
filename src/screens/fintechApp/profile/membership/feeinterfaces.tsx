export const CONSTANTS = {
  FEE_VIEW: "Fees",
  VAULTS_CHARGES: "Vaults Charges",
  ON_BOARDING_FEE: "Onboarding Fee",
  DORMANT_FEE: "Dormant Fee",
  MONTHLY_FEE: "Monthly Fee",
  DASHBOARD: "Dashboard",
  COMMISSIONS: "Commissions",
  CRYPTO: "Crypto",
  FIAT: "Fiat",
  MIN: "Min",
  MAX: "Max (%) ",
  FLAT_FEE: "Flat Fee",
  CHEVRON_DOWN: 'chevron-down',
  PROVIDER: "Provider",
  CURRENCY: "Currency",
  NO_DATA_AVAILABLE: "No Data Available",
  DEGREE_180: '180deg',
  DEGREE_0: '0deg',
  DEPOSIT: "Deposit",
  WITHDRAW: "Withdraw",
  GUID: '00000000-0000-0000-0000-000000000000',
  MEMBERsHIP: 'Membership',
  PRICE: 'Price',
  REFERRAL_BONUS: 'Referral Bonus (%)',
  UPGRADE_BTN: 'Upgrade',
  PURCHASE_BTN: 'Purchase now',
  ISSUING_FEE: 'IssuingFee',
  MAINTENANCE_FEE: 'MaintenanceFee',
  TOPUP_FEE: 'Top-Up Fee',
  CANCELATION_FEE: 'Cancellation Fee',
  ARTHAPAY_TIERS: 'samrat Tiers',
  ARTHAPAY_TIERS_PARA: 'The arthapay Program is a four-tier system, comprising Free, Bronze, Gold, and Platinum Tiers, which extends benefits depending on the amount of artha Tokens you hold in your Portfolio Balance.',
  CURRENT: 'Current',
  UPGRADE: 'Upgrade',
  TICK_MARK_ICON: "checkmark-sharp",
  VIEW_MORE: 'View More',
  PURCHASE_START: 'Choose a plan and start enjoying the benefits today!.',
  DO_DONT_HAVE_MEMBEESHIP: 'You don’t have an active membership',
};

export interface CommissionDetail {
  id: string;
  commissionId: string;
  productId: string | null;
  action: string;
  currencyType: string;
  currency: string | null;
  isMinMax: boolean;
  minFee: number;
  maxFee: number;
  isFlat: boolean;
  flatFee: number;
  createdDate: string;
  userCreated: string;
  modifiedDate: string | null;
  modifiedBy: string | null;
  status: number;
  recOrder: number;
}
export interface NetworkInfo {
  balance: number;
  code: string;
  coinName: string;
  customerWalletId: string;
  id: string;
  logo: string;
  maxLimit:number;
  minLimit: number;
  name: string;
}
export interface CommissionInfo {
  id: string;
  customerId: string | null;
  customerIds: string | null;
  tierName: string;
  onBoardingFee: number;
  monthlyFee: number;
  dormantFee: number;
  userCreated: string;
  createdDate: string;
  modifiedBy: string;
  modifiedDate: string;
  status: string;
  info: string | null;
  commissionModels: CommissionDetail[];
  membershipName: '',
  membershipPrice: number | null,
  referralBonus: number | null,
};
export const FeeActionsList = [
  { name: 'Vaults Charges', index: 0 },
  { name: 'Cards Charges', index: 1 },
  { name: 'Payment Charges', index: 2 }
]
export interface InitValues {
  currency: string; 
  network: string;
}
interface Merchant {
  merchantsDetails: string; 
}
export interface DataState {
  loading?: boolean;
  defaultVaultDetails?: any | null; // To store the details of the chosen default vault
  errorMessage?: string;
  // selectedVaultId: string; // Will be derived from defaultVaultDetails
  selectedCoinCode?: string; // To store the code of the selected currency/coin
  networks?: NetworkInfo[]; // To store networks for the selectedCoinCode from the defaultVaultDetails
  availableBalance?: number;
  amount?: string|number;
  selectedNetworkId?: string|number;
  address?: string;
  buttonLoader?: boolean;
  previewData?: any | null;
  loader?: boolean;
}
export interface PostObject {
  cryptoWalletId: string|number|undefined; 
  membershipId: string | undefined; 
}
export interface TransactionDetails {
  cryptoWalletId: string | undefined; 
  membershipId: string; 
}

export interface UpgradeMembershipProps {
  route: {
    params: {
      membershipName: string;
      membershipPrice: number;
      membershipId: string;
    };
  };
  navigation: any;
  onSheetClose?: () => void; // Add this prop for sheet context
  onUpgradeSuccess?: (
    responseData: any,
    selectedNetworkId: string | number,
    membershipName: string,
    membershipPrice: number,
    membershipId: string) => void; // Updated callback prop
}
export const gradients = [
['rgba(64, 123, 255, 0.26)', 'rgba(100, 139, 218, 0.26)'],
  ['rgba(10, 202, 224, 0.26)', 'rgba(66, 120, 236, 0.26)'],
  ['rgba(229, 156, 133, 0.26)', 'rgba(237, 147, 147, 0.26)'],
  ['rgba(215, 229, 133, 0.26)', 'rgba(231, 233, 142, 0.26)'],];
export const greenGradient =
  ['#1FB042', '#063416']
export const feeTierBg = ['rgba(69, 139, 222, 0.20)', 'rgba(169, 162, 252, 0.20)',]
