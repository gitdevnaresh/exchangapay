import React, { useEffect, useState } from 'react';
import { StyleService, useStyleSheet, Text } from "@ui-kitten/components";
import { Container } from "../../components";
import { View, TouchableOpacity } from 'react-native';
import { ActivityIndicator } from 'react-native';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { ms, screenHeight } from '../../constants/theme/scale';
import Timer from '../../components/timer';
import OnBoardingService from '../../services/onBoardingservice';
import ErrorComponent from '../../components/Error';
import { isErrorDispaly } from '../../utils/helpers';
import DefaultButton from '../../components/DefaultButton';
import { useDispatch } from 'react-redux';
import AuthService from '../../services/auth';
import { setUserInfo } from '../../redux/Actions/UserActions';

const VerifyMobile = () => {
    const styles = useStyleSheet(themedStyles);
    const [showTimer, setShowTimer] = useState<boolean>(false);
    const navigation = useNavigation();
    const [errorMsg, setErrorMsg] = useState<string>('');
    const [sendLoader, setSendLoader] = useState<boolean>(false);
    const [verifyLoader, setVerifyLoader] = useState<boolean>(false);
    const [otpValue, setOTPValue] = useState<any>(false);
    const dispatch = useDispatch();
    useEffect(() => {
        resendMobile('send')
    }, [])
    const resendMobile = async (type: string) => {
        setSendLoader(true)
        const sendRes = await OnBoardingService.sendMobileCode(type)
        if (sendRes.status === 200) {
            setSendLoader(false)
            setShowTimer(true)
        } else {
            setSendLoader(false)
            setErrorMsg(isErrorDispaly(sendRes))
        }
    }
    const verifyOtp = async () => {
        if (otpValue.length < 6) {
            return setErrorMsg('Invalid Code');
        }
        setVerifyLoader(true);
        const sendRes = await OnBoardingService.verifyMobileCode(otpValue)
        if (sendRes.status === 200) {
            updateUserInfo();
        } else {
            setVerifyLoader(false)
            setErrorMsg(isErrorDispaly(sendRes));
        }
    }
    const updateUserInfo = () => {
        AuthService.getMemberInfo().then((userLoginInfo: any) => {
            if (userLoginInfo.data.isPhoneNumberVerified) {
                navigation.dispatch(
                    CommonActions.reset({
                        index: 1,
                        routes: [{ name: "AccountProgress" }],
                    })
                );
            }
            dispatch(setUserInfo(userLoginInfo.data));
            setVerifyLoader(false);
        }).catch((error) => {
            console.error(`onRejected function called: ${error.message}`);
            setVerifyLoader(false);
        })
    }

    return (
        <Container style={styles.container}>
            <View style={styles.content}>

                <View style={[styles.greybg]}>
                    <View style={[styles.p16]}>
                        {errorMsg && <ErrorComponent message={errorMsg} onClose={() => setErrorMsg('')} />}
                        <Text style={[styles.textSuccess]}>
                            Mobile number verification
                        </Text>
                        <Text style={styles.declarationText}>We take the security of our user's data seriouly. to protectour form
                            fraud and abuse, we require you to please verify your mobile number.
                        </Text>
                        <View style={[styles.dflex, styles.justifyCenter, styles.mx36]}>
                        </View>
                        <View style={[styles.mt26]}>
                            <DefaultButton
                                title={"Verify"}
                                customTitleStyle={styles.btnConfirmTitle}
                                onPress={verifyOtp}
                                icon={undefined}
                                style={undefined}
                                customButtonStyle={undefined}
                                customContainerStyle={undefined}
                                backgroundColors={undefined}
                                disable={verifyLoader}
                                loading={verifyLoader}
                                colorful={undefined}
                                transparent={undefined}
                            />
                        </View>
                        <Text style={styles.declarationText}>Didn't receive the code?.
                        </Text>
                        {sendLoader && <><ActivityIndicator size='small' style={styles.loading} color={styles.WHITE} /></>}
                        {!sendLoader && <TouchableOpacity onPress={() => resendMobile('resend')}><Text style={styles.resend}>Resend</Text></TouchableOpacity>}
                        {showTimer && <Timer seconds={30} timeEnd={() => setShowTimer(false)} />}
                    </View>
                </View>
            </View>

        </Container>
    );
};

export default VerifyMobile;

const themedStyles = StyleService.create({
    btnConfirmTitle: {
        textTransform: "uppercase",
        fontWeight: "700",
        fontSize: 15, color: "#000000"
    },
    resend: {
        textAlign: "center",
        color: "#4172F4"
    },
    loading: {
        paddingBottom: screenHeight * 0,
        paddingTop: ms(5),
    },
    declarationText: {
        fontSize: 16,
        fontWeight: "500",
        lineHeight: 32,
        color: "#B1B1B1",
        textAlign: "center",
    },
    textSuccess: {
        fontWeight: "600",
        fontSize: 34,
        lineHeight: 41,
        textAlign: "center",
        color: "#fff",
        marginTop: 30,
    },
    container: {
        flex: 1,
        backgroundColor: "#000000",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    content: {
        paddingHorizontal: 24,
        flex: 1,
    },
    mt26: {
        marginTop: 26
    },
    mx36: {
        marginVertical: 36,
    },
    justifyCenter: {
        justifyContent: "center",
    },
    greybg: {
        backgroundColor: "#1F1F22",
        flex: 1,
        borderTopRightRadius: 15,
        borderTopLeftRadius: 15,
    },
    p16: {
        padding: 16,
    },
    row: {
        flexDirection: "row"
    },
    dflex: {
        flexDirection: "row",
        alignItems: 'center',
    },
});

