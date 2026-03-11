import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { text } from '../../constants/styels/mixins';
import { s } from '../../constants/styels/scale';
import { useLngTranslation } from '../../hooks/languagesHook/useLngTranslation';
import useEncryptDecrypt from '../../hooks/encDecHook';
import { useThemeColors } from '../../hooks/themedHook/useThemeColors';
import Feather from 'react-native-vector-icons/Feather';
import ProfileService from '../../apiServices/profile';
import ParagraphComponent from '../textComponets/paragraphText/paragraph';
import LabelComponent from '../textComponets/lableComponent/lable';
import { getThemedCommonStyles } from '../CommonStyles';

interface SendOTPProps {
  customerId: string;
  onChangeText: (text: string) => void;
  value: string;
  isOTP?: boolean;
  phoneNumber: string;
  onVerify?: (verified: boolean) => void;
  showError: boolean;
  handlePhoneOtpVerified: (verified: boolean) => void;
  verifiedPhoneOtp: boolean;
  verfiedOtpErrorMsg: boolean;
}

const SendAuthenticatonOTP: React.FC<SendOTPProps> = ({ customerId, onChangeText, value, isOTP, phoneNumber, onVerify, showError, handlePhoneOtpVerified, verifiedPhoneOtp, verfiedOtpErrorMsg }) => {
  const NEW_COLOR = useThemeColors();
  const [disabledResend, setDisabledResend] = useState(false);
  const [enableInputOtp, setEnableInputOtp] = useState(false);
  const [timerResend, setTimerResend] = useState(0);
  const [isVerified, setIsVerified] = useState(false);
  const { encryptAES } = useEncryptDecrypt();
  const { t } = useLngTranslation();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const styles = screenStyle(NEW_COLOR);
  const [inputError, setInputError] = useState<string | null>(null);

  useEffect(() => {
    if (timerResend > 0) {
      setDisabledResend(true);
      const intervalId = setInterval(() => {
        setTimerResend(prev => {
          if (prev <= 1) {
            clearInterval(intervalId);
            setDisabledResend(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(intervalId);
    }
  }, [timerResend]);

  const handleVerify = async () => {
    setInputError(null);

    if (!value || value.length === 0) {
      setInputError("GLOBAL_CONSTANTS.IS_REQUIRED");
      if (onVerify) {
        onVerify(false);
      }
      return;
    }
    else if (value.length !== 6) {
      if (onVerify) {
        onVerify(false);
      }
      setInputError("GLOBAL_CONSTANTS.INVALID_AUTHENTICATOR_CODE");
      return;
    } else {
      const obj = { code: encryptAES(value) };
      const response = await ProfileService.verifyAuthenticatorCode(obj);
      if (response.ok && response.data) {
        if (onVerify) {
          setIsVerified(true);
          onVerify(true);
        }
        handlePhoneOtpVerified(true);
      } else {
        setIsVerified(false);
        handlePhoneOtpVerified(false);
        if (onVerify) {
          onVerify(false);
        }
        setInputError("GLOBAL_CONSTANTS.INVALID_AUTHENTICATOR_CODE");
        return;
      }
    }
  };

  return (
    <>
      <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.mb4, { paddingRight: 4 }]}>
        <LabelComponent style={[commonStyles.inputLabel, commonStyles.mb0]} text={"GLOBAL_CONSTANTS.AUTHENTICATOR_CODE"}>
          <LabelComponent text={" *"} style={[commonStyles.textRed]} />
        </LabelComponent>
      </View>
      <View style={[styles.otp(isOTP && !value), commonStyles.input, commonStyles.relative]}>
        <TextInput
          editable={!isVerified}
          onChangeText={text => {
            setInputError(null);
            onChangeText(text);
          }}
          value={value?.toString()}
          maxLength={6}
          multiline={false}
          autoCapitalize="none"
          numberOfLines={1}
          keyboardType="decimal-pad"
          placeholder={t("GLOBAL_CONSTANTS.ENTER_CODE")}
          placeholderTextColor={NEW_COLOR.PLACEHOLDER_TEXTCOLOR}
          style={[styles.input, commonStyles.fs14, commonStyles.fw400, commonStyles.flex1, { color: NEW_COLOR.TEXT_WHITE }]}
        />
        <TouchableOpacity
          onPress={handleVerify}
          disabled={isVerified}
          style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyend]}
        >
          <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyend, commonStyles.gap8]}>
            {isVerified ? (
              <>
                <Feather name="check" size={16} color={NEW_COLOR.TEXT_GREEN} />
                <ParagraphComponent
                  multiLanguageAllows={true}
                  style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textGreen]}
                  text={"GLOBAL_CONSTANTS.VERIFIED"}
                />
              </>
            ) : (
              <ParagraphComponent
                multiLanguageAllows={true}
                style={[commonStyles.sectionLink]}
                text={"GLOBAL_CONSTANTS.CLICK_HERE_TO_VERIFY"}
              />
            )}
          </View>
        </TouchableOpacity>
      </View>
      <View style={[commonStyles.dflex, commonStyles.justify, commonStyles.mt6]}>
        {inputError && (
          <View>
            <ParagraphComponent
              multiLanguageAllows={true}
              style={[
                commonStyles.fs14,
                commonStyles.fw400,
                commonStyles.textRed,
                commonStyles.textLeft,
              ]}
              text={inputError}
            />
          </View>
        )}
        {!inputError && verfiedOtpErrorMsg && !verifiedPhoneOtp && value?.length > 0 && (
          <View>
            <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw300, commonStyles.textRed, commonStyles.textRight]} text={"GLOBAL_CONSTANTS.PLEASE_VERIFY_THE_CODE"} />
          </View>
        )}
      </View>
      {showError && !value && (
        <View>
          <ParagraphComponent style={[commonStyles.inputrequirederrormessage, commonStyles.textLeft]} text={"GLOBAL_CONSTANTS.IS_REQUIRED"} />
        </View>
      )}
    </>
  );
};

export default SendAuthenticatonOTP;

const screenStyle = (NEW_COLOR: any) => {
  const baseStyles = StyleSheet.create({
    txtNumberPhone: {
      marginTop: 4,
      ...text(14, 16, 400, NEW_COLOR.TEXT_WHITE),
    },
    inputOtp: {
      flex: 1,
      marginLeft: 10,
      color: NEW_COLOR.TEXT_WHITE,
    },
    tickContainer: {
      marginLeft: 10,
    },
    input: {
      height: s(48)
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

