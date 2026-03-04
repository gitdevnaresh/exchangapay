import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { View, ScrollView, TextInput } from "react-native";
import { useIsFocused } from "@react-navigation/native";
import { hideDigitBeforLast, isErrorDispaly } from "../../../../utils/helpers";
import CardsModuleService from "../../../../apiServices/cards";
import { s } from "../../../../constants/styels/scale";
import Loadding from "../../../../components/skelton/skeltons";
import PageHeader from "../../../../components/pageHeader/pageHeader";
import { CARD_URIS, getThemedCommonStyles, statusColor } from "../../../../components/CommonStyles";
import ViewComponent from "../../../../components/view/view";
import TextMultiLangauge from "../../../../components/textComponets/multiLanguageText/textMultiLangauge";
import { CurrencyText } from "../../../../components/textComponets/currencyText/currencyText";
import CommonTouchableOpacity from "../../../../components/touchableComponents/touchableOpacity";
import CustomRBSheet from "../../../../components/models/commonBottomSheet";
import RecentTransactions from "../../../commonScreens/transactions/recentTransactions";
import ParagraphComponent from "../../../../components/textComponets/paragraphText/paragraph";
import ImageUri from "../../../../components/imageComponents/image";
import AntDesignExpo from 'react-native-vector-icons/AntDesign';
import TopUpIcon from "../../../../components/svgIcons/cardsicons/topUpIcon";
import CardActionsSheetContent from "./actions/cardSheetDetails";
import ButtonComponent from "../../../../components/buttons/button";
import useEncryptDecrypt from "../../../../hooks/encDecHook";
import SetPinIcon from "../../../../components/svgIcons/cardsicons/setPinIcon";
import LimitIcon from "../../../../components/svgIcons/cardsicons/limitIcon";
import SupportedPlatform from "../../../../components/svgIcons/cardsicons/supportedplatform";
import { CardTopUpList, CardList } from "../interface";
import { useThemeColors } from "../../../../hooks/themedHook/useThemeColors";
import DashboardLoader from "../../../../components/loader";
import { cardsInfoDetails } from "../skeltons";
import CardCarousel from "../../../../components/cardsCarousal/cardsCarousal";
import Container from "../../../../components/container/container";
import ImageBackgroundWrapper from "../../../../components/imageComponents/ImageBackground";
import { iconsList } from "../../../../constants/coinsList/coinsLIst";
import ActionButton from "../../../../components/gradianttext/gradiantbg";
import FreezeIcon from "../../../../components/svgIcons/cardsicons/freezeIcon";
import NoDataComponent from "../../../../components/noData/noData";
import BindCardNote from "./bindCard/bindcard";
import { CARDS_CONST, statusIconMap } from "../dashoard/constants";
import ManageCardIcon from "../../../../components/svgIcons/cardsicons/ManageCardIcon";
import { FontAwesome5 } from "@expo/vector-icons";
import { useHardwareBackHandler } from "../../../../hooks/backHandleHook";
import { SafeAreaView } from "react-native-safe-area-context";
import { logEvent } from "../../../../hooks/loggingHook";
import ScrollViewComponent from "../../../../components/scrollView/scrollView";
import WithdrawIcon from "../../../../components/svgIcons/mainmenuicons/dashboardwithdraw";
import { useLngTranslation } from "../../../../hooks/languagesHook/useLngTranslation";
import ErrorComponent from "../../../../components/errorDisplay/errorDisplay";
import { showAppToast } from "../../../../components/toasterMessages/ShowMessage";
import { getTabsConfigation, isDecimalSmall } from '../../../../../configuration';

const TARGET_CAROUSEL_ITEM_HEIGHT = s(210);
const SPACE_FOR_DOTS = s(24);

interface Employee {
    id: string;
    name: string;
    [key: string]: any;
}

