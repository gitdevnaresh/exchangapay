import React, { useEffect, useState } from 'react';
import { Formik } from 'formik';
import { Platform } from 'react-native';
import ViewComponent from '../../../../../components/view/view';
import Container from '../../../../../components/container/container';
import PageHeader from '../../../../../components/pageHeader/pageHeader';
import { getThemedCommonStyles } from '../../../../../components/CommonStyles';
import { useThemeColors } from '../../../../../hooks/themedHook/useThemeColors';
import ButtonComponent from '../../../../../components/buttons/button';
import AmountInput from '../../../../../components/amountInput/amountInput';
import LabelComponent from '../../../../../components/textComponets/lableComponent/lable';
import { CurrencyText } from '../../../../../components/textComponets/currencyText/currencyText';
import { CreateWithdrawSchema } from '../../schema';
import CurrencyNetworkSelector from '../../../../../components/currencyNetworkSelector/CurrencyNetworkSelector';
import { useLngTranslation } from '../../../../../hooks/languagesHook/useLngTranslation';
import ParagraphComponent from '../../../../../components/textComponets/paragraphText/paragraph';
import useEncryptDecrypt from '../../../../../hooks/encDecHook';
import CardsModuleService from '../../../../../apiServices/cards';

import { isErrorDispaly } from '../../../../../utils/helpers';
import DashboardLoader from '../../../../../components/loader';
import { SafeAreaView } from 'react-native-safe-area-context';
import ErrorComponent from '../../../../../components/errorDisplay/errorDisplay';
import KeyboardAvoidingWrapper from '../../../../../components/keyboard/keyBoardAvoidingView';
import ScrollViewComponent from '../../../../../components/scrollView/scrollView';
import { s } from '../../../../../constants/styels/scale';
import TextMultiLangauge from '../../../../../components/textComponets/multiLanguageText/textMultiLangauge';
import CustomRBSheet from '../../../../../components/models/commonBottomSheet';
import { useRef } from 'react';
import CardActionsSheetContent from './cardSheetDetails';
import { CardWithdarwList } from '../../interface';

interface CardWithdrawProps {
  navigation: any;
  route: any;
}

