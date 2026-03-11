import React, { useState, useEffect, useCallback } from 'react';
import { ActivityIndicator, Keyboard } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useLngTranslation } from '../../../hooks/useLngTranslation';
import ButtonComponent from '../../../newComponents/buttons/button';
import ViewComponent from '../../../newComponents/view/view';
import PageHeader from '../../../newComponents/pageHeader/pageHeader';
import TextMultiLangauge from '../../../newComponents/textComponets/multiLanguageText/textMultiLangauge';
import { useThemeColors } from '../../../hooks/useThemeColors';
import OnboardingService from '../../../services/onboarding';
import { isErrorDispaly } from '../../../utils/helpers';
import { OTPInput } from '../../../newComponents/Inputs/BoxInput';
import { useSelector } from 'react-redux';
import useEncryptDecrypt from '../../../hooks/encDecHook';
import { showAppToast } from '../../../newComponents/ToasterMessages/ShowMessage';
import { useHardwareBackHandler } from '../../../hooks/HardwareBackHandler';
import Container from '../../../newComponents/container/container';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { getThemedCommonStyles } from '../../../assets/styles/CommonStyles';
import ParagraphComponent from '../../../newComponents/textComponets/paragraphText/paragraph';
import CommonTouchableOpacity from '../../../newComponents/touchableComponents/touchableOpacity';
import { s } from '../../../constants/theme/scale';
import ErrorComponent from '../../../newComponents/errorDisplay/errorDisplay';

