import React, { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { FlatList, StyleSheet } from "react-native";
import { getThemedCommonStyles } from "../../../../../components/CommonStyles";
import Container from "../../../../../components/container/container";
import { s } from "../../../../../constants/styels/scale";
import { isErrorDispaly } from "../../../../../utils/helpers";
import { useLngTranslation } from "../../../../../hooks/languagesHook/useLngTranslation";
import { ProfileGeneralServices } from '../../../../../apiServices/profile/general';
import ViewComponent from "../../../../../components/view/view";
import TextMultiLangauge from "../../../../../components/textComponets/multiLanguageText/textMultiLangauge";
import { useThemeColors } from "../../../../../hooks/themedHook/useThemeColors";
import DashboardLoader from "../../../../../components/loader";
import ErrorComponent from "../../../../../components/errorDisplay/errorDisplay";
import ParagraphComponent from "../../../../../components/textComponets/paragraphText/paragraph";
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { useNavigation } from "@react-navigation/native";
import Ionicons from 'react-native-vector-icons/Ionicons';
import moment from "moment";
import CommonTouchableOpacity from "../../../../../components/touchableComponents/touchableOpacity";
import { useHardwareBackHandler } from "../../../../../hooks/backHandleHook";
import TopUpIcon from "../../../../../components/svgIcons/cardsicons/topUpIcon";
import GraphIconImage from "../../../../../components/svgIcons/mainmenuicons/graph";
import CardPurchaseIconImage from "../../../../../components/svgIcons/mainmenuicons/cardpurchase";
import RewardsDeposistIconImage from "../../../../../components/svgIcons/mainmenuicons/rewardsdeposist";
import CoinHandsIconImage from "../../../../../components/svgIcons/mainmenuicons/nandcoins";
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';
import { AdminGiftBox } from "../../../../../assets/svg";
import PageHeader from "../../../../../components/pageHeader/pageHeader";

const ListItemSeparator = () => {
    return <ViewComponent />;
};

const YourRewardsScreen: React.FC = () => {
    const [rewardsData, setRewardsData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const userInfo = useSelector((state: any) => state.userReducer?.userDetails);
    const { t } = useLngTranslation();
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const styles = themedStyles(NEW_COLOR);
    const navigation = useNavigation<any>();

    const REWARD_TRANSACTION_TYPES: any = {
        UPGRADE: { icon: <GraphIconImage />, iconBg: NEW_COLOR.BANNER_BG },
        DEPOSIT: { icon: <RewardsDeposistIconImage />, iconBg: NEW_COLOR.BANNER_BG },
        CardPurchase: { icon: <CardPurchaseIconImage />, iconBg: NEW_COLOR.BANNER_BG },
        Topup: { icon: <TopUpIcon color={NEW_COLOR.TEXT_WHITE} width={s(16)} height={s(16)} />, iconBg: NEW_COLOR.BANNER_BG },
        TOPUP: { icon: <TopUpIcon color={NEW_COLOR.TEXT_WHITE} width={s(16)} height={s(16)} />, iconBg: NEW_COLOR.BANNER_BG },
        Consume: { icon: <Ionicons name="cart-outline" size={s(20)} color={NEW_COLOR.TEXT_WHITE} />, iconBg: NEW_COLOR.BANNER_BG },
    };

    useEffect(() => {
        getAvailableRewardsData();
    }, [userInfo?.id]);

    const getAvailableRewardsData = useCallback(async () => {
        setErrorMsg('');
        setLoading(true);
        try {
            const response: any = await ProfileGeneralServices.getYourRewardsData(userInfo?.id);
            if (response.ok) {
                setLoading(false);
                setRewardsData(response.data || []);
            } else {
                setLoading(false);
                setErrorMsg(isErrorDispaly(response));
            }
        } catch (error) {
            setLoading(false);
            setErrorMsg(isErrorDispaly(error));
        }
    }, [userInfo?.id]);

    const handleReload = useCallback(() => {
        getAvailableRewardsData();
    }, [getAvailableRewardsData]);

    const handleContinue = useCallback((Item: any) => {
        if (Item?.FinanceTxType.toLowerCase() === "consume" || Item?.FinanceTxType.toLowerCase() === "topup") {
            navigation.navigate('AllCardsList', { type: 'MyCards' });
        }
        else if (Item?.FinanceTxType.toLowerCase() === "upgrade") {
            navigation.navigate('UpgradeFees');
            return;
        } else if (Item?.FinanceTxType.toLowerCase() == "cardpurchase") {
            navigation.navigate('AllCards');
            return;
        } else if (Item?.FinanceTxType.toLowerCase() == "deposit") {
            navigation.navigate('SelectVaults', { screenName: "Deposit" });
            return;
        } else {
            navigation.navigate('ComingSoon');
        }
    }, [navigation]);

    const renderAvailableRewardsItem = ({ item }: { item: any }) => {
        const rewardValue = item?.FixedReward ?? item?.RewardPercentage;
        const rewardText = item?.RewardPercentage
            ? `Earn ${rewardValue}% ${item?.RewardCurrencyCode}`
            : `Earn ${rewardValue} ${item?.RewardCurrencyCode}`;
        const lastUpdatedDate = moment(item?.ModifiedDate).format('DD/MM/YYYY');
        const iconInfo = REWARD_TRANSACTION_TYPES[item?.FinanceTxType] || { icon: <RewardsDeposistIconImage />, iconBg: NEW_COLOR.BANNER_BG };
        return (
            <ViewComponent style={[commonStyles.listGap]}>
                <CommonTouchableOpacity onPress={() => { handleContinue(item) }} >
                    <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.mb4]}>
                        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]}>
                            <ViewComponent style={[commonStyles.iconbg]}>
                                {iconInfo.icon}
                            </ViewComponent>
                            <ViewComponent>
                                <TextMultiLangauge text={item.FinanceTxType} style={[commonStyles.primarytext]} />
                                <ParagraphComponent text={rewardText} style={[commonStyles.secondarytext]} />
                            </ViewComponent>
                        </ViewComponent>
                        <ViewComponent style={[commonStyles.alignEnd]}>
                            <TextMultiLangauge text={"GLOBAL_CONSTANTS.TIER_POINTS"} style={[commonStyles.idrsecondarytext]} />
                            <ParagraphComponent text={item?.AwardedTierPoints} style={[commonStyles.primarytext]} />
                        </ViewComponent>
                    </ViewComponent>

                    <ViewComponent style={[]}>
                        <ViewComponent style={[]}>
                            <TextMultiLangauge text={item?.IsActive ? "GLOBAL_CONSTANTS.ACTIVE" : "GLOBAL_CONSTANTS.INACTIVE"} style={[commonStyles.textWhite, commonStyles.fs14, commonStyles.fw500]} />
                        </ViewComponent>
                        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.mt6]}>
                            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap5]}>
                                <ParagraphComponent text={`${t("GLOBAL_CONSTANTS.LAST_UPDATED_BY")} ${item?.ModifiedBy}`} style={[commonStyles.textlinkgrey, commonStyles.fs12, commonStyles.fw400]} />
                            </ViewComponent>
                            <ParagraphComponent text={lastUpdatedDate} style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textWhite]} />
                        </ViewComponent>
                    </ViewComponent>

                </CommonTouchableOpacity>
            </ViewComponent>
        );
    };

    useHardwareBackHandler(() => {
        navigation.goBack();
        return true;
    });
    const renderStatsSection = () => {
        const activeRewards = rewardsData.filter((item: any) => item?.IsActive).length;
        const totalTierPoints = rewardsData.reduce((sum: number, item: any) => sum + (parseFloat(item?.AwardedTierPoints) || 0), 0);
        return (
            <ViewComponent style={[commonStyles.bannerbg, commonStyles.p12, commonStyles.rounded12, commonStyles.sectionGap]}>
                <ViewComponent style={[]}>
                    <ViewComponent style={[]}>
                    </ViewComponent>
                    <ViewComponent style={[commonStyles.alignCenter, commonStyles.mb6]}>
                        <AdminGiftBox />
                    </ViewComponent>
                    <TextMultiLangauge text="GLOBAL_CONSTANTS.REWARDS_RULES" style={[commonStyles.sectionTitle, commonStyles.textCenter]} />
                    <TextMultiLangauge
                        text="GLOBAL_CONSTANTS.LEARN_HOW_TO_EARN_REWARDS"
                        style={[commonStyles.textlinkgrey, commonStyles.fs14, commonStyles.textCenter, commonStyles.fw500, commonStyles.mt8]}
                    />
                </ViewComponent>
                <ViewComponent style={[commonStyles.dflex, commonStyles.justifyCenter, commonStyles.mt16, commonStyles.gap30]}>
                    <ViewComponent style={[]}>
                        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap6,]}>
                            <CoinHandsIconImage />
                            <ParagraphComponent text={`${activeRewards} Active Rewards`} style={[commonStyles.textWhite, commonStyles.fs12, commonStyles.fw600]} />
                        </ViewComponent>
                    </ViewComponent>
                    <ViewComponent style={[]}>
                        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap8, commonStyles.mb8]}>
                            <FontAwesome5 name="coins" size={s(18)} color={NEW_COLOR.TEXT_WHITE} />
                            <ParagraphComponent text={`${t("GLOBAL_CONSTANTS.UP_TO")} ${totalTierPoints} ${t("GLOBAL_CONSTANTS.TIER_POINTS")}`} style={[commonStyles.textWhite, commonStyles.fs12, commonStyles.fw600]} />
                        </ViewComponent>
                    </ViewComponent>
                </ViewComponent>
                <ViewComponent style={[commonStyles.alignCenter, commonStyles.mt8]}>
                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap8, commonStyles.mb8]}>
                        <SimpleLineIcons name="trophy" size={16} color={NEW_COLOR.TEXT_WHITE} />
                        <ParagraphComponent text={`${'USDT  Rewards'}`} style={[commonStyles.textWhite, commonStyles.fs12, commonStyles.fw600]} />
                    </ViewComponent>
                </ViewComponent>

            </ViewComponent>
        );
    };

    const renderContent = () => {
        if (loading) {
            return <DashboardLoader />;
        }

        if (errorMsg) {
            return <ErrorComponent message={errorMsg} onClose={() => setErrorMsg('')} />;
        }

        return (
            <ViewComponent style={[commonStyles.flex1,]}>
                {renderStatsSection()}
                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.titleSectionGap]}>
                    <TextMultiLangauge text={"GLOBAL_CONSTANTS.AVAILABLE_REWARDS"} style={[commonStyles.sectionTitle]} />
                    <ParagraphComponent text={`${rewardsData?.length} Active Rules`} style={[commonStyles.textlinkgrey, commonStyles.fs12, commonStyles.fw500]} />
                </ViewComponent>
                <ViewComponent style={[commonStyles.flex1]}>
                    <FlatList
                        data={rewardsData}
                        scrollEnabled={true}
                        showsVerticalScrollIndicator={false}
                        nestedScrollEnabled={true}
                        keyExtractor={(item) => item.Id}
                        renderItem={renderAvailableRewardsItem}
                        ItemSeparatorComponent={ListItemSeparator}
                        contentContainerStyle={styles.flatListContent}
                    />
                </ViewComponent>
            </ViewComponent>
        );
    };

    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            <Container style={commonStyles.container}>
                <PageHeader
                    title={"GLOBAL_CONSTANTS.YOUR_REWARDS"}
                    onBackPress={() => { navigation.goBack() }}
                    isrefresh={true}
                    onRefresh={handleReload}
                />
                {renderContent()}
            </Container>
        </ViewComponent>
    );
};

export default YourRewardsScreen;

const themedStyles = (NEW_COLOR: any) => StyleSheet.create({
    contentContainer: {
        paddingHorizontal: s(16),
    },
    flatListContainer: {
        flex: 1,
    },
    flatListContent: {
        flexGrow: 1,
        paddingBottom: s(20),
    }
});
