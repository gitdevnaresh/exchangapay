import React, { useState } from 'react';
import { StyleService, useStyleSheet } from "@ui-kitten/components";
import { Checkbox, Container } from "../../components";
import { View, ScrollView, SafeAreaView, TouchableOpacity, Text } from "react-native";
import { s } from "../../constants/theme/scale";
import { NEW_COLOR } from "../../constants/theme/variables";
import DefaultButton from "../../components/DefaultButton";
import { isErrorDispaly } from '../../utils/helpers';
import ErrorComponent from '../../components/Error';
import { useDispatch, useSelector } from 'react-redux';
import { CommonActions, useNavigation } from "@react-navigation/native";
import { commonStyles } from '../../components/CommonStyles';
import ParagraphComponent from '../../components/Paragraph/Paragraph';
import LabelComponent from '../../components/Paragraph/label';
import AntDesign from 'react-native-vector-icons/AntDesign';
import AuthService from '../../services/auth';
import { SvgUri } from 'react-native-svg';
import TextInputField from '../../components/textInput';
import { EMAIL_CONSTANTS, REFERRAL_CONSTANTS } from './constants';
import useMemberLogin from '../../hooks/useMemberLogin';
import { isLogin, loginAction, setUserInfo } from '../../redux/Actions/UserActions';
import DeviceInfo from 'react-native-device-info';
import { fcmNotification } from '../../utils/FCMNotification';
import { useAuth0 } from 'react-native-auth0';
import CommonPopup from '../../components/commonPopup';
import useEncryptDecrypt from '../../hooks/useEncryption_Decryption';
import OnBoardingService from '../../services/onBoardingservice';
import * as Keychain from "react-native-keychain";


