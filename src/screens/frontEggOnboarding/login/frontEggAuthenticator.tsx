import React, { useState, useEffect, useRef } from 'react';
import { storeToken } from '../../../services/auth0Service';
import { useThemeColors } from '../../../hooks/useThemeColors';
import { s } from '../../../constants/theme/scale';
import ViewComponent from '../../../newComponents/view/view';
import ButtonComponent from '../../../newComponents/buttons/button';
import useMemberLogin from '../../../hooks/userInfoHook';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import PageHeader from '../../../newComponents/pageHeader/pageHeader';
import { isErrorDispaly, logApiErrorToSentry } from '../../../utils/helpers';
import Container from '../../../newComponents/container/container';
import { copyToClipboard } from '../../../newComponents/copyToClipBoard/copy ToClopBoard';
import TextMultiLanguage from '../../../newComponents/textComponets/multiLanguageText/textMultiLangauge';
import SwokipayDashboardLoader from '../../../newComponents/swokipayloader';
import crashlytics from '@react-native-firebase/crashlytics';
import { getThemedCommonStyles } from '../../../assets/styles/CommonStyles';
import ParagraphComponent from '../../../newComponents/textComponets/paragraphText/paragraph';
import CopyCard from '../../../newComponents/copyComponent/CopyCard';
import { OTPInput } from '../../../newComponents/Inputs/BoxInput';
import { Keyboard, TouchableOpacity } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import ImageUri from '../../../newComponents/imageComponents/image';
import { FrontEggService, updateFcmToken, verifyAuthenticator, verifyMFACode } from '../../../apiServices/fronteggApiServices/fronteggServices';
import { COMMON_SVG_URLS } from '../../../assets/blobUrls';
import { useHardwareBackHandler } from '../../../hooks/HardwareBackHandler';
import { handleSessionExpiry } from '../../../utils/sessionHandler';
import PopupOrSheet, { PopupOrSheetRef } from '../../../newComponents/models/PopupOrSheet';
import { useSelector } from 'react-redux';
import { getAllEnvData } from '../../../../Environment';
import { scanFromURLAsync } from 'expo-camera';
import { useLngTranslation } from '../../../hooks/useLngTranslation';
import ErrorComponent from '../../../newComponents/errorDisplay/errorDisplay';

