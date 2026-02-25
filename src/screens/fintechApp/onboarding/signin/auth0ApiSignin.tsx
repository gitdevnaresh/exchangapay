import React, { useState, useCallback, useEffect } from 'react';
import { Field, Formik } from 'formik';
import { useNavigation } from '@react-navigation/native';
import { getThemedCommonStyles } from "../../../../components/CommonStyles";
import { useLngTranslation } from "../../../../hooks/languagesHook/useLngTranslation";
import { Auth0SigninSchema, Auth0SigninFormValues } from "./schema";
import { isErrorDispaly } from '../../../../utils/helpers';
import useMemberLogin from '../../../../hooks/userInfoHook';
import { getAllEnvData } from '../../../../../Environment';
import SafeAreaViewComponent from '../../../../components/safeArea/safeArea';
import ViewComponent from '../../../../components/view/view';
import ButtonComponent from '../../../../components/buttons/button';
import InputDefault from '../../../../components/textInputComponents/DefaultFiat';
import CommonTouchableOpacity from '../../../../components/touchableComponents/touchableOpacity';
import TextMultiLangauge from '../../../../components/textComponets/multiLanguageText/textMultiLangauge';
import FormikTextInput from '../../../../components/textInputComponents/formik/textInput';
import { useThemeColors } from '../../../../hooks/themedHook/useThemeColors';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useDispatch } from 'react-redux';
import { setDeleteScreenPermissions, setMenuItems } from '../../../../redux/actions/actions';
import AuthService from '../../../../apiServices/onBoarding/auth';
import { useHardwareBackHandler } from '../../../../hooks/backHandleHook';
import useNotifications from '../../../../hooks/notifications/useNotification';
import ProfileService from '../../../../apiServices/profile';
import LabelComponent from '../../../../components/textComponets/lableComponent/lable';
import ParagraphComponent from '../../../../components/textComponets/paragraphText/paragraph';
import ErrorComponent from '../../../../components/errorDisplay/errorDisplay';
import { login, storeToken } from '../../../../apiServices/onBoarding/auth0Service';
import { Logger } from '../../../../utils/Logger';

