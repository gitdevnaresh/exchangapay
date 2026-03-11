import React, { useEffect, useState } from 'react';
import { TouchableOpacity, View, Keyboard, StyleSheet, useColorScheme } from 'react-native';
import { Formik } from 'formik';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { useLngTranslation } from "../../../hooks/useLngTranslation";
import { isErrorDispaly, logApiErrorToCrashlytics, logApiErrorToSentry } from '../../../utils/helpers';
import { storeMfaToken, storeToken } from '../../../services/auth0Service';
import useMemberLogin from '../../../hooks/userInfoHook';
import ViewComponent from '../../../newComponents/view/view';
import ButtonComponent from '../../../newComponents/buttons/button';
import TextMultiLangauge from '../../../newComponents/textComponets/multiLanguageText/textMultiLangauge';
import FormikTextInput from '../../../newComponents/textInputComponents/formik/textInput';
import { useThemeColors } from '../../../hooks/useThemeColors';
import { LoginValidationSchema } from './loginValidationShema';
import { ActionLogParams, useActionLogging } from '../../../hooks/loggingHook';
import useEncryptDecrypt from '../../../hooks/encDecHook';
import { useHardwareBackHandler } from '../../../hooks/HardwareBackHandler';
import { useDispatch } from 'react-redux';
import { setBiometricEnabled, setStoredValues } from '../../../redux/actions/actions';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Container from '../../../newComponents/container/container';
import { getThemedCommonStyles } from '../../../assets/styles/CommonStyles';
import { s } from '../../../constants/theme/scale';
import { Bullswipe, Google, SwokipayLight } from '../../../assets/svg';
import { store } from '../../../redux/reducers';
import { Foundation, MaterialIcons } from '@expo/vector-icons';
import { LoginValues } from '../../onboarding/interfaces';
import { SPLASH_CONSTANTS } from '../../onboarding/constants';
import { FrontEggService, updateFcmToken } from '../../../apiServices/fronteggApiServices/fronteggServices';
import SplashBg from '../../../assets/mainmenuicons/splashbg';
import { getAllEnvData } from '../../../../Environment';
import ErrorComponent from '../../../newComponents/errorDisplay/errorDisplay';
import ProfileService from '../../../services/profile';


