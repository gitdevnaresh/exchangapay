import React, { useState, useEffect, useCallback } from 'react';
import { ActivityIndicator, Keyboard } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useLngTranslation } from '../../../../hooks/useLngTranslation';
import ButtonComponent from '../../../../newComponents/buttons/button';
import ViewComponent from '../../../../newComponents/view/view';
import PageHeader from '../../../../newComponents/pageHeader/pageHeader';
import { useThemeColors } from '../../../../hooks/useThemeColors';
import { isErrorDispaly } from '../../../../utils/helpers';
import { OTPInput } from '../../../../newComponents/Inputs/BoxInput';
import { getFormattedPhoneNumber } from './constant';
import { showAppToast } from '../../../../newComponents/ToasterMessages/ShowMessage';
import { ActionLogParams, useActionLogging } from '../../../../hooks/loggingHook';
import useEncryptDecrypt from '../../../../hooks/encDecHook';
import ProfileService from '../../../../services/profile';
import useMemberLogin from '../../../../hooks/userInfoHook';
import { getThemedCommonStyles } from '../../../../assets/styles/CommonStyles';
import ParagraphComponent from '../../../../newComponents/textComponets/paragraphText/paragraph';
import TextMultiLanguage from '../../../../newComponents/textComponets/multiLanguageText/textMultiLangauge';
import CommonTouchableOpacity from '../../../../newComponents/touchableComponents/touchableOpacity';
import { s } from '../../../../constants/theme/scale';
import { useHardwareBackHandler } from '../../../../hooks/HardwareBackHandler';
import Container from '../../../../newComponents/container/container';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import ErrorComponent from '../../../../newComponents/errorDisplay/errorDisplay';

const PhoneOtpVericication = (props: any) => {
    const [code, setCode] = useState('');
    const [timer, setTimer] = useState(60);
    const [errorMsg, setErrorMsg] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false); // For resend button loader
    const [otpStatus, setOtpStatus] = useState<'success' | 'error' | null>(null);
    const navigation = useNavigation<any>();
    const { t } = useLngTranslation();
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const { logEvent } = useActionLogging();
    const { encryptAES } = useEncryptDecrypt();
    const { getMemDetails } = useMemberLogin();
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
    useHardwareBackHandler(() => {
        handleGoBack();
    })

    // Navigates back to the previous screen
    const handleGoBack = useCallback(() => {
        const actionData: ActionLogParams = {
            screename: 'PhoneOtpVericication',
            actionName: 'Navigate Back to PhoneNumberChange',
            actionType: 'Icon',
            nextScreenName: 'PhoneNumberChange'
        };
        logEvent('navigation_action', actionData);
        navigation.navigate('PhoneNumberChange', { animation: 'slide_from_left' });
    }, [navigation, logEvent]);



    // Resets the OTP status when the user starts typing again.
    const handleCodeChange = (newCode: string) => {
        setError("")
        setCode(newCode);
        if (otpStatus) {
            setOtpStatus(null);
        }
        if (errorMsg) setErrorMsg("");
    };

    // Handles resending the verification code
    const handleResendCode = async () => {
        setCode('');
        setError("");
        if (timer === 0) {
            setErrorMsg("");
            setOtpStatus(null);
            setIsResending(true);
            try {
                const body = {
                    "phonenumber": encryptAES(props?.route?.params?.phonenumber),
                    "phonecode": encryptAES(props?.route?.params?.phoneCode)
                }
                const response: any = await ProfileService.changePhoneNumber(body); // Adjust payload as per your API
                if (response.status === 200) {
                    setIsResending(false);
                    Keyboard.dismiss();
                    setTimer(60);
                } else {
                    setIsResending(false);
                    setError(isErrorDispaly(response));
                    Keyboard.dismiss();
                }
            } catch (error: any) {
                Keyboard.dismiss();
                setIsResending(false);
                setError(isErrorDispaly(error));
            }
        }
    };
    // Handles OTP verification automatically when the code is filled.
    const handleVerifyOtp = async (otpCode: string) => {
        setError("");
        if (otpCode.length !== 6 || loading) return; // Prevent premature calls and re-entry

        setErrorMsg("");
        setOtpStatus(null);
        setIsEditable(false)
        try {
            const body = {
                "phonenumber": encryptAES(props?.route?.params?.phonenumber),
                "code": otpCode,
                "action": "changephone",
                "phonecode": encryptAES(props?.route?.params?.phoneCode) // Default to '91' if phoneCode is not provided
            };
            const response: any = await ProfileService.verifyPhoneCode(body);
            if (response?.ok) {
                // Check which flow we are in based on navigation params
                Keyboard.dismiss();
                setTimer(0);
                setOtpStatus('success');
                // showAppToast(t("GLOBAL_CONSTANTS.PHONE_NUMBER_VERIFIED"), "success", 2000);
            } else if (response?.status === 422) {
                setIsEditable(true);
                setErrorMsg(isErrorDispaly(response));
                Keyboard.dismiss();
                setOtpStatus('error');
            }
            else {
                setIsEditable(true);
                Keyboard.dismiss();
                setOtpStatus('error');
                setError(isErrorDispaly(response))
            }
        } catch (error: any) {
            setIsEditable(true);
            Keyboard.dismiss();
            setOtpStatus('error');
            setError(isErrorDispaly(error))
        } finally {
            setLoading(false);
            Keyboard.dismiss();
        }
    };

    // Navigates to the next screen after successful verification.
    const handleContinue = async () => {
        setError("");
        setErrorMsg("");
        // The continue button should trigger the verification with the current code
        setLoading(true);
        if (otpStatus === "success") {
            await getMemDetails(true);
            navigation.navigate("LoginVerificationScreen", { animation: 'slide_from_left' });
        }
    };



    const renderResendSection = () => {
        if (isResending) {
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
                    <PageHeader title={t("GLOBAL_CONSTANTS.ENTER_VERIFICATION_CODE")} onBackPress={handleGoBack} />
                    <ViewComponent style={[commonStyles.flex1]}>
                        {error && <ErrorComponent message={error} />}
                        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifystart, commonStyles.gap4]}>
                            <TextMultiLanguage
                                style={[commonStyles.textGrey, commonStyles.fs14, commonStyles.fw500]}
                                text={"GLOBAL_CONSTANTS.WE_VE_SENT_A_CODE_TO"}
                            />
                            <ParagraphComponent
                                style={[commonStyles.getStartedText, commonStyles.fs14, commonStyles.fw500]}
                                text={`${props?.route?.params?.phoneCode ?? " "} ${getFormattedPhoneNumber(props?.route?.params?.phonenumber)}`}
                            />
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
                            <TextMultiLanguage text={"GLOBAL_CONSTANTS.DIDNT_GET_CODE"} style={[commonStyles.textGrey, commonStyles.fs14, commonStyles.fw400]} />
                            {renderResendSection()}
                        </ViewComponent>
                    </ViewComponent>

                    <ViewComponent style={[commonStyles.sectionGap]} />
                    <ButtonComponent
                        title={t("GLOBAL_CONSTANTS.CONTINUE")}
                        onPress={handleContinue}
                        loading={loading}
                        disable={code.length !== 6 || loading}
                    />
                    <ViewComponent style={[commonStyles.sectionGap]} />
                </Container>
            </KeyboardAwareScrollView>
        </ViewComponent>
    );
};

export default PhoneOtpVericication;