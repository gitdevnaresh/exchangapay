import React, { useState,useEffect } from 'react';
import { Modal, Platform } from 'react-native';
import PhoneVerification from './phoneVerification/phoneVerification';
import { showAppToast } from '../../../newComponents/ToasterMessages/ShowMessage';
import { isErrorDispaly } from '../../../utils/helpers';
import { commonStyles } from '../../../newComponents/theme/commonStyles';
import Container from '../../../newComponents/container/container';
import SecurityService from '../../../services/security';
import PageHeader from '../../../newComponents/pageHeader/pageHeader';
import BiometricView from './biometricAuth/biometricAuth';
import EmailAthentication from './emailAthentication/emailAthentication';
import GoogleAuthenticator from './googleAthenticator/googleAthenticator';
import useBiometricAuth from '../biometricAuthentication/biometricAuth';
import * as LocalAuthentication from 'expo-local-authentication';
import { useSelector } from 'react-redux';
import ViewComponent from '../../../newComponents/view/view';
import { s } from '../../../constants/theme/scale';

interface AuthVerificationProps {
  feature?: string;
  visible?: boolean;
  onSuccess: (verifiedList?: any) => void;
  onClose: () => void;
  requiredVerifys?:number;
  isRestrticBiometric?:boolean;
}

// Define how many verifications are required.
const REQUIRED_VERIFICATION_COUNT = 2;

// --- [FOR TESTING] Static Data Simulation ---
// This object replaces the live API call for testing purposes.
const staticVerifications = [
  {
    "securityType": "Biometric Verification",
    "isEnabled": true,
    "recorder": 4
  },
  {
    "securityType": "PhoneNumber Verification",
    "isEnabled": true,
    "recorder": 1
  },
  {
    "securityType": "Email Verification",
    "isEnabled": true,
    "recorder": 2
  },
  {
    "securityType": "GoogleAuthenticator Verification",
    "isEnabled": false,
    "recorder": 3
  }

]
// ------------------------------------------

