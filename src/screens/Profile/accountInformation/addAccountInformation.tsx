import React, { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  ScrollView,
  SafeAreaView,
  BackHandler,
} from "react-native";
import { useIsFocused } from "@react-navigation/core";
import { Container } from "../../../components";
import { useSelector } from "react-redux";
import { ms, s } from "../../../constants/theme/scale";
import { NEW_COLOR } from "../../../constants/theme/variables";
import AntDesign from "react-native-vector-icons/AntDesign";
import ParagraphComponent from "../../../components/Paragraph/Paragraph";
import DefaultButton from "../../../components/DefaultButton";
import LabelComponent from "../../../components/Paragraph/label";
import ErrorComponent from "../../../components/Error";
import { Field, Formik } from "formik";
import CustomPickerAcc from "../../../components/CustomPicker";
import InputDefault from "../../../components/DefaultFiat";
import { AccountInfoSchema } from "../PersonalInfoSchema";
import { TextInput } from "react-native-gesture-handler";
import { commonStyles } from "../../../components/CommonStyles";
import CardsModuleService from "../../../services/card";
import { formatDateTimeAPI, isErrorDispaly, trimValues } from "../../../utils/helpers";
import PhoneCodePicker from "../../../components/PhoneCodeSelect";
import Loadding from "../../../components/skeleton";
import { personalInfoLoader } from "../skeleton_views";
import { ACCOUNT_INFORMATION_CONSTANTS } from "../constants";

