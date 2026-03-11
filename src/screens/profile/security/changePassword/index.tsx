
import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, BackHandler } from 'react-native';
import Container from '../../../../newComponents/container/container';
import { useThemeColors } from '../../../../hooks/useThemeColors';
import PageHeader from '../../../../newComponents/pageHeader/pageHeader';
import { ActionLogParams, useActionLogging } from '../../../../hooks/loggingHook';
import ViewComponent from '../../../../newComponents/view/view';
import ButtonComponent from '../../../../newComponents/buttons/button';
import { t } from 'i18next';
import { useNavigation } from '@react-navigation/native';
import ParagraphComponent from '../../../../newComponents/textComponets/paragraphText/paragraph';
import useEncryptDecrypt from '../../../../hooks/encDecHook';
import { useSelector } from 'react-redux';
import OnboardingService from '../../../../services/onboarding';
import { isErrorDispaly } from '../../../../utils/helpers';
import { showAppToast } from '../../../../newComponents/ToasterMessages/ShowMessage';
import { Ionicons } from '@expo/vector-icons'; // Assuming you're using Expo for icons
import TextMultiLanguage from '../../../../newComponents/textComponets/multiLanguageText/textMultiLangauge';
import { getThemedCommonStyles } from '../../../../assets/styles/CommonStyles';
import { useHardwareBackHandler } from '../../../../hooks/HardwareBackHandler';

const ChangePassword = () => {
    const [loading, setLoading] = useState(false);
    const NEW_COLOR = useThemeColors();
    const navigation = useNavigation<any>();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const { logEvent } = useActionLogging();
    const { decryptAES } = useEncryptDecrypt();
    const userInfo = useSelector((state: any) => state.userReducer?.userDetails);
    useEffect(() => {
        const backAction = () => {
            const actionData: ActionLogParams = {
                screename: 'ChangePassword',
                actionName: 'Navigate Back via Hardware Button',
                actionType: 'HardwareButton',
            };
            logEvent('navigation_action', actionData);
            navigation.goBack();
            return true;
        };
        const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
        return () => backHandler.remove();
    }, [navigation, logEvent]);


    useHardwareBackHandler(() => {
        handleBackPress()
    })
    const handleBackPress = () => {
        const actionData: ActionLogParams = {
            screename: 'ChangePassword',
            actionName: 'Navigate Back Security',
            actionType: 'HardwareButton',
            nextScreenName: 'Security'
        };
        logEvent('navigation_action', actionData);
        navigation.goBack();
    };

    const handleConfirm = async () => {
        setLoading(true);
        const actionData: ActionLogParams = {
            screename: 'ChangePassword',
            actionName: 'Confirm Change Password',
            actionType: 'Button',
            actionObj: { opens: 'Change Password Confirmation' }
        };
        logEvent('button_press', actionData);
        let obj: any = {
            email: userInfo?.email
        }
        try {
            const response = await OnboardingService.forgotPassWord(obj);
            if (response) {
                showAppToast(t("GLOBAL_CONSTANTS.EMAIL_SEND_SUCCESSFULL_TO") + decryptAES(userInfo?.email) + '\n' + t("GLOBAL_CONSTANTS.PLEASE_CHECK_AND_RESET"), 'success')
            } else {
                showAppToast(isErrorDispaly(response), 'error');
            }
        } catch (error) {
            showAppToast(isErrorDispaly(error), 'error');

        } finally {
            setLoading(false);
        }
    }

    return (
        <SafeAreaView style={[commonStyles.flex1, commonStyles.screenBg]}>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <Container style={[commonStyles.container]}>
                    <PageHeader title={t("GLOBAL_CONSTANTS.CHANGE_PASSWORD")} onBackPress={handleBackPress} />
                    <ViewComponent style={[commonStyles.dflex, commonStyles.p12, commonStyles.rounded8, commonStyles?.quick_Link_Icon_Bg,]}>
                        <Ionicons name="alert-circle-outline" size={20} color="#FFD700" style={[commonStyles.mr10, commonStyles.mt2]} />
                        <ParagraphComponent text={t("GLOBAL_CONSTANTS.FOR_ADDED_SECURITY_WITHDRAWAL_AND_INTERNAL_TRANSFERS_WILL_BE_DISABLED_AND_A_TRANSACTION_LIMIT_WILL_BE_SET_FOR_24_HOURS")} style={[commonStyles.fs12, commonStyles.flex1, commonStyles.textWhite]} />
                    </ViewComponent>
                    <ViewComponent style={[commonStyles.sectionGap]} />
                    <ViewComponent>
                        <ParagraphComponent style={[commonStyles.textGrey, commonStyles.fs14, commonStyles.fw400]} text={`${t("GLOBAL_CONSTANTS.BY_CLICKING_CONTINUE_A_PASSWORD_RESET_LINK_WILL_BE_SENT_TO_YOUR_REGISTERED_EMAIL")}`}><ParagraphComponent text={decryptAES(userInfo?.email)} style={[commonStyles.textWhite]} /></ParagraphComponent>
                        <TextMultiLanguage text={"GLOBAL_CONSTANTS.PLEASE_CHECK_YOUY_INBOX"} style={[commonStyles.textGrey]} />
                    </ViewComponent>
                    <ViewComponent style={[commonStyles.mt40]}>
                        <ButtonComponent
                            title={t("GLOBAL_CONSTANTS.CONFIRM")}
                            onPress={handleConfirm}
                            loading={loading}
                        />
                    </ViewComponent>
                </Container>
            </ScrollView>

        </SafeAreaView>
    );
};

export default ChangePassword;