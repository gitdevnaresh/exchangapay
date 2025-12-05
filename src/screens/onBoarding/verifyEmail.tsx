import React, { useState } from 'react';
import { View, Image, ScrollView, TouchableOpacity, ActivityIndicator, Linking } from 'react-native';
import { StyleService, useStyleSheet } from "@ui-kitten/components";
import { Container, Text } from "../../components";
import OnBoardingService from '../../services/onBoardingservice';
import { isErrorDispaly } from '../../utils/helpers';
import ErrorComponent from '../../components/Error';
import { ms, s, screenHeight } from '../../constants/theme/scale';
import { useDispatch, useSelector } from 'react-redux';
import AuthService from '../../services/auth';
import { isLogin, loginAction, setUserInfo } from "../../redux/Actions/UserActions";
import { CommonActions, useNavigation } from "@react-navigation/native";
import DefaultButton from "../../components/DefaultButton";
import { commonStyles } from '../../components/CommonStyles';
import { fcmNotification } from '../../utils/FCMNotification';
import { useAuth0 } from 'react-native-auth0';
import DeviceInfo from 'react-native-device-info';
import ParagraphComponent from '../../components/Paragraph/Paragraph';
import { EMAIL_CONSTANTS, REGISTRATION_CONSTATNTS, USER_CONSTANTS } from './constants';
import useMemberLogin from '../../hooks/useMemberLogin';
import CommonPopup from '../../components/commonPopup';
import { SvgUri } from 'react-native-svg';
import * as Keychain from "react-native-keychain";
import useEncryptDecrypt from '../../hooks/useEncryption_Decryption';
import { NEW_COLOR } from '../../constants/theme/variables';
import { SafeAreaView } from 'react-native-safe-area-context';


const VerifyEmail = () => {
    const styles = useStyleSheet(themedStyles);
    const [errorMsg, setErrorMsg] = useState<string>('');
    const [loadMail, setLoadMail] = useState<boolean>(false);
    const email = useSelector((state: any) => state.UserReducer?.userInfo?.email);
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const [btnLoader, setBtnLoader] = useState<boolean>(false);
    const [popupVisible, setPopupVisible] = useState<boolean>(false);
    const { clearSession } = useAuth0();
    const { getMemDetails } = useMemberLogin();
    const { decryptAES } = useEncryptDecrypt();


    const handleRefresh = async () => {
        await getMemDetails({});
        setPopupVisible(true);

    };
    const resendMail = async () => {
        setLoadMail(true)
        try {
            const verifyMailsend = await OnBoardingService.resendVerifyMail();
            if (verifyMailsend.status === 200) {
                setLoadMail(false)

            } else {
                setErrorMsg(isErrorDispaly(verifyMailsend));
                setLoadMail(false);
            }
        } catch (error) {
            setErrorMsg(isErrorDispaly(error));
            setLoadMail(false);
        }

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
        await logOutLogData();
        const response = OnBoardingService.updateFcmToken();
        await Keychain.setGenericPassword("authToken", JSON.stringify({ token: "", expiryTime: "", refresh_token: "" }), {
            service: "authTokenService",
        }),
            navigation.dispatch(
                CommonActions.reset({
                    index: 1,
                    routes: [{ name: EMAIL_CONSTANTS.SPLASH_SCREEN }],
                })
            );
        fcmNotification.unRegister();


    };

    const handleCloseError = () => {
        setErrorMsg('')
    };
    const handleClosePopup = () => {
        setPopupVisible(false)
    };

    return (
        <SafeAreaView style={[commonStyles.flex1, commonStyles.screenBg]}>
            <Container style={commonStyles.container}>
                <ScrollView>
                    {errorMsg && <ErrorComponent message={errorMsg} onClose={handleCloseError} />}

                    <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.mxAuto, commonStyles.mb43]}>
                        <SvgUri
                            uri={"https://swokistoragespace.blob.core.windows.net/images/logox_orange.svg"}
                            width={s(61)}
                            height={s(55)}
                        />
                        <ParagraphComponent
                            text={REGISTRATION_CONSTATNTS.EXCHANGA_PAY}
                            style={[commonStyles.fs32, commonStyles.fw800, commonStyles.textOrange, commonStyles.textCenter]}
                        />
                    </View>
                    <ParagraphComponent style={[commonStyles.fs20, commonStyles.fw800, commonStyles.textBlack, commonStyles.textCenter,]} text={'Email Verification In Progress'} />
                    <View style={[commonStyles.mb43]} />
                    <View style={[commonStyles.mt30]}>
                        <View style={[styles.textCenter, styles.auto, styles.dFlex, styles.justifyContentCenter,]}>
                            <Image
                                style={{ height: s(100), width: s(100) }}
                                source={{ uri: EMAIL_CONSTANTS.EXCHANGAPAY_LOGO }}
                            />


                        </View>
                        <ParagraphComponent style={[styles.textSuccess]} text={EMAIL_CONSTANTS.VERIFY_YOUR_EMAIL} />
                        <ParagraphComponent style={[commonStyles.fs16, commonStyles.fw400, commonStyles.textpara, commonStyles.textCenter]}
                            text="Verify your email to continue. We've sent a verification link to: "
                        />
                        <ParagraphComponent style={[commonStyles?.textBlack, commonStyles.fw800, commonStyles.textCenter, commonStyles.fs14]} text={decryptAES(email)}
                            onPress={() => {
                                const mail = decryptAES(email);
                                Linking.openURL(`mailto:${mail}`);
                            }}
                        />

                        <ParagraphComponent style={[commonStyles.fs16, commonStyles.fw400, commonStyles.textpara, commonStyles.textCenter]}
                            text="Please check your inbox and click the link to verify your email address. once you're done,tap the button below to continue"
                        />
                        <View style={{ minHeight: 30, justifyContent: 'center', alignItems: 'center' }}>
                            {loadMail &&
                                <ActivityIndicator size={EMAIL_CONSTANTS.SMALL} style={styles.loading} color={NEW_COLOR.BG_ORANGE} />
                            }
                            {!loadMail &&
                                <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter,]}>
                                    <TouchableOpacity onPress={resendMail} >
                                        <ParagraphComponent style={[styles.resend, commonStyles.textOrange, commonStyles.fs16, commonStyles.fw600]} text={EMAIL_CONSTANTS.RESEND} />
                                    </TouchableOpacity>
                                </View>
                            }
                        </View>

                        <View style={styles.mt26}>
                            <DefaultButton
                                title={USER_CONSTANTS?.CONFIRM_BUTTON}
                                onPress={handleRefresh}
                                icon={undefined}
                                style={undefined}
                                customButtonStyle={undefined}
                                customContainerStyle={undefined}
                                backgroundColors={undefined}
                                colorful={undefined}
                                transparent={undefined}
                                disable={undefined}
                                loading={btnLoader}
                            />

                            <View style={commonStyles.mt14} />
                            <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter]}>
                                <TouchableOpacity onPress={handleLgout} style={[commonStyles.px10]} disabled={btnLoader}>
                                    <ParagraphComponent style={[styles.resend, commonStyles.textOrange, commonStyles.fs16, commonStyles.fw600]} text={EMAIL_CONSTANTS.LOG_OUT} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </ScrollView>
                <CommonPopup
                    isVisible={popupVisible}
                    handleClose={handleClosePopup}
                    title="Email Not Verified Yet"
                    content={
                        <View>
                            <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textpara, commonStyles.textCenter]} text={"We couldn't confirm your email verification. Please check your inbox for the link we sent to "} />
                            <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw800, commonStyles.textBlack, commonStyles.textCenter]} text={decryptAES(email)} />
                            <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textpara, commonStyles.textCenter]} text={"and click it to verify your address. Didn't get the email? You can resend it below. "} />

                        </View>
                    }
                    buttonName="Continue"
                    onButtonPress={handleClosePopup}
                />

            </Container>
        </SafeAreaView>
    );
};

