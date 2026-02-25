import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Formik } from 'formik';
import { useNavigation } from '@react-navigation/native';
import { getThemedCommonStyles } from '../../../../../components/CommonStyles';
import Container from '../../../../../components/container/container';
import { s } from '../../../../../constants/styels/scale';
import { transactionCard } from '../../../../../skeletons/skeltonViews';
import { isErrorDispaly } from '../../../../../utils/helpers';
import { useLngTranslation } from '../../../../../hooks/languagesHook/useLngTranslation';
import { FormValues, NetworkData, OrderSummaryData, Payee } from './interface';
import { useThemeColors } from '../../../../../hooks/themedHook/useThemeColors';
import PayeeListSheetContent from './components/PayeeListSheetContent';
import SafeAreaViewComponent from '../../../../../components/safeArea/safeArea';
import DashboardLoader from '../../../../../components/loader';
import PageHeader from '../../../../../components/pageHeader/pageHeader';
import ErrorComponent from '../../../../../components/errorDisplay/errorDisplay';
import { withDrawSchema } from './schema';
import CustomRBSheet from '../../../../../components/models/commonBottomSheet';
import WithdrawFormFields from './components/WithdrawFormFields';
import ViewComponent from '../../../../../components/view/view';
import NoDataComponent from '../../../../../components/noData/noData';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { BackHandler, Keyboard } from 'react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
import CommonTouchableOpacity from '../../../../../components/touchableComponents/touchableOpacity';
import TextMultiLanguage from '../../../../../components/textComponets/multiLanguageText/textMultiLangauge';
import ButtonComponent from '../../../../../components/buttons/button';
import Feather from 'react-native-vector-icons/Feather';
import { ADD_RECIPIENT } from '../../../profile/addressbook/crytoPayee/constant';
import WalletsService from '../../../../../apiServices/wallets';

