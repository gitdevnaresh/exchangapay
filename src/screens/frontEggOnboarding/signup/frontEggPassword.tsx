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
import { PasswordScreenSchema } from './signUpShema';
import useEncryptDecrypt from '../../../hooks/encDecHook';
import { ActionLogParams, useActionLogging } from '../../../hooks/loggingHook';
import useMemberLogin from '../../../hooks/userInfoHook';
import { showAppToast } from '../../../newComponents/ToasterMessages/ShowMessage';
import crashlytics from '@react-native-firebase/crashlytics';
import { useHardwareBackHandler } from '../../../hooks/HardwareBackHandler';
import { Keyboard } from 'react-native';
import Container from '../../../newComponents/container/container';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { getThemedCommonStyles } from '../../../assets/styles/CommonStyles';
import ParagraphComponent from '../../../newComponents/textComponets/paragraphText/paragraph';
import { AntDesign } from '@expo/vector-icons';
import { s } from '../../../constants/theme/scale';
import { PasswordCriteriaDisplay } from './constants';
import { Auth0SignupFormValues, LoginValues } from '../../onboarding/interfaces';
import { FrontEggService, updateFcmToken } from '../../../apiServices/fronteggApiServices/fronteggServices';
import ErrorComponent from '../../../newComponents/errorDisplay/errorDisplay';
import { getTabsConfigation } from '../../../../configuration';

const FrontEggConfirmPassword = () => {
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
    if (!loading) {
      handleBackPress();

    }
  })
  const handleSignup = async (values: Auth0SignupFormValues) => {
    setError("");
    Keyboard.dismiss();
    setLoading(true);
    try {
      const body = {
        "provider": "local",
        "email": encryptAES(signupInfo?.email),
        "username": "",
        "password": encryptAES(values.password),
        "skipInviteEmail": true,
        "companyName": "Bullswipe",
        "metadata": signupInfo?.guid ? JSON.stringify({
          "referralCode": (signupInfo?.guid)
        }) : ""
      }
      dispatch(setStoredValues({
        fieldOne: encryptAES(signupInfo.email),
        fieldTwo: encryptAES(signupInfo.password),
      }));
      const response = await FrontEggService.userSignup(body);

      if (response?.status === 200) {
        await handleSignin({ email: signupInfo?.email, password: values.password });
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
      setLoading(false);
      setError(isErrorDispaly(error));
      const errorData: ActionLogParams = {
        screename: 'Login',
        actionName: 'API Exception - login',
        actionType: 'Error',
        actionObj: { error: error, errorObj: error }
      };
      logEvent('error', errorData);
    }

  };

  // Handles the login after successful registration
  const handleSignin = async (values: LoginValues) => {
    setLoading(true);
    try {
      const body = {
        email: encryptAES(values.email),
        password: encryptAES(values.password)

      }
      const response: any = await FrontEggService.userSignIn(body);
      if (response?.status === 200) {
        const actionData: ActionLogParams = {
          screename: 'Login',
          actionName: 'Login Success',
          actionType: 'API',
          actionObj: { email: values.email }
        };
        logEvent('login_success', actionData);
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
        } else {
          updateFcmToken();
          await storeToken(parsedData.accessToken, parsedData?.refreshToken);
          getMemDetails();
        }
      } else {
        crashlytics().setAttributes({
          endpoint: "/api/v1/Customer/Token",
          method: "POST",
          status: "422",
          appName: "Swakipay",
          response: JSON.stringify(response),
        });
        // Record a non-fatal error in Firebase Crashlytics
        crashlytics().recordError(response);
        const errorMsg = response?.errors[0] || isErrorDispaly(response);
        showAppToast(errorMsg, "error");
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
      const errorMsg = error?.errors[0] || isErrorDispaly(error);
      showAppToast(errorMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  // Handles back navigation
  const handleBackPress = () => {
    navigation.navigate("frontEggSignup");
  };

  const isPasswordValid = (password: string | undefined) => {
    if (!password) return false;

    const Configuration: any = getTabsConfigation("PASSWORD_LEVEL");
    const criteria = Configuration.criteria[Configuration.passwordLevel];

    const checks = [
      password.length >= criteria.minLength,
      /[A-Z]/.test(password),
      /[a-z]/.test(password),
      /[0-9]/.test(password),
      /[!@#$%^&*_-]/.test(password),
      !new RegExp(`(.)\\1{${(criteria.maxRecurringChars || 3) - 1},}`).test(password),
    ];

    return checks.every(Boolean);
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
              style={[commonStyles.textGrey, commonStyles.titleSectionGap, commonStyles.fs14, commonStyles.fw400]}
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
                const isPasswordCriteriaMet = isPasswordValid(values.password);

                const isSignupEnabled =
                  passwordsMatch &&
                  isPasswordCriteriaMet &&
                  !loading;
                return (
                  <>
                    <FormikTextInput
                      label={t("GLOBAL_CONSTANTS.PASSWORD")}
                      name="password"
                      placeholder={t("GLOBAL_CONSTANTS.PASSWORD_PLACEHOLDER")}
                      placeholderTextColor={NEW_COLOR.PLACEHOLDER_TEXTCOLOR}
                      secureTextEntry={true}
                      isRequired={true}
                      onChangeText={() => setError("")}
                      onFocus={() => setIsPasswordFocused(true)}
                      editable={!loading}
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
                      maxLength={32}
                      editable={!loading}
                      isRequired={true}
                      onChangeText={() => setError("")}
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

                    <ViewComponent style={[commonStyles.sectionGap]}>
                      <ButtonComponent
                        title={"GLOBAL_CONSTANTS.SIGN_UP"}
                        onPress={handleSubmit}
                        loading={loading}
                        disable={!isSignupEnabled}
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

export default FrontEggConfirmPassword;