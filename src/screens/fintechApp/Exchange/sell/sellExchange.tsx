import React, { useCallback, useEffect, useState, useRef, useMemo } from "react";
import { TextInput, BackHandler, Keyboard, RefreshControl } from "react-native";
import { NavigationProp, ParamListBase, useNavigation } from "@react-navigation/native";
import { ExchangeDropdownItem, ExchangeAsset, CryptoExchangeProps, CustomRBSheetRef } from '../interfaces/exchangeInterfaces';
import Feather from "react-native-vector-icons/Feather";
import FontAwesome6Icon from "react-native-vector-icons/FontAwesome6";
import { useThemeColors } from "../../../../hooks/themedHook/useThemeColors";
import { CoinImages, getThemedCommonStyles } from "../../../../components/CommonStyles";
import { useLngTranslation } from "../../../../hooks/languagesHook/useLngTranslation";
import { useCryptoSell } from "./hooks/useCryptoSell";
import { isErrorDispaly } from "../../../../utils/helpers";
import Container from "../../../../components/container/container";
import PageHeader from "../../../../components/pageHeader/pageHeader";
import ErrorComponent from "../../../../components/errorDisplay/errorDisplay";
import ViewComponent from "../../../../components/view/view";
import LabelComponent from "../../../../components/textComponets/lableComponent/lable";
import ParagraphComponent from "../../../../components/textComponets/paragraphText/paragraph";
import { CurrencyText } from "../../../../components/textComponets/currencyText/currencyText";
import CommonTouchableOpacity from "../../../../components/touchableComponents/touchableOpacity";
import SvgFromUrl from "../../../../components/svgIcon";
import Loadding from "../../../../components/skelton/skeltons";
import ButtonComponent from "../../../../components/buttons/button";
import CustomRBSheet from "../../../../components/models/commonBottomSheet";
import { CRYPTO_CONSTANTS } from "../../wallets/constant";
import SelectionSheetContent from "../../../commonScreens/SelectionSheetContent";
import { s } from "../../../../components/theme/scale";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import DashboardLoader from '../../../../components/loader';
import { AvilableLoader, MinMAxLoader } from "../utils/skeltons";
import AmountInput from "../../../../components/amountInput/amountInput";
import { getTabsConfigation } from "../../../../../cofiguration";