const Auth0Signin = () => {
  const navigation = useNavigation<any>();
  const { t } = useLngTranslation();
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { getMemDetails } = useMemberLogin();
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const initialValues: Auth0SigninFormValues = {
    email: '',
    password: '',
  };
  const {
    fcmToken,
  } = useNotifications({
    isAuthenticated: true, // Pass your auth state
    onNotificationPress: (data) => {
      // Handle when user taps notification
    }
  });
  const dispatch = useDispatch<any>();
  useEffect(() => {
    if (fcmToken) {
      getToken();
    }
  }, [fcmToken]);
  const getNotificationPermission = async () => {
    try {
      const object = { value: fcmToken }
      await ProfileService.postPushNotification(object);
    } catch (error) {
      Logger.error("Error getting FCM token:", error);
    }
  };

  const handleSignin = async (
    values: Auth0SigninFormValues,
    { setFieldValue }: { setFieldValue: (field: string, value: any) => void }
  ) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const { oAuthConfig } = getAllEnvData();
      const body = {
        grant_type: "password",
        client_id: oAuthConfig.clientId,
        username: values?.email,
        password: values?.password,
        audience: oAuthConfig.audience,
        scope: oAuthConfig.scope,
        connection: oAuthConfig.dataBase,
      };
      const response: any = await login(body);
      if (response.status === 200) {
        const { access_token, refresh_token } = response.data;
        await storeToken(access_token, refresh_token);
        setLoading(false);
        getMemDetails();
        MenuPermission();
        getNotificationPermission();
      } else {
        const errorPayload = response?.data ?? response;
        setLoading(false);
        setErrorMsg(isErrorDispaly(errorPayload));
      }
    } catch (error: any) {
      setLoading(false);
      const auth0ErrorDetails = error.response?.data;
      if (auth0ErrorDetails && (auth0ErrorDetails.error === "access_denied" || auth0ErrorDetails.error === "invalid_grant")) {
        setErrorMsg(t("GLOBAL_CONSTANTS.INCORRECT_CREDENTIALS") || "Incorrect email address, username or password.");
        setFieldValue('password', '');
      } else {
        setErrorMsg(isErrorDispaly(auth0ErrorDetails ?? error));
      }
    }
  };

  const getToken = () => {
  };

  const MenuPermission = () => {
    AuthService.getMenuItems().then((res: any) => {
      if (res?.data?.length > 0) {
        dispatch(setMenuItems(res?.data));
        dispatch(setDeleteScreenPermissions({}));
      }
    }).catch((error: any) => {
      Logger.error("Error fetching menu items:", error);
    });
  };
  useHardwareBackHandler(() => {
    handleBackPress();
  })
  const handleBackPress = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.navigate("SplaceScreenW2");
    }
  }, [navigation]);

  return (
    <SafeAreaViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
      <KeyboardAwareScrollView
        contentContainerStyle={[{ flexGrow: 1 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        enableOnAndroid={true}
      >
        <ViewComponent style={[commonStyles.flex1, commonStyles.p24]}>
          <Formik
            initialValues={initialValues}
            validationSchema={Auth0SigninSchema}
            onSubmit={(values, formikActions) => handleSignin(values, formikActions)}
            enableReinitialize
            validateOnChange={true}
            validateOnBlur={true}
          >
            {({ touched, handleSubmit, errors, handleBlur }) => (
              <>

                <ViewComponent style={[commonStyles.sectionGap]} />
                <ViewComponent style={[commonStyles.sectionGap]} />


                <ViewComponent>
                  <ParagraphComponent style={[commonStyles.fs24, commonStyles.fw700, commonStyles.textWhite]} text={'Sign In'} />
                  <ViewComponent style={[commonStyles.sectionGap]} />

                  {errorMsg && <ErrorComponent message={errorMsg} onClose={() => setErrorMsg(null)} />}
                  <ViewComponent>
                    <Field
                      label={"GLOBAL_CONSTANTS.USER_NAME_OR_EMAIl"}
                      name="email"
                      touched={touched.email}
                      error={errors.email}
                      placeholder={t("GLOBAL_CONSTANTS.ENTER_USER_NAME_OR_EMAIL")}
                      placeholderTextColor={NEW_COLOR.PLACEHOLDER_TEXTCOLOR}
                      onBlur={handleBlur}
                      autoCapitalize="none"
                      component={InputDefault}
                      requiredMark={<LabelComponent text=" *" style={commonStyles.textError} />}
                    />
                    <ViewComponent style={[commonStyles.formItemSpace]} />
                    <FormikTextInput
                      label={"GLOBAL_CONSTANTS.PASSWORD"}
                      name="password"
                      placeholder={"GLOBAL_CONSTANTS.PASSWORD_PLACEHOLDER"}
                      placeholderTextColor={NEW_COLOR.PLACEHOLDER_TEXTCOLOR}
                      secureTextEntry={true}
                      isRequired={true}
                      maxLength={50}
                    />

                    <ViewComponent style={[commonStyles.dflex, commonStyles.mt12,]}>
                      <CommonTouchableOpacity onPress={() => navigation.navigate("ForgotPasswordScreen")}>
                        <ParagraphComponent
                          text={"GLOBAL_CONSTANTS.FORGOT_PASSWORD"}
                          style={[commonStyles.textGreen, commonStyles.fs14, commonStyles.fw600]}
                        />

                      </CommonTouchableOpacity>
                    </ViewComponent>
                    <ViewComponent style={[commonStyles.sectionGap]} />
                    <ViewComponent>
                      <ButtonComponent
                        title={t("GLOBAL_CONSTANTS.SIGN_IN")}
                        onPress={handleSubmit}
                        loading={loading}
                        disable={loading}
                      />
                    </ViewComponent>
                    <ViewComponent style={[commonStyles.buttongap]} />
                    <ButtonComponent
                      title={t("GLOBAL_CONSTANTS.CANCEL")}
                      onPress={handleBackPress}
                      solidBackground={true}
                      disable={loading}
                    />
                    {!loading && <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.mt20, commonStyles.justifyCenter, commonStyles.gap2]}>
                      <TextMultiLangauge
                        text={"GLOBAL_CONSTANTS.DIDT_HAVE_AN_ACCOUNT"}
                        style={[commonStyles.textWhite, commonStyles.fs14, commonStyles.fw500]}
                      />
                      <CommonTouchableOpacity onPress={() => navigation.navigate("Auth0Signup")}>
                        <ParagraphComponent
                          text={"GLOBAL_CONSTANTS.SIGN_UP"}
                          style={[commonStyles.textGreen, commonStyles.fs14, commonStyles.fw600, commonStyles.textCenter]}
                        />
                      </CommonTouchableOpacity>
                    </ViewComponent>}
                  </ViewComponent>
                </ViewComponent>
              </>
            )}
          </Formik>
        </ViewComponent>
      </KeyboardAwareScrollView>
    </SafeAreaViewComponent>
  );
};

export default Auth0Signin;