const CrptoWithdraw: React.FC = (props: any) => {
  const [dataLoading, setDataLoading] = useState<boolean>(false);
  const rbSheetRef = useRef<any>(null);
  const navigation = useNavigation<any>();
  const transactionCardContent = transactionCard(5);
  const [selectedBenificiary, setSelectedBemificiary] = useState<Payee | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [payeesList, setPayeesList] = useState<Payee[]>([]);
  const [btnLoading, setBtnLoading] = useState<boolean>(false);
  const { t } = useLngTranslation();
  const [orderSummaryDisaplay, setOrderSummaryDisplay] = useState<boolean>(false);
  const [orderSummayData, setOrderSummaryData] = useState<OrderSummaryData | null>(null);
  const [selectedCurrencyId, setSlectedCurrencyId] = useState('')
  const [formInitialValues, setFormInitialValues] = useState<FormValues>({ amount: null, currency: '', network: '' });
  const [assetsLoader, setAssetLoader] = useState(false);
  const [formikTouched, setFormikTouched] = useState<boolean>(false);
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const [availableCoins, setAvailableCoins] = useState<any[]>([]);
  const [availableNetworks, setAvailableNetworks] = useState<NetworkData[]>([]);
  const [selectedCoin, setSelectedCoin] = useState<any>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkData | null>(null);
  const [selectedPayee, setSelectedPayee] = useState<boolean>(false);
  const addPayeeSheetRef = useRef<RBSheet>(null);

  useEffect(() => {
    getCurrencyList();
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => { backArrowButtonHandler(); return true; }
    );
    return () => backHandler.remove();

  }, []);
  const getCurrencyList = async () => {
    setErrorMsg('');
    setAssetLoader(true);
    setAvailableCoins([]);
    setAvailableNetworks([]);
    setSelectedCoin(null);
    setSelectedNetwork(null);
    setPayeesList([]);
    setSelectedBemificiary(null);
    try {
      const assetResponse = await WalletsService.getShowAssets();
      const data = assetResponse?.data as { wallets?: any[] } | undefined;
      if (!assetResponse?.ok || !data?.wallets?.[0]?.assets) {
        setErrorMsg(isErrorDispaly(assetResponse) || t("ERROR_MESSAGES.FAILED_TO_LOAD_ASSETS"));
        return;
      }
      const wallet = data.wallets[0];
      const currentMerchantId = wallet?.id;
      if (!currentMerchantId) {
        setErrorMsg(t("GLOBAL_CONSTANTS.MERCHANT_ID_MISSING"));
        return;
      }
      const availableAssets = wallet.assets;
      if (!availableAssets || availableAssets.length === 0) {
        setErrorMsg(t("GLOBAL_CONSTANTS.NO_ASSETS_AVAILABLE"));
        return;
      }

      setAvailableCoins(availableAssets);

      // Pre-select coin based on route params
      const propsData = props?.route?.params?.propsData;
      let initialCoin = availableAssets[0]; // Default to first coin

      if (propsData?.coinName) {
        const foundCoin = availableAssets.find(asset => asset.name === propsData.coinName || asset.code === propsData.coinName);
        if (foundCoin) initialCoin = foundCoin;
      }
      setSelectedCoin(initialCoin);
      await fetchNetworksForCoin(initialCoin);
    } catch (error) {
      setErrorMsg(isErrorDispaly(error));
    } finally {
      setAssetLoader(false);
    }
  };

  const fetchNetworksForCoin = async (coin: any) => {
    try {
      const networkResponse = await WalletsService.getWalletRecieved(coin.code, 'withdraw');

      if (networkResponse?.ok && Array.isArray(networkResponse.data) && networkResponse.data.length > 0) {
        setAvailableNetworks(networkResponse.data);
        setSelectedNetwork(networkResponse.data[0]);
        setSlectedCurrencyId(networkResponse.data[0].id);
        if (networkResponse.data[0].name) {
          getPayeesLu(networkResponse.data[0].name);
        }
        setFormInitialValues({
          amount: null,
          currency: coin.code,
          network: networkResponse.data[0].code,
        });
      } else {
        setErrorMsg(isErrorDispaly(networkResponse));
      }
    } catch (error) {
      setErrorMsg(isErrorDispaly(error));
    }
  };
  const handleCoinSelection = async (coin: any) => {
    setSelectedCoin(coin);
    setAvailableNetworks([]);
    setSelectedNetwork(null);
    setPayeesList([]);
    setSelectedBemificiary(null);
    setFormInitialValues({
      amount: null,
      currency: "",
      network: '',
    });
    await fetchNetworksForCoin(coin);
  };

  const handleNetworkSelection = async (network: NetworkData) => {
    if (!selectedCoin) return;
    setSelectedNetwork(network);
    setSlectedCurrencyId(network.id);

    setFormInitialValues({
      amount: null,
      currency: selectedCoin.code,
      network: network.code,
    });

    getPayeesLu(network.name);
    setSelectedBemificiary(null);
  };
  const getPayeesLu = async (networkName: string) => {
    setErrorMsg('');
    setDataLoading(true);
    const savedPayeeId = selectedBenificiary?.id || props?.route?.params?.selectedPayeeId;
    setPayeesList([]);
    try {
      const response: any = await WalletsService.getCryptoPayees(networkName);
      if (response?.ok) {
        setPayeesList(response?.data);
        // const restoredPayee = savedPayeeId && response?.data?.find((p: Payee) => p.id === savedPayeeId);
        // if (restoredPayee) {
        //   setSelectedBemificiary(restoredPayee);
        //   setSelectedPayee(true);
        // } else {
        //   setSelectedBemificiary(null);
        // }
      } else {
        setPayeesList([]);
        setSelectedBemificiary(null);
        setErrorMsg(isErrorDispaly(response) || t("ERROR_MESSAGES.FAILED_TO_LOAD_PAYEES"));
      }
    } catch (error) {
      setErrorMsg(isErrorDispaly(error));
    } finally {
      setDataLoading(false);
    }
  };
  const onSubmit = async (values: FormValues) => {
    if (!selectedBenificiary) {
      setFormikTouched(true);
      return;
    }
    if (values?.amount === null || values?.amount <= 0) {
      setErrorMsg(t('GLOBAL_CONSTANTS.AMOUNT_SHOULD_BE_GREATER_THAN_ZERO'));
      return;
    }
    if (selectedNetwork && values?.amount > selectedCoin.amount) {
      setErrorMsg(t('GLOBAL_CONSTANTS.AMOUNT_SHOLD_BE_LESS_THAN_AVAILABLE_BALANCE'));
      return;
    }
    else if (selectedNetwork?.minLimit != null)
      if (selectedNetwork && values?.amount < selectedNetwork.minLimit) {
        setErrorMsg(`${t('GLOBAL_CONSTANTS.MIN_WITHDRAW_AMOUNT_IS')} ${selectedNetwork.minLimit.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })}  ${values.currency}`);
        return;
      }
      else if (selectedNetwork?.maxLimit != null) {
        if (selectedNetwork && values?.amount > selectedNetwork.maxLimit) {
          setErrorMsg(`${t('GLOBAL_CONSTANTS.MAX_WITHDRAW_AMOUNT_IS')} ${selectedNetwork.maxLimit.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })}  ${values.currency}`);
          return;
        }
      }
    setBtnLoading(true);
    setErrorMsg('');
    try {
      const obj = {
        payeeId: selectedBenificiary.id,
        cryptorWalletId: selectedCurrencyId,
        amount: values?.amount
      }
      const response = await WalletsService.gotoSummeryPage(obj);
      if (response?.ok) {
        const screenName = props?.route?.params?.screenName || "Wallets";
        const originalSource = props?.route?.params?.originalSource || "Wallets";
        // Navigate to CryptoWithdrawSummary screen with complete API response data
        navigation.navigate('CryptoWithdrawSummary', {
          ...(response.data && typeof response.data === 'object' ? response.data : {}),
          favoriteName: selectedBenificiary.favoriteName,
          screenName: screenName,
          originalSource: originalSource,
          selectedPayeeId: selectedBenificiary.id
        });
      } else {
        setErrorMsg(isErrorDispaly(response));
      }
    } catch (error) {
      setErrorMsg(isErrorDispaly(error));
    } finally {
      setBtnLoading(false);
    }
  };

  const handleSendAmountChange = (value: string, setFieldValue: (field: string, value: any) => void) => {
    setOrderSummaryDisplay(false);
    let numericValue = value.replace(/[^0-9.]/g, '');
    const parts = numericValue.split('.');
    if (parts.length > 1) {
      numericValue = parts[0] + '.' + parts.slice(1).join('').slice(0, 8);
    }
    setFieldValue('amount', numericValue);
  };


  const backArrowButtonHandler = useCallback(() => {
    if (props?.route?.params?.screenName === "Withdraw") {
      navigation.navigate("Dashboard", { initialTab: "GLOBAL_CONSTANTS.HOME" });
    } else {
      navigation.goBack();
    }
  }, [navigation]);;
  const handleBenificiaryList = () => {
    Keyboard.dismiss();
    rbSheetRef?.current?.open();
  };
  const handleActvePayee = (item: Payee) => {
    setSelectedBemificiary(item);
    setSelectedPayee(true)
    rbSheetRef.current.close();
  };
  const handleError = () => {
    setErrorMsg('');
  };
  const validateBeneficiary = () => {
    if (formikTouched && !selectedBenificiary) {
      return t('GLOBAL_CONSTANTS.IS_REQUIRED');
    }
    return undefined;
  };
  const handleMinValue = (setFieldValue: (field: string, value: any) => void) => {
    setOrderSummaryDisplay(false);
    setOrderSummaryData(null);
    if (selectedNetwork) {
      setFieldValue('amount', selectedNetwork?.minLimit?.toFixed(2));
    }
  };
  const handleMaxValue = (setFieldValue: (field: string, value: any) => void) => {
    setOrderSummaryDisplay(false);
    setOrderSummaryData(null);
    if (selectedNetwork) {
      setFieldValue('amount', selectedNetwork?.maxLimit?.toFixed(2));
    }
  };
  const handleNavigatePayee = () => {
    rbSheetRef?.current && rbSheetRef?.current?.close();
    setTimeout(() => {
      addPayeeSheetRef.current && addPayeeSheetRef.current.open();
    }, 300);
  };

  const handlePersonalPayee = () => {
    addPayeeSheetRef.current && addPayeeSheetRef.current.close();
    navigation.navigate("AddContact", {
      screenName: "Withdraw",
      walletCode: formInitialValues?.currency,
      network: formInitialValues?.network,
      propsData: props?.route?.params?.propsData,
      accountType: ADD_RECIPIENT.PERSIONAL,

    });
    rbSheetRef.current.close();
  };

  const handleBusinessPayee = () => {
    addPayeeSheetRef.current && addPayeeSheetRef.current.close();
    navigation.navigate("AddContact", {
      screenName: "Withdraw",
      walletCode: formInitialValues?.currency,
      network: formInitialValues?.network,
      propsData: props?.route?.params?.propsData,
      accountType: ADD_RECIPIENT.BUSINESS,

    });
    rbSheetRef.current.close();
  };

  return (
    <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]} >
      {assetsLoader && (
        <SafeAreaViewComponent style={[commonStyles.flex1, commonStyles.alignCenter, commonStyles.justifyCenter]} >
          <DashboardLoader />
        </SafeAreaViewComponent>
      )}

      {!assetsLoader && (
        <KeyboardAwareScrollView
          contentContainerStyle={[{ flexGrow: 1 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          enableOnAndroid={true}
        >
          <Container style={[commonStyles.container]}>
            <PageHeader title={'GLOBAL_CONSTANTS.WITHDRAW'} onBackPress={backArrowButtonHandler} />
            {availableCoins.length > 0 && (
              <>
                {errorMsg != "" && <ErrorComponent message={errorMsg} onClose={handleError} />}
                <Formik
                  initialValues={formInitialValues}
                  onSubmit={onSubmit}
                  validationSchema={withDrawSchema}
                  enableReinitialize
                  validateOnChange={false}
                  validateOnBlur
                >
                  {(formikProps) => {
                    const { handleSubmit, values, setFieldValue } = formikProps;
                    useEffect(() => {
                      if (formInitialValues.currency && values.currency !== formInitialValues.currency) {
                        setFieldValue('currency', formInitialValues.currency, false);
                      }
                      if (formInitialValues.network && values.network !== formInitialValues.network) {
                        setFieldValue('network', formInitialValues.network, false);
                      }
                      if (formInitialValues.amount === null && values?.amount !== null) {
                        setFieldValue('amount', null, false);
                      }
                    }, [formInitialValues, setFieldValue]);

                    return (
                      <WithdrawFormFields
                        availableCoins={availableCoins}
                        availableNetworks={selectedCoin ? availableNetworks : []}
                        selectedCoin={selectedCoin}
                        selectedNetwork={selectedNetwork}
                        onNetworkSelect={handleNetworkSelection}
                        formInitialValues={formInitialValues}
                        t={t}
                        s={s}
                        formikProps={formikProps}
                        handleSendAmountChange={handleSendAmountChange}
                        handleMinValue={handleMinValue}
                        handleMaxValue={handleMaxValue}
                        handleBenificiaryList={handleBenificiaryList}
                        selectedBenificiary={selectedBenificiary}
                        formikTouched={formikTouched}
                        validateBeneficiary={validateBeneficiary}
                        orderSummaryDisaplay={orderSummaryDisaplay}
                        btnLoading={btnLoading}
                        orderSummayData={orderSummayData}
                        dataLoading={dataLoading}
                        handleSubmit={handleSubmit}
                        setFormikTouched={setFormikTouched}
                        onSelectCoin={handleCoinSelection}
                      />
                    );
                  }}
                </Formik>
              </>
            )}
            {(!assetsLoader && availableCoins.length === 0) && (<ViewComponent style={[commonStyles.mt70]} >
              <NoDataComponent Description={t("GLOBAL_CONSTANTS.NO_DATA_AVAILABLE")} />
            </ViewComponent>)}
            <CustomRBSheet
              refRBSheet={rbSheetRef}
              title="GLOBAL_CONSTANTS.SELECT_PAYEE"
              height={"Medium"}
            >
              <PayeeListSheetContent
                dataLoading={dataLoading}
                payeesList={payeesList}
                selectedBenificiary={selectedBenificiary}
                handleActvePayee={handleActvePayee}
                transactionCardContent={transactionCardContent}
                commonStyles={commonStyles}
                NEW_COLOR={NEW_COLOR}
                s={s}
                handleNavigatePayee={handleNavigatePayee}
              />
            </CustomRBSheet>
            <CustomRBSheet
              refRBSheet={addPayeeSheetRef}
              title=""
              height={"Small"}
            >
              <ViewComponent style={[commonStyles.sheetHeaderbg]}>
                <ViewComponent>
                  <CommonTouchableOpacity onPress={handlePersonalPayee}>
                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, { width: '100%', paddingHorizontal: 2 }]}>
                      <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]}>
                        <ViewComponent style={[commonStyles.bottomsheeticonbg]}>
                          <Feather name='user' size={s(18)} color={NEW_COLOR.TEXT_WHITE} />
                        </ViewComponent>
                        <TextMultiLanguage style={[commonStyles.textWhite, commonStyles.fs14, commonStyles.fw500, commonStyles.textCenter, commonStyles.mt5]} text={"GLOBAL_CONSTANTS.PERSONAL"} />
                      </ViewComponent>
                      <Feather name="chevron-right" size={24} color={NEW_COLOR.TEXT_WHITE} />
                    </ViewComponent>
                  </CommonTouchableOpacity>
                  <ViewComponent style={[commonStyles.listGap]} />
                  <CommonTouchableOpacity onPress={handleBusinessPayee}>
                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, { width: '100%', paddingHorizontal: 2 }]}>
                      <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]}>
                        <ViewComponent style={[commonStyles.bottomsheeticonbg]}>
                          <Feather name='briefcase' size={s(18)} color={NEW_COLOR.TEXT_WHITE} />
                        </ViewComponent>
                        <TextMultiLanguage style={[commonStyles.textWhite, commonStyles.fs14, commonStyles.fw500, commonStyles.textCenter, commonStyles.mt5]} text={"GLOBAL_CONSTANTS.BUSINESS"} />
                      </ViewComponent>
                      <Feather name="chevron-right" size={24} color={NEW_COLOR.TEXT_WHITE} />
                    </ViewComponent>
                  </CommonTouchableOpacity>
                </ViewComponent>
                <ViewComponent style={commonStyles.sectionGap} />
                <ButtonComponent title={"GLOBAL_CONSTANTS.CLOSE"} solidBackground={true} onPress={() => addPayeeSheetRef?.current?.close()} />
              </ViewComponent>
            </CustomRBSheet>
          </Container></KeyboardAwareScrollView>
      )}
    </ViewComponent>
  );
};

export default CrptoWithdraw;

