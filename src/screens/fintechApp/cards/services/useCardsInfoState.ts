import React, { useState, useRef } from 'react';
import { Animated, FlatList, ScrollView, TextInput } from 'react-native';
import { CardList } from "../interface";
import { CardsInfoState } from '../dashoard/interface';

export const initialCardsInfoState = (cardIdFromRoute: string | null): CardsInfoState => ({
    errorMsg: "",
    initialRouteCardId: cardIdFromRoute,
    componentIsLoading: true,
    activeCardDetailsLoading: false,
    CardsInfoData: {},
    bindCardData: {},
    recentTranscationReload: false,
    RbSheetTittle: "Manage Card",
    isFreezeSheet: false,
    mangeCardSheet: false,
    isCardInfoSheet: false,
    isSetPinSheet: false,
    isLimitSheet: false,
    isTopUpSheet: false,
    buttonLoader: false,
    cardSuportedPlatForms: [],
    rbSheetErrorMsg: '',
    networkData: [],
    currencyCode: [],
    selectedCurrency: "",
    selectedNetwork: "",
    topupBalanceInfo: {},
    topUpAmount: '',
    feeComissionLoading: false,
    feeComissionData: {},
    isBindCardSheet: false,
    isSheetOpen: false,
    cardsDetails: {},
    isSuccessSheet: false,
    successAmount: 0,
    successCurrency: '',
    successCardName: '',
    isCardDetailsSheet: false,
    allMyCardsList: [],
    activeCardId: cardIdFromRoute || "",
    carouselActiveIndex: 0,
    otherAvailableCards: [],
    otherAvailableCardsLoading: false,
});

export const useCardsInfoState = (cardIdFromRoute: string | null) => {
    const [state, setState] = useState<CardsInfoState>(initialCardsInfoState(cardIdFromRoute));
    const [pin, setPin] = useState<string[]>(['', '', '', '']);
    const [isFlipped, setIsFlipped] = useState(false);

    const rbSheetRef = useRef<any>(null);
    const carouselRef = useRef<FlatList<CardList>>(null);
    const scrollViewRef = useRef<ScrollView>(null);
    const pinInputRefs = useRef<(TextInput | null)[]>([]);
    const flipAnimation = useRef(new Animated.Value(0)).current;
    const prevIsSuccessSheetRef = useRef<boolean>();
    const onViewRef = useRef<any>(null); // For FlatList onViewableItemsChanged
    const viewConfigRef = React.useRef({ viewAreaCoveragePercentThreshold: 50, minimumViewTime: 300 });

    const updateState = (newState: Partial<CardsInfoState>) => {
        setState(prev => ({ ...prev, ...newState }));
    };

    return { state, updateState, pin, setPin, isFlipped, setIsFlipped, refs: { rbSheetRef, carouselRef, scrollViewRef, pinInputRefs, flipAnimation, prevIsSuccessSheetRef, onViewRef, viewConfigRef } };
};