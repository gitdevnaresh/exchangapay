import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FlatList, TouchableOpacity, useWindowDimensions, LayoutAnimation, UIManager, Platform, ActivityIndicator, Keyboard } from 'react-native';
import ViewComponent from '../../newComponents/view/view';
import Container from '../../newComponents/container/container';
import PageHeader from '../../newComponents/pageHeader/pageHeader';
import { useThemeColors } from '../../hooks/useThemeColors';
import { getThemedCommonStyles } from '../../assets/styles/CommonStyles';
import { useHardwareBackHandler } from '../../hooks/HardwareBackHandler';
import { CommonActions, useNavigation, useIsFocused } from '@react-navigation/native';
import SwokipayDashboardLoader from '../../newComponents/swokipayloader';
import ScrollViewComponent from '../../newComponents/scrollView/scrollView';
import ImageBackgroundWrapper from '../../newComponents/imageComponents/ImageBackground';
import { LinearGradient } from 'expo-linear-gradient';
import TextMultiLanguage from '../../newComponents/textComponets/multiLanguageText/textMultiLangauge';
import { s } from '../../constants/theme/scale';
import { REFER_URLS } from '../../assets/blobUrls';
import ImageUri from '../../newComponents/imageComponents/image';
import { showAppToast } from '../../newComponents/ToasterMessages/ShowMessage';
import { isErrorDispaly } from '../../utils/helpers';
import { useActionLogging } from '../../hooks/loggingHook';
import { useLngTranslation } from '../../hooks/useLngTranslation';
import ParagraphComponent from '../../newComponents/textComponets/paragraphText/paragraph';
import { CurrencyText } from '../../newComponents/textComponets/currencyText/currencyText';
import TransactionIcon from '../../assets/mainmenuicons/transactionfilter';
import CommonTouchableOpacity from '../../newComponents/touchableComponents/touchableOpacity';
import { Feather, Ionicons } from '@expo/vector-icons';
import NoDataComponent from '../../newComponents/noData/noData';
import RenderHTML from 'react-native-render-html';
import ActionButton from '../../newComponents/gradianttext/gradiantbg';
import ButtonComponent from '../../newComponents/buttons/button';
import ClaimPopup from './ClaimPopup';
import { ReferralServices } from '../../apiServices/referApis/referServices';
import { useSelector } from 'react-redux';
import { ReferralTopic, ReferralItem, ReferralKpis } from './interface';
import KycVerifyPopup from '../commonScreens/kycVerify';
import ErrorComponent from '../../newComponents/errorDisplay/errorDisplay';
import InactiveAccountPopup from '../commonScreens/inactiveSheet/accountInactive';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const Refer = () => {
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const navigation = useNavigation<any>();
    const isFocused = useIsFocused();
    const { logEvent } = useActionLogging();
    const { t } = useLngTranslation();
    const [referLoader, setReferLoader] = useState<boolean>(true);
    const [referDetails, setReferDetails] = useState<ReferralItem | null>();
    const [referralKpis, setReferralKpis] = useState<ReferralKpis | null>();
    const [referralList, setReferralList] = useState<ReferralTopic[]>([]);
    const [expandedTopicId, setExpandedTopicId] = useState<string | number | null>(null);
    const [accordionContent, setAccordionContent] = useState<string>('');
    const [isAccordionLoading, setIsAccordionLoading] = useState<boolean>(false);
    const { width } = useWindowDimensions();
    const userInfo = useSelector((state: any) => state.userReducer?.userDetails);
    const [affiliateData, setAffiliateData]=useState<any>();
    const [apiCallsCompleted, setApiCallsCompleted] = useState({
        referDetails: false,
        referralKpis: false,
        referralList: false,
        affiliateDetails: false,
    });
    const claimSheetRef = useRef<any>(null);
    const [claimAmountLoader, setClaimAmountLoader] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [kycModelVisible, setKycModelVisible] = useState<boolean>(false);
    const [errorMsg, setErrorMsg] = useState<string>("");
    const [isInactive, setIsInactive] = useState<boolean>(false);
    const buttonText = affiliateData?.state?.toLowerCase() === "submitted" ? "GLOBAL_CONSTANTS.PENDING":"GLOBAL_CONSTANTS.JOIN_NOW";
    useEffect(() => {
        const allCompleted = Object.values(apiCallsCompleted).every(Boolean);
        if (allCompleted) setReferLoader(false);
    }, [apiCallsCompleted]);

    useEffect(() => {
        if (isFocused) {
            setError("");
            setErrorMsg("");
            setReferLoader(true);
            setApiCallsCompleted({ referDetails: false, referralKpis: false, referralList: false, affiliateDetails: false });
            fetchReferDetails();
            fetchReferralStats();
            fetchReferralList();
            fetchAffiliateDetails();
        }
    }, [isFocused]);
    const fetchReferDetails = useCallback(async () => {
        setError("");
        try {
            const response: any = await ReferralServices.referralDetails();
            if (response?.status == 200) {
                setReferDetails(response?.data);
            } else {
                setError(isErrorDispaly(response));
            }
        } catch (error) {
            setError(isErrorDispaly(error));
        } finally {
            setApiCallsCompleted((prev) => ({ ...prev, referDetails: true }));
        }
    }, []);
        const fetchAffiliateDetails = useCallback(async () => {
        try {
            const response: any = await ReferralServices.affiliateDetails();
            if (response?.status == 200) {
                setAffiliateData(response?.data);
            }
            else{
                setError(isErrorDispaly(response));
            }
        } catch (error) {
           setError(isErrorDispaly(error));
        } finally {
            setApiCallsCompleted((prev) => ({ ...prev, affiliateDetails: true }));
        }
    }, []);


    const fetchReferralStats = useCallback(async () => {
        setError("");
        try {
            const response: any = await ReferralServices.referKpis();
            if (response?.status == 200) {
                setReferralKpis(response?.data);
            } else {
                setError(isErrorDispaly(response));
            }
        } catch (error) {
            setError(isErrorDispaly(error));
        } finally {
            setApiCallsCompleted((prev) => ({ ...prev, referralKpis: true }));
        }
    }, []);

    const fetchReferralList = useCallback(async () => {
        setError("");
        try {
            const response: any = await ReferralServices.EarnList();
            if (response.status === 200) {
                setReferralList(response.data);
            } else {
                setError(isErrorDispaly(response));
            }
        } catch (error) {
            setError(isErrorDispaly(error));
        } finally {
            setApiCallsCompleted((prev) => ({ ...prev, referralList: true }));
        }
    }, []);

    const fetchTopicDetails = useCallback(async (topicId: string | number) => {
        setError("");
        try {
            setIsAccordionLoading(true);
            setAccordionContent('');
            const response: any = await ReferralServices.ReferEarnDetails(topicId);
            if (response.status === 200) {
                Keyboard.dismiss();
                setAccordionContent(response.data);
                setIsAccordionLoading(false);
            } else {
                setError(isErrorDispaly(response));
                setIsAccordionLoading(false);
                setExpandedTopicId(null);
            }
        } catch (err: any) {
            setError(isErrorDispaly(err));
            setIsAccordionLoading(false);
            setExpandedTopicId(null);
        }
    }, []);

    const handleTopicPress = useCallback((topic: ReferralTopic) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        const isAlreadyOpen = expandedTopicId === topic.id;
        if (isAlreadyOpen) {
            setExpandedTopicId(null);
            setAccordionContent('');
            Keyboard.dismiss();
        } else {
            setExpandedTopicId(topic.id);
            logEvent('accordion_toggle', {
                screename: 'ReferAndEarn',
                actionName: 'Accordion Opened',
                actionType: 'UI_Interaction',
                topicId: topic.id,
            });
            fetchTopicDetails(topic.id);
        }
    }, [expandedTopicId, fetchTopicDetails, logEvent]);

    const onRefresh = async () => {
        setError("");
        setErrorMsg("");
        setReferLoader(true);
        await Promise.all([
            fetchReferDetails(),
            fetchReferralStats(),
            fetchReferralList()
        ]);
        fetchAffiliateDetails();
        setReferLoader(false);
    };

    const handleClaimSheet = () => {
        if (userInfo?.customerAccountStatus === false) {
            setIsInactive(true);
            return
        }
        claimSheetRef?.current?.open()
        setError("")
    }
    const closeClaimSheet = () => {
        claimSheetRef?.current?.close()
        setError("")
    }
    const handleClose = () => {
        setIsInactive(false);
    };
    const handleClaimAmount = async () => {
        setErrorMsg("");
        setClaimAmountLoader(true)
        try {
            const response: any = await ReferralServices.ClimeReferralAmount();
            if (response.status == 200) {
                showAppToast(t('GLOBAL_CONSTANTS.CLAIM_SUCCESSFUL'), 'success');
                claimSheetRef.current?.close();
                await onRefresh();
            }
            else {
                setErrorMsg(isErrorDispaly(response));
            }
        } catch (error) {
            setErrorMsg(isErrorDispaly(error));
        } finally {
            setClaimAmountLoader(false);
        }
    };

    const renderTopicItem = useCallback(({ item }: { item: ReferralTopic }) => {
        const isExpanded = expandedTopicId === item.id;
        return (
            <ViewComponent style={[commonStyles.profileMenulistGap]}>
                <CommonTouchableOpacity
                    onPress={() => handleTopicPress(item)}
                    activeOpacity={0.95}
                >
                    <ViewComponent style={[commonStyles.accordionCardStyle]}>
                        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent]}>
                            <ViewComponent style={[commonStyles.flex1]}>
                                <ParagraphComponent text={item.heading || item.title || ''} style={[commonStyles.profileMenuItemText]} multiLanguageAllows={false} />
                                {item?.description && !isExpanded && (
                                    <ViewComponent style={{ marginTop: s(6) }}>
                                        <ParagraphComponent
                                            text={item.description} style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textGrey]}
                                            multiLanguageAllows={false} numberOfLines={2}
                                        />
                                    </ViewComponent>
                                )}
                            </ViewComponent>
                            <ViewComponent>
                                {isExpanded ?
                                    <Feather name="chevron-down" size={s(26)} color={NEW_COLOR.ICON_GREY} />
                                    : <Ionicons name="chevron-forward" size={s(22)} color={NEW_COLOR.ICON_GREY} />
                                }
                            </ViewComponent>
                        </ViewComponent>
                        {isExpanded && (
                            <ViewComponent style={{ marginTop: s(16) }}>
                                {isAccordionLoading ? (
                                    <ActivityIndicator size="small" color={NEW_COLOR.BG_YELLOW} style={[commonStyles.my20]} />
                                ) : (
                                    <RenderHTML
                                        contentWidth={width - s(48)}
                                        source={{ html: accordionContent }}
                                        tagsStyles={{
                                            body: { color: NEW_COLOR.TEXT_WHITE },
                                            a: { color: NEW_COLOR.PRIMARY, textDecorationLine: 'none' }
                                        }}
                                    />
                                )}
                                {!accordionContent && (!isAccordionLoading) && (
                                    <NoDataComponent />
                                )}
                            </ViewComponent>
                        )}
                    </ViewComponent>
                </CommonTouchableOpacity>
            </ViewComponent>
        );
    }, [expandedTopicId, handleTopicPress, isAccordionLoading, accordionContent, width, NEW_COLOR, commonStyles]);

    const renderEmptyComponent = useCallback(() => (
        <ViewComponent style={[commonStyles.container, commonStyles.myAuto]}>
            <NoDataComponent />
        </ViewComponent>
    ), [commonStyles]);

    useHardwareBackHandler(() => {
        backArrowButtonHandler();
        return true;
    });
    const backArrowButtonHandler = () => {
        navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: "Dashboard" }] }));
        logEvent('navigation_action', {
            screename: 'ReferAndEarn',
            actionName: 'Go Back',
            actionType: 'Button',
        });
    };
    const handleReferralShare = () => {
        navigation.navigate("ShareReferral")

    }
    const handleTransactions = () => {
        navigation.navigate("ReferralTransactionList");
    };
    const handleJoin = async () => {
        if (userInfo?.customerAccountStatus === false) {
            setIsInactive(true); // Open the inactive account popup
            return;
        }
        if (userInfo.isKYC !== true) {
            setKycModelVisible(true)
            return;
        }
        try {
            // Navigate to ReferralProgram screen instead of opening external link
            navigation.navigate('ReferralProgram');
        }
        catch (err) {
            setError(isErrorDispaly(err));
        }
    }
    const handleRightAction = (
        <ViewComponent style={[]}>
            <CommonTouchableOpacity onPress={handleTransactions}>
                <TransactionIcon />
            </CommonTouchableOpacity>
        </ViewComponent>
    );

    const closekycModel = () => {
        setKycModelVisible(false)
    }

    const referralAmount = Number.parseFloat(referralKpis?.refferalAmount?.toString() || '0');
    const pendingAmount = Number.parseFloat(referralKpis?.pending || '0');
    const completedAmount = Number.parseFloat(referralKpis?.completed || '0');
    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            {referLoader && <SwokipayDashboardLoader />}
            {!referLoader && (
                <ScrollViewComponent onRefresh={onRefresh} >
                    <ViewComponent>
                        <ImageBackgroundWrapper
                            source={{ uri: referDetails?.imageUrl || REFER_URLS.referBanner }}
                            style={{ height: s(370), width: '100%' }}
                            imageStyle={{ resizeMode: 'cover' }}
                        >
                            <LinearGradient
                                colors={[NEW_COLOR.REWARD_GRADIENT_START, NEW_COLOR.REWARD_GRADIENT_END]} // Fades from light overlay to dark
                                start={{ x: 0.5, y: 0 }}
                                end={{ x: 0.5, y: 1 }}
                                style={[commonStyles.flex1, commonStyles.px24, commonStyles.pb20]}  >
                                <ViewComponent style={[commonStyles.mt30]} />
                                <PageHeader title={referDetails?.title || "GLOBAL_CONSTANTS.REFER_AND_EARN"} onBackPress={backArrowButtonHandler} rightActions={handleRightAction} />
                                <ViewComponent style={[commonStyles.sectionGap]} />
                                <ViewComponent style={[commonStyles.alignCenter]}>
                                    <TextMultiLanguage
                                        text={referDetails?.description || "GLOBAL_CONSTANTS.REFER_AND_EARN"}
                                        style={[commonStyles.textAlwaysWhite, commonStyles.fs36, commonStyles.fw700, commonStyles.textCenter]} />
                                </ViewComponent>
                            </LinearGradient>
                        </ImageBackgroundWrapper>
                        <Container>
                            <ViewComponent style={[]}>
                                {error && <ErrorComponent message={error} screen={true} />}
                                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap2, commonStyles.mb4]}>
                                    <TextMultiLanguage
                                        text={"GLOBAL_CONSTANTS.READY_TO_CLIME"}
                                        style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey]} />
                                    <ParagraphComponent
                                        text={`(${referralKpis?.cashBackCurrency || ''})`}
                                        style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey]} />
                                </ViewComponent>
                                <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.mb16, commonStyles.alignCenter]}>
                                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap4]}>
                                        <CurrencyText
                                            style={[commonStyles.fs30, commonStyles.fw700, commonStyles.textWhite]}
                                            value={referralKpis?.refferalAmount || 0}
                                        />
                                    </ViewComponent>
                                    <TouchableOpacity
                                        style={[commonStyles.alignCenter, commonStyles.justifyCenter, commonStyles.rounded20, commonStyles.px16, commonStyles.py6, {
                                            height: s(35),
                                            backgroundColor: (!referralKpis || referralAmount < (referralKpis?.minimumClaim || 5)) ? NEW_COLOR.APPLY_CARD_BG : NEW_COLOR.BG_YELLOW
                                        }]}
                                        disabled={!referralKpis || referralAmount < (referralKpis?.minimumClaim || 5)}
                                        onPress={handleClaimSheet}
                                        activeOpacity={1}
                                    >
                                        <TextMultiLanguage
                                            style={[commonStyles.fs12, commonStyles.fw500, referralAmount >= (referralKpis?.minimumClaim || 5) ? commonStyles.textAlwaysBlack : commonStyles.textlinkgrey]}
                                            text={"GLOBAL_CONSTANTS.CLIME"} />
                                    </TouchableOpacity>
                                </ViewComponent>
                                {referralAmount < (referralKpis?.minimumClaim || 5) && <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter, commonStyles.gap5, commonStyles.bordered, commonStyles.px24, commonStyles.p8, commonStyles.rounded12, commonStyles.mb16]}>
                                    <Ionicons name="alert-circle-outline" size={s(24)} color={NEW_COLOR.BG_YELLOW} />
                                    <TextMultiLanguage style={[commonStyles.fw400, commonStyles.fs14, commonStyles.textGrey]} text={"GLOBAL_CONSTANTS.MINIMUM_CLIME_AMOUNT_IS_5_USDT"} />
                                    <CurrencyText value={referralKpis?.minimumClaim} currency={referralKpis?.cashBackCurrency} decimalPlaces={0} style={[commonStyles.fw400, commonStyles.fs14, commonStyles.textGrey]} />

                                </ViewComponent>}
                            </ViewComponent>
                            <ViewComponent style={[commonStyles.dflex, commonStyles.gap20, commonStyles.p8, commonStyles.rounded12, commonStyles.rewardsbg]}>
                                <ViewComponent style={[]}>
                                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.mb6]}>
                                        <TextMultiLanguage text={"GLOBAL_CONSTANTS.INVITED_FRIENDS"}
                                            style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey]}
                                        />
                                    </ViewComponent>
                                    <ParagraphComponent
                                        style={[commonStyles.fs16, commonStyles.fw700, commonStyles.textWhite]}
                                        text={referralKpis?.inviteFriends || 0}
                                    />
                                </ViewComponent>
                                <ViewComponent style={[]}>
                                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap4, commonStyles.mb6]}>
                                        <TextMultiLanguage
                                            text={"GLOBAL_CONSTANTS.PENDING"}
                                            style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey]}
                                        />
                                        <ParagraphComponent
                                            text={`(${referralKpis?.cashBackCurrency || ''})`}
                                            style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey]} />
                                    </ViewComponent>
                                    <CurrencyText
                                        style={[commonStyles.fs16, commonStyles.fw700, commonStyles.textWhite]}
                                        value={pendingAmount}
                                        symboles={true}
                                    />
                                </ViewComponent>
                                <ViewComponent style={[]}>
                                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap4, commonStyles.mb6]}>
                                        <TextMultiLanguage
                                            text={`${t("GLOBAL_CONSTANTS.COMPLETED")}`}
                                            style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey]}
                                        />
                                        <ParagraphComponent
                                            text={`(${referralKpis?.cashBackCurrency || ''})`}
                                            style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey]} />
                                    </ViewComponent>
                                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap4]}>
                                        <CurrencyText style={[commonStyles.fs16, commonStyles.fw700, commonStyles.textWhite]}
                                            value={completedAmount} symboles={true} />
                                    </ViewComponent>
                                </ViewComponent>
                            </ViewComponent>
                            <ViewComponent style={[commonStyles.sectionGap]} />
                            <ViewComponent style={commonStyles.flex1}>
                                <TextMultiLanguage
                                    text={"GLOBAL_CONSTANTS.EARN_RULES"}
                                    style={[commonStyles.fs14, commonStyles.profileMenuItemText, commonStyles.fw700, commonStyles.mb16]}
                                />
                                <FlatList
                                    data={referralList}
                                    keyExtractor={(item) => item.id.toString()}
                                    renderItem={renderTopicItem}
                                    ListEmptyComponent={renderEmptyComponent}
                                    showsVerticalScrollIndicator={false}
                                    keyboardShouldPersistTaps="handled"
                                    contentContainerStyle={[
                                        commonStyles.pb20,
                                        referralList?.length === 0 && commonStyles.flex1
                                    ]}
                                    extraData={expandedTopicId}
                                    removeClippedSubviews={true}
                                    scrollEnabled={false}
                                />
                            </ViewComponent>


                            {(affiliateData?.state?.toLowerCase() !== "approved") && <ViewComponent style={[commonStyles.dashboardbannerbg, commonStyles.rounded10, commonStyles.dflex, commonStyles.gap16, commonStyles.alignCenter, commonStyles.sectionGap, commonStyles.p12]}>
                                <ViewComponent>
                                    <ImageUri uri={REFER_URLS.joinNowImage} height={s(48)} width={s(48)} />
                                </ViewComponent>
                                <ViewComponent style={[commonStyles.flex1]}>
                                    <TextMultiLanguage text={"GLOBAL_CONSTANTS.BECOME_A_PARTNER_AND_EARN_MORE"} style={[commonStyles.fw700, commonStyles.fs12, commonStyles.textWhite, { width: s(146) }]} />
                                </ViewComponent>
                                <ActionButton text={buttonText} disable={affiliateData?.state?.toLowerCase() === "submitted"} onPress={handleJoin} customIcon={false} width={s(83)} height={s(28)} />
                            </ViewComponent>}
                            {affiliateData?.state?.toLowerCase() === "approved" && <ButtonComponent title={"GLOBAL_CONSTANTS.INVITE_NOW"} onPress={handleReferralShare} />}
                        </Container>
                    </ViewComponent>
                </ScrollViewComponent>
            )}
            <ClaimPopup
                claimSheetRef={claimSheetRef}
                claimAmountLoader={claimAmountLoader}
                error={errorMsg}
                setError={setErrorMsg}
                onClaim={handleClaimAmount}
                onClose={closeClaimSheet}
                amount={referralKpis?.refferalAmount || undefined}
                currency={referralKpis?.cashBackCurrency}
            />
            {isInactive && (<InactiveAccountPopup isVisibleModel={isInactive} onClose={handleClose} />)}
            {kycModelVisible && <KycVerifyPopup closeModel={closekycModel} addModelVisible={kycModelVisible} />}
        </ViewComponent>
    );
};

export default Refer;