const FrontEggLogin = () => {
    const navigation = useNavigation<any>();
    const { t } = useLngTranslation();
    const [loading, setLoading] = useState<boolean>(false);
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const { logEvent } = useActionLogging();
    const { getMemDetails } = useMemberLogin();
    const [isErrorBorder, setIsErrorBorder] = useState<boolean>(false)
    const { encryptAES } = useEncryptDecrypt("11AA7AE945754C128F2EC8DAFFE82416");
    const dispatch = useDispatch();
    const[error,setError]=useState<string>("")
    const getConfig = getAllEnvData();
    const[biometricEnabled,setBiometricsEnabled]=useState<boolean>(false)
    const initialValues: LoginValues = {
        email: '',
        password: '',
    };

    // Handles the hardware back button press on Android
    useHardwareBackHandler(() => {
        handleGoBack();
    })

    // Handles the user sign-in process
    const handleSignin = async (values: LoginValues) => {
        setError("");
        Keyboard.dismiss();
        setLoading(true);
        const body = {
            "email": encryptAES(values.email),
            "password": encryptAES(values.password),
        }
        try {
            const response: any = await FrontEggService.userSignIn(body);
            const actionData: ActionLogParams = {
                screename: 'Login',
                actionName: 'Login Success',
                actionType: 'API',
                actionObj: { email: values.email }
            };
            logEvent('login_success', actionData);
            if (response?.status === 200) {
                const parsedData = JSON.parse(response.data);
                if (parsedData?.mfaRequired) {
                    const actionData: ActionLogParams = {
                        screename: 'Login',
                        actionName: 'Navigate to MFA Screen',
                        actionType: 'Navigation',
                        nextScreenName: 'MfaScreen'
                    };
                    logEvent('navigation_action', actionData);
                    await storeMfaToken(parsedData.mfaToken, parsedData?.mfaDevices?.authenticators[0]?.id ?? "");
                    dispatch(setStoredValues({
                        fieldOne: encryptAES(values.email),
                        fieldTwo: encryptAES(values.password),
                    }));
                    navigation.navigate("mfaAuthenticator", {
                        userData: parsedData,
                    });
                }
                else {
                    await storeToken(parsedData.accessToken, parsedData?.refreshToken);
                    updateFcmToken();
                    getMemDetails();
                }
            } else {
                Keyboard.dismiss();
                setLoading(false);
                setError(isErrorDispaly(response));
                logApiErrorToSentry({
                    url: `${getConfig.apiUrls.apiUrl}/api/v1/Common/Customer/login`,
                    method: "POST",
                    statusCode: 422,
                    requestBody: body,
                    responseData: response,
                    userId: values.email,
                    errorMessage: `Invalid Grant Error: ${isErrorDispaly(response) || 'Unknown error'}`,
                });
            }
        } catch (error: any) {
            Keyboard.dismiss();
            setLoading(false);
            setError(isErrorDispaly(error));
            const errormsg = isErrorDispaly(error);

            logApiErrorToSentry({
                url: `${getConfig.apiUrls.apiUrl}/api/v1/Common/Customer/login`,
                method: "POST",
                statusCode: 422,
                requestBody: body,
                responseData: error,
                userId: values.email,
                errorMessage: `Invalid Grant Error: ${errormsg || 'Unknown error'}`,
            });
            logApiErrorToCrashlytics({
                endpoint: "/api/v1/Common/Customer/login",
                method: "POST",
                status: 400,
                appName: "Swakipay",
                request: body,
                response: error?.response?.data,
                error: error,
            });

        } finally {
            setLoading(false);
        }
    };

    // Navigates to the previous screen
    const handleGoBack = () => {
        const actionData: ActionLogParams = {
            screename: 'Login',
            actionName: 'Navigate Back',
            actionType: 'Button',
            nextScreenName: 'Previous Screen'
        };
        logEvent('navigation_action', actionData);
        navigation.dispatch(
            CommonActions.reset({
                index: 1,
                routes: [{ name: "SplaceScreen" }],
            })
        );
    };
    // Navigates to the Forgot Password screen
    const navigateToForgotPassword = (setFieldValue: any) => {
        const actionData: ActionLogParams = {
            screename: 'Login',
            actionName: 'Navigate to Forgot Password',
            actionType: 'Link',
            nextScreenName: 'ForgotPasswordScreen'
        };
        logEvent('navigation_action', actionData);
        navigation.navigate(SPLASH_CONSTANTS.FORGOT_PASSWORD);
        setFieldValue('email', '');
        setFieldValue('password', '');
    };

    // Navigates to the Signup screen
    const navigateToSignup = () => {
        const actionData: ActionLogParams = {
            screename: 'Login',
            actionName: 'Navigate to Signup',
            actionType: 'Link',
            nextScreenName: 'signup'
        };
        logEvent('navigation_action', actionData);
        navigation?.navigate("frontEggSignup");
    };
    const handleHideBorder = () => {
        setIsErrorBorder(false)
        setError("");
    };

    const handleNavigateAppleLogin = () => {
        navigation.navigate(SPLASH_CONSTANTS.COMING_SOON, {
            pageHeader: false,
            customHeader: {
                title: 'Log In With Apple',
                showBackButton: true,
            },
        });
    };

    const handleNavigateGoogleLogin = () => {
        navigation.navigate(SPLASH_CONSTANTS.COMING_SOON, {
            pageHeader: false,
            customHeader: {
                title: 'Log In With Google',
                showBackButton: true,
            },
        });
    };
    const appThemePreference = store?.getState().userReducer?.appTheme;
    const systemColorScheme = useColorScheme();
    const effectiveTheme =
        appThemePreference === "system" || !appThemePreference
            ? systemColorScheme
            : appThemePreference;

    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            <View style={{ flex: 1 }}>
                <KeyboardAwareScrollView
                    contentContainerStyle={[{ flexGrow: 1 }]}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    enableOnAndroid={true}
                >
                    <Container style={[commonStyles.container, { flex: 1 }]}>
                        <ViewComponent style={[commonStyles.alignCenter, commonStyles.p24, { marginTop: s(60) }]}>
                            {effectiveTheme === "dark" ? (
                                <Bullswipe width={s(140)} height={s(30)} />
                            ) : (
                                <SwokipayLight width={s(140)} height={s(30)} />
                            )}
                        </ViewComponent>
                        <ViewComponent style={{ position: 'relative' }}>
                            <SplashBg style={{
                                position: 'absolute',
                                top: s(-240),
                                left: s(-100),
                                right: s(0)
                            }} />

                        </ViewComponent>

                        {/* Title */}
                        <ViewComponent style={[commonStyles.mt30,commonStyles.sectionGap]}>
                            <TextMultiLangauge
                                text={"GLOBAL_CONSTANTS.LOG_IN"}
                                style={[commonStyles.logintitletext]}
                            />
                        </ViewComponent>

                       {error&&<ErrorComponent message={error} screen={true}/>}
                        {/* Form */}
                        <Formik
                            initialValues={initialValues}
                            validationSchema={LoginValidationSchema}
                            onSubmit={(values) => handleSignin(values)}
                            enableReinitialize
                            validateOnChange
                            validateOnBlur
                        >
                            {({ handleSubmit, setFieldValue, values, errors }) => (
                                <>
                                    <ViewComponent>
                                        <FormikTextInput
                                            label={"GLOBAL_CONSTANTS.EMAIL_ADDRESS"}
                                            name="email"
                                            placeholder={"GLOBAL_CONSTANTS.ENTER_EMAIL_ADDRES"}
                                            placeholderTextColor={NEW_COLOR.PLACEHOLDER_TEXTCOLOR}
                                            keyboardType="email-address"
                                            rightIcon={<MaterialIcons name="login" size={s(24)} color={NEW_COLOR.TEXT_link} />
                                            }
                                            autoCapitalize="none"
                                            onChangeText={handleHideBorder}
                                            isRequired
                                            editable={!loading}
                                            custInput={[
                                                commonStyles.fs16,
                                                isErrorBorder ? commonStyles.error_Border : null,
                                            ]}
                                        />
                                        <ViewComponent style={commonStyles.formItemSpace} />
                                        <FormikTextInput
                                            label={"GLOBAL_CONSTANTS.PASSWORD"}
                                            name="password"
                                            placeholder={"GLOBAL_CONSTANTS.PASSWORD_PLACEHOLDER"}
                                            placeholderTextColor={NEW_COLOR.PLACEHOLDER_TEXTCOLOR}
                                            secureTextEntry={true}
                                            isRequired
                                            onChangeText={handleHideBorder}
                                            maxLength={32}
                                            custInput={[
                                                commonStyles.fs16,
                                                isErrorBorder ? commonStyles.error_Border : null,
                                            ]}
                                            editable={!loading}
                                        />
                                    </ViewComponent>

                                    <TouchableOpacity
                                        style={[commonStyles.mt8, { alignSelf: 'flex-start' }]}
                                        onPress={() => navigateToForgotPassword(setFieldValue)}
                                        disabled={loading}
                                    >
                                        <TextMultiLangauge
                                            text={"GLOBAL_CONSTANTS.FORGOT_PASSWORD"}
                                            style={[commonStyles.forgottext]}
                                        />
                                    </TouchableOpacity>

                                    <ViewComponent style={[{ marginTop: s(24) }]}>
                                        <ButtonComponent
                                            title={t("GLOBAL_CONSTANTS.LOG_IN")}
                                            onPress={handleSubmit}
                                            loading={loading}
                                            disable={loading || !values.email || !values.password || !!errors.email || !!errors.password}
                                        />
                                    </ViewComponent>

                                    <ViewComponent style={[{ marginTop: s(100) }]}>
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
                                                text={"GLOBAL_CONSTANTS.OR_LOGIN_WITH"}
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
                                                style={[
                                                    styles.socialButton,
                                                    commonStyles.flex1,
                                                    commonStyles.dflex,
                                                    commonStyles.justifyCenter,
                                                    commonStyles.alignCenter,
                                                    commonStyles.border_color,
                                                    commonStyles.gap8,
                                                ]}
                                                disabled={loading}
                                                activeOpacity={0.8}
                                                onPress={handleNavigateAppleLogin}
                                            >
                                                <Foundation name="social-apple" size={s(24)} color={NEW_COLOR.TEXT_WHITE} />
                                                <TextMultiLangauge
                                                    text={"GLOBAL_CONSTANTS.APPLE_BUTTON"}
                                                    style={[commonStyles.fs16, commonStyles.fw700, commonStyles.textWhite]}
                                                />
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                style={[
                                                    styles.socialButton,
                                                    commonStyles.flex1,
                                                    commonStyles.dflex,
                                                    commonStyles.justifyCenter,
                                                    commonStyles.alignCenter,
                                                    commonStyles.border_color,
                                                    commonStyles.gap8,
                                                ]}
                                                disabled={loading}
                                                activeOpacity={0.8}
                                                onPress={handleNavigateGoogleLogin}
                                            >
                                                <Google width={s(24)} height={s(24)} />
                                                <TextMultiLangauge
                                                    text={"GLOBAL_CONSTANTS.GOOGLE_BUTTON"}
                                                    style={[commonStyles.fs16, commonStyles.fw700, commonStyles.textWhite]}
                                                />
                                            </TouchableOpacity>
                                        </ViewComponent>
                                    </ViewComponent>
                                    <ViewComponent
                                        style={[
                                            commonStyles.dflex,
                                            commonStyles.alignCenter,
                                            commonStyles.justifyCenter,
                                            commonStyles.px24,
                                        ]}
                                    >
                                        <TextMultiLangauge
                                            text={"GLOBAL_CONSTANTS.DIDT_HAVE_AN_ACCOUNT"}
                                            style={[commonStyles.fw400, commonStyles?.fs14, { color: NEW_COLOR.PLACEHOLDER_TEXTCOLOR }]}
                                        />
                                        <TouchableOpacity onPress={navigateToSignup} disabled={loading}>
                                            <TextMultiLangauge
                                                text={"GLOBAL_CONSTANTS.SIGN_UP"}
                                                style={[commonStyles.fw700, commonStyles?.fs16, commonStyles.pl5, commonStyles.text_yellow]}
                                            />
                                        </TouchableOpacity>
                                    </ViewComponent>
                                    <ViewComponent style={[commonStyles.mb10]} />

                                </>
                            )}
                        </Formik>

                    </Container>
                </KeyboardAwareScrollView>
            </View>



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
});


export default FrontEggLogin;