const CardsInfo: React.FC<{ navigation: any; route?: any }> = React.memo((props) => {
    const userInfo = useSelector(
        (state: any) => state.userReducer?.userDetails);
    const cardDetails = props?.route?.params;
    const isFocused = useIsFocused();
    const rbSheetRef = useRef<any>(null);
    const scrollViewRef = useRef<ScrollView>(null);
    const pinInputRefs = useRef<(TextInput | null)[]>([]);
    const [pin, setPin] = useState(['', '', '', '']);
    const [supportedPlatforms, setSupportedPlatforms] = useState<any[]>([]);
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const { encryptAES, decryptAES } = useEncryptDecrypt();
    const { t } = useLngTranslation();
    const prevIsSuccessSheetRef = useRef<boolean>();
    const prevIsBindSuccessSheetRef = useRef<boolean>();
    const hasInitializedRef = useRef(false);
    const [refresh] = useState<boolean>(false);
    const [viewIFrame, setViewIFrame] = useState<string>("");
    const [webViewLoading, setWebViewLoading] = useState(false);
    const [webViewSetPinLoading, setWebViewSetPinLoading] = useState(false);
    const [setPinIFrame, setSetPinIFrame] = useState<string>("");
    const subScreens = useSelector((state: any) => state.userReducer?.screenPermissions);

    const cardPermissions = subScreens?.Cards?.permissions;
    const canShowMyCards = cardPermissions?.tabs?.find((tab: any) => tab.name?.replaceAll(/\s/g, '')?.toLowerCase() === "mycards")?.actions;
    const canShowWithdraw = canShowMyCards?.find((action: any) => action?.icon?.toLowerCase() === "withdraw-permission")?.isEnabled;
    const canShowActivateCard = canShowMyCards?.find((action: any) => action?.icon?.toLowerCase() === "activatecard-permission")?.isEnabled;
    const [state, setState] = useState({
        errorMsg: "",
        initialRouteCardId: cardDetails?.cardId || null,
        componentIsLoading: true,
        activeCardDetailsLoading: false,
        CardsInfoData: {} as any,
        bindCardData: {} as any,
        recentTranscationReload: false,
        RbSheetTittle: "Manage Card",
        isFreezeSheet: false,
        mangeCardSheet: false,
        isCardInfoSheet: false,
        isSetPinSheet: false,
        isLimitSheet: false,
        isTopUpSheet: false,
        isActivateCardSheet: false,
        isGeneralCardInfoSheet: false,
        buttonLoader: false,
        cardSuportedPlatForms: [] as any[],
        rbSheetErrorMsg: '',
        networkData: [] as any,
        currencyCode: [] as any,
        selectedCurrency: "",
        selectedNetwork: "",
        topupBalanceInfo: {} as any,
        topUpAmount: '' as any,
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
        allMyCardsList: [] as CardList[],
        activeCardId: cardDetails?.cardId || "",
        carouselActiveIndex: 0,
        otherAvailableCards: [] as CardList[],
        otherAvailableCardsLoading: false,
        isBindSuccessSheet: false,
        bindSuccessCardName: '',
        lastToppedUpCardId: '',
        cardListLoading: false,
        cardDetailsFailed: false,
        isAssignCardSheet: false,
        assignCardEmployees: [] as Employee[],
        assignCardLoading: false,
        assignCardError: '',
        selectedAssignEmployee: null as Employee | null,
        isAsignEmployeeLoading: false,
        withdrawErrorMsg: "",
        isWalletInstructionsSheet: false,
        walletType: "apple" as "apple" | "google",
        activateCardDetails: [],
        fieldsLoading: false,
    });
    const currency = getTabsConfigation('CURRENCY')
    const initialCardLoadedRef = useRef<boolean>(false);

    const getSupportedPlatforms = async (programId?: string) => {
        try {
            const response = await CardsModuleService.getSupportedPlatforms(programId);
            if (response?.ok && response?.data) {
                let platforms = response.data;
                if (typeof platforms === 'string') {
                    try {
                        platforms = JSON.parse(platforms);
                    } catch {
                        platforms = (platforms as string)?.split(',').map((p: string) => p.trim()).filter((p: string) => p.length > 0);
                    }
                }
                setSupportedPlatforms(Array.isArray(platforms) ? platforms : []);
            } else {
                setSupportedPlatforms([]);
            }
        } catch (error) {
            setSupportedPlatforms([]);
        }
    };

    const handlePinChange = (value: string, index: number) => {
        const newPin = [...pin];
        newPin[index] = value;
        setPin(newPin);
        if (value && index < 3) {
            pinInputRefs.current[index + 1]?.focus();
        }
        if (!value && index > 0) {
            pinInputRefs.current[index - 1]?.focus();
        }
    };
    const updateState = (newState: Partial<typeof state>) => {
        setState(prev => ({ ...prev, ...newState }));
    };

    useHardwareBackHandler(() => {
        backArrowButtonHandler()
    })
    useEffect(() => {
        const routeCardId = cardDetails?.cardId;
        const prevIsSuccessSheet = prevIsSuccessSheetRef.current;
        const prevIsBindSuccessSheet = prevIsBindSuccessSheetRef.current; // Get previous bind success state
        if (isFocused) {
            scrollViewRef?.current?.scrollTo({ y: 0, animated: false });
            const justClosedSuccessSheet = prevIsSuccessSheet === true && state.isSuccessSheet === false;
            const justClosedBindSuccessSheet = prevIsBindSuccessSheet === true && state.isBindSuccessSheet === false; // Check if bind success sheet just closed

            if (state.isSuccessSheet) {
                prevIsSuccessSheetRef.current = state.isSuccessSheet;
                prevIsBindSuccessSheetRef.current = state.isBindSuccessSheet;
                return;
            }
            if (!hasInitializedRef.current) {
                if (routeCardId) {
                    updateState({ componentIsLoading: true, initialRouteCardId: routeCardId, activeCardId: "" });
                    fetchAllMyCardsAndSetActive(routeCardId);
                } else if (state.initialRouteCardId) {
                    updateState({ componentIsLoading: true, initialRouteCardId: state.initialRouteCardId, activeCardId: "" });
                    fetchAllMyCardsAndSetActive(state.initialRouteCardId);
                }
                hasInitializedRef.current = true;
            } else if (!justClosedSuccessSheet) {
                if (state.initialRouteCardId) {
                    if (state.activeCardId !== state.initialRouteCardId) {
                        const cardToReactivate = state.allMyCardsList.find(c => c.id === state.initialRouteCardId);
                        if (cardToReactivate) {
                            updateState({
                                activeCardId: state.initialRouteCardId,
                                carouselActiveIndex: state.allMyCardsList.findIndex(c => c.id === state.initialRouteCardId)
                            });
                            fetchCardInfoDataForActiveCard(state.initialRouteCardId, true);
                            fetchOtherCardsList(state.initialRouteCardId);
                        } else {
                            updateState({ componentIsLoading: true, activeCardId: "" });
                            fetchAllMyCardsAndSetActive(state.initialRouteCardId);
                        }
                    } else {
                        fetchCardInfoDataForActiveCard(state.activeCardId, true);
                        fetchOtherCardsList(state.activeCardId);
                    }
                } else if (state.activeCardId) {
                    fetchCardInfoDataForActiveCard(state.activeCardId, true);
                    fetchOtherCardsList(state.activeCardId);
                }
            }
            if (justClosedBindSuccessSheet) {
                fetchCardInfoDataForActiveCard(state.activeCardId, true);
            }
        }
        prevIsSuccessSheetRef.current = state.isSuccessSheet;
        prevIsBindSuccessSheetRef.current = state.isBindSuccessSheet;
    }, [isFocused, cardDetails?.cardId, state.isSuccessSheet, state.isBindSuccessSheet]);


    const fetchAllMyCardsAndSetActive = async (initialCardIdToActivate: string) => {
        if (!userInfo?.accountType || !initialCardIdToActivate) {
            updateState({ componentIsLoading: false, cardListLoading: false, errorMsg: "User account type or Card ID missing." });
            return;
        }
        updateState({ componentIsLoading: true, cardListLoading: true, errorMsg: "" });
        try {
            const response = await CardsModuleService.getAllMyCards(userInfo.accountType, 50, 1, false); // Fetch a larger list for carousel
            if (response && Array.isArray(response.data)) {
                const allCards: CardList[] = response.data;
                if (allCards.length > 0) {
                    let preferredCardId = state.lastToppedUpCardId || state.activeCardId || initialCardIdToActivate;
                    let activeIdx = allCards.findIndex(card => card.id === preferredCardId);
                    if (activeIdx === -1) {
                        activeIdx = allCards.findIndex(card => card.id === initialCardIdToActivate);
                        if (activeIdx === -1) activeIdx = 0;
                    }
                    const targetCardId = allCards[activeIdx].id;

                    updateState({
                        allMyCardsList: allCards,
                        activeCardId: targetCardId,
                        initialRouteCardId: targetCardId,
                        carouselActiveIndex: activeIdx,
                        cardsDetails: {},
                        cardListLoading: false,
                    });
                    fetchCardInfoDataForActiveCard(targetCardId);
                    initialCardLoadedRef.current = true;
                } else {
                    updateState({ allMyCardsList: [], activeCardId: "", CardsInfoData: {}, cardListLoading: false, errorMsg: "No cards found." });
                }
            } else {
                updateState({ allMyCardsList: [], activeCardId: "", CardsInfoData: {}, cardListLoading: false, errorMsg: isErrorDispaly(response) || "Failed to load cards." });
            }
        } catch (error) {
            updateState({ allMyCardsList: [], activeCardId: "", CardsInfoData: {}, cardListLoading: false });
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
        if (!isRefresh) { // Only show loader if not a silent refresh
            updateState({ activeCardDetailsLoading: true, cardDetailsFailed: false });
        }
        try {
            const response: any = await CardsModuleService.CardInfo(cardIdToFetch);
            if (response.ok) {
                updateState({ CardsInfoData: response?.data || {}, activeCardId: cardIdToFetch, cardDetailsFailed: false, cardSuportedPlatForms: response?.data?.platforms });
                // Call getSupportedPlatforms with programId from response
                if (response?.data?.programId) {
                    getSupportedPlatforms(response.data.programId);
                }
            } else {
                updateState({ CardsInfoData: {}, cardDetailsFailed: true, errorMsg: `Failed to load details for card ${cardIdToFetch}: ${isErrorDispaly(response)}` });
            }
        } catch (error) {
            updateState({ CardsInfoData: {}, cardDetailsFailed: true, errorMsg: `Error loading details for card ${cardIdToFetch}: ${isErrorDispaly(error)}` });
        } finally {
            updateState({ activeCardDetailsLoading: false });
        }
    }

    const getCardViewIframe = async (cardIdToFetch: string) => {
        setWebViewLoading(true);
        try {
            const response: any = await CardsModuleService.getViewIframe(cardIdToFetch);
            if (response?.ok) {
                setWebViewLoading(false);
                setViewIFrame(response?.data)
            } else {
                setWebViewLoading(false);
            }
        } catch (error) {
            setWebViewLoading(false);

        }
    }

    const handleCardStatus = async () => {
        updateState({ buttonLoader: true, rbSheetErrorMsg: "" });
        const action = isCardFreezed ? "unfreeze" : "freeze";
        const obj = {
            id: state.activeCardId,
        };

        try {
            const response: any = await CardsModuleService.saveFreezeUnFreeze(state.activeCardId, action, obj);
            if (response.ok) {
                triggerSheetClose();
                showAppToast(isCardFreezed ? t("GLOBAL_CONSTANTS.CARD_HAS_BEEN_UNFROZEN_SUCCESSFULLY") : t("GLOBAL_CONSTANTS.CARD_HAS_BEEN_FROZEN_SUCCESSFULLY"), "success");
                await fetchCardInfoDataForActiveCard(state.activeCardId, true);
                await fetchAllMyCardsAndSetActive(state.activeCardId)
            } else {
                updateState({ rbSheetErrorMsg: isErrorDispaly(response) });
            }
        } catch (error) {
            updateState({ rbSheetErrorMsg: isErrorDispaly(error) });
        } finally {
            updateState({ buttonLoader: false });
        }
    }
    const getTopupbalance = async () => {
        try {
            const res = await CardsModuleService.getCardTopupBalance(state.activeCardId); // Use active card ID
            if (res.ok) {
                updateState({ topupBalanceInfo: res?.data });
            } else {
                updateState({ rbSheetErrorMsg: isErrorDispaly(res) });
            }
        } catch (error) {
            updateState({ rbSheetErrorMsg: isErrorDispaly(error) });

        }
    }
    const handleSetPinConfirm = async () => {
        updateState({ buttonLoader: true, rbSheetErrorMsg: "" });

        const finalPin = pin.join('');
        if (finalPin.length < 4) {
            updateState({
                rbSheetErrorMsg: "Please enter a complete 4-digit PIN",
                buttonLoader: false
            });
            return;
        }
        let obj = {
            id: state.activeCardId,
            status: 1,
            actionBy: "Set Pin",
            pin: pin
        };

        try {
            const res: any = await CardsModuleService.saveResetPin(userInfo?.id, state.activeCardId, obj);
            if (res.ok) {
                rbSheetRef.current?.close();
                updateState({
                    isSheetOpen: true,
                });
            } else {
                updateState({ rbSheetErrorMsg: isErrorDispaly(res) });
            }
        } catch (error) {
            updateState({ rbSheetErrorMsg: isErrorDispaly(error) });
        } finally {
            updateState({ buttonLoader: false });
        }
    }
    const saveTopUp = async (formikValues: any) => {
        logEvent("Button Pressed", { action: "Card Topup", currentScreen: "Card Info", nextScreen: "Card Topup Success" })
        updateState({ buttonLoader: true });
        updateState({ rbSheetErrorMsg: '', lastToppedUpCardId: state.activeCardId }); // Track the card being topped up
        try {
            // const selectedNet = state.networkData.find((net: any) => net.network === formikValues.network);
            // const networkBalance = selectedNet?.amount || 0;
            const selectedCoin = state.currencyCode.find((coin: any) => coin.currencyCode === formikValues?.currency);
            const selectedCoinBalance = selectedCoin?.amount || 0;
            if (selectedCoinBalance < state.topUpAmount) {
                updateState({
                    rbSheetErrorMsg: "You don't have sufficient balance",
                    buttonLoader: false
                });
                return;
            }
            const Obj: CardTopUpList = {
                amount: formikValues.amount,
                cryptoWalletId: state.currencyCode.find((coin: any) => coin.currencyCode === formikValues.currency)?.id || null,
                programId: state.activeCardId,
                concurrencyStamp: state?.topupBalanceInfo?.concurrencyStamp
            }
            const res = await CardsModuleService.saveDeposit(Obj);
            if (res.ok) {
                handleSuccess(formikValues.totalAmount, formikValues.currency);
            } else {
                updateState({ rbSheetErrorMsg: isErrorDispaly(res) });
            }
        } catch (error) {
            updateState({ rbSheetErrorMsg: isErrorDispaly(error) });
        }
        finally {
            updateState({ buttonLoader: false });
        }
    };




    const _handleSheetDidCloseAndResetState = () => {
        const wasSuccessSheet = state.isSuccessSheet;
        const lastToppedUpCardId = state.lastToppedUpCardId;
        let newActiveCardId = state.activeCardId;
        let newCarouselIndex = state.carouselActiveIndex;
        if (wasSuccessSheet && lastToppedUpCardId) {
            newActiveCardId = lastToppedUpCardId;
            const idx = state.allMyCardsList.findIndex(c => c.id === lastToppedUpCardId);
            if (idx !== -1) newCarouselIndex = idx;
        }
        setViewIFrame("");
        setSetPinIFrame("");
        updateState({
            isFreezeSheet: false,
            isCardInfoSheet: false,
            isSetPinSheet: false,
            isLimitSheet: false,
            isTopUpSheet: false,
            isActivateCardSheet: false,
            isGeneralCardInfoSheet: false,
            isSheetOpen: false,
            RbSheetTittle: "Manage Card",
            rbSheetErrorMsg: '',
            isBindCardSheet: false,
            isSuccessSheet: false,
            topUpAmount: null,
            isBindSuccessSheet: false,
            bindSuccessCardName: '',
            isCardDetailsSheet: false,
            lastToppedUpCardId: '',
            activeCardId: newActiveCardId,
            carouselActiveIndex: newCarouselIndex,
        });
        if (wasSuccessSheet) {
            updateState({ activeCardDetailsLoading: true });
            fetchCardInfoDataForActiveCard(newActiveCardId, true);
        }
    };

    const triggerSheetClose = () => {
        rbSheetRef.current?.close();

    };
    const closeBindSuccessSheet = () => {
        rbSheetRef.current?.close();
        props?.navigation.navigate("Dashboard")
    }

    const openSheet = (title: string, flags: Partial<typeof state>) => {
        updateState({
            RbSheetTittle: title,
            isFreezeSheet: false,
            isCardInfoSheet: false,
            isSetPinSheet: false,
            isLimitSheet: false,
            isTopUpSheet: false,
            isActivateCardSheet: false,
            isWithdrawSheet: false,
            mangeCardSheet: false,
            rbSheetErrorMsg: '',
            isBindCardSheet: false,
            isSheetOpen: true,
            isSuccessSheet: false,
            isCardDetailsSheet: false,
            isGeneralCardInfoSheet: false,
            isBindSuccessSheet: false,
            isAssignCardSheet: false,
            assignCardEmployees: [],
            assignCardError: '',
            selectedAssignEmployee: null,
            ...flags
        });
        setPin(['', '', '', '']);
        setTimeout(() => {
            rbSheetRef.current?.open();
        });
    };
    const handleFreeze = () => openSheet((state.CardsInfoData?.state !== "Freezed" && "Freeze Card") || "Unfreeze Card", { isFreezeSheet: true });
    const handlePin = async () => {
        //  if (state.CardsInfoData?.cardViewFlow?.toLowerCase() === "iframe" && !viewIFrame) {
        //     await getCardViewIframe(idToFetch);
        // }
        props?.navigation.navigate("cardSetPin", { CardsInfoData: state.CardsInfoData, cardId: state.activeCardId });
    };

    const handleViewCardDetails = async (cardId?: string) => {
        const idToFetch = cardId || state.activeCardId;
        const detailsHasId = state.cardsDetails && typeof state.cardsDetails === 'object' && 'id' in state.cardsDetails;
        if (!detailsHasId || (state.cardsDetails as any).id !== idToFetch) {
            await getCardsByIds(idToFetch);
        }
        if (state.CardsInfoData?.cardViewFlow?.toLowerCase() === "iframe" && !viewIFrame) {
            await getCardViewIframe(idToFetch);
        }
        openSheet("GLOBAL_CONSTANTS.CARD_DETAILS", { isCardDetailsSheet: true });
    };
    const handleLimit = async () => {
        // await getTopupbalance();
        // openSheet("GLOBAL_CONSTANTS.LIMIT", { isLimitSheet: true });

        props?.navigation.navigate("setLimits", { cardLimitTypes: state.CardsInfoData?.cardLimitTypes, cardId: state.activeCardId, cardInfoData: state.CardsInfoData });
    };
    const handleBindCard = () => props?.navigation.navigate("bindCard", { cardId: state.lastToppedUpCardId || state.activeCardId, programId: state.CardsInfoData?.programId });
    const handleSuccess = (totalAmount: number, currency: string) => {
        const cardId = state.lastToppedUpCardId || state.activeCardId;
        const card = state.allMyCardsList.find((c: any) => c.id === cardId);
        updateState({
            successAmount: totalAmount,
            successCurrency: currency,
            successCardName: card?.cardName || state.CardsInfoData?.name,
        });
        openSheet("Success", { isSuccessSheet: true });
    };
    const handleCardInfo = () => {
        openSheet("GLOBAL_CONSTANTS.SUPPORTED_PLOTFORMS", { isCardInfoSheet: true });
    };
    const handleTopUp = () => {
        getCardsTopUpDetails();
        getTopupbalance()
        updateState({ topUpAmount: '' });
        openSheet("Top-Up", { isTopUpSheet: true });
    };

    const handleWithdraw = () => {
        if (state.CardsInfoData?.amount === 0) {
            updateState({ withdrawErrorMsg: t('GLOBAL_CONSTANTS.CARD_ZERO_BALANCE_ERROR') });
            // Scroll to top when error occurs
            scrollViewRef?.current?.scrollTo({ y: 0, animated: true });
            return;
        } else {
            props?.navigation.navigate("cardWithdraw", {
                cardId: state.activeCardId,
                CardsInfoData: state.CardsInfoData
            });
        }
    };

    const handleActivateCard = () => {
        getActivateCardDetails();
        openSheet("Activate-Card", { isActivateCardSheet: true });
    };

    const getActivateCardDetails = async () => {
        updateState({ errorMsg: "", rbSheetErrorMsg: "", fieldsLoading: true });
        try {
            const response: any = await CardsModuleService.getActivateCardFeilds(state?.CardsInfoData?.programId);
            if (response.ok) {
                const transformedData = response?.data?.map((field: any) => ({
                    ...field,
                    field: field.field.toLowerCase()
                })) ?? [];
                updateState({
                    activateCardDetails: transformedData,
                    fieldsLoading: false,
                });
            } else {
                updateState({ rbSheetErrorMsg: isErrorDispaly(response), fieldsLoading: false });
            }
        } catch (error) {
            updateState({ rbSheetErrorMsg: isErrorDispaly(error), fieldsLoading: false });
        }
    }

    // Handler for the new Card Info (name, type, currency, status)
    const handleDisplayCardBasicInfo = () => openSheet("Card Info", { isGeneralCardInfoSheet: true });

    const handleAssignCard = async () => {
        openSheet("GLOBAL_CONSTANTS.ASSIGN_CARD", { isAssignCardSheet: true });
        updateState({ assignCardLoading: true, assignCardError: '', assignCardEmployees: [] });
        try {
            const res = await CardsModuleService.getEmployeeLu();
            if (res.ok && Array.isArray(res.data)) {
                updateState({ assignCardEmployees: res.data, assignCardLoading: false });
            } else {
                updateState({ assignCardError: isErrorDispaly(res), assignCardLoading: false });
            }
        } catch (error) {
            updateState({ assignCardError: isErrorDispaly(error), assignCardLoading: false });
        }
    };
    const handleCloseAssignCardSheet = () => {
        updateState({ isAssignCardSheet: false, assignCardEmployees: [], assignCardError: '' });
    };
    const handleConfirmAssignCard = async (employee?: Employee) => {
        const selectedEmp = employee || state.selectedAssignEmployee;

        if (!selectedEmp) {
            updateState({ assignCardError: "Please select an employee" });
            return;
        }

        if (!state.CardsInfoData?.programId) {
            updateState({ assignCardError: "Card program information not found" });
            return;
        }

        updateState({ isAsignEmployeeLoading: true, assignCardError: "" });
        let obj = {
            cardId: state?.CardsInfoData?.id,
            programId: state?.CardsInfoData?.programId,
            employeeId: selectedEmp?.id ?? ""
        };
        try {
            const response = await CardsModuleService.AssignCardSave(obj);
            if (response.ok) {
                triggerSheetClose();
                fetchCardInfoDataForActiveCard(state.activeCardId, true);
            } else {
                const errorMsg = isErrorDispaly(response);
                updateState({ assignCardError: errorMsg || "Failed to assign card" });
            }
        } catch (error) {
            updateState({ isAsignEmployeeLoading: false, assignCardError: isErrorDispaly(error) || "Network error occurred" });
        } finally {
            updateState({ isAsignEmployeeLoading: false });
        }
    };

    const backArrowButtonHandler = () => {
        if (cardDetails?.actionType) {
            props?.navigation.navigate("Dashboard", { initialTab: "GLOBAL_CONSTANTS.CARDS", animation: 'slide_from_left' });
        } else {
            props?.navigation.goBack();
        }
    };

    const handleRecentTranscationReloadDetails = (reload: boolean) => {
        updateState({ recentTranscationReload: true });
    };


    const handleSendAmountChange = (value: string, setFieldValue: (field: string, value: any) => void) => {
        updateState({
            rbSheetErrorMsg: ""
        });
        const parsedValue = parseFloat(value);
        updateState({
            topUpAmount: isNaN(parsedValue) ? null : parsedValue,
        });
        setFieldValue('amount', isNaN(parsedValue) ? null : parsedValue);
        fetchDepositFeeComission(isNaN(parsedValue) ? null : parsedValue)
    };
    const fetchDepositFeeComission = async (topupAmount?: any) => {
        const cardId = state.activeCardId;
        updateState({
            feeComissionLoading: true,
            rbSheetErrorMsg: ""
        });
        try {
            if (parseFloat(topupAmount) >= parseFloat(state?.topupBalanceInfo?.minLimit)) {
                const response: any = await CardsModuleService.getDepositFeeComission(topupAmount || 0, cardId, state?.selectedCurrency);
                if (response?.ok) {
                    updateState({
                        feeComissionData: response?.data,
                        rbSheetErrorMsg: ""
                    });
                } else {
                    updateState({
                        rbSheetErrorMsg: (isErrorDispaly(response)),
                        feeComissionData: {}
                    });
                };
            }
            else {
                updateState({
                    feeComissionData: {}
                });
            }

        } catch (error) {
            updateState({
                rbSheetErrorMsg: (isErrorDispaly(error))
            });
        }
        finally {
            updateState({
                feeComissionLoading: false
            });
        }
    };
    const handleMaxValue = (setFieldValue: (field: string, value: any) => void) => {
        if (state.topupBalanceInfo?.maxLimit == null) {
            return;
        }
        const inputValueNumber = parseFloat(state.topupBalanceInfo.maxLimit);
        const calculatedResult = inputValueNumber * 1;
        const fixedResult = calculatedResult.toFixed(2);
        updateState({ topUpAmount: parseFloat(fixedResult) });
        setFieldValue('amount', fixedResult);
        fetchDepositFeeComission(parseFloat(fixedResult));
    };
    const handleMinValue = (setFieldValue: (field: string, value: any) => void) => {
        if (state.topupBalanceInfo?.minLimit == null) {
            return;
        }
        const inputValueNumber = parseFloat(state.topupBalanceInfo?.minLimit || '0');
        const calculatedResult = inputValueNumber * 1;
        const fixedResult = calculatedResult.toFixed(2);
        updateState({ topUpAmount: parseFloat(fixedResult) });
        setFieldValue('amount', fixedResult);
        fetchDepositFeeComission(parseFloat(fixedResult)); // Add this line
    };
    const handleSelectCurrency = (value: any) => {
        // getNetworkLookUps(value?.currencyCode)
        updateState({
            selectedCurrency: value?.currencyCode || "",
        });
    };
    const handleSelectNetwork = (value: any) => {
        updateState({
            selectedNetwork: value?.network || ""
        });
    };

    const handleRbSheetErrorMsgClose = () => {
        updateState({ rbSheetErrorMsg: '' });
    };
    const getCardsTopUpDetails = async () => {
        updateState({ errorMsg: "" });
        updateState({ rbSheetErrorMsg: "" });
        try {
            const response: any = await CardsModuleService.getCoins(state?.CardsInfoData?.programId);
            if (response.ok && response.data && response.data.length > 0) {
                updateState({
                    currencyCode: response?.data ?? [],
                });
                handleSelectCurrency({ currencyCode: response?.data[0]?.currencyCode });
            } else {
                updateState({ rbSheetErrorMsg: isErrorDispaly(response) });
            }
        } catch (error) {
            updateState({ rbSheetErrorMsg: isErrorDispaly(error) });
        }
    }
    const getNetworkLookUps = async (currencyCode: string) => {
        updateState({ rbSheetErrorMsg: "" });
        try {
            const response: any = await CardsModuleService.getNetworkLookup(currencyCode, state?.CardsInfoData?.programId);
            if (response?.ok) {
                updateState({
                    networkData: response?.data ?? [],
                    selectedNetwork: response?.data[0]?.network ?? "" // Default to first network of the currency
                });
            } else {

                updateState(isErrorDispaly(response));
            }
        } catch (error) {
            updateState(isErrorDispaly(error));
        }
    };


    const getCardsByIds = async (cardIdToFetch: string) => {
        if (!cardIdToFetch) return;
        updateState({
            errorMsg: '',
        });
        try {
            const response: any = await CardsModuleService.getCardsById(cardIdToFetch);
            if (response.ok) {
                updateState({
                    cardsDetails: response?.data,
                });
            }
            else {
                updateState({
                    errorMsg: (isErrorDispaly(response))
                });
            }
        } catch (error) {
            updateState({
                errorMsg: (isErrorDispaly(error))
            });
        }
    };
    // Example mapping
    const SHEET_HEIGHTS: Record<string, "Small" | "Medium" | "Large" | "Extra Large"> = {
        "Manage Card": "Small",
        "GLOBAL_CONSTANTS.SUPPORTED_PLOTFORMS": "Medium",
        "Freeze Card": "Medium",
        "Unfreeze Card": "Medium",
        "GLOBAL_CONSTANTS.SET_PIN": "Large",
        "GLOBAL_CONSTANTS.LIMIT": (state?.topupBalanceInfo?.minLimit && state?.topupBalanceInfo?.maxLimit) ? "Medium" : "Small",
        "Top-Up": "Large",
        "Bind Card": "Large",
        "Success": "Large",
        "Card Info": "Medium",
        "GLOBAL_CONSTANTS.CARD_DETAILS": "Medium",
        "Bind Success": "Medium",
        "GLOBAL_CONSTANTS.ASSIGN_CARD": "Medium",
        "Activate-Card": "Large",
    };
    const getSheetHeight = (title: string, errorMsg: string): "Small" | "Medium" | "Large" | "Extra Large" => {
        return SHEET_HEIGHTS[title] || "Medium";
    };
    const isCardFreezed = state.CardsInfoData?.state?.toLowerCase() === "freezed";
    const renderCarouselCard = (item: CardList, index: number, calculatedItemWidth: number, calculatedItemHeight: number) => {
        return (
            <ImageBackgroundWrapper
                source={{ uri: item?.image }}
                resizeMode="cover"
                imageStyle={[commonStyles.rounded12]}
                style={[commonStyles.rounded12, { width: calculatedItemWidth, height: calculatedItemHeight }]}
            >
                <ViewComponent style={[commonStyles.p16, commonStyles.justifyContent, commonStyles.flex1]}>
                    {/* <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent]}>
                        <ViewComponent style={{ width: s(60), height: s(20) }}>
                            {item.cardName?.toLowerCase()?.replaceAll(" ", "") === 'abcvirtualcard' ? (
                                <ImageUri width={s(60)} height={s(25)} uri={CARD_URIS.rapizdark} />
                            ) : (
                                <ImageUri width={s(60)} height={s(25)} uri={CARD_URIS.rapizdark} />
                            )}
                        </ViewComponent>
                        <ParagraphComponent
                            text={item?.type}
                            style={[commonStyles.cardname, item.cardName?.toLowerCase()?.replaceAll(" ", "") === 'abcvirtualcard' ? commonStyles.textAlwaysWhite : commonStyles.textAlwaysWhite]}
                        />
                    </ViewComponent> */}
                    <ViewComponent style={[commonStyles.dflex, commonStyles.justifyend, commonStyles.alignCenter, commonStyles.gap10]}>
                        {/* <ViewComponent>
                            <ParagraphComponent
                                text={item?.number ? hideDigitBeforLast(item?.number.replace(/\d{4}(?=.)/g, "$& ")) : ''}
                                style={[commonStyles.cardnumber, item.cardName?.toLowerCase()?.replaceAll(" ", "") === 'abcvirtualcard' ? commonStyles.textAlwaysWhite : commonStyles.textAlwaysWhite]}
                            />
                        </ViewComponent> */}
                        {item.status && (
                            <View >
                                <ParagraphComponent
                                    text={statusIconMap[item?.status?.toLowerCase()]} style={[commonStyles.cardstatus, { color: statusColor[item?.status?.toLowerCase()] },
                                    ]}
                                    numberOfLines={1}
                                />
                            </View>
                        )}
                    </ViewComponent>

                    {/* <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.mt24]}>
                        <ViewComponent>
                            <TextMultiLangauge text={"GLOBAL_CONSTANTS.CURRENCY"} style={[commonStyles.Cardcurrencylabel, item.cardName?.toLowerCase()?.replaceAll(" ", "") === 'abcvirtualcard' ? commonStyles.textAlwaysWhite : commonStyles.textAlwaysWhite]} />
                            <ParagraphComponent text={item?.currency}
                                style={[commonStyles.cardcurrency, item.cardName?.toLowerCase()?.replaceAll(" ", "") === 'abcvirtualcard' ? commonStyles.textAlwaysWhite : commonStyles.textAlwaysWhite]} />
                        </ViewComponent>
                        <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent]}>
                            {item.cardName?.toLowerCase()?.replaceAll(" ", "") === 'abcvirtualcard' ?
                                <ImageUri width={s(60)} height={s(25)} uri={CARD_URIS.visadark} />
                                : <ImageUri width={s(60)} height={s(25)} uri={CARD_URIS.visadark} />
                            }
                        </ViewComponent>
                    </ViewComponent> */}
                </ViewComponent>
            </ImageBackgroundWrapper>
        );
    };

    const handleOnRefresh = async () => {
        await fetchCardInfoDataForActiveCard(state.activeCardId, true);
        await fetchAllMyCardsAndSetActive(state.activeCardId)
    };

    const handleCloseAssignError = () => {
        updateState({ assignCardError: '' });
    };
    // const isPhysicalCardNotOnHand = state?.CardsInfoData?.type?.toLowerCase() === 'physical' && state?.CardsInfoData?.iHaveCard === false;
    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            {state.componentIsLoading && (
                <SafeAreaView style={[commonStyles.flex1, commonStyles.alignCenter, commonStyles.justifyCenter]}>
                    <DashboardLoader />
                </SafeAreaView>
            )}
            {!state.componentIsLoading && <Container style={[commonStyles.container]} >
                <PageHeader title={"GLOBAL_CONSTANTS.CARDS_INFO"} onBackPress={backArrowButtonHandler} />
                <ScrollViewComponent ref={scrollViewRef}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    refreshing={refresh} onRefresh={handleOnRefresh}
                >
                    {state.withdrawErrorMsg && (
                        <ErrorComponent
                            message={state.withdrawErrorMsg}
                            onClose={() => updateState({ withdrawErrorMsg: "" })}
                        />
                    )}

                    <View >

                        {!state?.componentIsLoading && state?.allMyCardsList?.length > 0 && (
                            <View>
                                <View style={[commonStyles.sectionGap]}>
                                    <CardCarousel
                                        data={state?.allMyCardsList}
                                        renderItem={renderCarouselCard}
                                        keyExtractor={(item) => item.id.toString()}
                                        height={TARGET_CAROUSEL_ITEM_HEIGHT + SPACE_FOR_DOTS}
                                        onActiveCardChange={(newCard) => {
                                            if (initialCardLoadedRef.current) {
                                                initialCardLoadedRef.current = false;
                                                return;
                                            }
                                            updateState({ activeCardId: newCard.id });
                                            fetchCardInfoDataForActiveCard(newCard.id);
                                            // Get programId from card data and call getSupportedPlatforms
                                            const cardData = state.allMyCardsList.find(c => c.id === newCard.id);
                                            if ((cardData as any)?.programId) {
                                                getSupportedPlatforms((cardData as any).programId);
                                            }
                                        }}
                                        initialScrollIndex={state.carouselActiveIndex >= 0 && state.carouselActiveIndex < state.allMyCardsList.length ? state.carouselActiveIndex : 0}
                                    />
                                </View>
                                {state.activeCardDetailsLoading && <Loadding contenthtml={cardsInfoDetails()} />}

                                {state.activeCardDetailsLoading && state.cardDetailsFailed && (
                                    <NoDataComponent />
                                )}

                                {/* {(!state.activeCardDetailsLoading && (!state.cardDetailsFailed && !isPhysicalCardNotOnHand)) &&  For every provider we are activate card is asking*/}
                                {(!state.activeCardDetailsLoading && (!state.cardDetailsFailed)) &&
                                    <ViewComponent>
                                        {!state.activeCardDetailsLoading && state.CardsInfoData?.state?.toLowerCase() !== "pending" && state.CardsInfoData?.state?.toLowerCase() !== "card activating" && Object.keys(state.CardsInfoData).length > 0 && (
                                            <ViewComponent style={[commonStyles.sectionGap]}>
                                                <TextMultiLangauge style={[commonStyles.transactionamounttextlabel,]} text={"GLOBAL_CONSTANTS.TOTAL_AVILABLE_BALANCE"} />
                                                <CurrencyText prifix={currency[userInfo?.currency]} value={state.CardsInfoData?.amount} style={[commonStyles.transactionamounttext, commonStyles.mt4]} smallDecimal={isDecimalSmall} />
                                            </ViewComponent>
                                        )}
                                        <ViewComponent />
                                        {!state.activeCardDetailsLoading && (() => {
                                            const isApproved = state.CardsInfoData?.state == CARDS_CONST.APPROVE && state.CardsInfoData?.state !== "Pending" && state.CardsInfoData?.state?.toLowerCase() !== "cardbinding" && state.CardsInfoData?.state?.toLowerCase() !== "reviewing";
                                            const isFreezed = state.CardsInfoData?.state?.toLowerCase() === "freezed";

                                            const showView = isApproved;
                                            const showTopUp = isApproved && !state?.CardsInfoData?.isCompanyCard;
                                            const showFreeze = isApproved || isFreezed;

                                            const onlyFreezeVisible = !showView && !showTopUp && showFreeze;
                                            return (
                                                <ViewComponent>
                                                    <ViewComponent
                                                        style={[
                                                            commonStyles.quicklinksgap,
                                                            (showView || isFreezed) ? commonStyles.sectionGap : null,
                                                            onlyFreezeVisible && { justifyContent: "center" } // center when it's the only one
                                                        ]}
                                                    >
                                                        {showView && (
                                                            <ViewComponent style={[!onlyFreezeVisible && commonStyles.quicklinksflex]}>
                                                                <ActionButton
                                                                    text={"GLOBAL_CONSTANTS.VIEW"}
                                                                    onPress={() => handleViewCardDetails(state.activeCardId)}
                                                                    useGradient
                                                                    disable={isCardFreezed}
                                                                    customTextColor={NEW_COLOR.TEXT_ALWAYS_WHITE}
                                                                    customIcon={
                                                                        state?.isCardDetailsSheet
                                                                            ? <FontAwesome5 name="eye-slash" size={s(20)} color={NEW_COLOR.TEXT_ALWAYS_WHITE} />
                                                                            : <AntDesignExpo name={"eyeo"} size={s(20)} color={NEW_COLOR.TEXT_ALWAYS_WHITE} />
                                                                    }
                                                                />
                                                            </ViewComponent>
                                                        )}

                                                        {(showTopUp && JSON.parse(state.CardsInfoData?.transactionAdditionalFields || '{}')?.WalletType?.toLowerCase() == "topup") && (
                                                            <ViewComponent style={[!onlyFreezeVisible && commonStyles.quicklinksflex]}>
                                                                <ActionButton
                                                                    text={"GLOBAL_CONSTANTS.TOP_UP"}
                                                                    onPress={handleTopUp}
                                                                    customTextColor={NEW_COLOR.BUTTON_TEXT}
                                                                    customIcon={<TopUpIcon />}
                                                                    disable={isCardFreezed}
                                                                />
                                                            </ViewComponent>
                                                        )}


                                                        {showFreeze && (
                                                            <ViewComponent
                                                                style={[
                                                                    !onlyFreezeVisible && commonStyles.quicklinksflex,
                                                                    onlyFreezeVisible && { alignItems: "center", width: "auto" } // ensure true centering
                                                                ]}
                                                            >
                                                                <ActionButton
                                                                    text={isFreezed ? "GLOBAL_CONSTANTS.UN_FREEZED" : "GLOBAL_CONSTANTS.FREEZED"}
                                                                    onPress={handleFreeze}
                                                                    customTextColor={NEW_COLOR.BUTTON_TEXT}
                                                                    customIcon={<FreezeIcon width={s(22)} height={s(22)} color={NEW_COLOR.BUTTON_TEXT} />}

                                                                />
                                                            </ViewComponent>
                                                        )}

                                                    </ViewComponent>
                                                </ViewComponent>
                                            );
                                        })()}

                                        {!state.activeCardDetailsLoading && state.CardsInfoData?.state !== "Pending" && state.CardsInfoData?.state?.toLowerCase() !== "cardbinding" && <ParagraphComponent text={'Manage Card'} style={[commonStyles.sectionTitle, commonStyles.titleSectionGap]} />
                                        }
                                        {!state.activeCardDetailsLoading && ((state?.CardsInfoData?.setPinFlow?.toLowerCase() === "api" && state?.CardsInfoData?.cardSetPinAmountFee) || state?.CardsInfoData?.setPinFlow?.toLowerCase() === "iframe") && state.CardsInfoData?.type?.toLowerCase() == "physical" && (state.CardsInfoData?.state?.toLowerCase() === "approved" || state.CardsInfoData?.state?.toLowerCase() === "freezed") && (
                                            <>
                                                <CommonTouchableOpacity onPress={handlePin} disabled={isCardFreezed}>
                                                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10, commonStyles.listbannerbg]}> {/* Added marginBottom here */}
                                                        <ViewComponent style={[commonStyles.iconbg]}>
                                                            <SetPinIcon width={s(18)} height={s(18)} />
                                                        </ViewComponent>
                                                        <TextMultiLangauge text={"GLOBAL_CONSTANTS.SET_PIN"} style={[commonStyles.profilemenutext]} />
                                                    </ViewComponent>
                                                </CommonTouchableOpacity>
                                                <ViewComponent style={[commonStyles.listGap]} />
                                            </>
                                        )}

                                        {(state.CardsInfoData?.state == CARDS_CONST.APPROVE && (userInfo?.accountType == CARDS_CONST.BUSINESS && JSON.parse(state.CardsInfoData?.transactionAdditionalFields || '{}')?.IsCardAssignedValue === true)) &&
                                            <CommonTouchableOpacity onPress={handleAssignCard} style={[commonStyles.mb20]}>
                                                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10, commonStyles.listbannerbg]}>
                                                    <ViewComponent style={[commonStyles.iconbg]} >
                                                        <ManageCardIcon width={s(18)} height={s(18)} color={NEW_COLOR.TEXT_WHITE} />
                                                    </ViewComponent>
                                                    <TextMultiLangauge
                                                        text={"GLOBAL_CONSTANTS.ASSIGN_CARD"}
                                                        style={[
                                                            commonStyles.profilemenutext,
                                                        ]}
                                                    />
                                                </ViewComponent>
                                            </CommonTouchableOpacity>
                                        }



                                        {!state.activeCardDetailsLoading && state.CardsInfoData?.state !== "Pending" && state.CardsInfoData?.state?.toLowerCase() !== "cardbinding" && (
                                            <>
                                                <CommonTouchableOpacity onPress={handleDisplayCardBasicInfo} disabled={isCardFreezed}>
                                                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10, commonStyles.listbannerbg]}>
                                                        <ViewComponent style={[commonStyles.iconbg]} >
                                                            <AntDesignExpo name="infocirlceo" size={s(14)} color={NEW_COLOR.TEXT_WHITE} />
                                                        </ViewComponent>
                                                        <TextMultiLangauge
                                                            text={"GLOBAL_CONSTANTS.CARD_INFO"} // Or a more specific like "Card Details"
                                                            style={[
                                                                commonStyles.profilemenutext,
                                                            ]}
                                                        />
                                                    </ViewComponent>
                                                </CommonTouchableOpacity>
                                                <ViewComponent style={[commonStyles.listGap]} />
                                            </>
                                        )}
                                        {!state.activeCardDetailsLoading && canShowWithdraw && state.CardsInfoData?.state?.toLowerCase() === "approved" && (
                                            <>
                                                <CommonTouchableOpacity onPress={handleWithdraw} disabled={isCardFreezed}>
                                                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10]}>
                                                        <ViewComponent style={[commonStyles.iconbg]}>
                                                            <WithdrawIcon width={s(18)} height={s(18)} color={NEW_COLOR.TEXT_WHITE} />
                                                        </ViewComponent>
                                                        <TextMultiLangauge text={"GLOBAL_CONSTANTS.WITHDRAW"} style={[commonStyles.profilemenutext]} />
                                                    </ViewComponent>
                                                </CommonTouchableOpacity>
                                                <ViewComponent style={[commonStyles.listGap]} />
                                            </>
                                        )}
                                        {!state.activeCardDetailsLoading && canShowActivateCard && (state.CardsInfoData?.state?.toLowerCase() === "card activating") && (
                                            <>
                                                <CommonTouchableOpacity onPress={handleActivateCard} disabled={isCardFreezed}>
                                                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10]}>
                                                        <ViewComponent style={[commonStyles.iconbg]}>
                                                            <WithdrawIcon width={s(18)} height={s(18)} color={NEW_COLOR.TEXT_WHITE} />
                                                        </ViewComponent>
                                                        <TextMultiLangauge text={"GLOBAL_CONSTANTS.ACTIVATE_CARD"} style={[commonStyles.profilemenutext]} />
                                                    </ViewComponent>
                                                </CommonTouchableOpacity>
                                                <ViewComponent style={[commonStyles.listGap]} />
                                            </>
                                        )}
                                        {!state.activeCardDetailsLoading && state.CardsInfoData?.isLimitSet && state.CardsInfoData?.state?.toLowerCase() === "approved" &&
                                            <>
                                                <CommonTouchableOpacity onPress={handleLimit} disabled={isCardFreezed}  >
                                                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10, commonStyles.listbannerbg]}>
                                                        <ViewComponent style={[commonStyles.iconbg]} >
                                                            <LimitIcon width={s(18)} height={s(18)} />
                                                        </ViewComponent>
                                                        <TextMultiLangauge
                                                            text={"GLOBAL_CONSTANTS.LIMIT"}
                                                            style={[
                                                                commonStyles.profilemenutext
                                                            ]}
                                                        />
                                                    </ViewComponent>
                                                </CommonTouchableOpacity>
                                                <ViewComponent style={[commonStyles.listGap]} />

                                            </>
                                        }
                                        {!state.activeCardDetailsLoading && state.CardsInfoData?.state !== "Pending" && state.CardsInfoData?.state?.toLowerCase() !== "cardbinding" && supportedPlatforms?.length > 0 && <>
                                            <CommonTouchableOpacity onPress={handleCardInfo} disabled={isCardFreezed} >
                                                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10, commonStyles.listbannerbg]}> {/* Added marginBottom here */}
                                                    <ViewComponent
                                                        style={[commonStyles.quicklinks, commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter, commonStyles.iconbg]} >
                                                        <SupportedPlatform width={s(18)} height={s(18)} />
                                                    </ViewComponent>
                                                    <TextMultiLangauge
                                                        text={"GLOBAL_CONSTANTS.SUPPORTED_PLATFORM"}
                                                        style={[
                                                            commonStyles.profilemenutext,
                                                        ]}
                                                    />
                                                </ViewComponent>
                                            </CommonTouchableOpacity>
                                            <ViewComponent style={[commonStyles.sectionGap]} />
                                        </>}
                                    </ViewComponent>}

                                {!state.activeCardDetailsLoading && (() => {
                                    const cardInfo = state?.CardsInfoData;
                                    const cardState = cardInfo?.state?.toLowerCase();
                                    const cardType = cardInfo?.type?.toLowerCase();

                                    const showRecentTransactions =
                                        (cardInfo?.iHaveCard && ["pending", "reviewing", "approved"].includes(cardState)) ||
                                        (!cardInfo?.iHaveCard && cardType === "physical" && cardState === "approved") ||
                                        (cardType !== "physical" && cardState !== "pending") ||
                                        cardType === "virtual";

                                    return showRecentTransactions ? (
                                        <RecentTransactions
                                            cardId={state.activeCardId}
                                            accountType="CardsInfo"
                                            handleRecentTranscationReloadDetails={handleRecentTranscationReloadDetails}
                                        />
                                    ) : null;
                                })()}


                                {/* {!state.activeCardDetailsLoading && ((state.CardsInfoData?.state?.toLowerCase() == "cardbinding" && state.CardsInfoData?.type?.toLowerCase() == "physical") || (state.CardsInfoData?.iHaveCard == false && state.CardsInfoData?.state == "Pending" && state.CardsInfoData?.type?.toLowerCase() == "physical")) && <BindCardNote />}
                                <ViewComponent style={[commonStyles.sectionGap]}>
                                    {(
                                        ((!state.activeCardDetailsLoading && !state.CardsInfoData?.iHaveCard) && (state.CardsInfoData?.state == "Pending" && state.CardsInfoData?.type?.toLowerCase() == "physical"))
                                        || (!state.activeCardDetailsLoading && state.CardsInfoData?.state?.toLowerCase() == "cardbinding" && state.CardsInfoData?.type?.toLowerCase() == "physical")
                                    ) &&
                                        <ButtonComponent
                                            title={"GLOBAL_CONSTANTS.BIND_NOW"}
                                            onPress={handleBindCard}
                                        />}

                                </ViewComponent> */}


                            </View>

                        )}
                        {!state.cardListLoading && state.allMyCardsList.length === 0 && (
                            <NoDataComponent />
                        )}
                    </View>
                </ScrollViewComponent >
            </Container>}
            {state.isSheetOpen && <CustomRBSheet key={state.RbSheetTittle + state.activeCardId} refRBSheet={rbSheetRef} height={getSheetHeight(state.RbSheetTittle, state.rbSheetErrorMsg)} title={state.RbSheetTittle} onClose={_handleSheetDidCloseAndResetState} errorMessage={state.rbSheetErrorMsg} closeOnPressMask={state.RbSheetTittle === "Top-Up" ? false : true} onErrorClose={handleRbSheetErrorMsgClose}>
                <CardActionsSheetContent
                    isFreeze={state.isFreezeSheet}
                    isCardInfo={state.isCardInfoSheet}
                    isSetPin={state.isSetPinSheet}
                    isLimit={state.isLimitSheet}
                    isTopUp={state.isTopUpSheet}
                    isActivateCard={state.isActivateCardSheet}
                    isGeneralCardInfoSheet={state.isGeneralCardInfoSheet}
                    isCardDetailsSheet={state.isCardDetailsSheet}
                    cardsDetails={state.cardsDetails}
                    decryptAES={decryptAES as (encryptedText: string | undefined) => string}
                    CardsInfoData={state.CardsInfoData}
                    cardSuportedPlatForms={state.cardSuportedPlatForms}
                    networkData={state.networkData}
                    currencyCode={state.currencyCode}
                    pin={pin}
                    pinInputRefs={pinInputRefs}
                    handlePinChange={handlePinChange}
                    topupBalanceInfo={state?.topupBalanceInfo}

                    selectedCurrency={state.selectedCurrency}
                    selectedNetwork={state.selectedNetwork}
                    onAmountChange={handleSendAmountChange}
                    onCurrencySelect={handleSelectCurrency}
                    onNetworkSelect={handleSelectNetwork}
                    onFreezePress={handleFreeze}
                    onPinPress={handlePin}
                    onLimitPress={handleLimit}
                    onCardInfoPress={handleCardInfo}
                    onConfirmFreeze={handleCardStatus}
                    onSetPinConfirm={handleSetPinConfirm}
                    handleMaxValue={handleMaxValue}
                    handleMinValue={handleMinValue}
                    onTopUpSubmit={(values) => saveTopUp(values)}

                    buttonLoader={state.buttonLoader}
                    rbSheetErrorMsg={state.rbSheetErrorMsg}
                    handleRbSheetErrorMsgClose={handleRbSheetErrorMsgClose}
                    iconsList={iconsList}
                    feeComissionData={state?.feeComissionData}
                    feeComissionLoading={state.feeComissionLoading}
                    topupAmount={state?.topUpAmount}
                    mangeCard={state?.mangeCardSheet}
                    bindCard={state?.isBindCardSheet}
                    bindCardInfo={state?.bindCardData[0]}
                    // bindCardPost={handleSave}
                    isSuccess={state?.isSuccessSheet}
                    successAmount={state?.successAmount}
                    successCurrency={state?.successCurrency}
                    successCardName={state.CardsInfoData?.name}
                    onSuccessDone={triggerSheetClose}
                    onCloseSheet={triggerSheetClose}
                    isBindSuccessSheet={state.isBindSuccessSheet}
                    bindSuccessCardName={state.bindSuccessCardName}
                    onBindSuccessDone={closeBindSuccessSheet}
                    navigation={props.navigation}
                    isAssignCardSheet={state.isAssignCardSheet}
                    assignCardEmployees={state.assignCardEmployees}
                    assignCardLoading={state.assignCardLoading}
                    assignCardError={state.assignCardError}
                    selectedAssignEmployee={state.selectedAssignEmployee}
                    setSelectedAssignEmployee={(emp: Employee) => {
                        updateState({ selectedAssignEmployee: emp, assignCardError: "" });
                        handleConfirmAssignCard(emp);
                    }}
                    onCloseAssignCard={handleCloseAssignCardSheet}
                    handleCloseAssignError={handleCloseAssignError}
                    isAsignEmployeeLoading={state?.isAsignEmployeeLoading}
                    viewIFrame={viewIFrame}
                    webViewLoading={webViewLoading}
                    webViewSetPinLoading={webViewSetPinLoading}
                    setPinIFrame={setPinIFrame}
                    supportedPlatforms={supportedPlatforms}
                    activateCardDetails={state?.activateCardDetails}
                    onActivateSuccess={handleOnRefresh}
                    fieldsLoading={state?.fieldsLoading}
                />
            </CustomRBSheet>}
        </ViewComponent>
    )
});
export default CardsInfo;