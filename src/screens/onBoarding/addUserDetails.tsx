import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Formik, Field } from "formik";
import DatePickers from "react-native-date-picker";
import InputDefault from "../../components/DefaultFiat";
import DefaultButton from "../../components/DefaultButton";
import LabelComponent from "../../components/Paragraph/label";
import ParagraphComponent from "../../components/Paragraph/Paragraph";
import ErrorComponent from "../../components/Error";
import { SvgUri } from "react-native-svg";
import { commonStyles } from "../../components/CommonStyles";
import { NEW_COLOR } from "../../constants/theme/variables";
import { s } from "../../constants/theme/scale";
import {
  EMAIL_CONSTANTS,
  FormValues,
  USER_CONSTANTS,
  userValidationSchema,
} from "../../screens/onBoarding/constants";
import {
  formatDateMonth,
  formatDateTimeAPI,
  isErrorDispaly,
} from "../../utils/helpers";
import { Container } from "../../components";
import Feather from "react-native-vector-icons/Feather";
import AuthService from "../../services/auth";
import useMemberLogin from "../../hooks/useMemberLogin";
import useEncryptDecrypt from "../../hooks/useEncryption_Decryption";
import useSendUserWebhook from "../../hooks/useSendUserWebhook";
import useLogout from "../../hooks/useLogOut";
import { SafeAreaView } from "react-native-safe-area-context";

