import React, { useCallback, useMemo, useState } from "react";
import ViewComponent from "../../newComponents/view/view";
import CommonTouchableOpacity from "../../newComponents/touchableComponents/touchableOpacity";
import TextMultiLangauge from "../../newComponents/textComponets/multiLanguageText/textMultiLangauge";
import { Feather, Ionicons } from '@expo/vector-icons';
import { s } from "../../newComponents/theme/scale";
import DeviceInfo from "react-native-device-info";
import { ActionLogParams, useActionLogging } from "../../hooks/loggingHook";
import ParagraphComponent from "../../newComponents/textComponets/paragraphText/paragraph";
import { ProfileMenuItemsProps } from "./profileTypes";
import { useDispatch, useSelector } from "react-redux";
import InactiveAccountPopup from "../commonScreens/inactiveSheet/accountInactive";
import { CommonActions, useNavigation } from "@react-navigation/native";
import CasesIcon from "../../assets/vectorAssets/svgComponetIcons/casesIcon";
import ButtonComponent from "../../newComponents/buttons/button";
import ConfirmLogout from "../commonScreens/confirmLogout/comfirmLogout";
import Keychain from "react-native-keychain";
import { isLogin, loginAction, setAutoLockTime, setBiometricEnabled, setUserInfo } from "../../redux/actions/actions";
import { logout } from "@frontegg/react-native";
import { deleteFcmToken, FrontEggService } from "../../apiServices/fronteggApiServices/fronteggServices";
import { getTabsConfigation } from "../../../configuration";
import { isErrorDispaly, userDetails } from "../../utils/helpers";
import ImageUri from "../../newComponents/imageComponents/image";
import { PROFILE_URLS } from "../../assets/blobUrls";
import { zendeskLogout as zendeskLogout } from "../../hooks/zendesk/zendesk";

// Get app version from device info
const version = DeviceInfo?.getVersion();

