// components/authentication/AppLockScreen.tsx (Consolidated)

import React, { useEffect, useRef } from 'react';
import { BackHandler, Dimensions, Platform } from 'react-native';
import { useThemeColors } from '../../../hooks/themedHook/useThemeColors';
import * as LocalAuthentication from 'expo-local-authentication';
import ViewComponent from '../../../components/view/view';
import TextMultiLanguage from '../../../components/textComponets/multiLanguageText/textMultiLangauge';
import ButtonComponent from '../../../components/buttons/button';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { s } from '../../../constants/styels/scale';
import useBiometricAuth from '../biometricAuthentication/biometricAuth';
import { getThemedCommonStyles } from '../../../components/CommonStyles';
import CustomRBSheet from '../../../components/models/commonDrawer';
import SafeAreaViewComponent from '../../../components/safeArea/safeArea';
import Container from '../../../components/container/container';
import ParagraphComponent from '../../../components/textComponets/paragraphText/paragraph';
import FaceSecurityImage from '../../../components/svgIcons/onboardingImages/faceScanner';
import { Logger } from '../../../utils/Logger';

interface AppLockScreenProps {
    /** Called when authentication is successful to unlock the app. */
    onUnlock?: () => void;
}

const AppLockScreen = ({ onUnlock }: AppLockScreenProps) => {
    const { authenticateUser } = useBiometricAuth();
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const biometricPopupRef = useRef<any>(null);
    const { height } = Dimensions.get("window");

    useEffect(() => {
        handleAuthentication();
    }, []);

    // Main authentication logic
    const handleAuthentication = async () => {
        biometricPopupRef.current?.close();
        try {
            const hasHardware = await LocalAuthentication.hasHardwareAsync();
            if (hasHardware) {
                const isEnrolled = await LocalAuthentication.isEnrolledAsync();
                if (isEnrolled) {
                    const res = await authenticateUser();
                    if (res === false) {
                        biometricPopupRef.current?.open();
                    } else {
                        if (onUnlock) onUnlock();
                    }
                } else {
                    if (onUnlock) onUnlock();
                }
            } else {
                if (onUnlock) onUnlock();
            }
        }
        catch (error: any) {
            if (onUnlock) onUnlock();
        }
    };

    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true);
        return () => backHandler.remove();
    }, []);

    return (
        <ViewComponent>
            <CustomRBSheet draggable={false} closeOnPressMask={false} refRBSheet={biometricPopupRef} height={height} closeOnDragDown={true} onClose={() => { }} customStyles={{
                container: {
                    backgroundColor: NEW_COLOR.SHEET_BG,
                    borderTopLeftRadius: 5,
                    borderTopRightRadius: 5,
                },
            }}>
                <SafeAreaViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
                    <Container style={[commonStyles.container]}>
                        <ViewComponent style={[commonStyles.flex1]}>
                            <ViewComponent style={[commonStyles.mt44]} />
                            <ParagraphComponent style={[commonStyles.sectionTitle, commonStyles.textCenter, commonStyles.fs32]} text={Platform.OS === 'ios' ? "GLOBAL_CONSTANTS.FACE_BIOMETRIC_VERIFICATION" : "GLOBAL_CONSTANTS.BIOMETRIC_VERIFICATION"} />
                            <ViewComponent style={[commonStyles.flex1, commonStyles.justifyCenter, commonStyles.mb89]}>
                                <ViewComponent style={[commonStyles.mxAuto, commonStyles.sectionGap, commonStyles.dflex, commonStyles.gap20]}>
                                    {Platform.OS === 'android' && <Ionicons name="finger-print-outline" size={s(120)} color={NEW_COLOR.TEXT_PRIMARY} />}
                                    {Platform.OS === 'ios' && <FaceSecurityImage color={NEW_COLOR.TEXT_PRIMARY} />}
                                </ViewComponent>
                                <TextMultiLanguage text="GLOBAL_CONSTANTS.AUTHENTICATE_TO_ACCESS_APP_BULL_SWIPE" style={[commonStyles.textGrey, commonStyles.fs16, commonStyles.fw400, commonStyles.textCenter, commonStyles.mb32]} />
                            </ViewComponent>

                            <ViewComponent style={[commonStyles.sectionGap]}> {/* Debug background color */}
                                <ButtonComponent
                                    title={Platform.OS === 'ios' ? "GLOBAL_CONSTANTS.CONTINUE" : "GLOBAL_CONSTANTS.CONTINUE_WITH_TOUCH_ID"}
                                    onPress={handleAuthentication}
                                />
                            </ViewComponent>
                            <ViewComponent style={[commonStyles.sectionGap]} />
                        </ViewComponent>
                    </Container>
                </SafeAreaViewComponent>
            </CustomRBSheet>
        </ViewComponent>
    )
};

export default AppLockScreen;