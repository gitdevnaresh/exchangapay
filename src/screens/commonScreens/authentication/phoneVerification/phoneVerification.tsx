import React, { useState, useEffect, useCallback } from 'react';
import { Keyboard } from 'react-native';
import { useThemeColors } from '../../../../hooks/useThemeColors';
import { getThemedCommonStyles } from '../../../../assets/styles/CommonStyles';
import { OTPInput } from '../../../../newComponents/Inputs/BoxInput';
import TextMultiLanguage from '../../../../newComponents/textComponets/multiLanguageText/textMultiLangauge';
import ButtonComponent from '../../../../newComponents/buttons/button';
import CommonTouchableOpacity from '../../../../newComponents/touchableComponents/touchableOpacity';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useActionLogging } from '../../../../hooks/loggingHook';
import ParagraphComponent from '../../../../newComponents/textComponets/paragraphText/paragraph';
import { useLngTranslation } from '../../../../hooks/useLngTranslation';
import ViewComponent from '../../../../newComponents/view/view';
import OnboardingService from '../../../../services/onboarding';
import useEncryptDecrypt from '../../../../hooks/encDecHook';
import { isErrorDispaly } from '../../../../utils/helpers';
import { useSelector } from 'react-redux';
import ErrorComponent from '../../../../newComponents/errorDisplay/errorDisplay';
import { useIsFocused } from '@react-navigation/native';
import { ActivityIndicator } from 'react-native';
import SafeAreaViewComponent from '../../../../newComponents/safeArea/safeArea';
import SwokipayDashboardLoader from '../../../../newComponents/swokipayloader';
import { s } from '../../../../constants/theme/scale';

interface PhoneVerificationProps {
  feature: string;
  onSuccess: (staus: boolean) => void;
  onClose: () => void; // To close the modal on initial failure
}

