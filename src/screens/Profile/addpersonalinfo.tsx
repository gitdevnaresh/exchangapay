import React, { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  ScrollView,
  SafeAreaView,
  Switch,
  BackHandler,
} from "react-native";
import { useNavigation } from "@react-navigation/core";
import { Container } from "../../components";
import { useSelector } from "react-redux";
import { s } from "../../constants/theme/scale";
import { NEW_COLOR } from "../../constants/theme/variables";
import AntDesign from "react-native-vector-icons/AntDesign";
import ParagraphComponent from "../../components/Paragraph/Paragraph";
import DefaultButton from "../../components/DefaultButton";
import LabelComponent from "../../components/Paragraph/label";
import ErrorComponent from "../../components/Error";
import { Field, Formik } from "formik";
import InputDefault from "../../components/DefaultFiat";
import { CreateAccSchema } from "../../screens/Profile/PersonalInfoSchema";
import { commonStyles } from "../../components/CommonStyles";
import CardsModuleService from "../../services/card";
import {
  formatDateTimeAPI,
  isErrorDispaly,
  trimValues,
} from "../../utils/helpers";
import Loadding from "../../components/skeleton";
import { personalInfoLoader } from "./skeleton_views";
import { PERSONAL_INFORMATION } from "./constants";
import useEncryptDecrypt from "../../hooks/useEncryption_Decryption";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

