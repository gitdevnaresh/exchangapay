import React, { useCallback } from "react";
import { getThemedCommonStyles } from "../../../../../components/CommonStyles";
import { s } from "../../../../../constants/styels/scale";
import ViewComponent from "../../../../../components/view/view";
import TextMultiLangauge from "../../../../../components/textComponets/multiLanguageText/textMultiLangauge";
import CommonTouchableOpacity from "../../../../../components/touchableComponents/touchableOpacity";
import { useThemeColors } from "../../../../../hooks/themedHook/useThemeColors";
import ImageUri from "../../../../../components/imageComponents/image";
import { CurrencyText } from "../../../../../components/textComponets/currencyText/currencyText";
import ParagraphComponent from "../../../../../components/textComponets/paragraphText/paragraph";
import AntDesign from 'react-native-vector-icons/AntDesign';
import { LinearGradient } from "expo-linear-gradient";
import { useLngTranslation } from "../../../../../hooks/languagesHook/useLngTranslation";
// import LineProgressBar from "../../../../../components/progressCircle/lineprogressbar";

const TabButton = ({ title, isActive, onPress }: { title: string; isActive: boolean; onPress: () => void }) => {
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    return (
        <CommonTouchableOpacity onPress={onPress}
            style={[commonStyles.px9, commonStyles.py8, commonStyles.rounded5, { borderBottomWidth: isActive ? 4 : 0, borderBottomColor: isActive ? NEW_COLOR.TEXT_PRIMARY : 'transparent' }]}>
            <TextMultiLangauge text={title} style={[commonStyles.fs16, commonStyles.fw600, { color: isActive ? NEW_COLOR.TEXT_PRIMARY : NEW_COLOR.TEXT_WHITE }]} />
        </CommonTouchableOpacity>
    );
};

interface RewardsHeaderProps {
    userInfo: any;
    rewardsData: any;
    activeTab: string;
    setActiveTab: (tab: string) => void;
    navigation: any;
}

