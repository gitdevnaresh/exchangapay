import { NavigationProp } from "@react-navigation/native";
import { getThemedCommonStyles } from "../../../../components/CommonStyles";
import { useThemeColors } from "../../../../hooks/themedHook/useThemeColors";
import { RootStackParamList } from "../../onboarding/interface";

export interface ExchangeAsset {
  id: string;
  code: string;
  name: string;
  amount: number;
  logo?: string;
  image?: string;
  currency?: string;
  amountInUSD?: number;
  minLimit?: number;
  maxLimit?: number;
  buyMin?: number | null;
  buyMax?: number | null;
}

export interface ExchangeDropdownItem {
  id: string;
  code: string;
  name: string;
  amount: number;
  logo?: string;
  image?: string;
  currency?: string;
  buyMin?: number | null;
  buyMax?: number | null;
}

export interface ExchangeState {
  fromAssets: ExchangeAsset[];
  toAssets: ExchangeAsset[];
  dropDownList: ExchangeDropdownItem[];
  loading: boolean;
  error: string | null;
}

export interface ExchangeFormValues {
  fromAmount: string;
  toAmount: string;
  fromCurrency: string;
  toCurrency: string;
}

export interface ExchangeRateResponse {
  rate: number;
  fromAmount: number;
  toAmount: number;
  fee?: number;
  feeType?: string;
}

export interface CryptoExchangeRouteParams {
  coinFullName?: string;
  cryptoCoin?: string;
  toCoin?: string;
  fromAmount?: string;
  fromScreen?: string;
}

export interface CryptoExchangeProps {
  route: {
    params?: CryptoExchangeRouteParams;
  };
}

export interface SummaryData {
  oneCoinValue: number;
  assetValue: number;
  fee: number;
  totalAmount: number;
}

export interface BuySavePayload {
  fromAssetId?: string;
  fromAsset: string;
  fromValue: number;
  toAssetId?: string;
  toAsset: string;
  toValue: number;
}

export interface CustomRBSheetRef {
  open: () => void;
  close: () => void;
}


export interface CryptoAsset {
  code: string;
  amount: number;
  id: string;
  name?: string;
  image?: string;
  amountInUSD?:string;
}

export interface FiatAsset {
  code: string;
  amount: number;
  id: string;
  name?: string;
}

export interface DropDownObj {
  buyMin: number;
  buyMax: number;
  amount: number;
  id: string;
  code?: string;
  name?: string;
  image?: string;
}

export interface MinMaxResponse {
  ok: boolean;
  data: {
    min: number;
    max: number;
    amount: number;
    id: string;
    code: string;
    name: string;
    image: string;
  };
}

export interface CryptoBalanceResponse {
  ok: boolean;
  data: {
    cryptoAssets: CryptoAsset[];
    fiatAssets: FiatAsset[];
  };
}

export interface SummaryResponse {
  ok: boolean;
  data: unknown;
}

export interface ConvertValueResponse {
  ok: boolean;
  data: {
    toAssetValue: number;
  };
}

export interface BalanceItem {
    name: string;
    value: number;
}

export interface Asset {
    code: string;
    image?: string;
}

export interface RootState {
    userReducer: {
        userDetails: {
            currency: string;
        };
    };
}

export interface BalanceCarouselProps {
    cryptoBalance: number | string;
    fiatBalance: number | string;
    apiData?: BalanceItem[];
    assets?: {
        crypto?: Asset[];
        fiat?: Asset[];
    };
}





export interface InitialData {
    assets?: CryptoAsset[];
}

export interface CryptoData {
    cryptoList: CryptoAsset[];
}
export  interface CryptoExchangeInterface {
    cryptoCoin?: string;
    coinFullName?: string;
    logo?: string;
    amountInUSD?: number;
  };

  export interface CryptoExchangeParams {
  cryptoCoin: string;
  coinFullName: string;
  logo: string;
  amountInUSD: number;
}


export interface ExchangeCryptoDetailsParams {
    coinName?: string|undefined;
    coinCode?: string;
    coinIcon?: string;
    balance?: number;
    balanceInUSD?: number|undefined|string;
    fromScreen?:string;
    cryptoCoin?:string|undefined;
    coinFullName?:string;
    logo?:string|undefined;
    amountInUSD?:number|undefined|string;
}


export interface ExchangeCryptoListDashboardProps {
    refreshTrigger?: boolean;
    initialData?: InitialData;
    onError?: (error: string) => void;
    onLoadingChange?: (loading: boolean) => void;
}

export interface RouteParams {
  coinFullName?: string;
  cryptoCoin?: string;
  toCoin?: string;
  fromAmount?: string;
  fromScreen?: string;
}

export interface CryptoExchangeProps {
  route: {
    params?: RouteParams;
  };
}

export interface CryptoAsset {
    id: string;
    code: string;
    name: string;
    amount: number;
    image: string;
    logo?: string;
}

export interface CryptoDetails {
    id: string;
    code: string;
    name: string;
    amount: number;
    logo: string;
}

export interface CryptoLoadingState {
    cryptoLoading: boolean;
    isActive: boolean;
    isCryptoSelected: boolean;
    btnLoading: boolean;
}

export interface CryptoListState {
    cryptoList: CryptoAsset[];
    cryptoPrevList: CryptoAsset[];
}

export interface CryptoRowProps {
    item: CryptoAsset;
    onPress: () => void;
    isSelected: boolean;
    commonStyles: ReturnType<typeof getThemedCommonStyles>;
    NEW_COLOR: ReturnType<typeof useThemeColors>;
}

export interface ApiResponse {
    ok: boolean;
    data: {
        assets: CryptoAsset[];
    };
}

export interface ExchangeCryptoListProps {
    navigation: NavigationProp<RootStackParamList>;
    route: {
        params?: {
            type?: string;
        };
    };
}

export interface RenderItemProps {
    item: CryptoAsset;
}