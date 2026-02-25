import React, { useCallback, useRef, useState } from 'react';
import { Keyboard, ActivityIndicator, TextInput, Platform, KeyboardAvoidingView, Linking, Text } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Container from '../../../../components/container/container';
import CreateAccountService from '../../../../apiServices/bank/createAccount';
import useMemberLogin from '../../../../hooks/userInfoHook';
import { isErrorDispaly } from '../../../../utils/helpers';
import ViewComponent from '../../../../components/view/view';
import { NavigationProp, ParamListBase, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { s } from '../../../../constants/styels/scale';
import ErrorComponent from '../../../../components/errorDisplay/errorDisplay';
import CommonTouchableOpacity from '../../../../components/touchableComponents/touchableOpacity';
import { useLngTranslation } from '../../../../hooks/languagesHook/useLngTranslation';
import useEncryptDecrypt from '../../../../hooks/encDecHook';
import { useThemeColors } from '../../../../hooks/themedHook/useThemeColors';
import { getThemedCommonStyles } from '../../../../components/CommonStyles';
import ButtonComponent from '../../../../components/buttons/button';
import TextMultiLanguage from '../../../../components/textComponets/multiLanguageText/textMultiLangauge';
import { Feather } from '@expo/vector-icons';
import AlertsCarousel from '../../Dashboard/components/allertCases';
import ParagraphComponent from '../../../../components/textComponets/paragraphText/paragraph';
import LabelComponent from '../../../../components/textComponets/lableComponent/lable';
import ConfirmLogout from '../../../commonScreens/logout/comfirmLogout';
import { supportMail } from '../../../../../cofiguration';
import ScrollViewComponent from '../../../../components/scrollView/scrollView';
import useLogout from '../../../../hooks/logout/useLogout';
import { store } from '../../../../redux/reducers';
import { RootState } from '../interface';
type AppDispatch = typeof store.dispatch;

const PhoneVerificationScreen = () => {
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [timer, setTimer] = useState(60);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const { getMemDetails } = useMemberLogin();
    const navigation = useNavigation<NavigationProp<ParamListBase>>();
    const dispatch = useDispatch<AppDispatch>();
    const { t } = useLngTranslation();
    const { decryptAES, encryptAES } = useEncryptDecrypt();
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const userInfo = useSelector((state: RootState) => state.userReducer?.userDetails);
    const [verificationError, setVerificationError] = useState<string>('');
    const [verifactionLoader, setVerifactionLoader] = useState(false);
    const [isVisible, setIsVisible] = useState(false)
    const [refresh, setRefresh] = useState<boolean>(false);
    const scrollViewRef = useRef<ScrollView>(null);
    const { logout } = useLogout();

    React.useEffect(() => {
        handlesend();
        startTimer();
        if (scrollViewRef.current) {
            scrollViewRef.current.scrollTo({ y: 0, animated: true });
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    const onRefresh = useCallback(() => {
        setRefresh(true);
        setLoading(true);
        getMemDetails(false, "PhoneVerificationScreen");
        setLoading(false)
        setRefresh(false);
    }, []);
    const startTimer = () => {
        setTimer(60);
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setTimer(prev => {
                if (prev <= 1) {
                    if (timerRef.current) clearInterval(timerRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleCodeChange = (text: string) => {
        const numericText = text.replace(/[^0-9]/g, '');
        setCode(numericText);
        if (numericText.length > 0) {
            setVerificationError('');
        }
    };

    const handleVerification = async () => {
        setErrorMessage('');
        Keyboard.dismiss();
        // New validation check: The user wants to validate that the input has a length of more than 4 digits.
        // Given the maxLength is 6, we will validate for exactly 6 digits.
        if (code.length == 0) {
            setVerificationError("Is required");
            return;
        }
        else if (code?.length < 4) {
            setVerificationError("Invalid OTP");
            return; // Exit the function to prevent API call
        }
        setVerifactionLoader(true);
        try {
            const otp = { code: encryptAES(code) }
            const res = await CreateAccountService.onboardingVerifyPhoneCode(otp);
            if (res.ok) {
                getMemDetails();
            } else {
                setErrorMessage(isErrorDispaly(res));
            }
        } catch (err) {
            setErrorMessage(isErrorDispaly(err));
        } finally {
            setVerifactionLoader(false);

        }
    };

    const handleClose = () => {
        setIsVisible(false)
    }
    const handleConfirm = async () => {
        setIsVisible(false)
        handleLogout();
    }
    const handleLogoutBtn = () => {
        setIsVisible(true)
    }



    const handleLogout = async () => {
        setLoading(true);
        await logout();
        setLoading(false);

    };

    const handlesend = async () => {
        // setResendLoading(true);
        setErrorMessage('');
        try {
            const res = await CreateAccountService.getPhoneCode({});
            if (res.ok) {
                startTimer();
                setCode('');
            } else {
                setErrorMessage(isErrorDispaly(res));
            }
        } catch (err) {
            setErrorMessage(isErrorDispaly(err));
        } finally {
            setResendLoading(false);
        }
    };

    const handleResend = async () => {
        setResendLoading(true);
        setErrorMessage('');
        try {
            const res = await CreateAccountService.getPhoneVerify({});
            if (res.ok) {
                startTimer();
                setCode('');
            } else {
                setErrorMessage(isErrorDispaly(res));
            }
        } catch (err) {
            setErrorMessage(isErrorDispaly(err));
        } finally {
            setResendLoading(false);
        }
    };

    const getBorderColor = () => {
        if (verificationError) {
            return NEW_COLOR.TEXT_RED;
        }
        return NEW_COLOR.INPUT_BORDER;
    };
    const handleClickMail = () => {
        const url = `mailto:${userInfo?.metadata?.AdminEmail || supportMail}`;
        Linking.openURL(url)
    }
    return (
        <ViewComponent style={[commonStyles.screenBg, commonStyles.flex1]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={commonStyles.flex1}
            >
                {loading ? (
                    <ViewComponent style={[commonStyles.flex1, commonStyles.justifyCenter, commonStyles.alignCenter]}>
                        <ActivityIndicator size="large" color="#FFF" />
                    </ViewComponent>
                ) : (
                    <Container style={[commonStyles.container]}>
                        <ScrollViewComponent
                            contentContainerStyle={{ flexGrow: 1 }} // Crucial for flexbox layout inside ScrollView
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                            refreshing={refresh} onRefresh={onRefresh}
                        >
                            <ViewComponent style={[commonStyles.flex1,]}>
                                <ViewComponent style={[commonStyles.flex1]}>
                                    {errorMessage && <ErrorComponent message={errorMessage} onClose={() => setErrorMessage("")} />}
                                    <AlertsCarousel commonStyles={commonStyles} screenName='Onbaording' />
                                    <ViewComponent style={[commonStyles.sectionGap]} />
                                    <ViewComponent >
                                        <ViewComponent style={[commonStyles.mxAuto, commonStyles.titleSectionGap]}>
                                            <Feather name="smartphone" size={s(120)} color={NEW_COLOR.TEXT_PRIMARY} />
                                        </ViewComponent>
                                        <TextMultiLanguage text="GLOBAL_CONSTANTS.PHONE_VERIFICATION" style={[commonStyles.registertext]} />


                                    </ViewComponent>
                                    <ViewComponent >

                                        <ParagraphComponent
                                            style={[
                                                commonStyles.registerpara,
                                                commonStyles.formItemSpace
                                            ]}
                                        >
                                            {t("GLOBAL_CONSTANTS.WE_SENT_A_VERIFICATION_CODE_TO_YOUR_PHONE")}{"\n"}
                                            <Text style={[commonStyles.verificationnumber]}>
                                                {decryptAES(userInfo?.phoneCode)}{" "}
                                                {decryptAES(userInfo?.phoneNumber)}
                                            </Text>
                                            {"."} {t("GLOBAL_CONSTANTS.PLEASE_ENTER_CODE_AND_VERIFY")}
                                        </ParagraphComponent>
                                    </ViewComponent>
                                    <LabelComponent style={[commonStyles.inputLabel]} text={"GLOBAL_CONSTANTS.PHONE_CODE"} children={<LabelComponent text=' *' style={[commonStyles.textred]} />} />
                                    <ViewComponent style={[commonStyles.pr2,]}>
                                        <TextInput
                                            style={[
                                                commonStyles.textInput,
                                                commonStyles.phonecodeplaceholder,
                                                {
                                                    borderColor: getBorderColor(),
                                                },
                                            ]}
                                            placeholder={t("GLOBAL_CONSTANTS.ENTER_VERIFICATION_CODE")}
                                            onChangeText={handleCodeChange}
                                            value={code}
                                            maxLength={6}
                                            placeholderTextColor={NEW_COLOR.PLACEHOLDER_TEXTCOLOR}
                                            keyboardType="number-pad"
                                        />

                                        {/* Right-side action inside input */}

                                    </ViewComponent>
                                    {verificationError ? <ParagraphComponent style={[commonStyles.textRed]} text={verificationError} /> : null}
                                    <ViewComponent style={[commonStyles.dflex, commonStyles.justifyend, commonStyles.sectionGap, commonStyles.gap2, commonStyles.alignCenter, commonStyles.inputbottomtext]}>
                                        <ParagraphComponent
                                            style={[commonStyles.inputbottomtext, { marginTop: s(-0) }]}
                                            text={t("GLOBAL_CONSTANTS.DID_NOT_RECEIVE_CODE")}
                                        />
                                        {timer > 0 ? (
                                            <ParagraphComponent
                                                style={[commonStyles.verificationnumber]}
                                                text={` ${timer} sec`}
                                            />
                                        ) : (
                                            <CommonTouchableOpacity onPress={handleResend} disabled={resendLoading}>
                                                {resendLoading ? (
                                                    <ActivityIndicator size="small" color={NEW_COLOR.PRiMARY_COLOR} />
                                                ) : (
                                                    <ParagraphComponent
                                                        style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textprimary]}
                                                        text={t('Resend')}
                                                    />
                                                )}
                                            </CommonTouchableOpacity>
                                        )}
                                    </ViewComponent>
                                    <ViewComponent style={[]}>
                                        <TextMultiLanguage text={"GLOBAL_CONSTANTS.HAVING_ISSUE_WITH_PHONE_CODE"} style={[commonStyles.sectionsubtitlepara, commonStyles.textCenter]} />
                                        <CommonTouchableOpacity onPress={handleClickMail}>
                                            <ParagraphComponent style={[commonStyles.textCenter, commonStyles.fs16, commonStyles.fw500, commonStyles.textprimary, commonStyles.mt4]} text={userInfo?.metadata?.AdminEmail || supportMail} />
                                        </CommonTouchableOpacity>
                                    </ViewComponent>
                                </ViewComponent>
                                <ViewComponent style={[commonStyles.sectionGap]} />

                                <ViewComponent>
                                    <ButtonComponent
                                        title={"GLOBAL_CONSTANTS.VERIFY"}
                                        onPress={handleVerification}
                                        loading={verifactionLoader} disable={verifactionLoader}
                                    />
                                    <ViewComponent style={[commonStyles.buttongap]} />
                                    <ButtonComponent
                                        title={"GLOBAL_CONSTANTS.LOGOUT"}
                                        onPress={handleLogoutBtn}
                                        solidBackground={true}
                                        disable={verifactionLoader}
                                    />
                                    <ViewComponent style={[commonStyles.sectionGap]} />
                                </ViewComponent>

                                <ConfirmLogout
                                    isVisible={isVisible}
                                    onClose={handleClose}
                                    onConfirm={handleConfirm} />



                            </ViewComponent>
                        </ScrollViewComponent>
                    </Container>
                )}
            </KeyboardAvoidingView>
        </ViewComponent>
    );
};

export default PhoneVerificationScreen;
