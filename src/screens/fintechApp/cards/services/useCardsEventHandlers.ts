import { useCallback, Dispatch, SetStateAction } from 'react';
import { Animated, Easing, TextInput } from 'react-native';
import CardsModuleService from "../../../../apiServices/cards";
import { isErrorDispaly } from "../../../../utils/helpers";
import { CardTopUpList } from "../interface";
import { CardsInfoState, SheetTitle } from '../dashoard/interface';

interface UseCardsEventHandlersProps {
    state: CardsInfoState;
    updateState: (newState: Partial<CardsInfoState>) => void;
    pin: string[];
    setPin: (pin: string[]) => void;
    isFlipped: boolean;
    setIsFlipped: Dispatch<SetStateAction<boolean>>;
    refs: {
        rbSheetRef: React.RefObject<any>;
        pinInputRefs: React.MutableRefObject<(TextInput | null)[]>;
        flipAnimation: Animated.Value;
    };
    userInfo: any;
    navigation: any;
    encryptAES: (text: string) => string;
    getCardsByIds: (cardId: string) => Promise<void>;
    getTopupbalance: () => Promise<void>;
    getCardsTopUpDetails: () => Promise<string | null>;
    getNetworkLookUps: (currencyCode: string) => Promise<void>;
    getCardsSupportedPlatforms: () => Promise<void>;
    fetchCardInfoDataForActiveCard: (cardId: string, isRefresh?: boolean) => Promise<void>;
    fetchDepositFeeComission: (amount: any) => Promise<void>;
}

