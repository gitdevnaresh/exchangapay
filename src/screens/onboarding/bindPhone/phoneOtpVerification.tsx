import React, { useState, useEffect, useCallback } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useLngTranslation } from '../../../hooks/useLngTranslation';
import ButtonComponent from '../../../newComponents/buttons/button';
import ViewComponent from '../../../newComponents/view/view';
import PageHeader from '../../../newComponents/pageHeader/pageHeader';
import { useThemeColors } from '../../../hooks/useThemeColors';
import OnboardingService from '../../../services/onboarding';
import { isErrorDispaly } from '../../../utils/helpers';
import { OTPInput } from '../../../newComponents/Inputs/BoxInput';
import useEncryptDecrypt from '../../../hooks/encDecHook';
import { showAppToast } from '../../../newComponents/ToasterMessages/ShowMessage';
import { useHardwareBackHandler } from '../../../hooks/HardwareBackHandler';
import { ActionLogParams, useActionLogging } from '../../../hooks/loggingHook';
import CommonTouchableOpacity from '../../../newComponents/touchableComponents/touchableOpacity';
import useMemberLogin from '../../../hooks/userInfoHook';
import TextMultiLanguage from '../../../newComponents/textComponets/multiLanguageText/textMultiLangauge';
import { ActivityIndicator, Keyboard } from 'react-native';
import Container from '../../../newComponents/container/container';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { getThemedCommonStyles } from '../../../assets/styles/CommonStyles';
import ParagraphComponent from '../../../newComponents/textComponets/paragraphText/paragraph';
import { s } from '../../../constants/theme/scale';
import ErrorComponent from '../../../newComponents/errorDisplay/errorDisplay';


const PhoneVerification = () => {
    const [code, setCode] = useState('');
    const [timer, setTimer] = useState(60);
    const [loading, setLoading] = useState<boolean>(false);
    const [otpStatus, setOtpStatus] = useState<'success' | 'error' | null>(null);
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { phoneNumber, phoneCode } = route.params ?? {};
    const { t } = useLngTranslation();
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const { encryptAES } = useEncryptDecrypt("11AA7AE945754C128F2EC8DAFFE82416");
    const { logEvent } = useActionLogging();
    const { getMemDetails } = useMemberLogin();
    const [errorMessage, setErrorMessage] = useState<string>("");
    // FIX: Added separate loading state for the resend action
    const [isResending, setIsResending] = useState<boolean>(false);
    const [isResendLoading, setIsResendLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [isEditable, setIsEditable] = useState<boolean>(true);


    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (timer > 0 && otpStatus !== 'success') {
            interval = setInterval(() => {
                setTimer(prevTimer => prevTimer - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer, otpStatus]);

    useHardwareBackHandler(() => {
        if (!loading) {
            handleGoBack();
            return true;
        }

    });

    const handleGoBack = useCallback(() => {
        const actionData: ActionLogParams = {
            screename: 'PhoneVerification',
            actionName: 'Navigate Back',
            actionType: 'Button',
            nextScreenName: 'BindPhone'
        };
        logEvent('navigation_action', actionData);
        navigation.goBack();
    }, [navigation, logEvent]);

    const handleCodeChange = (newCode: string) => {
        setError("");
        // setErrorMessage("");
        setCode(newCode);
        if (newCode?.length !== 6 && otpStatus) {
            setOtpStatus(null);
        }
    };



    const handleResendCode = async () => {
        setError("");
        // FIX: Use isResending state to prevent multiple clicks and main button loader
        if (timer === 0 && !isResending) {
            setCode('');
            setIsResending(true);
            setIsResendLoading(true);
            setOtpStatus(null);
            setErrorMessage("");
            try {
                const body = {
                    phoneCode: encryptAES(phoneCode),
                    phoneNumber: encryptAES(phoneNumber),
                    isResendOTP: true,
                    isPhoneNoUpdate: true,
                };
                const response: any = await OnboardingService.getPhoneNumberOtp(body);
                if (response.status === 200) {
                    setTimer(60);
                    // FIX: Removed toast message on resend success as requested
                } else {
                    Keyboard.dismiss();
                    setError(isErrorDispaly(response));
                }
            } catch (error: any) {
                Keyboard.dismiss();
                setError(isErrorDispaly(error));
            } finally {
                setIsResendLoading(false);
                setIsResending(false);
            }
        }
    };

    const handleVerifyOtp = async (otpCode: string) => {
        setError("");
        if (otpCode.length !== 6 || loading) return;
        setOtpStatus(null);
        setLoading(true);
        setIsEditable(false);
        try {
            const body = {
                code: encryptAES(otpCode),
                phoneNumber: encryptAES(phoneNumber),
                isChangePhoneNumber: true,
                phoneCode: encryptAES(phoneCode),
            };
            const response = await OnboardingService.verifyPhoneNumberOtp(body);
            if (response?.status === 200) {
                Keyboard.dismiss();
                setOtpStatus('success');
                setTimer(0);
                // showAppToast(t("GLOBAL_CONSTANTS.PHONE_NUMBER_VERIFIED"), "success", 2000);
            } else if (response?.status === 422) {
                setIsEditable(true);
                setErrorMessage(isErrorDispaly(response));
                setOtpStatus('error');
                Keyboard.dismiss();
            } else {
                setIsEditable(true);
                Keyboard.dismiss();
                setError(isErrorDispaly(response));
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


    const handleContinue = () => {
        setError("");
        const actionData: ActionLogParams = {
            screename: 'phone verification',
            actionName: 'continue press',
            actionType: 'Button',
            nextScreenName: 'select country / region'
        };
        logEvent('selection', actionData);
        if (otpStatus === 'success') {
            getMemDetails();
        }
    };
    // Renders the resend section based on current state
    const renderResendSection = () => {
        if (isResendLoading) {
            return (
                <ViewComponent style={[commonStyles.ml10]}>
                    <ActivityIndicator color={NEW_COLOR.BG_YELLOW} size={s(16)} />
                </ViewComponent>
            );
        }

        const isDisabled = timer > 0 || loading || otpStatus === 'success';
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
            <CommonTouchableOpacity onPress={handleResendCode}>
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
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            <KeyboardAwareScrollView
                contentContainerStyle={[{ flexGrow: 1 }]}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                enableOnAndroid={true}
            >
                <Container style={[commonStyles.flex1]}>
                    <PageHeader onBackPress={handleGoBack} title={t("GLOBAL_CONSTANTS.PHONE_VERIFICATION")} />
                    {error && <ErrorComponent message={error} screen={true} />}
                    <ViewComponent style={[commonStyles.flex1]}>
                        <TextMultiLanguage
                            style={[commonStyles.textGrey, commonStyles.fs14, commonStyles.fw400]}
                            text={"GLOBAL_CONSTANTS.OTP_HAS_BEEN_SENT_TO"}
                        >
                            <ParagraphComponent
                                style={[commonStyles.getStartedText, commonStyles.fs14, commonStyles.mt12, commonStyles.fw500]}
                                text={` ${phoneCode} ${phoneNumber}`}
                            />
                        </TextMultiLanguage>
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
                        <ViewComponent style={[commonStyles.dflex,]}>
                            <TextMultiLanguage text={"GLOBAL_CONSTANTS.DIDNT_GET_CODE"} style={[commonStyles.textGrey, commonStyles.fs14, commonStyles.fw400]} />
                            {renderResendSection()}
                        </ViewComponent>
                    </ViewComponent>

                    <ViewComponent style={[commonStyles.sectionGap]} />
                    <ButtonComponent
                        title={"GLOBAL_CONSTANTS.CONTINUE"}
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

export default PhoneVerification;