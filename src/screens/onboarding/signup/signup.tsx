import React, { useEffect, useState } from 'react';
import { Formik } from 'formik';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { useLngTranslation } from '../../../hooks/useLngTranslation';
import ButtonComponent from '../../../newComponents/buttons/button';
import FormikTextInput from '../../../newComponents/textInputComponents/formik/textInput';
import ViewComponent from '../../../newComponents/view/view';
import TextMultiLangauge from '../../../newComponents/textComponets/multiLanguageText/textMultiLangauge';
import PageHeader from '../../../newComponents/pageHeader/pageHeader';
import { useThemeColors } from '../../../hooks/useThemeColors';
import { isErrorDispaly } from '../../../utils/helpers';
import OnboardingService from '../../../services/onboarding';
import { Google } from '../../../assets/svg';
import { ActivityIndicator, Linking, StyleSheet, TouchableOpacity, Keyboard } from 'react-native';
import { SignupValidationSchema } from './signUpShema';
import { useDispatch, useSelector } from 'react-redux';
import { setReferralCode, setSignupInfo } from '../../../redux/actions/actions';
import { ReferralInfo, SignupFormValues } from '../interfaces';
import { s } from '../../../newComponents/theme/scale';
import Checkbox from '../../../newComponents/checkBoxes/basic/checkBox';
import { ActionLogParams, useActionLogging } from '../../../hooks/loggingHook';
import useEncryptDecrypt from '../../../hooks/encDecHook';
import LabelComponent from '../../../newComponents/textComponets/lableComponent/lable';
import crashlytics from '@react-native-firebase/crashlytics';
import { AntDesign, Foundation } from '@expo/vector-icons';
import { useHardwareBackHandler } from '../../../hooks/HardwareBackHandler';
import { SPLASH_CONSTANTS } from '../constants';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Container from '../../../newComponents/container/container';
import { getThemedCommonStyles } from '../../../assets/styles/CommonStyles';
import ParagraphComponent from '../../../newComponents/textComponets/paragraphText/paragraph';
import ErrorComponent from '../../../newComponents/errorDisplay/errorDisplay';

