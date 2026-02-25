import React, { useState, useCallback, useEffect } from 'react';
import { BackHandler } from 'react-native';
import { useLngTranslation } from "../../../../../hooks/languagesHook/useLngTranslation";
import ButtonComponent from '../../../../../components/buttons/button';
import { getAllEnvData } from '../../../../../../Environment';
import { Auth0SignupFormValues, Auth0SignupSchema } from './schema';
import { useDispatch } from 'react-redux';
import { isLogin, loginAction, setUserInfo } from '../../../../../redux/actions/actions';
import ViewComponent from '../../../../../components/view/view';
import TextMultiLangauge from '../../../../../components/textComponets/multiLanguageText/textMultiLangauge';
import CommonTouchableOpacity from '../../../../../components/touchableComponents/touchableOpacity';
import { isErrorDispaly } from '../../../../../utils/helpers';
import { Field, Formik } from 'formik';
import { useNavigation } from '@react-navigation/native';
import SafeAreaViewComponent from '../../../../../components/safeArea/safeArea';
import FormikTextInput from '../../../../../components/textInputComponents/formik/textInput';
import { useThemeColors } from '../../../../../hooks/themedHook/useThemeColors';
import { getThemedCommonStyles } from '../../../../../components/CommonStyles';
import { PasswordCriteriaDisplay } from './constants';
import useMemberLogin from '../../../../../hooks/userInfoHook';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import LabelComponent from '../../../../../components/textComponets/lableComponent/lable';
import ParagraphComponent from '../../../../../components/textComponets/paragraphText/paragraph';
import ErrorComponent from '../../../../../components/errorDisplay/errorDisplay';
import { auth0Signup, login, storeToken } from '../../../../../apiServices/onBoarding/auth0Service';
import InputDefault from '../../../../../components/textInputComponents/DefaultFiat';