const AddAccountInformation = (props: any) => {
  const nameRef = useRef();
  const ref = useRef<any>(null);
  const [errormsg, setErrormsg] = useState<string>("");
  const skeltons = personalInfoLoader(10);
  const userInfo = useSelector((state: any) => state.UserReducer?.userInfo);
  const isFocused = useIsFocused();
  const [lists, setLists] = useState<any>({ countries: [], countryCodelist: [] });
  const [loadingState, setLoadingState] = useState<any>({ isdataLoading: false, isbtnLoading: false });
  const [initValues, setInitValues] = useState({
    firstName: "",
    lastName: "",
    country: "",
    phoneNumber: "",
    email: "",
    phoneCode: "",
    userName: "",
  });

  useEffect(() => {
    getCountriesList();
    getCountryCodes();
    getDatailsForUpdateTheRecords();


  }, [isFocused]);
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        handleGoBack();
        return true;
      }
    );
    return () => backHandler.remove();
  }, []);

  const getCountryCodes = async () => {
    try {
      const response: any = await CardsModuleService.getPersonalAddressLu();
      if (response?.status === 200) {
        setLists((prev: any) => ({ ...prev, countryCodelist: response?.data?.PhoneCodes }))
        setErrormsg("");
      } else {
        ref?.current?.scrollTo({ y: 0, animated: true });
        setErrormsg(isErrorDispaly(response));
      }
    } catch (error) {
      ref?.current?.scrollTo({ y: 0, animated: true });
      setErrormsg(isErrorDispaly(error));
    }

  };


  const getDatailsForUpdateTheRecords = async () => {
    setLoadingState((prev: any) => ({ ...prev, isdataLoading: true }))
    try {
      const response: any = await CardsModuleService.getAccountInformation();
      const initialVal = {
        firstName: response?.data?.firstName,
        lastName: response?.data?.lastName,
        country: response?.data?.country,
        phoneNumber: response?.data?.mobileNumber,
        phoneCode: response?.data?.mobileCode,
        postalCode: response?.data?.postalCode,
        email: response?.data?.email,
        userName: response?.data?.userName
      }
      setInitValues(initialVal);
      setErrormsg("");
      setLoadingState((prev: any) => ({ ...prev, isdataLoading: false }))

    } catch (error) {
      setErrormsg(isErrorDispaly(error));
      setLoadingState((prev: any) => ({ ...prev, isdataLoading: false }))

    }
  };

  const handleUpdate = async (values: any) => {
    setLoadingState((prev: any) => ({ ...prev, isbtnLoading: true }))
    const modifiedDate = formatDateTimeAPI(new Date())
    const trimedValues = trimValues(values);
    const Obj = {
      "userName": trimedValues?.userName,
      "email": trimedValues?.email,
      "firstName": trimedValues?.firstName,
      "lastName": trimedValues?.lastName,
      "mobileNumber": trimedValues?.phoneNumber,
      "mobileCode": trimedValues?.phoneCode,
      "country": trimedValues.country,
      "modifiedDate": modifiedDate,
    }
    try {
      const res: any = await CardsModuleService?.updateAccountInformation(Obj);
      if (res.status === 200) {
        props.navigation.goBack()
      } else {
        ref?.current?.scrollTo({ y: 0, animated: true });
        setErrormsg(isErrorDispaly(res));
      }
      setLoadingState((prev: any) => ({ ...prev, isbtnLoading: false }))
    } catch (error) {
      ref?.current?.scrollTo({ y: 0, animated: true });
      setErrormsg(isErrorDispaly(error));
      setLoadingState((prev: any) => ({ ...prev, isbtnLoading: false }))
    }
  };
  const handleGoBack = () => {
    props.navigation.goBack()
  };
  const getCountriesList = async () => {
    try {
      const response: any = await CardsModuleService.getTowns();
      if (response?.status === 200) {
        const fetchedCountries = response?.data;
        setLists((prev: any) => ({ ...prev, countries: fetchedCountries }))
      } else {
        ref?.current?.scrollTo({ y: 0, animated: true });
        setErrormsg(isErrorDispaly(response));
      }
    } catch (error) {
      setErrormsg(isErrorDispaly(error));

    }
  };

  const handleErrorClose = () => {
    setErrormsg("")
  };

  return (
    <SafeAreaView style={[commonStyles.screenBg, commonStyles.flex1]}>
      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Container style={commonStyles.container}>
          {loadingState?.isdataLoading && (
            <View style={[commonStyles.flex1]}>
              <Loadding contenthtml={skeltons} />
            </View>
          )}
          {!loadingState?.isdataLoading && (
            <>
              <View style={[commonStyles.dflex, commonStyles.mb43, commonStyles.alignCenter]} >
                <TouchableOpacity style={[styles.pr16, styles.px8]} onPress={handleGoBack}>
                  <AntDesign name={ACCOUNT_INFORMATION_CONSTANTS.ARROW_LEFT} size={s(22)} color={NEW_COLOR.TEXT_BLACK} style={{ marginTop: 3 }} />
                </TouchableOpacity>
                <View>
                  <ParagraphComponent style={[commonStyles.fs16, commonStyles.textBlack, commonStyles.fw700]} text={ACCOUNT_INFORMATION_CONSTANTS.EDIT_ACCOUNT_INFORMATION} />
                  <ParagraphComponent
                    text={ACCOUNT_INFORMATION_CONSTANTS.NOTE_PLEASE_WRITE_IN_ENGLISH}
                    style={[commonStyles.fs10, styles.note, commonStyles.fw300]} />
                </View>
              </View>
              {errormsg && (
                <ErrorComponent message={errormsg} onClose={handleErrorClose} />)}
              <View>
                <Formik
                  initialValues={initValues}
                  onSubmit={handleUpdate}
                  validationSchema={AccountInfoSchema}
                  enableReinitialize
                  validateOnChange={false}
                  validateOnBlur={false}
                >
                  {(formik) => {
                    const {
                      touched,
                      handleSubmit,
                      errors,
                      handleChange,
                      handleBlur,
                      values,
                      setFieldValue,
                    } = formik;
                    return (
                      <View style={[commonStyles.mb20]}>
                        <>

                          <Field
                            touched={touched.userName}
                            name="userName"
                            label={ACCOUNT_INFORMATION_CONSTANTS.USER_NAME}
                            error={errors.userName}
                            handleBlur={handleBlur}
                            customContainerStyle={{}}
                            placeholder={ACCOUNT_INFORMATION_CONSTANTS.ENTER_USER_NAME}
                            component={InputDefault}
                            innerRef={nameRef}
                            editable={false}
                            Children={<LabelComponent text=" *" style={commonStyles.textError} />}
                          />
                          <View>

                            <View style={[commonStyles.mb24]} />
                            <Field
                              touched={touched.email}
                              name="email"
                              label={ACCOUNT_INFORMATION_CONSTANTS.EMAIL}
                              error={errors.email}
                              handleBlur={handleBlur}
                              customContainerStyle={{}}
                              placeholder={ACCOUNT_INFORMATION_CONSTANTS.ENTER_EMAIL}
                              component={InputDefault}
                              editable={false}
                              innerRef={nameRef}
                              Children={
                                <LabelComponent text=" *" style={commonStyles.textError} />
                              }
                            />
                            <View style={[commonStyles.mb24]} />
                            <Field
                              touched={touched.firstName}
                              name="firstName"
                              label={ACCOUNT_INFORMATION_CONSTANTS.FIRST_NAME}
                              error={errors.firstName}
                              handleBlur={handleBlur}
                              customContainerStyle={{}}
                              placeholder={ACCOUNT_INFORMATION_CONSTANTS.ENTER_FIRST_NAME}
                              component={InputDefault}
                              innerRef={nameRef}
                              Children={
                                <LabelComponent
                                  text=" *"
                                  style={commonStyles.textError}
                                />
                              }
                            />
                            <View style={[commonStyles.mb24]} />
                            <Field
                              touched={touched.lastName}
                              name="lastName"
                              label={ACCOUNT_INFORMATION_CONSTANTS.LAST_NAME}
                              error={errors.lastName}
                              handleBlur={handleBlur}
                              customContainerStyle={{}}
                              placeholder={ACCOUNT_INFORMATION_CONSTANTS.ENTER_LAST_NAME}
                              component={InputDefault}
                              innerRef={nameRef}
                              Children={
                                <LabelComponent text=" *" style={commonStyles.textError} />
                              }
                            />
                          </View>
                          <View style={[commonStyles.mb28]} />
                          <LabelComponent
                            text={ACCOUNT_INFORMATION_CONSTANTS.MOBILE_NUMBER}
                            Children={
                              <LabelComponent text=" *" style={commonStyles.textError} />
                            }
                            style={[commonStyles.fs12, commonStyles.fw500, NEW_COLOR.TEXT_LABEL]} />
                          <View style={[commonStyles.relative, commonStyles.dflex, commonStyles.gap8]}>
                            <PhoneCodePicker
                              modalTitle={ACCOUNT_INFORMATION_CONSTANTS.SELECT_COUNTRY_CODE}
                              style={undefined}
                              customBind={["name", "(", "code", ")"]}
                              data={lists?.countryCodelist}
                              value={values.phoneCode}
                              placeholder="Select"
                              containerStyle={[]}
                              onChange={(item) =>
                                setFieldValue("phoneCode", item.code)
                              }
                            />
                            <TextInput
                              style={[styles.inputStyle]}
                              placeholder={ACCOUNT_INFORMATION_CONSTANTS.ENTER_PHONE_NUMBER}
                              onChangeText={(text) => handleChange("phoneNumber")(text.replace(/[^0-9]/g, ""))}
                              onBlur={handleBlur("phoneNumber")}
                              value={values.phoneNumber}
                              keyboardType={ACCOUNT_INFORMATION_CONSTANTS.PHONE_PAD}
                              placeholderTextColor={NEW_COLOR.PLACEHOLDER_STYLE}
                              multiline={false}
                            />
                          </View>
                          {(errors.phoneCode || errors.phoneNumber) && <ParagraphComponent style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textError, { marginTop: 4 }]} text={(errors.phoneNumber || errors.phoneCode)} />}
                          <View style={[commonStyles.mb24]} />

                          <Field
                            activeOpacity={0.9}
                            style={{
                              backgroundColor: 'NEW_COLOR.SCREENBG_WHITE',
                              borderColor: 'NEW_COLOR.SEARCH_BORDER',
                            }}
                            label={ACCOUNT_INFORMATION_CONSTANTS.COUNTRY}
                            touched={touched.country}
                            customContainerStyle={{}}
                            name="country"
                            error={errors.country}
                            handleBlur={handleBlur}
                            modalTitle={ACCOUNT_INFORMATION_CONSTANTS.SELECT_COUNTRY}
                            data={lists?.countries}
                            placeholder={ACCOUNT_INFORMATION_CONSTANTS.SELECT_COUNTRY}
                            placeholderTextColor={NEW_COLOR.PLACEHOLDER_TEXTCOLOR}
                            component={CustomPickerAcc}
                            Children={
                              <LabelComponent
                                text=" *"
                                style={commonStyles.textError}
                              />
                            }
                          />
                          <View style={[commonStyles.mb24]} />
                        </>
                        <View style={[commonStyles.mb43]} />
                        <View style={[commonStyles.mb43]} />
                        <DefaultButton
                          title={ACCOUNT_INFORMATION_CONSTANTS.SAVE}
                          style={undefined}
                          loading={loadingState?.isbtnLoading}
                          disable={loadingState?.isbtnLoading}
                          onPress={handleSubmit}
                        />
                      </View>
                    );
                  }}
                </Formik>
              </View>
            </>
          )}
        </Container>
      </ScrollView>
    </SafeAreaView>

  );
};

export default AddAccountInformation;

const styles = StyleSheet.create({
  ml12: {
    marginLeft: 12,
  },
  px8: { paddingVertical: 8 },
  arrowposition: {
    position: "absolute",
    right: 8,
    top: 6,
  },
  note: { color: NEW_COLOR.TEXT_BLACK, fontStyle: "italic" },
  mb6: {
    marginBottom: 6,
  },
  inputStyle: {
    borderColor: NEW_COLOR.SEARCH_BORDER,
    backgroundColor: NEW_COLOR.SCREENBG_WHITE,
    borderWidth: 1,
    borderRadius: 8,
    height: 46,
    fontSize: ms(14),
    fontWeight: "400",
    color: NEW_COLOR.TEXT_BLACK,
    paddingLeft: 14,
    paddingRight: 16,
    flex: 1,
    multiline: false,
    textAlignVertical: 'center',
  },
  codeWidth: { flex: 1 },
  pr16: { paddingRight: 16 },
  mr8: { marginRight: 8 },
});


