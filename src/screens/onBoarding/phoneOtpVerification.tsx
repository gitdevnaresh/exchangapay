import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, TouchableOpacity, View, SafeAreaView, Text } from 'react-native';
import { Container } from '../../components';
import ErrorComponent from '../../components/Error';
import { commonStyles } from '../../components/CommonStyles';
import { SvgUri } from 'react-native-svg';
import { s } from '../../constants/theme/scale';
import ParagraphComponent from '../../components/Paragraph/Paragraph';
import CardsModuleService from '../../services/card';
import { isErrorDispaly } from '../../utils/helpers';
import { Field, Formik, FormikProps } from 'formik';
import LabelComponent from '../../components/Paragraph/label';
import PhoneCodePicker from '../../components/PhoneCodeSelect';
import { NEW_COLOR } from '../../constants/theme/variables';
import DefaultButton from '../../components/DefaultButton';
import { StyleService } from '@ui-kitten/components';
import AuthService from '../../services/auth';
import { useDispatch, useSelector } from 'react-redux';
import InputDefault from '../../components/DefaultFiat';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { useAuth0 } from 'react-native-auth0';
import { EMAIL_CONSTANTS, REGISTRATION_CONSTATNTS } from './constants';
import DefaultOtpInput from '../../components/DefualtOtpInput';
import useMemberLogin from '../../hooks/useMemberLogin';
import DeviceInfo from 'react-native-device-info';
import { isLogin, loginAction, setUserInfo } from '../../redux/Actions/UserActions';
import { fcmNotification } from '../../utils/FCMNotification';
import useEncryptDecrypt from '../../hooks/useEncryption_Decryption';
import useSendUserWebhook from '../../hooks/useSendUserWebhook';
import OnBoardingService from '../../services/onBoardingservice';
import * as Keychain from "react-native-keychain";
const PhoneOtpVerification = () => {
    const [errorMsg, setErrorMsg] = useState<any>('');
    const [resendTimer, setResendTimer] = useState(0);
    const [isOtpScreen, setIsOtpScreen] = useState(false); // State to toggle between phone number and OTP fields
    const timerInterval = useRef<any>(null);
    const navigation = useNavigation<any>();
    const [initialValues, setInitValues] = useState<any>({ phoneNumber: '', phoneCode: '', phoneOTP: '' });
    const [countryCodelist, setCountryCodelist] = useState<any>([]);
    const userprofile = useSelector((state: any) => state.UserReducer?.userInfo);
    const { getMemDetails } = useMemberLogin();
    const dispatch = useDispatch();
    const { clearSession } = useAuth0();
    const { encryptAES, decryptAES } = useEncryptDecrypt();
    const { sendWebhook } = useSendUserWebhook();
    const formikRef = useRef<FormikProps<any>>(null);

    const [loaders, setLoaders] = useState<any>({
        isPhoneNoEditable: true,
        isOTPButtonDisable: false,
        isOTPEditable: false,
        isPhoneNoEditVisible: true,
        isTimerShow: false,
        isBtnLoading: false,
    });

    const handleCloseError = () => {
        setErrorMsg('');
    };

    useEffect(() => {
        getListOfCountryCodeDetails();
        if (userprofile) {
            setInitValues((prevState: any) => ({
                ...prevState,
                phoneNumber: decryptAES(userprofile.phoneNumber) || '',
                phoneCode: decryptAES(userprofile.phonecode) || '',
            }));
        }
    }, []);

    useEffect(() => {
        if (resendTimer > 0) {
            timerInterval.current = setInterval(() => {
                setResendTimer((prevTimer) => {
                    if (prevTimer <= 1) {
                        clearInterval(timerInterval.current);
                        setLoaders((prev: any) => ({
                            ...prev,
                            isOTPButtonDisable: false,
                            isTimerShow: false,
                        }));
                        return 0;
                    }
                    return prevTimer - 1;
                });
            }, 1000);

            return () => clearInterval(timerInterval.current);
        }
    }, [resendTimer]);

    const getListOfCountryCodeDetails = async () => {
        try {
            const response: any = await CardsModuleService.getPersonalAddressLu();

            if (response?.status === 200) {
                setCountryCodelist(response?.data?.PhoneCodes);
                setErrorMsg(null);
            } else {
                setErrorMsg(isErrorDispaly(response));
            }
        } catch (error) {
            setErrorMsg(isErrorDispaly(error));
        }
    };

    const handleConfirmAndContinue = async (values: any, isResend?: boolean, setFieldValue?: (field: string, value: any) => void) => {
        setErrorMsg("")

        if (!isOtpScreen || isResend) {
            if (isResend && setFieldValue) {
                setFieldValue('phoneOTP', '');
            }
            const { phoneNumber, phoneCode } = values;
            if (!phoneNumber || !phoneCode) {
                setErrorMsg(REGISTRATION_CONSTATNTS.PHONE_NUMBER_IS_REQUIRED);
                return;
            } else if (phoneNumber.length < 5 || phoneNumber.length > 15) {
                setErrorMsg(REGISTRATION_CONSTATNTS.PLEASE_ENTER_A_VALID_MOBILE_NUMBER);
                return;
            }
            const obj = {
                phoneCode: encryptAES(phoneCode),
                phoneNumber: encryptAES(phoneNumber),
                isResendOTP: true,
            };
            try {
                const response = await AuthService.getPhoneNumberOtp(obj);
                if (response?.ok) {
                    setResendTimer(60);
                    setIsOtpScreen(true);
                    setInitValues((prevState: any) => ({
                        ...prevState,
                        phoneCode,
                        phoneNumber,
                    }));
                    setLoaders((prev: any) => ({
                        ...prev,
                        isPhoneNoEditable: false,
                        isOTPEditable: true,
                        isPhoneNoEditVisible: true,
                        isTimerShow: true,
                        isOTPButtonDisable: true,
                    }));
                } else {
                    setErrorMsg(isErrorDispaly(response));
                }
            } catch (error) {
                setErrorMsg(isErrorDispaly(error));
            }
        } else {
            if (!values.phoneOTP || values.phoneOTP.length !== 6) {
                setErrorMsg("Please enter a valid OTP");
                return;
            }
            try {
                const Obj = {
                    "code": encryptAES(values.phoneOTP),
                    "phoneCode": encryptAES(values.phoneCode),
                    "phoneNumber": encryptAES(values.phoneNumber),
                    "isChangePhoneNumber": true
                };
                const response = await AuthService.verifyPhoneNumberOtp(Obj);
                if (response?.ok) {
                    getMemDetails({});
                    await sendWebhook("Update");

                } else {
                    setErrorMsg(isErrorDispaly(response));
                }
            } catch (error) {
                setErrorMsg(isErrorDispaly(error));
            }
        }
    };

    const handleEditPhoneNumber = () => {
        setIsOtpScreen(false);
        setLoaders((prev: any) => ({
            ...prev,
            isPhoneNoEditable: true,
            isOTPEditable: false,
            isPhoneNoEditVisible: false,
            isTimerShow: false,
            actionBtnName: 'Confirm and Continue',
            isOTPButtonDisable: false,
        }));
        setErrorMsg('');
        if (formikRef.current) {
            formikRef.current.setFieldValue('phoneOTP', '');
        }
    };

    const formattedTimer = `${Math.floor(resendTimer / 60)}:${(resendTimer % 60)
        .toString()
        .padStart(2, '0')}`;

    const logOutLogData = async () => {
        const ip = await DeviceInfo.getIpAddress();
        const deviceName = await DeviceInfo.getDeviceName();
        const obj = {
            "id": "",
            "state": "",
            "countryName": "",
            "ipAddress": ip,
            "info": `{brand:${DeviceInfo.getBrand()},deviceName:${deviceName},model: ${DeviceInfo.getDeviceId()}}`
        }
        const actionRes = await AuthService.logOutLog(obj);

    };

    const handleLgout = async () => {
        await clearSession();
        dispatch(setUserInfo(""));
        dispatch(isLogin(false));
        dispatch(loginAction(""));
        const response = await OnBoardingService.updateFcmToken();
        await Keychain.resetGenericPassword({ service: 'chat_conversation_Id' });
        await Keychain.resetGenericPassword({ service: "authTokenService" });
        logOutLogData()
        navigation.dispatch(
            CommonActions.reset({
                index: 1,
                routes: [{ name: EMAIL_CONSTANTS.SPLASH_SCREEN }],
            })
        );
        fcmNotification.unRegister();
    };

    const onChangePhoneCode = (setFieldValue: any, values: any) => {
        setErrorMsg("")
        setFieldValue('phoneCode', values)
    };

    const handleChangePhone = (text: any, setFieldValue: any) => {
        setErrorMsg("")
        setFieldValue("phoneNumber", text);
    };

    return (
        <SafeAreaView style={[commonStyles.screenBg, commonStyles.flex1]}>
            <ScrollView keyboardShouldPersistTaps="handled">
                <Container style={commonStyles.container}>
                    <View style={[commonStyles.mb43, commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap24]}>
                        <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap24]}>
                            {isOtpScreen &&
                                <TouchableOpacity onPress={handleEditPhoneNumber} >
                                    <AntDesign name="arrowleft" size={24} color={NEW_COLOR.TEXT_ALWAYS_WHITE} />
                                </TouchableOpacity>
                            }
                            <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.mxAuto]}>
                                <SvgUri
                                    uri={REGISTRATION_CONSTATNTS.EXCHANGAPAY_LOGO}
                                    width={s(61)}
                                    height={s(56)}
                                />
                                <ParagraphComponent
                                    text={REGISTRATION_CONSTATNTS.EXCHANGA_PAY}
                                    style={[commonStyles.fs32, commonStyles.fw800, commonStyles.textOrange, commonStyles.textCenter]}
                                />
                            </View>

                        </View>

                    </View>

                    <View>
                        <ParagraphComponent
                            style={[commonStyles.fs24, commonStyles.textBlack, commonStyles.fw600, commonStyles.textCenter]}
                            text={REGISTRATION_CONSTATNTS.VERIFY_YOUR_PHONE_NUMBER}
                        />
                        {isOtpScreen && (
                            <ParagraphComponent
                                style={[commonStyles.fs16, commonStyles.textpara, commonStyles.fw600, commonStyles.textCenter]}
                                text={REGISTRATION_CONSTATNTS.ENTER_OTP_SENT_TO + ' ' + initialValues.phoneCode + ' ' + initialValues.phoneNumber}
                            />
                        )}
                    </View>
                    <View style={[commonStyles.mb32]} />
                    {errorMsg && <ErrorComponent message={errorMsg} onClose={handleCloseError} />}
                    <View>
                        <Formik
                            innerRef={formikRef}
                            initialValues={initialValues}
                            onSubmit={(values, { setFieldValue }) => handleConfirmAndContinue(values, false, setFieldValue)}
                            validateOnChange={false}
                            validateOnBlur={false}
                            enableReinitialize
                        >
                            {({ values, setFieldValue }) => (
                                <View style={[]}>
                                    {!isOtpScreen && (
                                        <>
                                            <LabelComponent
                                                text={REGISTRATION_CONSTATNTS.PHONE_NUMBER}
                                                Children={<LabelComponent style={[commonStyles.textError]} text={REGISTRATION_CONSTATNTS.REQUIRED_STAR} />}
                                            />
                                            <View style={[commonStyles.flex1, commonStyles.relative, commonStyles.dflex, commonStyles.gap8, commonStyles.mb36]}>
                                                <PhoneCodePicker
                                                    containerStyle={{
                                                        backgroundColor: loaders.isPhoneNoEditable
                                                            ? NEW_COLOR.SCREENBG_WHITE
                                                            : NEW_COLOR.DISABLED_INPUTBG,
                                                    }}
                                                    customBind={['name', '(', 'code', ')']}
                                                    data={countryCodelist}
                                                    value={values.phoneCode}
                                                    modalTitle={"Pick Your Country Code"}
                                                    placeholder="Select"
                                                    onChange={(item) => onChangePhoneCode(setFieldValue, item.code)}
                                                    disable={!loaders.isPhoneNoEditable}
                                                />
                                                <Field
                                                    name="phoneNumber"
                                                    label={''}
                                                    customContainerStyle={{ flex: 1 }}
                                                    placeholder={REGISTRATION_CONSTATNTS.ENTER_PHONE_NUMBER}
                                                    component={InputDefault}
                                                    keyboardType="phone-pad"
                                                    onChangeText={(value: any) => handleChangePhone(value, setFieldValue)}
                                                    editable={loaders.isPhoneNoEditable}

                                                />
                                            </View>
                                        </>
                                    )}
                                    {isOtpScreen && (
                                        <>

                                            <LabelComponent
                                                text={REGISTRATION_CONSTATNTS.PHONE_OTP}
                                                style={[commonStyles.mb10]}
                                                Children={<LabelComponent style={[commonStyles.textError]} text={REGISTRATION_CONSTATNTS.REQUIRED_STAR} />}
                                            />
                                            <Field
                                                name="phoneOTP"
                                                component={DefaultOtpInput}
                                                error={errorMsg}
                                                length={6}
                                                onChangeText={(text: string) => {
                                                    setErrorMsg('');
                                                    setFieldValue('phoneOTP', text);
                                                }}
                                            />


                                        </>
                                    )}
                                    <View style={[commonStyles.mb43]} />
                                    <DefaultButton
                                        title={'Confirm and Continue'}
                                        customTitleStyle={{ color: NEW_COLOR.TEXT_ALWAYS_WHITE }}
                                        onPress={() => handleConfirmAndContinue(values, false, setFieldValue)}
                                    />
                                    {isOtpScreen && (

                                        <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.mt10, commonStyles.justifyCenter]}>
                                            <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw600, commonStyles.textBlack]} text={'Did not get the code? '} />
                                            {loaders.isTimerShow && <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw600, commonStyles.textOrange,]} text={`Resend OTP in ${formattedTimer}`} />}

                                            {!loaders.isTimerShow && <TouchableOpacity onPress={() => handleConfirmAndContinue(values, true, setFieldValue)}>
                                                <ParagraphComponent style={[commonStyles.fs16, commonStyles.fw600, commonStyles.textOrange,]} text={`Resend OTP`} />
                                            </TouchableOpacity>}

                                        </View>

                                    )}
                                    <View style={[commonStyles.mb8]} />
                                    <View style={[commonStyles.dflex, commonStyles.justifyCenter, commonStyles.alignCenter]}>
                                        <TouchableOpacity onPress={handleLgout} style={[commonStyles.px10]} >
                                            <Text style={[themedStyles.resend, commonStyles.textOrange, commonStyles.fs16, commonStyles.fw600]}>{EMAIL_CONSTANTS.LOG_OUT}</Text>
                                        </TouchableOpacity>

                                    </View>




                                </View>

                            )}

                        </Formik>

                    </View>

                </Container>
            </ScrollView>
        </SafeAreaView>
    );
};

export default PhoneOtpVerification;

const themedStyles = StyleService.create({
    ml12: {
        marginLeft: 12,
    },
    arrowposition: {
        position: 'absolute',
        right: 8,
        top: 30,
    },
    ml8: {
        marginLeft: 8,
    },
    mb6: {
        marginBottom: 6,
    },
    input: {
        flexDirection: 'row',
        gap: 10,
        justifyContent: 'space-between',
        padding: 10,
        zIndex: 5,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: NEW_COLOR.SEARCH_BORDER,
        borderRadius: 8,
        minHeight: 46,
    },
    referralCheck: {
        position: 'absolute',
        right: 14,
        top: 10.5,
        zIndex: 10,
    }, resend: {
        textAlign: "center",
    },
});