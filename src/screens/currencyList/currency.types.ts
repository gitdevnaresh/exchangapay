import { RouteProp } from "@react-navigation/native";

export interface Currency {
  code: string;
  name: string;
  logo: string;
  [key: string]: any; // Add more fields as needed
}

export interface CurrencyLUResponse {
  CurrencyLU: Currency[];
}

type CurrencyListRouteParams = {
    selectedCurrencyCode?: string | null;
    onSelect?: (currencyCode: string) => void;
    from?: string;
    cardId?: string;
    pageHeaderTitle?: string;
};

export interface CurrencyListProps {
    selectionType?: string;
    searchPlaceholder?: string;
    navigation?: any;
    selectedCurrencyCode?: string | null;
    route?: RouteProp<{ params: CurrencyListRouteParams }, 'params'>;
}

export type FlatListItem =
    | { type: 'header'; title: string }
    | (Currency & { type: 'item' });

export type ViewableItem = { item: FlatListItem };
