import { useEffect } from 'react';
import { Animated } from 'react-native';
import { CardsInfoState } from '../dashoard/interface';

interface UseCardsInfoEffectsProps {
    isFocused: boolean;
    cardDetailsFromRoute: any;
    state: CardsInfoState;
    updateState: (newState: Partial<CardsInfoState>) => void;
    refs: {
        scrollViewRef: React.RefObject<any>;
        prevIsSuccessSheetRef: React.MutableRefObject<boolean | undefined>;
        flipAnimation: Animated.Value;
    };
    api: {
        fetchAllMyCardsAndSetActive: (initialCardIdToActivate: string, onComplete?: (allCards: any[], activeIdx: number, activeId: string) => void) => Promise<void>;
        fetchCardInfoDataForActiveCard: (cardIdToFetch: string, isRefresh?: boolean) => Promise<void>;
        fetchOtherCardsList: (idToExclude: string) => Promise<void>;
        getBindCardDetails: () => Promise<void>;
    };
    setIsFlipped: (isFlipped: boolean) => void;
}

export const useCardsInfoEffects = ({ isFocused, cardDetailsFromRoute, state, updateState, refs, api, setIsFlipped }: UseCardsInfoEffectsProps) => {
    useEffect(() => {
        const routeCardId = cardDetailsFromRoute?.cardId;
        if (isFocused) {
            refs.scrollViewRef?.current?.scrollTo({ y: 0, animated: false });
            const justClosedSuccessSheet = refs.prevIsSuccessSheetRef.current === true && !state.isSuccessSheet;

            if (!justClosedSuccessSheet) {
                if (routeCardId && routeCardId !== state.initialRouteCardId) {
                    updateState({ initialRouteCardId: routeCardId, componentIsLoading: true });
                    api.fetchAllMyCardsAndSetActive(routeCardId, (allCards, activeIdx, activeId) => {
                         updateState({ allMyCardsList: allCards, activeCardId: activeId, carouselActiveIndex: activeIdx, cardsDetails: {} });
                         refs.flipAnimation.setValue(0);
                         setIsFlipped(false); // Ensure isFlipped from useCardsInfoState is also reset
                         api.fetchCardInfoDataForActiveCard(activeId);
                         api.fetchOtherCardsList(activeId);
                    });
                } else if (state.activeCardId && (state.allMyCardsList.length > 0 || routeCardId)) { 
                    api.fetchCardInfoDataForActiveCard(state.activeCardId, true);
                    api.fetchOtherCardsList(state.activeCardId);
                }
                api.getBindCardDetails();
            }
        }
        refs.prevIsSuccessSheetRef.current = state.isSuccessSheet;
    }, [isFocused, cardDetailsFromRoute?.cardId, state.isSuccessSheet, state.activeCardId, state.initialRouteCardId, state.allMyCardsList.length]);
};