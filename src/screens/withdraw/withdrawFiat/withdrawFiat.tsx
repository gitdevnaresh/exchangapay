import React, { useEffect, useMemo, useState } from "react";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { Field, Formik } from "formik";
import * as Yup from "yup";
import Container from "../../../newComponents/container/container";
import PageHeader from "../../../newComponents/pageHeader/pageHeader";
import ViewComponent from "../../../newComponents/view/view";
import { useThemeColors } from "../../../hooks/useThemeColors";
import { getThemedCommonStyles } from "../../../assets/styles/CommonStyles";
import { showAppToast } from "../../../newComponents/ToasterMessages/ShowMessage";
import { s } from "../../../constants/theme/scale";
import { useHardwareBackHandler } from "../../../hooks/HardwareBackHandler";
import AmountInputWithCurrency from "../../../newComponents/textInputComponents/formik/AmountInputWithCurrency";
import { WithDrawServices } from "../../../apiServices/withdrawApis/withdrawServices";
import { isErrorDispaly } from "../../../utils/helpers";
import TextMultiLanguage from "../../../newComponents/textComponets/multiLanguageText/textMultiLangauge";
import CommonTouchableOpacity from "../../../newComponents/touchableComponents/touchableOpacity";
import CustomPickerModal from "../../../newComponents/pickerComponents/formik/customPicker";
import ButtonComponent from "../../../newComponents/buttons/button";
import RoundedPlusIcon from "../../../assets/mainmenuicons/roundedPlus";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import ErrorComponent from "../../../newComponents/errorDisplay/errorDisplay";
import SwokipayDashboardLoader from "../../../newComponents/swokipayloader";
import { MOCK_BENEFICIARIES } from "../../../constants/mockBeneficiaries";
import ImageUri from "../../../newComponents/imageComponents/image";
import { CurrencyText } from "../../../newComponents/textComponets/currencyText/currencyText";




const TRANSFER_TYPES = [
  {
    id: 'first_party',
    apiValue: 'firstparty',
    title: 'GLOBAL_CONSTANTS.FIRST_PARTY',
    description: 'GLOBAL_CONSTANTS.TRANSFER_TO_YOUR_OWN_VERIFIED_BANK_ACCOUNT'
  },
  {
    id: 'third_party',
    apiValue: 'thridparty',
    title: 'GLOBAL_CONSTANTS.THIRD_PARTY',
    description: 'GLOBAL_CONSTANTS.TRANSFER_TO_ANOTHER_PERSON_S_BANK_ACCOUNT'
  }
];

// Dynamic Validation Schema
const getWithdrawValidationSchema = (fiatCurrencies: any[]) => Yup.object().shape({
  sendAmount: Yup.string()
    .required("")
    .test("is-number", "Invalid amount", (value) => {
      if (!value) return false;
      const num = parseFloat(value.replace(/,/g, ""));
      return !isNaN(num) && num > 0;
    }),
  sendCurrency: Yup.string()
    .required(""),
  receiveAmount: Yup.string()
    .required("")
    .test("min-max", function (value) {
      if (!value) return false;
      const num = parseFloat(value.replace(/,/g, ""));
      const currency = fiatCurrencies.find(c => c.code === this.parent.receiveCurrency);
      if (!currency) return true;

      if (currency.minAmount && num < currency.minAmount) {
        return this.createError({ message: `Minimum amount is ${currency.symbol}${currency.minAmount}` });
      }
      if (currency.maxAmount && num > currency.maxAmount) {
        return this.createError({ message: `Maximum amount is ${currency.symbol}${currency.maxAmount}` });
      }
      return true;
    }),
  receiveCurrency: Yup.string()
    .required(""),
  transferType: Yup.string()
    .required(""),
  paymentMethod: Yup.string()
    .required(""),
});

interface WithdrawFormValues {
  sendAmount: string;
  sendCurrency: string;
  receiveAmount: string;
  receiveCurrency: string;
  transferType: string;
  paymentMethod: string;
  beneficiary: string;
}

