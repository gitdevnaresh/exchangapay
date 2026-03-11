import React, { useState } from 'react';
import { Keyboard } from 'react-native';
import { useLngTranslation } from '../../../../hooks/useLngTranslation';
import { getThemedCommonStyles } from '../../../../assets/styles/CommonStyles';
import { useThemeColors } from '../../../../hooks/useThemeColors';
import useEncryptDecrypt from '../../../../hooks/encDecHook';
import { isErrorDispaly } from '../../../../utils/helpers';
import { showAppToast } from '../../../../newComponents/ToasterMessages/ShowMessage';
import ParagraphComponent from '../../../../newComponents/textComponets/paragraphText/paragraph';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import ViewComponent from '../../../../newComponents/view/view';
import { OTPInput } from '../../../../newComponents/Inputs/BoxInput';
import ButtonComponent from '../../../../newComponents/buttons/button';
import SecurityService from '../../../../services/security';
import ErrorComponent from '../../../../newComponents/errorDisplay/errorDisplay';



// Props interface for communication with the parent component
interface GoogleAuthenticatorProps {
    feature: string;
    onSuccess: (staus: boolean) => void;
    onClose: () => void;
}

const GoogleAuthenticator = ({ feature, onSuccess, onClose }: GoogleAuthenticatorProps) => {
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState<boolean>(false);
    const [otpStatus, setOtpStatus] = useState<'success' | 'error' | null>(null);
    const { t } = useLngTranslation();
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const { encryptAES } = useEncryptDecrypt();
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [isEditable, setIsEditable] = useState<boolean>(true);


    const handleCodeChange = (newCode: string) => {
        setError("");
        setErrorMessage("");
        setCode(newCode);
        if (newCode.length !== 6 && otpStatus) {
            setOtpStatus(null);
        }
    };

    const handleVerifyOtp = async (otpCode: string) => {
        if (otpCode.length !== 6 || loading) return;
        setOtpStatus(null);
        setLoading(true);
        setIsEditable(false);
        try {
            const encryptedCode = encryptAES(otpCode);
            const response = await SecurityService.verifyGoogleAuthentication(encryptedCode);

            if (response?.status === 200) {
                Keyboard.dismiss();
                setOtpStatus('success');
                // showAppToast(t("GLOBAL_CONSTANTS.VERIFIED_SUCCESSFULLY"), "success");
            } else {
                setIsEditable(true);
                setError(isErrorDispaly(response));
                setOtpStatus('error');
                Keyboard.dismiss();
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

    // Call the onSuccess prop provided by the parent instead of navigating
    const handleContinue = () => {
        setError("");
        if (otpStatus === 'success') {
            onSuccess(true);
        } else {
            onSuccess(false);
        }
    };

    return (
        <KeyboardAwareScrollView
            contentContainerStyle={[{ flexGrow: 1 }]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            enableOnAndroid={true}
        >
            {error && <ErrorComponent message={error} onClose={() => setError('')} />}

            <ParagraphComponent
                style={[commonStyles.textGrey, commonStyles.fs14, commonStyles.fw400, commonStyles.mt12]}
                text={t("GLOBAL_CONSTANTS.ENTER_YOUR_ONE_TIME_CODE")}
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
            <ViewComponent style={[commonStyles.flex1]} />
            <ButtonComponent
                title={t("GLOBAL_CONSTANTS.CONTINUE")}
                onPress={handleContinue}
                loading={loading}
                disable={otpStatus !== 'success' || loading}
            />
            <ViewComponent style={[commonStyles.mb32]} />
        </KeyboardAwareScrollView>
    );
};

export default GoogleAuthenticator;