const SignupComponent = () => {
    const navigation = useNavigation<any>();
    const { t } = useLngTranslation();
    const [loading, setLoading] = useState<boolean>(false);
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const dispatch = useDispatch();
    const referralCode = useSelector((state: any) => state.userReducer?.referralCode);
    const { logEvent } = useActionLogging();
    const { encryptAES, decryptAES } = useEncryptDecrypt('11AA7AE945754C128F2EC8DAFFE82416');
    const [isReferralValid, setIsReferralValid] = useState<boolean | null>(null);
    const [isReferralValidating, setIsReferralValidating] = useState<boolean>(false);
    const [referralInfo, setReferralInfo] = useState<ReferralInfo>({
        isValidReferral: null,
        customerName: '',
        referralCode: '',
    });
    const signupInfo = useSelector((state: any) => state.userReducer?.signupInfo);
    const initialValues: SignupFormValues = {
        email: '',
        referralCode: referralCode?.length > 0 ? referralCode : '',
        termsAccepted: false,
    };
    const [isEmailAlreadyExistsError, setIsEmailAlreadyExistsError] = useState<boolean>(false);
    const [referralError, setReferralError] = useState<string | null>(null);
    const [error, setError] = useState<string>("");

    useHardwareBackHandler(() => {
        handleGoBack();
    });
    // Verify referral code if available when component mounts
    useEffect(() => {
        if (referralCode && referralCode.length >= 10) {
            validateReferralCode(referralCode);
        }
    }, [referralCode]);

    // Handles the form submission for user registration.
    const handleSignup = async (values: SignupFormValues, setFieldError: any) => {
        setError("");
        Keyboard.dismiss();
        setLoading(true);
        if (values.referralCode && isReferralValid !== true) {
            setError(t('GLOBAL_CONSTANTS.PLEASE_VERIFY_REFERAL_CODE'));
            setLoading(false);
            return;
        }
        try {
            const body = {
                email: encryptAES(values.email),
                action: 'Signup',
            };
            const response: any = await OnboardingService.auth0Signup(body);
            if (response.status === 200) {
                dispatch(setSignupInfo({ ...signupInfo, email: values?.email }));
                const actionData: ActionLogParams = {
                    screename: 'Signup',
                    actionName: 'Navigate to Email Verification',
                    actionType: 'Button',
                    nextScreenName: 'verifyEmail',
                };
                logEvent('navigation_action', actionData);
                dispatch(setReferralCode(""));
                navigation.navigate(SPLASH_CONSTANTS.EMAIL_VERIFICATION);
                return;
            } else if (response.status === 422) {
                setFieldError('email', isErrorDispaly(response));
                setLoading(false);
                setIsEmailAlreadyExistsError(true);
                Keyboard.dismiss();
                return;
            }
        } catch (error: any) {
            setError(isErrorDispaly(error));
            Keyboard.dismiss();
            crashlytics().setAttributes({
                endpoint: 'api/v1/Customer/SendEmail',
                method: 'POST',
                appName: 'Swakipay',
                response: JSON.stringify(error),
            });
        } finally {
            setLoading(false);
        }
    };

    // Navigates back to the previous screen.
    const handleGoBack = () => {
        const actionData: ActionLogParams = {
            screename: 'Signup',
            actionName: 'Navigate Back',
            actionType: 'Button',
            nextScreenName: 'Previous Screen',
        };
        logEvent('navigation_action', actionData);
        navigation.dispatch(
            CommonActions.reset({
                index: 1,
                routes: [{ name: SPLASH_CONSTANTS.SPLASH_SCREEN }],
            })
        );
    };

    // Navigates to the login screen.
    const navigateToLogin = () => {
        const actionData: ActionLogParams = {
            screename: 'Signup',
            actionName: 'Navigate to Login',
            actionType: 'Link',
            nextScreenName: 'login',
        };
        logEvent('navigation_action', actionData);
        navigation.navigate(SPLASH_CONSTANTS.LOGIN);
    };

    const validateReferralCode = async (cleanedValue: any) => {
        let referralText = cleanedValue?.toLowerCase();
        const body = {
            referralCode: encryptAES(referralText || referralCode),
        };
        setIsReferralValidating(true);
        try {
            const response: any = await OnboardingService.getIsrefferalValid(body, 'Personal');
            if (response.ok) {
                if (response?.data.isValidReferral) {
                    setIsReferralValid(true);
                    setReferralInfo(response.data);
                    dispatch(setSignupInfo({ ...signupInfo, guid: response.data?.referralCode }));
                } else {
                    setIsReferralValid(false);
                    setReferralError(t('GLOBAL_CONSTANTS.INVALID_REFERAL_CODE'));
                }
                setIsReferralValidating(false);
            } else {
                setError(isErrorDispaly(response));
                setIsReferralValidating(false);
            }
        } catch (error: any) {
            setError(isErrorDispaly(error));
            setIsReferralValidating(false);
        }
    };

    const onChangeText = (value: any, setFieldValue: any) => {
        setError("");
        setReferralError(null);
        const cleanedValue = value.replace(/[^a-zA-Z0-9]/g, '');
        setFieldValue('referralCode', cleanedValue);
        setIsReferralValid(null);
        if (cleanedValue.length >= 10) {
            validateReferralCode(cleanedValue);
        }
    };

    const handleNavigateTerms = () => {
        const actionData: ActionLogParams = {
            screename: 'Signup',
            actionName: 'Opening Terms & condiations',
            actionType: 'Link',
            nextScreenName: 'Terms & conditions in browser',
        };
        logEvent('navigation_action', actionData);
        Linking.openURL('https://bullswipe.com/terms-conditions/');
    };

    const getInputBorder = (isValid: boolean | null) => {
        if (isValid === false) return commonStyles.error_Border;
        return {};
    };

    const clearReferralCode = (setFieldValue: any) => {
        setError("");
        setFieldValue('referralCode', '');
        setIsReferralValid(null);
        setReferralError(null);
    };

    const handleNavigateAppleSignup = () => {
        navigation.navigate(SPLASH_CONSTANTS.COMING_SOON, {
            pageHeader: false,
            customHeader: {
                title: 'Sign Up With Apple',
                showBackButton: true,
            },
        });
    };

    const handleNavigateGoogleSignup = () => {
        navigation.navigate(SPLASH_CONSTANTS.COMING_SOON, {
            pageHeader: false,
            customHeader: {
                title: 'Sign Up With Google',
                showBackButton: true,
            },
        });
    };

    const onEmailChange = (value: any, setFieldValue: any) => {
        setError("");
        setFieldValue('email', value);
        setIsEmailAlreadyExistsError(false);
    };

    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            <KeyboardAwareScrollView
                contentContainerStyle={[{ flexGrow: 1 }]}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                enableOnAndroid={true}
            >
                {/* Make Container fill available height */}
                <Container style={[commonStyles.container, { flex: 1 }]}>
                    <ViewComponent>
                        <PageHeader onBackPress={handleGoBack} title={t('GLOBAL_CONSTANTS.SIGN_UP')} />
                    </ViewComponent>
                    {error&&<ErrorComponent message={error} screen={true}/>}

                    <Formik
                        initialValues={initialValues}
                        validationSchema={SignupValidationSchema}
                        onSubmit={(values, { setFieldError }) => handleSignup(values, setFieldError)}
                        validateOnChange={true}
                        validateOnBlur={true}
                    >
                        {({ values, handleSubmit, setFieldValue, setFieldTouched, touched, errors }) => (
                            <>
                                <FormikTextInput
                                    label={'GLOBAL_CONSTANTS.EMAIL_ADDRESS'}
                                    name="email"
                                    placeholder={'GLOBAL_CONSTANTS.ENTER_EMAIL_ADDRES'}
                                    placeholderTextColor={NEW_COLOR.PLACEHOLDER_TEXTCOLOR}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    onChangeText={(value) => onEmailChange(value, setFieldValue)}
                                    isRequired={true}
                                    custInput={[
                                        commonStyles.fs16,
                                        isEmailAlreadyExistsError ? commonStyles.error_Border : {},
                                    ]}
                                />
                                <ViewComponent style={commonStyles.formItemSpace} />
                                <ViewComponent style={[commonStyles.dflex]}>
                                    <LabelComponent
                                        text={t('GLOBAL_CONSTANTS.REFERRAL_CODE_LABEL')}
                                        style={[commonStyles.inputLabel, commonStyles.flex1]}
                                    />
                                    <ViewComponent>
                                        {typeof referralInfo?.customerName === 'string' &&
                                            isReferralValid && (
                                                <ParagraphComponent
                                                    text={decryptAES(referralInfo?.customerName)}
                                                    style={[commonStyles.textGreen, commonStyles.fs14]}
                                                />
                                            )}
                                    </ViewComponent>
                                </ViewComponent>

                                <FormikTextInput
                                    name="referralCode"
                                    placeholder={'GLOBAL_CONSTANTS.ENTER_REFERRAL_CODE'}
                                    placeholderTextColor={NEW_COLOR.PLACEHOLDER_TEXTCOLOR}
                                    keyboardType="phone-pad"
                                    autoCapitalize="characters"
                                    maxLength={10}
                                    onChangeText={(value: any) => onChangeText(value, setFieldValue)}
                                    isRequired={false}
                                    rightIcon={
                                        (isReferralValidating && (
                                            <ViewComponent
                                                style={[styles.referralCheck]}
                                            >
                                                <ActivityIndicator size="small" color={NEW_COLOR.BG_YELLOW} />
                                            </ViewComponent>
                                        )) ||
                                        (isReferralValid === true && (
                                            <AntDesign
                                                style={[styles.referralCheck]}
                                                name="checkcircle"
                                                size={s(20)}
                                                color={NEW_COLOR.BG_GREEN}
                                            />
                                        )) ||
                                        (isReferralValid === false && (
                                            <TouchableOpacity
                                                onPress={() => clearReferralCode(setFieldValue)}
                                                style={[commonStyles.p10]}
                                            >
                                                <AntDesign
                                                    style={[styles.referralCheck]}
                                                    name="closecircleo"
                                                    size={s(20)}
                                                    color={NEW_COLOR.TEXT_RED}
                                                />
                                            </TouchableOpacity>
                                        )) ||
                                        null
                                    }
                                    custInput={[getInputBorder(isReferralValid), commonStyles.pr50]}
                                />

                                {referralError && (
                                    <TextMultiLangauge
                                        style={[commonStyles.textRed, commonStyles.fs14, commonStyles.fw400, commonStyles.mt8]}
                                        text={referralError}
                                    />
                                )}

                                <ViewComponent style={commonStyles.formItemSpace} />

                                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter]}>
                                    <Checkbox
                                        value={values.termsAccepted}
                                        onChange={(val) => {
                                            if (val === false) {
                                                setFieldTouched('termsAccepted', true);
                                            }
                                            setFieldValue('termsAccepted', val);
                                        }}
                                        checkedColor={NEW_COLOR.TITLE_TEXT}
                                        uncheckedBorderColor={NEW_COLOR.BORDER_COLOR}
                                        backgroundColor={NEW_COLOR.CHECK_BOX_BG}
                                        style={[commonStyles.mr10]}
                                    />
                                    <ParagraphComponent style={[commonStyles.fs12, commonStyles.getStartedText, commonStyles.fw400]}>
                                        {t('GLOBAL_CONSTANTS.TERMS_CONSENT_TEXT')}
                                        <TextMultiLangauge
                                            text="GLOBAL_CONSTANTS.TERMS_OF_USE"
                                            style={[commonStyles.text_yellow, commonStyles.fw400]}
                                            onPress={handleNavigateTerms}
                                        />
                                    </ParagraphComponent>
                                </ViewComponent>

                                {touched.termsAccepted && errors.termsAccepted && (
                                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10]}>
                                        <AntDesign
                                            name="closecircleo"
                                            size={s(14)}
                                            color={NEW_COLOR.TEXT_RED}
                                            style={[commonStyles.mt10]}
                                        />
                                        <ParagraphComponent
                                            style={[commonStyles.textRed, commonStyles.fs14, commonStyles.fw400, commonStyles.mt10]}
                                            text={t(errors.termsAccepted)}
                                        />
                                    </ViewComponent>
                                )}

                                <ViewComponent style={[commonStyles.mt30]}>
                                    <ButtonComponent
                                        title={t('GLOBAL_CONSTANTS.CONTINUE')}
                                        onPress={handleSubmit}
                                        loading={loading}
                                        disable={loading || !values.termsAccepted}
                                    />
                                </ViewComponent>

                                <ViewComponent
                                    style={[
                                        commonStyles.dflex,
                                        commonStyles.alignCenter,
                                        commonStyles.justifyCenter,
                                        commonStyles.mt20,
                                        commonStyles.px24,
                                    ]}
                                >
                                    <TextMultiLangauge
                                        text={'GLOBAL_CONSTANTS.ALREADY_HAVE_ACCOUNT'}
                                        style={[commonStyles.fw400, commonStyles?.fs14, { color: NEW_COLOR.PLACEHOLDER_TEXTCOLOR }]}
                                    />
                                    <TouchableOpacity onPress={navigateToLogin}>
                                        <TextMultiLangauge
                                            text={'GLOBAL_CONSTANTS.LOGIN_LINK'}
                                            style={[commonStyles.fw700, commonStyles?.fs16, commonStyles.pl5, commonStyles.text_yellow]}
                                        />
                                    </TouchableOpacity>
                                </ViewComponent>

                                <ViewComponent style={[{ marginTop: 'auto' }, commonStyles.sectionGap]}>
                                    <ViewComponent
                                        style={[
                                            commonStyles.dflex,
                                            commonStyles.alignCenter,
                                            commonStyles.justifyCenter,
                                            commonStyles.gap10,
                                        ]}
                                    >
                                        <ViewComponent style={[commonStyles.line, commonStyles.flex1]} />
                                        <TextMultiLangauge
                                            text={'GLOBAL_CONSTANTS.OR_CONTINUE_WITH'}
                                            style={[commonStyles.fs14, commonStyles.mx14, commonStyles.getStartedText]}
                                        />
                                        <ViewComponent style={[commonStyles.line, commonStyles.flex1]} />
                                    </ViewComponent>

                                    <ViewComponent
                                        style={[
                                            commonStyles.mt24,
                                            commonStyles.mb16,
                                            commonStyles.dflex,
                                            commonStyles.justifyContent,
                                            commonStyles.gap10,
                                        ]}
                                    >
                                        <TouchableOpacity
                                            onPress={handleNavigateAppleSignup}
                                            style={[
                                                styles.socialButton,
                                                commonStyles.flex1,
                                                commonStyles.dflex,
                                                commonStyles.justifyCenter,
                                                commonStyles.alignCenter,
                                                commonStyles.border_color,
                                                commonStyles.gap8,
                                            ]}
                                            activeOpacity={0.8}
                                        >
                                            <Foundation name="social-apple" size={s(24)} color={NEW_COLOR.TEXT_WHITE} />
                                            <TextMultiLangauge
                                                text={'GLOBAL_CONSTANTS.APPLE_BUTTON'}
                                                style={[commonStyles.fs16, commonStyles.fw700, commonStyles.textWhite]}
                                            />
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            onPress={handleNavigateGoogleSignup}
                                            style={[
                                                styles.socialButton,
                                                commonStyles.flex1,
                                                commonStyles.dflex,
                                                commonStyles.justifyCenter,
                                                commonStyles.alignCenter,
                                                commonStyles.border_color,
                                                commonStyles.gap8,
                                            ]}
                                            activeOpacity={0.8}
                                        >
                                            <Google width={s(24)} height={s(24)} />
                                            <TextMultiLangauge
                                                text={'GLOBAL_CONSTANTS.GOOGLE_BUTTON'}
                                                style={[commonStyles.fs16, commonStyles.fw700, commonStyles.textWhite]}
                                            />
                                        </TouchableOpacity>
                                    </ViewComponent>
                                </ViewComponent>
                                <ViewComponent style={[commonStyles.mb10]} />

                            </>
                        )}
                    </Formik>
                </Container>
            </KeyboardAwareScrollView>
        </ViewComponent>
    );
};

const styles = StyleSheet.create({
    socialButton: {
        width: s(160),
        height: s(50),
        borderRadius: s(100),
        borderWidth: 1,
    },
    referralCheck: {
        position: 'absolute',
        right: s(0),
        top: s(0),
        zIndex: 1,
    },
});

export default SignupComponent;
