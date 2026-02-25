import React, { useCallback, useState, useRef } from "react";
import { StyleSheet, Dimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { getThemedCommonStyles } from "../../../../../components/CommonStyles";
import { useThemeColors } from "../../../../../hooks/themedHook/useThemeColors";
import PageHeader from "../../../../../components/pageHeader/pageHeader";
import { useHardwareBackHandler } from "../../../../../hooks/backHandleHook";
import ParagraphComponent from "../../../../../components/textComponets/paragraphText/paragraph";
import { s } from "../../../../../constants/styels/scale";
import CryptoPayInGrid from "../cryptoPayin/cryptoPayInList/index";
import ViewComponent from "../../../../../components/view/view";
import CommonTouchableOpacity from "../../../../../components/touchableComponents/touchableOpacity";
import FiatPayin from "../fiatPayin";
import CustomRBSheet from "../../../../../components/models/commonBottomSheet";
import Entypo from '@expo/vector-icons/Entypo';
import CreateStaticIcon from '../../../../../components/svgIcons/mainmenuicons/staticPayinIcon';
import CreateInvoiceIcon from '../../../../../components/svgIcons/mainmenuicons/invoiceAddIcon';
import TextMultiLanguage from "../../../../../components/textComponets/multiLanguageText/textMultiLangauge";
import ButtonComponent from "../../../../../components/buttons/button";
import { PAYMENT_LINK_CONSTENTS } from "../../constants";
import AddIcon from "../../../../../components/addCommonIcon/addCommonIcon";
import { getTabsConfigation } from "../../../../../../cofiguration";
import CustomTabView from "../../../../../components/customTabView/customTabView";



const PayInGrid = (props: any) => {
    const navigation = useNavigation<any>();
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const styles = themedStyles(NEW_COLOR);
    const refRBSheet = useRef<any>();
    const [isNavigating, setIsNavigating] = useState(false);
    const paymentConfig = getTabsConfigation('PAYMENTS');

    const availableRoutes = [];
    if (paymentConfig.FIAT_PAYINS) {
        availableRoutes.push({ key: "fiat", title: "Fiat" });
    }
    if (paymentConfig.CRYPTO_PAYINS) {
        availableRoutes.push({ key: "crypto", title: "Crypto" });
    }

    const showTabs = paymentConfig.FIAT_PAYINS && paymentConfig.CRYPTO_PAYINS;

    const [state, setState] = useState({
        index: props?.route?.params?.initialTab ?? 0,
        routes: availableRoutes,
    });

    React.useEffect(() => {
        if (props?.route?.params?.initialTab !== undefined && props?.route?.params?.initialTab !== state.index) {
            setState(prev => ({ ...prev, index: props.route.params.initialTab }));
        }
    }, [props?.route?.params?.initialTab]);

    const _handleIndexChange = useCallback((index: number) => {
        setState(prev => ({ ...prev, index }));
    }, []);

    const renderScene = useCallback(({ route }: any) => {
        switch (route.key) {
            case 'fiat':
                return (
                    <>
                        <ViewComponent style={[commonStyles.mt32]} />
                        <FiatPayin
                            navigation={navigation}
                            route={props.route}
                            isInTab={true}
                            isActiveTab={state.index === 0}
                            currentTabIndex={state.index}
                        />
                    </>
                );
            case 'crypto':
                return (
                    <>
                        <ViewComponent style={[commonStyles.mt32]} />
                        <CryptoPayInGrid
                            navigation={navigation}
                            route={props.route}
                            isInTab={true}
                            isActiveTab={state.index === 1}
                            currentTabIndex={state.index}
                        />
                    </>
                );
            default:
                return null;
        }
    }, [navigation, props.route, state.index]);

    useHardwareBackHandler(() => {
        backArrowButtonHandler();
        return true;
    });

    const backArrowButtonHandler = useCallback(() => {
        if (props.route.params?.fromScreen === "Dashboard") {
            navigation.goBack();
        } else {
            navigation.navigate("Dashboard", { animation: 'slide_from_left', initialTab: "GLOBAL_CONSTANTS.PAYMENTS" });
        }
    }, [navigation]);

    const handleRedirectToAddPersolForm = () => {
        if (refRBSheet.current) {
            refRBSheet.current.open();
        }
    };
    const handleRedirectToInvoice = () => {
        if (isNavigating) return;
        setIsNavigating(true);
        refRBSheet?.current?.close();
        navigation.navigate(PAYMENT_LINK_CONSTENTS.INVOICE_FORM, { returnTab: state.index });
        setTimeout(() => setIsNavigating(false), 1000);
    };
    const handleRedirectToStatic = () => {
        if (isNavigating) return;
        setIsNavigating(true);
        refRBSheet?.current?.close();
        navigation.navigate(PAYMENT_LINK_CONSTENTS.CREATE_PAYMENT, { returnTab: state.index });
        setTimeout(() => setIsNavigating(false), 1000);
    };

    const addIcon = (
        <ViewComponent style={[commonStyles.actioniconbg]} >
            <AddIcon onPress={handleRedirectToAddPersolForm} />
        </ViewComponent>
    );

    const renderTabBar = useCallback((tabProps: any) => {
        const active = tabProps?.navigationState?.index;
        return (
            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, styles.tabBarContainer]}>
                {tabProps?.navigationState?.routes.map((route: any, i: number) => {
                    const isActive = active === i;
                    return (
                        <CommonTouchableOpacity
                            key={route.key}
                            style={[
                                commonStyles.tabButton,
                                isActive ? commonStyles.activeTabButton : commonStyles.inactiveTabButton,
                            ]}
                            activeOpacity={0.8}
                            onPress={() => _handleIndexChange(i)}
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
    }, [commonStyles, styles, _handleIndexChange]);

    const shouldShowAddIcon = () => {
        if (showTabs) {
            // When tabs are shown, show icon only on the 'crypto' tab
            const currentRoute = state.routes[state.index];
            return currentRoute?.key === 'crypto';
        }
        // When only one view is shown, show icon if it's the crypto view
        return paymentConfig.CRYPTO_PAYINS && !paymentConfig.FIAT_PAYINS;
    };

    return (
        <ViewComponent style={[commonStyles.screenBg, commonStyles.flex1]}>
            <ViewComponent style={{ flex: 1, paddingHorizontal: s(24), paddingTop: s(24) }}>
                <PageHeader
                    title={"GLOBAL_CONSTANTS.PAYIN_TITLE"}
                    onBackPress={backArrowButtonHandler}
                    rightActions={shouldShowAddIcon() ? addIcon : null}
                />

                {showTabs ? (
                    <CustomTabView
                        style={{ flex: 1, backgroundColor: NEW_COLOR.SCREENBG_BLACK }}
                        navigationState={state}
                        renderScene={renderScene}
                        renderTabBar={renderTabBar}
                        onIndexChange={_handleIndexChange}
                        initialLayout={{ width: Dimensions.get('window').width }}
                        lazy={true}
                        lazyPreloadDistance={0}
                    />
                ) : (
                    <ViewComponent style={{ flex: 1 }}>
                        {paymentConfig.FIAT_PAYINS && (
                            <FiatPayin
                                navigation={navigation}
                                route={props.route}
                                isInTab={true}
                                isActiveTab={true}
                                currentTabIndex={0}
                            />
                        )}
                        {paymentConfig.CRYPTO_PAYINS && (
                            <CryptoPayInGrid
                                navigation={navigation}
                                route={props.route}
                                isInTab={true}
                                isActiveTab={true}
                                currentTabIndex={0}
                            />
                        )}
                    </ViewComponent>
                )}
            </ViewComponent>

            {/* Common RBSheet for Crypto actions */}
            <CustomRBSheet height={"Small"} refRBSheet={refRBSheet} title="">
                <ViewComponent style={[commonStyles.sheetHeaderbg]}>
                    <ViewComponent>
                        <CommonTouchableOpacity onPress={handleRedirectToStatic}>
                            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, { width: '100%', paddingHorizontal: 2 },]}>
                                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]}>
                                    <ViewComponent style={[commonStyles.bottomsheeticonbg]}>
                                        <CreateStaticIcon color={NEW_COLOR.TEXT_WHITE} />
                                    </ViewComponent>
                                    <TextMultiLanguage style={[commonStyles.textWhite, commonStyles.fs14, commonStyles.fw500, commonStyles.textCenter, commonStyles.mt5]} text={"GLOBAL_CONSTANTS.CREATE_STATIC"} />
                                </ViewComponent>
                                <Entypo name="chevron-small-right" size={24} color={NEW_COLOR.TEXT_WHITE} />
                            </ViewComponent>
                        </CommonTouchableOpacity>
                        <ViewComponent style={[commonStyles.listGap]} />
                        <CommonTouchableOpacity onPress={handleRedirectToInvoice}>
                            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, { width: '100%', paddingHorizontal: 2 },]}>
                                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]}>
                                    <ViewComponent style={[commonStyles.bottomsheeticonbg]}>
                                        <CreateInvoiceIcon color={NEW_COLOR.TEXT_WHITE} />
                                    </ViewComponent>
                                    <TextMultiLanguage style={[commonStyles.textWhite, commonStyles.fs14, commonStyles.fw500, commonStyles.textCenter, commonStyles.mt5]} text={"GLOBAL_CONSTANTS.CREATE_INVOICE"} />
                                </ViewComponent>
                                <Entypo name="chevron-small-right" size={24} color={NEW_COLOR.TEXT_WHITE} />
                            </ViewComponent>
                        </CommonTouchableOpacity>
                    </ViewComponent>
                    <ViewComponent style={commonStyles.sectionGap} />
                    <ButtonComponent title={"GLOBAL_CONSTANTS.CLOSE"} solidBackground={true} onPress={() => refRBSheet?.current?.close()} />
                </ViewComponent>
            </CustomRBSheet>
        </ViewComponent>
    );
};

export default PayInGrid;

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

