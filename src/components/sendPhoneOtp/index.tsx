import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { text } from '../../constants/styels/mixins';
import OnBoardingService from '../../apiServices/onBoarding'; // Assuming this is the correct path
import { getThemedCommonStyles } from '../CommonStyles';
import { s } from '../../constants/styels/scale';
import { useLngTranslation } from '../../hooks/languagesHook/useLngTranslation';
import useEncryptDecrypt from '../../hooks/encDecHook';
import { useThemeColors } from '../../hooks/themedHook/useThemeColors';
import Feather from '@expo/vector-icons/Feather';
import ParagraphComponent from '../textComponets/paragraphText/paragraph';
import LabelComponent from '../textComponets/lableComponent/lable';
import { isErrorDispaly } from '../../utils/helpers';

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

const SendOTP: React.FC<SendOTPProps> = ({ customerId, onChangeText, value, isOTP, phoneNumber, onVerify, showError, handlePhoneOtpVerified, verifiedPhoneOtp, verfiedOtpErrorMsg }) => {
  const NEW_COLOR = useThemeColors();
  const [disabledResend, setDisabledResend] = useState(false);
  const [enableInputOtp, setEnableInputOtp] = useState(false);
  const [timerResend, setTimerResend] = useState(0);
  const [isVerified, setIsVerified] = useState(false);
  const [buttonName, setButtonName] = useState("GLOBAL_CONSTANTS.GET_CODE");
  const { decryptAES, encryptAES } = useEncryptDecrypt();
  const { t } = useLngTranslation();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const styles = screenStyle(NEW_COLOR);
  const [error, setError] = useState('');
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
  const coverNumberPhone = (phone: string): string | undefined => {
    if (!phone) {
      return undefined;
    }
    const response = phone.slice(1).replace(/.(?=....)/g, '*');
    if (response) {
      return response;
    }
  };

  const handleGetOTP = async () => {
    const response = await OnBoardingService.sendMobileCode();
    if (response?.ok) {
      setTimerResend(60);
      setDisabledResend(Boolean(response.data));
      setEnableInputOtp(Boolean(response.data));
      setButtonName("GLOBAL_CONSTANTS.VERIFY");
    }
  };


  const handleVerify = async () => {
    setError('');
    if (value.length !== 6 && buttonName !== "GLOBAL_CONSTANTS.RESEND") {
      return setIsVerified(false);
    }
    else if (buttonName === "GLOBAL_CONSTANTS.RESEND") {
      onChangeText('');
      return handleGetOTP();
    }

    try {
      const obj = { code: encryptAES(value) };
      const response = await OnBoardingService.getOTPVerification(obj);
      if (response?.ok) {
        setIsVerified(true);
        if (onVerify) {
          onVerify(true);
        }
        handlePhoneOtpVerified(true);
      } else {
        setError(isErrorDispaly(response));
        setIsVerified(false);
      }
    } catch (error) {
      setError(isErrorDispaly(error));
      setIsVerified(false);
    }
  };
  const formattedTime = `${Math.floor(timerResend / 60)}:${(timerResend % 60).toString().padStart(2, '0')}`;
  return (
    <>
      <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.mb4, { paddingRight: 4 }]}>
        <LabelComponent style={[commonStyles.inputLabel, commonStyles.mb8]} text={"GLOBAL_CONSTANTS.PHONE_VERIFICATION"}>
          <LabelComponent text={" *"} style={[commonStyles.textRed]} />
        </LabelComponent>
      </View>
      <View style={[styles.otp(isOTP && !value), commonStyles.input, commonStyles.relative,]}>
        {/* <LabelComponent style={[commonStyles.inputLabel]} text={"GLOBAL_CONSTANTS.PHONE_VERIFICATION_CODE"} children={<LabelComponent text={" *"} style={[commonStyles.textRed]} />} /> */}
        <TextInput
          editable={enableInputOtp && !isVerified}
          onChangeText={onChangeText}
          // value={checkValueNumber(value)}
          value={value?.toString()}
          maxLength={6}
          multiline={false}
          autoCapitalize="words"
          numberOfLines={1}
          keyboardType="decimal-pad"
          placeholder={t("GLOBAL_CONSTANTS.ENTER_CODE")}
          placeholderTextColor={NEW_COLOR.PLACEHOLDER_TEXTCOLOR}
          style={[styles.input, commonStyles.fs14, commonStyles.fw400, commonStyles.flex1, { color: NEW_COLOR.TEXT_WHITE }]}
        />
        {!enableInputOtp ? (
          <TouchableOpacity style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyend,]} disabled={disabledResend} onPress={handleGetOTP} >
            <ParagraphComponent style={[commonStyles.sectionLink]}
              text={buttonName}
            />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={handleVerify} disabled={isVerified || (buttonName !== "GLOBAL_CONSTANTS.RESEND" && value?.length !== 6)}>
            <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyend, commonStyles.gap8,]}>

              {isVerified && (
                <View >
                  <Feather name="check" size={16} color={NEW_COLOR.TEXT_GREEN} />
                </View>
              )}
              {isVerified &&
                <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textGreen]} text={"GLOBAL_CONSTANTS.VERIFIED"} />
              }
              {!isVerified &&
                <ParagraphComponent style={[commonStyles.sectionLink, (buttonName !== "GLOBAL_CONSTANTS.RESEND" && value?.length !== 6) ? { color: NEW_COLOR.DISABLE_TEXT } : commonStyles.textprimary]}
                  text={buttonName}
                />
              }
            </View>
          </TouchableOpacity>


        )}
      </View>
      <View style={[commonStyles.dflex, commonStyles.justify, commonStyles.mt6]}>
        {(!!enableInputOtp && !isVerified) && (

          <ParagraphComponent style={[commonStyles.verificationsbottomtext, commonStyles.flex1]} text={`${t("GLOBAL_CONSTANTS.ENTER_6_DIGITS_CODE")} ${coverNumberPhone(phoneNumber)}`} />
        )}
        {!isVerified && <>{formattedTime === '0:00' ? null : <LabelComponent style={[commonStyles.primarytext]} text={formattedTime === '0:00' ? '' : formattedTime + ' s'} />}</>}


        {verfiedOtpErrorMsg && !verifiedPhoneOtp && value?.length > 0 && (
          <View style={{}}>
            <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw300, commonStyles.textRed, commonStyles.textRight]} text={"GLOBAL_CONSTANTS.PLEASE_VERIFY_THE_CODE"} />
          </View>
        )}

      </View>
      {showError && !value && (
        <View style={{}}>
          <ParagraphComponent style={[commonStyles.inputrequirederrormessage, commonStyles.textLeft]} text={"GLOBAL_CONSTANTS.IS_REQUIRED"} />
        </View>
      )}
      {error && (
        <View style={{}}>
          <ParagraphComponent style={[commonStyles.inputrequirederrormessage, commonStyles.textLeft]} text={error} />
        </View>
      )}
    </>
  );
};

export default SendOTP;

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

