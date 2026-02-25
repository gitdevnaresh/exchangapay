export interface UserProfile {
  id: string;
  refId: string;
  userName: string;
  fullName: string;
  accountType: string;
  email: string;
  phoneNumber: string; // Primary phone number field
  phoneNo?: string; // Optional alternative phone number field
  profileImage: string; // Primary image field
  image?: string; // Optional alternative image field
  registrationDate: string;  // Primary registration date field
  registeredDate?: string; // Optional alternative registration date field
  firstName: string;
  lastName: string;
  businessName: string | null;
  incorporationDate: string | null;
  country: string;
  phoneCode?: string;
}
export interface ReferralData {
  name: string;
  value: string | number;  // Value can either be a string or a number, based on the data type.
  isCount: boolean;        // A flag to indicate whether the field is countable
}

export interface ReferralList {
  data: ReferralData[];
}
export interface Referral {
  id: string;
  refId: string;
  name: string;
  email: string;
  registeredDate: string;
  status: string;
  state: string;
  profilePic: string | null;
  referralName: string;
}
export interface Status {
  name: string;
  code: string;
}

export interface Referrals {
  listLoading: boolean;
  error: string;
  listData: Referral[];
};
export interface TransactionDetailItem {
  type?: string;
  transactionType?: string;
  transactionId?: string;
  date?: string;
  transactionDate?: string;
  currency?: string;
  network?: string;
  netWork?: string;
  amount: number | string;
}
export interface MemberDetailsRouteParams {
  id: string;
  name?: string;
}
export interface KpiItem {
  name: string;
  value: string | number;
  isCount?: boolean;
}
export interface MemberDetailsProps {
  route: {
    params: MemberDetailsRouteParams;
  };
  navigation: any;
}
export const cryptoCurrencies = [
  "BTC",   // Bitcoin
  "ETH",   // Ethereum
  "USDT",  // Tether
  "USDC",  // USD Coin
  "BNB",   // BNB (Binance Coin)
  "XRP",   // Ripple
  "ADA",   // Cardano
  "DOGE",  // Dogecoin
  "SOL",   // Solana
  "DOT",   // Polkadot
  "MATIC", // Polygon
  "LTC",   // Litecoin
  "TRX",   // TRON
  "SHIB",  // Shiba Inu
  "AVAX",  // Avalanche
  "LINK"   // Chainlink
];