const CardWithdraw: React.FC<CardWithdrawProps> = ({ navigation, route }) => {
  const { cardId, CardsInfoData } = route?.params || {};
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const { decryptAES } = useEncryptDecrypt();
  const { t } = useLngTranslation();
  const rbSheetRef = useRef<any>(null);

  const [state, setState] = useState({
    loading: false,
    pageLoading: true,
    errorMsg: '',
    currencyCode: [] as any[],
    networkData: [] as any[],
    withdrawBalanceInfo: {} as any,
    selectedCurrency: '',
    selectedNetwork: '',
    withdrawAmount: '',
    isSuccessSheet: false,
    successAmount: 0,
    successCurrency: '',
    successCardName: '',
  });

  const updateState = (newState: Partial<typeof state>) => {
    setState(prev => ({ ...prev, ...newState }));
  };

  useEffect(() => {
    if (cardId && CardsInfoData) {
      initializeWithdrawData();
    }
  }, [cardId, CardsInfoData]);

  const initializeWithdrawData = async () => {
    updateState({ pageLoading: true, errorMsg: '' });
    try {
      await Promise.all([
        getCardsWithdrawDetails(),
        getWithdrawBalance()
      ]);
    } catch (error) {
      updateState({ errorMsg: isErrorDispaly(error) });
    } finally {
      updateState({ pageLoading: false });
    }
  };

  const getCardsWithdrawDetails = async () => {
    try {
      const response: any = await CardsModuleService.getCoins(CardsInfoData?.programId);
      if (response.ok && response.data && response.data.length > 0) {
        updateState({
          currencyCode: response?.data ?? [],
          selectedCurrency: response?.data[0]?.currencyCode || ''
        });
        if (response?.data[0]?.currencyCode) {
          await getNetworkLookUps(response?.data[0]?.currencyCode);
        }
      } else {
        updateState({ errorMsg: isErrorDispaly(response) });
      }
    } catch (error) {
      updateState({ errorMsg: isErrorDispaly(error) });
    }
  };

  const getNetworkLookUps = async (currencyCode: string) => {
    try {
      const response: any = await CardsModuleService.getNetworkLookup(currencyCode, CardsInfoData?.programId);
      if (response?.ok) {
        updateState({
          networkData: response?.data ?? [],
          selectedNetwork: response?.data[0]?.network ?? ''
        });
      } else {
        updateState({ errorMsg: isErrorDispaly(response) });
      }
    } catch (error) {
      updateState({ errorMsg: isErrorDispaly(error) });
    }
  };

  const getWithdrawBalance = async () => {
    try {
      const res = await CardsModuleService.getCardWithdrawBalance(cardId);
      if (res.ok) {
        updateState({ withdrawBalanceInfo: res?.data });
      } else {
        updateState({ errorMsg: isErrorDispaly(res) });
      }
    } catch (error) {
      updateState({ errorMsg: isErrorDispaly(error) });
    }
  };

  const handleSuccess = (amount: number, currency: string) => {
    updateState({
      successAmount: amount,
      successCurrency: currency,
      successCardName: CardsInfoData?.name || 'Card',
      isSuccessSheet: true
    });
    setTimeout(() => {
      rbSheetRef.current?.open();
    }, 100);
  };

  const handleSuccessDone = () => {
    rbSheetRef.current?.close();
    navigation.goBack();
  };

  const handleSheetClose = () => {
    updateState({ isSuccessSheet: false });
  };

  const handleWithdrawSubmit = async (values: any) => {
    updateState({ loading: true, errorMsg: '' });
    try {
      const selectedNet = state.networkData.find((net: any) => net.network === values.network);
      const networkBalance = selectedNet?.amount || 0;

      if (networkBalance < parseFloat(values.amount)) {
        updateState({
          errorMsg: "Insufficient balance",
          loading: false
        });
        return;
      }

      const obj: CardWithdarwList = {
        amount: values.amount,
        // cryptoWalletId: state.networkData.find((net: any) => net.network === values.network)?.id || null,
        cardId: cardId,
        // concurrencyStamp: state?.withdrawBalanceInfo?.concurrencyStamp
      };

      const res = await CardsModuleService.saveCardWithdraw(obj);
      if (res.ok) {
        handleSuccess(parseFloat(values.amount), values.currency);
      } else {
        updateState({ errorMsg: isErrorDispaly(res) });
      }
    } catch (error) {
      updateState({ errorMsg: isErrorDispaly(error) });
    } finally {
      updateState({ loading: false });
    }
  };

  const handleCurrencySelect = (value: any) => {
    getNetworkLookUps(value?.currencyCode);
    updateState({
      selectedCurrency: value?.currencyCode || '',
    });
  };

  const handleNetworkSelect = (value: any) => {
    updateState({
      selectedNetwork: value?.network || ''
    });
  };

  const transformedNetworkData = state.networkData.map((item) => ({
    ...item,
    name: item.network,
    code: item.network,
  }));

  const transformedCurrencyData = state.currencyCode.map((item) => ({
    ...item,
    name: item.currencyCode,
    code: item.currencyCode,
  }));

  const detailItem = (labelKey: string, rawValue: string | undefined, isSensitive: boolean = false) => {
    let decryptedOrRawValue = rawValue;

    if (isSensitive && typeof rawValue === 'string' && rawValue) {
      const decrypted = decryptAES(rawValue);
      decryptedOrRawValue = decrypted || rawValue;
    }

    const displayValue = (labelKey === "GLOBAL_CONSTANTS.CARD_NUMBER" && decryptedOrRawValue)
      ? decryptedOrRawValue.replace(/\d{4}(?=.)/g, "$& ")
      : decryptedOrRawValue;

    return (
      <ViewComponent>
        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.gap8, commonStyles.flexWrap]}>
          <TextMultiLangauge
            text={labelKey}
            style={[commonStyles.listsecondarytext]}
          />
          <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10]}>
            {labelKey === "GLOBAL_CONSTANTS.AMOUNT" ? (
              <CurrencyText
                value={displayValue || "0"}
                decimalPlaces={2}
                style={[commonStyles.listprimarytext]}
              />
            ) : (
              <ParagraphComponent
                text={displayValue || "N/A"}
                style={[commonStyles.listprimarytext]}
                numberOfLines={1}
              />
            )}
          </ViewComponent>
        </ViewComponent>
        <ViewComponent style={[commonStyles.listitemGap]} />
      </ViewComponent>
    );
  };

  if (state.pageLoading) {
    return (
      <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
        <SafeAreaView style={[commonStyles.flex1, commonStyles.alignCenter, commonStyles.justifyCenter]}>
          <DashboardLoader />
        </SafeAreaView>
      </ViewComponent>
    );
  }

  return (
    <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
      <Container style={[commonStyles.container, commonStyles.flex1]}>
        <PageHeader title={"GLOBAL_CONSTANTS.WITHDRAW"} onBackPress={() => navigation.goBack()} />

        <KeyboardAvoidingWrapper
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={s(64)}
        >
          <ScrollViewComponent
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {state.errorMsg ? (
              <ErrorComponent message={state.errorMsg} onClose={() => updateState({ errorMsg: '' })} />
            ) : null}

            <Formik
              initialValues={{
                amount: '',
                network: state.selectedNetwork,
                currency: state.selectedCurrency,
              }}
              onSubmit={handleWithdrawSubmit}
              validationSchema={CreateWithdrawSchema(state.withdrawBalanceInfo)}
              enableReinitialize={true}
              validateOnChange={false}
              validateOnBlur={false}
            >
              {({
                errors,
                values,
                setFieldValue,
                handleSubmit,
                isSubmitting,
                touched,
              }) => {
                const handleAmountInputChange = (text: string) => {
                  updateState({ errorMsg: '', withdrawAmount: text });
                  setFieldValue('amount', text);
                };

                const handleMinPress = () => {
                  const minValue = state.withdrawBalanceInfo?.minLimit ?? 0;
                  const minValueStr = minValue.toString();
                  updateState({ withdrawAmount: minValueStr });
                  setFieldValue('amount', minValueStr);
                };

                const handleMaxPress = () => {
                  const maxValue = state.withdrawBalanceInfo?.maxLimit ?? 0;
                  const maxValueStr = maxValue.toString();
                  updateState({ withdrawAmount: maxValueStr });
                  setFieldValue('amount', maxValueStr);
                };

                return (
                  <ViewComponent style={[commonStyles.flex1, { justifyContent: 'space-between' }]}>
                    <ViewComponent>
                      <ViewComponent style={[commonStyles.titleSectionGap]}>
                        {detailItem("GLOBAL_CONSTANTS.CARD_NAME", CardsInfoData?.name)}
                        {detailItem("GLOBAL_CONSTANTS.CARD_NUMBER", CardsInfoData?.number, true)}
                        {detailItem("GLOBAL_CONSTANTS.CURRENCY", CardsInfoData?.cardCurrency, true)}
                        {detailItem("GLOBAL_CONSTANTS.AMOUNT", CardsInfoData?.amount, true)}
                      </ViewComponent>

                      <LabelComponent style={commonStyles.inputLabel} text="GLOBAL_CONSTANTS.CURRENCY" multiLanguageAllows>
                        <LabelComponent text=" *" style={[commonStyles.textRed]} />
                      </LabelComponent>

                      <CurrencyNetworkSelector
                        currencyData={transformedCurrencyData}
                        networkData={transformedNetworkData}
                        selectedCurrency={values.currency}
                        selectedNetwork={values.network}
                        onSelect={(currency, network) => {
                          setFieldValue("currency", currency);
                          setFieldValue("network", network);
                          updateState({ withdrawAmount: '' });
                          setFieldValue('amount', '');
                          handleCurrencySelect({ currencyCode: currency });
                          handleNetworkSelect({ network });
                        }}
                      />

                      <ViewComponent style={[commonStyles.formItemSpace]} />

                      <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.gap8, commonStyles.flexWrap]}>
                        <ViewComponent style={[commonStyles.flex1]}>
                          <LabelComponent style={commonStyles.inputLabel} text="GLOBAL_CONSTANTS.AMOUNT" multiLanguageAllows>
                            <LabelComponent text=" *" style={[commonStyles.textRed]} />
                          </LabelComponent>
                        </ViewComponent>
                        <ViewComponent>
                          <ViewComponent style={[commonStyles.dflex, commonStyles.justifyend, commonStyles.alignCenter, commonStyles.mb6]}>
                            <ParagraphComponent
                              style={[commonStyles.availblelabel]}
                              text={`${t('GLOBAL_CONSTANTS.AVAILABLE_BALANCES')}`}
                            />
                            <CurrencyText
                              value={transformedNetworkData.find(n => n.code === values.network)?.amount ?? 'N/A'}
                              currency={values.currency}
                              symboles={true}
                              decimalPlaces={4}
                              style={[commonStyles.availbleamount]}
                            />
                          </ViewComponent>
                        </ViewComponent>
                      </ViewComponent>

                      <ViewComponent style={[commonStyles.sectionGap]}>
                        <AmountInput
                          placeholder="GLOBAL_CONSTANTS.ENTER_AMOUNT"
                          maxLength={16}
                          onChangeText={handleAmountInputChange}
                          value={state.withdrawAmount}
                          onMinPress={handleMinPress}
                          onMaxPress={handleMaxPress}
                          minLimit={state.withdrawBalanceInfo?.minLimit == null ? undefined : state.withdrawBalanceInfo?.minLimit}
                          maxLimit={state.withdrawBalanceInfo?.maxLimit == null ? undefined : state.withdrawBalanceInfo?.maxLimit}
                          showError={errors.amount}
                          withdrawBalanceInfo={state.withdrawBalanceInfo}
                          touched={touched?.amount}
                          maxDecimals={JSON.parse(CardsInfoData?.transactionAdditionalFields || '{}')?.IsAllowDecimalValue ? 8 : 0}
                        />
                      </ViewComponent>
                    </ViewComponent>

                    <ViewComponent style={[commonStyles.sectionGap]}>
                      <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap8]}>
                        <ViewComponent style={[commonStyles.flex1]}>
                          <ButtonComponent
                            title="GLOBAL_CONSTANTS.CANCEL"
                            onPress={() => navigation.goBack()}
                            solidBackground={true}
                            disable={state.loading || isSubmitting}
                          />
                        </ViewComponent>
                        <ViewComponent style={[commonStyles.flex1]}>
                          <ButtonComponent
                            title="GLOBAL_CONSTANTS.CARD_WITHDRAW_BUTTON"
                            loading={state.loading || isSubmitting}
                            onPress={() => handleSubmit()}
                          />
                        </ViewComponent>
                      </ViewComponent>
                    </ViewComponent>
                  </ViewComponent>
                );
              }}
            </Formik>
          </ScrollViewComponent>
        </KeyboardAvoidingWrapper>
      </Container>

      {state.isSuccessSheet && (
        <CustomRBSheet
          refRBSheet={rbSheetRef}
          height={"Large"}
          title="Success"
          onClose={handleSheetClose}
        >
          <CardActionsSheetContent
            isSuccess={state.isSuccessSheet}
            successAmount={state.successAmount}
            successCurrency={state.successCurrency}
            successCardName={state.successCardName}
            onSuccessDone={handleSuccessDone}
            isWithdraw={true}
          />
        </CustomRBSheet>
      )}
    </ViewComponent>
  );
};

export default CardWithdraw;