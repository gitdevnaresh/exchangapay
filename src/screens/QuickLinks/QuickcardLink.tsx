import { SafeAreaView, ScrollView, TouchableOpacity, View } from 'react-native';
import React, { useRef, useState } from 'react';
import { NEW_COLOR } from '../../constants/theme/variables';
import AntDesign from "react-native-vector-icons/AntDesign";
import { Container } from '../../components';
import { commonStyles } from '../../components/CommonStyles';
import ParagraphComponent from '../../components/Paragraph/Paragraph';
import { Field, Formik } from 'formik';
import LabelComponent from '../../components/Paragraph/label';
import DefaultButton from '../../components/DefaultButton';
import InputDefault from '../../components/DefaultFiat';
import { QuickLinkSchema, QuickLinksWithoutEnvolop } from './QuickLinkingSchema';
import CardsModuleService from '../../services/card';
import { isErrorDispaly } from '../../utils/helpers';
import ErrorComponent from '../../components/Error';
import { s } from '../../constants/theme/scale';
import useEncryptDecrypt from '../../hooks/useEncryption_Decryption';

const QuickcardLink = (props: any) => {
  const ref = useRef<any>(null);
  const [initialValues, setInitialValues] = useState<any>({ cardNumber: "", envelopNumber: "" });
  const [errorMsg, setErrorMsg] = useState<any>(null);
  const [btnLoading, setbtnLoading] = useState<boolean>(false);
  const { encryptAES } = useEncryptDecrypt();

  const handleBackPress = () => {
    props.navigation.goBack();
  };
  const getCardDetails = async (values: any) => {
    setErrorMsg("")
    setbtnLoading(true);
    try {
      const obj = {
        id: props?.route?.params?.cardId,
        envelopeNumber: encryptAES(values?.envelopNumber),
        cardNumber: encryptAES(values?.cardNumber)
      }
      const response = await CardsModuleService.postCardDetails(obj);
      if (response.ok) {
        setbtnLoading(false);
        if (props?.route?.params?.kycRequiredWhileApplyCard) {
          props.navigation.push("ApplicatoionReview", {
            cardId: props?.route.params?.cardId
          })
        } else {
          props.navigation.push("QuickApplicationInfo", {
            cardId: props?.route?.params?.cardId
          })
        }

      } else {
        ref?.current.scrollTo({ y: 0 });
        setErrorMsg(isErrorDispaly(response));
        setbtnLoading(false)

      }
    } catch (error) {
      setErrorMsg(isErrorDispaly(error))
      setbtnLoading(false)

    }
  };

  return (
    <SafeAreaView style={[commonStyles.flex1, commonStyles.screenBg]}>
      <ScrollView ref={ref}>
        <Container style={[commonStyles.container]}>
          <View style={[commonStyles.dflex, commonStyles.mb36, commonStyles.alignCenter, commonStyles.gap16]}>
            <TouchableOpacity onPress={() => handleBackPress()} activeOpacity={0.8}>
              <AntDesign name="arrowleft" size={s(22)} color={NEW_COLOR.TEXT_BLACK} style={{ marginTop: 3 }} />
            </TouchableOpacity>
            <ParagraphComponent style={[commonStyles.fs16, commonStyles.textBlack, commonStyles.fw800, commonStyles.flex1]} text='Quick card linking services' />
          </View>
          {errorMsg && <ErrorComponent message={errorMsg} onClose={() => setErrorMsg("")} />}
          <ParagraphComponent style={[commonStyles.fs12, commonStyles.textBlack, commonStyles.fw700, commonStyles.mb4]} text='What is the quick card linking service ?' />
          <ParagraphComponent style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textGrey, commonStyles.flex1]} text={"Quick Card Linking Service Is Launched For Exchanga Pay Physical Or Virtual Card Users To Link Their Account Number With Their Card Number. After Card Number Linking Is Submitted, KYC Is Required to Be Completed. Once The Linking Process Is Successfully Completed, Exchanga Pay Deposit and Related Consumer Services Can Be Used Normally. However, Unlinking The Card After This Process Is Not Allowed."} />

          <View style={[commonStyles.mb24]} />
          <Formik
            initialValues={initialValues}
            onSubmit={getCardDetails}
            validationSchema={props?.route?.params?.envelopeNoRequired && QuickLinkSchema || QuickLinksWithoutEnvolop}
            validateOnBlur={false}
            validateOnChange={false}
          >
            {(formik) => {
              const { touched, handleSubmit, errors, handleChange, handleBlur, values } = formik;
              return (
                <>
                  <Field
                    touched={touched.cardNumber}
                    name="cardNumber"
                    label={"Link Card Number"}
                    value={values.cardNumber}
                    error={errors.cardNumber}
                    handleBlur={handleBlur}
                    customContainerStyle={{}}
                    onChangeText={(val: string) => {
                      // Only allow numbers, slashes, or an empty string
                      if (/^[0-9\/]*$/.test(val)) {
                        handleChange("cardNumber")(val);
                      }
                    }}
                    placeholder={"Enter card number"}
                    keyboardType={"numeric"}
                    component={InputDefault}
                    maxLength={16}
                    Children={
                      <LabelComponent
                        text=" *"
                        style={commonStyles.textError}
                      />
                    }
                  />
                  <View style={[commonStyles.mbs16]} />
                  {props?.route?.params?.envelopeNoRequired && <LabelComponent text='Envelop Number' Children={<LabelComponent
                    text=" *"
                    style={commonStyles.textError}
                  />} />}

                  {props?.route?.params?.envelopeNoRequired && <View style={[commonStyles.relative]}>
                    <Field
                      activeOpacity={0.9}
                      touched={touched.envelopNumber}
                      name="envelopNumber"
                      label={undefined}
                      error={errors.envelopNumber}
                      handleBlur={handleBlur}

                      onChangeText={handleChange("envelopNumber")}
                      customContainerStyle={{
                        height: 80,
                      }}
                      placeholder={"Enter envelope number"}
                      component={InputDefault}
                    />
                  </View>}
                  <View style={[commonStyles.mbs24]} />
                  <View style={[commonStyles.dflex, commonStyles.mbs24, commonStyles.alignCenter, commonStyles.gap16, commonStyles.sectionStyle, commonStyles.dashedBStyle, commonStyles.justifyContent]}>
                    <ParagraphComponent style={[commonStyles.fs12, commonStyles.textBlack, commonStyles.fw400]} text='Linking Card Name' />
                    <ParagraphComponent style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textAlwaysWhite, commonStyles.flex1, commonStyles.textRight]} text={props?.route?.params?.cardName || "--"} />

                  </View>
                  <View style={[commonStyles.sectionStyle]}>
                    <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.mb4]}>
                      <ParagraphComponent style={[commonStyles.fs12, commonStyles.textBlack, commonStyles.fw700,]} text='Instructions' />
                    </View>
                    <ParagraphComponent style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textGrey, commonStyles.flex1]} text={"Quick card linking Instructions :"} />
                    <ParagraphComponent style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textGrey, commonStyles.flex1]} text={"1.No fee is charged for the quick linking service, and it cannot be charged after the linking is successful."} />
                    <ParagraphComponent style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textGrey, commonStyles.flex1]} text={"2.The mailer number is unique and relevant. After receiving the mailer number, check all the relevant information and do not disclose the card number or mailer number to anyone."} />

                  </View>
                  <View style={[commonStyles.mb43]} />
                  <DefaultButton
                    title={props?.route?.params?.kycRequiredWhileApplyCard && "Submit" || "Next"}
                    style={undefined}

                    loading={btnLoading}
                    disable={undefined}
                    onPress={handleSubmit}
                  />
                  <View style={[commonStyles.mb16]} />
                </>
              );
            }}
          </Formik>


        </Container>
      </ScrollView>
    </SafeAreaView>
  )
}

export default QuickcardLink;
