import { BackHandler } from "react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { getThemedCommonStyles } from "../../../../components/CommonStyles";
import { Field, Formik } from "formik";
import InputDefault from '../../../../components/textInputComponents/DefaultFiat';
import RadioButton from "../../../../components/radiobutton/RadioButton";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { formatDateTimeAPI, isErrorDispaly } from "../../../../utils/helpers";
import { useSelector } from "react-redux";
import Container from "../../../../components/container/container";
import ProfileService from "../../../../apiServices/profile";
import AuthService from "../../../../apiServices/onBoarding/auth";
import { KycStep1Schema } from "../schema";
import ErrorComponent from "../../../../components/errorDisplay/errorDisplay";
import ViewComponent from "../../../../components/view/view";
import useEncryptDecrypt from "../../../../hooks/encDecHook";
import ButtonComponent from "../../../../components/buttons/button";
import { useThemeColors } from "../../../../hooks/themedHook/useThemeColors";
import DashboardLoader from "../../../../components/loader";
import { KycProfileFormValues, KycStepPostObject } from "./interface";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import SafeAreaViewComponent from "../../../../components/safeArea/safeArea";
import PageHeader from "../../../../components/pageHeader/pageHeader";
import LabelComponent from "../../../../components/textComponets/lableComponent/lable";
import ParagraphComponent from "../../../../components/textComponets/paragraphText/paragraph";
import DatePickerComponent from "../../../../components/datePickers/formik/datePicker";
import useCountryData from "../../../../hooks/countryDataHook/useCountryData";

