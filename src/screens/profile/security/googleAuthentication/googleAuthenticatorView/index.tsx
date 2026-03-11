import React, { useState, useEffect } from 'react';
import { useThemeColors } from '../../../../../hooks/useThemeColors';
import { s } from '../../../../../constants/theme/scale';
import ViewComponent from '../../../../../newComponents/view/view';
import ButtonComponent from '../../../../../newComponents/buttons/button';
import { OTPInput } from '../../../../../newComponents/Inputs/BoxInput';
import { showAppToast } from '../../../../../newComponents/ToasterMessages/ShowMessage';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import PageHeader from '../../../../../newComponents/pageHeader/pageHeader';
import { isErrorDispaly } from '../../../../../utils/helpers';
import Container from '../../../../../newComponents/container/container';
import SafeAreaViewComponent from '../../../../../newComponents/safeArea/safeArea';
import SwokipayDashboardLoader from '../../../../../newComponents/swokipayloader';
import { getThemedCommonStyles } from '../../../../../assets/styles/CommonStyles';
import ProfileService from '../../../../../services/profile';
import ImageUri from '../../../../../newComponents/imageComponents/image';
import { COMMON_SVG_URLS } from '../../../../../assets/blobUrls';
import TextMultiLanguage from '../../../../../newComponents/textComponets/multiLanguageText/textMultiLangauge';
import { useLngTranslation } from '../../../../../hooks/useLngTranslation';
import { useHardwareBackHandler } from '../../../../../hooks/HardwareBackHandler';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { EnrollFrontEggAuthenticator } from '../../../../../apiServices/fronteggApiServices/fronteggServices';
import { useSelector } from 'react-redux';
import { scanFromURLAsync } from 'expo-camera';
import ParagraphComponent from '../../../../../newComponents/textComponets/paragraphText/paragraph';
import CopyCard from '../../../../../newComponents/copyComponent/CopyCard';
import { copyToClipboard } from '../../../../../newComponents/copyToClipBoard/copy ToClopBoard';
import ErrorComponent from '../../../../../newComponents/errorDisplay/errorDisplay';

