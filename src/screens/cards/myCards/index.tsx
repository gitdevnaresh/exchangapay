import React, { useEffect, useState, useRef, useCallback } from 'react';
import { TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { s } from 'react-native-size-matters';
import { Ionicons, Feather } from '@expo/vector-icons';
import { CommonActions, useFocusEffect, useNavigation } from '@react-navigation/native';
import Clipboard from "@react-native-clipboard/clipboard";

// --- Local Imports ---
import Container from '../../../newComponents/container/container';
import PageHeader from '../../../newComponents/pageHeader/pageHeader';
import ScrollViewComponent from '../../../newComponents/scrollView/scrollView';
import { useThemeColors } from '../../../hooks/useThemeColors';
import ViewComponent from '../../../newComponents/view/view';
import CardCarousel from '../../../newComponents/cardsCarousal/cardsCarousal';
import ImageBackgroundWrapper from '../../../newComponents/imageComponents/ImageBackground';
import ParagraphComponent from '../../../newComponents/textComponets/paragraphText/paragraph';
import { formatCardNumberForDisplay, isErrorDispaly } from '../../../utils/helpers';
import { CardList } from './interface';
import { showAppToast } from '../../../newComponents/ToasterMessages/ShowMessage';
import SwokipayDashboardLoader from '../../../newComponents/swokipayloader';
import { cardsService } from '../../../apiServices/cardsApis/cardsApiServices';
import useEncryptDecrypt from '../../../hooks/encDecHook';
import { useActionLogging } from '../../../hooks/loggingHook';
import Loadding from '../../commonScreens/skeltons';
import NoDataComponent from '../../../newComponents/noData/noData';
import FreezeUnFreeze from './freezeUnfreeze';
import { useHardwareBackHandler } from '../../../hooks/HardwareBackHandler';
import Wallets from './wallets/wallets';
import TextMultiLanguage from '../../../newComponents/textComponets/multiLanguageText/textMultiLangauge';
import { getThemedCommonStyles } from '../../../assets/styles/CommonStyles';
import CardUnlokedIcon from '../../../assets/mainmenuicons/cardUnlockedIcon';
import CreditCardLockIcon from '../../../assets/mainmenuicons/creditCardLockIcon';
import LimitIcon from '../../../assets/mainmenuicons/limitIcon';
import CreditCardIcon from '../../../assets/mainmenuicons/creditCardIcon';
import RoundedPlusIcon from '../../../assets/mainmenuicons/roundedPlus';
import CopyCard from '../../../newComponents/copyComponent/CopyCard';
import RecentTransactions from '../../commonScreens/transactions/recentTransactions';
import TopUpIcon from '../../../assets/mainmenuicons/topUpIcon';
import { DeleteCardData } from './cardSettings/replaceCard/interface';
import AuthVerification from '../../commonScreens/authentication';
import ProfileService from '../../../services/profile';
import { useLngTranslation } from '../../../hooks/useLngTranslation';
import { CurrencyText } from '../../../newComponents/textComponets/currencyText/currencyText';
import ErrorComponent from '../../../newComponents/errorDisplay/errorDisplay';
import { CardActionsSkeleton } from '../../commonScreens/transactions/skeltonViews';
import InactiveAccountPopup from '../../commonScreens/inactiveSheet/accountInactive';
import { useSelector } from 'react-redux';
import ImageUri from '../../../newComponents/imageComponents/image';
import { CARDS_URLS } from '../../../assets/blobUrls';

// --- Configuration for Card Statuses ---
const CARD_STATUS_BADGE: Record<string, { icon: React.ReactNode; text: string }> = {
    'pending': { icon: <Ionicons name="hourglass-outline" size={s(16)} color="#fff" />, text: 'Pending' },
    'binding state': { icon: <Ionicons name="link-outline" size={s(16)} color="#fff" />, text: 'Binding' },
    'reviewing': { icon: <Ionicons name="search-outline" size={s(16)} color="#fff" />, text: 'Reviewing' },
    'submitted': { icon: <Ionicons name="cloud-upload-outline" size={s(16)} color="#fff" />, text: 'Submitted' },
    'freezed': { icon: <Ionicons name="snow-outline" size={s(16)} color="#fff" />, text: 'Frozen' },
    'freeze pending': { icon: <Ionicons name="snow-outline" size={s(16)} color="#fff" />, text: 'Freeze Pending' },
    'unfreezed pending': { icon: <Ionicons name="sync-outline" size={s(16)} color="#fff" />, text: 'Unfreezing' },
    'rejected': { icon: <Ionicons name="close-circle-outline" size={s(16)} color="#fff" />, text: 'Rejected' },
    'cancelled': { icon: <Ionicons name="trash-outline" size={s(16)} color="#fff" />, text: 'Cancelled' },
};


const MyCards = (props: any) => {
    const [dashboardLoading, setDashboardLoading] = useState<boolean>(true);
    const [myCards, setMyCards] = useState<CardList[]>([]);
    const NEW_COLOR = useThemeColors();
    const navigation = useNavigation<any>();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const TARGET_CAROUSEL_ITEM_HEIGHT = s(185);
    const SPACE_FOR_DOTS = s(24);
    const [activeCard, setActiveCard] = useState<CardList | null>(null);
    const [carouselActiveIndex, setCarouselActiveIndex] = useState(0);
    const { decryptAES } = useEncryptDecrypt();
    const lastFetchedCardId = useRef<string | undefined>();
    const [selectedAction, setSelectedAction] = useState<string | null>(null);
    const [activeCardDetails, setActiveCardDetails] = useState<any>(null);
    const { logEvent } = useActionLogging();
    const [activeCardDetailsLoading, setActiveCardDetailsLoading] = useState<boolean>(false);
    const FreezeUnFreezeRef = useRef<any>(null);
    const UnFreezeRef = useRef<any>(null);
    const deleteCardRef = useRef<any>(null);
    const addAppleWalletInfoRef = useRef<any>(null);
    const addGooglePayInfoRef = useRef<any>(null);
    const [recentTranscationReload, setRecentTranscationReload] = useState(false)
    const [deleteCardData, setDeleteCardData] = useState<DeleteCardData | undefined>(undefined);
    const [authOpen, setAuthOpen] = useState(false);
    const [activeAction, setActiveAction] = useState<string>('');
    const [deleteCardInfoLoader, setDeleteCardInfoLoader] = useState<boolean>(false);
    const [cardPermissionAuthentication, setCarPermissionAuthentication] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const { t } = useLngTranslation();
    const [error, setError] = useState<string>("");
    const [cardViewPermisiions, setCardViewPermisiions] = useState<any[]>([]);
    const [cardActionsLoading, setCardActionsLoading] = useState<boolean>(false)
    const transactionCardContent = CardActionsSkeleton(1);
    const [isInactive, setIsInactive] = useState<boolean>(false);
    const userInfo = useSelector((state: any) => state.userReducer.userDetails);

    useHardwareBackHandler(() => {
        backArrowButtonHandler();
        return true;
    });


    useFocusEffect(
        useCallback(() => {

            getMyCards();

            if (props?.route?.params?.shouldReload) {
                setRecentTranscationReload(true);
            }
        }, [props?.route?.params?.cardId, props?.route?.params?.shouldReload])
    );
    useEffect(() => {

        CardPermission();
    }, [])
    const backArrowButtonHandler = () => {
        navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: "Dashboard" }] }));
    };
    const getCardViewPermission = async (cardId: any) => {
        setCardActionsLoading(true);
        try {
            const response: any = await cardsService.getCardViewPermissions(cardId);
            if (response?.ok) {
                setCardViewPermisiions(response?.data ?? [])
            } else {
                setError(isErrorDispaly(response));
            }

        } catch (error) {
            setError(isErrorDispaly(error));
        }
        finally {
            setCardActionsLoading(false);
        }
    }
    const handleClose = () => {
        setIsInactive(false);
    };
    const getMyCards = async (isActiveCardLoading: boolean = false) => {
        setError("");
        if (!isActiveCardLoading) setDashboardLoading(true);
        setActiveAction('');
        try {
            const response: any = await cardsService.getMyCards(10, 1);
            if (response?.data) {
                const cards = response.data;
                // const cards: any = [{ "id": "c593dd91-6f42-4f5f-b786-20f6fb7354ff", "customerId": "f0c1515e-3f75-43bf-b786-033159407b25", "type": "Virtual", "logo": "https://prdexchangapaystorage.blob.core.windows.net/exchanga/SwokipaycardOLDIMG_638899688496730962.png", "number": "", "customerName": "Manohar A", "status": "Active", "cardName": "SWOKIPAY CARD", "amount": 0, "currency": "USD", "paidCurrency": "USDT", "paidNetwork": "TRC-20", "cardAssoc": "Visa", "createdDate": "2025-08-08T12:36:02.6393079", "supportedFlatforms": "Google Pay, Amazon, Alibaba.com,Apple Pay/Pinduoduo/Alipay/WeChat/Amazon/Shopee", "singleTransactionLimit": null, "dailyLimit": null, "approvedDate": null, "lable": "Virtual" }, { "id": "c593dd91-6f42-4f5f-b786-20f4fb7354ff", "customerId": "f0c1515e-3f75-43bf-b786-023459407b25", "type": "Virtual", "logo": "https://prdexchangapaystorage.blob.core.windows.net/exchanga/SwokipaycardOLDIMG_638899688496730962.png", "number": "", "customerName": "Manohar A", "status": "Rejected", "cardName": "BullSwipe CARD", "amount": 0, "currency": "USD", "paidCurrency": "USDT", "paidNetwork": "TRC-20", "cardAssoc": "Visa", "createdDate": "2025-08-08T12:36:02.6393079", "supportedFlatforms": "Google Pay, Amazon, Alibaba.com,Apple Pay/Pinduoduo/Alipay/WeChat/Amazon/Shopee", "singleTransactionLimit": null, "dailyLimit": null, "approvedDate": null, "lable": "Virtual" }];
                setMyCards(cards);
                if (cards.length === 0) {
                    setDashboardLoading(false);
                    return;
                }
                const targetCardId = props?.route?.params?.cardId;
                let cardToActivate = cards[0];
                let activeIndex = 0;

                if (targetCardId) {
                    const foundIndex = cards.findIndex((card: any) => card.id === targetCardId);
                    if (foundIndex !== -1) {
                        cardToActivate = cards[foundIndex];
                        activeIndex = foundIndex;
                    }
                }
                setActiveCard(cardToActivate);
                setCarouselActiveIndex(activeIndex);
                lastFetchedCardId.current = cardToActivate?.id;
                // await getMyCardDetsils(cardToActivate.id, false);
            } else {
                setError(isErrorDispaly(response));
            }
        } catch (error) {
            setError(isErrorDispaly(error));
        } finally {
            if (!isActiveCardLoading) setDashboardLoading(false);
        }
    };

    const getMyCardDetsils = async (cardId?: string, swipeCardLoading: boolean = false) => {
        setError("");
        if (swipeCardLoading) setActiveCardDetailsLoading(true);
        try {
            const response: any = await cardsService.getMyCardDetsils(cardId);
            if (response.status === 200) {
                setActiveCardDetails(response.data);
                setActiveCardDetailsLoading(false);
            }
            else {
                setError(isErrorDispaly(response));
                setActiveCardDetailsLoading(false);
                setActiveCardDetails([])
            }
        } catch (error) {
            setError(isErrorDispaly(error));
        } finally {
            if (swipeCardLoading) setActiveCardDetailsLoading(false);
        }
    };
    const onRefresh = async () => {
        setDashboardLoading(true);
        await Promise.all([
            getMyCards()

        ]);
        setRecentTranscationReload(true);
        setDashboardLoading(false);
    }
    const handleRecentTranscationReloadDetails = (reload: boolean, error?: string | null) => {
        setRecentTranscationReload(reload);
    }
    const handleCopyCardNumber = (cardNumber: string) => {
        if (cardNumber) {
            logEvent('icon_press', { screename: 'MyCards', actionName: 'Copy CardNumber', actionType: 'Button' });
            Clipboard.setString(cardNumber.replace(/ /g, ''));
            showAppToast(t("GLOBAL_CONSTANTS.CARD_NUMBER_COPIED"), "success");
        }
    };

    const renderCarouselCard = (
        item: CardList,
        index: number,
        calculatedItemWidth: number,
        calculatedItemHeight: number,
        selectedAction: string | null
    ) => {
        const isActive = activeCard?.id === item.id;
        const details = isActive ? activeCard : null;
        const cardState = details?.status?.toLowerCase() || '';
        const shouldShowDetails = selectedAction === 'view' && isActive && details;
        const badgeConfig = CARD_STATUS_BADGE[cardState];
        const showOverlay = cardState !== 'active' && cardState !== 'approved';
        return (
            <ImageBackgroundWrapper
                source={{ uri: item?.logo }}
                resizeMode="cover"
                imageStyle={[commonStyles.rounded12]}
               style={[
                    { width: s(345), height: s(190), alignSelf: 'center', overflow: 'hidden' }
                ]}
            >
                {/* Overlay and Badge for non-active states */}
                {showOverlay && (
                    <>
                        <ViewComponent style={styles.overlayCenter} >
                            <ViewComponent style={[commonStyles.dflex, commonStyles.justifyCenter,]}>
                                {cardState && <ViewComponent style={[commonStyles.frozenBadge]}>
                                    {badgeConfig?.icon || <Ionicons name="alert-circle-outline" size={s(16)} color="#fff" />}
                                    <ParagraphComponent
                                        text={badgeConfig?.text || cardState.charAt(0).toUpperCase() + cardState.slice(1)}
                                        style={[commonStyles.frozenText]}
                                    />
                                </ViewComponent>}
                            </ViewComponent>
                        </ViewComponent>
                    </>
                )}


                {/* Card Content */}
                <ViewComponent style={[commonStyles.p16, commonStyles.flex1, { justifyContent: 'space-between' }]}>
 
                    {shouldShowDetails ? (
                        // --- DETAILED VIEW (Matches Image 1) ---
                        <>
                         <ViewComponent style={[commonStyles.cardbadge]}>
                                    <ViewComponent style={[commonStyles.cardvirtualbadge]}>
                                        <TextMultiLanguage style={[commonStyles.fs8, commonStyles.fw700, commonStyles.textWhite]} text={item?.type.toUpperCase() || item.type} />
                                    </ViewComponent>
                                </ViewComponent>
                            <ViewComponent style={[commonStyles.dflex, commonStyles.justifyend]}>
                                 
                            </ViewComponent>
                            
                            {(activeCardDetailsLoading) ? (
                                        <ViewComponent>
                                            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap8, { marginBottom: s(12) },commonStyles.cardml27]}>
                                                <ViewComponent style={{ height: s(16), width: '70%', backgroundColor: '#ECF1F7', borderRadius: s(4) }} />
                                                <ViewComponent style={{ height: s(20), width: s(20), backgroundColor: '#ECF1F7', borderRadius: s(10) }} />
                                            </ViewComponent>
                                            <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter]}>
                                                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap20,commonStyles.cardml27]}>
                                                    <ViewComponent>
                                                        <ViewComponent style={{ height: s(10), width: s(60), backgroundColor: '#ECF1F7', borderRadius: s(3), marginBottom: s(6) }} />
                                                        <ViewComponent style={{ height: s(12), width: s(50), backgroundColor: '#ECF1F7', borderRadius: s(3) }} />
                                                    </ViewComponent>
                                                    <ViewComponent>
                                                        <ViewComponent style={{ height: s(10), width: s(30), backgroundColor: '#ECF1F7', borderRadius: s(3), marginBottom: s(6) }} />
                                                        <ViewComponent style={{ height: s(12), width: s(30), backgroundColor: '#ECF1F7', borderRadius: s(3) }} />
                                                    </ViewComponent>
                                                </ViewComponent>
                                            </ViewComponent>
                                        </ViewComponent>
                            ) : (
                                <>
                                        <ViewComponent style={[{ alignItems: 'flex-end' }]}>
                            </ViewComponent>
                              <ViewComponent style={[commonStyles.cardbadge]}>
                                    <ViewComponent style={[commonStyles.cardvirtualbadge]}>
                                        <TextMultiLanguage style={[commonStyles.fs8, commonStyles.fw700, commonStyles.textWhite]} text={item?.type.toUpperCase() || item.type} />
                                    </ViewComponent>
                                </ViewComponent>
                                <ViewComponent>
                             
                                    {cardViewPermisiions?.find(card => card.name === "TopUp")?.isDisplay && (
                                        <ViewComponent style={[commonStyles.sectionGap,commonStyles.cardml27]}>
                                            <ViewComponent style={[commonStyles.dflex, commonStyles.justifystart, commonStyles.alignCenter]}>
                                                <TextMultiLanguage text={"GLOBAL_CONSTANTS.AVAILABLE_BALANCE"} style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textGrey]} />
                                                <CurrencyText value={item?.amount} currency={item?.currency} style={[commonStyles.textWhite, commonStyles.fw600, commonStyles.fs16]} />
                                            </ViewComponent>
                                        </ViewComponent>
                                    )}
                                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap8, commonStyles.cardml27,commonStyles.mb10]}>
                                        <ParagraphComponent text={activeCardDetails ? decryptAES(activeCardDetails?.number)?.replace(/(\d{4})(?=\d)/g, '$1 ') : ''} style={[commonStyles.fs16, commonStyles.textWhite, commonStyles.fw600]} />
                                        <CopyCard onPress={() => handleCopyCardNumber(activeCardDetails ? decryptAES(activeCardDetails?.number) : '')} size={s(20)} />
                                    </ViewComponent>
 
                                    <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter]}>
                                        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap20]}>
                                            <ViewComponent style={[commonStyles.cardml27]}>
                                                <ParagraphComponent text={t("GLOBAL_CONSTANTS.VALID_THRU")} style={[commonStyles.fs10, commonStyles.textlinkgrey]} />
                                                <ParagraphComponent text={activeCardDetails ? decryptAES(activeCardDetails?.expireDate) : ''} style={[commonStyles.fs12, commonStyles.textWhite, commonStyles.fw500]} />
                                            </ViewComponent>
                                            <ViewComponent >
                                                <ParagraphComponent text={t("GLOBAL_CONSTANTS.CVV")} style={[commonStyles.fs10, commonStyles.textlinkgrey]} />
                                                <ParagraphComponent text={activeCardDetails ? decryptAES(activeCardDetails?.cvv) : ''} style={[commonStyles.fs12, commonStyles.textWhite, commonStyles.fw500]} />
                                            </ViewComponent>
                                        </ViewComponent>
                                    </ViewComponent>
                                </ViewComponent>
                                </>
                            )}
                        </>
                    ) : (
                        // --- DEFAULT MASKED VIEW (Label on Top-Right) ---
                        <>
                            <ViewComponent style={[{ alignItems: 'flex-end' }]}>
                            </ViewComponent>
                              <ViewComponent style={[commonStyles.cardbadge]}>
                                    <ViewComponent style={[commonStyles.cardvirtualbadge]}>
                                        <TextMultiLanguage style={[commonStyles.fs8, commonStyles.fw700, commonStyles.textWhite]} text={item?.type.toUpperCase() || item.type} />
                                    </ViewComponent>
                                </ViewComponent>
                            
                            {cardViewPermisiions?.find(card => card.name === "TopUp")?.isDisplay && (
                                <ViewComponent style={[commonStyles.cardml27]}>
                                    <ViewComponent style={[commonStyles.dflex, commonStyles.justifystart, commonStyles.alignCenter]}>
                                        <TextMultiLanguage text={"GLOBAL_CONSTANTS.AVAILABLE_BALANCE"} style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textGrey]} />
                                        <CurrencyText value={item?.amount} currency={item?.currency} style={[commonStyles.textWhite, commonStyles.fw600, commonStyles.fs16]} />
                                    </ViewComponent>
                                </ViewComponent>
                            )}
                            <ViewComponent style={[]}>
                                <ParagraphComponent text={formatCardNumberForDisplay(item?.number)} style={[commonStyles.fs16, commonStyles.fw600, commonStyles.textWhite,commonStyles.cardml27]} />
                                 <ParagraphComponent text={item?.customerName} style={[commonStyles.fs16, commonStyles.fw600, commonStyles.textWhite,commonStyles.cardml27]} />                            </ViewComponent>
                        </>
                    )}
                </ViewComponent>
            </ImageBackgroundWrapper>
        );
    };

    const deleteCardInfo = async (cardId: string) => {
        setError("");
        setDeleteCardInfoLoader(true)
        try {
            deleteCardRef?.current?.open()
            const response: any = await cardsService.getDeleteCard(cardId);
            if (response.status === 200) {
                setDeleteCardData(response?.data as DeleteCardData);

                setDeleteCardInfoLoader(false);
            } else {
                setError(isErrorDispaly(response));
                setDeleteCardInfoLoader(false);
            }

        } catch (error) {
            setError(isErrorDispaly(error));
            setDeleteCardInfoLoader(false);

        }
    }

    const CardPermission = async () => {
        try {
            const response: any = await ProfileService.getCardprivacyControll();
            if (response.ok) {
                const biometricItem = response?.data?.find((item: any) => item.type === "Use device biometrics");
                if (biometricItem) {
                    setCarPermissionAuthentication(biometricItem.isEnabled);
                }
            } else {
                setError(isErrorDispaly(response));
            }
        } catch (error) {
            setError(isErrorDispaly(error));
        }
    }
    const CardActions = ({ selectedAction, setSelectedAction, activeCardDetails }: any) => {
        const cardState = activeCardDetails?.status?.toLowerCase();
        const cardId = activeCardDetails?.cardId || activeCardDetails?.id;

        const handleActionPress = (actionId: string, specificOnPress?: () => void) => {
            // Prevent multiple clicks when loading
            if (loading) return;
            if ((actionId === "unfreeze") && (userInfo?.customerAccountStatus === false)) {
                setIsInactive(true); // Open the inactive account popup
                return;

            }
            if (activeAction === actionId && actionId === 'view') {
                setActiveAction('');
                setSelectedAction(null)
            } else {
                setActiveAction(actionId || '');
                setLoading(true);
                verifyAuth();
                setSelectedAction(null)
            }
        };

        let actionsToRender: any = [];
        // Active card actions
        if (cardState === 'active' || cardState === 'approved') {
            const allActions = [
                { id: 'view', icon: <Feather name="eye" size={s(22)} />, label: 'View', onPress: () => handleActionPress('view') },
                { id: 'freeze', icon: <CreditCardLockIcon width={s(24)} height={s(24)} />, label: 'Freeze', onPress: () => handleActionPress('freeze') },
                {
                    id: 'limit', icon: <LimitIcon width={s(24)} height={s(24)} />, label: 'Limit', onPress: () => {
                        const limitDetails = cardViewPermisiions?.find?.(link => link?.id === 'limit')?.details || [];
                        navigation.navigate("CardLimit", { activeCard: activeCardDetails, details: limitDetails });
                    }
                },
                {
                    id: 'settings', icon: <Ionicons name="settings-outline" size={s(20)} />, label: 'Settings', onPress: () => {
                        const settingsDetails = cardViewPermisiions?.find?.(link => link?.id === 'settings')?.details || [];
                        navigation.navigate('CardSettings', { activeCard: activeCard, details: settingsDetails });
                    }
                },
                {
                    id: 'topup', icon: <TopUpIcon width={s(20)} height={s(20)} />, label: 'GLOBAL_CONSTANTS.TOP_UP', onPress: () => {
                        const topupDetails = cardViewPermisiions?.find?.(link => link?.id === 'topup')?.details || [];
                        navigation.navigate('CardTopUp', { activeCard: activeCard, details: topupDetails });
                    }
                },
            ];
            actionsToRender = allActions.filter(action =>
                cardViewPermisiions?.find?.(link => link.id === action?.id)?.isDisplay
            );

            // Frozen card actions
        } else if (['freezed'].includes(cardState)) {
            const allActions = [
                { id: 'unfreeze', icon: <CardUnlokedIcon />, label: 'Unfreeze', onPress: () => handleActionPress('unfreeze') },
                { id: 'delete', icon: <Ionicons name="trash-outline" size={s(16)} />, label: 'Delete', onPress: () => navigation.navigate('DeleteCard', { activeCard: activeCard }) },
            ];
            actionsToRender = allActions.filter(action =>
                cardViewPermisiions?.find?.(link => link.id === action.id)?.isDisplay ?? true
            );
            // Actions for all other states (pending, rejected, etc.)
        }
        else if (['freeze pending', 'unfreezed pending'].includes(cardState)) {
            const allActions = [
                { id: 'delete', icon: <Ionicons name="trash-outline" size={s(20)} />, label: 'Delete', onPress: () => navigation.navigate('DeleteCard', { activeCard: activeCard }) },
            ];
            actionsToRender = allActions.filter(action =>
                cardViewPermisiions?.find?.(link => link.id === action.id)?.isDisplay
            );
        }
        else if (cardState === 'pending') {
            // Show activate button only for virtual cards
            if (activeCardDetails?.type?.toLowerCase() !== 'virtual') {
                const allActions = [
                    { id: 'activate', icon: <Ionicons name="card-outline" size={s(24)} color={NEW_COLOR.TEXT_GRAY} />, label: 'Activate Card', onPress: () => navigation.navigate('ActivateCard', { activeCard: activeCard }) },
                ];
                actionsToRender = allActions;
            } else {
                actionsToRender = [];
            }
        }
        else if (!['cancelled', 'delete'].includes(cardState)) {
            const allActions = [
                { id: 'delete', icon: <Ionicons name="trash-outline" size={s(20)} />, label: 'Delete', onPress: () => navigation.navigate('DeleteCard', { activeCard: activeCard }) },
            ];
            actionsToRender = allActions.filter(action =>
                cardViewPermisiions?.find?.(link => link.id === action.id)?.isDisplay
            );
        }

        return (
            <ViewComponent style={[commonStyles.dflex, actionsToRender.length > 2 ? commonStyles.justifyContent : commonStyles.justifyCenter, commonStyles.listGap]}>
                {actionsToRender.map((action: any) => (
                    <TouchableOpacity key={action.id} style={[commonStyles.alignCenter, actionsToRender.length <= 2 && { marginHorizontal: s(16) }]} onPress={action.onPress} disabled={loading}>
                        <ViewComponent style={[commonStyles.bannerBg, commonStyles.justifyCenter, commonStyles.alignCenter, commonStyles.mb8, { width: s(55), height: s(55), borderRadius: s(30), backgroundColor: selectedAction === action.id ? commonStyles.bg_yellow?.backgroundColor : commonStyles?.bannerBg?.backgroundColor }]}>
                            {loading && activeAction === action.id ? (
                                <ActivityIndicator size="small" color={selectedAction === action.id ? NEW_COLOR.TEXT_BLACK : NEW_COLOR.TEXT_WHITE} />
                            ) : (
                                React.cloneElement(action.icon, { color: selectedAction === action.id ? NEW_COLOR.TEXT_BLACK : commonStyles.textlinkgrey.color })
                            )}
                        </ViewComponent>
                        <TextMultiLanguage style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textWhite]} text={action.label} />
                    </TouchableOpacity>
                ))}
            </ViewComponent>
        );
    };

    const WalletActions = ({ commonStyles }: any) => {
        const walletActions = [
            { id: 'apple', icon: <ImageUri  uri={CARDS_URLS.appleWalletIcon} style={{ width: s(26), height: s(20) }}/>, labelKey: 'APPLE_WALLET', onPress: () => addAppleWalletInfoRef?.current?.open() },
            { id: 'google', icon: <ImageUri style={{ width: s(24), height: s(24) }} uri={CARDS_URLS.googleWalletIcon} />, labelKey: 'GOOGLE_WALLET', onPress: () => addGooglePayInfoRef?.current?.open() },
        ];

        return (
            <ViewComponent style={[commonStyles.dflex, commonStyles.justifyCenter, commonStyles.gap16]}>
                {walletActions.map((action, index) => (
                    <TouchableOpacity key={index} onPress={action.onPress}>
                        <ViewComponent style={[commonStyles.justifyCenter, commonStyles.alignCenter, commonStyles.sectionBorder, commonStyles.dflex,commonStyles.px16, commonStyles.gap8,commonStyles.py5
                        ]}>
                            <ViewComponent>
                                {action.icon}
                            </ViewComponent>
                            <ViewComponent >
                                <ParagraphComponent text={t("GLOBAL_CONSTANTS.ADD_TO")} style={[commonStyles.fs12, commonStyles.fw400, action.id === 'apple' ? commonStyles.textWhite : commonStyles.textWhite]} />
                                <ParagraphComponent text={action.id === 'apple' ? t("GLOBAL_CONSTANTS.APPLE_WALLET") : t("GLOBAL_CONSTANTS.GOOGLE_WALLET")} style={[commonStyles.fs14, commonStyles.fw500, action.id === 'apple' ? commonStyles.textWhite : commonStyles.textWhite]} />
                            </ViewComponent>
                        </ViewComponent>
                    </TouchableOpacity>))}
            </ViewComponent>
        );
    };

    const handleActiveCardChange = (newCard: CardList, newIndex: number) => {
        setSelectedAction(null);
        setActiveCard(newCard);
        setCarouselActiveIndex(newIndex);
        getCardViewPermission(newCard?.id)
        if (lastFetchedCardId.current !== newCard?.id) {
            lastFetchedCardId.current = newCard?.id;
            setActiveAction('')
        }
    };
    const resetSelectedAction = () => {
        setSelectedAction(null);
    };
    const handleAuthClose = () => {
        setAuthOpen(false);
        setActiveAction('');
        setLoading(false);
    }
    const handleAuthSucess = (verifications: any) => {
        setAuthOpen(false);
        setLoading(false);
        getMyCardDetsils(activeCard?.id, true);
        setSelectedAction(activeAction);
        if (activeAction === 'limit') {
            navigation.navigate("CardLimit", { activeCard: activeCard })
        }
        if (activeAction === 'freeze') {
            FreezeUnFreezeRef?.current?.open()
        }
        if (activeAction === 'unfreeze') {
            UnFreezeRef?.current?.open()
        }
        if (activeAction === 'delete') {
            deleteCardInfo(activeCard?.id);
        }
    }
    const verifyAuth = () => {
        setAuthOpen(true);
    }

    const handleRefresh = () => {
        getMyCards();
        // getCardViewPermission();
    };
    const handleCloseFreeze = () => {
        setSelectedAction(null);
        setActiveAction('')
        FreezeUnFreezeRef?.current?.close();
    }
    const rightActions = (
        <ViewComponent style={[commonStyles.dflex, commonStyles.gap16, commonStyles.alignCenter]}>
            {myCards?.length > 0 && (
                <TouchableOpacity onPress={() => navigation.navigate('MyCardsList', { myCards })}>
                    <CreditCardIcon color={commonStyles.textWhite.color} />
                </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => navigation.navigate("ChooseCard", { screenName: "MyCards" })}>
                <RoundedPlusIcon color={NEW_COLOR.TEXT_WHITE} />
            </TouchableOpacity>
        </ViewComponent>
    );

    return (
        <ViewComponent style={[commonStyles.screenBg, commonStyles.flex1]}>
            {dashboardLoading ? (
                <SwokipayDashboardLoader />
            ) : (
                <ScrollViewComponent contentContainerStyle={{ flexGrow: 1 }} onRefresh={handleRefresh}>
                    <Container>
                        <PageHeader
                            title={"GLOBAL_CONSTANTS.MY_CARDS"}
                            onBackPress={backArrowButtonHandler}
                            rightActions={rightActions}
                        />
                        {error && <ErrorComponent message={error} screen={true} />}
                        {myCards?.length > 0 ? (
                            <ViewComponent>
                                <ViewComponent style={[commonStyles.mb20]}>
                                    <CardCarousel
                                        data={myCards}
                                        renderItem={(
                                            item: CardList,
                                            index: number,
                                            w: number,
                                            h: number
                                        ) => renderCarouselCard(item, index, w, h, selectedAction)}
                                        keyExtractor={(item: CardList) => item?.id?.toString()}
                                        height={TARGET_CAROUSEL_ITEM_HEIGHT + SPACE_FOR_DOTS}
                                        onActiveCardChange={handleActiveCardChange}
                                        initialScrollIndex={carouselActiveIndex}
                                    />
                                </ViewComponent>

                                <ViewComponent>
                                    <ViewComponent style={[commonStyles.sectionGap]}>
                                        {cardActionsLoading && <Loadding contenthtml={transactionCardContent} />}
                                        {!cardActionsLoading && <CardActions
                                            commonStyles={commonStyles}
                                            selectedAction={activeAction || selectedAction}
                                            setSelectedAction={setSelectedAction}
                                            activeCardDetails={activeCard}
                                        />}
                                    </ViewComponent>
                                    <ViewComponent style={[commonStyles.sectionGap]}>
                                        <WalletActions commonStyles={commonStyles} />
                                    </ViewComponent>
                                    <ViewComponent style={[commonStyles.sectionGap]}>
                                        <RecentTransactions screenName={"MyCards"} accountType={"cards"} recentTranscationReload={recentTranscationReload} handleRecentTranscationReloadDetails={handleRecentTranscationReloadDetails} displayTittle={false} cardId={activeCard?.id} />
                                    </ViewComponent>
                                </ViewComponent>
                            </ViewComponent>
                        ) : (
                            <ViewComponent style={{ flex: 1, justifyContent: 'center' }}>
                                <NoDataComponent Description={"GLOBAL_CONSTANTS.NO_DATA_AVAILABLE"} />
                            </ViewComponent>
                        )}

                        <FreezeUnFreeze
                            activeCard={activeCard}
                            deleteCardRef={deleteCardRef}
                            onActionComplete={resetSelectedAction}
                            deleteCardInfoLoader={deleteCardInfoLoader}
                            FreezeUnFreezeRef={FreezeUnFreezeRef}
                            activeCardDetails={activeCardDetails}
                            selectedAction={selectedAction}
                            UnFreezeRef={UnFreezeRef}
                            deleteCardData={deleteCardData}
                            onError={setError}
                            handleClose={handleCloseFreeze}
                            onFreezeSuccess={() => {
                                if (activeCard?.id) {
                                    getMyCards();
                                }
                            }}
                        />
                        <Wallets addAppleWalletInfoRef={addAppleWalletInfoRef} addGooglePayInfoRef={addGooglePayInfoRef} />
                    </Container>
                </ScrollViewComponent>
            )}
            {authOpen && <AuthVerification onClose={handleAuthClose} isRestrticBiometric={!cardPermissionAuthentication} onSuccess={handleAuthSucess} feature={`Card ${activeAction}` || 'Card action'} requiredVerifys={1} />}
            {isInactive && (<InactiveAccountPopup isVisibleModel={isInactive} onClose={handleClose} />)}

        </ViewComponent>
    );
};

const styles = StyleSheet.create({
    cardOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1,
        backgroundColor: 'rgba(25, 28, 32, 0.7)',
        borderRadius: s(10),

    },
    overlayCenter: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        // backgroundColor: "rgba(25, 28, 32, 0.7)",
        borderRadius: s(10),

        // Center the Frozen badge
        justifyContent: "center",
        alignItems: "center",

        zIndex: 10,
    },
});

export default MyCards; 