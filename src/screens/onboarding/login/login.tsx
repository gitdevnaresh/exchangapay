import React, { useState } from 'react';
import { TouchableOpacity, View, Keyboard, StyleSheet, useColorScheme } from 'react-native';
import { Formik } from 'formik';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { useLngTranslation } from "../../../hooks/useLngTranslation";
import { isErrorDispaly } from '../../../utils/helpers';
import { storeMfaToken, storeToken } from '../../../services/auth0Service';
import useMemberLogin from '../../../hooks/userInfoHook';
import ViewComponent from '../../../newComponents/view/view';
import ButtonComponent from '../../../newComponents/buttons/button';
import TextMultiLangauge from '../../../newComponents/textComponets/multiLanguageText/textMultiLangauge';
import FormikTextInput from '../../../newComponents/textInputComponents/formik/textInput';
import { useThemeColors } from '../../../hooks/useThemeColors';
import { LoginValues } from '../interfaces';
import { LoginValidationSchema } from './loginValidationShema';
import { ActionLogParams, useActionLogging } from '../../../hooks/loggingHook';
import { showAppToast } from '../../../newComponents/ToasterMessages/ShowMessage';
import useEncryptDecrypt from '../../../hooks/encDecHook';
import { useHardwareBackHandler } from '../../../hooks/HardwareBackHandler';
import OnboardingService from '../../../services/onboarding';
import crashlytics from '@react-native-firebase/crashlytics';
import { useDispatch } from 'react-redux';
import { setStoredValues } from '../../../redux/actions/actions';
import * as Sentry from '@sentry/react-native';
import { getAllEnvData } from '../../../../Environment';
import { SPLASH_CONSTANTS } from '../constants';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Container from '../../../newComponents/container/container';
import { getThemedCommonStyles } from '../../../assets/styles/CommonStyles';
import { s } from '../../../constants/theme/scale';
import { Bullswipe, Google, SwokipayLight } from '../../../assets/svg';
import SplashBg from '../../../assets/mainmenuicons/splashbg';
import { store } from '../../../redux/reducers';
import { Foundation, MaterialIcons } from '@expo/vector-icons';
import { updateFcmToken } from '../../../apiServices/fronteggApiServices/fronteggServices';
import ErrorComponent from '../../../newComponents/errorDisplay/errorDisplay';


