import React, { useEffect, useState } from 'react';
import { StyleSheet, ActivityIndicator } from 'react-native';
import { useThemeColors } from '../../../hooks/useThemeColors';
import Container from '../../../newComponents/container/container';
import PageHeader from '../../../newComponents/pageHeader/pageHeader';
import { s } from '../../../newComponents/theme/scale';
import ViewComponent from '../../../newComponents/view/view';
import { getThemedCommonStyles } from '../../../assets/styles/CommonStyles';
import PopupOrSheet, { PopupOrSheetRef } from '../../../newComponents/models/PopupOrSheet';
import ButtonComponent from '../../../newComponents/buttons/button';
import ImageUri from '../../../newComponents/imageComponents/image';
import ScrollViewComponent from '../../../newComponents/scrollView/scrollView';
import { showAppToast } from '../../../newComponents/ToasterMessages/ShowMessage';
import { isErrorDispaly } from '../../../utils/helpers';
import ProfileService from '../../../services/profile';
import { useSelector } from 'react-redux';
import useEncryptDecrypt from '../../../hooks/encDecHook';
import useMemberLogin from '../../../hooks/userInfoHook';
import { useHardwareBackHandler } from '../../../hooks/HardwareBackHandler';
import AuthVerification from '../../commonScreens/authentication';
import { COMMON_SVG_URLS } from '../../../assets/blobUrls';
import TextMultiLanguage from '../../../newComponents/textComponets/multiLanguageText/textMultiLangauge';
import { Feather, Ionicons } from '@expo/vector-icons';
import CommonTouchableOpacity from '../../../newComponents/touchableComponents/touchableOpacity';
import ParagraphComponent from '../../../newComponents/textComponets/paragraphText/paragraph';
import CustomSwitch from '../../../newComponents/switch';
import ErrorComponent from '../../../newComponents/errorDisplay/errorDisplay';
import InactiveAccountPopup from '../../commonScreens/inactiveSheet/accountInactive';