const Auth0Signup = () => {


  const navigation = useNavigation<any>();
  const { t } = useLngTranslation();
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPasswordFocused, setIsPasswordFocused] = useState<boolean>(false);
  const dispatch = useDispatch<any>();
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const { getMemDetails } = useMemberLogin();
  const initialValues: Auth0SignupFormValues = {
    email: '',
    username: '',
    password: '',
  };
  const handleBackPress = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.navigate("SplaceScreenW2");
      return true; // Indicate event is handled
    }
    return false; // Indicate event is not handled
  }, [navigation]);
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return () => backHandler.remove(); // Cleanup the listener on unmount
  }, [handleBackPress]);
  const handleSignup = async (values: Auth0SignupFormValues, { setFieldValue }: { setFieldValue: (field: string, value: any) => void }) => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const { oAuthConfig } = getAllEnvData();
      const body = {
        client_id: oAuthConfig.clientId,
        email: values.email,
        password: values.password,
        username: values.username,
        connection: "Arthapay"
      };
      const loginbody = {
        grant_type: "password",
        client_id: oAuthConfig.clientId,
        username: values?.email,
        password: values?.password,
        audience: oAuthConfig.audience,
        scope: oAuthConfig.scope,
        connection: "Arthapay",
      };
      const response: any = await auth0Signup(body);
      if (response && (response._id || response.email || response.user_id)) {
        const response2: any = await login(loginbody);
        const { access_token, refresh_token } = response2.data;
        await storeToken(access_token, refresh_token);
        setLoading(false);
        dispatch(loginAction(null));
        dispatch(setUserInfo(""));
        dispatch(isLogin(false));
        getMemDetails();
      } else {
        const errorMessage = (response?.description ?? (response?.message) ?? response?.error) ?? t("SIGNUP_FAILED_TRY_AGAIN");
        setLoading(false);
        setErrorMsg(isErrorDispaly(errorMessage));
      }
    } catch (error: any) {
      setLoading(false);
      const auth0ErrorDetails = error.response?.data;
      let finalErrorMessage: string = t("SIGNUP_FAILED_TRY_AGAIN");

      if (auth0ErrorDetails) {
        if (auth0ErrorDetails.code === "user_exists" || auth0ErrorDetails.description?.toLowerCase().includes("user already exists")) {
          finalErrorMessage = t("GLOBAL_CONSTANTS.EMAIL_ALREADY_REGISTERED");
        } else if (auth0ErrorDetails.code === "invalid_signup" && auth0ErrorDetails.data?.identifierType === "email") {
          finalErrorMessage = t("GLOBAL_CONSTANTS.EMAIL_ALREADY_REGISTERED");
        } else if (auth0ErrorDetails.name === "PasswordStrengthError" || auth0ErrorDetails.message?.toLowerCase().includes("password")) {
          finalErrorMessage = auth0ErrorDetails.message ?? "Password is too weak. Please choose a stronger password.";
        } else {
          finalErrorMessage = (auth0ErrorDetails.description ?? (auth0ErrorDetails.message) ?? auth0ErrorDetails.error) ?? finalErrorMessage;
        }
      } else if (error.message) {
        finalErrorMessage = error.message;
      }
      setErrorMsg(isErrorDispaly(finalErrorMessage));
    }
  };

  return (
    <SafeAreaViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
      <KeyboardAwareScrollView
        contentContainerStyle={[{ flexGrow: 1 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        enableOnAndroid={true}
      >
        <ViewComponent style={[commonStyles.flex1, commonStyles.p24]}>
          <ViewComponent style={commonStyles.flex1}>
            <Formik
              initialValues={initialValues}
              validationSchema={Auth0SignupSchema}
              onSubmit={(values, formikActions) => handleSignup(values, formikActions)}
            >
              {({ values, touched, handleSubmit, errors, handleBlur }) => (
                <>
                  <ViewComponent style={[commonStyles.sectionGap]} />
                  <ViewComponent style={[commonStyles.sectionGap]} />
                  <ViewComponent>
                    <ParagraphComponent style={[commonStyles.fs24, commonStyles.fw700, commonStyles.textWhite]} text={'Sign up'} />
                    <ViewComponent style={[commonStyles.sectionGap]} />
                    {errorMsg && <ErrorComponent message={errorMsg} onClose={() => setErrorMsg(null)} />}
                    <ViewComponent>
                      <Field editable={!loading} touched={touched.email} error={errors.email} label={"GLOBAL_CONSTANTS.EMAIL_"} name="email" style={[commonStyles.textInput, touched.email && errors.email && commonStyles.errorBorder]} placeholder={"GLOBAL_CONSTANTS.EMAIL_PLACEHOLDER"} placeholderTextColor={NEW_COLOR.PLACEHOLDER_TEXTCOLOR} onBlur={handleBlur} keyboardType="email-address" autoCapitalize="none" component={InputDefault} requiredMark={<LabelComponent text=" *" style={commonStyles.textError} />} />
                    </ViewComponent>
                    <ViewComponent style={[commonStyles.formItemSpace]} />
                    <ViewComponent>
                      <Field editable={!loading} label={"GLOBAL_CONSTANTS.USER_NAME"} touched={touched.username} error={errors.username} name="username" style={[commonStyles.textInput, touched.username && errors.username && commonStyles.errorBorder]} placeholder={"GLOBAL_CONSTANTS.ENTER_USER_NAME"} placeholderTextColor={NEW_COLOR.PLACEHOLDER_TEXTCOLOR} onBlur={handleBlur} autoCapitalize="none" component={InputDefault} requiredMark={<LabelComponent text=" *" style={commonStyles.textError} />} />
                    </ViewComponent>
                    <ViewComponent style={[commonStyles.formItemSpace]} />
                    <ViewComponent>
                      <FormikTextInput
                        editable={!loading}
                        label={"GLOBAL_CONSTANTS.PASSWORD"}
                        name="password"
                        placeholder={"GLOBAL_CONSTANTS.PASSWORD_PLACEHOLDER"}
                        placeholderTextColor={NEW_COLOR.PLACEHOLDER_TEXTCOLOR}
                        secureTextEntry={true}
                        isRequired={true}
                        custInput={[commonStyles.fs16]}
                        onFocus={() => {
                          setIsPasswordFocused(true);
                        }}
                        onBlur={() => {
                          setIsPasswordFocused(false);
                        }}
                        maxLength={50}
                      />
                      {(isPasswordFocused || (touched?.password && !!values.password)) && (
                        <PasswordCriteriaDisplay password={values.password} NEW_COLOR={NEW_COLOR} commonStyles={commonStyles} t={t} />
                      )}
                    </ViewComponent>
                    <ViewComponent style={[commonStyles.sectionGap]} />

                    <ViewComponent>
                      <ButtonComponent title={t("GLOBAL_CONSTANTS.SIGN_UP")} onPress={handleSubmit} loading={loading} disable={loading} />
                    </ViewComponent>
                    <ViewComponent style={[commonStyles.buttongap]}>
                      <ButtonComponent title={t("GLOBAL_CONSTANTS.CANCEL")} onPress={handleBackPress} solidBackground={true} disable={loading} />
                    </ViewComponent>
                    {!loading && <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.mt20, commonStyles.justifyCenter, commonStyles.gap2]}>
                      <TextMultiLangauge
                        text={"GLOBAL_CONSTANTS.ALREADY_HAVE_AN_ACCOUNT"}
                        style={[commonStyles.textWhite, commonStyles.fs14, commonStyles.fw400]}
                      />
                      <CommonTouchableOpacity onPress={() => navigation.navigate("Auth0Signin")}>
                        <ParagraphComponent
                          text={"GLOBAL_CONSTANTS.SIGN_IN"}
                          style={[commonStyles.textGreen, commonStyles.fs14, commonStyles.fw600, commonStyles.textCenter]}
                        />
                      </CommonTouchableOpacity>
                    </ViewComponent>}
                  </ViewComponent>
                </>
              )}
            </Formik>
          </ViewComponent>
        </ViewComponent>
      </KeyboardAwareScrollView>
    </SafeAreaViewComponent>
  );
};

export default Auth0Signup;
