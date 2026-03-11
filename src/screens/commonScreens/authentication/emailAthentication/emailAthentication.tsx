import React, { useState, useEffect } from 'react';
import { ActivityIndicator, Keyboard } from 'react-native';
import { useLngTranslation } from '../../../../hooks/useLngTranslation';
import { useThemeColors } from '../../../../hooks/useThemeColors';
import { getThemedCommonStyles } from '../../../../assets/styles/CommonStyles';
import { useSelector } from 'react-redux';
import useEncryptDecrypt from '../../../../hooks/encDecHook';
import OnboardingService from '../../../../services/onboarding';
import { isErrorDispaly } from '../../../../utils/helpers';
import ViewComponent from '../../../../newComponents/view/view';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import ParagraphComponent from '../../../../newComponents/textComponets/paragraphText/paragraph';
import TextMultiLanguage from '../../../../newComponents/textComponets/multiLanguageText/textMultiLangauge';
import { OTPInput } from '../../../../newComponents/Inputs/BoxInput';
import CommonTouchableOpacity from '../../../../newComponents/touchableComponents/touchableOpacity';
import ButtonComponent from '../../../../newComponents/buttons/button';
import { useIsFocused } from '@react-navigation/native';
import ErrorComponent from '../../../../newComponents/errorDisplay/errorDisplay';
import { s } from '../../../../newComponents/theme/scale';
import SafeAreaViewComponent from '../../../../newComponents/safeArea/safeArea';
import SwokipayDashboardLoader from '../../../../newComponents/swokipayloader';

// Props interface for communication with the parent component
interface EmailAthenticationProps {
    feature: string;
    onSuccess: (staus: boolean) => void;
    onClose: () => void;
}

const EmailAthentication = ({ feature, onSuccess, onClose }: EmailAthenticationProps) => {
    const [code, setCode] = useState('');
    const [timer, setTimer] = useState(0);
    const [loading, setLoading] = useState<boolean>(false);
    const [sendloading, setSendLoading] = useState<boolean>(false);
    const [otpStatus, setOtpStatus] = useState<'success' | 'error' | null>(null);
    const { t } = useLngTranslation();
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const userInfo = useSelector((state: any) => state.userReducer?.userDetails);
    const { encryptAES, decryptAES } = useEncryptDecrypt();
    const [errorMessage, setErrorMessage] = useState<string>("");
    const isFucussed = useIsFocused();
    const decryptedEmail = decryptAES(userInfo?.email);
    const [error, setError] = useState<string>("");
    const [isResendLoading, setIsResendLoading] = useState<boolean>(false);
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

    useEffect(() => {
        sendEmail();
    }, [isFucussed]);
    const handleCodeChange = (newCode: string) => {
        setError("");
        setErrorMessage("");
        setCode(newCode);
        if (newCode.length !== 6 && otpStatus) {
            setOtpStatus(null);
        }
    };
    const sendEmail = async () => {
        setError('');
        setCode('');
        setOtpStatus(null);
        setSendLoading(true);
        try {
            const body: any = {
                "email": encryptAES(decryptedEmail),
                "action": feature // Use feature prop for dynamic action
            }
            const response: any = await OnboardingService.signupSendEmail(body);
            if (response.status === 200) {
                setTimer(60);
                setSendLoading(false);
            } else {
                Keyboard.dismiss();
                setError(isErrorDispaly(response));
                setSendLoading(false);
            }
        } catch (error: any) {
            Keyboard.dismiss();
            setError(isErrorDispaly(error));
            setSendLoading(false);
        }
    };

    const handleResendCode = async () => {
        setError('');
        setIsResendLoading(true);
        if (timer === 0) {
            setOtpStatus(null);
            try {
                const body: any = {
                    "email": encryptAES(decryptedEmail),
                    "action": feature // Use feature prop for dynamic action
                }
                const response: any = await OnboardingService.resendEmail(body);
                if (response.status === 200) {
                    setCode('');
                    setTimer(60);
                    setIsResendLoading(false);
                } else {
                    Keyboard.dismiss();
                    setIsResendLoading(false);
                    setError(isErrorDispaly(response));
                }
            } catch (error: any) {
                Keyboard.dismiss();
                setIsResendLoading(false);
                setError(isErrorDispaly(error));
            }
        }
    };

    const handleVerifyOtp = async (otpCode: string) => {
        setError('');
        if (otpCode.length !== 6 || loading) return;
        setOtpStatus(null);
        setLoading(true);
        setIsEditable(false)
        try {
            const body = {
                "email": encryptAES(decryptedEmail),
                "code": encryptAES(otpCode.toString()),
                "action": feature // Use feature prop for dynamic action
            }
            const response = await OnboardingService.verifyEmailCode(body);
            if (response?.status === 200) {
                Keyboard.dismiss();
                setOtpStatus('success');
                setTimer(0);
            } else if (response?.status === 422) {
                setErrorMessage(isErrorDispaly(response));
                setIsEditable(true);
                setOtpStatus('error');
                setError(isErrorDispaly(error));
            } else {
                setIsEditable(true);
                setError(isErrorDispaly(response));
                setOtpStatus('error');
            }
        } catch (error: any) {
            setIsEditable(true);
            setOtpStatus('error');
            Keyboard.dismiss();
            setErrorMessage(isErrorDispaly(error));
            setError(isErrorDispaly(error));
        } finally {
            setLoading(false);
        }
    };

    // Call the onSuccess prop provided by the parent instead of navigating
    const handleContinue = () => {
        if (otpStatus === 'success') {
            onSuccess(true);
        } else {
            onSuccess(false);
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
        // Removed KeyboardAwareScrollView and other layout components as parent will provide them
        <KeyboardAwareScrollView
            contentContainerStyle={[{ flexGrow: 1 }]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            enableOnAndroid={true}
        >
            {error && <ErrorComponent message={error} onClose={() => setError('')} />}
            {/* The PageHeader is removed from here and is now in the parent component */}
            {sendloading && <SafeAreaViewComponent><SwokipayDashboardLoader /></SafeAreaViewComponent>}
            {!sendloading && <>
                <TextMultiLanguage
                    style={[commonStyles.textGrey, commonStyles.fs14, commonStyles.fw400,]}
                    text={t("GLOBAL_CONSTANTS.CODE_SENT_TO_EMAIL")}
                >
                    <ParagraphComponent
                        style={[commonStyles.getStartedText, commonStyles.fs14, commonStyles.fw500]}
                        text={`${decryptedEmail || ""}`}
                    />
                </TextMultiLanguage>
                <ViewComponent style={[commonStyles.px1]}>
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
                    <TextMultiLanguage text={"GLOBAL_CONSTANTS.DIDNT_GET_CODE"} style={[commonStyles.textGrey, commonStyles.fs14, commonStyles.fw400]} />
                    {renderResendSection()}
                </ViewComponent>
                <ViewComponent style={[commonStyles.flex1]} />
                <ButtonComponent
                    title={t("GLOBAL_CONSTANTS.CONTINUE")}
                    onPress={handleContinue}
                    loading={loading}
                    disable={otpStatus !== 'success' || loading}
                />
            </>}
            <ViewComponent style={[commonStyles.mb32]} />
        </KeyboardAwareScrollView>
    );
};

export default EmailAthentication;