import React, { useEffect, useState } from 'react';
import { Formik, Field } from 'formik';
import { KeyboardAvoidingView, Platform } from 'react-native';
import PaymentService from '../../../../../../apiServices/payments';
import InputDefault from '../../../../../../components/textInputComponents/DefaultFiat';
import ViewComponent from '../../../../../../components/view/view';
import PageHeader from '../../../../../../components/pageHeader/pageHeader';
import ButtonComponent from '../../../../../../components/buttons/button';
import { useThemeColors } from '../../../../../../hooks/themedHook/useThemeColors';
import { getThemedCommonStyles } from '../../../../../../components/CommonStyles';
import Container from '../../../../../../components/container/container';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import LabelComponent from '../../../../../../components/textComponets/lableComponent/lable';
import { createFiatPayinSchema } from '../../../schema';
import { PAYMENT_LINK_CONSTENTS } from '../../../constants';
import { useHardwareBackHandler } from '../../../../../../hooks/backHandleHook';
import { isErrorDispaly } from '../../../../../../utils/helpers';
import ErrorComponent from '../../../../../../components/errorDisplay/errorDisplay';
import { AddFiatPayinInterface } from '../../../interface';
import AmountInput from '../../../../../../components/amountInput/amountInput';
import ParagraphComponent from '../../../../../../components/textComponets/paragraphText/paragraph';
import ScrollViewComponent from '../../../../../../components/scrollView/scrollView';
import { logEvent } from '../../../../../../hooks/loggingHook';
import { useLngTranslation } from '../../../../../../hooks/languagesHook/useLngTranslation';
import { s } from '../../../../../../constants/styels/scale';
import TextMultiLanguage from '../../../../../../components/textComponets/multiLanguageText/textMultiLangauge';
import { showAppToast } from '../../../../../../components/toasterMessages/ShowMessage';