const KycProfile = (props: any) => {
  const ref = useRef<any>(null);
  const userinfo = useSelector((state: any) => state.userReducer?.userDetails);
  const [errormsg, setErrormsg] = useState<any>('');
  const [genderLookups, setGenderLookups] = useState<any[]>([]);
  const isFocused = useIsFocused();
  const [loadingData, setLoadingData] = useState<boolean>(false);
  const [btnLoading, setBtnLoading] = useState<boolean>(false);
  const { decryptAES } = useEncryptDecrypt();
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const navigation = useNavigation();
  const [initValues, setInitValues] = useState<KycProfileFormValues>({
    firstName: userinfo?.firstName,
    lastName: userinfo?.lastName,
    gender: userinfo?.gender,
    dob: '',
  });
  const { genderPickerData } = useCountryData({
    loadGenders: true,
  });
  const today = new Date();


  // Subtract 18 years
  const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());

  const handleGoBack = useCallback(() => {
    navigation.goBack();
    return true;
  }, []);

  useEffect(() => {
    fetchLookUps();
    getPersionalDetails();
  }, [isFocused]);

  const handleRefresh = useCallback(() => {
    getPersionalDetails();
  }, [])

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleGoBack
    );
    return () => backHandler.remove();
  }, [handleGoBack]);

  const fetchLookUps = async () => {
    setErrormsg('')
    try {
      const response: any = await ProfileService.getprofileEditLookups();
      if (response.data?.Gender) {
        const mappedGenders = response.data.Gender.map((gender: any) => ({
          label: gender.name,
          name: gender.name,
        }));
        setGenderLookups(mappedGenders);
      }
    } catch (error) {
      ref?.current?.scrollTo({ y: 0, animated: true });
      setErrormsg(isErrorDispaly(error));
    }
  };

  const getPersionalDetails = async () => {
    setErrormsg('')
    setLoadingData(true);
    try {
      if (props?.route?.params?.customerId) {
        const res: any = await ProfileService.identityPersionalDetails();
        if (res?.ok) {
          const userDob = new Date(res?.data?.dob);
          const isValidDob =
            res?.data?.dob &&
            !isNaN(userDob.getTime()) &&
            userDob.getFullYear() > 1900 &&
            userDob <= maxDate;
          const initialValues = {
            firstName: res?.data?.firstName,
            lastName: res?.data?.lastName,
            gender: res?.data?.gender?.charAt(0).toUpperCase() + res?.data?.gender.slice(1),
            dob: isValidDob ? res?.data?.dob : null,
            idIssuingCountry: res?.data?.idIssuingCountry,
            documentType: res?.data?.documentType,
            docNumber: decryptAES(res?.data?.docNumber),
            docExpireDate: res?.data?.docExpireDate,
          }
          setInitValues(initialValues);
        } else {
          setErrormsg(isErrorDispaly(res));
        }
      } else {
        const response: any = await AuthService.getCustomerProfile(userinfo?.accountType);
        if (response?.ok) {
          const profileData = response.data;
          setInitValues(prev => ({
            ...prev,
            firstName: profileData?.firstName ?? '',
            lastName: profileData?.lastName ?? '',
            gender: profileData?.gender ?? '',
            idIssuingCountry: profileData?.country ?? '',
          }));
        } else {
          setErrormsg(isErrorDispaly(response));
        }
      }
    } finally {
      setLoadingData(false)
    }
  };

  const handleSave = async (values: any) => {
    setBtnLoading(true);
    let Obj: KycStepPostObject = {
      id: props?.route?.params?.customerId ?? "00000000-0000-0000-0000-000000000000",
      firstName: values?.firstName,
      lastName: values.lastName,
      gender: values.gender,
      dob: formatDateTimeAPI(values?.dob),
    }
    try {
      let response: any;
      if (props?.route?.params?.customerId) {
        response = await ProfileService.updateKycProfile(Obj);
      }
      else {
        response = await ProfileService.postKycProfile(Obj);
      }
      if (response?.ok) {
        setErrormsg(null);
        props?.navigation?.navigate(props?.route?.params?.customerId ? 'KycProfilePreview' : 'KycProfileStep2')
      }
    }
    catch (error) {
      setErrormsg(isErrorDispaly(error));
      setBtnLoading(false);
    }
    setBtnLoading(false);
  };

  const handleBack = useCallback(() => {
    props?.navigation?.goBack();
  }, []);

  const handleError = useCallback(() => {
    setErrormsg(null)
  }, []);

  return (
    <ViewComponent style={[commonStyles.screenBg, commonStyles.flex1]}>
      {loadingData ? (
        // This wrapper ensures the loader is centered on the full screen.
        <SafeAreaViewComponent style={[commonStyles.flex1, commonStyles.alignCenter, commonStyles.justifyCenter]}>
          <DashboardLoader />
        </SafeAreaViewComponent>
      ) : (
        <KeyboardAwareScrollView
          contentContainerStyle={[{ flexGrow: 1 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          enableOnAndroid={true}
        >
          <Container style={commonStyles.container}>
            <PageHeader title={props?.route?.params?.customerId ? "GLOBAL_CONSTANTS.EDIT_KYC" : "GLOBAL_CONSTANTS.KYC"} onBackPress={handleBack} isrefresh={!!props?.route?.params?.customerId} onRefresh={handleRefresh} />
            {errormsg && <ErrorComponent message={errormsg} onClose={handleError} />}
            <ViewComponent style={[commonStyles.mt8]} />
            <Formik
              initialValues={initValues}
              onSubmit={handleSave}
              validationSchema={KycStep1Schema}
              enableReinitialize={true}
            >
              {(formik) => {
                const {
                  touched,
                  handleSubmit,
                  errors,
                  handleBlur,
                  values, setFieldValue
                } = formik;
                return (
                  // 1. Wrap the form fields and buttons in a container with flex: 1.
                  //    This makes the entire form area fill the available space.
                  <ViewComponent style={{ flex: 1 }}>
                    {/* 2. This inner view holds the form fields and gets `flex: 1` 
                          to grow and push the buttons down. */}
                    <ViewComponent style={{ flex: 1 }}>
                      <Field
                        touched={touched?.firstName}
                        name="firstName"
                        label={"GLOBAL_CONSTANTS.FIRST_NAME"}
                        error={errors?.firstName}
                        handleBlur={handleBlur}
                        customContainerStyle={{}}
                        placeholder={"GLOBAL_CONSTANTS.FIRST_NAME_PLACEHOLDER"}
                        component={InputDefault}
                        editable={true}
                        innerRef={ref}
                        returnKeyType="next"
                        requiredMark={<LabelComponent text=" *" style={commonStyles.textError} />}
                        maxLength={50}
                      />
                      <ViewComponent style={[commonStyles.formItemSpace]} />
                      <Field
                        touched={touched?.lastName}
                        name="lastName"
                        label={"GLOBAL_CONSTANTS.LAST_NAME"}
                        error={errors?.lastName}
                        handleBlur={handleBlur}
                        customContainerStyle={{}}
                        placeholder={"GLOBAL_CONSTANTS.LAST_NAME_PLACEHOLDER"}
                        component={InputDefault}
                        innerRef={ref}
                        editable={true}
                        requiredMark={<LabelComponent text=" *" style={commonStyles.textError} />}
                        maxLength={50}
                      />
                      <ViewComponent style={[commonStyles.formItemSpace]} />
                      <LabelComponent text={"GLOBAL_CONSTANTS.GENDER"} style={[commonStyles.mb10]}>
                        <LabelComponent text=" *" style={commonStyles.textError} />
                      </LabelComponent>
                      <RadioButton
                        options={genderPickerData}
                        selectedOption={values?.gender}
                        onSelect={(val: any) => setFieldValue('gender', val)}
                        nameField='name' valueField='name'
                      />
                      {errors?.gender && (<ParagraphComponent style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textError, { marginLeft: 0 }]} text={errors?.gender} />)}
                      <ViewComponent style={[commonStyles.formItemSpace]} />
                      <DatePickerComponent name='dob' label="GLOBAL_CONSTANTS.DATE_OF_BIRTH" maximumDate={maxDate} placeholder="GLOBAL_CONSTANTS.DATE_PLACEHOLDER" />
                    </ViewComponent>
                    <ViewComponent>
                      <ButtonComponent
                        title="GLOBAL_CONSTANTS.NEXT"
                        onPress={handleSubmit}
                        loading={btnLoading}
                      />
                      <ViewComponent style={[commonStyles.buttongap]} />
                      <ButtonComponent title={"GLOBAL_CONSTANTS.CANCEL"} onPress={handleBack} solidBackground={true} />
                      <ViewComponent style={[commonStyles.sectionGap]} />
                    </ViewComponent>
                  </ViewComponent>
                );
              }}
            </Formik>
          </Container>
        </KeyboardAwareScrollView>
      )}
    </ViewComponent>
  );
};
export default KycProfile;
