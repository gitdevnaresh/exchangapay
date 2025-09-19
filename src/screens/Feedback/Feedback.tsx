import { BackHandler, SafeAreaView, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { NEW_COLOR } from '../../constants/theme/variables';
import AntDesign from "react-native-vector-icons/AntDesign";
import { Container } from '../../components';
import { commonStyles } from '../../components/CommonStyles';
import ParagraphComponent from '../../components/Paragraph/Paragraph';
import { Field, Formik } from 'formik';
import DefaultButton from '../../components/DefaultButton';
import LabelComponent from '../../components/Paragraph/label';
import InputDefault from "../../components/DefaultFiat";
import { ms } from '../../constants/theme/scale';
import { FeedbackSchema } from './FeedbackSchma';
import ErrorComponent from '../../components/Error';
import { isErrorDispaly } from '../../utils/helpers';
import CryptoServices from '../../services/crypto';
import PhoneCodePicker from '../../components/PhoneCodeSelect';
import CardsModuleService from '../../services/card';
import { useIsFocused } from '@react-navigation/native';
import useEncryptDecrypt from '../../hooks/useEncryption_Decryption';


const Feedback = (props: any) => {
  const [btnLoading, setBtnLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<any>("");
  const ref = useRef<any>();
  const [countryCodelist, setCountryCodelist] = useState<any>([]);
  const isFocused = useIsFocused();
  const { encryptAES } = useEncryptDecrypt();
  const initialValues = {
    email: "",
    phoneNumber: "",
    feedback: "",
    phoneCode: ""


  }
  useEffect(() => {
    getListOfCountryCodeDetails();
  }, [isFocused])

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => { handleBackPress(); return true; }
    );
    return () => backHandler.remove();
  }, [])

  const handleBackPress = () => {
    props.navigation.goBack();
  };

  const getListOfCountryCodeDetails = async () => {
    const response: any = await CardsModuleService.getPersonalAddressLu();
    try {
      if (response?.status === 200) {
        setCountryCodelist(response?.data?.PhoneCodes);
        setErrorMsg("");
      } else {
        ref?.current?.scrollTo({ y: 0, animated: true });
        setErrorMsg(isErrorDispaly(response));
      }
    } catch (error) {
      ref?.current?.scrollTo({ y: 0, animated: true });
      setErrorMsg(isErrorDispaly(error));
    }

  };



  const handleSubnit = async (values: any) => {
    setBtnLoading(true)
    try {
      const obj = {
        "Email": encryptAES(values?.email),
        "PhoneNo": encryptAES(values?.phoneNumber),
        "State": "Submitted",
        "Feedback": values?.feedback
      }
      const response = await CryptoServices.saveFeedback(obj);
      if (response.ok) {
        props.navigation.navigate("FeedbackSuccess");
      } else {
        setErrorMsg(isErrorDispaly(response))
      }

      setBtnLoading(false)
    } catch (error) {
      ref?.current?.scrollTo({ y: 0, animated: true });
      setErrorMsg(isErrorDispaly(error))

      setBtnLoading(false)
    }

  }

  return (
    <SafeAreaView style={[commonStyles.flex1, commonStyles.screenBg]}>
      <ScrollView ref={ref}>
        <Container style={[commonStyles.container]}>
          <View style={[commonStyles.dflex, commonStyles.mb36, commonStyles.alignCenter, commonStyles.gap16]}>
            <TouchableOpacity onPress={() => handleBackPress()} activeOpacity={0.8}>
              <AntDesign name="arrowleft" size={22} color={NEW_COLOR.TEXT_BLACK} style={{ marginTop: 3 }} />
            </TouchableOpacity>
            <ParagraphComponent style={[commonStyles.fs16, commonStyles.textBlack, commonStyles.fw800]} text='Feedback' />
          </View>
          {errorMsg && (
            <ErrorComponent
              message={errorMsg}
              onClose={() => setErrorMsg("")}
            />
          )}

          <Formik
            initialValues={initialValues}
            onSubmit={handleSubnit}
            validationSchema={FeedbackSchema}
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
                setFieldValue,
                values,

              } = formik;
              return (
                <View style={[commonStyles.mb20]}>
                  <>

                    <Field
                      touched={touched.email}
                      name="email"
                      label={"Email"}
                      error={errors.email}
                      handleBlur={handleBlur}
                      customContainerStyle={{}}
                      placeholder={"Enter Email"}
                      component={InputDefault}
                      Children={
                        <LabelComponent
                          text=" *"
                          style={commonStyles.textError}
                        />
                      }
                    />
                    <View style={[commonStyles.mb24]} />
                    <LabelComponent
                      text={"Phone Number "}
                      Children={
                        <LabelComponent
                          text=" *"
                          style={commonStyles.textError}
                        />
                      }
                      style={[
                        commonStyles.fs12,
                        commonStyles.fw500,
                        NEW_COLOR.TEXT_LABEL,
                      ]}
                    />
                    <View style={[commonStyles.dflex, commonStyles.gap8]}>
                      <View style={[commonStyles.relative, commonStyles.gap8]}>
                        <PhoneCodePicker
                          modalTitle={"Select Country Code"}
                          style={undefined}
                          customBind={["name", "(", "code", ")"]}
                          data={countryCodelist}
                          value={values.phoneCode}
                          placeholder="Select"
                          containerStyle={[]}
                          onChange={(item) =>
                            setFieldValue("phoneCode", item.code)
                          }

                        />
                      </View>
                      <View style={[commonStyles.flex1]}>
                        <TextInput
                          style={[styles.inputStyle, styles.mb4]}
                          placeholder="Enter Phone Number"
                          onChangeText={handleChange("phoneNumber")}
                          onBlur={handleBlur("phoneNumber")}
                          value={values.phoneNumber}
                          keyboardType="phone-pad"
                          placeholderTextColor={NEW_COLOR.PLACEHOLDER_TEXTCOLOR}
                          multiline={false}

                        />
                      </View>
                    </View>
                    {((touched.phoneNumber || touched.phoneCode) && (errors.phoneNumber || errors?.phoneCode)) && <ParagraphComponent style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textError, { marginTop: 4 }]} text={(errors.phoneNumber || errors?.phoneCode)} />}

                    <View style={[commonStyles.mb24]} />
                    <Field
                      touched={touched.feedback}
                      name="feedback"
                      label={"Feedback "}
                      error={errors.feedback}
                      handleBlur={handleBlur}
                      customContainerStyle={{}}
                      placeholder={"Enter Feedback"}
                      component={InputDefault}
                      inputContainerStyle={{ height: 120 }}
                      inputHeight={120}
                      multiline={true}
                      textArea={true}
                      numberOfLines={5}
                      Children={
                        <LabelComponent
                          text=" *"
                          style={commonStyles.textError}
                        />
                      }
                    />
                  </>
                  <View style={[commonStyles.mb43]} />
                  <View style={[commonStyles.mb43]} />
                  <View style={[commonStyles.mb43]} />
                  <DefaultButton
                    title="Save"
                    style={undefined}
                    loading={btnLoading}
                    disable={btnLoading}
                    onPress={handleSubmit}
                  />
                </View>
              );
            }}

          </Formik>


        </Container>
      </ScrollView>
    </SafeAreaView>
  )
}

export default Feedback

const styles = StyleSheet.create({
  container: {

  }, inputStyle: {
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
})