import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FlatList, useWindowDimensions, LayoutAnimation, UIManager, Platform, ActivityIndicator, Keyboard, TouchableOpacity } from 'react-native';
import ViewComponent from '../../newComponents/view/view';
import CommonTouchableOpacity from '../../newComponents/touchableComponents/touchableOpacity';
import ParagraphComponent from '../../newComponents/textComponets/paragraphText/paragraph';
import { Feather, Ionicons } from '@expo/vector-icons';
import { s } from '../../newComponents/theme/scale';
import { useThemeColors } from '../../hooks/useThemeColors';
import { getThemedCommonStyles } from '../../assets/styles/CommonStyles';
import { useActionLogging } from '../../hooks/loggingHook';
import ProfileService from '../../services/profile';
import { showAppToast } from '../../newComponents/ToasterMessages/ShowMessage';
import { isErrorDispaly } from '../../utils/helpers';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import SwokipayDashboardLoader from '../../newComponents/swokipayloader';
import Container from '../../newComponents/container/container';
import PageHeader from '../../newComponents/pageHeader/pageHeader';
import NoDataComponent from '../../newComponents/noData/noData';
import { useHardwareBackHandler } from '../../hooks/HardwareBackHandler';
import RenderHTML from 'react-native-render-html';
import ImageBackgroundWrapper from '../../newComponents/imageComponents/ImageBackground';
import { LinearGradient } from 'expo-linear-gradient';
import TextMultiLanguage from '../../newComponents/textComponets/multiLanguageText/textMultiLangauge';
import ScrollViewComponent from '../../newComponents/scrollView/scrollView';
import TransactionIcon from '../../assets/mainmenuicons/transactionfilter';
import { RewardsTopic, KpiDetails } from './interface';
import { CurrencyText } from '../../newComponents/textComponets/currencyText/currencyText';
import { useLngTranslation } from '../../hooks/useLngTranslation';
import { REWARDS_URLS } from '../../assets/blobUrls';
import WithdrawPopup from './WithdrawPopup';
import ErrorComponent from '../../newComponents/errorDisplay/errorDisplay';
import { useSelector } from 'react-redux';
import InactiveAccountPopup from '../commonScreens/inactiveSheet/accountInactive';


