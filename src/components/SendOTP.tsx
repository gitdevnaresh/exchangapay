import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { NEW_COLOR } from '../constants/theme/variables';
import { commonStyles } from './CommonStyles';
import LabelComponent from './Paragraph/label';
import ParagraphComponent from './Paragraph/Paragraph';
import { s } from '../constants/theme/scale';
import { text } from '../constants/theme/mixins';
import AuthService from '../services/auth';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/FontAwesome';


const SendOTP = ({ onChangeText, value, isOTP, phoneNumber, onVerify, showError, handlePhoneOtpVerified, verfiedOtpErrorMsg, verifiedPhoneOtp }: any) => {
    const [disabledResend, setDisabledResend] = useState(false);
    const [enableInputOtp, setEnableInputOtp] = useState(false);
    const [timerResend, setTimerResend] = useState(0);
    const [buttonColor, setButtonColor] = useState(NEW_COLOR.BG_ORANGE);
    const [isVerified, setIsVerified] = useState(false);
    const [buttonName, setButtonName] = useState("Get OTP");
    //   const {t} = useLngTranslation();

    const userInfo = useSelector((state: any) => state.UserReducer?.userInfo);

    useEffect(() => {
        if (timerResend > 0) {
            setDisabledResend(true);
            setButtonColor(NEW_COLOR.TEXT_RED);
            const intervalId = setInterval(() => {
                setTimerResend(prev => {
                    if (prev <= 1) {
                        clearInterval(intervalId);
                        setButtonName("Resend");
                        setDisabledResend(false);
                        setButtonColor(NEW_COLOR.BG_ORANGE);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(intervalId);
        }
    }, [timerResend, value]);

    const coverNumberPhone = (phone) => {
        if (!phone) {
            return undefined;
        }
        const response = phone.slice(1).replace(/.(?=....)/g, '*');
        if (response) {
            return response;
        }
    };

    const handleGetOTP = async () => {
        const obj = {
            phoneCode: userInfo.phonecode,
            phoneNumber: userInfo.phoneNumber,
            isResendOTP: true,
        };
        try {
            const response: any = await AuthService.getPhoneNumberOtp(obj);
            if (response?.ok) {
                setTimerResend(60);
                setDisabledResend(response.data);
                setEnableInputOtp(response.data);
                setButtonName("Verify");
                setButtonColor(NEW_COLOR.BG_ORANGE);
            }
        }
        catch (error) {
            console.error("Error fetching OTP:", error);
        }
    };

    const checkValueNumber = (newValue) => {
        const format = /[ `!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]/;
        const result = format.test(newValue.toString());
        if (result) {
            return;
        }
        return newValue;
    };
    const handleVerify = async () => {
        if (value.length !== 6 && buttonName !== "Resend") {
            return setIsVerified(false);
        }
        else if (buttonName === "Resend") {
            onChangeText('');
            return handleGetOTP()
        }
        else {
            setIsVerified(true)
        }
        const Obj = {
            "code": value,
            "phoneCode": userInfo.phoneCode,
            "phoneNumber": userInfo.phoneNumber,
            "isChangePhoneNumber": true
        }
        const response = await AuthService.verifyPhoneNumberOtp(Obj);
        if (!response.status) {
            return;
        }
        ;
        setButtonColor(NEW_COLOR.TEXT_GREEN);
        if (onVerify) {
            onVerify(true);
        }
        handlePhoneOtpVerified(true);

    };
    const formattedTime = `${Math.floor(timerResend / 60)}:${(timerResend % 60).toString().padStart(2, '0')}`;
    return (
        <>
            <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.mb4, { paddingRight: 4 }]}>
                <LabelComponent text={"Phone Code Verification"} children={<LabelComponent text={" *"} style={[commonStyles.textRed]} />} />
                {!isVerified && <>{formattedTime === '0:00' ? null : <LabelComponent style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textWhite]} text={formattedTime === '0:00' ? '' : formattedTime + ' s'} />}</>}
            </View>
            <View style={[commonStyles.dflex, commonStyles.alignCenter, { borderRadius: 8, borderColor: NEW_COLOR.SEARCH_BORDER, backgroundColor: NEW_COLOR.SCREENBG_WHITE, borderWidth: 1 }]}>
                <TextInput
                    editable={enableInputOtp && !isVerified}
                    onChangeText={onChangeText}
                    value={checkValueNumber(value)}
                    maxLength={6}
                    multiline={false}
                    numberOfLines={1}
                    keyboardType="numeric"
                    placeholder={"Enter  code"}
                    placeholderTextColor={NEW_COLOR.PLACEHOLDER_TEXTCOLOR}
                    style={[commonStyles.flex1, { paddingHorizontal: 12 }]}
                    color={NEW_COLOR.TEXT_ALWAYS_WHITE}
                />
                {!enableInputOtp ? (
                    <TouchableOpacity style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.verifyBtn, commonStyles.justifyCenter, { paddingHorizontal: 12, }]} disabled={disabledResend} onPress={handleGetOTP} >
                        <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw400, { color: NEW_COLOR.BG_ORANGE }]}
                            text={buttonName}
                        />
                    </TouchableOpacity>
                ) : (
                    <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.verifyBtn, commonStyles.justifyCenter, { width: s(140) }]}>

                        <TouchableOpacity onPress={handleVerify} disabled={(buttonName == "Resend" || value?.length === 6) ? false : true}>
                            {isVerified &&
                                <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw400, { color: NEW_COLOR.TEXT_GREEN }]} text={"Verified"} />
                            }{!isVerified &&
                                <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw400, { color: NEW_COLOR.BG_ORANGE }]}
                                    text={buttonName}
                                />
                            }
                        </TouchableOpacity>
                        {isVerified && (
                            <View style={styles.tickContainer}>
                                <Icon name="check-circle" size={24} color={NEW_COLOR.TEXT_GREEN} />
                            </View>
                        )}
                    </View>
                )}
            </View>
            <View style={[commonStyles.dflex, commonStyles.justify, commonStyles.mt8]}>
                {((!!enableInputOtp && !isVerified) && value?.length != 6) && (

                    <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textAlwaysWhite, commonStyles.flex1]} text={`${"Enter 6 digits code"} ${coverNumberPhone(phoneNumber)}`} />
                )}
                {showError && !value && (
                    <View style={{}}>
                        <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textRed, commonStyles.textRight]} text={"Required"} />
                    </View>
                )}
                {verfiedOtpErrorMsg && !verifiedPhoneOtp && value?.length > 0 && (
                    <View style={{}}>
                        <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw300, commonStyles.textRed, commonStyles.textRight]} text={"Please verify the code"} />
                    </View>
                )}
            </View>
        </>
    );
};

export default SendOTP;

const styles = StyleSheet.create({
    txtNumberPhone: {
        marginTop: 4,
        ...text(14, 16, 'normal', NEW_COLOR.TEXT_WHITE),
    },
    otp: (status) => ({
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderColor: status ? NEW_COLOR.TEXT_RED : NEW_COLOR.TEXT_GREY,
    }),
    inputStyle: {
        borderColor: NEW_COLOR.INPUT_BORDER,
        borderWidth: 1,
        color: NEW_COLOR.TEXT_BLACK, borderRadius: 12,
        paddingLeft: 14, paddingRight: 14,
        minHeight: 54
    }, input: {
        flexDirection: 'row',
        gap: 10,
        justifyContent: 'space-between',
        padding: 10, zIndex: 5, alignItems: "center",
        borderWidth: 1, borderColor: NEW_COLOR.SEARCH_BORDER,
        borderRadius: 8, minHeight: 46,

    },
    tickContainer: {
        marginLeft: 10,
    },
});