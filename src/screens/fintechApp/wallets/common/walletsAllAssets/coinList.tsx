import React, { useCallback, useEffect, useState } from "react";
import { useThemeColors } from '../../../../../hooks/themedHook/useThemeColors';
import PageHeader from '../../../../../components/pageHeader/pageHeader';
import CryptoPortfolio from "../CryptoPortfolio";
import WalletsFiatPortfolio from "./walletsFiatCoinList";
import { useLngTranslation } from "../../../../../hooks/languagesHook/useLngTranslation";
import { getThemedCommonStyles } from "../../../../../components/CommonStyles";
import ParagraphComponent from '../../../../../components/textComponets/paragraphText/paragraph';
import SafeAreaViewComponent from "../../../../../components/safeArea/safeArea";
import ViewComponent from "../../../../../components/view/view";
import CommonTouchableOpacity from "../../../../../components/touchableComponents/touchableOpacity";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import { BackHandler as RNBackHandler } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { CRYPTO_CONSTANTS } from "../../constant";
import ProfileService from "../../../../../apiServices/profile";
import { setScreenPermissions, setNavigationSource, setWalletActionFilter } from "../../../../../redux/actions/actions";
import { s } from "../../../../../components/theme/scale";
import CustomTabView from "../../../../../components/customTabView/customTabView";
import Container from "../../../../../components/container/container";
import ComingSoon from "../../../../commonScreens/commingSoon/comingSoon";

