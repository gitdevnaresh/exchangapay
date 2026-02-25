import React, { useCallback, useEffect, useState } from "react";
import { useThemeColors } from '../../../../hooks/themedHook/useThemeColors';
import PageHeader from '../../../../components/pageHeader/pageHeader';
import CryptoPortfolio from "./CryptoPortfolio";
import FiatPortfolio from "./vaults/fiatAssets";
import { useLngTranslation } from "../../../../hooks/languagesHook/useLngTranslation";
import { getThemedCommonStyles } from "../../../../components/CommonStyles";
import ParagraphComponent from '../../../../components/textComponets/paragraphText/paragraph';
import SafeAreaViewComponent from "../../../../components/safeArea/safeArea";
import ViewComponent from "../../../../components/view/view";
import CommonTouchableOpacity from "../../../../components/touchableComponents/touchableOpacity";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import { BackHandler as RNBackHandler } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { CRYPTO_CONSTANTS } from "../constant";
import ProfileService from "../../../../apiServices/profile";
import { setScreenPermissions, setWalletActionFilter } from "../../../../redux/actions/actions";
import { s } from "../../../../components/theme/scale";
import CustomTabView from "../../../../components/customTabView/customTabView";
import ComingSoon from "../../../commonScreens/commingSoon/comingSoon";

const AllAssetsTabs = (props: any) => {
    const { t } = useLngTranslation();
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const dispatch = useDispatch<any>();
    const isFocused = useIsFocused();
    const subScreens = useSelector((state: any) => state.userReducer?.screenPermissions);
    const menuItems = useSelector((state: any) => state.userReducer?.menuItems);
    const walletActionFilter = useSelector((state: any) => state.userReducer?.walletActionFilter);
    const navigationSource = useSelector((state: any) => state.userReducer?.navigationSource);
    const walletsPermissionId = menuItems?.find((item: any) => item?.featureName.toLowerCase() === CRYPTO_CONSTANTS.WALLETS)?.id;
    // Set filter based on navigationSource if coming from deposit/withdraw flows
    useEffect(() => {
        if (navigationSource === 'WalletsAssetsSelector' && !walletActionFilter) {
            // Check route params for screenType to determine filter
            const screenType = props?.route?.params?.screenType;
            if (screenType) {
                dispatch(setWalletActionFilter(screenType.toLowerCase()));
            }
        }
    }, [navigationSource, walletActionFilter, props?.route?.params?.screenType]);

    useEffect(() => {
        if (walletsPermissionId && !subScreens?.Vaults) {
            ProfileService.getScreenPermissions(walletsPermissionId).then((res: any) => {
                if (res?.data) {
                    dispatch(setScreenPermissions({ Vaults: res?.data }));
                }
            }).catch((error: any) => {
            });
        }
    }, [isFocused, walletsPermissionId, subScreens.Vaults]);

    const walletsActionsPermissions = subScreens?.Vaults?.permissions;
    const CryptoWalletsPermission = walletsActionsPermissions?.tabs?.find((tab: any) => tab.name?.replaceAll(' ', '')?.toLowerCase() === CRYPTO_CONSTANTS.CRYPTO_ACTION)?.isEnabled;
    const FiatWalletsPermission = walletsActionsPermissions?.tabs?.find((tab: any) => tab.name?.replaceAll(' ', '')?.toLowerCase() === CRYPTO_CONSTANTS.FIAT_ACTION)?.isEnabled;

    const [state, setState] = useState({
        index: props?.route?.params?.initialTab ?? 0,
        routes: [],
    });

    React.useEffect(() => {
        const newRoutes = [];
        if (CryptoWalletsPermission) {
            newRoutes.push({ key: "first", title: "GLOBAL_CONSTANTS.CRYPTO" });
        }
        if (FiatWalletsPermission) {
            newRoutes.push({ key: "second", title: "GLOBAL_CONSTANTS.FIAT" });
        }
        setState(prev => ({ ...prev, routes: newRoutes }));
    }, [CryptoWalletsPermission, FiatWalletsPermission]);

    React.useEffect(() => {
        if (props?.route?.params?.initialTab !== undefined && props?.route?.params?.initialTab !== state.index) {
            setState(prev => ({ ...prev, index: props.route.params.initialTab }));
        }
    }, [props?.route?.params?.initialTab]);

    const backArrowButtonHandler = useCallback(() => {
        dispatch(setWalletActionFilter(null));
        if (navigationSource === "Dashboard") {
            props.navigation.navigate('Dashboard', { animation: 'slide_from_left', initialTab: "GLOBAL_CONSTANTS.HOME" });
        } else {
            props.navigation.navigate('Dashboard', { animation: 'slide_from_left', initialTab: "GLOBAL_CONSTANTS.WALLETS" });
        }
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
                                    commonStyles.tabtext,
                                    isActive ? commonStyles.tabactivetext : commonStyles.tabinactivetext
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
                    <FiatPortfolio
                        navigation={props.navigation}
                        route={props.route}
                        isInTab={true}
                        isActiveTab={state.index === 1}
                        screenType={props?.route?.params?.screenType||walletActionFilter}
                    />
                );
            default:
                return null;
        }
    }, [props.navigation, props.route, state.index]);

    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            <ViewComponent style={{ flex: 1, paddingHorizontal: s(24), paddingTop: s(16) }}>
                <PageHeader
                    title={
                        walletActionFilter === 'deposit' || (navigationSource === 'WalletsAssetsSelector' && props?.route?.params?.screenType === 'deposit') ? "GLOBAL_CONSTANTS.SELECT_ASSET_FOR_DEPOSIT" :
                            walletActionFilter === 'withdraw' || (navigationSource === 'WalletsAssetsSelector' && props?.route?.params?.screenType === 'withdraw') ? "GLOBAL_CONSTANTS.SELECT_ASSET_FOR_WITHDRAW" :
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
                                screenType={props?.route?.params?.screenType}
                            />
                        );
                    } else if (FiatWalletsPermission) {
                        return (
                            <FiatPortfolio
                                navigation={props.navigation}
                                route={props.route}
                                isInTab={true}
                                isActiveTab={true}
                                 screenType={props?.route?.params?.screenType||walletActionFilter}
                            />
                        );
                    } else if (CryptoWalletsPermission === false && FiatWalletsPermission === false) {
                        return (
                            <ComingSoon pageHeader={false} />
                        );
                    }
                })()}
            </ViewComponent>
        </ViewComponent>
    );
};

export default AllAssetsTabs;
