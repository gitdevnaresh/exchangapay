
import React, {useRef, useState } from 'react';
import { SafeAreaView, ScrollView ,ActivityIndicator} from 'react-native';
import { useThemeColors } from '../../../../hooks/useThemeColors';
import Container from '../../../../newComponents/container/container';
import PageHeader from '../../../../newComponents/pageHeader/pageHeader';
import ViewComponent from '../../../../newComponents/view/view';
import CommonTouchableOpacity from '../../../../newComponents/touchableComponents/touchableOpacity';
import PopupOrSheet, { PopupOrSheetRef } from '../../../../newComponents/models/PopupOrSheet';
import { PhoneAuthenticationScreenProps } from './interface';
import { useSelector } from 'react-redux';
import useEncryptDecrypt from '../../../../hooks/encDecHook';
import { getFormattedPhoneNumber } from './constant';
import { ActionLogParams, useActionLogging } from '../../../../hooks/loggingHook';
import ParagraphComponent from '../../../../newComponents/textComponets/paragraphText/paragraph';
import { useNavigation } from '@react-navigation/native';
import { Feather, Ionicons } from '@expo/vector-icons';
import ButtonComponent from '../../../../newComponents/buttons/button';
import { s } from '../../../../newComponents/theme/scale';
import ImageUri from '../../../../newComponents/imageComponents/image';
import { getThemedCommonStyles } from '../../../../assets/styles/CommonStyles';
import AuthVerification from '../../../commonScreens/authentication';
import { useHardwareBackHandler } from '../../../../hooks/HardwareBackHandler';
import { useLngTranslation } from '../../../../hooks/useLngTranslation';
import TextMultiLanguage from '../../../../newComponents/textComponets/multiLanguageText/textMultiLangauge';
import { COMMON_SVG_URLS } from '../../../../assets/blobUrls';