const FiatPayinAdd = (props: any) => {
  const [coinLookup, setCoinLookup] = useState<any[]>([]);
  const navigation = useNavigation<any>();
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const [error, setError] = useState<any>();
  const isFocused = useIsFocused();
  const [loading, setLoading] = useState(false);
  const { t } = useLngTranslation();  // Get validation schema with dynamic limits
  const getValidationSchema = () => {
    const idrCoin = coinLookup?.find((item: any) => item.code === 'IDR');
    const minLimit = idrCoin?.minLimit || props.route.params.data?.minLimit || 200000;
    const maxLimit = idrCoin?.maxLimit || props.route.params.data?.maxLimit || 10000000;
    return createFiatPayinSchema(minLimit, maxLimit, t);
  };

  useEffect(() => {
    fetchCoins();
  }, [isFocused]);

  useHardwareBackHandler(() => {
    backArrowButtonHandler();
  });

  const initialValues = {
    invoiceType: 'Payment Link',
    orderId: '',
    amount: '',
    currency: 'IDR',
    dueDate: '',
  };

  const fetchCoins = async () => {
    try {
      const res: any = await PaymentService.getStaicPayinCoins();
      if (res?.ok) {
        setCoinLookup(res.data?.assets || []);
      } else {
        setError(isErrorDispaly(res));
      }
    } catch (error) {
      setError(isErrorDispaly(error));
    }
  };
  const handleSubmit = async (values: any) => {
    setLoading(true);
    logEvent("Button Pressed", { action: "Create fait payin button", currentScreen: "Create fait payin" })
    const obj: AddFiatPayinInterface = {
      invoiceType: values.invoiceType,
      orderId: values.orderId,
      amount: parseFloat(values.amount),
      coin: values.currency,
      customerWalletId: coinLookup?.find((item: any) => item.code === values.currency)?.id || null,
      dueDate: new Date(new Date().getTime() + (5.5 * 60 * 60 * 1000) + (24 * 60 * 60 * 1000)).toISOString(),
      currency: values.currency
    };
    try {
      const res: any = await PaymentService.createFiatPayinInvoice(obj);
      if (res?.ok) {
        navigation.navigate(props?.navigation, { animation: 'slide_from_left', ...props?.route?.params, data: props.route.params?.type, initialTab: 1, screenType: props?.screenType, screenName: props?.screenName });
        showAppToast(t('GLOBAL_CONSTANTS.PAYMENT_LINK_GENERATED_SUCCESSFULLY'), 'success');
      } else {
        setError(isErrorDispaly(res));
      }
    } catch (error) {
      setError(isErrorDispaly(error));
    } finally {
      setLoading(false);
    }
  };

  const backArrowButtonHandler = () => {
    navigation.goBack();
  };

  const handleCloseError = () => {
    setError('');
  };
  return (
    <ViewComponent style={commonStyles.flex1}>
      <Container style={[commonStyles.container]}>
        <PageHeader title="GLOBAL_CONSTANTS.ADD_FIAT_PAYIN" onBackPress={backArrowButtonHandler} />
        {error && <ErrorComponent message={error} onClose={handleCloseError} />}

        <Formik
          initialValues={initialValues}
          validationSchema={getValidationSchema()}
          onSubmit={handleSubmit}
          validateOnChange={true}
          validateOnBlur={true}
        >
          {({ handleSubmit, errors, touched, handleBlur, values, handleChange, setFieldValue }) => (
            <KeyboardAvoidingView
              style={commonStyles.flex1}
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
            >
              {/* Layout with flex1: form in ScrollView, buttons in footer */}
              <ViewComponent style={commonStyles.flex1}>
                {/* Scrollable form area */}
                <ScrollViewComponent
                  style={commonStyles.flex1}
                  contentContainerStyle={{ flexGrow: 1 }}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                >
                  <ViewComponent >
                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent]}>
                      <LabelComponent style={commonStyles.amountInputLabel} text="GLOBAL_CONSTANTS.AMOUNT" multiLanguageAllows>
                        <LabelComponent text=" *" style={[commonStyles.textRed]} />
                      </LabelComponent>
                      <ParagraphComponent text={'IDR'} style={[commonStyles.fs26, commonStyles.fw400, commonStyles.textWhite]} />

                    </ViewComponent>
                    <ViewComponent style={[commonStyles.flex1]}>
                      <AmountInput
                        placeholder="GLOBAL_CONSTANTS.ENTER_AMOUNT"
                        value={values?.amount}
                        isRequired={true}
                        showError={errors?.amount}
                        onChangeText={(text) => { setFieldValue(PAYMENT_LINK_CONSTENTS.PAYMENT_LINK_NAMES.AMOUNT, text) }}
                        maxLength={10}
                        maxDecimals={0}
                        autoCapitalize="words"
                        touched={touched?.amount}
                        maxLimit={props.route.params.data?.maxLimit || 0}
                        minLimit={props.route.params.data?.minLimit || 0}
                        onMinPress={() => setFieldValue(PAYMENT_LINK_CONSTENTS.PAYMENT_LINK_NAMES.AMOUNT, props.route.params.data?.minLimit?.toFixed(2) || 0)}
                        onMaxPress={() => setFieldValue(PAYMENT_LINK_CONSTENTS.PAYMENT_LINK_NAMES.AMOUNT, props.route.params.data?.maxLimit?.toFixed(2) || 0)}
                      />
                    </ViewComponent>
                  </ViewComponent>
                  <ViewComponent style={commonStyles.formItemSpace} />
                  <Field
                    name={PAYMENT_LINK_CONSTENTS.PAYMENT_LINK_NAMES.ORDER_ID}
                    label="GLOBAL_CONSTANTS.ORDER_ID"
                    placeholder="GLOBAL_CONSTANTS.ENTER_ORDER_ID"
                    component={InputDefault}
                    error={errors.orderId}
                    touched={touched.orderId}
                    handleBlur={handleBlur('orderId')}
                    maxLength={30}
                  />
                  {errors.orderId && touched.orderId && <ViewComponent style={[commonStyles.sectionGap]} />}
                  <TextMultiLanguage text={"GLOBAL_CONSTANTS.HELP_TO_UNDERSTAND_WHAT_IS_YOUR_CLIENT_PAYING"} style={[commonStyles.mt24, commonStyles.securitysecondarypara]} />
                  <ViewComponent style={commonStyles.formItemSpace} />

                </ScrollViewComponent>

                {/* Footer with buttons pinned at bottom by flex */}
                <ViewComponent style={[commonStyles.sectionGap]}>
                  <ButtonComponent
                    title="GLOBAL_CONSTANTS.SAVE"
                    loading={loading}
                    onPress={handleSubmit}
                    disable={loading}
                  />
                  <ViewComponent style={commonStyles.buttongap} />
                  <ButtonComponent
                    title="GLOBAL_CONSTANTS.CANCEL"
                    disable={loading}
                    onPress={backArrowButtonHandler}
                    solidBackground={true}
                  />
                </ViewComponent>
              </ViewComponent>
            </KeyboardAvoidingView>
          )}
        </Formik>
      </Container>
    </ViewComponent>
  );
};

export default FiatPayinAdd;