const WithdrawFiat = () => {
  const navigation = useNavigation<any>();
  const NEW_COLOR = useThemeColors();
  const commonStyles = useMemo(() => getThemedCommonStyles(NEW_COLOR), [NEW_COLOR]);
  const [screenLoading, setScreenLoading] = useState<boolean>(true);
  const [currencies, setCurrencies] = useState<any[]>([]);
  const [fiatCurrencies, setFiatCurrencies] = useState<any[]>([]);
  const [error, setError] = useState<string>("");
  const [exchangeRate, setExchangeRate] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [benificiarydata, setBenificiaryData] = useState<any[]>([]);
  const [selectedReceiveCurrency, setSelectedReceiveCurrency] = useState<string>("");
  const [selectedTransferType, setSelectedTransferType] = useState<string>("");
  const [availableTransferTypes, setAvailableTransferTypes] = useState<string[]>([]);
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [selectedSendCurrency, setSelectedSendCurrency] = useState<string>("");


  useEffect(() => {
    const loadInitialData = async () => {
      setScreenLoading(true);
      try {
        await Promise.all([fetchStableCoins(), fetchFiatCurrency()]);
      } finally {
        setScreenLoading(false);
      }
    };
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedReceiveCurrency && selectedTransferType) {
      fetchBenificiaryLU(selectedReceiveCurrency, selectedTransferType);
    }
  }, [selectedReceiveCurrency, selectedTransferType]);

  useEffect(() => {
    if (selectedSendCurrency && selectedReceiveCurrency) {
      fetchExchangeRate(selectedSendCurrency, selectedReceiveCurrency);
    }
  }, [selectedSendCurrency, selectedReceiveCurrency]);


  const fetchStableCoins = async () => {
    try {
      const response: any = await WithDrawServices.fetchStableCoinLu();
      if (response.status === 200) {
        const transformed = response.data?.map((item: any) => ({
          id: item.id,
          code: item.walletCode,
          name: item.walletCode,
          image: item.logo,
          availableBalance: item.balance || item.availableBalance || item.avilable || 0
        })) || [];
        setCurrencies(transformed);
      } else {
        setError(isErrorDispaly(response));
        setCurrencies([]);
      }
    } catch (error) {
      setError(isErrorDispaly(error));
      setCurrencies([]);
    }
  };
  const fetchFiatCurrency = async () => {
    try {
      const response: any = await WithDrawServices.fetchFiatCurrencyLu();
      if (response.status === 200) {
        if (response.data?.length > 0) {
          fetchPaymentMethodsLu(response.data[0].currency);
        }
        const transformed = response.data?.map((item: any) => ({
          id: item.currency.toLowerCase(),
          code: item.currency,
          name: item.country,
          image: item.flag,
          minAmount: item.minLimit,
          maxAmount: item.maxLimit,
          decimals: 2,
          transferTypes: item.transferTypes || ""
        })) || [];
        setFiatCurrencies(transformed);
      }
      else {
        setError(isErrorDispaly(response));
      }
    } catch (error) {
      setError(isErrorDispaly(error));
    }
  }
  const fetchPaymentMethodsLu = async (currency: string) => {
    try {
      const response: any = await WithDrawServices.fetchPaymentMethods(currency);
      if (response.status === 200) {
        setPaymentMethods(response.data.paymentMethod);
      } else {
        setError(isErrorDispaly(response));
        setPaymentMethods([]);
      }
    } catch (error) {
      setPaymentMethods([]);
      setError(isErrorDispaly(error));
    }
  }
  const fetchBenificiaryLU = async (currency: string, transferType: string) => {
    try {
      const response: any = await WithDrawServices.fetchBeneficiaries(currency, transferType);
      if (response.status === 200) {
        setBenificiaryData(response.data);
      } else {
        setError(isErrorDispaly(response));
        setBenificiaryData(MOCK_BENEFICIARIES);
      }
    } catch (error) {
      setError(isErrorDispaly(error));
      setBenificiaryData(MOCK_BENEFICIARIES);
    }
  }

  const fetchExchangeRate = async (fromCurrency: string, toCurrency: string) => {
    setIsConverting(true);
    try {
      const response: any = await WithDrawServices.getExchangeRate(fromCurrency, toCurrency);
      if (response.status === 200) {
        setExchangeRate(response.data?.rate || 1);
      } else {
        setExchangeRate(1);
      }
    } catch (error) {
      setExchangeRate(1);
    } finally {
      setIsConverting(false);
    }
  }

  const initialValues: WithdrawFormValues = {
    sendAmount: '',
    sendCurrency: '',
    receiveAmount: '',
    receiveCurrency: '',
    transferType: '',
    paymentMethod: '',
    beneficiary: ''
  };


  const isFormValid = (values: WithdrawFormValues) => {
    return !(!values.sendAmount || !values.sendCurrency || !values.receiveAmount || !values.receiveCurrency || !values.transferType || !values.paymentMethod || !values.beneficiary || isProcessing);
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleFormSubmit = async (values: WithdrawFormValues) => {
    try {
      setIsProcessing(true);

      // Validate form
      await getWithdrawValidationSchema(fiatCurrencies).validate(values);
      
      // Find selected beneficiary
      const selectedBeneficiary = MOCK_BENEFICIARIES.find(b => b.id === values.beneficiary);
      
      // Navigate to confirmation screen
      navigation.navigate("WithdrawConfirm", {
        sendAmount: values.sendAmount,
        sendCurrency: values.sendCurrency,
        receiveAmount: values.receiveAmount,
        receiveCurrency: values.receiveCurrency,
        transferType: values.transferType,
        paymentMethod: values.paymentMethod,
        beneficiary: selectedBeneficiary
      });

      showAppToast("Proceeding to confirmation", "success");
    } catch (error: any) {
      setError(error.message || "Please fill all required fields");
    } finally {
      setIsProcessing(false);
    }
  };

  useHardwareBackHandler(() => {
    handleBackPress();
  });
  const handleAddBeneficiary = (values: any) => {
    setError("");
    // Validate required fields before navigation
    if (!values.sendAmount) {
      setError("Please enter send amount");
      return;
    }
    if (!values.sendCurrency) {
      setError("Please select send currency");
      return;
    }
    if (!values.receiveAmount) {
      setError("Please enter receive amount");
      return;
    }
    if (!values.receiveCurrency) {
      setError("Please select receive currency");
      return;
    }
    if (!values.transferType) {
      setError("Please select transfer type");
      return;
    }
    if (!values.paymentMethod) {
      setError("Please select payment method");
      return;
    }
    navigation.navigate("AddBeneficiary", { values });
  };

  const handleReceiveCurrencyChange = (currency: any, setFieldValue: any) => {
    fetchPaymentMethodsLu(currency.code);
    setSelectedReceiveCurrency(currency.code);
    setFieldValue('paymentMethod', '');
    setError("");
    const selectedCurrency = fiatCurrencies.find(c => c.code === currency.code);
    if (selectedCurrency?.transferTypes) {
      const types = selectedCurrency.transferTypes.split(',').map((t: string) => t.trim().toLowerCase());
      setAvailableTransferTypes(types);
    } else {
      setAvailableTransferTypes([]);
    }
  };

  const handleSendCurrencyChange = (currency: any) => {
    setSelectedSendCurrency(currency.code);
    setError("");
  };

  const handleAmountChange = () => {
    setError("");
  };

  return (
    <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
      <Container>
        <PageHeader
          title="GLOBAL_CONSTANTS.SELECT_STABLECOIN_AND_CURRENCY"
          onBackPress={handleBackPress}
        />
        {screenLoading && (
          <SwokipayDashboardLoader />
        )}
        {!screenLoading && (
          <>
            {error && <ErrorComponent message={error} screen={true} />}
            <Formik
              initialValues={initialValues}
              validationSchema={getWithdrawValidationSchema(fiatCurrencies)}
              onSubmit={handleFormSubmit}
              validateOnChange
              validateOnBlur
              enableReinitialize
            >
              {({ values, setFieldValue }) => {
                return (
                  <ViewComponent style={[commonStyles.flex1]}>
                    <KeyboardAwareScrollView
                      contentContainerStyle={{ flexGrow: 1 }}
                      showsVerticalScrollIndicator={false}
                      keyboardShouldPersistTaps="handled"
                      enableOnAndroid={true}
                    >
                      <ViewComponent>

                        {/* Available Balance Display */}
                        {values.sendCurrency && (() => {
                          const selectedCurrency = currencies.find(c => c.code === values.sendCurrency);
                          return selectedCurrency ? (
                            <ViewComponent style={[commonStyles.mb16]}>
                              <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16, commonStyles.list]}>
                                <ViewComponent style={[commonStyles.iconbg, commonStyles.dflex, commonStyles.justifyCenter]}>
                                  <ImageUri uri={selectedCurrency?.image} height={s(24)} width={s(24)} />
                                </ViewComponent>
                                <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.flex1]}>
                                  <TextMultiLanguage
                                    text={"GLOBAL_CONSTANTS.AVAIL_BALANCE"}
                                    style={[commonStyles.textlinkgrey, commonStyles.fs14, commonStyles.fw400]} />
                                  <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap6]}>
                                    <CurrencyText
                                      value={selectedCurrency?.availableBalance || 0}
                                      currency={values.sendCurrency}
                                      symboles={true}
                                      style={[commonStyles.textWhite, commonStyles.fs14, commonStyles.fw400]} />
                                  </ViewComponent>
                                </ViewComponent>
                              </ViewComponent>
                            </ViewComponent>
                          ) : null;
                        })()}
                        {/* Send Amount Section */}
                        <AmountInputWithCurrency
                          label="Send"
                          name="sendAmount"
                          currencyFieldName="sendCurrency"
                          placeholder="Enter amount"
                          currencyOptions={currencies}
                          isRequired
                          showCurrencyLogo
                          editable={!isProcessing}
                          disabled={isProcessing}
                          linkedFieldName="receiveAmount"
                          exchangeRate={exchangeRate}
                          isConverting={isConverting}
                          onCurrencyChange={handleSendCurrencyChange}
                          onAmountChange={handleAmountChange}
                        />
                        <ViewComponent style={[commonStyles.mb10]} />
                        {/* Receive Amount Section */}
                        <AmountInputWithCurrency
                          label="Receive"
                          name="receiveAmount"
                          currencyFieldName="receiveCurrency"
                          placeholder="Calculated amount"
                          currencyOptions={fiatCurrencies}
                          isRequired
                          showCurrencyLogo
                          editable={!isProcessing}
                          disabled={isProcessing}
                          linkedFieldName="sendAmount"
                          onCurrencyChange={(currency) => handleReceiveCurrencyChange(currency, setFieldValue)}
                          exchangeRate={exchangeRate > 0 ? 1 / exchangeRate : 1}
                          isConverting={isConverting}
                        />

                        {/* Exchange Rate Display */}
                        {values.sendCurrency && values.receiveCurrency && (
                          <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter, { marginTop: s(8), marginBottom: s(8) }]}>
                            {isConverting ? (
                              <ViewComponent style={[{ width: '50%', height: 14, backgroundColor: NEW_COLOR.BORDER_LIGHT_GREEN, borderRadius: s(4), opacity: 0.3 }]} />
                            ) : exchangeRate > 0 ? (
                              <>
                                <TextMultiLanguage
                                  text={"GLOBAL_CONSTANTS.EXCHANGE_RATE"}
                                  style={[commonStyles.textGrey, commonStyles.fs12, commonStyles.fw400]} />
                                <TextMultiLanguage
                                  text={`: 1 ${values.sendCurrency} = ${exchangeRate.toFixed(4)} ${values.receiveCurrency}`}
                                  style={[commonStyles.textWhite, commonStyles.fs12, commonStyles.fw600, { marginLeft: s(4) }]} />
                              </>
                            ) : null}
                          </ViewComponent>
                        )}
                        <ViewComponent style={[commonStyles.mb16]} />
                        <TextMultiLanguage style={[commonStyles.fs14, commonStyles.fw700, commonStyles.textWhite, commonStyles.mb16]}
                          text={"GLOBAL_CONSTANTS.SELECT_TRANSFER_TYPE"} />

                        {TRANSFER_TYPES.filter(type =>
                          availableTransferTypes.length === 0 ||
                          availableTransferTypes.includes(type.apiValue)
                        ).map((type) => (
                          <CommonTouchableOpacity
                            key={type.id}
                            onPress={() => {
                              setFieldValue('transferType', type.id);
                              setSelectedTransferType(type.id);
                            }}
                          >
                            <ViewComponent
                              style={[
                                commonStyles.bordered,
                                commonStyles.rounded12,
                                commonStyles.py8,
                                commonStyles.px10,
                                commonStyles.mb10,
                                values.transferType === type.id && { borderColor: NEW_COLOR.BG_YELLOW }
                              ]}
                            >
                              <TextMultiLanguage style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textWhite]}
                                text={type.title} />
                              <TextMultiLanguage style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textGrey]}
                                text={type.description} />
                            </ViewComponent>
                          </CommonTouchableOpacity>
                        ))}
                        <TextMultiLanguage style={[commonStyles.fs14, commonStyles.fw700, commonStyles.textWhite, commonStyles.mb16]}
                          text={"GLOBAL_CONSTANTS.SELECT_PAYMENT_TYPE"} />
                        <Field
                          name="paymentMethod"
                          component={CustomPickerModal}
                          data={paymentMethods || []}
                          placeholder={"GLOBAL_CONSTANTS.SELECT_PAYMENT_METHOD"}
                          modalTitle={"GLOBAL_CONSTANTS.SELECT_PAYMENT_METHOD"}
                          selectionType="name"
                          isRequired
                          sheetHeight={s(500)}
                          searchPlaceholder={"GLOBAL_CONSTANTS.SEARCH_PAYMENT_METHOD"}
                        />
                        <ViewComponent style={[commonStyles.mb16]} />
                        <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.mb16]}>
                          <TextMultiLanguage style={[commonStyles.fs14, commonStyles.fw700, commonStyles.textWhite]}
                            text={"GLOBAL_CONSTANTS.SELECT_BENEFICIARY"} />
                          <CommonTouchableOpacity onPress={() => handleAddBeneficiary(values)}>
                            <RoundedPlusIcon color={NEW_COLOR.TEXT_WHITE} />
                          </CommonTouchableOpacity>
                        </ViewComponent>
                        <Field
                          name="beneficiary"
                          component={CustomPickerModal}
                          data={MOCK_BENEFICIARIES || []}
                          placeholder={"GLOBAL_CONSTANTS.SELECT_BENEFICIARY"}
                          modalTitle={"GLOBAL_CONSTANTS.SELECT_BENEFICIARY"}
                          selectionType="name"
                          isRequired
                          sheetHeight={s(500)}
                          searchPlaceholder={"GLOBAL_CONSTANTS.SEARCH_BENEFICIARY"}
                        />
                        <ViewComponent style={[commonStyles.mb16]} />
                      </ViewComponent>
                      <ViewComponent style={[commonStyles.flex1]} />
                      <ViewComponent style={{ paddingVertical: s(16) }}>
                        <ButtonComponent
                          title="GLOBAL_CONSTANTS.NEXT"
                          onPress={handleFormSubmit}
                          disable={!isFormValid(values)}
                        />
                      </ViewComponent>
                    </KeyboardAwareScrollView>
                  </ViewComponent>
                );
              }}
            </Formik>
          </>
        )}
      </Container>
    </ViewComponent>
  );
};


export default WithdrawFiat;