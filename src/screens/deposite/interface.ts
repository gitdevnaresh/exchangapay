export interface Network {
    id: string;
    name: string;
    code: string;
    minLimit: number;
    maxLimit: number;
    depositMinLimit: number;
    depositMaxLimit: number;
    address: string | null;
    amount: number;
    chainId: string | null;
    decimals: number | null;
    hexId: string | null;
    multiSendAddress: string | null;
    coinNetWork:string|null,
    logo?: string; // The component uses this property, but it's not in the provided JSON
}
export interface DepositMethodSelectRouteParams {
    walletCode: string;
    walletId: string;
    logo?: string;
}

export interface DepositMethodSelectNavigation {
    goBack: () => void;
    navigate: (route: string, params: DepositMethodSelectRouteParams) => void;
}

export interface DepositMethodSelectProps {
    route: {
        params: DepositMethodSelectRouteParams;
    };
}

export interface DepositCoin {
    id: string;
    code: string;
    logo: string;
    details: any; // Consider refining if structure is known
    walletCode: string;
    name: string;
}

export interface DepositCurrencySelectComponentProps {
    navigation: {
        navigate: (routeName: string, params?: object) => void;
    };
}


// Navigation params for DepositSelectNetwork
export interface DepositSelectNetworkParams {
    walletCode: string;
    walletId?: string;
}

// Navigation prop type for useNavigation
export interface DepositSelectNetworkNavigation {
    goBack: () => void;
    navigate: (route: string, params: { network: Network; walletCode: string }) => void;
}

// Route prop type for useRoute
export interface DepositSelectNetworkRoute {
    params: DepositSelectNetworkParams;
}

// Props for FlatList renderItem in DepositSelectNetwork
export interface NetworkRenderItem {
    item: Network;
}

// API response type for getWalletNetwork (if needed)
export interface WalletNetworkApiResponse {
    status: number;
    data: Network[];
    config?: { url?: string };
} 