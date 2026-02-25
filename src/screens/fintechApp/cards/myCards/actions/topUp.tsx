import React, { useEffect, useState } from "react";
import { Formik } from "formik";
import { View } from "react-native";
import { getThemedCommonStyles } from "../../../../../components/CommonStyles";
import ViewComponent from "../../../../../components/view/view";
import TextMultiLangauge from "../../../../../components/textComponets/multiLanguageText/textMultiLangauge";
import ButtonComponent from "../../../../../components/buttons/button";
import AmountInput from "../../../../../components/amountInput/amountInput";
import LabelComponent from "../../../../../components/textComponets/lableComponent/lable";
import { CurrencyText } from "../../../../../components/textComponets/currencyText/currencyText";
import { CreateTopUpSchema } from "../../schema";
import { useThemeColors } from "../../../../../hooks/themedHook/useThemeColors";
import CurrencyNetworkSelector from "../../../../../components/currencyNetworkSelector/CurrencyNetworkSelector";
import { FeeAndTotalReceiveSkeleton } from "../../skeltons";
import { useLngTranslation } from "../../../../../hooks/languagesHook/useLngTranslation";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import ParagraphComponent from "../../../../../components/textComponets/paragraphText/paragraph";

interface CardActionsSheetTopUpProps {
  topupAmount: number | string;
  selectedNetwork?: string;
  currencyCode: any[];
  networkData: any[];
  topupBalanceInfo: any;
  feeComissionData: any;
  buttonLoader: boolean;
  feeComissionLoading?: boolean;
  onAmountChange: (value: string, setFieldValue: (field: string, value: any) => void) => void;
  handleMinValue: (setFieldValue: (field: string, value: any) => void) => void;
  handleMaxValue: (setFieldValue: (field: string, value: any) => void) => void;
  onCurrencySelect: (value: any) => void;
  onNetworkSelect: (value: any) => void;
  onTopUpSubmit: (values: any) => void;
  selectedCurrency: string;
  onClose?: () => void;
  ErrorMsgClose?: any
  CardsInfoData?: any
}

