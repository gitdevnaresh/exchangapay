import React, { useCallback } from "react";
import { getThemedCommonStyles } from "../../../../../components/CommonStyles";
import ViewComponent from "../../../../../components/view/view";
import TextMultiLangauge from "../../../../../components/textComponets/multiLanguageText/textMultiLangauge";
import CommonTouchableOpacity from "../../../../../components/touchableComponents/touchableOpacity";
import FlatListComponent from "../../../../../components/flatList/flatList";
import { useThemeColors } from "../../../../../hooks/themedHook/useThemeColors";
import ParagraphComponent from "../../../../../components/textComponets/paragraphText/paragraph";
import AntDesign from 'react-native-vector-icons/AntDesign';
import { ActiveQuest } from "../interface";
import { s } from "../../../../../constants/styels/scale";
import XpIconImage from "../../../../../components/svgIcons/mainmenuicons/xpicon";
import CoinHandsIconImage from "../../../../../components/svgIcons/mainmenuicons/nandcoins";

const QuestTabButton = ({ title, isActive, onPress }: { title: string; isActive: boolean; onPress: () => void }) => {
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    return (
        <CommonTouchableOpacity
            onPress={onPress}
            style={[
                commonStyles.flex1,
                commonStyles.p10,
                commonStyles.rounded100,
                commonStyles.alignCenter,
                { backgroundColor: isActive ? NEW_COLOR.TEXT_PRIMARY : NEW_COLOR.BANNER_BG },
            ]}
        >
            <TextMultiLangauge text={title} style={[commonStyles.fs14, isActive ? commonStyles.textAlwaysWhite : commonStyles.textWhite, commonStyles.fw500]} />
        </CommonTouchableOpacity>
    );
};

interface QuestsSectionProps {
    activeTab: string;
    activeQuestTab: string;
    setActiveTab: (tab: string) => void;
    setActiveQuestTab: (tab: string) => void;
    availableCompleteQuests: any;
    activeQuestsDaata: any;
    navigation: any;
}

