import React, { useState } from 'react';
import { useLngTranslation } from "../../../hooks/useLngTranslation";
import ButtonComponent from '../../../newComponents/buttons/button';
import { storeMfaToken, storeToken } from '../../../services/auth0Service';
import { useDispatch, useSelector } from 'react-redux';
import { isLogin, loginAction, setStoredValues, setUserInfo } from '../../../redux/actions/actions';
import ViewComponent from '../../../newComponents/view/view';
import { isErrorDispaly } from '../../../utils/helpers';
import { Formik } from 'formik';
import { useNavigation } from '@react-navigation/native';
import FormikTextInput from '../../../newComponents/textInputComponents/formik/textInput';
import { useThemeColors } from '../../../hooks/useThemeColors';
import PageHeader from '../../../newComponents/pageHeader/pageHeader';
import OnboardingService from '../../../services/onboarding';
import { PasswordScreenSchema } from './signUpShema';
import { Auth0SignupFormValues, LoginValues } from '../interfaces';
import useEncryptDecrypt from '../../../hooks/encDecHook';
import { ActionLogParams, useActionLogging } from '../../../hooks/loggingHook';
import useMemberLogin from '../../../hooks/userInfoHook';
import crashlytics from '@react-native-firebase/crashlytics';
import { useHardwareBackHandler } from '../../../hooks/HardwareBackHandler';
import { getAllEnvData } from '../../../../Environment';
import * as Sentry from '@sentry/react-native';
import { Keyboard } from 'react-native';
import Container from '../../../newComponents/container/container';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { getThemedCommonStyles } from '../../../assets/styles/CommonStyles';
import ParagraphComponent from '../../../newComponents/textComponets/paragraphText/paragraph';
import { AntDesign } from '@expo/vector-icons';
import { s } from '../../../constants/theme/scale';
import { PasswordCriteriaDisplay } from './constants';
import ErrorComponent from '../../../newComponents/errorDisplay/errorDisplay';