export const useCardsEventHandlers = ({
    state, updateState, pin, setPin, isFlipped, setIsFlipped, refs, userInfo, navigation, encryptAES,
    getCardsByIds, getTopupbalance, getCardsTopUpDetails, getNetworkLookUps, getCardsSupportedPlatforms,
    fetchCardInfoDataForActiveCard, fetchDepositFeeComission
}: UseCardsEventHandlersProps) => {

    const handlePinChange = (value: string, index: number) => {
        const newPin = [...pin];
        newPin[index] = value;
        setPin(newPin);
        if (value && index < 3) refs.pinInputRefs.current[index + 1]?.focus();
        if (!value && index > 0) refs.pinInputRefs.current[index - 1]?.focus();
    };

    const flipCard = () => {
        if (state.CardsInfoData?.state === "Freezed") return;
        Animated.timing(refs.flipAnimation, {
            toValue: isFlipped ? 0 : 1,
            duration: 500,
            easing: Easing.linear,
            useNativeDriver: true,
        }).start(() => setIsFlipped(prev => !prev));
        if (!isFlipped) getCardsByIds(state.activeCardId);
    };

    const openSheet = (title: SheetTitle, flags: Partial<CardsInfoState>) => {
        updateState({
            RbSheetTittle: title,
            isFreezeSheet: false, isCardInfoSheet: false, isSetPinSheet: false,
            isLimitSheet: false, isTopUpSheet: false, mangeCardSheet: false,
            rbSheetErrorMsg: '', isBindCardSheet: false, isSheetOpen: true,
            isSuccessSheet: false, isCardDetailsSheet: false, ...flags
        });
        setPin(['', '', '', '']);
        setTimeout(() => refs.rbSheetRef.current?.open(), 10);
    };

    const handleIconCloseModel = () => {
        refs.rbSheetRef.current?.close();
        updateState({
            isFreezeSheet: false, isCardInfoSheet: false, isSetPinSheet: false,
            isLimitSheet: false, isTopUpSheet: false, isSheetOpen: false,
            RbSheetTittle: "Manage Card", rbSheetErrorMsg: '', isBindCardSheet: false,
            isSuccessSheet: false, topUpAmount: null, isCardDetailsSheet: false,
        });
    };

    const handleCardStatus = async () => {
        updateState({ buttonLoader: true, rbSheetErrorMsg: "" });
        const action = state.CardsInfoData?.state === "Freezed" ? "unfreeze" : "freeze";
        try {
            const response: any = await CardsModuleService.saveFreezeUnFreeze(state.activeCardId, action, { id: state.activeCardId });
            if (response.ok) {
                handleIconCloseModel(); // Close sheet first
                await fetchCardInfoDataForActiveCard(state.activeCardId, true); // Then refresh
            } else {
                updateState({ rbSheetErrorMsg: isErrorDispaly(response) });
            }
        } catch (error) {
            updateState({ rbSheetErrorMsg: isErrorDispaly(error) });
        } finally {
            updateState({ buttonLoader: false });
        }
    };

    const handleSetPinConfirm = async () => {
        updateState({ buttonLoader: true, rbSheetErrorMsg: "" });
        const finalPin = pin.join('');
        if (finalPin.length < 4) {
            updateState({ rbSheetErrorMsg: "Please enter a complete 4-digit PIN", buttonLoader: false });
            return;
        }
        const obj = { id: state.activeCardId, status: 1, actionBy: "Set Pin", pin };
        try {
            const res: any = await CardsModuleService.saveResetPin(userInfo?.id, state.activeCardId, obj);
            if (res.ok) handleIconCloseModel();
            else updateState({ rbSheetErrorMsg: isErrorDispaly(res) });
        } catch (error) {
            updateState({ rbSheetErrorMsg: isErrorDispaly(error) });
        } finally {
            updateState({ buttonLoader: false });
        }
    };

    const saveTopUp = async (formikValues: any) => {
        updateState({ buttonLoader: true, rbSheetErrorMsg: '' });
        try {
            const selectedNet = state.networkData.find((net: any) => net.network === formikValues.network);
            if ((selectedNet?.amount ?? 0) < formikValues.amount) { // Use formikValues.amount
                updateState({ rbSheetErrorMsg: "InSufficient balance", buttonLoader: false });
                return;
            }
            const Obj: CardTopUpList = {
                amount: formikValues.amount,
                cryptoWalletId: selectedNet?.id ?? null,
                programId: state.activeCardId,
            };
            const res = await CardsModuleService.saveDeposit(Obj);
            if (res.ok) handleSuccess(formikValues.amount, formikValues.currency);
            else updateState({ rbSheetErrorMsg: isErrorDispaly(res) });
        } catch (error) {
            updateState({ rbSheetErrorMsg: isErrorDispaly(error) });
        } finally {
            updateState({ buttonLoader: false });
        }
    };

    const handleSaveBindCard = async (values: any) => {
        updateState({ buttonLoader: true, rbSheetErrorMsg: '' });
        try {
            const obj = {
                physicalCardProgramId: state.bindCardData[0]?.physicalCardProgramId,
                envelopeNumber: values?.envelopNumber ?? "",
                cardNumber: encryptAES(values?.cardNumber),
                handHoldingIdPhoto: values?.handHoldingIDPhoto ?? "",
            };
            const response = await CardsModuleService.postQuickLinks(obj);
            if (response.ok) navigation?.navigate("ApplySuccess");
            else updateState({ rbSheetErrorMsg: isErrorDispaly(response?.data) });
        } catch (error) {
            updateState({ rbSheetErrorMsg: isErrorDispaly(error) });
        } finally {
            updateState({ buttonLoader: false });
        }
    };

    const handleManageCards = () => openSheet("Manage Card", { mangeCardSheet: true });
    const handleFreeze = () => openSheet(state.CardsInfoData?.state !== "Freezed" ? "Freeze Card" : "Unfreeze Card", { isFreezeSheet: true });
    const handlePinSheet = () => openSheet("GLOBAL_CONSTANTS.SET_PIN" as SheetTitle, { isSetPinSheet: true });

    const handleViewCardDetails = async () => {
        if (!state.cardsDetails?.cvv) await getCardsByIds(state.activeCardId);
        openSheet("GLOBAL_CONSTANTS.CARD_DETAILS" as SheetTitle, { isCardDetailsSheet: true });
    };

    const handleLimit = async () => {
        await getTopupbalance();
        openSheet("GLOBAL_CONSTANTS.LIMIT" as SheetTitle, { isLimitSheet: true });
    };

    const handleBindCardSheet = () => openSheet("Bind Card", { isBindCardSheet: true });
    const handleSuccess = (amount: number, currency: string) => {
        updateState({ successAmount: amount, successCurrency: currency, successCardName: state.CardsInfoData?.name });
        openSheet("Success", { isSuccessSheet: true });
    };

    const handleCardInfoSheet = () => {
        getCardsSupportedPlatforms();
        openSheet("GLOBAL_CONSTANTS.SUPPORTED_PLOTFORMS" as SheetTitle, { isCardInfoSheet: true });
    };

    const handleTopUpSheet = async () => {
        const initialCurrency = await getCardsTopUpDetails();
        if (initialCurrency) {
            handleSelectCurrency({ currencyCode: initialCurrency }); // This will trigger network lookups
        }
        await getTopupbalance();
        updateState({ topUpAmount: '' });
        openSheet("Top-Up", { isTopUpSheet: true });
    };

    const backArrowButtonHandler = () => navigation.goBack();
    const handleRecentTranscationReloadDetails = (reload: boolean) => updateState({ recentTranscationReload: reload }); // Corrected: pass reload

    const handleSendAmountChange = (value: string, setFieldValue: (field: string, value: any) => void) => {
        const parsedValue = parseFloat(value);
        const amountToSet = isNaN(parsedValue) ? '' : parsedValue; // Keep as number or empty string for Formik
        updateState({ topUpAmount: amountToSet });
        setFieldValue('amount', amountToSet); // Ensure Formik gets a number or empty string
        fetchDepositFeeComission(isNaN(parsedValue) ? 0 : parsedValue); // API expects number
    };

    const handleMaxValue = (setFieldValue: (field: string, value: any) => void) => {
        const maxLimit = parseFloat(state.topupBalanceInfo?.maxLimit ?? '0');
        const fixedResult = maxLimit.toFixed(2);
        updateState({ topUpAmount: parseFloat(fixedResult) });
        setFieldValue('amount', fixedResult);
        fetchDepositFeeComission(parseFloat(fixedResult));
    };
    const handleMinValue = (setFieldValue: (field: string, value: any) => void) => {
        const minLimit = parseFloat(state.topupBalanceInfo?.minLimit ?? '0');
        const fixedResult = minLimit.toFixed(2);
        updateState({ topUpAmount: parseFloat(fixedResult) });
        setFieldValue('amount', fixedResult);
        fetchDepositFeeComission(parseFloat(fixedResult));
    };

    const handleSelectCurrency = (value: any) => {
        const currencyCode = value?.currencyCode ??"";
        updateState({ selectedCurrency: currencyCode });
        if (currencyCode) getNetworkLookUps(currencyCode);
    };

    const handleSelectNetwork = (value: any) => updateState({ selectedNetwork: value?.network ?? "" });
    const handleRbSheetErrorMsgClose = () => updateState({ rbSheetErrorMsg: '' });
    const handleDoneButtonFromSuccessSheet = () => refs.rbSheetRef.current?.close();

    const handleViewableItemsChanged = useCallback(({ viewableItems }: any) => {
        if (viewableItems && viewableItems.length > 0) {
            const firstViewableItem = viewableItems[0];
            if (firstViewableItem.isViewable && firstViewableItem.item) {
                const newActiveCardId = firstViewableItem.item.id;
                const newActiveIndex = firstViewableItem.index;

                if (newActiveCardId !== state.activeCardId) {
                    updateState({
                        activeCardId: newActiveCardId,
                        carouselActiveIndex: newActiveIndex ?? 0,
                        cardsDetails: {}, 
                    });
                    refs.flipAnimation.setValue(0); 
                    setIsFlipped(false);
                    fetchCardInfoDataForActiveCard(newActiveCardId);
                    // fetchOtherCardsList(newActiveCardId); // This was in original, ensure it's called if needed
                }
            }
        }
    }, [state.activeCardId, updateState, setIsFlipped, refs.flipAnimation, fetchCardInfoDataForActiveCard]);

    return {
        handlePinChange, flipCard, openSheet, handleIconCloseModel, handleCardStatus, handleSetPinConfirm, saveTopUp, handleSaveBindCard,
        handleManageCards, handleFreeze, handlePinSheet, handleViewCardDetails, handleLimit, handleBindCardSheet, handleSuccess, handleCardInfoSheet, handleTopUpSheet,
        backArrowButtonHandler, handleRecentTranscationReloadDetails, handleSendAmountChange, handleMaxValue, handleMinValue,
        handleSelectCurrency, handleSelectNetwork, handleRbSheetErrorMsgClose, handleDoneButtonFromSuccessSheet, handleViewableItemsChanged
    };
};