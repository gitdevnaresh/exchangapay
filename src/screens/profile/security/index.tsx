import React, { useEffect, useState } from 'react';
import { StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Feather from 'react-native-vector-icons/Feather';
import CommonTouchableOpacity from '../../../newComponents/touchableComponents/touchableOpacity';
import { useThemeColors } from '../../../hooks/useThemeColors';
import Container from '../../../newComponents/container/container';
import PageHeader from '../../../newComponents/pageHeader/pageHeader';
import { s } from '../../../newComponents/theme/scale';
import ViewComponent from '../../../newComponents/view/view';
import CustomSwitch from '../../../newComponents/switch';
import { useIsFocused } from '@react-navigation/native';
import { GoogleAuthenticator } from '../../../assets/vectorAssets';
import TextMultiLanguage from '../../../newComponents/textComponets/multiLanguageText/textMultiLangauge';
import { getThemedCommonStyles } from '../../../assets/styles/CommonStyles';
import PopupOrSheet, { PopupOrSheetRef } from '../../../newComponents/models/PopupOrSheet';
import ButtonComponent from '../../../newComponents/buttons/button';
import ImageUri from '../../../newComponents/imageComponents/image';
import ParagraphComponent from '../../../newComponents/textComponets/paragraphText/paragraph';
import ScrollViewComponent from '../../../newComponents/scrollView/scrollView';
import { showAppToast } from '../../../newComponents/ToasterMessages/ShowMessage';
import { isErrorDispaly } from '../../../utils/helpers';
import ProfileService from '../../../services/profile';
import { useSelector } from 'react-redux';
import useEncryptDecrypt from '../../../hooks/encDecHook';
import useMemberLogin from '../../../hooks/userInfoHook';
import { useHardwareBackHandler } from '../../../hooks/HardwareBackHandler';
import AuthVerification from '../../commonScreens/authentication';
import InactiveAccountPopup from '../../commonScreens/inactiveSheet/accountInactive';
import { COMMON_SVG_URLS } from '../../../assets/blobUrls';

const Security = ({ navigation }: any) => {
    const userInfo = useSelector((state: any) => state.userReducer.userDetails);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isEnablingAccount, setIsEnablingAccount] = useState(false);
    const NEW_COLOR = useThemeColors();
    const REVERSE_NEW_COLOR = useThemeColors(true);
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const reverseCommonStyles = getThemedCommonStyles(REVERSE_NEW_COLOR);
    const isFocused = useIsFocused();
    const popupRef = React.useRef<PopupOrSheetRef>(null);
    const [isEnabled, setIsEnabled] = useState<boolean>(null);
    const { decryptAES, encryptAES } = useEncryptDecrypt()
    const [ipAddress, setIpAddress] = useState('');
    const [location, setLocation] = useState('');
    const { getMemDetails } = useMemberLogin();
    const decryptUserName = decryptAES(userInfo?.userName)
    const encryptUserName = encryptAES(decryptUserName);
    const [authOpen, setAuthOpen] = useState(false);
    const [verifications, setVerifications] = useState([]);
    const [isActive, setIsActive] = useState<boolean>(false);
    const [accoutEnable, setAccountEnable] = useState<any>(userInfo?.customerAccountStatus);
    const [authMethods, setAuthMethods] = useState([
        { id: 'passkey', iconComponent: Ionicons, iconName: 'key-outline', text: 'Passkey', onPress: () => navigateTo('ComingSoon', { pageHeader: false, customHeader: { title: 'Passkey', showBackButton: true } }) },
        {
            id: 'google',
            icon: <GoogleAuthenticator width={s(20)} height={s(20)} />, // <-- use as a component
            text: 'Google Authenticator',
            onPress: () => navigateTo('GoogleAuthentication'),
            showWarning: isEnabled
        },
        { id: 'email', iconComponent: Ionicons, iconName: 'mail-outline', text: 'Email', onPress: () => navigateTo('EmailAuthenticationScreen') },
        { id: 'phone', iconComponent: Feather, iconName: 'smartphone', text: 'Phone', onPress: () => navigateTo('PhoneAuthenticationScreen') },
    ]);

    useEffect(() => {
        fetchStatus();
        getIpAndLocation();
    }, [isFocused]);

    useHardwareBackHandler(() => {
        handleBackPress();
    })

    const handleBackPress = () => {
        navigation.navigate("NewProfile", { animation: 'slide_from_left' });
    };

    const updateAccountStatus = async (shouldBeEnabled: boolean) => {
        setIsSubmitting(true);
        try {
            const body = {
                status: shouldBeEnabled ? 1 : 2,
                verications: JSON.stringify(verifications),
                userName: encryptUserName,
                info: {
                    IPAddress: ipAddress,
                    Location: location
                },
                modifiedBy: encryptUserName
            };
            const response: any = await ProfileService.enableOrdisableAccount(body);
            if (response.status === 200) {
                popupRef.current?.close();
                showAppToast(`Account ${shouldBeEnabled ? 'enabled' : 'disabled'} successfully.`, 'success', 2000);
                await getMemDetails(true)
            } else {
                showAppToast(isErrorDispaly(response), 'error');
            }
        } catch (error) {
            showAppToast(isErrorDispaly(error), 'error');
        } finally {
            setIsEnablingAccount(false);
            setIsSubmitting(false);
            popupRef.current?.close();
        }
    };


    const handleAuthClose = () => {
        setAuthOpen(false);
        setIsSubmitting(false);
        setIsEnablingAccount(false);
    }
    const handleAuthSucess = (verifications: any) => {
        setAuthOpen(false);
        setVerifications(verifications);
        if (accoutEnable) {
            updateAccountStatus(!userInfo.customerAccountStatus);
        } else {
            popupRef.current?.open();
            setIsEnablingAccount(false);
        }
    }
    const verifyAuth = () => {
        setIsEnablingAccount(true);
        setAuthOpen(true);
    }
    const getIpAndLocation = async () => {
        try {
            const response = await fetch('https://ipinfo.io/json');
            const data = await response.json();
            if (data.ip) setIpAddress(data.ip);
            if (data.city && data.country) {
                setLocation(`${data.city}, ${data.country}`);
            }
        } catch (fallbackError) {
            showAppToast(isErrorDispaly(fallbackError), "error");
            setIpAddress("Unknown");
            setLocation("Unknown");
        }
    }
    const handleAccountEnabledChange = (newValue: boolean) => {
        setAccountEnable(newValue);
        verifyAuth();
    };

    const fetchStatus = async () => {
        setIsEnabled(null);
        try {
            const response: any = await ProfileService.getGoogleAuthentication();
            if (response?.ok && response?.data) {
                const enabled = response.data.isAuth0Enabled === true;
                setIsEnabled(enabled);
                setAuthMethods((prev: any) => (
                    prev?.map((method: any) => (
                        method.id === 'google' ? { ...method, showWarning: !enabled } : method
                    ))
                ))

            }
        } catch (error) {
            setIsEnabled(null);
            showAppToast(isErrorDispaly(error), 'error');
        }
    };
    const handlePopupClose = () => {
        popupRef.current?.close();
    }
    const navigateTo = (screenName: string, params = {}) => {
        if ((screenName === 'EmailAuthenticationScreen' || screenName === 'PhoneAuthenticationScreen') && (userInfo?.customerAccountStatus === false)) {
            setIsActive(true);
            return;
        }
        navigation.navigate(screenName, params);
    };

    const handleDeleteAccount = () => {
        navigateTo('DeleteAccount')
    };

    const handleClose = () => {
        setIsActive(false);
    }
    const advancedSecurityItems = [
        { id: 'antiphishing', iconComponent: MaterialCommunityIcons, iconName: 'file-document-outline', text: 'Anti-Phishing Code', onPress: () => navigateTo('ComingSoon', { pageHeader: false, customHeader: { title: 'Anti-Phishing Code', showBackButton: true, } }) },
        { id: 'thirdparty', iconComponent: MaterialCommunityIcons, iconName: 'link-variant', text: 'Third-Party Account Linking', onPress: () => navigateTo('ComingSoon', { pageHeader: false, customHeader: { title: 'Third-Party Account Linking', showBackButton: true, } }) },
        { id: 'devices', iconComponent: MaterialCommunityIcons, iconName: 'monitor-cellphone', text: 'Devices', onPress: () => navigateTo('ComingSoon', { pageHeader: false, customHeader: { title: 'Devices', showBackButton: true } }) },
        { id: 'changepassword', iconComponent: MaterialCommunityIcons, iconName: 'form-textbox-password', text: 'Change Password', onPress: () => navigateTo('ChangePasswordComponent') },
        { id: 'applock', iconComponent: Feather, iconName: 'lock', text: 'App Lock', onPress: () => navigateTo('AppLock') },
        { id: 'cardprivacy', iconComponent: MaterialCommunityIcons, iconName: 'credit-card-lock-outline', text: 'Card Privacy Controls', onPress: () => navigateTo('CardPrivacyControls') },];

    // START: MODIFIED CODE
    const accountManagementItems = [
        {
            id: 'enable',
            iconComponent: Ionicons,
            iconName: 'person-outline',
            text: 'Account Enabled',
            showChevron: false,
            additionalComponent: (
                // Use a ViewComponent to align the loader and switch horizontally
                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter]}>
                    {isEnablingAccount && (
                        <ActivityIndicator
                            size="small"
                            color={NEW_COLOR.BG_YELLOW}
                            style={{ marginRight: s(15) }} // Add spacing between loader and switch
                        />
                    )}
                    <CustomSwitch
                        value={userInfo?.customerAccountStatus}
                        onValueChange={handleAccountEnabledChange}
                        // Disable the switch while loading
                        disable={isEnablingAccount}
                    />
                </ViewComponent>
            )
        },
        {
            id: 'delete',
            iconComponent: Ionicons,
            iconName: 'trash-outline',
            text: 'Delete Account',
            onPress: handleDeleteAccount,
            textStyle: [commonStyles.list_text, commonStyles.fw400]

        },
    ];
    // END: MODIFIED CODE

    const renderSettingItem = (item: any) => {
        const itemContent = (
            <>
                <ViewComponent style={[commonStyles.dflex, commonStyles.gap16, commonStyles.alignCenter]}>
                    <ViewComponent style={[commonStyles.iconcirclebg, commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter]}>
                        {item.icon
                            ? item.icon
                            : (item.iconComponent && item.iconName && (
                                React.createElement(item.iconComponent, { name: item.iconName, size: s(20), display: "flex", alignItems: "center", color: NEW_COLOR.TEXT_WHITE })
                            ))
                        }
                    </ViewComponent>
                    <ParagraphComponent style={[commonStyles.list_text, commonStyles.fs14, commonStyles.fw400, item.textStyle]}>{item.text}</ParagraphComponent>
                </ViewComponent>
                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter]}>
                    {item.additionalComponent}
                    {item.id === 'google' && isEnabled === null ? (
                        <ActivityIndicator size={"small"} color={NEW_COLOR.BG_YELLOW} />
                    ) : (
                        item.showWarning && (
                            <ViewComponent style={[]}>
                                <MaterialCommunityIcons name="alert-circle-outline" size={s(20)} color={"#E1E31E"} style={[commonStyles.mr5]} />
                            </ViewComponent>
                        )
                    )}
                    {item.showChevron !== false && <Ionicons name="chevron-forward" size={s(22)} color={NEW_COLOR.ICON_GREY} />}
                </ViewComponent>
            </>
        );

        if (item.id === 'enable') {
            return (
                <ViewComponent style={[commonStyles.list, commonStyles.mb10]}>
                    {itemContent}
                </ViewComponent>
            )
        }

        return (
            <CommonTouchableOpacity
                style={[commonStyles.list, commonStyles.mb10]}
                onPress={item.onPress}
                disabled={!item.onPress && !item.additionalComponent}
            >
                {itemContent}
            </CommonTouchableOpacity>
        );
    };

    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]} >
            <ScrollViewComponent showsVerticalScrollIndicator={false}>
                <Container style={[commonStyles.container]}>
                    <PageHeader title={"GLOBAL_CONSTANTS.SECURITY"} onBackPress={handleBackPress} />
                    <CommonTouchableOpacity
                        style={[commonStyles.list, commonStyles.mb10]}
                        onPress={() => navigation.navigate('LoginVerificationScreen')}
                    >
                        <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter]}>
                            <ParagraphComponent style={[commonStyles.list_text, commonStyles.fs16, commonStyles.fw400]}>Login Verification</ParagraphComponent>
                            <Ionicons name="chevron-forward" size={s(22)} color={NEW_COLOR.ICON_GREY} />
                        </ViewComponent>
                    </CommonTouchableOpacity>

                    <CommonTouchableOpacity
                        style={[commonStyles.list, commonStyles.mb10]}
                        onPress={() => navigation.navigate('AdvanceProtectionScreen')}
                    >
                        <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter]}>
                            <ParagraphComponent style={[commonStyles.list_text, commonStyles.fs16, commonStyles.fw400]}>Advance Protection</ParagraphComponent>
                            <Ionicons name="chevron-forward" size={s(22)} color={NEW_COLOR.ICON_GREY} />
                        </ViewComponent>
                    </CommonTouchableOpacity>

                    <CommonTouchableOpacity
                        style={[commonStyles.list, commonStyles.mb10]}
                        onPress={() => navigation.navigate('ManageYourAccountScreen')}
                    >
                        <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter]}>
                            <ParagraphComponent style={[commonStyles.list_text, commonStyles.fs16, commonStyles.fw400]}>Manage Your Account</ParagraphComponent>
                            <Ionicons name="chevron-forward" size={s(22)} color={NEW_COLOR.ICON_GREY} />
                        </ViewComponent>
                    </CommonTouchableOpacity>
                </Container>
                {authOpen && <AuthVerification onClose={handleAuthClose} onSuccess={handleAuthSucess} feature={'Account Enable/Disable'} requiredVerifys={2} />}

            </ScrollViewComponent>
            <PopupOrSheet
                ref={popupRef}
                height={s(340)}
                showCloseIcon={false}
                showCloseIconAndTittle={false}
            >
                <ViewComponent
                    style={[commonStyles.justifyCenter, commonStyles.alignCenter, commonStyles.mb16]}>
                    <ImageUri uri={COMMON_SVG_URLS.alert_Icon} width={s(90)} height={s(70)} />
                </ViewComponent>
                <TextMultiLanguage style={[commonStyles.fs14, commonStyles.fw400, reverseCommonStyles.textWhite, commonStyles.textCenter, commonStyles.mb16]} text={"GLOBAL_CONSTANTS.ENABLE_ACCOUNT_MESSAGE"} />
                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]}>
                    <ViewComponent style={[commonStyles.flex1]}>
                        <ButtonComponent
                            title={"GLOBAL_CONSTANTS.CANCEL"}
                            onPress={handlePopupClose}
                            solidBackground={true}
                        />
                    </ViewComponent>
                    <ViewComponent style={[commonStyles.flex1]}>
                        <ButtonComponent
                            title={"GLOBAL_CONSTANTS.CONFIRM"}
                            onPress={() => updateAccountStatus(!userInfo.customerAccountStatus)}
                            customContainerStyle={[reverseCommonStyles.bg_yellow, reverseCommonStyles.rounded100, { height: s(55) }]}
                            customTitleStyle={[reverseCommonStyles.fs14, reverseCommonStyles.fw700, reverseCommonStyles.textAlwaysBlack]}
                            loading={isSubmitting}
                            disable={isSubmitting}

                        />
                    </ViewComponent>

                </ViewComponent>
            </PopupOrSheet>
            {isActive && (<InactiveAccountPopup isVisibleModel={isActive} onClose={handleClose} />)}
        </ViewComponent>
    );
};

const themedStyles = (NEW_COLOR: any) => StyleSheet.create({
    section: {
        backgroundColor: NEW_COLOR.CARD_BG,
        borderRadius: s(12),
        overflow: 'hidden',
        shadowColor: NEW_COLOR.SHADOW,
        shadowOffset: { width: s(0), height: s(1) },
        shadowOpacity: 0.03,
        shadowRadius: 2,
        elevation: 2,
        marginBottom: s(20),
    },
});

export default Security;