const RigistrationReferral = () => {
    const styles = useStyleSheet(themedStyles);
    const [errormsg, setErrormsg] = useState<string>("");
    const userprofile = useSelector((state: any) => state.UserReducer?.userInfo);
    const navigation = useNavigation<any>();
    const [saveLoading, setSaveLoading] = useState<boolean>(false);
    const [customerName, setCustomerName] = useState<string>("");
    const [referralCode, setReferralCode] = useState<string | number>("");
    const [requiredMsg, setRequiredMsg] = useState("");
    const [isValid, setIsValid] = useState<any>(null);
    const { getMemDetails } = useMemberLogin();
    const { clearSession } = useAuth0();
    const dispatch = useDispatch();
    const [popupVisible, setPopupVisible] = useState<boolean>(false);
    const [referral, setReferral] = useState<any>({
        isReferralMandatory: userprofile?.isReferralMandatory,
        haveReferralCode: false,
        isReferralEditable: true,
        isContinuePressed: false
    });
    const { encryptAES, decryptAES } = useEncryptDecrypt();


    const validateReferralCode = async (cleanedValue: any) => {
        let referralText = cleanedValue?.toLowerCase();
        const body = {
            referralCode: encryptAES(referralText || referralCode),
        }
        try {
            const response: any = await AuthService.getIsrefferalValid(body, userprofile?.customerType);

            if (response.ok) {
                setIsValid(response?.data?.isValidReferral);
                setCustomerName(response?.data?.customerName)
                setErrormsg("");
            } else {
                setIsValid(false);
                setErrormsg(isErrorDispaly(response))
            }

        } catch (error: any) {
            setErrormsg(isErrorDispaly(error))
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


    const handleNavigateDashboard = async () => {
        setSaveLoading(true);
        if (referral?.isReferralMandatory && (!referralCode || referralCode.trim() === "")) {
            setSaveLoading(false);
            setRequiredMsg(REFERRAL_CONSTANTS.IS_REQUIRED);
            return;
        }
        if ((referralCode) && referralCode?.length < 10) {
            setSaveLoading(false);
            setRequiredMsg(REFERRAL_CONSTANTS.PLEASE_PROVIDE_VALID_REFERRAL_CODE);
            return;
        } if ((referralCode && !isValid)) {
            setSaveLoading(false);
            setRequiredMsg(REFERRAL_CONSTANTS.PLEASE_PROVIDE_VALID_REFERRAL_CODE);
            return;
        }
        if (referral?.haveReferralCode && !referralCode) {
            setSaveLoading(false);
            setPopupVisible(true);
            return;
        }
        await updateReferralCode();
    };

    const updateReferralCode = async () => {
        setSaveLoading(false);
        const body = {
            referralCode: encryptAES(referralCode ? referralCode : "")
        }
        try {
            const response: any = await AuthService.putReferralCode(body, referral?.haveReferralCode);
            if (response.ok) {
                getMemDetails({});
            } else {
                setErrormsg(isErrorDispaly(response));
            }
        } catch (error: any) {
            setErrormsg(isErrorDispaly(error));
        } finally {
            setSaveLoading(false);
        }
    };


    const onChangeText = (value: any) => {
        const cleanedValue = value.replace(/[^a-zA-Z0-9]/g, "")?.toUpperCase();
        setIsValid(null);
        setErrormsg("")
        setReferralCode(cleanedValue);
        setRequiredMsg("")
        if (cleanedValue.length >= 10) {

            validateReferralCode(cleanedValue);
        }
    };

    const handleCloseError = () => {
        setErrormsg("")
    };
    const handleReferralCheck = () => {
        setErrormsg("");
        setReferralCode("");
        setReferral((prev: any) => ({
            ...prev, isReferralMandatory: !referral?.isReferralMandatory, haveReferralCode: !referral?.haveReferralCode,
            isReferralEditable: !referral?.isReferralEditable
        }))
        setRequiredMsg("");
        setIsValid(null);
        setCustomerName("")
    }


    const handleCancel = () => {
        setPopupVisible(false);
        setReferral((prev: any) => ({
            ...prev, isReferralMandatory: userprofile?.isReferralMandatory, haveReferralCode: false,
            isReferralEditable: true
        }))
    };
    const handleClearCode = () => {
        setReferralCode("");
        setIsValid(null);
        setCustomerName("");
        setRequiredMsg("")
    }
    return (
        <SafeAreaView style={[commonStyles.screenBg, commonStyles.flex1]}>
            <ScrollView keyboardShouldPersistTaps={REFERRAL_CONSTANTS.HANDLED}>
                <Container style={commonStyles.container}>
                    <View style={[commonStyles.mb24, commonStyles.mt8]}>
                        <View>
                            <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.mxAuto]}>

                                <View >
                                    <SvgUri
                                        uri={"https://swokistoragespace.blob.core.windows.net/images/logox_orange.svg"}
                                        width={s(61)}
                                        height={s(55)}
                                    />
                                </View>
                                <ParagraphComponent text={REFERRAL_CONSTANTS.EXCHANGA_PAY} style={[commonStyles.fs32, commonStyles.fw800, commonStyles.textOrange, commonStyles.textCenter]} />
                            </View>
                        </View>
                    </View>
                    <View >
                        <ParagraphComponent style={[commonStyles.fs24, commonStyles.textBlack, commonStyles.fw600, commonStyles.textCenter]} text={REFERRAL_CONSTANTS.HAVE_A_REFERRAL_CODE} />
                    </View>
                    <View style={[commonStyles.mb32]} />
                    {errormsg && <ErrorComponent message={errormsg} onClose={handleCloseError} />}
                    <View style={[commonStyles.mb32]} />

                    <View style={[NEW_COLOR.SCREENBG_WHITE, commonStyles?.rounded16, commonStyles.mt16, commonStyles.px16]}>
                        <LabelComponent text={REFERRAL_CONSTANTS.REFERRAL_CODE} Children={<LabelComponent style={[commonStyles.textRed]} text={referral?.isReferralMandatory ? ' *' : " "} />} />
                        <View style={[commonStyles.relative, !referral?.isReferralEditable && commonStyles?.disabledBg, { borderRadius: s(10) }]}>
                            {isValid === true && <AntDesign style={[styles.referralCheck]} name={REFERRAL_CONSTANTS.CHECK_CIRCLE} size={(s(24))} color={NEW_COLOR.BG_GREEN} />}
                            {isValid === false && <AntDesign style={[styles.referralCheck]} name={REFERRAL_CONSTANTS.CLOSE_CIRCLEO} size={s(24)} color={NEW_COLOR.TEXT_RED} onPress={handleClearCode} />}
                            <TextInputField
                                editable={referral?.isReferralEditable}
                                style={{ backgroundColor: commonStyles.bgBlack, paddingRight: 46, }}
                                placeholder={REFERRAL_CONSTANTS.ENTER_YOUR_REFFERAL_CODE}
                                value={referralCode}
                                inputStyle={{
                                    backgroundColor: referral?.isReferralEditable
                                        ? commonStyles?.disabledBg
                                        : 'transparent',
                                    borderRadius: 50,


                                }}
                                onChangeText={onChangeText}
                            />
                        </View>

                        <View style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter]}>
                            <View>
                                {typeof requiredMsg === "string" && <ParagraphComponent text={requiredMsg} style={[commonStyles.textRed]} />}

                            </View>
                            <View>
                                {(typeof customerName === "string" && isValid) && <ParagraphComponent text={decryptAES(customerName)} style={{ color: NEW_COLOR.BG_GREEN }} />}
                            </View>
                        </View>

                    </View>
                    <View style={[commonStyles.dflex, commonStyles.gap12, commonStyles.px16, commonStyles.mt8]}>
                        <TouchableOpacity onPress={handleReferralCheck} activeOpacity={0.7}>
                            <Checkbox size={s(20)} checked={referral?.haveReferralCode} activeColor={NEW_COLOR.TEXT_BLACK} color={NEW_COLOR.TEXT_BLACK} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleReferralCheck} activeOpacity={0.7}>
                            <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw400, styles.text, commonStyles?.textCenter]} text="I don't have referral code" />
                        </TouchableOpacity>
                    </View>
                    <View style={[commonStyles.mb43]} />
                </Container>
            </ScrollView>
            <View style={[commonStyles.p24]}>
                <DefaultButton
                    title={REFERRAL_CONSTANTS.CONSTINUE}
                    customTitleStyle={{ color: NEW_COLOR.TEXT_ALWAYS_WHITE }}
                    onPress={handleNavigateDashboard}
                    style
                    disable={saveLoading}
                    loading={saveLoading}
                />
                <View style={[commonStyles.mb16]} />
                <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter]}>
                    <TouchableOpacity onPress={handleLgout} style={[commonStyles.px10]} disabled={saveLoading} >
                        <Text style={[commonStyles.textCenter, commonStyles.textOrange, commonStyles.fs16, commonStyles.fw600]}>{EMAIL_CONSTANTS.LOG_OUT}</Text>
                    </TouchableOpacity>

                </View>



            </View>
            <CommonPopup
                isVisible={popupVisible}
                handleClose={() => setPopupVisible(false)}
                backdropStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.40)' }}
                content={
                    <ParagraphComponent
                        style={[commonStyles.fs16, commonStyles.fw500, commonStyles.textpara, commonStyles.textCenter]}
                        text="Do you want to proceed without a referral code?"
                    />
                }
                buttonName="Proceed"
                onButtonPress={() => {
                    setPopupVisible(false);
                    updateReferralCode();
                }}
                isCancelRequired={true}
                cancelButtonName="Cancel"
                onCancelPress={handleCancel}
            />
        </SafeAreaView >

    );
};

export default RigistrationReferral;

const themedStyles = StyleService.create({
    referralCheck: {
        position: "absolute",
        right: 16, top: 16, zIndex: 1,
    },
    ml12: {
        marginLeft: 12,
    },
    arrowposition: {
        position: "absolute", right: 8, top: 30,
    },
    ml8: {
        marginLeft: 8
    },
    mb6: {
        marginBottom: 6,
    },
    inputStyle: {
        borderColor: NEW_COLOR.INPUT_BORDER,
        borderWidth: 1,
        color: NEW_COLOR.TEXT_BLACK, borderRadius: 12,
        paddingLeft: 14, paddingRight: 14,
        minHeight: 54
    }, userName: {
        margin: 4
    },
    text: {
        color: NEW_COLOR.TEXT_LABEL,

    }
});