export default VerifyEmail;

const themedStyles = StyleService.create({
    mt26: { marginTop: 26, },
    yblogo: {
        marginRight: "auto",
        marginLeft: "auto",
    },
    btnset: {
        marginTop: 50,
    },
    container: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 16,
    },
    button: {
        marginBottom: 24,
        borderRadius: 5,
    },
    content: {
        paddingHorizontal: 24,
        flex: 1,
    },
    p16: {
        padding: 16,
    },
    textBlue: {
        color: "#0F85EE",
    },
    btnConfirmTitle: {
        textTransform: 'uppercase',
        fontWeight: '700',
        fontSize: 15,
        color: "#000000",
    },
    justifyContentCenter: {
        justifyContent: "center",
    },
    dFlex: {
        flexDirection: "row",
        alignItems: 'center',
    },
    mt80: {
        marginTop: 80,
    },
    mb25: {
        marginVertical: 25,
    },
    textWhite: {
        color: "#fff",
    },
    bottomSpace: {
        marginBottom: 20,
    },
    declarationText: {
        lineHeight: 24,
    },
    auto: {
        marginVertical: "auto",
        marginHorizontal: "auto",
    },
    textSuccess: {
        fontWeight: "600",
        fontSize: 34,
        lineHeight: 41,
        textAlign: "center",
        color: "#fff",
        marginTop: 30,
    },
    textCenter: {
        textAlign: "center",
    },
    successCard: {
        backgroundColor: "#1A171D",
        borderRadius: 15,
        paddingVertical: 80,
        paddingHorizontal: 30,
        textAlign: "center",
    },
    loading: {
        paddingBottom: screenHeight * 0,
        paddingTop: ms(5),
    },
    resend: {
        textAlign: "center",
    },
    continueButton: {
        backgroundColor: "#4172F4", borderRadius: 5, height: 50, fontSize: 18, fontWeight: "500", color: "#000", marginTop: 40, marginBottom: 10,
    },
});