const AddUserDetails = (props: any) => {
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errorMsg, setErrorMsg] = useState<null>(null);
  const [saveLoading, setSaveLoading] = useState<boolean>(false);
  const { getMemDetails } = useMemberLogin();
  const { sendWebhook } = useSendUserWebhook();
  const { encryptAES } = useEncryptDecrypt();
  const { logout, isLoggingOut } = useLogout();
  const initialValues: FormValues = {
    firstName: "",
    lastName: "",
    dateOfBirth: null,
  };

  const handleSubmit = async (values: FormValues) => {
    setSaveLoading(true);
    try {
      const formatedDob = formatDateTimeAPI(dateOfBirth);
      const saveObj = {
        firstName: encryptAES(values.firstName),
        lastName: encryptAES(values.lastName),
        dateOfBirth: formatedDob,
      };
      const response = await AuthService.customerDetailsUpdate(saveObj);
      if (response?.ok) {
        setSaveLoading(false);
        getMemDetails();
        await sendWebhook("Update");
      } else {
        setSaveLoading(false);
        setErrorMsg(isErrorDispaly(response));
      }
    } catch (error: any) {
      setSaveLoading(false);
      setErrorMsg(isErrorDispaly(error));
    }
  };
  const handleCloseError = () => {
    setErrorMsg(null);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <SafeAreaView style={[commonStyles.screenBg, commonStyles.flex1]}>
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        extraScrollHeight={20}
        extraHeight={100}
        showsVerticalScrollIndicator={false}
      >
        <Container style={commonStyles.container}>
          <View style={[commonStyles.mb24, commonStyles.mt8]}>
            <View
              style={[
                commonStyles.dflex,
                commonStyles.alignCenter,
                commonStyles.mxAuto,
              ]}
            >
              <View>
                <SvgUri
                  uri={USER_CONSTANTS?.EXCHANGAPAY_LOGO}
                  width={s(61)}
                  height={s(55)}
                />
              </View>
              <ParagraphComponent
                text={USER_CONSTANTS?.EXCHANGA_PAY}
                style={[
                  commonStyles.fs32,
                  commonStyles.fw800,
                  commonStyles.textOrange,
                  commonStyles.textCenter,
                ]}
              />
            </View>
            <View style={[commonStyles.mb43]} />
            <ParagraphComponent
              style={[
                commonStyles.fs24,
                commonStyles.textBlack,
                commonStyles.fw600,
                commonStyles.textCenter,
                commonStyles.mb36,
              ]}
              text={"Let's Get You Started"}
            />
          </View>
          {errorMsg && (
            <ErrorComponent message={errorMsg} onClose={handleCloseError} />
          )}
          <Formik
            initialValues={initialValues}
            validationSchema={userValidationSchema}
            onSubmit={handleSubmit}
            validateOnChange={false}
            validateOnBlur={false}
          >
            {({ handleSubmit, errors, setFieldValue }) => (
              <>
                <Field
                  name="firstName"
                  placeholder={USER_CONSTANTS?.ENTER_FIRST_NAME}
                  label={USER_CONSTANTS?.FIRST_NAME_LABEL}
                  component={InputDefault}
                  error={errors.firstName}
                  Children={
                    <LabelComponent text={"*"} style={commonStyles.textError} />
                  }
                />
                <View style={[commonStyles.mb24]} />
                <Field
                  name="lastName"
                  label={USER_CONSTANTS?.LAST_NAME_LABEL}
                  Children={
                    <LabelComponent text={"*"} style={commonStyles.textError} />
                  }
                  placeholder={USER_CONSTANTS?.ENTER_LAST_NAME}
                  component={InputDefault}
                  error={errors.lastName}
                />
                <View style={[commonStyles.mb24]} />
                <View style={styles.fieldContainer}>
                  <LabelComponent
                    text={USER_CONSTANTS?.DATE_OF_BIRTH_LABEL}
                    Children={
                      <ParagraphComponent
                        text="*"
                        style={styles.requiredStar}
                      />
                    }
                  />
                  <View
                    style={[
                      styles.datePickerContainer,
                      commonStyles.dflex,
                      commonStyles.alignCenter,
                      commonStyles.justifyContent,
                    ]}
                  >
                    <ParagraphComponent
                      text={
                        dateOfBirth
                          ? formatDateMonth(dateOfBirth)
                          : USER_CONSTANTS?.DATE_OF_BIRTH_PLACEHOLDER
                      }
                      style={[
                        styles.dateText,
                        !dateOfBirth ? styles.placeholderText : null, // Corrected placeholder style
                      ]}
                    />
                    <View>
                      <Feather
                        name="calendar"
                        size={22}
                        color={NEW_COLOR.TEXT_BLACK}
                        onPress={() => setShowDatePicker(true)}
                      />
                    </View>
                  </View>
                  {errors.dateOfBirth && (
                    <ParagraphComponent
                      text={errors.dateOfBirth}
                      style={styles.errorText}
                    />
                  )}
                  {showDatePicker && (
                    <DatePickers
                      modal
                      mode="date"
                      title={"Select Date Of Birth"}
                      open={showDatePicker}
                      date={dateOfBirth || new Date()}
                      onConfirm={(date) => {
                        setShowDatePicker(false);
                        setDateOfBirth(date);
                        setFieldValue("dateOfBirth", date);
                      }}
                      onCancel={() => setShowDatePicker(false)}
                      maximumDate={new Date()}
                    />
                  )}
                </View>
                <View style={[commonStyles.mb24]} />
                <DefaultButton
                  title={USER_CONSTANTS?.CONFIRM_BUTTON}
                  onPress={handleSubmit}
                  loading={saveLoading}
                />
                <View style={[commonStyles.mb14]} />
                <View
                  style={[
                    commonStyles.dflex,
                    commonStyles.alignCenter,
                    commonStyles.justifyCenter,
                  ]}
                >
                  <TouchableOpacity
                    onPress={handleLogout}
                    style={[commonStyles.px10]}
                    disabled={saveLoading || isLoggingOut}
                  >
                    <ParagraphComponent
                      text={EMAIL_CONSTANTS.LOG_OUT}
                      style={[
                        commonStyles.alignCenter,
                        commonStyles.textOrange,
                        commonStyles.fs18,
                      ]}
                    />
                  </TouchableOpacity>
                </View>
              </>
            )}
          </Formik>
        </Container>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default AddUserDetails;

const styles = StyleSheet.create({
  fieldContainer: {
    marginBottom: 16,
  },
  spacing: {
    marginBottom: 16,
  },
  datePickerContainer: {
    borderWidth: 1,
    borderColor: NEW_COLOR.SEARCH_BORDER,
    borderRadius: 8,
    padding: 12,
    backgroundColor: NEW_COLOR.SCREENBG_WHITE,
  },
  dateText: {
    fontSize: 14,
    color: NEW_COLOR.TEXT_BLACK,
  },
  placeholderText: {
    color: NEW_COLOR.PLACEHOLDER_STYLE,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 4,
  },
  requiredStar: {
    color: "red",
    marginLeft: 4,
  },
});
