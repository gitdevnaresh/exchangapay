import { CardList } from "../interface";

interface CardsInfoData {
    name?: string;
    type?: string;
    number?: string;
    state?: string;
    cardcurrency?: string;
    image?: string;
}

interface BindCardData {
    [key: string]: unknown;
}

interface CardSupportedPlatform {
    id?: string;
    name?: string;
    [key: string]: unknown;
}

interface NetworkData {
    id?: string;
    name?: string;
    [key: string]: unknown;
}

interface CurrencyCode {
    code?: string;
    name?: string;
    [key: string]: unknown;
}

interface TopupBalanceInfo {
    balance?: number;
    currency?: string;
    [key: string]: unknown;
}

interface TopUpAmount {
    amount?: number;
    currency?: string;
    [key: string]: unknown;
}

interface FeeCommissionData {
    fee?: number;
    commission?: number;
    [key: string]: unknown;
}

interface CardsDetails {
    number?: string;
    expireDate?: string;
    cvv?: string;
    [key: string]: unknown;
}

export interface CardsInfoState {
    errorMsg: string;
    initialRouteCardId: string | null;
    componentIsLoading: boolean;
    activeCardDetailsLoading: boolean;
    CardsInfoData: CardsInfoData;
    bindCardData: BindCardData;
    recentTranscationReload: boolean;
    // isCardFlip: boolean; // Replaced by isFlipped in useCardsInfoState
    RbSheetTittle: string;
    isFreezeSheet: boolean;
    mangeCardSheet: boolean;
    isCardInfoSheet: boolean;
    isSetPinSheet: boolean;
    isLimitSheet: boolean;
    isTopUpSheet: boolean;
    buttonLoader: boolean;
    cardSuportedPlatForms: CardSupportedPlatform[];
    rbSheetErrorMsg: string;
    networkData: NetworkData[];
    currencyCode: CurrencyCode[];
    selectedCurrency: string;
    selectedNetwork: string;
    topupBalanceInfo: TopupBalanceInfo;
    topUpAmount: TopUpAmount;
    feeComissionLoading: boolean;
    feeComissionData: FeeCommissionData;
    isBindCardSheet: boolean;
    isSheetOpen: boolean;
    cardsDetails: CardsDetails;
    isSuccessSheet: boolean;
    successAmount: number;
    successCurrency: string;
    successCardName: string;
    isCardDetailsSheet: boolean;
    allMyCardsList: CardList[];
    activeCardId: string;
    carouselActiveIndex: number;
    otherAvailableCards: CardList[];
    otherAvailableCardsLoading: boolean;
}

export type SheetTitle = "Manage Card" | "Card Info" | "Freeze Card" | "Unfreeze Card" | "Set Pin" | "Limit" | "Top-Up" | "Bind Card" | "Success" | "GLOBAL_CONSTANTS.CARD_DETAILS" | "GLOBAL_CONSTANTS.SUPPORTED_PLOTFORMS" | "GLOBAL_CONSTANTS.SET_PIN" | "GLOBAL_CONSTANTS.LIMIT";