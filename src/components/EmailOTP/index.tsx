import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import OnBoardingService from '../../apiServices/onBoarding';
import { getThemedCommonStyles } from '../CommonStyles';
import { s } from '../../constants/styels/scale';
import { useLngTranslation } from '../../hooks/languagesHook/useLngTranslation';
import { useThemeColors } from '../../hooks/themedHook/useThemeColors';
import Feather from 'react-native-vector-icons/Feather';
import ParagraphComponent from '../textComponets/paragraphText/paragraph';
import LabelComponent from '../textComponets/lableComponent/lable';
import { isErrorDispaly } from '../../utils/helpers';
import useEncryptDecrypt from '../../hooks/encDecHook';

interface EmailOTPProps {
  onChangeText: (text: string) => void;
  value: string;
  isEmailOTP: boolean;
  onVerify: (verified: boolean) => void;
  showError: boolean;
}

const EmailOTP: React.FC<EmailOTPProps> = ({ onChangeText, value, isEmailOTP, onVerify, showError }) => {
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const [disabledResend, setDisabledResend] = useState(false);
  const [enableInputOtp, setEnableInputOtp] = useState(false);
  const [timerResend, setTimerResend] = useState(0);
  const [isVerified, setIsVerified] = useState(false);
  const [buttonName, setButtonName] = useState("GLOBAL_CONSTANTS.GET_CODE");
  const { t } = useLngTranslation();
  const styles = screenStyles(NEW_COLOR);
  const { encryptAES } = useEncryptDecrypt();
  const [inputError, setInputError] = useState<any>('');
  useEffect(() => {
    if (timerResend > 0) {
      setDisabledResend(true);

      const intervalId = setInterval(() => {
        setTimerResend(prev => {
          if (prev <= 1) {
            clearInterval(intervalId);
            if (!value) {
              setButtonName("GLOBAL_CONSTANTS.RESEND");
            }
            setDisabledResend(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(intervalId);
    }
  }, [timerResend, value]);

  useEffect(() => {
    if (enableInputOtp && value && value.length > 0 && buttonName !== "GLOBAL_CONSTANTS.VERIFY") {
      setButtonName("GLOBAL_CONSTANTS.VERIFY");
    }
  }, [value, enableInputOtp, buttonName]);

  const handleGetOTP = async () => {
    try {
      const response = await OnBoardingService.sendEmailOTP();
      if (response?.ok) {
        setDisabledResend(true);
        setTimerResend(60);
        setButtonName("GLOBAL_CONSTANTS.VERIFY");
        setEnableInputOtp(true);
      } else {
        setInputError(isErrorDispaly(response));
      }
    } catch (error) {
      setInputError(isErrorDispaly(error));
    }
  };

  const checkValueNumber = (newValue: string): string | undefined => {
    const format = /[ `!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]/;
    const result = format.test(newValue.toString());
    if (result) {
      return;
    }
    return newValue;
  };

  const handleVerify = async () => {
    setInputError('');
    if (value.length !== 6 && buttonName !== "GLOBAL_CONSTANTS.RESEND") {
      return setIsVerified(false);
    }
    else if (buttonName === "GLOBAL_CONSTANTS.RESEND") {
      onChangeText('');
      return handleGetOTP();
    }

    try {
      const response = await OnBoardingService.getEmailOTPVerification({ code: encryptAES(value) });
      if (response?.ok) {
        setIsVerified(true);
        if (onVerify) {
          onVerify(true);
        }
      } else {
        setInputError(isErrorDispaly(response));
        setIsVerified(false);
      }
    } catch (error) {
      setInputError(isErrorDispaly(error));
      setIsVerified(false);
    }
  };

  const formattedTime = `${Math.floor(timerResend / 60)}:${(timerResend % 60).toString().padStart(2, '0')}`;

  return (
    <>
      <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, { paddingRight: 4 }]}>
        <View>
          <LabelComponent style={[commonStyles.inputLabel]} text={"GLOBAL_CONSTANTS.EMAIL_VERIFICATION"}>
            <LabelComponent text={" *"} style={[commonStyles.textRed]} />
          </LabelComponent>
        </View>
        <View />
      </View>
      <View style={[styles.otp(isEmailOTP && !value), commonStyles.input, commonStyles.relative,]}>
        <TextInput
          editable={enableInputOtp && !isVerified}
          onChangeText={onChangeText}
          value={checkValueNumber(value)}
          maxLength={6}
          autoCapitalize="words"
          keyboardType="decimal-pad"
          placeholder={t("GLOBAL_CONSTANTS.ENTER_CODE")}
          placeholderTextColor={NEW_COLOR.PLACEHOLDER_TEXTCOLOR}
          style={[styles.input, commonStyles.fs14, commonStyles.fw400, commonStyles.flex1, { color: NEW_COLOR.TEXT_WHITE }]}
        />
        {!enableInputOtp ? (
          <TouchableOpacity
            style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter, commonStyles.gap6]}
            disabled={disabledResend}
            onPress={handleGetOTP}
          >
            <ParagraphComponent style={[commonStyles.sectionLink]} text={buttonName} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={handleVerify}
            disabled={isVerified || (buttonName !== "GLOBAL_CONSTANTS.RESEND" && value?.length !== 6)}
          >
            <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyend, commonStyles.gap6]}>
              {isVerified && (
                <View>
                  <Feather name="check" size={16} color={NEW_COLOR.TEXT_GREEN} />
                </View>
              )}
              {isVerified && (
                <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textGreen]} text={"GLOBAL_CONSTANTS.VERIFIED"} />
              )}
              {!isVerified && (
                <ParagraphComponent style={[commonStyles.sectionLink, (buttonName !== "GLOBAL_CONSTANTS.RESEND" && value?.length !== 6) ? { color: NEW_COLOR.DISABLE_TEXT } : commonStyles.textprimary]} text={buttonName} />
              )}
            </View>
          </TouchableOpacity>
        )}
      </View>
      <View style={[commonStyles.dflex, commonStyles.justify, commonStyles.mt6]}>
        {(!!enableInputOtp && !isVerified) && (
          <ParagraphComponent
            style={[commonStyles.verificationsbottomtext, commonStyles.flex1]}
            text={"GLOBAL_CONSTANTS.ENTER_6_DIGITS_EMAIL_CODE"}
          />
        )}
        {!isVerified && formattedTime !== '0:00' && (
          <LabelComponent
            style={[commonStyles.primarytext]}
            text={formattedTime + ' s'}
          />
        )}
      </View>
      {showError && !value && (
        <View>
          <ParagraphComponent
            style={[commonStyles.inputrequirederrormessage, commonStyles.textLeft]}
            text={"GLOBAL_CONSTANTS.IS_REQUIRED"}
          />
        </View>

      )}
      {inputError && (
        <View>
          <ParagraphComponent
            style={[commonStyles.inputrequirederrormessage, commonStyles.textLeft]}
            text={inputError}
          />
        </View>
      )}
    </>
  );
};

export default EmailOTP;

const screenStyles = (NEW_COLOR: any) => {
  const baseStyles = StyleSheet.create({
    input: {
      height: 42
    },
  });

  return {
    ...baseStyles,
    otp: (status: boolean) => ({
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
      borderColor: status ? NEW_COLOR.TEXT_RED : NEW_COLOR.INPUT_BORDER,
    }),
  };
};
