import React, { useState } from 'react';
import { Formik } from 'formik';
import { useNavigation } from '@react-navigation/native';
import { useLngTranslation } from "../../../hooks/useLngTranslation";
import ButtonComponent from '../../../newComponents/buttons/button';
import FormikTextInput from '../../../newComponents/textInputComponents/formik/textInput';
import ViewComponent from '../../../newComponents/view/view';
import { ForgotPasswordSchema, ForgotPasswordFormValues } from "./schema";
import { isErrorDispaly } from '../../../utils/helpers';
import { useThemeColors } from '../../../hooks/useThemeColors';
import PageHeader from '../../../newComponents/pageHeader/pageHeader';
import { ActionLogParams, useActionLogging } from '../../../hooks/loggingHook';
import { showAppToast } from '../../../newComponents/ToasterMessages/ShowMessage';
import useEncryptDecrypt from '../../../hooks/encDecHook';
import OnboardingService from '../../../services/onboarding';
import { useHardwareBackHandler } from '../../../hooks/HardwareBackHandler';
import Container from '../../../newComponents/container/container';
import { getThemedCommonStyles } from '../../../assets/styles/CommonStyles';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Keyboard, ScrollView } from 'react-native';
import { s } from '../../../constants/theme/scale';
import ImageUri from '../../../newComponents/imageComponents/image';
import { COMMON_SVG_URLS } from '../../../assets/blobUrls';
import TextMultiLanguage from '../../../newComponents/textComponets/multiLanguageText/textMultiLangauge';
import ErrorComponent from '../../../newComponents/errorDisplay/errorDisplay';

const ForgotPasswordScreen = () => {
  const navigation = useNavigation<any>();
  const { t } = useLngTranslation();
  const [loading, setLoading] = useState<boolean>(false);
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const { logEvent } = useActionLogging();
  const { encryptAES } = useEncryptDecrypt("11AA7AE945754C128F2EC8DAFFE82416");
  const [errorMsg, setErrorMsg] = useState<string>('')
  const initialValues: ForgotPasswordFormValues = {
    email: '',
    termsAccepted: false
  };

  // Handles the form submission to request a password reset.
  const handleForgotPasswordSubmit = async (values: ForgotPasswordFormValues) => {
    setLoading(true);
    try {
      const body = {
        identifier: encryptAES(values.email),
        identifierType: "email",
        emailMetadata: {}
      }
      const response = await OnboardingService.ForgetPassword(body);
      if (response.status === 200) {
        const actionData: ActionLogParams = {
          screename: 'ForgotPassword',
          actionName: 'Password Reset Email Sent',
          actionType: 'Button',
          nextScreenName: 'Login'
        };
        logEvent('navigation_action', actionData);
        showAppToast(t("GLOBAL_CONSTANTS.PASSWORD_RESET_EMAIL_SENT"), "success", 2000);
        navigation.goBack();
      } else {
        const errorMessage = isErrorDispaly(response);
        setErrorMsg(isErrorDispaly(response));
        const errorData: ActionLogParams = {
          screename: 'ForgotPassword',
          actionName: 'API Error - requestPasswordChange',
          actionType: 'Error',
          actionObj: { error: errorMessage, response }
        };
        logEvent('error', errorData);
      }
    } catch (error: any) {
      const errorMessage = isErrorDispaly(error);
      setErrorMsg(isErrorDispaly(error));
      const errorData: ActionLogParams = {
        screename: 'ForgotPassword',
        actionName: 'API Exception - requestPasswordChange',
        actionType: 'Error',
        actionObj: { error: errorMessage, errorObj: error }
      };
      logEvent('error', errorData);
    } finally {
      Keyboard.dismiss();
      setLoading(false);
    }
  };
  // Manages the hardware back button behavior.
  useHardwareBackHandler(() => {
    handleGoBack();
  })
  // Navigates back to the previous screen.
  const handleGoBack = () => {
    const actionData: ActionLogParams = {
      screename: 'ForgotPassword',
      actionName: 'Navigate Back',
      actionType: 'Button',
      nextScreenName: 'Previous Screen'
    };
    logEvent('navigation_action', actionData);
    navigation.goBack();
  };

  return (
    <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
      <KeyboardAwareScrollView
        contentContainerStyle={[{ flexGrow: 1 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        enableOnAndroid={true} // Good practice to enable explicitly
      >
        <Formik
          initialValues={initialValues}
          validationSchema={ForgotPasswordSchema}
          onSubmit={handleForgotPasswordSubmit}
          validateOnChange={true}
          validateOnBlur={true}
        >
          {({ handleSubmit, values }) => {
            return (
              <>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={commonStyles.flexGrow1} keyboardShouldPersistTaps="handled">
                  <Container style={commonStyles.container}>
                    <ViewComponent>
                      <PageHeader onBackPress={handleGoBack} title={t('GLOBAL_CONSTANTS.FORGOT_PASSWORD')} />
                    </ViewComponent>
                    {errorMsg && <ErrorComponent message={errorMsg} />}
                    <ViewComponent style={[commonStyles.dflex, commonStyles.p12, commonStyles.rounded8, commonStyles.gap10]}>
                      <ImageUri uri={COMMON_SVG_URLS.alertIcon} height={s(24)} width={s(24)} />
                      <TextMultiLanguage text={"GLOBAL_CONSTANTS.FOR_ADDED_SECURITY_WITHDRAWAL_AND_INTERNAL_TRANSFERS_WILL_BE_DISABLED_AND_A_TRANSACTION_LIMIT_WILL_BE_SET_FOR_24_HOURS"} style={[commonStyles.fs14, commonStyles.fw400, commonStyles.flex1, commonStyles.textGrey]} />
                    </ViewComponent>
                    <ViewComponent style={[commonStyles.mt20]}>
                      <FormikTextInput
                        label={"GLOBAL_CONSTANTS.EMAIL_ADDRESS"}
                        name="email"
                        placeholder={"GLOBAL_CONSTANTS.ENTER_EMAIL_ADDRES"}
                        placeholderTextColor={NEW_COLOR.PLACEHOLDER_TEXTCOLOR}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        isRequired={true}
                        custInput={[commonStyles.fs16]}
                        onChange={() => { setErrorMsg('') }}
                        editable={!loading}
                      />
                    </ViewComponent>
                  </Container>
                </ScrollView>
                <ViewComponent style={[commonStyles.mt32, commonStyles.px24]}>
                  <ButtonComponent
                    title={t("GLOBAL_CONSTANTS.CONTINUE")}
                    onPress={handleSubmit}
                    loading={loading}
                    disable={loading || !values?.email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values?.email)}
                  />
                </ViewComponent>
                <ViewComponent style={[commonStyles.sectionGap]} />
                <ViewComponent style={[commonStyles.sectionGap]} />
              </>)
          }}
        </Formik>

      </KeyboardAwareScrollView>
    </ViewComponent>
  );
};

export default ForgotPasswordScreen;