import React, { useEffect, useState } from 'react';
import { useThemeColors } from '../../../../../hooks/useThemeColors';
import { s } from '../../../../../constants/theme/scale';
import ViewComponent from '../../../../../newComponents/view/view';
import ButtonComponent from '../../../../../newComponents/buttons/button';
import { OTPInput } from '../../../../../newComponents/Inputs/BoxInput';
import { showAppToast } from '../../../../../newComponents/ToasterMessages/ShowMessage';
import { useNavigation } from '@react-navigation/native';
import PageHeader from '../../../../../newComponents/pageHeader/pageHeader';
import { isErrorDispaly } from '../../../../../utils/helpers';
import ScrollViewComponent from '../../../../../newComponents/scrollView/scrollView';
import Container from '../../../../../newComponents/container/container';
import { getThemedCommonStyles } from '../../../../../assets/styles/CommonStyles';
import ProfileService from '../../../../../services/profile';
import ImageUri from '../../../../../newComponents/imageComponents/image';
import { COMMON_SVG_URLS } from '../../../../../assets/blobUrls';
import TextMultiLanguage from '../../../../../newComponents/textComponets/multiLanguageText/textMultiLangauge';
import { useLngTranslation } from '../../../../../hooks/useLngTranslation';
import { useHardwareBackHandler } from '../../../../../hooks/HardwareBackHandler';
import { getMFADevices } from '../../../../../apiServices/fronteggApiServices/fronteggServices';
import { useSelector } from 'react-redux';
import CommonTouchableOpacity from '../../../../../newComponents/touchableComponents/touchableOpacity';
import { Keyboard } from 'react-native';
import ErrorComponent from '../../../../../newComponents/errorDisplay/errorDisplay';

const GoogleAthenticatorDisable: React.FC = () => {
  const [otpCode, setOtpCode] = useState<string>('');
  const [verifyLoading, setVerifyLoading] = useState<boolean>(false);
  const [otpStatus, setOtpStatus] = useState<'success' | 'error' | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [btnLoading, setBtnLoading] = useState<boolean>(false);
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const navigation = useNavigation<any>();
  const { t } = useLngTranslation();
  const userInfo = useSelector((state: any) => state.userReducer?.userDetails);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [error, setError] = useState<string>("");
  const [isEditable, setIsEditable] = useState<boolean>(true);


  useEffect(() => {
    deviceID();
  }, [])

  const handleCodeChange = (newCode: string) => {
    setErrorMessage('');
    setOtpCode(newCode);
    if (newCode.length !== 6 && otpStatus) {
      setOtpStatus(null);
    }
  };



  const handleVerifyOtp = async (otpCode: string) => {
    setError("");
    if (otpCode.length !== 6 || verifyLoading) return;
    setOtpStatus(null);
    setVerifyLoading(true);
    setVerifyLoading(true);
    setIsEditable(false);
    let body = {
      token: otpCode,
      deviceId: deviceId
    }
    try {
      const result: any = await ProfileService.aathenticatorDisable(body);
      if (result.status === 200) {
        Keyboard.dismiss();
        setOtpStatus('success');
        // showAppToast(t("GLOBAL_CONSTANTS.MFA_CODE_VERIFIED"), 'success');
        setVerifyLoading(false);
      } else {
        setIsEditable(true);
        Keyboard.dismiss();
        setErrorMessage(isErrorDispaly(result));
        setOtpStatus('error');
        setVerifyLoading(false);
      }
    } catch (error) {
      setIsEditable(true);
      setOtpStatus('error');
      Keyboard.dismiss();
      setErrorMessage(isErrorDispaly(error));
      setVerifyLoading(false);
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleContinue = () => {
    setError("");
    setBtnLoading(true);
    if (otpStatus === 'success') {
      handleGoBack();
    }
    setBtnLoading(false);
  };

  const deviceID = async () => {
    setError("");
    try {
      const response: any = await getMFADevices(userInfo?.userId);
      if (response?.status === 200) {
        const authenticatorId = response?.data?.authenticators?.[0]?.id;
        setDeviceId(authenticatorId);
      }
      else {
        setError(isErrorDispaly(response));
      }
    } catch (e) {
      setError(isErrorDispaly(e));
    }
  }



  const handleGoBack = () => {
    navigation.goBack();
  };

  useHardwareBackHandler(() => {
    handleGoBack();
  })
  const handleNavigateRecovery = () => {
    navigation.navigate("mfaRecovery", { screenName: "AthenticatorDisable" });
  };

  return (
    <Container style={[commonStyles.flex1, commonStyles.screenBg]}>
      <PageHeader onBackPress={handleGoBack} title={"GLOBAL_CONSTANTS.GOOGLE_AUTHENTICATOR_TITLE"} />
      {error && <ErrorComponent message={error} screen={true} />}
      <ViewComponent style={[commonStyles.flex1]}>
        <ScrollViewComponent style={[commonStyles.flex1]}>
          <ViewComponent>
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
            <CommonTouchableOpacity
              disabled={otpStatus?.toLocaleLowerCase() === "success"}
              style={[commonStyles.mt10]}
              onPress={handleNavigateRecovery}
            >
              <TextMultiLanguage

                text={"GLOBAL_CONSTANTS.CONTINUE_WITH_RECOVERY_CODE"}
                style={[commonStyles.fw500, commonStyles.fs14, { color: otpStatus?.toLocaleLowerCase() === "success" ? NEW_COLOR.TEXT_WHITE : NEW_COLOR.BG_YELLOW }]}
              />
            </CommonTouchableOpacity>
          </ViewComponent>
        </ScrollViewComponent>
        <ViewComponent style={[commonStyles.sectionGap]}>
          <ButtonComponent
            title={"GLOBAL_CONSTANTS.CONFIRM"}
            onPress={handleContinue}
            loading={verifyLoading}
            disable={otpStatus !== 'success'}
          />
        </ViewComponent>
      </ViewComponent>
    </Container>
  );
};

export default GoogleAthenticatorDisable;