const ManageYourAccountScreen = ({ navigation }: any) => {
    const userInfo = useSelector((state: any) => state.userReducer.userDetails);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isEnablingAccount, setIsEnablingAccount] = useState(false);
    const NEW_COLOR = useThemeColors();
    const styles = themedStyles(NEW_COLOR);
    const REVERSE_NEW_COLOR = useThemeColors(true);
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const reverseCommonStyles = getThemedCommonStyles(REVERSE_NEW_COLOR);
    const popupRef = React.useRef<PopupOrSheetRef>(null);
    const { decryptAES, encryptAES } = useEncryptDecrypt();
    const [ipAddress, setIpAddress] = useState('');
    const [location, setLocation] = useState('');
    const { getMemDetails } = useMemberLogin();
    const decryptUserName = decryptAES(userInfo?.userName);
    const encryptUserName = encryptAES(decryptUserName);
    const [authOpen, setAuthOpen] = useState(false);
    const [verifications, setVerifications] = useState([]);
    const [accoutEnable, setAccountEnable] = useState<any>(userInfo?.customerAccountStatus);
    const [error, setError] = useState<string>("");
    const [isInactive, setIsInactive] = useState<boolean>(false);


    useEffect(() => {
        getIpAndLocation();
    }, []);

    useHardwareBackHandler(() => {
        handleBackPress();
    });

    const handleBackPress = () => {
        navigation.navigate("NewProfile", { animation: 'slide_from_left' });
    };

    const updateAccountStatus = async (shouldBeEnabled: boolean) => {
        setError("");
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
                await getMemDetails(true);
            } else {
                setError(isErrorDispaly(response));
            }
        } catch (error) {
            setError(isErrorDispaly(error));
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
    };

    const handleAuthSucess = (verifications: any) => {
        setAuthOpen(false);
        setVerifications(verifications);
        if (accoutEnable) {
            updateAccountStatus(!userInfo.customerAccountStatus);
        } else {
            popupRef.current?.open();
            setIsEnablingAccount(false);
        }
    };

    const verifyAuth = () => {
        setError("");
        setIsEnablingAccount(true);
        setAuthOpen(true);
    };

    const getIpAndLocation = async () => {
        setError("");
        try {
            const response = await fetch('https://ipinfo.io/json');
            const data = await response.json();
            if (data.ip) setIpAddress(data.ip);
            if (data.city && data.country) {
                setLocation(`${data.city}, ${data.country}`);
            }
        } catch (fallbackError) {
            setError(isErrorDispaly(fallbackError));
            setIpAddress("Unknown");
            setLocation("Unknown");
        }
    };

    const handleAccountEnabledChange = (newValue: boolean) => {
        setAccountEnable(newValue);
        verifyAuth();
    };
    const handleClose = () => {
        setIsInactive(false);
    };
    const handleDeleteAccount = () => {
        if (userInfo?.customerAccountStatus === false) {
            setIsInactive(true); // Open the inactive account popup
            return;
        }
        navigation.navigate('DeleteAccount');
    };

    const handlePopupClose = () => {
        setError("");
        popupRef.current?.close();
    };

    const accountManagementItems = [
        {
            id: 'enable',
            iconComponent: Feather,
            iconName: 'user',
            text: 'GLOBAL_CONSTANTS.ACCOUNT_ENABLED',
            showChevron: false,
            additionalComponent: (
                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter]}>
                    {isEnablingAccount && (
                        <ActivityIndicator
                            size="small"
                            color={NEW_COLOR.BG_YELLOW}
                            style={{ marginRight: s(15) }}
                        />
                    )}
                    <CustomSwitch
                        value={userInfo?.customerAccountStatus}
                        onValueChange={handleAccountEnabledChange}
                        disable={isEnablingAccount}
                    />
                </ViewComponent>
            )
        },
        {
            id: 'delete',
            iconComponent: Ionicons,
            iconName: 'trash-outline',
            text: 'GLOBAL_CONSTANTS.DELETEACCOUNT',
            onPress: handleDeleteAccount,
            textStyle: [commonStyles.list_text, commonStyles.fw400]
        },
    ];

    const renderSettingItem = (item: any) => {
        const itemContent = (
            <>
                <ViewComponent style={[commonStyles.dflex, commonStyles.gap16, commonStyles.alignCenter]}>
                    <ViewComponent style={[commonStyles.iconcirclebg, commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter]}>
                        {React.createElement(item.iconComponent, { name: item.iconName, size: s(20), display: "flex", alignItems: "center", color: NEW_COLOR.TEXT_WHITE })}
                    </ViewComponent>
                    <ParagraphComponent style={[commonStyles.list_text, commonStyles.fs14, commonStyles.fw400, item.textStyle]}>{item.text}</ParagraphComponent>
                </ViewComponent>
                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter]}>
                    {item.additionalComponent}
                    {item.showChevron !== false && <Ionicons name="chevron-forward" size={s(22)} color={NEW_COLOR.ICON_GREY} />}
                </ViewComponent>
            </>
        );

        if (item.id === 'enable') {
            return (
                <ViewComponent style={[commonStyles.list, commonStyles.menuitemspace]}>
                    {itemContent}
                </ViewComponent>
            )
        }

        return (
            <CommonTouchableOpacity
                style={[commonStyles.list, commonStyles.menuitemspace]}
                onPress={item.onPress}
            >
                {itemContent}
            </CommonTouchableOpacity>
        );
    };

    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            <ScrollViewComponent showsVerticalScrollIndicator={false}>
                <Container style={[commonStyles.container]}>
                    <PageHeader title={"GLOBAL_CONSTANTS.MANAGE_ACCOUNT"} onBackPress={handleBackPress} />
                    {error && <ErrorComponent message={error} />}
                    <ViewComponent style={styles.section}>
                        {accountManagementItems.map((item) => (
                            <React.Fragment key={item.id}>
                                {renderSettingItem(item)}
                            </React.Fragment>
                        ))}
                    </ViewComponent>
                </Container>
                {authOpen && <AuthVerification onClose={handleAuthClose} onSuccess={handleAuthSucess} feature={'Account Enable/Disable'} requiredVerifys={2} />}
                {isInactive && (<InactiveAccountPopup isVisibleModel={isInactive} onClose={handleClose} />)}

            </ScrollViewComponent>
            <PopupOrSheet
                ref={popupRef}
                height={s(360)}
                showCloseIcon={false}
                showCloseIconAndTittle={false}
            >

                <ViewComponent style={[commonStyles.justifyCenter, commonStyles.alignCenter, commonStyles.mb16]}>
                    <ImageUri uri={COMMON_SVG_URLS.alert_Icon} width={s(90)} height={s(70)} />
                </ViewComponent>
                <TextMultiLanguage style={[commonStyles.fs14, commonStyles.fw400, reverseCommonStyles.textWhite, commonStyles.textCenter, commonStyles.mb16]} text={"GLOBAL_CONSTANTS.ENABLE_ACCOUNT_MESSAGE"} />
                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]}>
                    {/* <ViewComponent style={[commonStyles.flex1]}>
                        <ButtonComponent
                            title={"GLOBAL_CONSTANTS.CANCEL"}
                            onPress={handlePopupClose}
                            solidBackground={true}
                        />
                    </ViewComponent>*/}
                    <ViewComponent style={[commonStyles.flex1]}>
                        <ButtonComponent
                            title={"GLOBAL_CONSTANTS.CONTINUE"}
                            onPress={() => updateAccountStatus(!userInfo.customerAccountStatus)}
                            customContainerStyle={[reverseCommonStyles.bg_yellow, reverseCommonStyles.rounded100, { height: s(55) }]}
                            customTitleStyle={[reverseCommonStyles.fs14, reverseCommonStyles.fw700, reverseCommonStyles.textAlwaysBlack]}
                            loading={isSubmitting}
                            disable={isSubmitting}
                        />
                    </ViewComponent>
                </ViewComponent>
            </PopupOrSheet>
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

export default ManageYourAccountScreen;