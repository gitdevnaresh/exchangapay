import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from "react-redux";
import { View, Clipboard } from 'react-native';
import { formatCurrency, isErrorDispaly } from '../../../../../utils/helpers';
import ErrorComponent from '../../../../../components/errorDisplay/errorDisplay';
import { getThemedCommonStyles } from '../../../../../components/CommonStyles';
import { useIsFocused } from '@react-navigation/native';
import CopyCard from '../../../../../components/copyIcon/CopyCard';
import SendOTP from '../../../../../components/sendPhoneOtp';
import EmailOTP from '../../../../../components/EmailOTP';
import TransactionService from '../../../../../apiServices/common/transaction';
import { TransactionDetails } from '../feeinterfaces';
import useEncryptDecrypt from '../../../../../hooks/encDecHook';
import { useThemeColors } from '../../../../../hooks/themedHook/useThemeColors';
import ButtonComponent from '../../../../../components/buttons/button';
import TextMultiLangauge from '../../../../../components/textComponets/multiLanguageText/textMultiLangauge';
import { s } from '../../../../../constants/styels/scale';
import ParagraphComponent from '../../../../../components/textComponets/paragraphText/paragraph';
import { ProfileGeneralServices } from '../../../../../apiServices/profile/general';

const MembershipUpgradePreview = React.memo((props: any) => {
    const customerId = useSelector((state: any) => state.userReducer?.userDetails);
    const [errormsg, setErrormsg] = useState(null)
    const isFocuced = useIsFocused();
    const [verficationFeild, setVerficationFeild] = useState<any>({});
    const [otp, setOtp] = useState<string>('');
    const [isOTP, setIsOTP] = useState<boolean>(false);
    const [emailOtp, setEmailOtp] = useState<string>('');
    const [isEmailOTP, setIsEmailOTP] = useState<boolean>(false);
    const [isEmailOTPVerified, setIsEmailOTPVerified] = useState<boolean>(false);
    const [showOtpError, setShowOtpError] = useState(false);
    const [showEmailOtpError, setShowEmailOtpError] = useState<boolean>(false);
    const [bottonLoader, setBottonLoader] = useState<boolean>(false);
    const { decryptAES } = useEncryptDecrypt();
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    useEffect(() => {
        getVerfication();
    }, [props?.route?.params?.data?.coinFullName, isFocuced]);
    const getVerfication = async () => {
        setErrormsg(null);
        try {
            const response: any = await TransactionService.getVerficationData();
            if (response) {
                setVerficationFeild(response?.data)
                setErrormsg(null);
            }
            else {
                setErrormsg(isErrorDispaly(response));
            }
        } catch (error) {
            setErrormsg(isErrorDispaly(error));
        }
    }
    const saveSuccess = async () => {
        setBottonLoader(true);
        if ((verficationFeild?.isPhoneVerified === true && !otp) || (verficationFeild?.isEmailVerification === true && !emailOtp)) {
            setShowOtpError(true);
            setIsOTP(true);
            setShowEmailOtpError(true);
            setIsEmailOTP(true);
            setBottonLoader(false)
        }
        else if (!otp && verficationFeild?.isPhoneVerified === true) {
            setShowOtpError(true);
            setIsOTP(true);
            setBottonLoader(false)
            return;
        }
        else if (verficationFeild?.isEmailVerification === true &&
            (!emailOtp || !isEmailOTPVerified)) {
            setBottonLoader(false)
            setShowEmailOtpError(true);
            setIsEmailOTP(true);
            return;
        }

        else {
            setIsEmailOTP(false);
            setShowEmailOtpError(false);
            setIsOTP(false);
            setShowOtpError(false);
            const PostObject: TransactionDetails = {
                cryptoWalletId: props?.route?.params?.networkId,
                membershipId: props?.route?.params.membershipId,
            }
            try {
                const response: any = await ProfileGeneralServices.getMembershipUpgrade(PostObject);
                if (response?.ok) {
                    setBottonLoader(false);
                    if (props.onPreviewSubmitSuccess) { // New prop to signal parent
                        props.onPreviewSubmitSuccess();
                    }
                } else {
                    setErrormsg(isErrorDispaly(response));
                    setBottonLoader(false);
                }
            } catch (error) {
                setErrormsg(isErrorDispaly(error));
                setBottonLoader(false);
            }
        }
    };
    const handleCloseError = useCallback(() => {
        setErrormsg(null);
    }, []);
    const copyToClipboard = () => {
        Clipboard.setString(props?.route?.params?.data?.address);
    }
    const checkValidationNumber = (newValue: any) => {
        const format = /[ `!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]/;
        const result = format.test(newValue.toString());
        if (result) {
            return '';
        }
        return newValue;
    };
    const handleReceiveOTP = (text: any) => {
        if (text.toString().length > 6) {
            return '';
        }
        const isValid = checkValidationNumber(text);
        setOtp(isValid);
    };
    const handleReceiveEmailOTP = (text: any) => {
        if (text.toString().length > 6) {
            return '';
        }
        const isValid = checkValidationNumber(text);
        setEmailOtp(isValid);
    };
    return (
        <View>
            {errormsg && <ErrorComponent message={errormsg} onClose={handleCloseError} />}
            <View>
                <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent]}>
                    <TextMultiLangauge style={[commonStyles.fs14, commonStyles.textlinkgrey, commonStyles.fw500,]} text={"GLOBAL_CONSTANTS.EXCHANGE_RATE"} />
                    <ParagraphComponent style={[commonStyles.fs16, commonStyles.textWhite, commonStyles.fw600, commonStyles.textCenter]} text={`1${' '}${props?.route?.params?.data?.coin}${' = '}${' '}${formatCurrency(props?.route?.params?.data?.exchangeRate || 0, 2)}${' '}${customerId?.currency}`} />
                </View>
                <View style={[commonStyles.listGap]} />

                <View>
                    <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent]}>
                        <TextMultiLangauge style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textlinkgrey]} text={"GLOBAL_CONSTANTS.AMOUNT"} />
                        <ParagraphComponent style={[commonStyles.fs16, commonStyles.fw600, commonStyles.textWhite]} text={`${formatCurrency(props?.route?.params?.data?.amount || 0, 2)}${' '}${props?.route?.params?.data?.coin}`} />
                    </View>
                    <View style={[commonStyles.listGap]} />
                    <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent]}>
                        <ParagraphComponent text={"GLOBAL_CONSTANTS.RECEIVE_ADDRESS"} style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textlinkgrey]} />
                        <View style={[commonStyles.dflex, commonStyles.gap6]}>

                            <ParagraphComponent
                                text={props?.route?.params?.data.address || "--"}
                                style={[commonStyles.fs16, commonStyles.fw600, commonStyles.textWhite, commonStyles.textRight, { width: s(180) }]} numberOfLines={4}
                            />
                            <View><CopyCard onPress={copyToClipboard} /></View>
                        </View>
                    </View>

                    <View style={[commonStyles.listGap]} />
                    <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent]}>
                        <ParagraphComponent style={[commonStyles.fs14, commonStyles.textlinkgrey, commonStyles.fw500]} text={"GLOBAL_CONSTANTS.NETWORK"} />
                        <ParagraphComponent style={[commonStyles.fs16, commonStyles.textWhite, commonStyles.fw600, commonStyles.textRight]} text={props?.route?.params?.data?.network} />
                    </View>
                </View>
            </View>
            <View style={[commonStyles.sectionGap]} />
            {verficationFeild?.isPhoneVerified === true && <SendOTP
                isOTP={isOTP}
                onChangeText={handleReceiveOTP}
                value={otp}
                customerId={customerId?.id}
                phoneNumber={decryptAES(customerId?.phoneNumber || customerId?.phoneNo)}
                showError={showOtpError}
            />}
            {(verficationFeild?.isPhoneVerified === true && verficationFeild?.isEmailVerification === true) && <View style={[commonStyles.sectionGap]} />}
            {verficationFeild?.isEmailVerification === true && <EmailOTP
                isEmailOTP={isEmailOTP}
                onChangeText={handleReceiveEmailOTP}
                value={emailOtp}
                onVerify={setIsEmailOTPVerified}
                showError={showEmailOtpError}
            />}
            <View style={[commonStyles.mt40]} />
            <View >
                <ButtonComponent
                    title={"GLOBAL_CONSTANTS.UPGRADE_BTN"}
                    loading={bottonLoader}
                    onPress={saveSuccess}
                />
            </View>
            <View style={[commonStyles.mb40]} />
        </View>
    )
})

export default MembershipUpgradePreview;