const MfaAuthenticator: React.FC = (props: any) => {
  const [otpCode, setOtpCode] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [initialLoading, setInitialLoading] = useState<boolean>(false);
  const [verifyLoading, setVerifyLoading] = useState<boolean>(false);
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const { getMemDetails } = useMemberLogin();
  const navigation = useNavigation<any>();
  const [otpStatus, setOtpStatus] = useState<'success' | 'error' | null>(null);
  const [mfaDetails, setMfaDetails] = useState(props?.route?.params?.userData)
  const sessionExpiredSheetRef = useRef<PopupOrSheetRef>(null);
  const signupInfo = useSelector((state: any) => state.userReducer?.storeValues);
  const REVERS_NEW_COLOR = useThemeColors(true);
  const ReverseCommonStyles = getThemedCommonStyles(REVERS_NEW_COLOR);
  const isFocused = useIsFocused();
  const getConfig = getAllEnvData();
  const [qrSecrete, setQrSecrete] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const { t } = useLngTranslation();
  const [isEditable, setIsEditable] = useState<boolean>(true);
  useEffect(() => {
    setInitialLoading(true);
    setOtpCode("");
    setOtpStatus(null);
    setError("");
    setErrorMsg("");
    Keyboard.dismiss();
    if (props?.route?.params?.userData) {
      setMfaDetails(props?.route?.params?.userData);
      setInitialLoading(false);
      getQrSecret(props?.route?.params?.userData?.qrCode);
    };
    setInitialLoading(false)
  }, [props?.route?.params?.userData, isFocused]);


  const handleSignin = async () => {
    setInitialLoading(true);
    setError("");
    setErrorMsg("");
    setOtpStatus(null);
    setOtpCode("");
    Keyboard.dismiss();
    setOtpCode("");
    try {
      const body = {
        email: signupInfo?.feildOne,
        password: signupInfo?.feildTwo
      }
      const response: any = await FrontEggService.userSignIn(body)
      if (response?.status === 200) {
        const parsedData = JSON.parse(response.data);
        setMfaDetails(parsedData);
        getQrSecret(parsedData?.qrCode);
        setInitialLoading(false);

      } else {
        setError(isErrorDispaly(response));
        setInitialLoading(false);
      }
    } catch (error: any) {
      setError(isErrorDispaly(error));
      setInitialLoading(false);
    }
  }
  const handleVerify = async () => {
    Keyboard.dismiss();
    setVerifyLoading(true);
    setIsEditable(false)
    const deviceId = mfaDetails?.mfaDevices?.authenticators[0]?.id;
    if (!mfaDetails?.mfaToken || otpCode.length !== 6 || verifyLoading) return;
    const body = {
      "value": otpCode,
      "mfaToken": mfaDetails?.mfaToken,
      "rememberDevice": true

    }
    try {
      let result: any;
      if (mfaDetails?.mfaEnrolled == false) {
        result = await verifyAuthenticator(body);
      } else {
        result = await verifyMFACode(deviceId, body);
      };
      const parsedData: any = result.data;
      if (parsedData?.accessToken) {
        updateFcmToken();
        await storeToken(parsedData.accessToken, parsedData?.refreshToken);
        // showAppToast(t("GLOBAL_CONSTANTS.MFA_CODE_VERIFIED"), 'success', 2000);
        setOtpStatus('success');
        Keyboard.dismiss();
        setVerifyLoading(false);
      } else {
        setIsEditable(true)
        setVerifyLoading(false);
        setOtpStatus('error');
        Keyboard.dismiss();
        logApiErrorToSentry({
          url: `${getConfig.apiUrls.apiUrl}/auth/v1/user/mfa/authenticator`,
          method: "POST",
          statusCode: 422,
          requestBody: body,
          responseData: errorMsg,
          userId: parsedData?.userId,
          errorMessage: `Invalid Grant Error: ${parsedData?.error_description || 'Unknown error'}`,
        });
        crashlytics().setAttributes({
          endpoint: "auth/v1/user/mfa/authenticator/",
          method: "POST",
          status: "422",
          appName: "Swakipay",
          response: JSON.stringify(parsedData.error),
          request: JSON.stringify(body ?? {}),
        });
        crashlytics().recordError(new Error(`Invalid Grant Error: ${parsedData?.error_description || 'Unknown error'}`));

      }

    } catch (error: any) {
      const errorData = error?.data || error?.response?.data;
      setVerifyLoading(false);
      setIsEditable(true)
      const errorMsg = errorData?.errors?.[0] || isErrorDispaly(error);
      // Handle session expiry
      const sessionResult = handleSessionExpiry(error, () => {
        Keyboard.dismiss();
        sessionExpiredSheetRef.current?.open();
      });
      if (sessionResult.isSessionExpired) {
        setErrorMsg(sessionResult.message || errorMsg);
        setOtpStatus('error');
        return;
      }
      setErrorMsg(errorMsg);
      setOtpStatus('error');
      logApiErrorToSentry({
        url: `${getConfig.apiUrls.apiUrl}/auth/v1/user/mfa/authenticator`,
        method: "POST",
        statusCode: 422,
        requestBody: body,
        responseData: error,
        userId: "",
        errorMessage: `Invalid Grant Error: ${errorMsg || 'Unknown error'}`,
      });
    } finally {
      setVerifyLoading(false);
    }
  };

  useHardwareBackHandler(() => {
    handleGoBack();
  });

  const isLoading = initialLoading || verifyLoading;

  const handleGoBack = () => {
    navigation.navigate("FrontEggLogin", { animation: 'slide_from_left' })
  };
  const handleCodeChange = (newCode: string) => {
    setError("");
    setOtpCode(newCode);
    if (newCode.length !== 6 && otpStatus) {
      setOtpStatus(null);
    }
  };
  const handleNavigateRecovery = () => {
    navigation.navigate("mfaRecovery")
  };

  const handleContinue = () => {
    setVerifyLoading(true);
    getMemDetails();
    setVerifyLoading(false);
  };
  const getQrSecret = async (imageUri: string) => {
    const results = await scanFromURLAsync(imageUri, ['qr']);
    if (!results?.length) return null;
    const scannedText = results[0]?.data;
    // Extract secret using regex
    const secretMatch = scannedText?.match(/secret=([^&]+)/);
    if (secretMatch && secretMatch[1]) {
      const secret = secretMatch[1];
      setQrSecrete(secret);
      return secret;
    }

    return null;
  };


  return (
    <Container style={[commonStyles.flex1, commonStyles.screenBg]}>
      <PageHeader onBackPress={handleGoBack} title={"GLOBAL_CONSTANTS.MULTI_FACTOR_AUTHENTICATION"} />
      <KeyboardAwareScrollView
        contentContainerStyle={[{ flexGrow: 1 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        enableOnAndroid={true}
        extraScrollHeight={s(100)}
      >
        {initialLoading && <SwokipayDashboardLoader />}
        {!initialLoading && <ViewComponent style={[commonStyles.flex1]}>
          {error && <ErrorComponent message={error} />}
          <ViewComponent>
            <ViewComponent style={[commonStyles.dflex, commonStyles.alignStart, commonStyles.gap8, commonStyles.mb24]}>
              <ViewComponent>
                <ImageUri uri={COMMON_SVG_URLS.alertIcon} height={s(24)} width={s(24)} />
              </ViewComponent>
              <TextMultiLanguage
                text={mfaDetails?.qrCode ? "GLOBAL_CONSTANTS.MFA_INFO" : "GLOBAL_CONSTANTS.ENTER_THE_SIX_DIGIT_CODE_FROM_YOUR_GOOGLE_AUTHENTICATOR_APP_TO_CONTINUE_LOGGING_IN"}
                style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textGrey, commonStyles.flex1]}
              />
            </ViewComponent>
            {(mfaDetails?.qrCode) && <ViewComponent style={[commonStyles.sectionGap]} >

              <ViewComponent style={[commonStyles.alignCenter]}>
                <ViewComponent style={[commonStyles.bgAlwaysWhite, commonStyles.rounded16]}>
                  <ImageUri
                    source={{ uri: mfaDetails?.qrCode }}
                    width={s(220)}
                    height={s(220)}
                  />
                </ViewComponent>
              </ViewComponent>
              <ViewComponent style={[commonStyles.mb16]} />
              {qrSecrete && <ViewComponent style={[commonStyles.alignCenter, commonStyles.textCenter]}>
                <ViewComponent style={[commonStyles.dflex, commonStyles.gap8, commonStyles.alignCenter]}>
                  <ParagraphComponent text={qrSecrete || ""} style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textWhite]} numberOfLines={1} />
                  <CopyCard onPress={() => copyToClipboard(qrSecrete)} size={s(24)} />
                </ViewComponent>
              </ViewComponent>
              }
              <ViewComponent style={[commonStyles.titleSectionGap]} />
              <ViewComponent style={[commonStyles.sectionGap]}>
                <TextMultiLanguage text={"GLOBAL_CONSTANTS.MFA_RECOVERY_CODE"} style={[commonStyles.fs16, commonStyles.fw700, commonStyles.mb8, commonStyles.textWhite, commonStyles.textCenter]} />
                <TextMultiLanguage text={"GLOBAL_CONSTANTS.MFA_RECOVERY_CODE_INFO"} style={[commonStyles.textCenter, commonStyles.textGrey, commonStyles.fs14, commonStyles.fw400]} />
              </ViewComponent>
              <ViewComponent style={[commonStyles.rounded12, commonStyles.p8, commonStyles.rewardsbg, commonStyles.gap8]}>
                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent]}>
                  <TextMultiLanguage text={"GLOBAL_CONSTANTS.RECOVERY_CODE"} style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textGrey]} />

                  <CopyCard onPress={() => copyToClipboard(mfaDetails?.recoveryCode)} size={s(24)} />
                </ViewComponent>
                <ParagraphComponent text={(mfaDetails?.recoveryCode)} style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textWhite]} numberOfLines={1} />
              </ViewComponent>
            </ViewComponent>}
            <TextMultiLanguage text={"GLOBAL_CONSTANTS.MFA_CODE_LABEL"} style={[commonStyles.pageTitle]} />
            <ViewComponent style={[commonStyles.px1]}>
              <OTPInput
                code={otpCode}
                setCode={handleCodeChange}
                pinCount={6}
                onCodeFilled={handleVerify}
                validationStatus={otpStatus}
                errorMessage={errorMsg}
                isEdit={isEditable}
                autoFocus={false}
              />
            </ViewComponent>
            {!mfaDetails?.qrCode && <TouchableOpacity
              disabled={otpStatus?.toLocaleLowerCase() === "success"}
              style={[commonStyles.sectionGap]}
              onPress={handleNavigateRecovery}
            >
              <TextMultiLanguage
                text={"GLOBAL_CONSTANTS.CONTINUE_WITH_RECOVERY_CODE"}
                style={[commonStyles?.fw500, commonStyles.mb10, commonStyles?.fs14, { color: otpStatus?.toLocaleLowerCase() === "success" ? NEW_COLOR.TEXT_GREY : NEW_COLOR.BG_YELLOW }]}
              />
            </TouchableOpacity>}
          </ViewComponent>

        </ViewComponent>}
        <ViewComponent style={[commonStyles.mt10]} />
        <ButtonComponent
          title={"GLOBAL_CONSTANTS.CONFIRM"}
          onPress={handleContinue}
          loading={verifyLoading}
          disable={isLoading || otpCode.length !== 6 || otpStatus !== 'success'}
        />
        <ViewComponent style={[commonStyles.sectionGap]} />
      </KeyboardAwareScrollView>

      <PopupOrSheet
        ref={sessionExpiredSheetRef}
        height={s(250)}
        showCloseIcon={false}
      >
        <ViewComponent style={[commonStyles.justifyContent]}>
          <TextMultiLanguage
            text="GLOBAL_CONSTANTS.SESSION_EXPIRED_MESSAGE"
            style={[commonStyles.fs16, ReverseCommonStyles.textWhite, commonStyles.textCenter, commonStyles.mb24]}
          />
          <ViewComponent style={[commonStyles.sectionGap]} />
          <ButtonComponent
            title="GLOBAL_CONSTANTS.REFRESH"
            onPress={() => {
              sessionExpiredSheetRef.current?.close();
              handleSignin();
            }}
          />
        </ViewComponent>
      </PopupOrSheet>
    </Container>
  );
};


export default MfaAuthenticator;     