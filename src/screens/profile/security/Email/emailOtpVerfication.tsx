import React, { useState, useEffect, useCallback } from 'react';
import { BackHandler, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useLngTranslation } from '../../../../hooks/useLngTranslation';
import ButtonComponent from '../../../../newComponents/buttons/button';
import ViewComponent from '../../../../newComponents/view/view';
import PageHeader from '../../../../newComponents/pageHeader/pageHeader';
import TextMultiLangauge from '../../../../newComponents/textComponets/multiLanguageText/textMultiLangauge';
import { useThemeColors } from '../../../../hooks/useThemeColors';
import { getFormattedEmail, isErrorDispaly } from '../../../../utils/helpers';
import { OTPInput } from '../../../../newComponents/Inputs/BoxInput';
import OnboardingService from '../../../../services/onboarding';
import { showAppToast } from '../../../../newComponents/ToasterMessages/ShowMessage';
import { ActionLogParams, useActionLogging } from '../../../../hooks/loggingHook';
import useMemberLogin from '../../../../hooks/userInfoHook';
import useEncryptDecrypt from '../../../../hooks/encDecHook';
import { getThemedCommonStyles } from '../../../../assets/styles/CommonStyles';
import ParagraphComponent from '../../../../newComponents/textComponets/paragraphText/paragraph';
import { ActivityIndicator } from 'react-native';
import { Keyboard } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Container from '../../../../newComponents/container/container';
import ErrorComponent from '../../../../newComponents/errorDisplay/errorDisplay';

