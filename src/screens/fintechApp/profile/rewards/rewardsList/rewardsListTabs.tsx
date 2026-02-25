import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native"; // Import useRoute
import { getThemedCommonStyles } from "../../../../../components/CommonStyles";
import { useThemeColors } from "../../../../../hooks/themedHook/useThemeColors";
import PageHeader from "../../../../../components/pageHeader/pageHeader";
import CommonTouchableOpacity from "../../../../../components/touchableComponents/touchableOpacity";
import ParagraphComponent from "../../../../../components/textComponets/paragraphText/paragraph";
import ViewComponent from "../../../../../components/view/view";
import { s } from "../../../../../components/theme/scale";
import { useHardwareBackHandler } from "../../../../../hooks/backHandleHook";
import { isErrorDispaly } from "../../../../../utils/helpers";
import { ActiveQuest, UserInfo } from "../interface"; // Assuming ActiveQuest is defined here or similar
import { useSelector } from "react-redux";
import DashboardLoader from "../../../../../components/loader";
import ErrorComponent from "../../../../../components/errorDisplay/errorDisplay";
import FlatListComponent from "../../../../../components/flatList/flatList";
import ImageUri from "../../../../../components/imageComponents/image";
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import AntDesign from 'react-native-vector-icons/AntDesign';
import TextMultiLangauge from "../../../../../components/textComponets/multiLanguageText/textMultiLangauge";
import NoDataComponent from "../../../../../components/noData/noData";
import CustomTabView, { SceneMap } from "../../../../../components/customTabView/customTabView";
import { ProfileGeneralServices } from "../../../../../apiServices/profile/general";

// ListItemSeparator for FlatList
const ListItemSeparator = () => {
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    return <ViewComponent style={[commonStyles.mb10]} />;
};

// Helper function to render an individual quest item
const renderQuestItem = (item: ActiveQuest, NEW_COLOR: any, commonStyles: any) => {
    return (
        <ViewComponent style={[commonStyles.listCardBg, commonStyles.rounded10, commonStyles.p16]}>
            <TextMultiLangauge text={item.name || item?.questName} style={[commonStyles.pageTitle]} />
            <ParagraphComponent text={item.description || item?.questDescription} style={[commonStyles.textlinkgrey, commonStyles.fs12, commonStyles.mt4]} />
            <ParagraphComponent text={`Progress: ${item.steps[0].currentCount}/${item.steps[0].targetCount}� ${item.steps[0].description}`} style={[commonStyles.textWhite, commonStyles.fs12, commonStyles.mt4]} />
            <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.mt16]}>
                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.rounded10, commonStyles.p6, commonStyles.gap5, { backgroundColor: NEW_COLOR.TEXT_GREEN }]}>
                    <ImageUri width={s(20)} height={s(20)} uri={"https://storageaccountdott.blob.core.windows.net/mlmimages/Wallets.svg"} />
                    <ParagraphComponent text={item.rewardTierPoints + " TP"} style={[commonStyles.textWhite, commonStyles.fs14]} />
                </ViewComponent>
                <ViewComponent >
                    {item.rewardCurrencyCode === "USDT" && (
                        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.rounded10, commonStyles.p6, commonStyles.gap5, { backgroundColor: NEW_COLOR.TEXT_PRIMARY }]}>
                            <FontAwesome6 name="hand-holding-dollar" size={s(20)} color={NEW_COLOR.TEXT_WHITE} />
                            <ParagraphComponent text={item.rewardAmount + " USDT"} style={[commonStyles.textWhite, commonStyles.fs14]} />
                        </ViewComponent>
                    )}
                    {item.rewardCurrencyCode === "MYSTERY_BOX" && item.mysteryBoxRewardName && (
                        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.rounded10, commonStyles.p6, commonStyles.gap5, { backgroundColor: NEW_COLOR.TEXT_GREEN }]}>
                            <AntDesign name="gift" size={s(20)} color={NEW_COLOR.TEXT_WHITE} />
                            <ParagraphComponent text={item.mysteryBoxRewardName} style={[commonStyles.textWhite, commonStyles.fs14]} />
                        </ViewComponent>
                    )}
                </ViewComponent>
                <CommonTouchableOpacity >
                    <TextMultiLangauge text={"GLOBAL_CONSTANTS.VIEW_DETAILS"} style={[commonStyles.textprimary, commonStyles.fw500]} />
                </CommonTouchableOpacity>
            </ViewComponent>
        </ViewComponent>
    );
};