const QuestsSection: React.FC<QuestsSectionProps> = ({
    activeTab,
    activeQuestTab,
    setActiveTab,
    setActiveQuestTab,
    availableCompleteQuests,
    activeQuestsDaata,
    navigation
}) => {
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);

    const ViewDetails = useCallback((item: ActiveQuest) => {
        navigation.navigate('RewardViewDetails', { questDetails: item });
    }, [navigation]);

    const handleSeeAllInProgress = useCallback(() => {
        setActiveTab("quests");
        setActiveQuestTab("in-progress");
    }, [setActiveTab, setActiveQuestTab]);

    const handleSeeAllAvailable = useCallback(() => {
        setActiveTab("quests");
        setActiveQuestTab("available");
    }, [setActiveTab, setActiveQuestTab]);

    const handleSeeAllCompleted = useCallback(() => {
        setActiveTab("quests");
        setActiveQuestTab("completed");
    }, [setActiveTab, setActiveQuestTab]);

    const renderAvailableQuestItem = ({ item }: { item: ActiveQuest }) => {
        return (
            <ViewComponent style={[commonStyles.listGap]}>
                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.mb8]}>
                    <TextMultiLangauge text={item.name} style={[commonStyles.textWhite, commonStyles.fs14, commonStyles.fw700]} />
                    <CommonTouchableOpacity onPress={() => ViewDetails(item)}>
                        <TextMultiLangauge text={item?.isActive ? "GLOBAL_CONSTANTS.START_QUEST" : "GLOBAL_CONSTANTS.VIEW_DETAILS"} style={[commonStyles.textprimary, commonStyles.fw500, commonStyles.fs12]} />
                    </CommonTouchableOpacity>
                </ViewComponent>
                <ParagraphComponent text={item.description} style={[commonStyles.textlinkgrey, commonStyles.fs12, commonStyles.fw500, commonStyles.mb6]} />
                <ParagraphComponent text={`Progress: ${item.steps[0].currentCount}/${item.steps[0].targetCount}— ${item.steps[0].description}`} style={[commonStyles.textWhite, commonStyles.fs12, commonStyles.fw500, commonStyles.mb6]} />
                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10, commonStyles.mt10]}>
                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.rounded100, commonStyles.gap6, commonStyles.xppointsbg]}>
                        <XpIconImage />
                        <ParagraphComponent text={item.rewardTierPoints + " TP"} style={[commonStyles.textAlwaysWhite, commonStyles.fs12, commonStyles.fw500]} />
                    </ViewComponent>
                    {item.rewardCurrencyCode === "USDT" && (
                        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.rounded100, commonStyles.gap5, commonStyles.usdtpointsbg]}>
                            <CoinHandsIconImage />
                            <ParagraphComponent text={item.rewardAmount + " USDT"} style={[commonStyles.textAlwaysWhite, commonStyles.fs12, commonStyles.fw500]} />
                        </ViewComponent>
                    )}
                    {item.rewardCurrencyCode === "MYSTERY_BOX" && item.mysteryBoxRewardName && (
                        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.rounded100, commonStyles.gap6, commonStyles.surpriseboxbg]}>
                            <AntDesign name="gift" size={s(14)} color={NEW_COLOR.TEXT_ALWAYS_WHITE} />
                            <ParagraphComponent text={item.mysteryBoxRewardName} style={[commonStyles.textAlwaysWhite, commonStyles.fs12, commonStyles.fw500]} />
                        </ViewComponent>
                    )}
                </ViewComponent>
            </ViewComponent>
        );
    };

    if (activeTab === "home") {
        return (
            <ViewComponent>
                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.titleSectionGap]}>
                    <TextMultiLangauge text={"GLOBAL_CONSTANTS.ACTIVED_QUESTS"} style={[commonStyles.sectionTitle]} />
                    <CommonTouchableOpacity onPress={handleSeeAllInProgress} style={[commonStyles.dflex, commonStyles.alignCenter]} >
                        <TextMultiLangauge text={"GLOBAL_CONSTANTS.SEE_ALL"} style={[commonStyles.sectionLink, commonStyles.fw500]} />
                    </CommonTouchableOpacity>
                </ViewComponent>
                <ViewComponent style={[]}>
                    <FlatListComponent
                        data={availableCompleteQuests?.inProgress?.slice(0, 2) || []}
                        scrollEnabled={false}
                        keyExtractor={(item: ActiveQuest) => item.questId}
                        renderItem={renderAvailableQuestItem}
                    />
                </ViewComponent>

                <ViewComponent style={[]}>
                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.titleSectionGap]}>
                        <TextMultiLangauge text={"GLOBAL_CONSTANTS.AVAILABLE_QUESTS"} style={[commonStyles.sectionTitle]} />
                        <CommonTouchableOpacity onPress={handleSeeAllAvailable} style={[commonStyles.dflex, commonStyles.alignCenter]} >
                            <TextMultiLangauge text={"GLOBAL_CONSTANTS.SEE_ALL"} style={[commonStyles.sectionLink, commonStyles.fw500]} />
                        </CommonTouchableOpacity>
                    </ViewComponent>
                    <FlatListComponent
                        data={activeQuestsDaata || []}
                        scrollEnabled={false}
                        keyExtractor={(item: ActiveQuest) => item.questId}
                        renderItem={renderAvailableQuestItem}
                    />
                </ViewComponent>

                <ViewComponent style={[]}>
                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.titleSectionGap]}>
                        <TextMultiLangauge text={"GLOBAL_CONSTANTS.COMPLETED_QUESTS"} style={[commonStyles.sectionTitle]} />
                        <CommonTouchableOpacity onPress={handleSeeAllCompleted} style={[commonStyles.dflex, commonStyles.alignCenter]} >
                            <TextMultiLangauge text={"GLOBAL_CONSTANTS.SEE_ALL"} style={[commonStyles.sectionLink, commonStyles.fw500]} />
                        </CommonTouchableOpacity>
                    </ViewComponent>
                    <FlatListComponent
                        data={availableCompleteQuests?.completed?.slice(0, 2) || []}
                        scrollEnabled={false}
                        keyExtractor={(item: ActiveQuest) => item.questId}
                        renderItem={renderAvailableQuestItem}
                    />
                </ViewComponent>
            </ViewComponent>
        );
    } else if (activeTab === "quests") {
        return (
            <ViewComponent>
                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10]}>
                    <QuestTabButton title="GLOBAL_CONSTANTS.AVAILABLE" isActive={activeQuestTab === "available"} onPress={() => setActiveQuestTab("available")} />
                    <QuestTabButton title="GLOBAL_CONSTANTS.IN_PROGRESS" isActive={activeQuestTab === "in-progress"} onPress={() => setActiveQuestTab("in-progress")} />
                    <QuestTabButton title="GLOBAL_CONSTANTS.COMPLETED" isActive={activeQuestTab === "completed"} onPress={() => setActiveQuestTab("completed")} />
                </ViewComponent>
                <ViewComponent style={[commonStyles.mt32]}>
                    {activeQuestTab === "available" && (
                        <FlatListComponent
                            data={activeQuestsDaata || []}
                            keyExtractor={(item: ActiveQuest) => item.questId}
                            renderItem={renderAvailableQuestItem}
                        />
                    )}
                    {activeQuestTab === "in-progress" && (
                        <FlatListComponent
                            data={availableCompleteQuests?.inProgress || []}
                            keyExtractor={(item: ActiveQuest) => item.questId}
                            renderItem={renderAvailableQuestItem}
                        />
                    )}
                    {activeQuestTab === "completed" && (
                        <FlatListComponent
                            data={availableCompleteQuests?.completed || []}
                            keyExtractor={(item: ActiveQuest) => item.questId}
                            renderItem={renderAvailableQuestItem}
                        />
                    )}
                </ViewComponent>
            </ViewComponent>
        );
    }

    return null;
}
export default QuestsSection;