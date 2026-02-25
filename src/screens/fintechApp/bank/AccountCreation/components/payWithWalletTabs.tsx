import React, { useCallback, useState, useEffect, useMemo } from "react";
import { BackHandler } from "react-native";
import { useSelector } from "react-redux";
import { useNavigation, useIsFocused } from '@react-navigation/native';
import PayWithCryptoWallet from "./payWithCryptoWallet";
import PayWithFiatCurrencies from "./payWithFiatWallet";
import { s } from "../../../../../components/theme/scale";
import DashboardLoader from "../../../../../components/loader";
import ErrorComponent from "../../../../../components/errorDisplay/errorDisplay";
import ViewComponent from "../../../../../components/view/view";
import SafeAreaViewComponent from "../../../../../components/safeArea/safeArea";
import CustomTabView, { SceneMap } from "../../../../../components/customTabView/customTabView";
import PageHeader from "../../../../../components/pageHeader/pageHeader";
import Paragraph from "../../../../../components/textComponets/paragraphText/paragraph";
import CommonTouchableOpacity from "../../../../../components/touchableComponents/touchableOpacity";
import { isErrorDispaly } from "../../../../../utils/helpers";
import ProfileService from "../../../../../apiServices/profile";
import { getThemedCommonStyles } from "../../../../../components/CommonStyles";
import { useLngTranslation } from "../../../../../hooks/languagesHook/useLngTranslation";
import { useThemeColors } from "../../../../../hooks/themedHook/useThemeColors";

const PayWithWalletTabs = React.memo((props: any) => {
    const initialIndex = 0;
    const { t } = useLngTranslation();
    const NEW_COLOR = useThemeColors();
    const commonStyles = useMemo(() => getThemedCommonStyles(NEW_COLOR), [NEW_COLOR]);
    const navigation = useNavigation<any>();
    const isFocused = useIsFocused();
    const routes = useMemo(() => [
        { key: "first", title: "GLOBAL_CONSTANTS.FIAT" },
        { key: "second", title: "GLOBAL_CONSTANTS.CRYPTO" }
    ], []);
    const [state, setState] = useState<any>({
        index: initialIndex,
        routes,
    });
    const [hasTabSwitched, setHasTabSwitched] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errormsg, setErrormsg] = useState<string | null>(null);
    const _frist = () => {
        const bankFromParams = props?.route?.params?.selectedBank;
        const finalSelectedBank = selectedBank || bankFromParams;
        return (
            <PayWithFiatCurrencies {...props} isActiveTab={hasTabSwitched ? state.index === 0 : true} selectedBank={finalSelectedBank} isFocused={isFocused} />
        );
    };
    const _second = () => {
        const bankFromParams = props?.route?.params?.selectedBank;
        const finalSelectedBank = selectedBank || bankFromParams;
        return (
            <PayWithCryptoWallet {...props} isActiveTab={hasTabSwitched ? state.index === 1 : false} selectedBank={finalSelectedBank} isFocused={isFocused} />
        );
    };

    const selectedBank = useSelector((state: any) => state.userReducer?.selectedBank);
    const handleBackPress = async () => {
        setLoading(true);
        try {
            const bankFromParams = props?.route?.params?.selectedBank;
            const finalSelectedBank = selectedBank || bankFromParams;

            if (finalSelectedBank?.productId) {
                const detailsRes = await ProfileService.kycInfoDetails(finalSelectedBank.productId);

                if (detailsRes?.ok && detailsRes.data?.kyc?.provider?.toLowerCase() === "sumsub") {
                    setLoading(false);
                    // Navigate to CreateAccountForm instead of going back to BankKYCScreen
                    navigation.navigate('createAccountForm', {
                        animation: 'slide_from_left'
                    });
                    return;
                }
            }
        } catch (error) {
            setErrormsg(isErrorDispaly(error));
        }

        setLoading(false);
        // Default back behavior
        if (props?.backArrowButtonHandler) {
            props.backArrowButtonHandler();
        } else {
            navigation.goBack();
        }
    };

    useEffect(() => {
        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            () => { handleBackPress(); return true; }
        );
        return () => backHandler.remove();
    }, []);

    const _handleIndexChange = (index: any) => {
        setHasTabSwitched(true);
        setState({ ...state, index });
    };
    const renderTabBar = useCallback((props: any) => {
        const active = props.navigationState.index;
        return (
            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.tabBarContainer, { overflow: 'hidden' }]}>
                {props.navigationState.routes.map((route: any, i: number) => {
                    const isActive = active === i;
                    const isFirstTab = i === 0;
                    const isLastTab = i === props.navigationState.routes.length - 1;

                    const tabStyleList: any[] = [
                        commonStyles.tabButton,
                        isActive ? commonStyles.activeTabButton : commonStyles.inactiveTabButton,
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
                        <CommonTouchableOpacity
                            key={route.key}
                            style={tabStyleList}
                            activeOpacity={0.8}
                            onPress={() => {
                                if (state.index !== i) {
                                    setState({ ...state, index: i });
                                }
                            }}
                        >
                            <Paragraph
                                style={[
                                    commonStyles.fs16,
                                    commonStyles.fw600,
                                    isActive ? commonStyles.textWhite : commonStyles.textGrey
                                ]}
                                text={t(route?.title) || ""}
                            />
                        </CommonTouchableOpacity>
                    );
                })}
            </ViewComponent>
        );
    }, [commonStyles, state]);

    const renderScene = SceneMap({
        first: _frist,
        second: _second
    });
    const handleCloseError = useCallback(() => {
        setErrormsg(null);
    }, []);

    if (loading) {
        return <DashboardLoader />;
    }

    return (
        <ViewComponent style={[commonStyles.screenBg, commonStyles.flex1]}>
            <ViewComponent style={{ flex: 1, paddingHorizontal: s(24), paddingTop: s(24) }}>
                <SafeAreaViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
                    <PageHeader title={"GLOBAL_CONSTANTS.PAY_WITH_WALLET"} onBackPress={handleBackPress} />
                    {errormsg && <ErrorComponent message={errormsg} onClose={handleCloseError} />}
                    <CustomTabView
                        style={{ backgroundColor: NEW_COLOR.SCREENBG_BLACK }}
                        navigationState={state}
                        renderScene={renderScene}
                        renderTabBar={renderTabBar}
                        onIndexChange={_handleIndexChange}
                    />
                </SafeAreaViewComponent>
            </ViewComponent>
        </ViewComponent>
    );
});

export default PayWithWalletTabs;



