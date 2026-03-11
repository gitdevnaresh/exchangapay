import React, { useEffect, useState } from 'react';
import { StyleSheet, ActivityIndicator } from 'react-native';
import { useThemeColors } from '../../../hooks/useThemeColors';
import Container from '../../../newComponents/container/container';
import PageHeader from '../../../newComponents/pageHeader/pageHeader';
import { s } from '../../../newComponents/theme/scale';
import ViewComponent from '../../../newComponents/view/view';
import { useIsFocused } from '@react-navigation/native';
import { getThemedCommonStyles } from '../../../assets/styles/CommonStyles';
import ScrollViewComponent from '../../../newComponents/scrollView/scrollView';
import { useHardwareBackHandler } from '../../../hooks/HardwareBackHandler';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Feather from 'react-native-vector-icons/Feather';
import CommonTouchableOpacity from '../../../newComponents/touchableComponents/touchableOpacity';
import ParagraphComponent from '../../../newComponents/textComponets/paragraphText/paragraph';
import { GoogleAuthenticator } from '../../../assets/vectorAssets';
import ProfileService from '../../../services/profile';
import { isErrorDispaly } from '../../../utils/helpers';
import { useSelector } from 'react-redux';
import InactiveAccountPopup from '../../commonScreens/inactiveSheet/accountInactive';
import ErrorComponent from '../../../newComponents/errorDisplay/errorDisplay';

const LoginVerificationScreen = ({ navigation }: any) => {
    const NEW_COLOR = useThemeColors();
    const styles = themedStyles(NEW_COLOR);
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const isFocused = useIsFocused();
    const [isEnabled, setIsEnabled] = useState<boolean | null>(null);
    const [error,setError]=useState<string>("");
 
    const [authMethods, setAuthMethods] = useState([
        { id: 'passkey', iconComponent: Ionicons, iconName: 'key-outline', text: 'Passkey', onPress: () => navigateTo('ComingSoon', { pageHeader: false, customHeader: { title: 'Passkey', showBackButton: true } }) },
        {
            id: 'google',
            icon: <GoogleAuthenticator width={s(18)} height={s(18)} />,
            text: 'Google Authenticator',
            onPress: () => navigateTo('GoogleAuthentication'),
            showWarning: isEnabled
        },
        { id: 'email', iconComponent: Ionicons, iconName: 'mail-outline', text: 'Email', onPress: () => navigateTo('EmailAuthenticationScreen') },
        { id: 'phone', iconComponent: Feather, iconName: 'smartphone', text: 'Phone', onPress: () => navigateTo('PhoneAuthenticationScreen') },
    ]);
    const [isActive, setIsActive] = useState<boolean>(false);
    const userInfo = useSelector((state: any) => state.userReducer.userDetails);

    useEffect(() => {
        fetchStatus();
    }, [isFocused]);

    useHardwareBackHandler(() => {
        handleBackPress();
    });

    const handleBackPress = () => {
        navigation.navigate("NewProfile", { animation: 'slide_from_left' });
    };

    const fetchStatus = async () => {
        setError("");
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
            else{
                setError(isErrorDispaly(response));
            }
        } catch (error) {
            setIsEnabled(null);
            setError(isErrorDispaly(error));
        }
    };

    const navigateTo = (screenName: string, params = {}) => {
        if ((screenName === 'EmailAuthenticationScreen' || screenName === 'PhoneAuthenticationScreen') && (userInfo?.customerAccountStatus === false)) {
            setIsActive(true);
            return;
        }
        navigation.navigate(screenName, params);
    };

    const handleClose = () => {
        setIsActive(false);
    };

    const renderSettingItem = (item: any) => {
        const itemContent = (
            <>
                <ViewComponent style={[commonStyles.dflex, commonStyles.gap16, commonStyles.alignCenter]}>
                    <ViewComponent style={[commonStyles.iconcirclebg, commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter]}>
                        {item.icon
                            ? item.icon
                            : (item.iconComponent && item.iconName && (
                                React.createElement(item.iconComponent, { name: item.iconName, size: s(18), display: "flex", alignItems: "center", color: NEW_COLOR.TEXT_WHITE })
                            ))
                        }
                    </ViewComponent>
                    <ParagraphComponent style={[commonStyles.list_text, commonStyles.fs14, commonStyles.fw400, item.textStyle]}>{item.text}</ParagraphComponent>
                </ViewComponent>
                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter]}>
                    {item.id === 'google' && isEnabled === null ? (
                        <ActivityIndicator size={"small"} color={NEW_COLOR.BG_YELLOW} />
                    ) : (
                        item.showWarning && (
                            <ViewComponent style={[]}>
                                <MaterialCommunityIcons name="alert-circle-outline" size={s(20)} color={"#E1E31E"} style={[commonStyles.mr5]} />
                            </ViewComponent>
                        )
                    )}
                    <Ionicons name="chevron-forward" size={s(22)} color={NEW_COLOR.ICON_GREY} />
                </ViewComponent>
            </>
        );

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
                    <PageHeader title={"GLOBAL_CONSTANTS.LOGIN_VERIFICATION"} onBackPress={handleBackPress} />
                  {error&&<ErrorComponent message={error} screen={true}/>}
                    <ViewComponent style={styles.section}>
                        {authMethods.map((item) => (
                            <React.Fragment key={item.id}>
                                {renderSettingItem(item)}
                            </React.Fragment>
                        ))}
                    </ViewComponent>
                </Container>
            </ScrollViewComponent>
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

export default LoginVerificationScreen;