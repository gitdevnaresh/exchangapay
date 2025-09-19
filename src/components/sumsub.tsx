import SNSMobileSDK from '@sumsub/react-native-mobilesdk-module';
import OnBoardingService from '../services/onBoardingservice';
import { useDispatch, useSelector } from 'react-redux';
import { Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CommonActions, useIsFocused, useNavigation } from '@react-navigation/native';
import { useEffect, useRef, useState } from 'react';
import Container from './Container';
import { isErrorDispaly } from '../utils/helpers';
import { ScrollView } from 'react-native-gesture-handler';
import ErrorComponent from './Error';
import ParagraphComponent from './Paragraph/Paragraph';
import { commonStyles } from './CommonStyles';
import DefaultButton from './DefaultButton';
import { WINDOW_HEIGHT } from '../constants/theme/variables';
import { EMAIL_CONSTANTS } from '../screens/onBoarding/constants';
import { useAuth0 } from 'react-native-auth0';
import { isCardKycCompleted, isLogin, loginAction, setUserInfo } from '../redux/Actions/UserActions';
import { fcmNotification } from '../utils/FCMNotification';
import DeviceInfo from 'react-native-device-info';
import AuthService from '../services/auth';
import useEncryptDecrypt from '../hooks/useEncryption_Decryption';
import useSendUserWebhook from '../hooks/useSendUserWebhook';
import * as Keychain from "react-native-keychain";

