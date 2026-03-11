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

export const transactionsModelsGraph = [
  {
    "name": "CryptoWithdraw",
    "colorByPoint": false,
    "data": [
      { name: '', yAxis: 32000, "color": "#20B2AA" },
      { name: '05-11', yAxis: 30000, "color": "#20B2AA" },
      { name: '05-12', yAxis: 28000, "color": "#20B2AA" },
      { name: '05-13', yAxis: 40000, "color": "#20B2AA" },
      { name: '05-14', yAxis: 33000, "color": "#20B2AA" },
      { name: '05-15', yAxis: 36000, "color": "#20B2AA" },
      { name: '05-16', yAxis: 32000, "color": "#20B2AA" },
      { name: '05-17', yAxis: 34000, "color": "#20B2AA" },
      { name: '05-18', yAxis: 40000, "color": "#20B2AA" },
      { name: '05-19', yAxis: 33000, "color": "#20B2AA" },
      { name: '05-20', yAxis: 35000, "color": "#20B2AA" },
      { name: '05-21', yAxis: 30000, "color": "#20B2AA" },
      { name: '05-22', yAxis: 28000, "color": "#20B2AA" },
      { name: '05-23', yAxis: 50000, "color": "#20B2AA" },
      { name: '05-24', yAxis: 20000, "color": "#20B2AA" },
      { name: '05-24', yAxis: 10000, "color": "#20B2AA" },
      { name: '05-24', yAxis: 0, "color": "#20B2AA" },
    ],
    color: "#FFA07A",
  },
];
export const oneCoinValue: any = {
  BTC: "$108,783",
  ETH: "$2,644.46",
  USDC: "$0.999",
  USDT: "$1.0004",
};
export const tradeValue: any = {
  BTC: "-0.16",
  ETH: "1.33",
  USDC: "0.01",
  USDT: "0.09",
};
export interface DayLookupItem {
  code: string;
  name: string;
}

export const DaysLookup: DayLookupItem[] = [
  { code: "7D", name: "7" },
  { code: "30D", name: "30" },
];

export interface CurrencyInfoInterface {
  totalAmount?: number;
  cardsAmount?: number;
  cryptoAmount?: number;
  currency?: string;
}

export interface AccountDashboardScreenProps {
  currencyInfo?: CurrencyInfoInterface;
  userInfo?: any;
  currencyUpdate?: any;
  currencyRefresh: (value: boolean) => void;
  amountLoading?: boolean;
  isHighlightedWithdraw?: boolean;
}

export interface CurrencyItem {
  code: string;
  logo: string | null;
  name?: string; // Optional: if currencies have a full name
}
export interface LearnList {
  id: string;
  heading: string;
  imageURL: string;
}