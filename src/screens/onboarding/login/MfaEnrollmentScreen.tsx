// src/screens/MfaEnrollmentScreen.tsx
import React, { useState, useEffect } from 'react';
import { ActivityIndicator } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { getMfaEnrollmentData, loginWithMfa, storeToken } from '../../../services/auth0Service'; // Assuming verifyMfaEnrollment exists
import { MfaEnrollmentScreenProps } from './types'; // Using local types file for consistency
import { useThemeColors } from '../../../hooks/useThemeColors';
import SafeAreaViewComponent from '../../../newComponents/safeArea/safeArea';
import ScrollViewComponent from '../../../newComponents/scrollView/scrollView';
import ViewComponent from '../../../newComponents/view/view';;
import ButtonComponent from '../../../newComponents/buttons/button';
import OtpInput from '../../../newComponents/textInputComponents/otpInput/otpInput';
import useMemberLogin from '../../../hooks/userInfoHook';
import { getThemedCommonStyles } from '../../../assets/styles/CommonStyles';
import ParagraphComponent from '../../../newComponents/textComponets/paragraphText/paragraph';
import ErrorComponent from '../../../newComponents/errorDisplay/errorDisplay';

const MfaEnrollmentScreen: React.FC<MfaEnrollmentScreenProps> = ({ route, navigation }) => {
  const { mfaToken } = route.params;
  const [qrCodeUri, setQrCodeUri] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(true);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState('');
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const { getMemDetails } = useMemberLogin()

  useEffect(() => {
    const fetchEnrollmentData = async () => {
      if (!mfaToken) {
        setError('MFA token is missing. Cannot proceed with enrollment.');
        setQrLoading(false);
        return;
      }
      setQrLoading(true);
      setError('');
      const result = await getMfaEnrollmentData(mfaToken);
      if (result.success && result.barcodeUri) {
        setQrCodeUri(result.barcodeUri);
      } else {
        setError(result.error || 'Could not start MFA enrollment process.');
      }
      setQrLoading(false);
    };

    fetchEnrollmentData();
  }, [mfaToken]);

  const handleVerification = async () => {
    setVerifyLoading(true);
    setError('');
    const result = await loginWithMfa(mfaToken, otpCode);
    setVerifyLoading(false);

    if (result.success) {
        await storeToken(result.tokens, "");
        getMemDetails();
    } else {
      setError(result.error || 'Verification failed. Please try again.');
    }
  };

  return (
    <SafeAreaViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
      <ScrollViewComponent contentContainerStyle={[commonStyles.flexGrow1, commonStyles.justifyCenter]}>
        <ViewComponent style={[commonStyles.p20, commonStyles.alignCenter]}>
          <ParagraphComponent text={'Set Up Authenticator'} style={[commonStyles.fs22, commonStyles.fw700, commonStyles.mb10, commonStyles.textCenter, commonStyles.textWhite]} />
          <ParagraphComponent text={'1. Scan this QR code with your authenticator app (e.g., Google Authenticator).'} style={[commonStyles.fs16, commonStyles.textCenter, commonStyles.my15, { color: NEW_COLOR.GREY_TEXT }]} />
          <ViewComponent style={[commonStyles.p20, { backgroundColor: 'white' }, commonStyles.my20, commonStyles.br10]}>
            {qrLoading && <ActivityIndicator size="large" color={NEW_COLOR.BLACK} />}
            {qrCodeUri && !qrLoading && <QRCode value={qrCodeUri} size={250} />}
          </ViewComponent>
          
          {error && <ErrorComponent message={error} onClose={() => setError('')} />}

          <ParagraphComponent text={'2. Enter the code from the app below to verify.'} style={[commonStyles.fs16, commonStyles.textCenter, commonStyles.my15, { color: NEW_COLOR.GREY_TEXT }]} />
          
          <OtpInput length={6} onOtpChange={setOtpCode} disabled={verifyLoading || qrLoading} />

          <ButtonComponent title="Verify and Complete Setup" onPress={handleVerification} loading={verifyLoading} disable={verifyLoading || qrLoading || otpCode.length !== 6} />
        </ViewComponent>
      </ScrollViewComponent>
    </SafeAreaViewComponent>
  );
};

export default MfaEnrollmentScreen;