const RewardsList = (props: any) => {
    const navigation = useNavigation<any>();
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const styles = themedStyles(NEW_COLOR);

    const [dataLoading, setDataLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string>("");
    const [activeQuestsData, setActiveQuestsData] = useState<any>({
        available: [],
        inProgress: [],
        completed: []
    });
    const userInfo = useSelector(
        (state: { userReducer: { userDetails: UserInfo } }) =>
            state.userReducer?.userDetails
    );

    // Define routes for the tabs
    const routes = [
        { key: "available", title: "Available" },
        { key: "in-progress", title: "In Progress" },
        { key: "completed", title: "Completed" }
    ];

    // Initial tab from props
    const initialTabKey = props.route.params?.tab || "available";
    const resolvedInitialIndex = routes.findIndex(route => route.key === initialTabKey);

    const [state, setState] = useState<any>({
        index: resolvedInitialIndex !== -1 ? resolvedInitialIndex : 0,
        routes,
    });
    const activeTabKey = routes[state.index]?.key;
    useEffect(() => {
        if (userInfo?.id) {
            getAvailableComplteRewardsData(activeTabKey);
        }
    }, [userInfo?.id, activeTabKey]);

    useHardwareBackHandler(() => {
        backArrowButtonHandler();
    });

    const backArrowButtonHandler = useCallback(() => {
        navigation.goBack();
    }, [navigation]);

    const getAvailableComplteRewardsData = useCallback(async (activetab: string) => {
        setDataLoading(true);
        setErrorMsg("");
        try {
            const response: any = await ProfileGeneralServices.getActiveRewardsData(activetab, userInfo?.id);
            if (response.ok) {
                setDataLoading(false);
                setActiveQuestsData(response?.data);
            } else {
                setDataLoading(false);
                setErrorMsg(isErrorDispaly(response));
            }
        } catch (error) {
            setDataLoading(false);
            setErrorMsg(isErrorDispaly(error));
        }
    }, [userInfo?.id]);

    const _handleIndexChange = useCallback((index: number) => {
        setState((prev: any) => ({ ...prev, index }));
    }, []);



    const _renderRewards = useCallback(() => {
        let content;

        if (dataLoading) {
            content = <DashboardLoader />;
        } else if (errorMsg) {
            content = <ErrorComponent message={errorMsg} onClose={() => setErrorMsg("")} />;
        } else {
            content = (
                <FlatListComponent
                    data={activeQuestsData || []}
                    scrollEnabled={true}
                    keyExtractor={(item: ActiveQuest) => item.questId}
                    renderItem={({ item }) => renderQuestItem(item, NEW_COLOR, commonStyles)}
                    ItemSeparatorComponent={ListItemSeparator}
                    ListEmptyComponent={<NoDataComponent />}
                />
            );
        }

        return <ViewComponent style={commonStyles.flex1}>{content}</ViewComponent>;
    }, [activeQuestsData, dataLoading, errorMsg, NEW_COLOR, commonStyles]);
    const renderScene = SceneMap({
        available: _renderRewards,
        'in-progress': _renderRewards, // Use the correct key here
        completed: _renderRewards,
    });

    const _renderTabBar = useCallback((props: any) => {
        const active = props.navigationState.index;
        return (
            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, styles.tabBarContainer]}>
                {props.navigationState.routes.map((route: any, i: number) => {
                    const isActive = active === i;
                    const isFirstTab = i === 0;
                    const isLastTab = i === props.navigationState.routes.length - 1;

                    const tabStyleList: any[] = [
                        styles.tabButton,
                        isActive ? styles.activeTabButton : styles.inactiveTabButton,
                    ];

                    if (isFirstTab) {
                        tabStyleList.push({
                            borderTopLeftRadius: s(30),
                            borderBottomLeftRadius: s(30),
                            ...(isLastTab && {
                                borderTopRightRadius: s(30),
                                borderBottomRightRadius: s(30),
                            }),
                        });
                    } else if (isLastTab) {
                        tabStyleList.push({
                            borderTopRightRadius: s(30),
                            borderBottomRightRadius: s(30),
                        });
                    }

                    return (
                        <CommonTouchableOpacity key={route.key} style={tabStyleList} activeOpacity={0.8} onPress={() => setState({ ...state, index: i })}>
                            <ParagraphComponent
                                style={[commonStyles.fs16, commonStyles.fw600, isActive ? commonStyles.textWhite : commonStyles.textGrey]}
                                text={route?.title || ""} />
                        </CommonTouchableOpacity>
                    );
                })}
            </ViewComponent>
        );
    }, [commonStyles, styles, state]);

    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            <ViewComponent style={{ flex: 1, paddingHorizontal: s(24), paddingTop: s(24) }}>
                <PageHeader title={"GLOBAL_CONSTANTS.QUESTS"} onBackPress={backArrowButtonHandler} />
                <CustomTabView
                    style={{ backgroundColor: NEW_COLOR.SCREENBG_BLACK }}
                    navigationState={state}
                    renderScene={renderScene}
                    renderTabBar={_renderTabBar}
                    onIndexChange={_handleIndexChange}
                />
            </ViewComponent>
        </ViewComponent>
    );
};

export default RewardsList;

const themedStyles = (NEW_COLOR: any) => StyleSheet.create({
    tabBarContainer: {
        backgroundColor: NEW_COLOR.TAB_BAR_BG,
        borderRadius: s(100) / 2,
        height: s(40),
        borderWidth: 1,
        borderColor: NEW_COLOR.INPUT_BORDER,
        marginHorizontal: s(16),
        marginBottom: s(10)
    },
    tabButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: s(8),
    },
    activeTabButton: {
        backgroundColor: NEW_COLOR.PAY_ACTIVE_BG,
    },
    inactiveTabButton: {
        backgroundColor: 'transparent',
    },
    listCardBg: { // Added a style for the quest list item background
        backgroundColor: NEW_COLOR.TAB_BAR_BG, // Example background, adjust as needed
    }
});