const RewardsHeader: React.FC<RewardsHeaderProps> = ({
    userInfo,
    rewardsData,
    activeTab,
    setActiveTab,
    navigation
}) => {
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const { t } = useLngTranslation();

    const handleNavToYourRewards = useCallback(() => {
        navigation.navigate('YourRewardsScreen');
    }, [navigation]);

    return (
        <ViewComponent style={[commonStyles.sectionGap]}>
            <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.mb20]}>
                <ViewComponent style={commonStyles.flex1}>
                    <TextMultiLangauge text={"GLOBAL_CONSTANTS.WELCOME_BACK"} style={[commonStyles.fw600, commonStyles.fs22, commonStyles.textWhite, commonStyles.mb6]} />
                    <ParagraphComponent text={userInfo?.name} style={[commonStyles.fw600, commonStyles.fs22, commonStyles.textWhite, commonStyles.mb6]} />
                    <TextMultiLangauge text={"GLOBAL_CONSTANTS.UNLOCK_ACHIEVEMENTS_TRACK_YOUR"} style={[commonStyles.fs12, commonStyles.fw500, commonStyles.textWhite, commonStyles.mb6]} />
                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap6]}>
                        <CommonTouchableOpacity onPress={handleNavToYourRewards} >
                            <TextMultiLangauge text={"GLOBAL_CONSTANTS.KNOWN_YOUR_REWARS"} onPress={handleNavToYourRewards} style={[commonStyles.textprimary, commonStyles.fw500]} />
                        </CommonTouchableOpacity>
                        <AntDesign name="arrowright" size={16} style={[commonStyles.textprimary, commonStyles.mt2]} />
                    </ViewComponent>
                </ViewComponent>
                <ViewComponent style={[commonStyles.alignCenter]}>
                    <ImageUri style={[commonStyles.mxAuto]} width={s(70)} height={s(70)} uri="https://devtstarthaone.blob.core.windows.net/arthaimages/arthapay-mobile-images/fees_tier_logo.svg" />
                    <ParagraphComponent text={rewardsData?.tierInfo?.name} style={[commonStyles.fw600, commonStyles.fs16, commonStyles.textWhite, commonStyles.mt4]} />
                </ViewComponent>
            </ViewComponent>

            <LinearGradient
                colors={[NEW_COLOR.REWARD_BG, NEW_COLOR.REWARD2_BG]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[commonStyles.sectionGap, commonStyles.p16, commonStyles.rounded12]}
            >
                <ViewComponent style={[]}>
                    <ViewComponent style={[commonStyles.flex1, commonStyles.alignEnd, commonStyles.mb10]}>
                        <CurrencyText value={`${rewardsData?.tierInfo?.nextTierXp || 10000}`} decimalPlaces={0} style={[commonStyles.fw400, commonStyles.fs12, commonStyles.textWhite, commonStyles.mt4, commonStyles.alignEnd]} prifix={'Next Tier:'} />
                    </ViewComponent>
                    <ViewComponent style={[commonStyles.flex1, commonStyles.alignCenter, commonStyles.mb10]}>
                        {/* {rewardsData && <LineProgressBar progress={rewardsData?.experiencePoints} total={rewardsData?.tierInfo?.nextTierXp} backgroundColor={NEW_COLOR.PROGRESS_BAR} />} */}
                    </ViewComponent>
                    <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter]} >
                        <ViewComponent style={[commonStyles.flex1]}>
                            <TextMultiLangauge text={'GLOBAL_CONSTANTS.TO_NEXT_TIER'} style={[commonStyles.fw500, commonStyles.fs12, commonStyles.textWhite]} />
                            <CurrencyText value={`${rewardsData?.tierInfo?.nextTierXp - rewardsData?.experiencePoints || 8600}`} decimalPlaces={0} style={[commonStyles.fw500, commonStyles.fs12, commonStyles.textWhite, commonStyles.mt6, commonStyles.textLeft]} currency={t("GLOBAL_CONSTANTS.TP")} />
                        </ViewComponent>
                        <ViewComponent style={[commonStyles.flex1]}>
                            <TextMultiLangauge text={'GLOBAL_CONSTANTS.MULTIPLIER_X'} style={[commonStyles.fw500, commonStyles.fs12, commonStyles.textWhite]} />
                            <CurrencyText value={`${rewardsData?.tierInfo?.rewardMultiplier || 1}`} decimalPlaces={0} style={[commonStyles.fw500, commonStyles.fs12, commonStyles.textWhite, commonStyles.mt6, commonStyles.textLeft]} prifix={'x'} />
                        </ViewComponent>
                        <ViewComponent style={[commonStyles.flex1]}>
                            <TextMultiLangauge text={'GLOBAL_CONSTANTS.NEXT_TP_REQUIREMENT'} style={[commonStyles.fw500, commonStyles.fs12, commonStyles.textWhite]} />
                            <CurrencyText value={`${rewardsData?.tierInfo?.nextTierXp || 10000}`} decimalPlaces={0} style={[commonStyles.fw500, commonStyles.fs12, commonStyles.textWhite, commonStyles.mt6, commonStyles.textLeft]} currency={t("GLOBAL_CONSTANTS.TP")} />
                        </ViewComponent>
                    </ViewComponent>
                    <ViewComponent style={[commonStyles.flex1, commonStyles.mt10]}>
                        <TextMultiLangauge text={"GLOBAL_CONSTANTS.YOUR_TIER_WILL_RESET_ON"} style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textWhite]} />
                    </ViewComponent>
                </ViewComponent>
            </LinearGradient>

            {/* Tabs */}
            <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, { borderBottomWidth: 1, borderBottomColor: NEW_COLOR.SECTION_BORDER }]}>
                <TabButton title="GLOBAL_CONSTANTS.HOME" isActive={activeTab === "home"} onPress={() => setActiveTab("home")} />
                <TabButton title="GLOBAL_CONSTANTS.QUESTS" isActive={activeTab === "quests"} onPress={() => setActiveTab("quests")} />
                <TabButton title="GLOBAL_CONSTANTS.MY_STERY_BOX" isActive={activeTab === "mystery_box"} onPress={() => setActiveTab("mystery_box")} />
            </ViewComponent>
        </ViewComponent>
    );
};

export default RewardsHeader;