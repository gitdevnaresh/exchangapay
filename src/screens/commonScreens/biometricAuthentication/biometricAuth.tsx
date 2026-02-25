import { useCallback } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import { useLngTranslation } from '../../../hooks/languagesHook/useLngTranslation';
import { useSelector } from 'react-redux';
import { isErrorDispaly } from '../../../utils/helpers';
import { showAppToast } from '../../../components/toasterMessages/ShowMessage';
export default function useBiometricAuth() {
    const { t } = useLngTranslation();
    const showBiometricPrompt = useSelector((state: any) => state.userReducer.showBiometricPrompt);
    const authenticateUser = useCallback(async () => {
        try {
            const availableTypes = await LocalAuthentication.getEnrolledLevelAsync();
            if (availableTypes > 0) {
                const authResult = await LocalAuthentication.authenticateAsync({
                    promptMessage: t('GLOBAL_CONSTANTS.AUTHENTICATE_TO_ACCESS_APP'),
                });

                if (authResult.success) {
                    return true;
                } else {
                    return false

                }
            }
        }
        catch (error) {
            showAppToast(isErrorDispaly(error), 'error');
        }
    }, [t, showBiometricPrompt]);

    return { authenticateUser };
}