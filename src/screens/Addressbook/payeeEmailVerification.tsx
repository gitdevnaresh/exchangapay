import React, { useState, useEffect, useRef } from 'react';
import { ScrollView, TouchableOpacity, View, BackHandler, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { Container } from '../../components';
import ErrorComponent from '../../components/Error';
import { commonStyles } from '../../components/CommonStyles';
import { s } from '../../constants/theme/scale';
import ParagraphComponent from '../../components/Paragraph/Paragraph';
import { isErrorDispaly } from '../../utils/helpers';
import { Field, Formik, FormikProps } from 'formik'; 
import LabelComponent from '../../components/Paragraph/label';
import { NEW_COLOR } from '../../constants/theme/variables';
import DefaultButton from '../../components/DefaultButton';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import DefaultOtpInput from '../../components/DefualtOtpInput';
import useEncryptDecrypt from '../../hooks/useEncryption_Decryption';
import { REGISTRATION_CONSTATNTS } from '../onBoarding/constants';
import AntDesign from "react-native-vector-icons/AntDesign";
import AddressbookService from '../../services/addressbook';

interface FormValues {
    emailOTP: string;
}

const EmailOtpVerification = (props: any) => {
    const { payeeId, isResend } = props?.route?.params || {};
    const [errorMsg, setErrorMsg] = useState<any>('');
    const [resendTimer, setResendTimer] = useState<number>(isResend ? 0 : 60);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const timerInterval = useRef<any>(null);
    const navigation = useNavigation<any>();
    const userprofile = useSelector((state: any) => state.UserReducer?.userInfo);
    const { encryptAES, decryptAES } = useEncryptDecrypt();
    const decryptedEmail = decryptAES(userprofile.email);
    
    // Create a ref to hold the Formik instance
    const formikRef = useRef<FormikProps<FormValues>>(null);
    
    const initialValues: FormValues = {
        emailOTP: ""
    };
    

    // This effect now correctly calls handleResendOtp once Formik is ready
    useEffect(() => {
        if (payeeId && isResend && formikRef.current) {
            handleResendOtp(formikRef.current.setFieldValue);
        }
    }, [payeeId, isResend]); // Dependency array updated for clarity


    // Effect to manage the countdown timer
    useEffect(() => {
        if (resendTimer > 0) {
            timerInterval.current = setInterval(() => {
                setResendTimer((prevTimer) => {
                    if (prevTimer <= 1) {
                        clearInterval(timerInterval.current);
                        return 0;
                    }
                    return prevTimer - 1;
                });
            }, 1000);
        }
        return () => {
            clearInterval(timerInterval.current);
        };
    }, [resendTimer]);

    const handleCloseError = () => {
        setErrorMsg('');
    };

    useEffect(() => {
        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            () => {
                handleBackPress();
                return true;
            }
        );

        return () => backHandler.remove();
    }, [])

    // This function now accepts setFieldValue to modify the form state
    const handleResendOtp = async (setFieldValue: (field: string, value: any) => void) => {
        // Just clear the form value. The child component will now handle focusing automatically.
        setFieldValue('emailOTP', '');
        setErrorMsg('');
        try {
            const payeeId = props?.route?.params?.payeeId;
            if (!payeeId) {
                setErrorMsg(isErrorDispaly("Please Provide Payee Id"));
                return;
            }
            const body = { "id": payeeId };
            const response = await AddressbookService.resendPayeeEmailOtp(body);
            if (response?.ok) {
                setResendTimer(60);
            } else {
                setErrorMsg(isErrorDispaly(response));
            }
        } catch (error) {
            setErrorMsg(isErrorDispaly(error));
        }
    };

    const handleConfirmAndContinue = async (values: FormValues) => {
        setErrorMsg('');
        if (!values.emailOTP || values.emailOTP.length !== 6) {
            setErrorMsg("Please enter a valid 6-digit OTP.");
            return;
        };
        setIsLoading(true);
        try {
            const Obj = {
                code: encryptAES(values.emailOTP),
                email: encryptAES(decryptedEmail),
                id: props?.route?.params?.payeeId
            };
            const response = await AddressbookService.emailVerification(Obj);
            if (response?.ok) {
                handleBackPress();
                setIsLoading(false);
            } else {
                setErrorMsg(isErrorDispaly(response));
                setIsLoading(false);
            }
        } catch (error) {
            setIsLoading(false);
            setErrorMsg(isErrorDispaly(error));
        }
    };

    const handleBackPress = () => {
        navigation.navigate("cryptoPayeesList", {
            screenName: props?.route?.params.screenName || ""
        });
    };

    const formattedTimer = `${String(Math.floor(resendTimer / 60)).padStart(2, '0')}:${String(resendTimer % 60).padStart(2, '0')}`;

    return (
        <SafeAreaView style={[commonStyles.screenBg, commonStyles.flex1]}>
            <KeyboardAvoidingView
                style={commonStyles.flex1}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? s(20) : 0}
            >
                <Formik
                    innerRef={formikRef} // Attach ref to Formik itself to access its methods
                    initialValues={initialValues}
                    onSubmit={handleConfirmAndContinue}
                    validateOnChange={false}
                    validateOnBlur={false}
                    enableReinitialize
                >
                    {({ setFieldValue, handleSubmit }) => (
                        <View style={commonStyles.flex1}>
                            <ScrollView
                                keyboardShouldPersistTaps="handled"
                                contentContainerStyle={{ paddingBottom: s(150) }}
                            >
                                <Container style={commonStyles.container}>
                                    <View style={[commonStyles.mb20, commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap24]}>
                                        <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10]}>
                                            <TouchableOpacity onPress={handleBackPress} style={[commonStyles.mt4]} >
                                                <AntDesign name="arrowleft" size={s(24)} color={NEW_COLOR.TEXT_BLACK} />
                                            </TouchableOpacity>
                                            <ParagraphComponent
                                                text="Enter verification code"
                                                style={[commonStyles.fs20, commonStyles.fw800, commonStyles.textBlack]}
                                            />
                                        </View>
                                    </View>

                                    {errorMsg && <ErrorComponent message={errorMsg} onClose={handleCloseError} />}
                                    <ParagraphComponent>
                                        <ParagraphComponent style={[commonStyles.fs14, commonStyles.textpara, commonStyles.fw600]}
                                            text={`Code has been sent to `}></ParagraphComponent>
                                        <ParagraphComponent style={[commonStyles.textAlwaysWhite, commonStyles.fs16]} text={`${decryptedEmail} `}></ParagraphComponent>
                                        <ParagraphComponent style={[commonStyles.fs14, commonStyles.textpara, commonStyles.fw600]}
                                            text={`enter the code sent to your email address`}></ParagraphComponent>
                                    </ParagraphComponent>

                                    <View style={[commonStyles.mb32]} />
                                    <LabelComponent
                                        text={"Email OTP"}
                                        style={[commonStyles.mb10]}
                                        Children={<LabelComponent style={[commonStyles.textError]} text={REGISTRATION_CONSTATNTS.REQUIRED_STAR} />}
                                    />
                                    <Field
                                        name="emailOTP"
                                        component={DefaultOtpInput}
                                        error={errorMsg}
                                        length={6}
                                        onChangeText={(text: any) => {
                                            setErrorMsg('');
                                            setFieldValue('emailOTP', text);
                                        }}
                                        containerStyle={[commonStyles.gap20, commonStyles.mt10]}
                                    />

                                    <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.mt10, commonStyles.justifyCenter]}>
                                        <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw600, commonStyles.textBlack]} text={'Did not get the code? '} />
                                        {(resendTimer > 0) 
                                            ? <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw600, commonStyles.textOrange,]} text={`Resend OTP in ${formattedTimer}`} />
                                            : (<TouchableOpacity onPress={() => handleResendOtp(setFieldValue)}>
                                                <ParagraphComponent style={[commonStyles.fs16, commonStyles.fw600, commonStyles.textOrange,]} text={`Resend OTP`} />
                                            </TouchableOpacity>)
                                        }
                                    </View>
                                </Container>
                            </ScrollView>

                            <View style={[commonStyles.screenBg, commonStyles.mb30, commonStyles.p24]}>
                                <DefaultButton
                                    title={'Verify'}
                                    customTitleStyle={{ color: NEW_COLOR.TEXT_ALWAYS_WHITE }}
                                    onPress={handleSubmit}
                                    loading={isLoading}
                                />
                            </View>
                        </View>
                    )}
                </Formik>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default EmailOtpVerification;