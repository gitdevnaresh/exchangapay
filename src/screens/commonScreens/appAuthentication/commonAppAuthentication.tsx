// components/authentication/AppLockScreen.tsx (Consolidated)

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { BackHandler, Platform } from 'react-native';
import { useThemeColors } from '../../../hooks/useThemeColors';
import { getThemedCommonStyles } from '../../../assets/styles/CommonStyles';
import * as LocalAuthentication from 'expo-local-authentication';

// Import all necessary UI components
import PopupOrSheet from '../../../newComponents/models/PopupOrSheet';
import ViewComponent from '../../../newComponents/view/view';
import TextMultiLanguage from '../../../newComponents/textComponets/multiLanguageText/textMultiLangauge';
import ButtonComponent from '../../../newComponents/buttons/button';
import Ionicons from '@expo/vector-icons/Ionicons';
import { s } from '../../../newComponents/theme/scale';
import useBiometricAuth from '../biometricAuthentication/biometricAuth';
import { FaceScanner } from '../../../assets/svg';

interface AppLockScreenProps {
    /** Called when authentication is successful to unlock the app. */
    onUnlock?: () => void;
    onSuccess?: () => void;
}

const AppLockScreen = ({ onUnlock, onSuccess }: AppLockScreenProps) => {
    const { authenticateUser } = useBiometricAuth();
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const biometricPopupRef = useRef<any>(null);
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
                        onSuccess && onSuccess?.();
                    }
                }
            }
        }
        catch (error: any) {
            console.log(error);
        }
    };

    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true);
        return () => backHandler.remove();
    }, []);

    return (
        <ViewComponent>
            <PopupOrSheet showCloseIconAndTittle={false} draggable={false} closeOnPressMask={false} ref={biometricPopupRef} height={s(400)} closeOnDragDown={true} showCloseIcon={false} onClose={() => { }}>
                <ViewComponent style={[commonStyles.flex1, commonStyles.alignCenter, commonStyles.p24, commonStyles.justifyCenter]}>
                    <TextMultiLanguage
                        text="GLOBAL_CONSTANTS.BULL_SWIPE_APP_IS_LOCKED"
                        style={[commonStyles.textAlwaysBlack, commonStyles.fs22, commonStyles.fw700, commonStyles.textCenter, { marginBottom: s(8) }]}
                    />
                    <TextMultiLanguage
                        text="GLOBAL_CONSTANTS.AUTHENTICATE_TO_ACCESS_APP_BULL_SWIPE"
                        style={[commonStyles.textGrey, commonStyles.fs14, commonStyles.fw400, commonStyles.textCenter, commonStyles.mb32]}
                    />
                    {Platform.OS === "ios" ? <FaceScanner /> : <Ionicons name="finger-print-outline" size={s(90)} color="#FB7B7B" />}
                    <ViewComponent style={commonStyles.formItemSpace} />
                    <ButtonComponent title={Platform.OS === "android" ? 'GLOBAL_CONSTANTS.CONTINUE_WITH_TOUCH_ID' : 'GLOBAL_CONSTANTS.CONTINUE_WITH_FACE_ID'} onPress={handleAuthentication} capitalizeTitle={false} />
                </ViewComponent>


            </PopupOrSheet>
        </ViewComponent>
    )
};

export default AppLockScreen;