const AuthVerification = ({
  feature = '',
  visible,
  onSuccess,
  onClose,
  requiredVerifys=2,
  isRestrticBiometric=false
}: AuthVerificationProps) => {
  const [verifications, setVerifications] = useState<any>([]);
  const [completionStatus, setCompletionStatus] = useState<{ [key: string]: boolean }>({});
  const [authCount, setAuthCount] = useState(0);
  const [verifiedCount, setVerifiedCount] = useState(0);
  const { authenticateUser } = useBiometricAuth();
  const [verifiedList, setVerifiedList] = useState<any>([]);
  const [isModelVisable, setIsModelVisable] = useState(false);
  const [verificationTitle, setVerificationTitle] = useState('Security Verification');
  const isBiometricEnabled = useSelector((state: any) => state.userReducer?.isBiometricEnabled);

  useEffect(() => {
    // console.log('AuthVerification mounted',feature);
    setAuthCount(0);
    //   setVerifications([...staticVerifications]);
    fetchSecurityVerifications();
  }, []);
  useEffect(() => {
    if (verifications.length > 0) {
      if( isBiometricEnabled && isRestrticBiometric==false){
      handleBiometricsToggle();
      }else{
        handleVerifications();
      }
    }
  }, [verifications]);
  useEffect(() => {
    if (authCount > 0) {
      handleVerifications();
    }
  }, [authCount]);

  // This function is kept for easy restoration of API functionality.

  const fetchSecurityVerifications = async () => {
    try {
      const response: any = await SecurityService.getSecurityVerifications();
      if (response.status === 200) {
        setVerifications([...response.data]);
      } else {
        showAppToast(isErrorDispaly(response), 'error');
        onClose();
      }
    } catch (error) {
      showAppToast('Failed to load security settings.', 'error');
      onClose();
    }
  };
  const handleVerifyBio = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    if (hasHardware) {
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (isEnrolled) {
        const res = await authenticateUser();
        if (res) {
          setVerifiedList([...verifiedList, { ...verifications[authCount], isVerified: true }]);
          setVerifiedCount(verifiedCount + 1);
          setAuthCount(authCount + 1);
        } else {
          setAuthCount(authCount + 1);
        }
      } else {
        setAuthCount(authCount + 1);
      }
    } else {
      setAuthCount(authCount + 1);
    }
  };
  const handleBiometricsToggle = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    if (hasHardware) {
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (isEnrolled) {
        const res = await authenticateUser();
        if (res) {
          setVerifiedList([...verifiedList, { ...verifications[authCount], isVerified: true }]);
          setVerifiedCount(verifiedCount + 1);
          handleVerifications(verifiedCount+1);
        } else {
          onClose();
        }
      } else {
        handleVerifications();
      }
    } else {
      handleVerifications();
    }
  };

  const handleVerifications = (verifiedCountIm?:number) => {
    if ((verifiedCountIm||verifiedCount) < (requiredVerifys||REQUIRED_VERIFICATION_COUNT)) {
      if (verifications.length > authCount) {
        if (verifications[authCount]?.isEnabled && verifications[authCount]?.securityType === "PhoneNumber Verification") {
          setVerificationTitle('Phone Verification');
          setIsModelVisable(true);
          setCompletionStatus({ ['phoneNumberVerification']: true });
        } else if (verifications[authCount]?.isEnabled && verifications[authCount]?.securityType === "Email Verification") {
          setVerificationTitle('Email Verification');
          setIsModelVisable(true);
          setCompletionStatus({ ['emailVerification']: true });
        } else if (verifications[authCount]?.isEnabled && verifications[authCount]?.securityType === "GoogleAuthenticator Verification") {
          setVerificationTitle('Authenticator Verification');
          setIsModelVisable(true);
          setCompletionStatus({ ['googleAuthenticatorVerification']: true });
        } else if (verifications[authCount]?.isEnabled && verifications[authCount]?.securityType === "Biometric Verification") {
          setIsModelVisable(false);
          console.log("Biometric Verification Enabled");
          handleVerifyBio();
        } else {
          setAuthCount(authCount + 1);
        }
      } else {
        setIsModelVisable(true);
        onSuccess(verifiedList);
      }
    } else {
      setIsModelVisable(false);
      onSuccess(verifiedList);
    }
  }

  const handleEmailVerificationSuccess = (isverified: boolean) => {
    if (isverified) {
      setVerifiedList([...verifiedList, { ...verifications[authCount], isVerified: true }]);
      setCompletionStatus({ 'phoneNumberVerification': false });
      setVerifiedCount(verifiedCount + 1);
      setAuthCount(authCount + 1);
    } else {
      setIsModelVisable(false);
      setAuthCount(authCount + 1);
    }
  }
  const handlePhoneVerificationSuccess = (isverified: boolean) => {
    if (isverified) {
      setVerifiedList([...verifiedList, { ...verifications[authCount], isVerified: true }]);
      setCompletionStatus({ ['emailVerification']: false });
      setVerifiedCount(verifiedCount + 1);
      setAuthCount(authCount + 1);
    } else {
      setIsModelVisable(false);
      setAuthCount(authCount + 1);
    }
  }
  const handleGoogleAuthenticatorSuccess = (isverified: boolean) => {
    if (isverified) {
      setVerifiedList([...verifiedList, { ...verifications[authCount], isVerified: true }]);
      setCompletionStatus({ ['googleAuthenticatorVerification']: false });
      setVerifiedCount(verifiedCount + 1);
      setAuthCount(authCount + 1);
    } else {
      setIsModelVisable(false);
      setAuthCount(authCount + 1);
    }
  }

  const completedCount = Object.values(completionStatus).filter(status => status).length;
  const totalEnabledCount = Object.keys(completionStatus).length;

  return (

    <Modal
      visible={isModelVisable}
      onRequestClose={onClose}
      animationType="slide"
      transparent={false}
      statusBarTranslucent={true}
    >
      {/*verificationTitle + ' '+ (verifiedCount) + '/' + REQUIRED_VERIFICATION_COUNT */}
      <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
        <Container>
          <PageHeader
            title={verificationTitle + ' '+ (verifiedCount+1) + '/' + (requiredVerifys||REQUIRED_VERIFICATION_COUNT)}
            onBackPress={onClose}
            isrefresh={false}
             containerStyle={Platform.OS === "ios" ? {marginTop: s(33)} : {marginTop: s(33)}}
          />
          {/* We only render the progress text if verifications have been initialized */}
          {/* {verifications && (
            <View style={{ padding: 16 }}>
              <Text style={{fontSize:12,fontWeight:"bold"}}>
                {`Please complete ${REQUIRED_VERIFICATION_COUNT} of the following verifications.`}
              </Text>
              <Text style={{color:"grey",fontSize:12,fontWeight:"bold"}}>
                {`Completed: ${verifiedCount} of ${REQUIRED_VERIFICATION_COUNT}`}
              </Text>
            </View>
          )} */}

          {/* Biometric Verification: Renders if enabled AND not yet completed */}


          {/* Phone Verification: Renders if enabled AND not yet completed */}
          {completionStatus?.phoneNumberVerification && (
            <PhoneVerification
              feature={feature}
              onSuccess={(status: boolean) => handlePhoneVerificationSuccess(status)}
              onClose={onClose}
            />
          )}

          {/* Email Verification (Will not render with static data) */}
          {completionStatus?.emailVerification && (
            <EmailAthentication
              feature={feature}
              onSuccess={(status: boolean) => handleEmailVerificationSuccess(status)}
              onClose={onClose}
            />
          )}

          {/* Google Authenticator (Will not render with static data) */}
          {completionStatus.googleAuthenticatorVerification && (
            <GoogleAuthenticator
              feature={feature}
              onSuccess={(status: boolean) => handleGoogleAuthenticatorSuccess(status)}
              onClose={onClose}
            />
          )}
        </Container>
      </ViewComponent>
    </Modal>
  );
};

export default AuthVerification;