const AddPersonalInfo = (props: any) => {
  const nameRef = useRef();
  const ref = useRef<any>(null);
  const navigation = useNavigation();
  const [errormsg, setErrormsg] = useState<string>("");
  const EditInfoLoader = personalInfoLoader(10);
  const userInfo = useSelector((state: any) => state.UserReducer?.userInfo);
  const [loadings, setLoadings] = useState<any>({
    btnLoading: false,
    editLoading: false,
    isEnabled: false,
  });
  const newDate = new Date();
  const { decryptAES, encryptAES } = useEncryptDecrypt();
  const userName = decryptAES(userInfo.userName);
  const [initValues, setInitValues] = useState({
    state: "",
    city: "",
    addressLine1: "",
    addressLine2: "",
    postalCode: "",
    isDefault: true,
  });

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

  useEffect(() => {
    if (props?.route?.params?.id) {
      getDatailsForUpdateTheRecords();
    } else {
      const initialVal = {
        state: "",
        city: "",
        addressLine1: "",
        addressLine2: "",
        postalCode: "",
        isDefault: true,
      };
      setInitValues(initialVal);
    }
  }, [props?.route?.params?.cardId]);

  const toggleSwitch = () => {
    setErrormsg("");
    setLoadings((prev: any) => ({ ...prev, isEnabled: !loadings?.isEnabled }));
  };
  const getDatailsForUpdateTheRecords = async () => {
    setLoadings((prev: any) => ({ ...prev, editLoading: true }));
    const addressId = props?.route?.params?.id;
    try {
      const response: any =
        await CardsModuleService?.getPersonalCustomerViewDetails(addressId);
      const initialVal = {
        state: response?.data?.state,
        city: response?.data?.city,
        addressLine1: response?.data?.addressLine1,
        addressLine2: response?.data?.addressLine2,
        postalCode: decryptAES(response?.data?.postalCode),
        isDefault: response?.data?.isDefault,
      };

      setInitValues(initialVal);
      setLoadings((prev: any) => ({
        ...prev,
        isEnabled: response?.data?.isDefault,
      }));
      setLoadings((prev: any) => ({ ...prev, editLoading: false }));
      setErrormsg("");
    } catch (error) {
      setErrormsg(isErrorDispaly(error));
      setLoadings((prev: any) => ({ ...prev, editLoading: false }));
    }
  };
  const onSubmit = async (values: any) => {
    setLoadings((prev: any) => ({ ...prev, btnLoading: true }));
    const trimedValues = trimValues(values);
    if (props?.route?.params?.id) {
      handleUpdate(trimedValues);
    } else {
      let Obj = {
        id: "00000000-0000-0000-0000-000000000000",
        provinceOrState: trimedValues.state,
        city: trimedValues.city,
        addressLine1: trimedValues.addressLine1,
        addressLine2: trimedValues.addressLine2,
        isDefault: loadings?.isEnabled,
        createdBy: encryptAES(userName),
        postalCode: encryptAES(trimedValues.postalCode),
        createdDate: formatDateTimeAPI(newDate),
      };
      try {
        const res: any = await CardsModuleService?.addPersonalInformation(Obj);
        if (res.status === 200) {
          props.navigation.goBack();
          setErrormsg("");
        } else {
          ref?.current?.scrollToPosition({ y: 0, animated: true });
          setErrormsg(isErrorDispaly(res));
        }
        setLoadings((prev: any) => ({ ...prev, btnLoading: false }));
      } catch (error) {
        ref?.current?.scrollToPosition({ y: 0, animated: true });
        setErrormsg(isErrorDispaly(error));
        setLoadings((prev: any) => ({ ...prev, btnLoading: false }));
      }
    }
  };

  const handleUpdate = async (values: any) => {
    setLoadings((prev: any) => ({ ...prev, btnLoading: true }));
    let updateObj = {
      id: props?.route?.params?.id,
      addressLine1: values.addressLine1,
      addressLine2: values.addressLine2,
      provinceOrState: values.state,
      city: values.city,
      postalCode: encryptAES(values.postalCode),
      isDefault: loadings?.isEnabled,
      modifiedBy: encryptAES(userName),
    };
    try {
      const res: any = await CardsModuleService?.updatePersonalInformation(
        updateObj
      );
      if (res.status === 200) {
        props.navigation.goBack();
      } else {
        ref?.current?.scrollToPosition({ y: 0, animated: true });
        setErrormsg(isErrorDispaly(res));
      }
      setLoadings((prev: any) => ({ ...prev, btnLoading: false }));
    } catch (error) {
      ref?.current?.scrollToPosition({ y: 0, animated: true });
      setErrormsg(isErrorDispaly(error));
      setLoadings((prev: any) => ({ ...prev, btnLoading: false }));
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleCloseError = () => {
    setErrormsg("");
  };

  return (
    <SafeAreaView style={[commonStyles.screenBg, commonStyles.flex1]}>
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps={PERSONAL_INFORMATION.HANDLED}
        showsVerticalScrollIndicator={false}
        ref={ref}
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        extraScrollHeight={20}
        extraHeight={100}
      >
        <Container style={commonStyles.container}>
          {loadings?.editLoading && (
            <View style={[commonStyles.flex1]}>
              <Loadding contenthtml={EditInfoLoader} />
            </View>
          )}
          {!loadings?.editLoading && (
            <>
              <View
                style={[
                  commonStyles.dflex,
                  commonStyles.mb43,
                  commonStyles.alignCenter,
                ]}
              >
                <TouchableOpacity
                  style={[styles.pr16, styles.px8]}
                  onPress={handleGoBack}
                >
                  <AntDesign
                    name={PERSONAL_INFORMATION.ARROW_LEFT}
                    size={s(22)}
                    color={NEW_COLOR.TEXT_BLACK}
                    style={{ marginTop: 3 }}
                  />
                </TouchableOpacity>
                <View>
                  {!props?.route?.params?.id && (
                    <ParagraphComponent
                      style={[
                        commonStyles.fs16,
                        commonStyles.textBlack,
                        commonStyles.fw700,
                      ]}
                      text={PERSONAL_INFORMATION.ADD_PERSONAL_INFORMATION}
                    />
                  )}
                  {props?.route?.params?.id && (
                    <ParagraphComponent
                      style={[
                        commonStyles.fs16,
                        commonStyles.textBlack,
                        commonStyles.fw700,
                      ]}
                      text={PERSONAL_INFORMATION.EDIT_PERSONAL_INFORMATION}
                    />
                  )}
                  <ParagraphComponent
                    text={PERSONAL_INFORMATION.NOTE_PLEASE_WRITE_IN_ENGLISH}
                    style={[commonStyles.fs10, styles.note, commonStyles.fw300]}
                  />
                </View>
              </View>
              {errormsg && (
                <ErrorComponent message={errormsg} onClose={handleCloseError} />
              )}
              <View>
                <Formik
                  initialValues={initValues}
                  onSubmit={onSubmit}
                  validationSchema={CreateAccSchema}
                  enableReinitialize
                  validateOnChange={false}
                  validateOnBlur={false}
                >
                  {(formik) => {
                    const { touched, handleSubmit, errors, handleBlur } =
                      formik;
                    return (
                      <View style={[commonStyles.mb20]}>
                        <>
                          <Field
                            touched={touched.addressLine1}
                            name="addressLine1"
                            label={PERSONAL_INFORMATION.ADDRESS_LINE_ONE}
                            error={errors.addressLine1}
                            handleBlur={handleBlur}
                            customContainerStyle={{}}
                            placeholder={
                              PERSONAL_INFORMATION.EG_ROOM2_BUILDINGA_888XXXX_STREET_XX
                            }
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
                            touched={touched.addressLine2}
                            name="addressLine2"
                            label={PERSONAL_INFORMATION.ADDRESS_LINE_TWO}
                            error={errors.addressLine2}
                            handleBlur={handleBlur}
                            customContainerStyle={{}}
                            placeholder={
                              PERSONAL_INFORMATION.EG_ROOM2_BUILDINGA_888XXXX_STREET_XX
                            }
                            component={InputDefault}
                            innerRef={nameRef}
                          />
                          <View style={[commonStyles.mb24]} />
                          <Field
                            touched={touched.state}
                            name="state"
                            label={PERSONAL_INFORMATION.PROVINCE_STATE}
                            error={errors.state}
                            handleBlur={handleBlur}
                            customContainerStyle={{}}
                            placeholder={
                              PERSONAL_INFORMATION.ENTER_PROVINCE_STATE
                            }
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
                            touched={touched.city}
                            name="city"
                            label={PERSONAL_INFORMATION.CITY}
                            error={errors.city}
                            handleBlur={handleBlur}
                            customContainerStyle={{}}
                            placeholder={PERSONAL_INFORMATION.ENTER_CITY}
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
                            touched={touched.postalCode}
                            name="postalCode"
                            label={PERSONAL_INFORMATION.POSTAL_CODE}
                            error={errors.postalCode}
                            handleBlur={handleBlur}
                            customContainerStyle={{}}
                            placeholder={PERSONAL_INFORMATION.ENTER_POSTAL_CODE}
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
                          <View
                            style={[
                              commonStyles.dflex,
                              commonStyles.alignCenter,
                              commonStyles.justifyEnd,
                              commonStyles.gap8,
                            ]}
                          >
                            <ParagraphComponent
                              text={PERSONAL_INFORMATION.SET_AS_DEFAULT}
                              style={[
                                commonStyles.fs14,
                                commonStyles.fw500,
                                commonStyles.textBlack,
                              ]}
                            />
                            <Switch
                              trackColor={{
                                false: "#767577",
                                true: "#F55D52",
                              }}
                              thumbColor={"#f4f3f4"}
                              ios_backgroundColor="#3e3e3e"
                              onValueChange={toggleSwitch}
                              value={loadings?.isEnabled}
                            />
                          </View>
                        </>
                        <View style={[commonStyles.mb43]} />
                        <View style={[commonStyles.mb43]} />
                        <DefaultButton
                          title={PERSONAL_INFORMATION.SAVE}
                          style={undefined}
                          loading={loadings.btnLoading}
                          disable={loadings.btnLoading}
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
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default AddPersonalInfo;

const styles = StyleSheet.create({
  px8: { paddingVertical: 8 },
  note: { color: NEW_COLOR.TEXT_BLACK, fontStyle: "italic" },
  pr16: { paddingRight: 16 },
});
