import React, { useCallback, useState, useEffect } from "react";
import { StyleSheet, Dimensions } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

import { getThemedCommonStyles } from "../../../../../components/CommonStyles";
import { useThemeColors } from "../../../../../hooks/themedHook/useThemeColors";
import { useHardwareBackHandler } from "../../../../../hooks/backHandleHook";

import PageHeader from "../../../../../components/pageHeader/pageHeader";
import ViewComponent from "../../../../../components/view/view";
import CommonTouchableOpacity from "../../../../../components/touchableComponents/touchableOpacity";
import ParagraphComponent from "../../../../../components/textComponets/paragraphText/paragraph";

import { s } from "../../../../../constants/styels/scale";
import PayOutCoins from "../crypto/vaultLists";
import FiatCoinLIst from "../fiat/fiatCoinsLIst";
import { getTabsConfigation } from '../../../../../../configuration';
import { useSelector } from "react-redux";
import CustomTabView, { SceneMap } from "../../../../../components/customTabView/customTabView";

// --- Scenes for the TabView ---


const PayOutList = () => {
    const navigation = useNavigation<any>();
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const styles = themedStyles(NEW_COLOR);
    const route = useRoute<any>();
    const userInfo = useSelector((state: any) => state.userReducer?.userDetails);
    const paymentConfig = getTabsConfigation('PAYMENTS');

    const availableRoutes = [];
    if (paymentConfig.FIAT_PAYOUTS) {
        availableRoutes.push({ key: "fiat", title: "Fiat" });
    }
    if (paymentConfig.CRYPTO_PAYOUTS) {
        availableRoutes.push({ key: "crypto", title: "Crypto" });
    }

    const showTabs = paymentConfig.FIAT_PAYOUTS && paymentConfig.CRYPTO_PAYOUTS;

    const [index, setIndex] = useState(() => {
        const params = route.params;
        return params?.initialTab ?? params?.selectedTab ?? params?.tabIndex ?? 0;
    });

    // Handle initial tab from navigation params
    useEffect(() => {
        const params = route.params;
        if (params?.initialTab !== undefined) {
            setIndex(params.initialTab);
        } else if (params?.selectedTab !== undefined) {
            setIndex(params.selectedTab);
        } else if (params?.tabIndex !== undefined) {
            setIndex(params.tabIndex);
        }
    }, [route.params]);
    const FiatPayoutScene = () => <FiatCoinLIst isActive={showTabs ? index === 0 : true} />;
    const CryptoPayoutScene = () => <PayOutCoins isActive={showTabs ? index === 0 : true} />

    // --- SceneMap for rendering tabs ---
    const renderScene = showTabs ? SceneMap({
        fiat: FiatPayoutScene,
        crypto: CryptoPayoutScene,
    }) : SceneMap({
        default: FiatPayoutScene,
    });

    // --- Back Handler ---
    useHardwareBackHandler(() => {
        backArrowButtonHandler();
        return true;
    });

    const backArrowButtonHandler = useCallback(() => {
        if (route.params?.fromScreen === "Dashboard") {
            navigation.goBack();
            return;
        } else {
            navigation.navigate("Dashboard", { animation: 'slide_from_left', initialTab: "GLOBAL_CONSTANTS.PAYMENTS" });
        }
    }, [navigation]);

    // --- Custom TabBar Renderer ---
    const renderTabBar = useCallback((props: any) => {
        return (
            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, styles.tabBarContainer]}>
                {props.navigationState.routes.map((route: any, i: number) => {
                    const isActive = props.navigationState.index === i;
                    return (
                        <CommonTouchableOpacity
                            key={route.key}
                            style={[
                                commonStyles.tabButton,
                                isActive ? commonStyles.activeTabButton : commonStyles.inactiveTabButton,
                            ]}
                            activeOpacity={0.8}
                            onPress={() => setIndex(i)}
                        >
                            <ParagraphComponent
                                style={[
                                    commonStyles.fs16,
                                    commonStyles.fw600,
                                    isActive ? commonStyles.textWhite : commonStyles.textGrey
                                ]}
                                text={route?.title || ""}
                            />
                        </CommonTouchableOpacity>
                    );
                })}
            </ViewComponent>
        );
    }, [commonStyles, styles, NEW_COLOR]);

    return (
        <ViewComponent style={{ flex: 1, backgroundColor: NEW_COLOR.SCREENBG_BLACK }}>
            <ViewComponent style={{ flex: 1, paddingHorizontal: 24, paddingTop: 16 }}>
                <PageHeader
                    title={"GLOBAL_CONSTANTS.PAY_OUT"}
                    onBackPress={backArrowButtonHandler}
                />

                {showTabs ? (
                    <CustomTabView
                        style={[{ flex: 1 }]}
                        navigationState={{ index, routes: availableRoutes }}
                        renderScene={renderScene}
                        renderTabBar={renderTabBar}
                        onIndexChange={setIndex}
                        initialLayout={{ width: Dimensions.get('window').width }}
                        lazy={true}
                    />
                ) : (
                    paymentConfig.FIAT_PAYOUTS ? (
                        <ViewComponent style={{ flex: 1 }}>
                            {paymentConfig.FIAT_PAYOUTS && (
                                <FiatCoinLIst
                                    isActive={true}
                                />
                            )}
                        </ViewComponent>) : (
                        <PayOutCoins isActive={showTabs ? index === 0 : true} />
                    )
                )
                }
            </ViewComponent>
        </ViewComponent>
    );
};

// --- Themed Styles ---
const themedStyles = (NEW_COLOR: any) => StyleSheet.create({
    tabBarContainer: {
        backgroundColor: NEW_COLOR.TAB_BAR_BG,
        borderRadius: s(100) / 2,
        height: s(40),
        borderWidth: 1,
        borderColor: NEW_COLOR.INPUT_BORDER
    },
    tabButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: s(8),
    },
    activeTabButton: {
        backgroundColor: NEW_COLOR.PAY_ACTIVE_BG,
        borderRadius: s(100) / 2,
    },
    inactiveTabButton: {
        backgroundColor: 'transparent',
    },
});

export default PayOutList;