const PhoneAuthenticationScreen: React.FC<PhoneAuthenticationScreenProps> = () => {
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const resendSheetRef = useRef<PopupOrSheetRef>(null);
    const userInfo = useSelector((state: any) => state.userReducer?.userDetails);
    const { decryptAES } = useEncryptDecrypt();
    const { logEvent } = useActionLogging();
    const navigation = useNavigation<any>();
    const REVERSE_NEW_COLOR = useThemeColors(true);
    const reversCommonStyles = getThemedCommonStyles(REVERSE_NEW_COLOR);
    const [authOpen,setAuthOpen]=useState(false);
    const {t}=useLngTranslation();
    const [loading, setLoading] = useState(false);

useHardwareBackHandler(()=>{
    handleBackPress();

})

    const handleChangePhoneNumber = () => {
        const actionData: ActionLogParams = {
            screename: 'PhoneAuthenticationScreen',
            actionName: 'Change Phone Number',
            actionType: 'Button',
            actionObj: { opens: 'Confirmation Sheet' }
        };
        logEvent('button_press', actionData);
        // resendSheetRef?.current?.open();
        verifyAuth();
    };

    const handleBackPress = () => {
        const actionData: ActionLogParams = {
            screename: 'PhoneAuthenticationScreen',
            actionName: 'Navigate Back to LoginVerificationScreen',
            actionType: 'Icon',
            nextScreenName: 'Profile'
        };
        logEvent('navigation_action', actionData);
        navigation.navigate("LoginVerificationScreen",{animation:'slide_from_left'});
    };

    const handleContinue = async () => {
        resendSheetRef?.current?.close();
        const actionData: ActionLogParams = {
            screename: 'PhoneAuthenticationScreen',
            actionName: 'Confirm Change PhoneNumber',
            actionType: 'Button',
        };
        logEvent('button_press', actionData);
        navigation.navigate("PhoneNumberChange");
    }
    const handleAuthClose = () => {
        setAuthOpen(false);
        setLoading(false);
      }
      const handleAuthSucess = () => {
        setAuthOpen(false);
        resendSheetRef?.current?.open();
      }
      const verifyAuth = () => {
        setLoading(true);
        setAuthOpen(true);
      }
      const handleCancel = () => {
        resendSheetRef?.current?.close();
    }
    

    const PhoneAuthenticationeSheetContent = (
         <ViewComponent style={[reversCommonStyles.alignCenter, reversCommonStyles.gap16]}>
            <ViewComponent >
                 <ImageUri uri={COMMON_SVG_URLS.alert_Icon} width={s(90)} height={s(70)} />
            </ViewComponent>
            <TextMultiLanguage
                text={"GLOBAL_CONSTANTS.FOR_SECURITY_REASONS_AFTER_UNBINDING_CHANGING_PHONE_WITHDRAWALS_AND_INTERNAL_TRANSFERS_WILL_BE_DISABLED"}
                style={[reversCommonStyles.fw400, reversCommonStyles.fs14, reversCommonStyles.textWhite,commonStyles.textCenter]}
            />
                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]}>
                        <ViewComponent style={[commonStyles.flex1]}>
                            <ButtonComponent
                                title={"GLOBAL_CONSTANTS.CANCEL"}
                                onPress={handleCancel}
                                solidBackground={true}
                            />
                        </ViewComponent>
                        <ViewComponent style={[commonStyles.flex1]}>
                            <ButtonComponent
                                title={"GLOBAL_CONSTANTS.CONTINUE"}
                                onPress={handleContinue}
                                customContainerStyle={[reversCommonStyles.bg_yellow, reversCommonStyles.rounded100, { height: s(55) }]}
                                customTitleStyle={[reversCommonStyles.fs14, reversCommonStyles.fw700, reversCommonStyles.textAlwaysBlack]}
                            />
                        </ViewComponent>

                    </ViewComponent>
        </ViewComponent>
        
    );
    return (
        <SafeAreaView style={[commonStyles.screenBg, commonStyles.flex1]}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <Container style={commonStyles.container}>
                    <PageHeader title={t("GLOBAL_CONSTANTS.PHONE_AUTHENTICATION")} onBackPress={handleBackPress} />
                    <ViewComponent style={[commonStyles.mt16]}>
                            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap8]}>
                                <TextMultiLanguage text={"GLOBAL_CONSTANTS.PHONE"} style={[commonStyles.fs14, commonStyles.textGrey, commonStyles.fw400]} />
                                <ParagraphComponent style={[commonStyles.fs14, commonStyles.textWhite, commonStyles.fw400]} text= {`${decryptAES(userInfo?.phonecode?? " ")} ${getFormattedPhoneNumber(decryptAES(userInfo?.phoneNumber))}`}/>
                            </ViewComponent>
                        <CommonTouchableOpacity onPress={() => handleChangePhoneNumber()} activeOpacity={0.8}>
                            <ViewComponent style={[commonStyles.dflex, commonStyles.list, commonStyles.p8, commonStyles.mt24]}>
                                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10]}>
                                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter, commonStyles.iconcirclebg]}>
                                        <Feather name="smartphone" size={s(20)} color={NEW_COLOR.TEXT_WHITE} />
                                    </ViewComponent>
                                    <ParagraphComponent text={t("GLOBAL_CONSTANTS.CHANGE_PHONE_NUMBER")} style={[commonStyles.fs16, commonStyles.textWhite]} />
                                </ViewComponent>
                                  <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap8]}>
                                 {loading && <ActivityIndicator size={"small"} color={NEW_COLOR.BG_YELLOW} />}
                                    <Ionicons name="chevron-forward" size={s(20)} style={[commonStyles.textGrey]} />
                                </ViewComponent>
                            </ViewComponent>
                        </CommonTouchableOpacity>
                    </ViewComponent>
                </Container>
            </ScrollView>
            <PopupOrSheet
                ref={resendSheetRef}
                height={s(340)}
                showCloseIcon={false}
                title={undefined}
                showCloseIconAndTittle={false}
            >
                {PhoneAuthenticationeSheetContent}
            </PopupOrSheet>
            {authOpen&&<AuthVerification onClose={handleAuthClose} onSuccess={handleAuthSucess} feature={'Phone change'}/>}
        </SafeAreaView>
    );
};
export default PhoneAuthenticationScreen;