const GoogleAthenticatorEnable: React.FC = () => {
  const [otpCode, setOtpCode] = useState<string>('');
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [verifyLoading, setVerifyLoading] = useState<boolean>(false);
  const [qrCodeUri, setQrCodeUri] = useState<string | null>(null);
  const [otpStatus, setOtpStatus] = useState<'success' | 'error' | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [btnLoading, setBtnLoading] = useState<boolean>(false);
  const [recoveryCode, setRecoveryCode] = useState<string>('');
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const navigation = useNavigation<any>();
  const { t } = useLngTranslation();
  const isFoucused = useIsFocused();
  const userInfo = useSelector((state: any) => state.userReducer.userDetails);
  const [qrSecrete, setQrSecrete] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isEditable, setIsEditable] = useState<boolean>(true);

  useEffect(() => {
    enableAthenticator();
  }, [isFoucused]);

  const enableAthenticator = async () => {
    setError("");
    setInitialLoading(true);
    try {
      const response: any = await ProfileService.enableAthenticator();
      if (response?.ok) {
        const parsedData = JSON.parse(response?.data);
        setQrCodeUri(parsedData?.qrCode);
        getQrSecret(parsedData?.qrCode);
      }
      else {
        setError(isErrorDispaly(response));
      }
    } catch (e) {
      setError(isErrorDispaly(e));
    } finally {
      setInitialLoading(false);
    }
  }

  const handleCodeChange = (newCode: string) => {
    setErrorMessage('');
    setError("");
    setOtpCode(newCode);
    if (newCode.length !== 6 && otpStatus) {
      setOtpStatus(null);
    }
  };

  const handleVerifyOtp = async (otpCode: string) => {
    if (otpCode.length !== 6 || verifyLoading) return;
    setOtpStatus(null);
    setVerifyLoading(true);
    setBtnLoading(true);
    setIsEditable(false);
    let body = {
      token: otpCode
    }
    try {
      const result: any = await EnrollFrontEggAuthenticator(userInfo?.userId, body);
      if (result.status === 200) {
        setOtpStatus('success');
        setRecoveryCode(result?.data?.recoveryCode);
        // showAppToast(t("GLOBAL_CONSTANTS.MFA_CODE_VERIFIED"), 'success');
        setBtnLoading(false);
      } else {
        setIsEditable(true)
        const errorMsg = result?.data?.errors[0];
        setErrorMessage(isErrorDispaly(errorMsg));
        setOtpStatus('error');
        setBtnLoading(false);
      }
    } catch (error: any) {
      setIsEditable(true)
      const errorMsg = error?.data?.errors[0];
      setOtpStatus('error');
      setErrorMessage(isErrorDispaly(errorMsg));
      setBtnLoading(false);
    } finally {
      setVerifyLoading(false);
      setBtnLoading(false);
    }
  };

  const handleContinue = () => {
    setBtnLoading(true);
    if (otpStatus === 'success') {
      setOtpCode("");
      setOtpStatus(null);
      navigation.navigate("RecoveryCode", { recoveryCode: recoveryCode });
    }
    setBtnLoading(false);
  };
  const handleGoBack = () => {
    navigation.goBack();
  };
  useHardwareBackHandler(() => {
    handleGoBack();
  });

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
      <PageHeader onBackPress={handleGoBack} title={"GLOBAL_CONSTANTS.GOOGLE_AUTHENTICATOR_TITLE"} />
      {error && <ErrorComponent message={error} screen={true} />}
      <KeyboardAwareScrollView
        contentContainerStyle={[{ flexGrow: 1 }]}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
      >
        {initialLoading && <SafeAreaViewComponent><SwokipayDashboardLoader /></SafeAreaViewComponent>}
        {!initialLoading && (
          <>
            <ViewComponent style={[
              commonStyles.dflex,
              commonStyles.mb24,
              commonStyles.rounded10,
              commonStyles.gap10
            ]}>
              <ViewComponent>
                <ImageUri uri={COMMON_SVG_URLS.alertIcon} height={s(24)} width={s(24)} />
              </ViewComponent>
              <TextMultiLanguage
                style={[commonStyles.fs14_24, commonStyles.fw400, commonStyles.textGrey, commonStyles.flex1]}
                text="GLOBAL_CONSTANTS.GOOGLE_AUTHENTICATOR_SECURITY_WARNING"
              />
            </ViewComponent>
            {qrCodeUri && <ViewComponent style={[commonStyles.py14, commonStyles.px16, commonStyles.rounded12, commonStyles.mb12, commonStyles.gap10]}>
              <ViewComponent style={[commonStyles.alignCenter]}>
                <ViewComponent style={[commonStyles.textWhite]}>
                  <ImageUri source={{ uri: qrCodeUri }} style={{ width: s(220), height: s(220) }} />
                </ViewComponent>
              </ViewComponent>
            </ViewComponent>}
            {qrSecrete && <ViewComponent style={[commonStyles.alignCenter, commonStyles.textCenter, commonStyles.sectionGap]}>
              <ViewComponent style={[commonStyles.dflex, commonStyles.gap8, commonStyles.alignCenter]}>
                <ParagraphComponent text={qrSecrete || ""} style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textWhite]} numberOfLines={1} />
                <CopyCard onPress={() => copyToClipboard(qrSecrete)} size={s(24)} />
              </ViewComponent>
            </ViewComponent>
            }
            <TextMultiLanguage text={"GLOBAL_CONSTANTS.GOOGLE_AUTHENTIATION_CODE"} style={[commonStyles.pageTitle]} />
            <ViewComponent style={[commonStyles.px1]}>
              <OTPInput
                code={otpCode}
                setCode={handleCodeChange}
                pinCount={6}
                onCodeFilled={handleVerifyOtp}
                validationStatus={otpStatus}
                errorMessage={errorMessage}
                isEdit={isEditable}
              />
            </ViewComponent>
            <ViewComponent style={[commonStyles.flex1]} />
            <ButtonComponent
              title={"GLOBAL_CONSTANTS.CONTINUE"}
              onPress={handleContinue}
              loading={btnLoading}
              disable={otpStatus !== 'success'}
            />
          </>
        )}
        <ViewComponent style={[commonStyles.mb32]} />
      </KeyboardAwareScrollView>
    </Container>
  );
};

export default GoogleAthenticatorEnable;