const LoginComponent = () => {
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
    const [error, setError] = useState<string>("");
    const initialValues: LoginValues = {
        email: '',
        password: '',
    };
    // Handles the hardware back button press on Android
    useHardwareBackHandler(() => {
        handleGoBack();
    })
    // Handles the user sign-in process
    const handleSignin = async (values: LoginValues, setFieldError: any) => {
        setError("");
        Keyboard.dismiss();
        setLoading(true);
        try {
            const body = {
                username: encryptAES(values.email),
                password: encryptAES(values.password)

            };
            const response: any = await OnboardingService.auth0SignIn(body);
             updateFcmToken();
            const actionData: ActionLogParams = {
                screename: 'Login',
                actionName: 'Login Success',
                actionType: 'API',
                actionObj: { email: values.email }
            };
            logEvent('login_success', actionData);
            const parsedData = JSON.parse(response.data);
            if (parsedData.error && parsedData.error === 'mfa_required') {
                const actionData: ActionLogParams = {
                    screename: 'Login',
                    actionName: 'Navigate to MFA Screen',
                    actionType: 'Navigation',
                    nextScreenName: 'MfaScreen'
                };
                logEvent('navigation_action', actionData);
                await storeMfaToken(parsedData.mfa_token);
                dispatch(setStoredValues({
                    fieldOne: encryptAES(values.email),
                    fieldTwo: encryptAES(values.password),
                }));
                navigation.navigate(SPLASH_CONSTANTS.MFA_SCREEN);
            }
            else if (parsedData.access_token) {
                await storeToken(parsedData.access_token, "");
                getMemDetails();
            }
            else if (parsedData.error === "invalid_grant") {
                Keyboard.dismiss();
                setIsErrorBorder(true)
                setFieldError("password", isErrorDispaly(parsedData?.error_description))
                const getConfig = getAllEnvData();
                crashlytics().setAttributes({
                    endpoint: "/api/v1/Customer/Token",
                    method: "POST",
                    status: response?.status?.toString() ?? "no response",
                    appName: "Swakipay",
                    response: JSON.stringify(parsedData.error),
                    request: JSON.stringify(body ?? {}),
                });
                // Record a non-fatal error in Firebase Crashlytics
                crashlytics().recordError(new Error(`Invalid Grant Error: ${parsedData?.error_description || 'Unknown error'}`));
                // showAppToast(isErrorDispaly(parsedData?.error_description), "error");
                Sentry.withScope(scope => {
                    scope.setUser({ id: values.email });
                    scope.setTag('api_endpoint', "/api/v1/Customer/Token");
                    scope.setTag('api_method', 'POST');
                    scope.setTag('api_status_code', "422");
                    scope.setTag('app_name', "Swakipay");
                    scope.setTag('environment', "development");
                    scope.setExtra('Request Body', body);
                    scope.setExtra('Response Data', response?.data);
                    Sentry.addBreadcrumb({
                        category: 'http.error',
                        message: `API call to  ${getConfig.apiUrls.apiUrl}/api/v1/Customer/Token failed with status 422`,
                        level: 'error',
                    });

                    Sentry.captureException(
                        new Error(`Invalid Grant Error: ${parsedData?.error_description || 'Unknown error'}`)
                    );
                });
            } else {
                setError(t("GLOBAL_CONSTANTS.THE_SERVER_WAS_UNABLE_TO_COMPLETE_YOUR_REQUEST"))
            }

        } catch (error: any) {
            Keyboard.dismiss();
            crashlytics().setAttributes({
                endpoint: "/api/v1/Customer/Token",
                method: "POST",
                status: "400",
                appName: "Swakipay",
                response: JSON.stringify(error),
                request: JSON.stringify(error ?? {}),
            });
            crashlytics().recordError(error);
            const errorMessage = isErrorDispaly(error);
            setError(errorMessage);
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
        navigation.navigate(SPLASH_CONSTANTS.SIGN_UP);
    };
    const handleHideBorder = () => {
        setError("");
        setIsErrorBorder(false)
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
                            onSubmit={(values, { setFieldError }) => handleSignin(values, setFieldError)}
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
                                            rightIcon={<MaterialIcons name="login" size={s(24)} color={NEW_COLOR.INPUTFIELD_ICONCOLOR} />
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
                                        style={[commonStyles.mt8]}
                                        onPress={() => navigateToForgotPassword(setFieldValue)}
                                    >
                                        <TextMultiLangauge
                                            text={"GLOBAL_CONSTANTS.FORGOT_PASSWORD"}
                                            style={[commonStyles.forgottext]}
                                        />
                                    </TouchableOpacity>

                                    <ViewComponent style={[commonStyles.mt30]}>
                                        <ButtonComponent
                                            title={t("GLOBAL_CONSTANTS.LOG_IN")}
                                            onPress={handleSubmit}
                                            loading={loading}
                                            disable={loading || !values.email || !values.password || !!errors.email || !!errors.password}
                                        />
                                    </ViewComponent>

                                    <ViewComponent style={[{ marginTop: 'auto' }]}>
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
                                                style={[commonStyles.fs14, commonStyles.fw400, commonStyles.mx14, commonStyles.getStartedText]}
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
                                                activeOpacity={0.8}
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
                                                activeOpacity={0.8}
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
                                            style={[commonStyles.fw400, commonStyles?.fs12, { color: NEW_COLOR.PLACEHOLDER_TEXTCOLOR }]}
                                        />
                                        <TouchableOpacity onPress={navigateToSignup}>
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


export default LoginComponent;
