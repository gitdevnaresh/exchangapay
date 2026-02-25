import React, { useCallback, useState, useRef, useEffect } from "react";
import { StyleSheet, BackHandler } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { getThemedCommonStyles } from "../../../../components/CommonStyles";
import { useThemeColors } from "../../../../hooks/themedHook/useThemeColors";
import AddressbookCrypto from "./crytoPayee/addressbookCrypto";
import CommonTouchableOpacity from "../../../../components/touchableComponents/touchableOpacity";
import ParagraphComponent from "../../../../components/textComponets/paragraphText/paragraph";
import ViewComponent from "../../../../components/view/view";
import { s } from "../../../../components/theme/scale";
import { ADD_BOOK_CONST } from "./constants";
import { setScreenInfo, setScreenPermissions } from "../../../../redux/actions/actions";
import CustomRBSheet from "../../../../components/models/commonBottomSheet";
import TextMultiLanguage from "../../../../components/textComponets/multiLanguageText/textMultiLangauge";
import ButtonComponent from "../../../../components/buttons/button";
import { ADD_RECIPIENT } from "./fiatPayee/addRecipient/constant";
import { AntDesign, Entypo, SimpleLineIcons } from "@expo/vector-icons";
import ProfileService from "../../../../apiServices/profile";
import SafeAreaViewComponent from "../../../../components/safeArea/safeArea";
import KycVerifyPopup from "../../../commonScreens/kycVerify";
import CustomTabView, { SceneMap } from "../../../../components/customTabView/customTabView";
import { isErrorDispaly } from "../../../../utils/helpers";
import AddressbookService from "../../../../apiServices/profile/general/addressbook";
import AddIcon from "../../../../components/addCommonIcon/addCommonIcon";
import ComingSoon from "../../../commonScreens/commingSoon/comingSoon";
import PageHeader from "../../../../components/pageHeader/pageHeader";
import AddressbookFiat from "./fiatPayee/addressbookFiat";
import { getTabsConfigation } from "../../../../../cofiguration";
const Addressbook = (props: any) => {
    const dispatch = useDispatch<any>();
    const isFocused = useIsFocused();
    const subScreens = useSelector((state: any) => state.userReducer?.screenPermissions);
    const menuItems = useSelector((state: any) => state.userReducer?.menuItems);
    const payeesPermissionId = menuItems?.find((item: any) => item?.featureName.toLowerCase() === ADD_BOOK_CONST.PAYEES || item?.featureName.toLowerCase() === ADD_BOOK_CONST.ADDRESS_BOOK)?.id;
    const commonConfiguartion = getTabsConfigation("COMMON_CONFIGURATION");

    useEffect(() => {
        if (payeesPermissionId && !subScreens?.Payees) {
            ProfileService.getScreenPermissions(payeesPermissionId).then((res: any) => {
                if (res?.data) {
                    dispatch(setScreenPermissions({ Payees: res?.data }));
                }
            }).catch((error: any) => {
            });
        }
    }, [isFocused, payeesPermissionId, subScreens.Payees]);


    const walletsActionsPermissions = subScreens?.Payees?.permissions;
    const CryptoWalletsPermission = walletsActionsPermissions?.tabs?.find((tab: any) => tab.name?.replaceAll(' ', '')?.toLowerCase() === ADD_BOOK_CONST.CRYPTO_ACTION)?.isEnabled;
    const FiatWalletsPermission = walletsActionsPermissions?.tabs?.find((tab: any) => tab.name?.replaceAll(' ', '')?.toLowerCase() === ADD_BOOK_CONST.FIAT_ACTION)?.isEnabled;
    const isFirstTab = (name: string) => ["Addressbook", "dynamicTabs", "InitialTab"].includes(name);
    const initialIndex = isFirstTab(props?.route?.params?.screenName) ? 0 : 1;

    const navigation = useNavigation<any>();
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const styles = themedStyles(NEW_COLOR);
    const refRBSheet = useRef<any>();
    const userinfo = useSelector((state: any) => state.userReducer?.userDetails);
    const [recepientDynamicFeieldDetails, setRecepientDynamicFeieldDetails] = useState<any>(null);
    const [errormsg, setErrormsg] = useState<string>('');
    const [state, setState] = useState<any>({
        index: initialIndex,
        routes: [],
        kycModelVisible: false
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

    const _frist = useCallback(() => (
        <AddressbookCrypto accountId={props.route?.params?.accountId} navigation={navigation} route={props.route} />
    ), [props.route?.params?.accountId, navigation, props.route]
    );

    const _second = useCallback(() => (
        <AddressbookFiat accountId={props.route?.params?.accountId} navigation={navigation} route={props.route} />
    ), [props.route?.params?.accountId, navigation, props.route]);
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
                backArrowButtonHandler();
                return true;
            });
            return () => {
                backHandler.remove();
            };
        }, 100);
        return () => {
            clearTimeout(timeoutId);
        };
    }, []);
    const backArrowButtonHandler = () => {
        if (props?.route?.params?.screenName === "dynamicTabs") {
            navigation.navigate("Dashboard", { initialTab: "GLOBAL_CONSTANTS.HOME" });
        } else {
            navigation.navigate("NewProfile", { animation: 'slide_from_left' });
        }
    }
    const getRecepientDynamicFeieldDetails = async (tabIndex: number = state.index) => {
        setErrormsg('');
        try {
            const response: any = tabIndex === 0
                ? await AddressbookService?.getRecipientDynamicFeildsCrypto()
                : await AddressbookService?.getRecipientDynamicFeildsFiat();
            if (response?.ok) {
                const parsedDetails = typeof response?.data === "string" ? JSON?.parse(response?.data) : response?.data;
                setRecepientDynamicFeieldDetails(parsedDetails);
            } else {
                setErrormsg(isErrorDispaly(response));
            }
        } catch (error) {
            setErrormsg(isErrorDispaly(error));
        }
    };

    useEffect(() => {
        if (state.routes.length > 0) {
            getRecepientDynamicFeieldDetails(state.index);
        }
    }, [state.index, state.routes]);

    const _handleIndexChange = (index: any) => {
        setState({ ...state, index });
        getRecepientDynamicFeieldDetails(index);
    };


    const renderScene = SceneMap({
        first: _frist,
        second: _second,
    });

    const _renderTabBar = useCallback((props: any) => {
        const active = props.navigationState.index;
        return (
            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.tabBarContainer]}>
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
                            ...(isLastTab && {
                                borderTopRightRadius: s(30),
                                borderBottomRightRadius: s(30),
                            }),
                        });
                    } else if (isLastTab) {
                        tabStyleList.push({
                            // borderTopRightRadius: s(30),
                            // borderBottomRightRadius: s(30),
                        });
                    }

                    return (
                        <CommonTouchableOpacity
                            key={route.key}
                            style={[
                                commonStyles.tabButton,
                                isActive ? commonStyles.activeTabButton : commonStyles.inactiveTabButton,
                            ]}
                            activeOpacity={0.8}
                            onPress={() => setState({ ...state, index: i })}
                        >
                            <ParagraphComponent
                                style={[
                                    commonStyles.tabtext,
                                    isActive ? commonStyles.tabactivetext : commonStyles.tabinactivetext
                                ]}
                                text={route?.title || ""}
                            />
                        </CommonTouchableOpacity>
                    );
                })}
            </ViewComponent>
        );
    }, [commonStyles, styles, state]);

    const handleRedirectToAddPersolForm = () => {
        if (state.index === 1 && userinfo?.kycStatus?.toLowerCase() !== "approved") {
            setState({ ...state, kycModelVisible: true });
            return;
        } else if ((commonConfiguartion?.IS_SKIP_KYC_VERIFICATION_STEP !== true) && (state.index === 0 && userinfo?.kycStatus?.toLowerCase() !== "approved")) {
            setState({ ...state, kycModelVisible: true });
            return;
        }

        const accountTypeField = recepientDynamicFeieldDetails?.account?.find((field: any) => field.field?.toLowerCase() === 'accounttypedetails');
        if (!accountTypeField?.isEnable) {
            // Direct navigation based on user account type when accountTypeField is disabled
            const accountType = userinfo?.accountType?.toLowerCase() === 'business' ? ADD_RECIPIENT.BUSINESS : ADD_RECIPIENT.PERSIONAL;

            if (state.index === 0) { // Crypto tab
                dispatch(setScreenInfo(props?.route?.name));
                navigation.navigate(ADD_BOOK_CONST.ADD_CONTACT_COMPONENT, { screenName: "Addressbook", accountType });
            } else { // Fiat tab
                props?.navigation?.push("AccountDetails", {
                    walletCode: props?.route?.params?.walletCode,
                    logo: props?.route?.params?.logo,
                    accountType
                });
            }
            return;
        }

        if (state.index === 0) { // Crypto tab is active
            if (userinfo?.payeeCompliance?.toLowerCase() !== ADD_RECIPIENT.BASIC) {
                refRBSheet?.current?.open();
            } else {
                dispatch(setScreenInfo(props?.route?.name));
                navigation.navigate(ADD_BOOK_CONST.ADD_CONTACT_COMPONENT, { screenName: "Addressbook", });
            }
        } else { // Fiat tab is active
            if (refRBSheet.current) {
                refRBSheet?.current?.open();
            }
        }
    };

    const closekycModel = () => {
        setState({ ...state, kycModelVisible: false });
    }

    const handleAccountDetails = () => {
        refRBSheet?.current?.close();
        if (state.index === 0) {
            dispatch(setScreenInfo(props?.route?.name));
            navigation.navigate(ADD_BOOK_CONST.ADD_CONTACT_COMPONENT, { screenName: "Addressbook", accountType: ADD_RECIPIENT.PERSIONAL });
        }
        else if (state.index === 1) {
            props?.navigation?.push("AccountDetails", {
                walletCode: props?.route?.params?.walletCode,
                logo: props?.route?.params?.logo,
                accountType: ADD_RECIPIENT.PERSIONAL
            })

        };
    }
    const handleBusinessAccountSwift = () => {
        refRBSheet?.current?.close();
        if (state.index === 0) {
            dispatch(setScreenInfo(props?.route?.name));
            navigation.navigate(ADD_BOOK_CONST.ADD_CONTACT_COMPONENT, { screenName: "Addressbook", accountType: ADD_RECIPIENT.BUSINESS });
        } else if (state.index === 1) {
            props?.navigation?.push("AccountDetails", {
                walletCode: props?.route?.params?.walletCode,
                logo: props?.route?.params?.logo,
                accountType: ADD_RECIPIENT.BUSINESS

            })
        }
    };
    const addIcon = (
        <ViewComponent style={[commonStyles.actioniconbg]} >
            <AddIcon onPress={handleRedirectToAddPersolForm} />
        </ViewComponent>
    );

    // Get accountTypeDetails field from dynamic schema
    const accountTypeField = recepientDynamicFeieldDetails?.account?.find((field: any) => field.field === 'accountTypeDetails');
    const enabledOptions = accountTypeField?.options?.filter((option: any) => option.isEnable === true) || [];

    return (
        <ViewComponent style={[commonStyles.screenBg, commonStyles.flex1]}>
            <ViewComponent style={{ flex: 1, paddingHorizontal: s(24), paddingTop: s(24) }}>

                <PageHeader
                    title={"GLOBAL_CONSTANTS.PAYEES"}
                    onBackPress={backArrowButtonHandler}
                    rightActions={addIcon}
                />
                {(() => {
                    if (CryptoWalletsPermission && FiatWalletsPermission) {
                        return (
                            <SafeAreaViewComponent style={[commonStyles.flex1]}>
                                <CustomTabView
                                    style={{ backgroundColor: NEW_COLOR.SCREENBG_BLACK }}
                                    navigationState={state}
                                    renderScene={renderScene}
                                    renderTabBar={_renderTabBar}
                                    onIndexChange={_handleIndexChange}
                                    lazy={true}
                                    lazyPreloadDistance={0}
                                />
                            </SafeAreaViewComponent>
                        );
                    } else if (CryptoWalletsPermission) {
                        return (
                            <AddressbookCrypto accountId={props.route?.params?.accountId} navigation={navigation} route={props.route} />
                        );
                    } else if (FiatWalletsPermission) {
                        return (
                            <AddressbookFiat accountId={props.route?.params?.accountId} navigation={navigation} route={props.route} />
                        );
                    } else if (CryptoWalletsPermission === false && FiatWalletsPermission === false) {
                        return (
                            <ComingSoon pageHeader={false} />
                        );
                    }
                })()}
            </ViewComponent>

            <CustomRBSheet height={"Small"} refRBSheet={refRBSheet} title=''>
                <ViewComponent style={[commonStyles.sheetHeaderbg]}>
                    <ViewComponent>
                        {enabledOptions?.map((option: any) => {
                            const isPersonal = option?.value?.toLowerCase() === "personal";
                            const onPress = isPersonal ? handleAccountDetails : handleBusinessAccountSwift;
                            const icon = isPersonal ?
                                <AntDesign name='user' size={s(18)} color={NEW_COLOR.TEXT_WHITE} /> :
                                <SimpleLineIcons name='briefcase' size={s(18)} color={NEW_COLOR.TEXT_WHITE} />;
                            const text = isPersonal ? "GLOBAL_CONSTANTS.PERSONAL" : "GLOBAL_CONSTANTS.BUSINESS";

                            return (
                                <ViewComponent key={option?.value}>
                                    <CommonTouchableOpacity onPress={onPress}>
                                        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, { width: '100%', paddingHorizontal: 2, }]}>
                                            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]}>
                                                <ViewComponent style={[commonStyles.bottomsheeticonbg]}>
                                                    {icon}
                                                </ViewComponent>
                                                <TextMultiLanguage style={[commonStyles.textWhite, commonStyles.fs14, commonStyles.fw500, commonStyles.textCenter, commonStyles.mt5]} text={text} />
                                            </ViewComponent>
                                            <Entypo name="chevron-small-right" size={s(24)} color={NEW_COLOR.TEXT_WHITE} />
                                        </ViewComponent>
                                    </CommonTouchableOpacity>
                                    {enabledOptions?.indexOf(option) < enabledOptions.length - 1 && <ViewComponent style={[commonStyles.listGap]} />}
                                </ViewComponent>
                            );
                        })}
                    </ViewComponent>
                    <ViewComponent style={commonStyles.sectionGap} />
                    <ButtonComponent title={"GLOBAL_CONSTANTS.CLOSE"} solidBackground={true} onPress={() => refRBSheet?.current?.close()} />
                </ViewComponent>
            </CustomRBSheet>
            {state?.kycModelVisible && <KycVerifyPopup closeModel={closekycModel} addModelVisible={state.kycModelVisible} />}
        </ViewComponent>
    );
};

export default Addressbook;

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