const CardActionsSheetTopUp: React.FC<CardActionsSheetTopUpProps> = ({
  topupAmount,
  currencyCode,
  networkData,
  topupBalanceInfo,
  feeComissionData,
  buttonLoader,
  onAmountChange,
  handleMinValue,
  handleMaxValue,
  onCurrencySelect,
  onNetworkSelect,
  onTopUpSubmit,
  selectedCurrency,
  feeComissionLoading,
  onClose,
  ErrorMsgClose,
  CardsInfoData
}) => {
  const transformedCurrencyData = currencyCode.map((item) => ({
    ...item,
    name: item.currencyCode,
    code: item.currencyCode,
  }));

  const initValues = {
    amount: topupAmount || "",
    network: "",
    currency: "",
    totalAmount: "",

  };

  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const transformedNetworkData = networkData.map((item) => ({
    ...item,
    name: item.network,
    code: item.network,
  }));
  const { t } = useLngTranslation();
  const [displayAmount, setDisplayAmount] = useState(topupAmount?.toString() || "");
  return (
    <KeyboardAwareScrollView
      contentContainerStyle={[{ flexGrow: 1 }]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      enableOnAndroid={true}
    >
      <Formik
        initialValues={initValues}
        onSubmit={(values, { setSubmitting }) => {
          onTopUpSubmit(values);
          setSubmitting(false);
        }}
        validationSchema={CreateTopUpSchema(topupBalanceInfo)}
        enableReinitialize={false}
        validateOnChange={false}
        validateOnBlur={false}
      >
        {({
          errors,
          values,
          setFieldValue,
          handleSubmit,
          isSubmitting,
          setErrors,
          touched,
        }) => {
          // MODIFICATION: Create new handlers inside the render prop to sync local state and Formik state.
          // Update totalAmount when feeComissionData changes
          useEffect(() => {
            if (feeComissionData?.toTalAmount) {
              setFieldValue("totalAmount", feeComissionData.toTalAmount);
            }
          }, [feeComissionData?.toTalAmount, setFieldValue]);
          const handleAmountInputChange = (text: string, setErrors: any) => {
            ErrorMsgClose();
            setErrors("amount", "")
            setDisplayAmount(text);
            onAmountChange(text, setFieldValue);
          };
          // method to set min  value
          const handleMinPress = () => {
            ErrorMsgClose()
            const minValue = topupBalanceInfo?.minLimit ?? 0;
            setDisplayAmount(minValue.toString());
            handleMinValue(setFieldValue);
          };
          // method to set max  value
          const handleMaxPress = () => {
            ErrorMsgClose()
            const maxValue = topupBalanceInfo?.maxLimit ?? 0;
            setDisplayAmount(maxValue.toString());
            handleMaxValue(setFieldValue);
          };
          return (
            <ViewComponent>
              <LabelComponent style={commonStyles.inputLabel} text="GLOBAL_CONSTANTS.CURRENCY" multiLanguageAllows>
                <LabelComponent text=" *" style={[commonStyles.textRed]} />
              </LabelComponent>
              <CurrencyNetworkSelector
                currencyData={transformedCurrencyData}
                networkData={transformedNetworkData}
                selectedCurrency={values.currency}
                selectedNetwork={values.network}
                onSelect={(currency) => {
                  setFieldValue("currency", currency);
                  setDisplayAmount("");
                  onCurrencySelect({ currencyCode: currency });
                  // setFieldValue("network", network);
                  //onNetworkSelect({ network });
                }}
              />

              <ViewComponent style={[commonStyles.formItemSpace]} />
              <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.gap8, commonStyles.flexWrap]}>
                <ViewComponent style={[commonStyles.flex1]}>
                  <LabelComponent style={commonStyles.inputLabel} text="GLOBAL_CONSTANTS.AMOUNT" multiLanguageAllows>
                    <LabelComponent text=" *" style={[commonStyles.textRed]} />
                  </LabelComponent>
                </ViewComponent>
                <ViewComponent >
                  <ViewComponent style={[commonStyles.dflex, commonStyles.justifyend, commonStyles.alignCenter]}>
                    <ParagraphComponent
                      style={[commonStyles.availblelabel]}
                      text={`${t('GLOBAL_CONSTANTS.AVAILABLE_BALANCES')}`}
                    />
                    <CurrencyText
                      value={transformedCurrencyData.find(n => n.code === values.currency)?.amount ?? 'N/A'}
                      currency={values.currency}
                      symboles={true}
                      decimalPlaces={4}
                      style={[commonStyles.availbleamount]}
                    />
                  </ViewComponent>
                </ViewComponent>
              </ViewComponent>
              <AmountInput
                placeholder="GLOBAL_CONSTANTS.ENTER_AMOUNT"
                maxLength={16}
                onChangeText={(text: any) => { handleAmountInputChange(text, setErrors) }}
                value={displayAmount}
                onMinPress={handleMinPress}
                onMaxPress={handleMaxPress}
                minLimit={topupBalanceInfo?.minLimit == null ? undefined : topupBalanceInfo?.minLimit}
                maxLimit={topupBalanceInfo?.maxLimit == null ? undefined : topupBalanceInfo?.maxLimit}
                showError={errors.amount}
                topupBalanceInfo={topupBalanceInfo}
                touched={touched?.amount}
                maxDecimals={JSON.parse(CardsInfoData?.transactionAdditionalFields)?.IsAllowDecimalValue ? 8 : 0}
              />

              <View style={[commonStyles.formItemSpace]} />

              {(displayAmount && !isNaN(parseFloat(displayAmount)) && parseFloat(displayAmount) >= (topupBalanceInfo?.minLimit)) && (
                feeComissionLoading ? <FeeAndTotalReceiveSkeleton /> : (
                  <>
                    <ViewComponent style={[commonStyles.dflex, commonStyles.gap4, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.flexWrap, commonStyles.gap8]}>
                      <TextMultiLangauge text={"GLOBAL_CONSTANTS.FEE"} style={[commonStyles.listsecondarytext]} />
                      <CurrencyText decimalPlaces={4} prifix={`${""}`} value={feeComissionData?.fee} currency={selectedCurrency || ""} style={[commonStyles.listprimarytext, commonStyles.textRight]} />
                    </ViewComponent>
                    <View style={[commonStyles.listitemGap]} />
                    <ViewComponent style={[commonStyles.dflex, commonStyles.gap4, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.flexWrap, commonStyles.gap8]}>
                      <TextMultiLangauge text={"GLOBAL_CONSTANTS.TOTAL_AMOUNT"} style={[commonStyles.listsecondarytext]} />
                      <CurrencyText decimalPlaces={4} prifix={`${""}`} value={feeComissionData?.toTalAmount} currency={selectedCurrency || ""} style={[commonStyles.listprimarytext, commonStyles.textRight]} />
                    </ViewComponent>
                    <ViewComponent style={[commonStyles.mt5]} />
                  </>
                )
              )}

              <ViewComponent style={[commonStyles.sectionGap]} />
              <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap8]}>
                {onClose && (
                  <ViewComponent style={[commonStyles.flex1]}>
                    <ButtonComponent title={"GLOBAL_CONSTANTS.CANCEL"} onPress={onClose} solidBackground={true} disable={buttonLoader || isSubmitting} />
                  </ViewComponent>
                )}
                <ViewComponent style={[commonStyles.flex1]}>
                  <ButtonComponent
                    title={"GLOBAL_CONSTANTS.TOP_UP"}
                    loading={buttonLoader || isSubmitting}
                    onPress={() => {
                      handleSubmit();
                    }}
                    disable={feeComissionLoading}

                  />
                </ViewComponent>
              </ViewComponent>
              <ViewComponent style={[commonStyles.sectionGap]} />
            </ViewComponent>
          );
        }}
      </Formik>
    </KeyboardAwareScrollView>
  );
};

export default CardActionsSheetTopUp;