const EmailVericication = () => {
    const [code, setCode] = useState('');
    const [timer, setTimer] = useState(60);
    const [loading, setLoading] = useState<boolean>(false);
    const [otpStatus, setOtpStatus] = useState<'success' | 'error' | null>(null);
    const navigation = useNavigation<any>();
    const { t } = useLngTranslation();
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const signupInfo = useSelector((state: any) => state.userReducer?.signupInfo);
    const { encryptAES } = useEncryptDecrypt("11AA7AE945754C128F2EC8DAFFE82416");
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [isRefeshLoading, setIsRefreshLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [isEditable, setIsEditable] = useState<boolean>(true);


    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (timer > 0 && otpStatus !== 'success') { // Added condition to stop timer on success
            interval = setInterval(() => {
                setTimer(prevTimer => prevTimer - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer, otpStatus]); // Added otpStatus to dependency array

    // Handles the hardware back button press on Android
    useHardwareBackHandler(() => {
        handleGoBack();
        return true; // Indicate that the back press has been handled
    });

    // Navigates back to the previous screen
    const handleGoBack = useCallback(() => {
        navigation.goBack();
    }, [navigation]);


    // Resets the OTP status when the user starts typing again.
    const handleCodeChange = (newCode: string) => {
        setError("");
        setCode(newCode);
        if (newCode.length !== 6 && otpStatus) {
            setOtpStatus(null);
        }
    };



    // Handles resending the verification code
    const handleResendCode = async () => {
        setError("");
        setIsRefreshLoading(true);
        Keyboard.dismiss();
        setCode('');
        if (timer === 0) {
            setOtpStatus(null);
            try {
                const body: any = {
                    "email": encryptAES(signupInfo?.email), "action": "signup",
                }
                const response: any = await OnboardingService.resendEmail(body);
                if (response.status === 200) {
                    setTimer(60);
                    setIsRefreshLoading(false);
                } else {
                    setIsRefreshLoading(false);
                    Keyboard.dismiss();
                    setError(isErrorDispaly(response));
                }
            } catch (error: any) {
                setIsRefreshLoading(false);
                Keyboard.dismiss();
                setError(isErrorDispaly(error));
            }
        }
    };



    // Handles OTP verification automatically when the code is filled.
    const handleVerifyOtp = async (otpCode: string) => {
        setError("");
        if (otpCode.length !== 6 || loading) return; // Prevent premature calls and re-entry
        setOtpStatus(null);
        setIsEditable(false);
        try {
            const body = {
                "email": encryptAES(signupInfo?.email),
                "code": encryptAES(otpCode.toString()),
                "action": "signup"
            }
            const response = await OnboardingService.verifyEmailCode(body);
            if (response?.status === 200) {
                Keyboard.dismiss();
                setOtpStatus('success');
                setTimer(0); // Stop the timer immediately on success
                // showAppToast(t("GLOBAL_CONSTANTS.VERIFIED_SUCCESSFULLY"), "success", 2000);
            } else if (response?.status === 422) {
                setIsEditable(true);
                setErrorMessage(isErrorDispaly(response));
                setOtpStatus('error');
                Keyboard.dismiss();
            } else {
                setIsEditable(true);
                Keyboard.dismiss();
                setError(isErrorDispaly(response));
                setOtpStatus('error'); // Set status to error on other failed responses
            }
        } catch (error: any) {
            setIsEditable(true);
            setOtpStatus('error');
            Keyboard.dismiss();
            setError(isErrorDispaly(error));
        }
    };

    // Navigates to the next screen after successful verification.
    const handleContinue = () => {
        setLoading(true);
        if (otpStatus === 'success') {
            navigation.navigate("confirmPassword");
            setLoading(false);

        }
        setLoading(false);

    };



    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            <KeyboardAwareScrollView
                contentContainerStyle={[{ flexGrow: 1 }]}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                enableOnAndroid={true}
            >
                <Container style={[commonStyles.sectionGap, commonStyles.flex1]}>
                    <ViewComponent style={[commonStyles.flex1]}>
                        <PageHeader onBackPress={handleGoBack} title={"GLOBAL_CONSTANTS.ENTER_VERIFICATION_CODE"} />
                        {error && <ErrorComponent message={error} screen={true} />}
                        <TextMultiLangauge
                            style={[commonStyles.textGrey, commonStyles.fs14, commonStyles.fw400, commonStyles.mt12]}
                            text={t("GLOBAL_CONSTANTS.CODE_SENT_TO_EMAIL")}
                        >
                            <ParagraphComponent
                                style={[commonStyles.getStartedText, commonStyles.fs14, commonStyles.fw400, commonStyles.fw500]}
                                text={`${signupInfo?.email}`}
                            />
                        </TextMultiLangauge>
                        <TextMultiLangauge
                            style={[commonStyles.textGrey, commonStyles.fs14, commonStyles.fw400]}
                            text={t("GLOBAL_CONSTANTS.ENTER_CODE_TO_VERIFY")}
                        />
                        <ViewComponent>
                            <OTPInput
                                code={code}
                                setCode={handleCodeChange}
                                pinCount={6}
                                onCodeFilled={handleVerifyOtp}
                                validationStatus={otpStatus}
                                errorMessage={errorMessage}
                                isEdit={isEditable}
                            />
                        </ViewComponent>
                        <ViewComponent style={[commonStyles.dflex, commonStyles.sectionGap]}>
                            <TextMultiLangauge text={"GLOBAL_CONSTANTS.DIDNT_GET_CODE"} style={[commonStyles.textGrey, commonStyles.fs14, commonStyles.fw400]} />
                            <CommonTouchableOpacity onPress={handleResendCode} disabled={timer > 0 || loading || otpStatus === 'success'}>
                                {isRefeshLoading ? (
                                    <ViewComponent style={[commonStyles.ml10]}>
                                        <ActivityIndicator color={NEW_COLOR.BG_YELLOW} size={s(16)} />
                                    </ViewComponent>
                                ) : (
                                    <TextMultiLangauge
                                        text={
                                            timer > 0
                                                ? t("GLOBAL_CONSTANTS.RESEND_CODE_IN", { timer })
                                                : t("GLOBAL_CONSTANTS.RESEND_CODE")
                                        }
                                        style={[
                                            (timer > 0 || otpStatus === 'success') && commonStyles.textWhite,
                                            commonStyles.fs14,
                                            commonStyles.fw400,
                                            timer === 0 &&
                                            otpStatus !== 'success' &&
                                            commonStyles.text_yellow,
                                        ]}
                                    />
                                )}

                            </CommonTouchableOpacity>
                        </ViewComponent>
                        <ViewComponent />
                    </ViewComponent>
                    <ButtonComponent
                        title={t("GLOBAL_CONSTANTS.CONTINUE")}
                        onPress={handleContinue}
                        loading={loading}
                        disable={otpStatus !== 'success' || loading}
                    />
                </Container>
            </KeyboardAwareScrollView>
        </ViewComponent>
    );
};


export default EmailVericication;