import CardsModuleService from "../../../../apiServices/cards";
import { isErrorDispaly } from "../../../../utils/helpers";
import { CardList, CardTopUpList } from "../interface";
import { CardsInfoState } from "../dashoard/interface";

interface UseCardsAPIProps {
    state: CardsInfoState;
    updateState: (newState: Partial<CardsInfoState>) => void;
    userInfo: any;
    pin?: string[]; // Optional if not all API calls need it
    encryptAES?: (text: string) => string; // Optional
}

export const useCardsAPI = ({ state, updateState, userInfo, pin, encryptAES }: UseCardsAPIProps) => {

    const fetchAllMyCardsAndSetActive = async (initialCardIdToActivate: string, onComplete?: (allCards: CardList[], activeIdx: number, activeId: string) => void) => {
        if (!userInfo?.accountType || !initialCardIdToActivate) {
            updateState({ componentIsLoading: false, errorMsg: "User account type or Card ID missing." });
            return;
        }
        updateState({ componentIsLoading: true, errorMsg: "" });
        try {
            const response = await CardsModuleService.getAllMyCards(userInfo.accountType, 50, 1, false);
            if (response && Array.isArray(response.data)) {
                const allCards: CardList[] = response.data;
                if (allCards.length > 0) {
                    const activeIdx = allCards.findIndex(card => card.id === initialCardIdToActivate);
                    const currentActiveIndex = activeIdx !== -1 ? activeIdx : 0;
                    const currentActiveCardId = allCards[currentActiveIndex].id;
                    if (onComplete) onComplete(allCards, currentActiveIndex, currentActiveCardId);
                } else {
                    updateState({ allMyCardsList: [], activeCardId: "", CardsInfoData: {}, errorMsg: "No cards found." });
                }
            } else {
                updateState({ allMyCardsList: [], activeCardId: "", CardsInfoData: {}, errorMsg: isErrorDispaly(response) || "Failed to load cards." });
            }
        } catch (error) {
            updateState({ errorMsg: "Failed to load cards: " + isErrorDispaly(error), allMyCardsList: [], activeCardId: "", CardsInfoData: {} });
        } finally {
            updateState({ componentIsLoading: false });
        }
    };

    const fetchOtherCardsList = async (idToExclude: string) => {
        if (!userInfo?.accountType) return;
        updateState({ otherAvailableCardsLoading: true });
        try {
            const response = await CardsModuleService.getAllMyCards(userInfo.accountType, 10, 1, false);
            if (response && Array.isArray(response.data)) {
                const filteredCards = response.data.filter((card: CardList) => card.id !== idToExclude);
                updateState({ otherAvailableCards: filteredCards });
            } else {
                updateState({ otherAvailableCards: [] });
            }
        } catch (error) {
            updateState({ otherAvailableCards: [] });
        } finally {
            updateState({ otherAvailableCardsLoading: false });
        }
    };

    const fetchCardInfoDataForActiveCard = async (cardIdToFetch: string, isRefresh: boolean = false) => {
        if (!cardIdToFetch) return;
        if (!isRefresh) updateState({ activeCardDetailsLoading: true });
        try {
            const response = await CardsModuleService.CardInfo(cardIdToFetch);
            if (response.ok) {
                updateState({ CardsInfoData: response?.data || {}, activeCardId: cardIdToFetch });
            } else {
                const newError = `Failed to load details for card ${cardIdToFetch}: ${isErrorDispaly(response)}`;
                updateState({ CardsInfoData: {}, errorMsg: state.errorMsg ? `${state.errorMsg}; ${newError}` : newError });
            }
        } catch (error) {
            const newError = `Error loading details for card ${cardIdToFetch}: ${isErrorDispaly(error)}`;
            updateState({ CardsInfoData: {}, errorMsg: state.errorMsg ? `${state.errorMsg}; ${newError}` : newError });
        } finally {
            updateState({ activeCardDetailsLoading: false });
        }
    };

    const getTopupbalance = async () => {
        try {
            const res = await CardsModuleService.getCardTopupBalance(state.activeCardId);
            if (res.ok) updateState({ topupBalanceInfo: res?.data });
            else updateState({ rbSheetErrorMsg: isErrorDispaly(res) });
        } catch (error) {
            updateState({ rbSheetErrorMsg: isErrorDispaly(error) });
        }
    };

    const getBindCardDetails = async () => {
        updateState({ rbSheetErrorMsg: '' });
        try {
            const res = await CardsModuleService.getBindCardData();
            if (res.ok) updateState({ bindCardData: res?.data });
            else updateState({ rbSheetErrorMsg: isErrorDispaly(res) });
        } catch (error) {
            updateState({ rbSheetErrorMsg: isErrorDispaly(error) });
        }
    };

    const getCardsByIds = async (cardIdToFetch: string) => {
        if (!cardIdToFetch) return;
        updateState({ errorMsg: '' });
        try {
            const response: any = await CardsModuleService.getCardsById(cardIdToFetch);
            if (response.ok) updateState({ cardsDetails: response?.data });
            else updateState({ errorMsg: (isErrorDispaly(response)) });
        } catch (error) {
            updateState({ errorMsg: (isErrorDispaly(error)) });
        }
    };

    const fetchDepositFeeComission = async (topupAmountParam: any) => {
        updateState({ feeComissionLoading: true, errorMsg: "" });
        try {
            const response: any = await CardsModuleService.getDepositFeeComission(topupAmountParam || 0, state.activeCardId, state.selectedCurrency);
            if (response?.ok) updateState({ feeComissionData: response?.data });
            else updateState({ errorMsg: (isErrorDispaly(response)) });
        } catch (error) {
            updateState({ errorMsg: (isErrorDispaly(error)) });
        } finally {
            updateState({ feeComissionLoading: false });
        }
    };

    const getCardsTopUpDetails = async () => {
        updateState({ errorMsg: "", rbSheetErrorMsg: "" });
        try {
            const response: any = await CardsModuleService.getCoins(state.CardsInfoData?.programId);
            if (response.ok && response.data && response.data.length > 0) {
                updateState({ currencyCode: response?.data ?? [] });
                return response?.data[0]?.currencyCode; // Return for handleSelectCurrency
            } else {
                updateState({ rbSheetErrorMsg: isErrorDispaly(response) });
            }
        } catch (error) {
            updateState({ rbSheetErrorMsg: isErrorDispaly(error) });
        }
        return null;
    };

    const getNetworkLookUps = async (currencyCode: string) => {
        updateState({ rbSheetErrorMsg: "" });
        try {
            const response: any = await CardsModuleService.getNetworkLookup(currencyCode, state.CardsInfoData?.programId);
            if (response?.ok) {
                updateState({ networkData: response?.data ?? [], selectedNetwork: response?.data[0]?.network ?? "" });
            } else {
                updateState({rbSheetErrorMsg: isErrorDispaly(response)});
            }
        } catch (error) {
            updateState({rbSheetErrorMsg: isErrorDispaly(error)});
        }
    };

    const getCardsSupportedPlatforms = async () => {
        // This is mock data as per original code
        const suportedData = [{ "id": "64f255cc-7a1c-4c45-a277-e907453e7b8a", "type": "cards", "cardName": "Payou Virtual Card", "cardType": "Virtual", "currency": "EUR", "cardPrice": 105, "supportedPlatforms": "Amazon, Alipay, Shopee" }];
        updateState({ cardSuportedPlatForms: suportedData || [] });
    };

    return { fetchAllMyCardsAndSetActive, fetchOtherCardsList, fetchCardInfoDataForActiveCard, getTopupbalance, getBindCardDetails, getCardsByIds, fetchDepositFeeComission, getCardsTopUpDetails, getNetworkLookUps, getCardsSupportedPlatforms };
};