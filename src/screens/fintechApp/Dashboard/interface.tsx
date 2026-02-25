import { CardItem } from "../../commonScreens/smartCardCarousal/smartCardCarousel";
import { NavigationProp, ParamListBase } from '@react-navigation/native';

export interface HomeProps {
  navigation: NavigationProp<ParamListBase>;
}

export interface UserInfo {
  kycStatus?: string | null;
  currency?: string;
  metadata?: {
    IsInitialKycRequired?: boolean;
    IsInitialVaultRequired?: boolean;
  };
  [key: string]: unknown;
}

export interface MyCardsState {
  myCards: CardItem[];
  myCradsLoader: boolean;
}

export interface Asset {
  code: string;
  amount: number;
}

export interface VerificationField {
  isEmailVerification?: boolean | null;
  isPhoneVerified?: boolean | null;
}

export interface ApiCallsCompletedState {
  balance: boolean;
  cards: boolean;
  verification: boolean;
  assets: boolean;
  accounts: boolean;
  transactions: boolean;
}

export interface Configuration {
  BANK_BANNER_SECTION_TITTLE?: boolean;
}

export interface GraphConfiguration {
  DASHBOARD_LOADER?: boolean;
  RECENT_ACTIVITY?: {
    HOME?: boolean;
  };
}

export interface CommonConfiguration {
  IS_SKIP_KYC_VERIFICATION_STEP?: boolean;
  inviteFriends?: boolean;
}

export interface Balance {
  name: string;
  value: number;
}

export interface ApiResponse<T = unknown> {
  ok: boolean;
  data?: T;
}

export interface TransactionData {
  id?: string;
  amount?: number;
  type?: string;
  status?: string;
  date?: string;
}

export interface VaultsList {
  vaultsList: Vault[];
  vaultsPrevList: Vault[];
}

export interface VaultCoinsList {
  coinsList: Asset[];
  coinsPrevList: Asset[];
}

export interface Vault {
  assets: Asset[];
}

export interface PaymentKpiItem {
  name: string;
  value: number;
}

export interface RootState {
  userReducer: {
    userDetails: UserInfo;
    homeDashboardCards: MyCardsState;
    allBalanceInfo: number;
    homeWallets: Asset[];
    menuItems: MenuItem[];
  };
}

export interface MenuItem {
  featureName: string;
  isEnabled: boolean;
}

export interface GraphDetailItemDataPoint {
    name: string;
    yAxis: number;
    color: string;
}

export interface GraphDetailItem {
    name: string;
    colorByPoint?: boolean;
    data: GraphDetailItemDataPoint[];
    color?: string;
    dataPointsColor?: string; 
    textColor?: string;      
}

export interface GraphConfiguration {
    GRAPH?: {
        Home?: boolean;
        // Add other properties if they exist
    };
    // Add other properties of GraphConfiguration
}


export interface DayLookupItem {
    code: string;
    name: string;
}

export interface NewColor {
    TEXT_WHITE: string;
    // Add other color properties
}

export interface SpendingChartSectionProps {
    GraphConfiguration: GraphConfiguration;
    graphDetails: GraphDetailItem[];
    activeYear: string;
    handleYears: (item: DayLookupItem) => void;
    graphDetailsLoading?: boolean;
    disableInternalFetch?: boolean;
}

export interface AlertItem {
  id: string;
  title: string;
  message: string;
  typeId: string;
  // Add other fields from your API if needed
}

export interface AlertsCarouselProps {
  screenName?: string;
}