const ProfileMenuItems: React.FC<ProfileMenuItemsProps> = ({
    commonStyles,
    NEW_COLOR,
    setIsLogoutLoading,
    setError,
    isLogoutLoading
}) => {
    const { logEvent } = useActionLogging();
    const [isInactive, setIsInactive] = useState<boolean>(false);
    const navigation = useNavigation<any>();
    const [isVisible, setIsVisible] = useState<boolean>(false);
    // const [isLogoutLoading, setIsLogoutLoading] = useState<boolean>(false);
    const userInfo = useSelector((state: any) => state.userReducer.userDetails);

    const dispatch = useDispatch<any>();
    const Configuration: any = useMemo(
        () => getTabsConfigation("IDENITY_CONFIG"),
        []
    );

    const navigateTo = (screenName: string, params = {}) => {
        navigation.navigate(screenName, params);
    };
    // Memoized navigation to Settings screen
    const navigateToSettings = useCallback(() => {
        const actionData: ActionLogParams = {
            screename: 'NewProfile',
            actionName: 'Navigate to Settings',
            actionType: 'Button',
            nextScreenName: 'Settings',
        };
        logEvent('navigation_action', actionData);
        navigation.navigate("Settings");
    }, [navigation, logEvent]);

    const handlesupportCenterPress = () => {
        navigation.navigate("SupportCentre")
    }
    const handleCaseManagment = () => {
        navigation.navigate("Support")
    }
    const handleProfileMenuItemPress = () => {
        navigation.navigate("AboutUs");
    }
    const handleWhitelistAddres = () => {
        if (userInfo?.customerAccountStatus === false) {
            setIsInactive(true); // Open the inactive account popup
            return;
        }
        navigation.navigate("WhiteListAddresses")
    }

    const handleClose = () => {
        setIsInactive(false);
    };

    const handleCloseLogout = () => {
        setIsVisible(false)
    }
    // Logout modal confirm handler
    const handleConfirm = () => {
        setIsVisible(false)
        handleLgout()
    }
    // Show logout modal
    const handleLogoutBtn = () => {
        setIsVisible(true)
    }
    const handleLgout = async () => {
        setIsLogoutLoading?.(true);
        const refresh = await userDetails();
        const actionData: ActionLogParams = {
            screename: 'NewProfile',
            actionName: 'Logout',
            actionType: 'Button',
        };
        logEvent('button_press', actionData);
        // Clear Zendesk session on logout
        try {
            await zendeskLogout();
        } catch (e) {
            console.log('Zendesk logout failed:', e);
        }
        dispatch(setUserInfo(""));
        dispatch(setBiometricEnabled(false));
        dispatch(setAutoLockTime(5));
        dispatch(isLogin(false));
        if (Configuration.FFRONTEGG?.enabled === true) {
            if (Configuration.FFRONTEGG?.manualForm) {
                try {
                    const reponse = await FrontEggService.userLogOut({
                        refreshId: refresh
                    });
                    await deleteFcmToken()
                } catch (e) {
                    const errorMessage = isErrorDispaly(e);
                    setError(errorMessage);
                    return;
                }
            } else {

                await logout();//sdk
                deleteFcmToken();
            }

        };
        await deleteFcmToken();
        await Keychain.resetGenericPassword({ service: 'authTokens' });//common for Auth0,FrontEgg
        await Keychain.resetGenericPassword({ service: 'fcmToken' });
        dispatch(loginAction(null));
        setIsLogoutLoading?.(false);
        setTimeout(() => {
            navigation.dispatch(
                CommonActions.reset({
                    index: 1,
                    routes: [{ name: "SplaceScreen" }],
                })
            );
        }, 1000);
    };
    const handleLoginVerification = () => {
        const actionData: ActionLogParams = {
            screename: 'NewProfile',
            actionName: 'Navigate to LoginVerification',
            actionType: 'Button',
            nextScreenName: 'LoginVerification',
        };
        logEvent('navigation_action', actionData);
        navigation.navigate("LoginVerificationScreen");
    }
    const handleAdvencedProtection = () => {
        const actionData: ActionLogParams = {
            screename: 'NewProfile',
            actionName: 'Navigate to AdvanceProtectionScreen',
            actionType: 'Button',
            nextScreenName: 'AdvanceProtectionScreen',
        };
        logEvent('navigation_action', actionData);
        navigation.navigate("AdvanceProtectionScreen");
    }

    const handleManageAccount = () => {
        const actionData: ActionLogParams = {
            screename: 'NewProfile',
            actionName: 'Navigate to ManageYourAccount',
            actionType: 'Button',
            nextScreenName: 'ManageYourAccount',
        };
        logEvent('navigation_action', actionData);
        navigation.navigate("ManageYourAccountScreen");
    }
    const handlePaymentAlerts = () => {
        const actionData: ActionLogParams = {
            screename: 'NewProfile',
            actionName: 'Navigate to PaymentAlerts',
            actionType: 'Button',
            nextScreenName: 'PaymentAlerts',
        };
        logEvent('navigation_action', actionData);
        navigation.navigate("PaymentAlerts");

    }

    return (
        <ViewComponent>
            <ViewComponent style={[commonStyles.mt16]}>
                <TextMultiLangauge text={"GLOBAL_CONSTANTS.SUPPORT"} style={commonStyles.profileMenuSectionTitle} />
                <ViewComponent style={[commonStyles.titleSectionGap]} />
            </ViewComponent>

            <CommonTouchableOpacity onPress={handlesupportCenterPress}>
                <ViewComponent style={commonStyles.profileMenuItemRow} >
                    <ViewComponent style={commonStyles.profileMenuItemLeft} >
                        <ViewComponent style={[commonStyles.quicklinks, commonStyles.profileMenuIconContainer]} >
                            <Feather name="info" size={s(18)} color={NEW_COLOR.TEXT_WHITE} />
                        </ViewComponent>
                        <ParagraphComponent text={"GLOBAL_CONSTANTS.SUPPORT_CENTRE"} style={commonStyles.profileMenuItemText} multiLanguageAllows />
                    </ViewComponent>
                    <Ionicons name="chevron-forward" size={s(22)} color={NEW_COLOR.ICON_GREY} />
                </ViewComponent>
            </CommonTouchableOpacity>
            <ViewComponent style={[commonStyles.titleSectionGap]} />

            <ViewComponent>
                <TextMultiLangauge text={"GLOBAL_CONSTANTS.SECURITY_AND_ACCESS"} style={commonStyles.profileMenuSectionTitle} />
                <ViewComponent style={[commonStyles.titleSectionGap]} />
            </ViewComponent>

            <CommonTouchableOpacity onPress={handleLoginVerification}>
                <ViewComponent style={commonStyles.profileMenuItemRow} >
                    <ViewComponent style={commonStyles.profileMenuItemLeft} >
                        <ViewComponent style={[commonStyles.quicklinks, commonStyles.profileMenuIconContainer]} >
                            {/* FontAwesome question-circle-o for Support Center */}
                            <ImageUri uri={PROFILE_URLS.loginAndVerification} height={s(20)} width={s(20)} />
                        </ViewComponent>
                        <ParagraphComponent text={"GLOBAL_CONSTANTS.LOGIN_AND_VERIFICATION"} style={commonStyles.profileMenuItemText} multiLanguageAllows />
                    </ViewComponent>
                    <Ionicons name="chevron-forward" size={s(22)} color={NEW_COLOR.ICON_GREY} />
                </ViewComponent>
            </CommonTouchableOpacity>
            <ViewComponent style={[commonStyles.menuitemspace]} />

            <CommonTouchableOpacity onPress={handleAdvencedProtection}>
                <ViewComponent style={commonStyles.profileMenuItemRow} >
                    <ViewComponent style={commonStyles.profileMenuItemLeft} >
                        <ViewComponent style={[commonStyles.quicklinks, commonStyles.profileMenuIconContainer]} >
                            {/* FontAwesome question-circle-o for Support Center */}
                            <Feather name="lock" size={s(16)} color={NEW_COLOR.TEXT_WHITE} />
                        </ViewComponent>
                        <ParagraphComponent text={"GLOBAL_CONSTANTS.ADVANCE_PROTECTION"} style={commonStyles.profileMenuItemText} multiLanguageAllows />
                    </ViewComponent>
                    <Ionicons name="chevron-forward" size={s(22)} color={NEW_COLOR.ICON_GREY} />
                </ViewComponent>
            </CommonTouchableOpacity>

            <ViewComponent style={[commonStyles.menuitemspace]} />
            <CommonTouchableOpacity onPress={handleManageAccount}>
                <ViewComponent style={commonStyles.profileMenuItemRow} >
                    <ViewComponent style={commonStyles.profileMenuItemLeft} >
                        <ViewComponent style={[commonStyles.quicklinks, commonStyles.profileMenuIconContainer]} >
                            {/* KycIcon used for Low Balance Alert */}
                            <Feather name="user" size={s(18)} color={NEW_COLOR.TEXT_WHITE} />
                        </ViewComponent>
                        <ParagraphComponent text={"GLOBAL_CONSTANTS.MANAGE_YOUR_ACCOUNT"} style={commonStyles.profileMenuItemText} multiLanguageAllows />
                    </ViewComponent>
                    <Ionicons name="chevron-forward" size={s(22)} color={NEW_COLOR.ICON_GREY} />
                </ViewComponent>
            </CommonTouchableOpacity>
            <ViewComponent style={[commonStyles.titleSectionGap]} />
            <ViewComponent>
                <TextMultiLangauge text={"GLOBAL_CONSTANTS.PAYMENT_AND_ALERTS"} style={commonStyles.profileMenuSectionTitle} />
                <ViewComponent style={[commonStyles.titleSectionGap]} />
            </ViewComponent>

            <CommonTouchableOpacity onPress={handlePaymentAlerts}>
                <ViewComponent style={commonStyles.profileMenuItemRow} >
                    <ViewComponent style={commonStyles.profileMenuItemLeft} >
                        <ViewComponent style={[commonStyles.quicklinks, commonStyles.profileMenuIconContainer]} >
                            {/* KycIcon used for Low Balance Alert */}
                            <ImageUri uri={PROFILE_URLS.transactionPreferrence} height={s(18)} width={s(18)} />
                        </ViewComponent>
                        <ParagraphComponent text={"GLOBAL_CONSTANTS.TRANSACTIONPREFERENCES"} style={commonStyles.profileMenuItemText} multiLanguageAllows />
                    </ViewComponent>
                    <Ionicons name="chevron-forward" size={s(22)} color={NEW_COLOR.ICON_GREY} />
                </ViewComponent>
            </CommonTouchableOpacity>

            <ViewComponent style={[commonStyles.menuitemspace]} />
            <CommonTouchableOpacity onPress={handleWhitelistAddres}>
                <ViewComponent style={commonStyles.profileMenuItemRow} >
                    <ViewComponent style={commonStyles.profileMenuItemLeft} >
                        <ViewComponent style={[commonStyles.quicklinks, commonStyles.profileMenuIconContainer]} >
                            <ImageUri uri={PROFILE_URLS.whitelistAddress} height={s(18)} width={s(18)} />
                        </ViewComponent>
                        <ParagraphComponent text={"GLOBAL_CONSTANTS.WITHDRAW_Addresses"} style={commonStyles.profileMenuItemText} multiLanguageAllows />
                    </ViewComponent>
                    <Ionicons name="chevron-forward" size={s(22)} color={NEW_COLOR.ICON_GREY} />
                </ViewComponent>
            </CommonTouchableOpacity>
            <ViewComponent style={[commonStyles.titleSectionGap]} />
            <ViewComponent>
                <TextMultiLangauge text={"GLOBAL_CONSTANTS.GENERAL"} style={commonStyles.profileMenuSectionTitle} />
                <ViewComponent style={[commonStyles.titleSectionGap]} />
            </ViewComponent>
            <CommonTouchableOpacity onPress={navigateToSettings} >
                <ViewComponent style={commonStyles.profileMenuItemRow} >
                    <ViewComponent style={commonStyles.profileMenuItemLeft} >
                        <ViewComponent style={[commonStyles.quicklinks, commonStyles.profileMenuIconContainer]} >
                            {/* Feather settings icon */}
                            <Feather name="settings" size={s(16)} color={NEW_COLOR.TEXT_WHITE} />
                        </ViewComponent>
                        {/* Use global constant for Settings label */}
                        <ParagraphComponent text={"GLOBAL_CONSTANTS.SETTINGS"} style={commonStyles.profileMenuItemText} multiLanguageAllows />
                    </ViewComponent>
                    <Ionicons name="chevron-forward" size={s(22)} color={NEW_COLOR.ICON_GREY} />
                </ViewComponent>
            </CommonTouchableOpacity>

            <ViewComponent style={[commonStyles.menuitemspace]} />

            <CommonTouchableOpacity onPress={handleCaseManagment}>
                <ViewComponent style={commonStyles.profileMenuItemRow} >
                    <ViewComponent style={commonStyles.profileMenuItemLeft} >
                        <ViewComponent style={[commonStyles.quicklinks, commonStyles.profileMenuIconContainer]} >
                            <CasesIcon height={s(18)} width={s(16)} />
                        </ViewComponent>
                        <TextMultiLangauge text={"GLOBAL_CONSTANTS.CASES"} style={commonStyles.profileMenuItemText} />
                    </ViewComponent>
                    <Ionicons name="chevron-forward" size={s(22)} color={NEW_COLOR.ICON_GREY} />
                </ViewComponent>
            </CommonTouchableOpacity>
            <ViewComponent style={[commonStyles.menuitemspace]} />

            {/* Community Option (not touchable) */}
            <CommonTouchableOpacity onPress={() => navigateTo('ComingSoon', { pageHeader: false, customHeader: { title: "Community", showBackButton: true } })}>
                <ViewComponent style={commonStyles.profileMenuItemRow} >
                    <ViewComponent style={commonStyles.profileMenuItemLeft} >
                        <ViewComponent style={[commonStyles.quicklinks, commonStyles.profileMenuIconContainer]} >
                            <ImageUri uri={PROFILE_URLS.community} height={s(18)} width={s(18)} />
                        </ViewComponent>
                        <ParagraphComponent text={"GLOBAL_CONSTANTS.COMMUNITY_HUB"} style={commonStyles.profileMenuItemText} multiLanguageAllows />
                    </ViewComponent>
                    <Ionicons name="chevron-forward" size={s(22)} color={NEW_COLOR.ICON_GREY} />
                </ViewComponent>
            </CommonTouchableOpacity>
            <ViewComponent style={[commonStyles.menuitemspace]} />

            {/* About Us Section */}
            <CommonTouchableOpacity onPress={handleProfileMenuItemPress} >

                <ViewComponent style={commonStyles.profileMenuItemRow} >
                    {/* Left: About Us Icon + Label */}
                    <ViewComponent style={commonStyles.profileMenuItemLeft} >
                        <ViewComponent style={[commonStyles.quicklinks, commonStyles.profileMenuIconContainer]} >
                            {/* Info icon for About Us  */}
                            <Feather name="info" size={s(18)} color={NEW_COLOR.TEXT_WHITE} />
                        </ViewComponent>
                        <ParagraphComponent text={"GLOBAL_CONSTANTS.ABOUT_US"} style={commonStyles.profileMenuItemText} multiLanguageAllows />
                    </ViewComponent>
                    {/* Right: App Version + Arrow */}
                    <ViewComponent style={commonStyles.profileMenuItemRight}>
                        <ParagraphComponent style={commonStyles.profileMenuVersionText} text={`v${version}`} />
                        {/* Arrow for About Us (optional, can be removed if not needed) */}
                        <Ionicons name="chevron-forward" size={s(22)} color={NEW_COLOR.ICON_GREY} />
                    </ViewComponent>
                </ViewComponent>
            </CommonTouchableOpacity>
            <ViewComponent style={[commonStyles.sectionGap]} />
            <ViewComponent style={[commonStyles.mb24]} />
            <ButtonComponent title="GLOBAL_CONSTANTS.LOG_OUT" onPress={handleLogoutBtn} solidBackground={true}
                customButtonStyle={[{ backgroundColor: NEW_COLOR.LOGIN_BTN }]}
                loading={isLogoutLoading}
            />
            {isInactive && (<InactiveAccountPopup isVisibleModel={isInactive} onClose={handleClose} />)}
            <ViewComponent style={[commonStyles.listGap]} />
            <ViewComponent style={[commonStyles.listGap]} />
            <ConfirmLogout
                isVisible={isVisible}
                onClose={handleCloseLogout}
                onConfirm={handleConfirm}
            />

        </ViewComponent>

    );
};

export default ProfileMenuItems;