const SellExchange = React.memo((props: CryptoExchangeProps) => {
  const NEW_COLOR = useThemeColors();
  const commonStyles = useMemo(() => getThemedCommonStyles(NEW_COLOR), [NEW_COLOR]);
  const getCurrencyType = getTabsConfigation("CURRENCY_DECIMAL_PLACES") as Record<string, number>;
  const [changeAmt, setChangeAmt] = useState<string>("");
  const [disableBtn, setDisableBtn] = useState<boolean>(false);
  const coinSheetRef = useRef<CustomRBSheetRef>(null);
  const currencySheetRef = useRef<CustomRBSheetRef>(null);
  const [preViewDataLoading, setPreViewDataLoading] = useState<boolean>(false);
  const [cryptoConvertVal, setCryptoConvertVal] = useState<string>("");
  const [inputValue, setInputValue] = useState<string>("");
  const [fiatSelectedVal, setFiatSelectedVal] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [coinName, setCoinName] = useState<string | undefined>(props?.route?.params?.coinFullName);
  const [selectedValue, setSelectedValue] = useState<string | undefined>(props?.route?.params?.cryptoCoin);
  const [keyboardHeight, setKeyboardHeight] = useState<number>(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const { t } = useLngTranslation();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const isDropdownChanging = useRef<boolean>(false);
  const configDecimals: number = getCurrencyType?.[selectedValue || 'USDT'] || 8;

  // skeletons
  const loader = MinMAxLoader(1);
  const receiveLoader = AvilableLoader();

  const {
    cryptoCoinData,
    dropDownList,
    coinDataLoading,
    getDropDownObj,
    oneCoinValLoader,
    changeAmountLoader,
    summaryData,
    showSummary,
    error: hookError,
    getMinAxDetails,
    getCryptoCoins,
    getFiatAssetsData,
    getFromAssetValue,
    getSummaryDetails,
    clearSummary,
    clearError,
  } = useCryptoSell();

  const typedDropDownList: ExchangeDropdownItem[] = dropDownList || [];
  const typedCryptoCoinData: ExchangeAsset[] = cryptoCoinData || [];

  useEffect(() => {
    const initializeData = async () => {
      try {
        setRefreshing(true);
        await getCryptoCoins();
        const fiatAssets = await getFiatAssetsData();
        setRefreshing(false);
        if (fiatAssets?.length > 0) {
          setFiatSelectedVal(fiatAssets[0]?.code || "");
        }
        await getMinAxDetails(props?.route?.params?.cryptoCoin);
        setErrorMsg("");
      } catch (error) {
        setErrorMsg(isErrorDispaly(error));
      }
    };
    initializeData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (props?.route?.params?.cryptoCoin) {
      setErrorMsg("");
      setSelectedValue(props?.route?.params?.cryptoCoin);
    }
    if (props?.route?.params?.toCoin) {
      setErrorMsg("");
      setFiatSelectedVal(props?.route?.params?.toCoin);
    }
  }, [props?.route?.params?.cryptoCoin, props?.route?.params?.toCoin, props?.route?.params?.fromAmount]);

  useEffect(() => {
    // Skip if dropdown is changing to prevent duplicate API calls
    if (isDropdownChanging.current) {
      return;
    }

    const timeoutId = setTimeout(() => {
      if (inputValue && inputValue !== "" && fiatSelectedVal && selectedValue) {
        const numValue = parseFloat(inputValue);
        const sellMin = getDropDownObj?.min;

        // Only call API if amount is within min/max range
        if (!isNaN(numValue) && (numValue > 0 || inputValue.endsWith('.'))) {
          const sellMax = getDropDownObj?.max;
          if ((sellMin === null || sellMin === undefined || numValue >= sellMin) &&
            (sellMax === null || sellMax === undefined || numValue <= sellMax)) {
            getFromAssetValue(inputValue, selectedValue, fiatSelectedVal, setCryptoConvertVal);
          } else {
            setCryptoConvertVal("");
          }
        } else {
          setCryptoConvertVal("");
        }
      } else {
        setCryptoConvertVal("");
      }
    }, 800);

    return () => clearTimeout(timeoutId);
  }, [inputValue, fiatSelectedVal, selectedValue, getDropDownObj?.min, getDropDownObj?.max]);

  useEffect(() => {
    const backAction = () => {
      if (props?.route?.params?.fromScreen === 'ExchangeCryptoList') {
        navigation.goBack();
      } else {
        navigation.navigate("Dashboard", { initialTab: "GLOBAL_CONSTANTS.EXCHANGE", animation: "slide_from_left" });
      }
      return true;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [navigation, props?.route?.params]);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
      setIsKeyboardVisible(true);
    });

    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
      setIsKeyboardVisible(false);
    });

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

  const resetLoadingState = () => {
    setPreViewDataLoading(false);
    setDisableBtn(false);
  };

  const validateAmount = () => {
    if (changeAmt === "" || changeAmt === null || changeAmt === undefined) {
      return `${t("GLOBAL_CONSTANTS.ENTER_VALID_AMOUNT")} ${selectedValue}.`;
    }

    const amount = parseFloat(changeAmt);
    const availableCryptoBalance = typedCryptoCoinData.find((item: ExchangeAsset) => item.code === selectedValue)?.amount || 0;
    const sellMin = getDropDownObj?.min;
    const sellMax = getDropDownObj?.max;

    if (amount <= 0) {
      return t("GLOBAL_CONSTANTS.AMOUNT_MUST_BE_GREATER_THAN_ZERO");
    }

    // Scenario 3 & 4: Check minimum if sellMin is not null
    if (sellMin !== null && sellMin !== undefined && amount < sellMin) {
      return `${t("GLOBAL_CONSTANTS.MINIMUM_LIMIT_NOT_MET")} ${sellMin.toLocaleString(undefined, { maximumFractionDigits: 5 })} ${selectedValue}`;
    }

    // Scenario 2 & 4: Check maximum if sellMax is not null (BEFORE available balance)
    if (sellMax !== null && sellMax !== undefined && amount > sellMax) {
      return `${t("GLOBAL_CONSTANTS.MAXIMUM_LIMIT_EXCEEDED")} ${sellMax.toLocaleString(undefined, { maximumFractionDigits: 5 })} ${selectedValue}.`;
    }

    // Check available balance last
    if (amount > availableCryptoBalance) {
      return `${t("GLOBAL_CONSTANTS.INSUFFICIENT_BALANCE_TO_SELL")} ${selectedValue} ${t("GLOBAL_CONSTANTS.TO_SELL")}.`;
    }

    if (Number(cryptoConvertVal) <= 0) {
      return `${t("GLOBAL_CONSTANTS.CONVERTED_AMOUNT_MUST_BE_GREATER_THAN_ZERO")} ${selectedValue}.`;
    }

    return null;
  };

  const handlePreviewValidation = async () => {
    const validationError = validateAmount();
    if (validationError) {
      resetLoadingState();
      setErrorMsg(validationError);
      return;
    }
    try {
      const summaryResponse = await getSummaryDetails(changeAmt, selectedValue, fiatSelectedVal);
      resetLoadingState();

      // Navigate to summary page with fresh summaryData
      navigation.navigate('SellExchangeSummary', {
        changeAmt,
        selectedValue,
        fiatSelectedVal,
        cryptoConvertVal,
        summaryData: summaryResponse, // Use the fresh data
        typedDropDownList,
        typedCryptoCoinData,
        getDropDownObj,
        coinName,
        animation: 'slide_from_right'
      });
    } catch (error) {
      resetLoadingState();
      setErrorMsg(isErrorDispaly(error));
    }
  };



  const getPreviewData = async () => {
    Keyboard.dismiss();

    const validationError = validateAmount();
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }

    setPreViewDataLoading(true);
    setErrorMsg("");
    setDisableBtn(true);
    await handlePreviewValidation();
  };

  const handleDropDownChange = (val: ExchangeAsset) => {
    Keyboard.dismiss();
    getMinAxDetails(val?.code);
    setSelectedValue(val?.code);
    setCoinName(val?.name);
    setChangeAmt("");
    setInputValue("");
    setCryptoConvertVal("");
    clearSummary();
    coinSheetRef?.current?.close();
  };

  const handleDropDownFiatChange = (val: ExchangeDropdownItem) => {
    Keyboard.dismiss();
    isDropdownChanging.current = true;
    setFiatSelectedVal(val?.code);
    clearSummary();
    currencySheetRef?.current?.close();
    setErrorMsg("");

    if (changeAmt && changeAmt !== "") {
      getFromAssetValue(changeAmt, selectedValue, val?.code, setCryptoConvertVal);
    }

    // Reset flag after state update
    setTimeout(() => {
      isDropdownChanging.current = false;
    }, 1000);
  };

  const handleGoBack = useCallback(() => {
    if (props?.route?.params?.fromScreen === 'ExchangeCryptoList') {
      navigation?.goBack();
    } else {
      navigation?.navigate("Dashboard", { initialTab: "GLOBAL_CONSTANTS.EXCHANGE", animation: "slide_from_left" });
    }
  }, [navigation, props?.route?.params]);

  const handleMinValue = useCallback(() => {
    const sellMin = getDropDownObj?.min;

    // Only set min value if sellMin is not null
    if (sellMin !== null && sellMin !== undefined) {
      const fixedResult = parseFloat(sellMin).toFixed(configDecimals);
      setChangeAmt(fixedResult);
      getFromAssetValue(fixedResult, selectedValue, fiatSelectedVal, setCryptoConvertVal);
      setErrorMsg("");
      clearSummary();
    }
  }, [getDropDownObj, selectedValue, fiatSelectedVal]);

  const handleMaxValue = useCallback(() => {
    const availableCryptoBalance = typedCryptoCoinData.find((item: ExchangeAsset) => item.code === selectedValue)?.amount || 0;
    const sellMax = getDropDownObj?.max;

    // Determine max value based on scenarios
    let maxValue = availableCryptoBalance;

    // If sellMax exists (not null), use the smaller of sellMax or available balance
    if (sellMax !== null && sellMax !== undefined) {
      maxValue = Math.min(availableCryptoBalance, sellMax);
    }

    const fixedResult = maxValue.toFixed(configDecimals);
    setChangeAmt(fixedResult);
    getFromAssetValue(fixedResult, selectedValue, fiatSelectedVal, setCryptoConvertVal);
    setErrorMsg("");
    clearSummary();
  }, [getDropDownObj, selectedValue, fiatSelectedVal, cryptoCoinData]);



  const handleRefresh = async () => {
    setRefreshing(true);
    await getCryptoCoins();
    await getFiatAssetsData();
    setRefreshing(false);
  };


  return (
    <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
      <Container style={commonStyles.container}>
        <PageHeader title={`${t("GLOBAL_CONSTANTS.SELL")} ${coinName || ''}`} onBackPress={handleGoBack} />

        {/* unified error component usage */}
        {(errorMsg !== "" || hookError !== "") && (
          <ErrorComponent message={errorMsg || hookError} onClose={() => { setErrorMsg(""); clearError(); }} />
        )}
        {refreshing && (<ViewComponent style={[commonStyles.flex1, commonStyles.alignCenter, commonStyles.justifyCenter]}>
          <DashboardLoader />
        </ViewComponent>)}
        {!refreshing && <ViewComponent style={[commonStyles.flex1]}>
          <KeyboardAwareScrollView
            contentContainerStyle={{ flexGrow: 1, paddingBottom: isKeyboardVisible ? s(10) : s(20) }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            enableOnAndroid={true}
            extraScrollHeight={0}
            enableAutomaticScroll={false}
            refreshControl={<RefreshControl tintColor={NEW_COLOR.BUTTON_BG} refreshing={refreshing} onRefresh={handleRefresh} />}
            style={[commonStyles.flex1]}
          >
            <ViewComponent style={[commonStyles.gap6, commonStyles.relative, commonStyles.flexCol]}>
              <ViewComponent style={[{ height: s(121) }, commonStyles.bgnote, commonStyles.flexCol, commonStyles.justifyContent]}>
                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent]}>
                  <LabelComponent text={`${t("GLOBAL_CONSTANTS.YOU_SELL")}`} style={[commonStyles.availbleamountbuylabel, commonStyles.mt6]} />
                  <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter]}>
                    <ParagraphComponent style={[commonStyles.availblelabel]} text={`${t("GLOBAL_CONSTANTS.AVAILABLE")} : `} />
                    <CurrencyText
                      value={typedCryptoCoinData.find((item: ExchangeAsset) => item.code === selectedValue)?.amount || 0}
                      decimalPlaces={4}
                      currency={selectedValue || ""}
                      style={[commonStyles.availbleamount]}
                    />
                  </ViewComponent>
                </ViewComponent>

                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap4, commonStyles.justifyContent]}>
                  <CommonTouchableOpacity onPress={() => { Keyboard.dismiss(); coinSheetRef?.current?.open(); }} style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap2]}>
                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap6]}>
                      <ViewComponent style={{ width: s(24), height: s(24) }}>

                        <SvgFromUrl uri={CoinImages[selectedValue?.toLowerCase?.() || ""] || ''} width={s(24)} height={s(24)} />
                      </ViewComponent>

                      <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap6, commonStyles.mt4]} >
                        <ParagraphComponent style={[commonStyles.primarytext]} text={selectedValue || ''} />
                        <Feather name="chevron-down" size={s(22)} color={NEW_COLOR.TEXT_WHITE} />

                      </ViewComponent>

                    </ViewComponent>
                  </CommonTouchableOpacity>





                  <AmountInput
                    exchangeDesign
                    value={changeAmt}
                    onChangeText={(text) => {
                      clearSummary();
                      setErrorMsg("");
                      setChangeAmt(text);
                      setInputValue(text);
                      if (!text || text.trim() === "") {
                        setCryptoConvertVal("");
                      }
                    }}
                    placeholder="0.00"
                    decimalPlaces={configDecimals}
                    maxLength={13}
                    editable={!coinDataLoading && !oneCoinValLoader}
                  />
                </ViewComponent>

                <ViewComponent>
                  {oneCoinValLoader ? (
                    <Loadding contenthtml={loader} />
                  ) : (
                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.mb4,
                    // If only MAX exists (MIN is null), align to right
                    (getDropDownObj?.min === null || getDropDownObj?.min === undefined) &&
                      (getDropDownObj?.max !== null && getDropDownObj?.max !== undefined)
                      ? commonStyles.justifyend
                      : commonStyles.justifyContent
                    ]}>
                      {/* Show MIN only if sellMin is not null */}
                      {getDropDownObj?.min !== null && getDropDownObj?.min !== undefined && (
                        <CommonTouchableOpacity onPress={handleMinValue}>
                          <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter]}>
                            <ParagraphComponent style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textprimary]} text={`${t("GLOBAL_CONSTANTS.MIN")}  `} />
                            <CurrencyText
                              value={getDropDownObj?.min || 0}
                              decimalPlaces={4}
                              currency={selectedValue || ''}
                              style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textprimary]}
                            />
                          </ViewComponent>
                        </CommonTouchableOpacity>
                      )}

                      {/* Show MAX only if sellMax is not null */}
                      {getDropDownObj?.max !== null && getDropDownObj?.max !== undefined && (
                        <CommonTouchableOpacity onPress={handleMaxValue} style={[commonStyles.minmaxbg]}>
                          <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter]}>
                            <ParagraphComponent style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textprimary]} text={`${t("GLOBAL_CONSTANTS.MAX")}  `} />
                            <CurrencyText
                              // value={Math.min(
                              //   typedCryptoCoinData.find((item: ExchangeAsset) => item.code === selectedValue)?.amount || 0,
                              //   getDropDownObj?.max || 0
                              // )}
                              value={(parseFloat(getDropDownObj?.amount) < parseFloat(getDropDownObj?.min) ? parseFloat(getDropDownObj?.max) : (parseFloat(getDropDownObj?.amount) > parseFloat(getDropDownObj?.max) ? parseFloat(getDropDownObj?.max) : parseFloat(getDropDownObj?.amount)))}
                              decimalPlaces={4}
                              currency={selectedValue || ''}
                              style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textprimary]}
                            />
                          </ViewComponent>
                        </CommonTouchableOpacity>
                      )}
                    </ViewComponent>
                  )}
                </ViewComponent>
              </ViewComponent>

              <ViewComponent style={[commonStyles.bgnote, commonStyles.p14, commonStyles.justifyContent]}>
                <ViewComponent style={[commonStyles.mb10, commonStyles.mt10, commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent]}>
                  <LabelComponent text={`${t("GLOBAL_CONSTANTS.YOU_RECEIVE")}`} style={[commonStyles.availbleamountbuylabel, commonStyles.mt6]} />
                  <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter]}>
                    <ParagraphComponent style={[commonStyles.availblelabel]} text={`${t("GLOBAL_CONSTANTS.AVAILABLE")} : `} />
                    <CurrencyText
                      value={typedDropDownList.find((item: ExchangeDropdownItem) => item.code === fiatSelectedVal)?.amount || 0}
                      decimalPlaces={2}
                      currency={fiatSelectedVal || ""}
                      style={[commonStyles.availbleamount]}
                    />
                  </ViewComponent>
                </ViewComponent>

                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap4, commonStyles.justifyContent]}>
                  <CommonTouchableOpacity onPress={() => { Keyboard.dismiss(); currencySheetRef?.current?.open(); }} style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap2]}>
                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap6]}>
                      <ViewComponent style={{ width: s(24), height: s(24) }}>
                        <SvgFromUrl uri={CoinImages[fiatSelectedVal?.toLowerCase?.() || ""] || ''} width={s(24)} height={s(24)} />
                      </ViewComponent>
                      <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap6, commonStyles.mt4]} >
                        <ParagraphComponent style={[commonStyles.primarytext]} text={fiatSelectedVal || ''} />
                        <Feather name="chevron-down" size={s(22)} color={NEW_COLOR.TEXT_WHITE} />
                      </ViewComponent>
                    </ViewComponent>
                  </CommonTouchableOpacity>







                  <ViewComponent style={[commonStyles.justifyAround]}>
                    {changeAmountLoader ? (
                      <Loadding contenthtml={receiveLoader} />
                    ) : (
                      <AmountInput
                        exchangeDesign
                        value={cryptoConvertVal}
                        placeholder="0.00"
                        decimalPlaces={2}
                        maxLength={13}
                        editable={false}
                        showDisabledColor={false}
                      />
                    )}
                  </ViewComponent>
                </ViewComponent>
              </ViewComponent>
              <ViewComponent style={[commonStyles.sectionGap]} />
              {isKeyboardVisible && (
                <ButtonComponent
                  title={t("GLOBAL_CONSTANTS.SELL")}
                  multiLanguageAllows={false}
                  disable={disableBtn || changeAmountLoader}
                  loading={preViewDataLoading}
                  onPress={getPreviewData}
                />
              )}

              <ViewComponent style={[commonStyles.relative, { position: "absolute", left: "50%", top: s(125), transform: [{ translateX: -s(18) }, { translateY: -s(18) }], minHeight: s(37), minWidth: s(37) }]}>
                <ViewComponent style={[commonStyles.buyiconbg]}>
                  <FontAwesome6Icon name="arrow-down-long" size={s(16)} color={NEW_COLOR.TEXT_WHITE} />
                </ViewComponent>
              </ViewComponent>
            </ViewComponent>



          </KeyboardAwareScrollView>

          {!isKeyboardVisible && (
            <ViewComponent style={[commonStyles.sectionGap]}>
              <ButtonComponent
                title={t("GLOBAL_CONSTANTS.SELL")}
                multiLanguageAllows={false}
                disable={disableBtn || changeAmountLoader}
                loading={preViewDataLoading}
                onPress={getPreviewData}
              />
            </ViewComponent>
          )}
        </ViewComponent>}

        {/* Coin Selection Sheet */}
        <CustomRBSheet
          refRBSheet={coinSheetRef}
          title={CRYPTO_CONSTANTS?.SELECT_COIN}
          height={"Medium"}
        >
          <SelectionSheetContent
            dataLoading={coinDataLoading}
            itemsList={typedCryptoCoinData}
            selectedItem={typedCryptoCoinData.find((item: ExchangeAsset) => item.code === selectedValue) || null}
            handleActiveItem={handleDropDownChange}
            transactionCardContent={null}
            commonStyles={commonStyles}
            s={s}
            searchPlaceholder={CRYPTO_CONSTANTS?.SEARCH_COIN}
            searchBindKey="code"
            showAmount={true}
            showChangePercent={true}
            iconSize={s(34)}
            isCrypto={true}
          />
        </CustomRBSheet>

        {/* Currency Selection Sheet */}
        <CustomRBSheet
          refRBSheet={currencySheetRef}
          title={CRYPTO_CONSTANTS?.SELECT_CURRENCY}
          height={"Medium"}
        >
          <SelectionSheetContent
            dataLoading={false}
            itemsList={typedDropDownList}
            selectedItem={typedDropDownList.find((item: ExchangeDropdownItem) => item.code === fiatSelectedVal) || null}
            handleActiveItem={handleDropDownFiatChange}
            transactionCardContent={null}
            commonStyles={commonStyles}
            s={s}
            searchPlaceholder={CRYPTO_CONSTANTS?.SEARCH_CURRENCY}
            searchBindKey="code"
            showAmount={true}
            showChangePercent={false}
            iconSize={s(24)}
            isCrypto={false}

          />
        </CustomRBSheet>


      </Container>
    </ViewComponent>
  );
});

export default SellExchange;