const ConfirmPassword = () => {
  const navigation = useNavigation<any>();
  const { t } = useLngTranslation();
  const [loading, setLoading] = useState<boolean>(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState<boolean>(false);
  const dispatch = useDispatch<any>();
  const signupInfo = useSelector((state: any) => state.userReducer?.signupInfo);
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const { encryptAES } = useEncryptDecrypt("11AA7AE945754C128F2EC8DAFFE82416");
  const { logEvent } = useActionLogging();
  const { getMemDetails } = useMemberLogin();
  const [error, setError] = useState<string>("");
  const initialValues: Auth0SignupFormValues = {
    password: '',
    confirmPassword: '',
  };
  useHardwareBackHandler(() => {
    handleBackPress();
  })
  const handleSignup = async (values: Auth0SignupFormValues) => {
    setLoading(true);
    try {
      const body = {
        email: encryptAES(signupInfo?.email),
        password: encryptAES(values.password),
        referralCode: signupInfo?.guid || null,
      };
      dispatch(setStoredValues({
        fieldOne: encryptAES(signupInfo.email),
        fieldTwo: encryptAES(signupInfo.password),
      }));
      const response: any = await OnboardingService.register(body);
      if (response.ok) {
        await handleSignin({ email: signupInfo?.email, password: values.password });
        const { access_token, refresh_token } = response.data;
        await storeToken(access_token, refresh_token);
        setLoading(false);
        dispatch(loginAction(null));
        dispatch(setUserInfo(""));
        dispatch(isLogin(false));
      } else {
        Keyboard.dismiss();
        setLoading(false);
        setError(isErrorDispaly(response));
      }
    } catch (error: any) {
      const errorMessage = isErrorDispaly(error);
      if (error.response && error.response.data.error === 'mfa_required') {
        const actionData: ActionLogParams = {
          screename: 'Login',
          actionName: 'Navigate to MFA Screen',
          actionType: 'Navigation',
          nextScreenName: 'MfaScreen'
        };
        logEvent('navigation_action', actionData);
        await storeMfaToken(error.response.data.mfa_token);
        navigation.navigate("MfaScreen");
      } else {
        const errorData: ActionLogParams = {
          screename: 'Login',
          actionName: 'API Exception - login',
          actionType: 'Error',
          actionObj: { error: errorMessage, errorObj: error }
        };
        logEvent('error', errorData);
      }
    }
  };

  // Handles the login after successful registration
  const handleSignin = async (values: LoginValues) => {
    setLoading(true);
    try {
      const body = {
        username: encryptAES(values.email),
        password: encryptAES(values.password)

      }
      const response: any = await OnboardingService.auth0SignIn(body);
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
        return navigation.navigate("MfaScreen");
      } else if (parsedData.error === "invalid_grant") {
        crashlytics().setAttributes({
          endpoint: "/api/v1/Customer/Token",
          method: "POST",
          status: response?.status?.toString() ?? "no response",
          appName: "Swakipay",
          response: JSON.stringify(parsedData.error),
          request: JSON.stringify(body ?? {}),
        });
        // Record a non-fatal error in Firebase Crashlytics
        crashlytics().recordError(new Error(`Invalid Grant Error: ${parsedData?.error_description ?? 'Unknown error'}`));
        setError(isErrorDispaly(parsedData?.error_description));
        const getConfig = getAllEnvData()
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
      } else if (parsedData.access_token) {
        await storeToken(parsedData.access_token, "");
        getMemDetails();
      } else {
        const getConfig = getAllEnvData()
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
            new Error(`Invalid access token Error: ${parsedData?.error_description || 'Unknown error'}`)
          );
        });
        crashlytics().setAttributes({
          endpoint: "/api/v1/Customer/Token",
          method: "POST",
          status: "422",
          appName: "Swakipay",
          response: JSON.stringify(response?.data),
        });
        // Record a non-fatal error in Firebase Crashlytics
        crashlytics().recordError(response?.data);
      }

    } catch (error: any) {
      crashlytics().setAttributes({
        endpoint: "/api/v1/Customer/Token",
        method: "POST",
        status: "422",
        appName: "Swakipay",
        response: JSON.stringify(error),
      });
      // Record a non-fatal error in Firebase Crashlytics
      crashlytics().recordError(error);
      const errorMessage = isErrorDispaly(error);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handles back navigation
  const handleBackPress = () => {
    navigation.navigate("signup")
  };




  return (
    <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
      <KeyboardAwareScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        showsVerticalScrollIndicator={false}
      >
        <Container style={[{ flex: 1 }]}>
          <ViewComponent style={{ flex: 1 }}>
            <PageHeader
              onBackPress={handleBackPress}
              title={t("GLOBAL_CONSTANTS.ENTER_YOUR_PASSWORD")}
              disable={loading}
            />
           {error && <ErrorComponent message={error} screen={true} />}
            <ParagraphComponent
              text={t("GLOBAL_CONSTANTS.PLEASE_TYPE_SOMETHING_YOU_WILL_REMEMBER")}
              style={[commonStyles.textGrey,commonStyles.titleSectionGap ]}
            />

            <Formik
              initialValues={initialValues}
              validationSchema={PasswordScreenSchema}
              onSubmit={handleSignup}
              validateOnChange={true}
              validateOnBlur={true}
            >
              {({ values, touched, handleSubmit, handleBlur, errors }) => {
                let passwordsMatch;
                if (
                  values.password.length > 0 &&
                  values.confirmPassword.length > 0
                ) {
                  passwordsMatch = values.password === values.confirmPassword;
                }

                return (
                  <>
                    <FormikTextInput
                      label={t("GLOBAL_CONSTANTS.PASSWORD")}
                      name="password"
                      placeholder={t("GLOBAL_CONSTANTS.PASSWORD_PLACEHOLDER")}
                      placeholderTextColor={NEW_COLOR.PLACEHOLDER_TEXTCOLOR}
                      secureTextEntry={true}
                      onChangeText={() => setError("")}
                      isRequired={true}
                      onFocus={() => setIsPasswordFocused(true)}
                      onBlur={(e) => {
                        handleBlur('password')(e);
                        setIsPasswordFocused(false);
                      }}
                      maxLength={32}
                      custInput={[
                        passwordsMatch === false ? commonStyles.error_Border : null,
                        passwordsMatch === true ? commonStyles.success_Border : null,
                      ]}
                    />

                    <ViewComponent style={[commonStyles.formItemSpace]} />

                    <FormikTextInput
                      label={t("GLOBAL_CONSTANTS.CONFIRM_PASSWORD")}
                      name="confirmPassword"
                      placeholder={t("GLOBAL_CONSTANTS.ENTER_CONFIRM_PASSWORD")}
                      placeholderTextColor={NEW_COLOR.PLACEHOLDER_TEXTCOLOR}
                      secureTextEntry={true}
                      onChangeText={() => setError("")}
                      maxLength={32}
                      isRequired={true}
                      onFocus={() => setIsPasswordFocused(true)}
                      onBlur={(e) => {
                        handleBlur('confirmPassword')(e);
                        setIsPasswordFocused(false);
                      }}
                      custInput={[
                        passwordsMatch === false ? commonStyles.error_Border : null,
                        passwordsMatch === true ? commonStyles.success_Border : null,
                      ]}
                    />
                    {(passwordsMatch === false) && (
                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10]}>
                       <AntDesign
                        name="closecircleo"
                        size={s(14)}
                        color={NEW_COLOR.TEXT_RED}
                        style={[commonStyles.mt6]}
                    />
                      <ParagraphComponent
                        text={t("GLOBAL_CONSTANTS.PASSWORD_DO_NOT_MATCH")}
                        style={[commonStyles.fs14, commonStyles.mt4, commonStyles.textRed, commonStyles.fw400]} // Use your common error text style
                      />
                      </ViewComponent>
                    )}
                    {(isPasswordFocused ||
                      (touched?.password && !!values.password)) && (
                        <PasswordCriteriaDisplay
                          password={values.password}
                          NEW_COLOR={NEW_COLOR}
                          commonStyles={commonStyles}
                          t={t}
                          // passwordsMatch={passwordsMatch}
                        />
                      )}

                    {/* Push Button down */}
                    <ViewComponent style={{ flex: 1 }} />

                    <ViewComponent style={[commonStyles.sectionGap ]}>
                      <ButtonComponent
                        title={"GLOBAL_CONSTANTS.SIGN_UP"}
                        onPress={handleSubmit}
                        loading={loading}
                        disable={!passwordsMatch || loading}
                      />
                    </ViewComponent>
                  </>
                );
              }}
            </Formik>
          </ViewComponent>
        </Container>
      </KeyboardAwareScrollView>
    </ViewComponent>
  );
}

export default ConfirmPassword;