const PhoneVerification = ({
  feature,
  onSuccess,
  onClose,
}: PhoneVerificationProps) => {
  const [otpCode, setOtpCode] = useState('');
  const [timer, setTimer] = useState(60);
  const [validationStatus, setValidationStatus] = useState<'error' | "success" | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Used for verify and resend
  const [isResending, setIsResending] = useState(false);

  const userInfo = useSelector((state: any) => state.userReducer.userDetails);
  const { t } = useLngTranslation();
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const { logEvent } = useActionLogging();
  const { encryptAES, decryptAES } = useEncryptDecrypt();
  const decryptedPhoneNumber = decryptAES(userInfo?.phoneNumber);
  const decryptedPhoneCode = decryptAES(userInfo?.phonecode);
  const [error, setError] = useState<string>("");
  const [btnLoading, setBtnLoading] = useState<boolean>(false);
  const [isEditable, setIsEditable] = useState<boolean>(true);

  const isFocused = useIsFocused();


  // This function requests the OTP. It's called on mount and on resend.
  const requestOtp = useCallback(async (isInitialRequest: boolean = false) => {
    setError("");
    setOtpCode('');
    const loaderSetter = isInitialRequest ? setIsLoading : setIsResending;
    loaderSetter(true);
    setValidationStatus(null);
    try {
      const obj = {
        phoneCode: encryptAES(userInfo.phoneCode),
        phoneNumber: encryptAES(userInfo?.phoneNumber),
        isPhoneNoUpdate: false,
        isResendOTP: true,
      };
      const response: any = await OnboardingService.getPhoneNumberOtp(obj);
      if (response.status === 200) {
        logEvent('otp_request_success', { feature });
        setError("");
        setTimer(60);
      } else {
        setError(isErrorDispaly(response));
        throw new Error(isErrorDispaly(response));
      }
    } catch (err: any) {
      logEvent('otp_request_error', { feature, error: err.message });
      setError(isErrorDispaly(err));
      // if (isInitialRequest) {
      //   onClose(); // Close the entire flow if the very first OTP request fails
      // }
    } finally {
      setIsLoading(false);
      loaderSetter(false);
    }
  }, [feature, onClose]);

  // Request OTP as soon as the component mounts
  useEffect(() => {
    requestOtp(true);
  }, [isFocused]);

  // Start the countdown timer
  useEffect(() => {
    if (timer > 0 && validationStatus !== 'success') {
      const interval = setInterval(() => {
        setTimer(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleCodeChange = (newCode: string) => {
    setError("");
    setOtpCode(newCode);
    if (validationStatus) {
      setValidationStatus(null);
    }
  };

  const handleVerify = async () => {
    setError("");
    if (otpCode.length !== 6 || isLoading) return;

    setValidationStatus(null);
    setIsEditable(false)
    try {
      const body = {
        code: encryptAES(otpCode),
        phoneNumber: encryptAES(userInfo.phoneNumber ?? ''),
        phoneCode: encryptAES(userInfo.phoneCode ?? ''),
      };
      const response = await OnboardingService.verifyPhoneNumberOtp(body);
      if (response?.status === 200) {
        Keyboard.dismiss();
        logEvent('otp_success', { feature });
        setValidationStatus('success');
        setTimer(0);
      } else {
        Keyboard.dismiss();
        setIsEditable(true)
        const errorMessage = isErrorDispaly(response);
        setValidationStatus('error');
        logEvent('otp_error', { feature, error: errorMessage });
        setError(isErrorDispaly(response));
      }
    } catch (err: any) {
      setIsEditable(true)
      Keyboard.dismiss();
      const errorMessage = isErrorDispaly(err);
      setValidationStatus('error');
      logEvent('otp_error', { feature, error: errorMessage });
      setError(errorMessage);
    } finally {
      Keyboard.dismiss();
      setIsLoading(false);
    }
  };

  const handleResend = useCallback(() => {
    if (timer === 0 && !isResending) {
      logEvent('resend_otp_press', { feature });
      requestOtp(false);
    }
  }, [timer, isResending, requestOtp, feature, logEvent]);

  const handleContinue = useCallback(() => {
    setBtnLoading(true)
    if (validationStatus === 'success') {
      onSuccess(true);
      setBtnLoading(false)
    } else {
      onSuccess(false);
      setBtnLoading(false)

    }
  }, [validationStatus, onSuccess]);

  // Renders the resend section based on current state
  const renderResendSection = () => {
    if (isResending) {
      return (
        <ViewComponent style={[commonStyles.ml10]}>
          <ActivityIndicator color={NEW_COLOR.BG_YELLOW} size={s(16)} />
        </ViewComponent>
      );
    }

    const isDisabled = timer > 0 || isLoading || validationStatus === 'success';
    const displayText = timer > 0
      ? t("GLOBAL_CONSTANTS.RESEND_CODE_IN", { timer })
      : t("GLOBAL_CONSTANTS.RESEND_CODE");

    if (isDisabled) {
      return (
        <ParagraphComponent
          style={[
            commonStyles.fs14,
            commonStyles.fw400,
            commonStyles.textWhite
          ]}
          text={displayText}
        />
      );
    }

    return (
      <CommonTouchableOpacity onPress={handleResend}>
        <ParagraphComponent
          style={[
            commonStyles.fs14,
            commonStyles.fw400,
            { color: NEW_COLOR.BG_YELLOW }
          ]}
          text={t("GLOBAL_CONSTANTS.RESEND_CODE")}
        />
      </CommonTouchableOpacity>
    );
  };

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={[{ flexGrow: 1 }]}
      keyboardShouldPersistTaps="handled"
    >
      {error && <ErrorComponent message={error} onClose={() => setError('')} screen={true} />}
      {isLoading && (<SafeAreaViewComponent><SwokipayDashboardLoader /></SafeAreaViewComponent>)}
      {!isLoading && (<>
        <TextMultiLanguage
          style={[commonStyles.textGrey, commonStyles.fs14, commonStyles.fw400]}
          text={'GLOBAL_CONSTANTS.OTP_HAS_BEEN_SENT_TO'}
        >
          <ParagraphComponent
            style={[commonStyles.getStartedText, commonStyles.fs14, commonStyles.fw500]}
            text={` ${decryptedPhoneCode || ''} ${decryptedPhoneNumber}`}
          />
        </TextMultiLanguage>
        <ViewComponent style={[commonStyles.px1]}>
          <OTPInput
            code={otpCode}
            setCode={handleCodeChange}
            pinCount={6}
            onCodeFilled={handleVerify}
            validationStatus={validationStatus}
            isEdit={isEditable}
          />
        </ViewComponent>
        <ViewComponent style={[commonStyles.dflex,]}>
          <TextMultiLanguage
            text={'GLOBAL_CONSTANTS.DIDNT_GET_CODE'}
            style={[commonStyles.textGrey, commonStyles.fs14, commonStyles.fw400]}
          />
          {renderResendSection()}
        </ViewComponent>
        <ViewComponent style={[commonStyles.flex1]} />
        <ButtonComponent
          title={'GLOBAL_CONSTANTS.CONTINUE'}
          onPress={handleContinue}
          loading={btnLoading}
          disable={validationStatus !== "success" || isLoading}
        />
      </>)
      }
      <ViewComponent style={[commonStyles.mb32]} />
    </KeyboardAwareScrollView>
  );
};

export default PhoneVerification;