const SumsubCompnent = (props: any) => {
    const navigation = useNavigation<any>();
    const isFocused = useIsFocused();
    const [errorMsg, setErrorMsg] = useState<any>("");
    const userInfo = useSelector((state: any) => state.UserReducer?.userInfo);
    const sdkInstance = useRef<any>(null);
    const [isDismissed, setIsDismissed] = useState<boolean>(false);
    const { clearSession } = useAuth0();
    const [isCompleted, setIsCompleted] = useState<boolean>(false);
    const dispatch = useDispatch();
    const { decryptAES } = useEncryptDecrypt();
    const decryptedEmail = decryptAES(userInfo?.email);
    const decryptedPhone = decryptAES(userInfo?.phoneNumber);
    const decryptedPhoneCode = decryptAES(userInfo?.phonecode);
    const decryptedFirstName = decryptAES(userInfo?.firstName);
    const decryptedLastName = decryptAES(userInfo?.lastName);
    const { sendWebhook } = useSendUserWebhook();
    useEffect(() => {
        if (isFocused) {
            launchSNSMobileSDK()
            setIsDismissed(false)
        }
    }, [isFocused])

    const isSumsubCompleted = async () => {
        setIsDismissed(false)
        try {
            const response = await OnBoardingService.sumsubCompleted();
            if (response?.ok) {
                getMemberDetails();
                await sendWebhook("Update")

            }
        } catch (error) {
        }
    }

    const getMemberDetails = async () => {
        try {
            const userLoginInfo: any = await AuthService.getMemberInfo();
            setIsDismissed(false)
            const userDetails = userLoginInfo?.data;
            if (userLoginInfo?.status === 200) {
                dispatch(setUserInfo(userDetails))
                dispatch(isCardKycCompleted(true))
            };
            await sendWebhook("Update")

        } catch (error) {

        }
    }





    const launchSNSMobileSDK = async () => {
        try {
            const response = await OnBoardingService.sumsubAccessToken(userInfo.userId, props?.route?.params?.cardKycLevl || userInfo?.kycLevel);
            if (response?.ok) {
                sdkInstance.current = SNSMobileSDK.init(response?.data?.token, () => {
                    return fetch('http://example.org/', {
                        method: 'GET',
                    }).then(resp => {
                        return 'new_access_token';
                    });
                })
                    .withHandlers({
                        onStatusChanged: (event) => {
                        },
                        onLog: (event) => {
                        },
                        onEvent: (event) => {
                            if (event?.payload?.eventName === "msdk:dismiss" || event?.payload?.eventName === "msdk:ui:applicantDataScreen:close") {
                                sdkInstance.current = null;
                                // setIsDismissed(true);
                                SNSMobileSDK.reset();
                                if (props?.route?.params?.screenName === "ApplyCard") {
                                    return (navigation.navigate("ApplyExchangaCard", {
                                        cardId: props?.route?.params?.cardId,
                                        logo: props?.route?.params?.logo,
                                        cardType: props?.route?.params?.cardType,
                                        cardKycLevl: props?.route?.params?.cardKycLevl,
                                    }));
                                }
                            }
                        }
                    })
                    .withDebug(true)
                    .withLocale('en')
                    .withApplicantConf(
                        {
                            "firstName": decryptedFirstName || null,
                            "lastName": decryptedLastName || null,
                            "email": decryptedEmail || null,
                            "phone": decryptedPhoneCode + " " + decryptedPhone || null,
                            "country": userInfo?.country,
                            "date of birth": userInfo?.dob

                        }

                    )
                    .build();

                sdkInstance.current.launch().then(result => {
                    if (result?.status === "success" || result?.status === "Approved") {
                        setIsCompleted(true);
                        setIsDismissed(false);

                        isSumsubCompleted();
                        if (props?.route?.params?.screenName === "ApplyCard") {
                            return (navigation.navigate("ApplyExchangaCard", {
                                cardId: props?.route?.params?.cardId,
                                logo: props?.route?.params?.logo,
                                cardType: props?.route?.params?.cardType,
                                cardKycLevl: props?.route?.params?.cardKycLevl,
                            }))
                        } else {
                            if ((!userInfo.isKYC) || (userInfo?.customerState !== "Approved")) {

                                return (navigation.dispatch(
                                    CommonActions.reset({
                                        index: 1,
                                        routes: [{ name: "underReview" }],
                                    })
                                ))
                            } else {
                                return (navigation.dispatch(
                                    CommonActions.reset({
                                        index: 1,
                                        routes: [{ name: "Dashboard", params: { isUserUpdate: true } }],
                                    })
                                ))
                            }

                        }
                    } else {
                        setIsDismissed(true);

                    }

                }).catch(error => {
                    let errorMsg = error.toString()
                    setErrorMsg(errorMsg);
                });
            } else {
                setErrorMsg(isErrorDispaly(response));
            }
        } catch (error: any) {
            let errorMsg = error.toString()
            setErrorMsg(errorMsg);
        }
    };

    const handleCloseError = () => {
        setErrorMsg("");
    };

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

    }
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

    return (
        <SafeAreaView style={[commonStyles.flex1, commonStyles.screenBg]}>
            <Container style={commonStyles.container}>
                <ScrollView >
                    <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter, commonStyles.flex1, { height: WINDOW_HEIGHT * 0.8 }]}>
                        <View style={{ width: "100%" }}>
                            {(isDismissed && !isCompleted && props?.route?.params?.screenName !== "ApplyCard") && <View >
                                {errorMsg && <ErrorComponent message={errorMsg} onClose={handleCloseError} />}

                                <Image style={[commonStyles.mxAuto, commonStyles.mb16]} source={require("../assets/images/kycimgage.png")} />
                                <ParagraphComponent text={"Click here to complete KYC"} style={[commonStyles.fs20, commonStyles.textBlack, commonStyles.fw600, commonStyles.mb24, commonStyles.textCenter]} />
                                <DefaultButton
                                    title={"Continue"}
                                    icon={undefined}
                                    onPress={launchSNSMobileSDK}
                                    style={undefined}
                                    customContainerStyle={undefined}
                                    backgroundColors={undefined}
                                    disable={undefined}
                                    loading={undefined}
                                    colorful={undefined}
                                    iconArrowRight={false}

                                    transparent={undefined}
                                />
                                <View style={[commonStyles.mb24]} />
                                <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter]}>
                                    <TouchableOpacity onPress={handleLgout} style={[commonStyles.px10]} ><Text style={[commonStyles.textCenter, commonStyles.textOrange, commonStyles.fs16, commonStyles.fw600]}>{EMAIL_CONSTANTS.LOG_OUT}</Text></TouchableOpacity>
                                </View>

                            </View>}
                        </View>
                    </View>
                </ScrollView>
            </Container>
        </SafeAreaView>

    )
}
export default SumsubCompnent;

const styles = StyleSheet.create({
    successCard: {
        backgroundColor: "#1A171D",
        borderRadius: 15,
        paddingVertical: 80,
        paddingHorizontal: 30,
        textAlign: "center",
    },
    container: {
        flex: 1,
        backgroundColor: "#000000",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 16,
    },
})