const AllCoinsList = (props: any) => {
    const { t } = useLngTranslation();
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const dispatch = useDispatch<any>();
    const isFocused = useIsFocused();
    const subScreens = useSelector((state: any) => state.userReducer?.screenPermissions);
    const menuItems = useSelector((state: any) => state.userReducer?.menuItems);
    const walletsPermissionId = menuItems?.find((item: any) => item?.featureName.toLowerCase() === CRYPTO_CONSTANTS.WALLETS)?.id;

    useEffect(() => {
        if (walletsPermissionId && !subScreens?.Vaults) {
            ProfileService.getScreenPermissions(walletsPermissionId).then((res: any) => {
                if (res?.data) {
                    dispatch(setScreenPermissions({ Vaults: res?.data }));
                }
            }).catch((error: any) => {

            });
        }
    }, [isFocused, walletsPermissionId, subScreens]);
    const walletsActionsPermissions = subScreens?.Vaults?.permissions;
    const CryptoWalletsPermission = walletsActionsPermissions?.tabs?.find((tab: any) => tab.name?.replaceAll(' ', '')?.toLowerCase() === CRYPTO_CONSTANTS.CRYPTO_ACTION)?.isEnabled;
    const FiatWalletsPermission = walletsActionsPermissions?.tabs?.find((tab: any) => tab.name?.replaceAll(' ', '')?.toLowerCase() === CRYPTO_CONSTANTS.FIAT_ACTION)?.isEnabled;
    const [state, setState] = useState({
        index: props?.route?.params?.initialTab ?? 0,
        routes: [],
    });
    useEffect(() => {
        let newRoutes: any = [];
        if (CryptoWalletsPermission) {
            newRoutes.push({ key: "first", title: "GLOBAL_CONSTANTS.CRYPTO" });
        }
        if (FiatWalletsPermission) {
            newRoutes.push({ key: "second", title: "GLOBAL_CONSTANTS.FIAT" });
        }
        setState((prevState: any) => ({ ...prevState, routes: newRoutes }));
    }, [CryptoWalletsPermission, FiatWalletsPermission]);
    React.useEffect(() => {
        if (props?.route?.params?.initialTab !== undefined && props?.route?.params?.initialTab !== state.index) {
            setState(prev => ({ ...prev, index: props.route.params.initialTab }));
        }
    }, [props?.route?.params?.initialTab]);
    const navigationSource = useSelector((state: any) => state.userReducer?.navigationSource);
    const walletActionFilter = useSelector((state: any) => state.userReducer?.walletActionFilter);

    const backArrowButtonHandler = useCallback(() => {
        const targetTab = navigationSource === "Dashboard" ? "GLOBAL_CONSTANTS.HOME" : "GLOBAL_CONSTANTS.WALLETS";
        props.navigation.navigate('Dashboard', { animation: 'slide_from_left', initialTab: targetTab });
        // Clear filter after navigation to prevent state conflicts
        setTimeout(() => {
            dispatch(setWalletActionFilter(null));
        }, 100);
    }, [props.navigation, navigationSource, dispatch]);

    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                backArrowButtonHandler();
                return true;
            };
            const subscription = RNBackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => subscription?.remove();
        }, [backArrowButtonHandler])
    );

    const _handleIndexChange = useCallback((index: number) => {
        setState(prev => ({ ...prev, index }));
    }, []);

    const renderTabBar = useCallback((tabProps: any) => {
        const active = tabProps.navigationState.index;
        return (
            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.tabBarContainer]}>
                {tabProps.navigationState.routes.map((route: any, i: number) => {
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
                                text={t(route?.title) || ""}
                            />
                        </CommonTouchableOpacity>
                    );
                })}
            </ViewComponent>
        );
    }, [commonStyles, t, _handleIndexChange]);

    const renderScene = useCallback(({ route: sceneRoute }: any) => {
        switch (sceneRoute.key) {
            case 'first':
                return (
                    <CryptoPortfolio
                        navigation={props.navigation}
                        route={props.route}
                        isInTab={true}
                        isActiveTab={state.index === 0}
                        screenType={props?.route?.params?.screenType}
                    />
                );
            case 'second':
                return (
                    <WalletsFiatPortfolio
                        navigation={props.navigation}
                        route={props.route}
                        isInTab={true}
                        screenType={props?.route?.params?.screenType}
                        isActiveTab={state.index === 1}
                    />
                );
            default:
                return null;
        }
    }, [props.navigation, props.route, state.index]);

    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            <Container style={[commonStyles.container]}>

                <ViewComponent style={{ flex: 1 }}>
                    <PageHeader
                        title={
                            // Check route params first, then walletActionFilter
                            props?.route?.params?.screenType === 'deposit' ? "GLOBAL_CONSTANTS.SELECT_ASSET_FOR_DEPOSIT" :
                                props?.route?.params?.screenType === 'withdraw' ? "GLOBAL_CONSTANTS.SELECT_ASSET_FOR_WITHDRAW" :
                                    walletActionFilter === 'deposit' ? "GLOBAL_CONSTANTS.SELECT_ASSET_FOR_DEPOSIT" :
                                        walletActionFilter === 'withdraw' ? "GLOBAL_CONSTANTS.SELECT_ASSET_FOR_WITHDRAW" :
                                            navigationSource === 'WalletsAssetsSelector' && props?.route?.params?.screenType === 'deposit' ? "GLOBAL_CONSTANTS.SELECT_ASSET_FOR_DEPOSIT" :
                                                navigationSource === 'WalletsAssetsSelector' && props?.route?.params?.screenType === 'withdraw' ? "GLOBAL_CONSTANTS.SELECT_ASSET_FOR_WITHDRAW" :
                                                    "GLOBAL_CONSTANTS.ALL_ASSETS"
                        }
                        onBackPress={backArrowButtonHandler}
                    />
                    {(() => {
                        if (CryptoWalletsPermission && FiatWalletsPermission) {
                            return (
                                <SafeAreaViewComponent style={[commonStyles.flex1]}>
                                    <CustomTabView
                                        style={{ backgroundColor: NEW_COLOR.SCREENBG_BLACK }}
                                        navigationState={state}
                                        renderScene={renderScene}
                                        renderTabBar={renderTabBar}
                                        onIndexChange={_handleIndexChange}
                                        lazy={true}
                                        lazyPreloadDistance={0}
                                    />
                                </SafeAreaViewComponent>
                            );
                        } else if (CryptoWalletsPermission) {
                            return (
                                <CryptoPortfolio
                                    navigation={props.navigation}
                                    route={props.route}
                                    isInTab={true}
                                    isActiveTab={true}
                                />
                            );
                        } else if (FiatWalletsPermission) {
                            return (
                                <WalletsFiatPortfolio
                                    navigation={props.navigation}
                                    route={props.route}
                                    isInTab={true}
                                    isActiveTab={true}
                                />
                            );
                        } else if (CryptoWalletsPermission == false && FiatWalletsPermission == false) {
                            return (
                                <ComingSoon pageHeader={false} />
                            );
                        }
                    })()}
                </ViewComponent>
            </Container>

        </ViewComponent>
    );
};

export default AllCoinsList;