if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const Rewards = (props: any) => {
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const { logEvent } = useActionLogging();
    const { width } = useWindowDimensions();
    const [filteredTopics, setFilteredTopics] = useState<RewardsTopic[]>([]);
    const [expandedTopicId, setExpandedTopicId] = useState<string | number | null>(null);
    const [accordionContent, setAccordionContent] = useState<string>('');
    const [isAccordionLoading, setIsAccordionLoading] = useState<boolean>(false);
    const navigation = useNavigation<any>();
    const isFocused = useIsFocused();
    const chatOption = props.route?.params?.chatOption;
    const [cryptobackDetails, setCryptobackDetails] = useState<any>({});
    const [kpiDetails, setKpiDetails] = useState<KpiDetails | null>(null)
    const [rewardsLoader, setRewardLoader] = useState<boolean>(true);
    const rbsheetRef = useRef<any>(null)
    const [withdrawAmountLoader, setWithdrawAmountLoader] = useState<boolean>(false)
    const { t } = useLngTranslation();
    const [error, setError] = useState<string>('');
    const [isInActive, setIsInactive] = useState<boolean>(false);
    const userInfo = useSelector((state: any) => state.userReducer?.userDetails);
    const [apiCallsCompleted, setApiCallsCompleted] = useState({
        earnList: false,
        cryptoBack: false,
        kpi: false,
    });
    useEffect(() => {
        const allCompleted = Object.values(apiCallsCompleted).every(Boolean);
        if (allCompleted) setRewardLoader(false);

    }, [apiCallsCompleted]);

    useEffect(() => {
        if (isFocused) {
            setRewardLoader(true);
            setApiCallsCompleted({ earnList: false, cryptoBack: false, kpi: false });
            fetchEarnList();
            fetchCryptoBackDetails();
            fecthKpiDetails();
        }
    }, [isFocused]);;
    useHardwareBackHandler(() => {
        handleGoBack();
        return true;
    });
    const onRefresh = async () => {
        setRewardLoader(true);
        await Promise.all([
            fetchEarnList(),
            fetchCryptoBackDetails(),
            fecthKpiDetails(), // <- trailing comma is fine, no semicolon here
        ]);
        setRewardLoader(false);
    };
    const handleWithdrawAmount = async () => {
        setError("");

        if (kpiDetails?.cashBackEarned <= 5) {
            setError(isErrorDispaly(t('GLOBAL_CONSTANTS.MINIMUM_WITHDRAW_AMOUNT_IS') + ' 5 ' + (kpiDetails?.cashBackCurrency || 'USD')));
            return;
        }
        setWithdrawAmountLoader(true);      // start loader
        try {
            const response: any = await ProfileService.withDrawReward();
            if (response.status == 200) {
                showAppToast(t('GLOBAL_CONSTANTS.WITHDRAW_SUCCESSFUL'), 'success');
                rbsheetRef.current?.close();
                await onRefresh();
            }
            else {
                setError(isErrorDispaly(response));
            }
            // refresh all API data
        } catch (error) {
            setError(isErrorDispaly(error));
        } finally {
            setWithdrawAmountLoader(false);   // stop loader (runs on success or error)
        }
    };
    const closeInactiveAccountPopup = () => {
        setIsInactive(false);
    };
    const fetchEarnList = useCallback(async () => {
        setError("");
        setRewardLoader(true);
        try {
            const response: any = await ProfileService.getRewardsEarnList();
            if (response.status === 200) {
                const data = response.data;
                setFilteredTopics(data);
            } else {
                setError(isErrorDispaly(response));
            }
        } catch (err: any) {
            setError(isErrorDispaly(err));
            logEvent('api_error', {
                screename: 'SearchForHelp',
                actionName: 'Fetch Support Topics Error',
                actionType: 'API',
            });
        } finally {
            setApiCallsCompleted((prev) => ({ ...prev, earnList: true }));
        }
    }, [chatOption, logEvent]);
    const fetchCryptoBackDetails = async () => {
        setError("");
        setRewardLoader(true)
        try {
            const response: any = await ProfileService.getCryptoBackDetails();
            if (response?.status === 200) {
                setCryptobackDetails(response?.data);
            } else {
                setError(isErrorDispaly(response));
            }
        } catch (error) {
            setError(isErrorDispaly(error));
        }
        finally {
            setApiCallsCompleted((prev) => ({ ...prev, cryptoBack: true }));
        }
    }
    const fecthKpiDetails = async () => {
        setError("");
        try {
            const response: any = await ProfileService.getKpiDetails();
            if (response?.status === 200) {
                setKpiDetails(response?.data);
            } else {
                setError(isErrorDispaly(response));
            }
        } catch (error) {
            setError(isErrorDispaly(error));
        } finally {
            setApiCallsCompleted((prev) => ({ ...prev, kpi: true }));
        }
    }
    // API call to fetch details for a single accordion item
    const fetchTopicDetails = useCallback(async (topicId: string | number) => {
        setError("");
        try {
            setIsAccordionLoading(true);
            setAccordionContent('');
            const response: any = await ProfileService.getEarnDetails(topicId);
            if (response.status === 200) {
                Keyboard.dismiss();
                setAccordionContent(response.data);
                setIsAccordionLoading(false);
            } else {
                setError(isErrorDispaly(response));
                setIsAccordionLoading(false);
                setExpandedTopicId(null); // Close accordion on error
            }
        } catch (err: any) {
            setError(isErrorDispaly(err));
            setIsAccordionLoading(false);
            setExpandedTopicId(null); // Close accordion on error
        }
    }, []);
    // Handle topic item press to toggle the accordion
    const handleTopicPress = useCallback((topic: RewardsTopic) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        const isAlreadyOpen = expandedTopicId === topic.id;
        if (isAlreadyOpen) {
            setExpandedTopicId(null); // Close the accordion
            setAccordionContent('');
            Keyboard.dismiss();
        } else {
            setExpandedTopicId(topic.id); // Open the new accordion
            logEvent('accordion_toggle', {
                screename: 'CryptoBackRewards',
                actionName: 'Accordion Opened',
                actionType: 'UI_Interaction',
                topicId: topic.id,
            });
            fetchTopicDetails(topic.id); // Fetch content for it
        }
    }, [expandedTopicId, fetchTopicDetails, logEvent]);

    // Render individual support topic accordion item
    const renderTopicItem = (({ item }: { item: RewardsTopic; }) => {
        const isExpanded = expandedTopicId === item.id;
        return (
            <ViewComponent style={[commonStyles.profileMenulistGap]}>
                <CommonTouchableOpacity
                    onPress={() => handleTopicPress(item)}
                    activeOpacity={0.95}
                >
                    <ViewComponent style={[commonStyles.accordionCardStyle]}>
                        {/* Header row */}
                        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent]}>
                            <ViewComponent style={[commonStyles.flex1]}>
                                <ParagraphComponent
                                    text={item.heading || item.title || ''}
                                    style={[commonStyles.profileMenuItemText]}
                                    multiLanguageAllows={false}
                                />
                                {item?.description && !isExpanded && (
                                    <ViewComponent style={[commonStyles.mt6]}>
                                        <ParagraphComponent text={item.description}
                                            style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textGrey]}
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
                        {/* Inline expanded content (inside same card) */}
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
        )
    });
    // Render empty state
    const renderEmptyComponent = useCallback(() => (
        <ViewComponent style={[commonStyles.container, commonStyles.myAuto]}>
            <NoDataComponent />
        </ViewComponent>
    ), [commonStyles]);

    //function to handle back navigation
    const handleGoBack = () => {
        navigation.goBack();
        logEvent('navigation_action', {
            screename: 'SearchForHelp',
            actionName: 'Go Back',
            actionType: 'Button',
        });
    };
    const handleTransactions = () => {
        navigation.navigate("CryptoBackTransactionList")
    }
    const handleRightAction = (
        <ViewComponent style={[]}>
            <CommonTouchableOpacity onPress={handleTransactions}>
                <TransactionIcon />
            </CommonTouchableOpacity>
        </ViewComponent>
    );
    const handleWithdrawSheet = () => {
        if (userInfo?.customerAccountStatus === false) {
            setIsInactive(true);
            return;
        }
        rbsheetRef?.current?.open()
        setError("")
    }
    const closeRbSheetSheet = () => {
        rbsheetRef?.current?.close()
        setError("")
    };

    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            {rewardsLoader && <SwokipayDashboardLoader />}
            {!rewardsLoader && (
                <ScrollViewComponent onRefresh={onRefresh}>
                    <ViewComponent>
                        <ImageBackgroundWrapper
                            source={{ uri: cryptobackDetails?.imageUrl || REWARDS_URLS.rewardsBanner }}
                            style={{ height: s(311), width: '100%' }}
                            imageStyle={{ resizeMode: 'cover' }} >
                            <LinearGradient
                                colors={[NEW_COLOR.REWARD_GRADIENT_START, NEW_COLOR.REWARD_GRADIENT_END]} // Fades from light overlay to dark
                                start={{ x: 0.5, y: 0 }}
                                end={{ x: 0.5, y: 1 }}
                                style={[commonStyles.flex1, commonStyles.px24, commonStyles.pb20]} // This style makes it fill the container
                            >
                                <ViewComponent style={[commonStyles.mt30]} />
                                <PageHeader title={`${"GLOBAL_CONSTANTS.CRYPTOBACK_REWARDS"}`} onBackPress={handleGoBack} rightActions={handleRightAction} />
                                <ViewComponent style={[commonStyles.sectionGap]} />
                                <ViewComponent style={[commonStyles.alignCenter]}>
                                    <TextMultiLanguage text={cryptobackDetails?.description}
                                        style={[commonStyles.textAlwaysWhite, commonStyles.fs36, commonStyles.fw700, commonStyles.textCenter]} />
                                </ViewComponent>
                            </LinearGradient>
                        </ImageBackgroundWrapper>
                        <Container>
                            <ViewComponent style={[]}>
                                {error && <ErrorComponent message={error} screen={true} />}
                                {<ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap2]}>
                                    <TextMultiLanguage
                                        text={"GLOBAL_CONSTANTS.READY_TO_WITHDRAW"}
                                        style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey, commonStyles.mb12]} />
                                    <ParagraphComponent
                                        text={`(${kpiDetails?.cashBackCurrency || 'USDT'})`}
                                        style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey, commonStyles.mb12]} />
                                </ViewComponent>}
                                <ViewComponent style={
                                    [commonStyles.dflex, commonStyles.justifyContent, commonStyles.mb16, commonStyles.alignCenter]}>
                                    {/* Left side: logo + amount */}
                                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap4]}>
                                        <CurrencyText style={[commonStyles.fs30, commonStyles.fw700, commonStyles.textWhite]} value={kpiDetails?.cashBackEarned} />
                                    </ViewComponent>
                                    {/* Right side: Withdraw button */}
                                    <TouchableOpacity
                                        style={[commonStyles.alignCenter, commonStyles.justifyCenter, commonStyles.rounded20, commonStyles.px16, commonStyles.py6, {
                                            height: s(35),
                                            backgroundColor: (!kpiDetails || (Number.parseFloat(kpiDetails?.cashBackEarned || '0') < (kpiDetails?.minimumWithdraw))) ? NEW_COLOR.APPLY_CARD_BG : NEW_COLOR.BG_YELLOW,
                                        }]}
                                        disabled={!kpiDetails || (Number.parseFloat(kpiDetails?.cashBackEarned || '0') < (kpiDetails?.minimumWithdraw))}
                                        onPress={handleWithdrawSheet}
                                        activeOpacity={1}
                                    >
                                        <TextMultiLanguage
                                            style={[commonStyles.fs12, commonStyles.fw500, Number.parseFloat(kpiDetails?.cashBackEarned || '0') >= (kpiDetails?.minimumWithdraw || 5) ? commonStyles.textAlwaysBlack : commonStyles.textlinkgrey]}
                                            text={"GLOBAL_CONSTANTS.WITHDRAW"}
                                        />
                                    </TouchableOpacity>
                                </ViewComponent>

                            </ViewComponent>

                            {Number.parseFloat(kpiDetails?.cashBackEarned || '0') < (kpiDetails?.minimumWithdraw || 5) && <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter, commonStyles.gap5, commonStyles.bordered, commonStyles.px24, commonStyles.py10, commonStyles.rounded12, commonStyles.mb16]}>
                                <Ionicons name="alert-circle-outline" size={s(24)} color={NEW_COLOR.BG_YELLOW} />
                                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent]}>
                                    <TextMultiLanguage style={[commonStyles.fw400, commonStyles.fs14, commonStyles.textGrey]} text={"GLOBAL_CONSTANTS.MINIMUM_WITHDRAW_AMOUNT_IS_5_USDT"} />
                                    <CurrencyText value={kpiDetails?.minimumWithdraw} currency={kpiDetails?.cashBackCurrency}decimalPlaces={0} style={[commonStyles.fw400, commonStyles.fs14, commonStyles.textGrey]} />
                                </ViewComponent>
                            </ViewComponent>}
                            <ViewComponent style={[commonStyles.dflex,commonStyles.alignCenter, commonStyles.justifyContent,commonStyles.rewardsbg,commonStyles.p10, commonStyles.rounded12,]}>
                            <ViewComponent style={[commonStyles.dflex, commonStyles.gap12, commonStyles.flexWrap ]}>
                                <ViewComponent style={[]}>
                                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap4, commonStyles.mb6]}>
                                        <TextMultiLanguage text={"GLOBAL_CONSTANTS.PENDING"}
                                            style={[commonStyles.fs12, commonStyles.fw400, commonStyles.fw500, commonStyles.textlinkgrey]} />
                                        <ParagraphComponent
                                            text={`(${kpiDetails?.cashBackCurrency || 'USDT'})`}
                                            style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey]}
                                        />
                                    </ViewComponent>
                                    <CurrencyText style={[commonStyles.fs16, commonStyles.fw700, commonStyles.textWhite]} value={kpiDetails?.pending} symboles={true} />
                                </ViewComponent>
                                <ViewComponent style={[]}>
                                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap4, commonStyles.mb6]}>
                                        <TextMultiLanguage
                                            text={`${t("GLOBAL_CONSTANTS.COMPLETED")}`}
                                            style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey]}
                                        />
                                        <ParagraphComponent
                                            text={`(${kpiDetails?.cashBackCurrency || 'USDT'})`}
                                            style={[
                                                commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey]}
                                        />
                                    </ViewComponent>
                                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap4]}>
                                        <CurrencyText style={[commonStyles.fs16, commonStyles.fw700, commonStyles.textWhite]} value={kpiDetails?.completed} symboles={true} />
                                    </ViewComponent>
                                </ViewComponent>
                            </ViewComponent>                         
                 <CommonTouchableOpacity style={[commonStyles.shareIconBg,commonStyles.alignCenter,commonStyles.justifyCenter]} onPress={handleTransactions}>
                <TransactionIcon color={NEW_COLOR.INPUTFIELD_ICONCOLOR} />
              </CommonTouchableOpacity>
                            </ViewComponent>
                            <ViewComponent style={[commonStyles.sectionGap]} />
                            <ViewComponent style={commonStyles.flex1}>
                                <TextMultiLanguage
                                    text={"GLOBAL_CONSTANTS.EARN_RULES"}
                                    style={[commonStyles.fs14, commonStyles.profileMenuItemText, commonStyles.fw700, commonStyles.mb16]}
                                />
                                <FlatList
                                    data={filteredTopics}
                                    keyExtractor={(item) => item.id.toString()}
                                    renderItem={renderTopicItem}
                                    ListEmptyComponent={renderEmptyComponent}
                                    showsVerticalScrollIndicator={false}
                                    keyboardShouldPersistTaps="handled"
                                    contentContainerStyle={[
                                        commonStyles.sectionGap,
                                        filteredTopics?.length === 0 && commonStyles.flex1
                                    ]}
                                    extraData={expandedTopicId} // Ensures re-render on accordion state change
                                    removeClippedSubviews={true}
                                    scrollEnabled={false}
                                />
                            </ViewComponent>
                        </Container>
                    </ViewComponent>
                    {isInActive && (
                        <InactiveAccountPopup
                            isVisibleModel={isInActive}
                            onClose={closeInactiveAccountPopup}
                        />
                    )}
                    <WithdrawPopup
                        withdrawSheetRef={rbsheetRef}
                        withdrawLoader={withdrawAmountLoader}
                        error={error}
                        setError={setError}
                        onWithdraw={handleWithdrawAmount}
                        onClose={closeRbSheetSheet}
                        amount={Number.parseFloat(kpiDetails?.cashBackEarned || '0')}
                        currency={kpiDetails?.cashBackCurrency}
                    />
                </ScrollViewComponent>
            )}
        </ViewComponent>
    );
};

export default Rewards;