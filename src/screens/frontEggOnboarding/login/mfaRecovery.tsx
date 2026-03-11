import React, { useState, useCallback } from 'react';
import { Keyboard } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useLngTranslation } from '../../../hooks/useLngTranslation';
import ButtonComponent from '../../../newComponents/buttons/button';
import ViewComponent from '../../../newComponents/view/view';
import PageHeader from '../../../newComponents/pageHeader/pageHeader';
import TextMultiLangauge from '../../../newComponents/textComponets/multiLanguageText/textMultiLangauge';
import { useThemeColors } from '../../../hooks/useThemeColors';
import { isErrorDispaly, logApiErrorToSentry } from '../../../utils/helpers';
import { OTPInput } from '../../../newComponents/Inputs/BoxInput';
import { useSelector } from 'react-redux';
import useEncryptDecrypt from '../../../hooks/encDecHook';
import { useHardwareBackHandler } from '../../../hooks/HardwareBackHandler';
import Container from '../../../newComponents/container/container';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { getThemedCommonStyles } from '../../../assets/styles/CommonStyles';
import { FrontEggService, mfaRecoveryCode } from '../../../apiServices/fronteggApiServices/fronteggServices';
import { MFARecoveryCodeProps } from './types';
import { storeToken } from '../../../services/auth0Service';
import useMemberLogin from '../../../hooks/userInfoHook';
import { getAllEnvData } from '../../../../Environment';
import ErrorComponent from '../../../newComponents/errorDisplay/errorDisplay';


const MFARecoveryCode: React.FC<MFARecoveryCodeProps> = ({ screenName: propScreenName }) => {
    const [code, setCode] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [otpStatus, setOtpStatus] = useState<'success' | 'error' | null>(null);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const screenName = propScreenName || route.params?.screenName;
    const { t } = useLngTranslation();
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const { getMemDetails } = useMemberLogin();
    const signupInfo = useSelector((state: any) => state.userReducer?.storeValues);
    const { decryptAES } = useEncryptDecrypt("11AA7AE945754C128F2EC8DAFFE82416");
    // Check if coming from disable authenticator flow based on screenName prop
    const isFromDisableFlow = screenName === 'AthenticatorDisable';
    const getConfig = getAllEnvData();
    const [error, setError] = useState<string>("");
    const [isEditable, setIsEditable] = useState<boolean>(true);


    // Handles the hardware back button
    useHardwareBackHandler(() => {
        handleGoBack();
        return true;
    });

    // Go back navigation
    const handleGoBack = useCallback(() => {
        navigation.goBack();
    }, [navigation]);

    // Resets the OTP status when the user starts typing again
    const handleCodeChange = (newCode: string) => {
        setErrorMessage("");
        setError("");
        setCode(newCode);
        if (newCode.length !== 8 && otpStatus) {
            setOtpStatus(null);
        }
    };

    // Handles OTP verification automatically when the code is filled.
    const handleVerifyOtp = async (otpCode: string) => {
        setError("");
        if (otpCode.length !== 8 || loading) return;
        setOtpStatus(null);
        setLoading(true);
        setIsEditable(false);
        const body = {
            "recoveryCode": otpCode?.toString(),
            "email": decryptAES(signupInfo?.feildOne)

        };
        try {
            const response = await mfaRecoveryCode(body);
            // const response = await FrontEggService.mfaRecoveryCode(body)
            if (response?.status === 200) {
                Keyboard.dismiss();
                setOtpStatus('success');
                // showAppToast(t("GLOBAL_CONSTANTS.RECOVERY_CODE_VERIFIED"), "success", 2000);
                setLoading(false);
            } else {
                setIsEditable(true);
                setOtpStatus('error');
                setLoading(false);
                const errorMsg = response?.data?.errors[0];
                setErrorMessage(isErrorDispaly(errorMsg));
                Keyboard.dismiss();
                logApiErrorToSentry({
                    url: `${getConfig.apiUrls.apiUrl}/resources/auth/v1/user/mfa/recover`,
                    method: "POST",
                    statusCode: 422,
                    requestBody: body,
                    responseData: response,
                    userId: signupInfo?.feildOne,
                    errorMessage: `Invalid Grant Error: ${errorMsg || 'Unknown error'}`,
                });
            }
        } catch (error: any) {
            setIsEditable(true);
            setLoading(false);
            setOtpStatus('error');
            const errorMsg = error?.data?.errors[0];
            setErrorMessage(isErrorDispaly(errorMsg));
            Keyboard.dismiss();
            logApiErrorToSentry({
                url: `${getConfig.apiUrls.apiUrl}/resources/auth/v1/user/mfa/recover`,
                method: "POST",
                statusCode: 422,
                requestBody: body,
                responseData: error,
                userId: signupInfo?.feildOne,
                errorMessage: `Invalid Grant Error: ${errorMsg || 'Unknown error'}`,
            });
        }
    };
    // Navigates to the next screen after successful verification
    const handleContinue = async () => {
        setError("");
        setLoading(true);
        if (otpStatus === 'success') {
            if (isFromDisableFlow) {
                navigation.navigate('GoogleAuthentication', { animation: 'slide_from_left' });
            } else {
                await handleSignin();
            }
        }
        setLoading(false);
    };

    const handleSignin = async () => {
        setError("");
        try {

            const body = {
                email: signupInfo?.feildOne,
                password: signupInfo?.feildTwo

            }
            const response: any = await FrontEggService.userSignIn(body)
            if (response?.status === 200) {
                const parsedData = JSON.parse(response.data);
                if (parsedData?.mfaRequired) {
                    navigation.navigate("mfaAuthenticator", {
                        userData: parsedData,
                    });
                } else {
                    await storeToken(parsedData.accessToken, parsedData?.refreshToken);
                    getMemDetails();
                }

            } else {
                setError(isErrorDispaly(response));

            }
        } catch (error: any) {
            setError(isErrorDispaly(error));
        }
    }

    return (
        <Container style={[commonStyles.flex1, commonStyles.screenBg]}>
            <PageHeader onBackPress={handleGoBack} title={"GLOBAL_CONSTANTS.MFA_RECOVERY_CODE"} disable={otpStatus === 'success'} />
            {error && <ErrorComponent message={error} screen={true} />}
            <KeyboardAwareScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                enableOnAndroid={true}
            >
                <ViewComponent style={[commonStyles.sectionGap, commonStyles.flex1]}>
                    <ViewComponent style={[commonStyles.flex1]}>
                        <TextMultiLangauge
                            style={[commonStyles.textGrey, commonStyles.fs14, commonStyles.fw400, commonStyles.mt12]}
                            text={"GLOBAL_CONSTANTS.ENTER_THE_RECOVERY_CODE_YOU_SAVED_DURING_MFA_SETUP"}
                        >
                        </TextMultiLangauge>
                        <ViewComponent style={[commonStyles.px1]}>
                            <OTPInput
                                code={code}
                                setCode={handleCodeChange}
                                pinCount={8}
                                onCodeFilled={handleVerifyOtp}
                                validationStatus={otpStatus}
                                errorMessage={errorMessage}
                                isEdit={isEditable}
                            />
                        </ViewComponent>
                    </ViewComponent>

                    <ButtonComponent
                        title={"GLOBAL_CONSTANTS.CONTINUE"}
                        onPress={handleContinue}
                        loading={loading}
                        disable={otpStatus !== 'success' || loading}
                    />
                </ViewComponent>
            </KeyboardAwareScrollView>
        </Container>
    );
};

export default MFARecoveryCode;