const EmailOtpVericication = (props: any) => {
    const [code, setCode] = useState('');
    const [timer, setTimer] = useState(60);
    const [errorMsg, setErrorMsg] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(false); // For resend button loader
    const [otpStatus, setOtpStatus] = useState<'success' | 'error' | null>(null);
    const navigation = useNavigation<any>();
    const { t } = useLngTranslation();
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const { logEvent } = useActionLogging();
    const { getMemDetails } = useMemberLogin();
    const [isResendCode, setIsResendCode] = useState<boolean>(false)
    const { encryptAES } = useEncryptDecrypt();
    const [isResending, setIsResending] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [isEditable, setIsEditable] = useState<boolean>(true);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer(prevTimer => prevTimer - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    // Handles the hardware back button press on Android
    useEffect(() => {
        const backAction = () => {
            const actionData: ActionLogParams = {
                screename: 'EmailOtpVericication',
                actionName: 'Navigate Back via Hardware Button',
                actionType: 'HardwareButton',
            };
            logEvent('navigation_action', actionData);
            navigation.goBack();
            return true;
        };
        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            backAction
        );
        return () => backHandler.remove();
    }, [navigation, logEvent]);

    // Navigates back to the previous screen
    const handleGoBack = useCallback(() => {
        const actionData: ActionLogParams = {
            screename: 'EmailOtpVericication',
            actionName: 'Navigate Back to EmailChange',
            actionType: 'Icon',
            nextScreenName: 'EmailChange'
        };
        logEvent('navigation_action', actionData);
        navigation.navigate('EmailChange', { animation: 'slide_from_left' });
    }, [navigation, logEvent]);



    // Resets the OTP status when the user starts typing again.
    const handleCodeChange = (newCode: string) => {
        setError("");
        setCode(newCode);
        if (code.length !== 6 && otpStatus) {
            setOtpStatus(null);
        }
    };


    // Handles resending the verification code
    const handleResendCode = async () => {
        setError("");
        setErrorMsg(null);
        setIsResending(true)
        setCode('');
        if (timer === 0) {
            setErrorMsg(null);
            setOtpStatus(null);
            try {
                const body = {
                    "action": "changeemail",
                    "email": encryptAES(props?.route?.params?.email),
                }
                const response: any = await OnboardingService.resendEmail(body); // Adjust payload as per your API
                if (response.status === 200) {

                    setTimer(60);
                    setIsResendCode(true);
                    setIsResending(false)
                } else {
                    setIsResending(false)
                    setError(isErrorDispaly(response));
                }
            } catch (error: any) {
                setIsResending(false)
                setError(isErrorDispaly(error));
            }
        }
    };
    // Handles OTP verification automatically when the code is filled.
    const handleVerifyOtp = async (otpCode: string) => {
        if (otpCode.length !== 6 || loading) return; // Prevent premature calls and re-entry
        setError("");
        setErrorMsg(null);
        setOtpStatus(null);
        setIsEditable(false);
        try {
            const body = {
                "email": encryptAES(props?.route?.params?.email),
                "code": encryptAES(otpCode),
                "action": "changeemail"
            };
            const response: any = await OnboardingService.verifyEmailCode(body);
            if (response?.status === 200) {
                // Check which flow we are in based on navigation params
                setOtpStatus('success');
                setIsResendCode(false);
                setTimer(0);
                // showAppToast(t("GLOBAL_CONSTANTS.EMAIL_CHANGED_SUCCESSFULLY"), "success");
            } else if (response?.status === 422) {
                setIsEditable(true);
                setErrorMsg(isErrorDispaly(response));
                Keyboard.dismiss();
                setOtpStatus('error');
                // showAppToast(isErrorDispaly(response), "error");
            } else {
                setIsEditable(true);
                setError(isErrorDispaly(response));
                Keyboard.dismiss();
                setOtpStatus('error');
            }
        } catch (error: any) {
            setIsEditable(true);
            setOtpStatus('error');
            Keyboard.dismiss();
            setError(isErrorDispaly(error));
        } finally {
            setLoading(false);
        }
    };

    // Navigates to the next screen after successful verification.
    const handleContinue = async () => {
        // The continue button should trigger the verification with the current code
        setLoading(true);
        if (otpStatus === "success") {
            await getMemDetails();
            navigation.navigate("LoginVerificationScreen", { animation: 'slide_from_left' });
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
                <Container style={[commonStyles.flex1]}>
                    <PageHeader title={"GLOBAL_CONSTANTS.ENTER_VERIFICATION_CODE"} onBackPress={handleGoBack} />
                    <ViewComponent style={[commonStyles.flex1]}>
                        {error && <ErrorComponent message={error} screen={true} />}
                        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifystart, commonStyles.gap5]}>
                            <ParagraphComponent
                                style={[commonStyles.textlinkgrey, commonStyles.fs14, commonStyles.fw500, commonStyles.mt8]}
                                text={`${t("GLOBAL_CONSTANTS.WE_VE_SENT_A_CODE_TO")}`}
                            />
                            <ParagraphComponent style={[commonStyles.textWhite, commonStyles.fs14, commonStyles.fw500, commonStyles.mt8]} text={getFormattedEmail(props?.route?.params?.email)} />
                        </ViewComponent>

                        <ViewComponent>
                            <OTPInput
                                code={code}
                                setCode={handleCodeChange}
                                pinCount={6}
                                onCodeFilled={handleVerifyOtp}
                                validationStatus={otpStatus}
                                errorMessage={errorMsg}
                                isEdit={isEditable}
                            />
                        </ViewComponent>
                        <ViewComponent style={[commonStyles.dflex]}>
                            <TextMultiLangauge text={"GLOBAL_CONSTANTS.DIDNT_GET_CODE"} style={[commonStyles.textlinkgrey, commonStyles.fs16, commonStyles.mr4, commonStyles.mt2]} />
                            <TouchableOpacity onPress={handleResendCode} disabled={timer > 0 || loading || otpStatus === 'success'}>
                                {isResending ? (
                                    <ActivityIndicator size="small" color={NEW_COLOR.BG_YELLOW} />
                                ) : (
                                    <TextMultiLangauge
                                        text={timer > 0 ? t("GLOBAL_CONSTANTS.RESEND_CODE_IN", { timer: timer }) : t("GLOBAL_CONSTANTS.RESEND_CODE")}
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
                            </TouchableOpacity>
                        </ViewComponent>
                    </ViewComponent>

                    <ViewComponent style={[commonStyles.sectionGap]} />
                    <ButtonComponent
                        title={t("GLOBAL_CONSTANTS.CONTINUE")}
                        onPress={handleContinue}
                        loading={loading}
                        disable={otpStatus !== 'success' || loading}
                    />
                    <ViewComponent style={[commonStyles.sectionGap]} />
                </Container>
            </KeyboardAwareScrollView>
        </ViewComponent>
    );
};

export default EmailOtpVericication;