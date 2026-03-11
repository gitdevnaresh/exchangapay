import React from 'react';
import { StyleSheet } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import Feather from 'react-native-vector-icons/Feather';
import { useThemeColors } from '../../../hooks/useThemeColors';
import Container from '../../../newComponents/container/container';
import PageHeader from '../../../newComponents/pageHeader/pageHeader';
import { s } from '../../../newComponents/theme/scale';
import ViewComponent from '../../../newComponents/view/view';
import { getThemedCommonStyles } from '../../../assets/styles/CommonStyles';
import ScrollViewComponent from '../../../newComponents/scrollView/scrollView';
import { useHardwareBackHandler } from '../../../hooks/HardwareBackHandler';
import CommonTouchableOpacity from '../../../newComponents/touchableComponents/touchableOpacity';
import ParagraphComponent from '../../../newComponents/textComponets/paragraphText/paragraph';
import TextMultiLanguage from '../../../newComponents/textComponets/multiLanguageText/textMultiLangauge';
import ImageUri from '../../../newComponents/imageComponents/image';
import { PROFILE_URLS } from '../../../assets/blobUrls';

const AdvanceProtectionScreen = ({ navigation }: any) => {
    const NEW_COLOR = useThemeColors();
    const styles = themedStyles(NEW_COLOR);
    const commonStyles = getThemedCommonStyles(NEW_COLOR);

    useHardwareBackHandler(() => {
        handleBackPress();
    });

    const handleBackPress = () => {
        navigation.navigate("NewProfile", { animation: 'slide_from_left' });
    };

    const navigateTo = (screenName: string, params = {}) => {
        navigation.navigate(screenName, params);
    };

    const advancedSecurityItems = [
        { id: 'antiphishing', iconComponent: MaterialCommunityIcons, iconName: 'file-document-outline', text: "GLOBAL_CONSTANTS.ANTI_PHISHING_CODE", onPress: () => navigateTo('ComingSoon', { pageHeader: false, customHeader: { title: 'Anti-Phishing Code', showBackButton: true } }) },
        { id: 'thirdparty', iconComponent: MaterialCommunityIcons, iconName: 'link-variant', text: "GLOBAL_CONSTANTS.THIRD_PARTY_ACCOUNT_LINKING", onPress: () => navigateTo('ComingSoon', { pageHeader: false, customHeader: { title: "Third-Party Account Linking", showBackButton: true } }) },
        { id: 'devices', iconComponent: MaterialCommunityIcons, iconName: 'monitor-cellphone', text: "GLOBAL_CONSTANTS.DEVICES", onPress: () =>navigateTo('ComingSoon', { pageHeader: false, customHeader: { title: 'Connected Devices', showBackButton: true } }) },
        { id: 'changepassword', iconComponent: MaterialCommunityIcons, iconName: 'form-textbox-password', text: "GLOBAL_CONSTANTS.CHANGE_PASSWORDS", onPress: () => navigateTo('ChangePasswordComponent') },
        { id: 'applock', iconComponent: Feather, iconName: 'lock', text: "GLOBAL_CONSTANTS.APP_LOCKTEXT", onPress: () => navigateTo('AppLock') },
        { id: 'cardprivacy', iconComponent: MaterialCommunityIcons, iconName: 'credit-card-lock-outline', text: "GLOBAL_CONSTANTS.CARD_PRIVACYCONTROLS", onPress: () => navigateTo('CardPrivacyControls') },
    ];

    const renderSettingItem = (item: any) => {
        const itemContent = (
            <>
                <ViewComponent style={[commonStyles.dflex, commonStyles.gap16, commonStyles.alignCenter]}>
                    <ViewComponent style={[commonStyles.iconcirclebg, commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter]}>
                        {item.id === 'devices' ? (
                            <ImageUri uri={PROFILE_URLS.devices} height={s(18)} width={s(18)} />
                        ) : item.id === 'changepassword' ? (
                            <ImageUri uri={PROFILE_URLS.changePassword} height={s(18)} width={s(18)} />
                        ) : item.id === 'antiphishing' ? (
                            <ImageUri uri={PROFILE_URLS.antiPhisicode} height={s(18)} width={s(18)} />
                        ) : (
                            React.createElement(item.iconComponent, { name: item.iconName, size: s(18), display: "flex", alignItems: "center", color: NEW_COLOR.TEXT_WHITE })
                        )}
                    </ViewComponent>
                    <ParagraphComponent style={[commonStyles.list_text, commonStyles.fs14, commonStyles.fw400]}>{item.text}</ParagraphComponent>
                </ViewComponent>
                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter]}>
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
                    <PageHeader title={"GLOBAL_CONSTANTS.ADVANCED_PROTECTION"} onBackPress={handleBackPress} />
                    <ViewComponent style={styles.section}>
                        {advancedSecurityItems.map((item) => (
                            <React.Fragment key={item.id}>
                                {renderSettingItem(item)}
                            </React.Fragment>
                        ))}
                    </ViewComponent>
                </Container>
            </ScrollViewComponent>
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

export default AdvanceProtectionScreen;