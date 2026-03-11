import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useThemeColors } from '../../../../hooks/useThemeColors';
import { getThemedCommonStyles } from '../../../../assets/styles/CommonStyles';
import TextMultiLanguage from '../../../../newComponents/textComponets/multiLanguageText/textMultiLangauge';
import ButtonComponent from '../../../../newComponents/buttons/button';
import ViewComponent from '../../../../newComponents/view/view';
import PopupOrSheet from '../../../../newComponents/models/PopupOrSheet';
import { showAppToast } from '../../../../newComponents/ToasterMessages/ShowMessage';
import * as LocalAuthentication from 'expo-local-authentication';
import { useLngTranslation } from '../../../../hooks/useLngTranslation';
import { useActionLogging } from '../../../../hooks/loggingHook'; // For logging
import { s } from '../../../../constants/theme/scale';

interface BiometricViewProps {
  feature: string;
  /** Called when the biometric step is complete (either by success or unavailability) and the parent should proceed to the next step. */
  onSuccess: () => void;
  /** Called when the user explicitly cancels the flow. */
  onCancel: () => void;
}

const BiometricView = ({ feature, onSuccess, onCancel }: BiometricViewProps) => {
  const popupRef = useRef<any>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const { t } = useLngTranslation();
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const { logEvent } = useActionLogging();

  // Open the popup as soon as the component is rendered
  useEffect(() => {
    const timer = setTimeout(() => {
      popupRef.current?.open();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleAuthentication = useCallback(async () => {
    if (isAuthenticating) return;
    setIsAuthenticating(true);
    logEvent('biometric_auth_started', { feature });

    try {
      // 1. Check for hardware and enrollment first.
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!hasHardware || !isEnrolled) {
        logEvent('biometric_unavailable', { feature });
        showAppToast(t('GLOBAL_CONSTANTS.NO_BIOMETRIC_SENSORS'), 'error');
        onSuccess();
        return;
      }

      // Close the popup to show the native OS prompt underneath.
      popupRef.current?.close();
      await new Promise(resolve => setTimeout(resolve, 300)); // Give popup time to close

      // 2. Trigger the native biometric prompt.
      const authResult = await LocalAuthentication.authenticateAsync({
        promptMessage: t('GLOBAL_CONSTANTS.AUTHENTICATE_TO_ACCESS_APP'),
        cancelLabel: t('GLOBAL_CONSTANTS.CANCEL'),
        disableDeviceFallback: true,
      });

      if (authResult.success) {
        logEvent('biometric_auth_success', { feature });
        onSuccess(); // On success, tell the parent to proceed.
      } else {
        logEvent('biometric_auth_failed_or_cancelled', { feature, error: authResult.error });
        // For any failure or cancellation, just reopen the popup to let the user try again or cancel manually.
        showAppToast("Athentication failed", 'error');
        popupRef.current?.open();
      }
    } catch (error: any) {
      logEvent('biometric_auth_error', { feature, error: error.message });
        showAppToast("Athentication failed", 'error');
      // On an unexpected error, reopen the popup.
      popupRef.current?.open();
    } finally {
      setIsAuthenticating(false);
    }
  }, [isAuthenticating, onSuccess, feature, logEvent, t]);

  return (
    <PopupOrSheet ref={popupRef} onClose={onCancel} height={s(350)}>
      <ViewComponent style={[commonStyles.flex1, commonStyles.alignCenter, commonStyles.p24]}>
        <TextMultiLanguage
          text="GLOBAL_CONSTANTS.USE_TOUCH_ID"
          style={[commonStyles.textGrey, commonStyles.fs24, commonStyles.fw600, commonStyles.textCenter, commonStyles.mb16]}
        />
        <TextMultiLanguage
          text="GLOBAL_CONSTANTS.YOU_WILL_SIGN_IN"
          style={[commonStyles.textGrey, commonStyles.fs16, commonStyles.fw400, commonStyles.textCenter, commonStyles.mb24]}
        />
        <ButtonComponent
          title="GLOBAL_CONSTANTS.CONTINUE_WITH_TOUCH_ID"
          onPress={handleAuthentication}
        />
      </ViewComponent>
    </PopupOrSheet>
  );
};

export default BiometricView;