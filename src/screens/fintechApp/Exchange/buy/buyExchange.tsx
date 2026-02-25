import React, { useCallback, useEffect, useState, useRef, useMemo } from "react";
import { TextInput, BackHandler, Keyboard, RefreshControl } from "react-native";
import { NavigationProp, ParamListBase, useNavigation } from "@react-navigation/native";
import { ExchangeDropdownItem, ExchangeAsset, CryptoExchangeProps, CustomRBSheetRef } from '../interfaces/exchangeInterfaces';
import { useThemeColors } from "../../../../hooks/themedHook/useThemeColors";
import { CoinImages, getThemedCommonStyles } from "../../../../components/CommonStyles";
import { useLngTranslation } from "../../../../hooks/languagesHook/useLngTranslation";
import { useCryptoExchange } from "./hooks/useCryptoExchange";
import { isErrorDispaly } from "../../../../utils/helpers";

import ViewComponent from "../../../../components/view/view";
import ErrorComponent from "../../../../components/errorDisplay/errorDisplay";
import Container from "../../../../components/container/container";
import PageHeader from "../../../../components/pageHeader/pageHeader";
import LabelComponent from "../../../../components/textComponets/lableComponent/lable";
import ParagraphComponent from "../../../../components/textComponets/paragraphText/paragraph";
import { CurrencyText } from "../../../../components/textComponets/currencyText/currencyText";
import CommonTouchableOpacity from "../../../../components/touchableComponents/touchableOpacity";
import { s } from "../../../../components/theme/scale";
import SvgFromUrl from "../../../../components/svgIcon";
import Feather from "react-native-vector-icons/Feather";
import ButtonComponent from "../../../../components/buttons/button";
import CustomRBSheet from "../../../../components/models/commonBottomSheet";

import { CRYPTO_CONSTANTS } from "../../wallets/constant";
import SelectionSheetContent from "../../../commonScreens/SelectionSheetContent";
import Loadding from "../../../../components/skelton/skeltons";

import FontAwesome6Icon from "react-native-vector-icons/FontAwesome6";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import DashboardLoader from '../../../../components/loader';
import { AvilableLoader, MinMAxLoader } from "../utils/skeltons";
import AmountInput from "../../../../components/amountInput/amountInput";
import { getTabsConfigation } from '../../../../../configuration';

const BuyExchange = React.memo((props: CryptoExchangeProps) => {
  const NEW_COLOR = useThemeColors();
  const commonStyles = useMemo(() => getThemedCommonStyles(NEW_COLOR), [NEW_COLOR]);
  const [changeAmt, setChangeAmt] = useState<string>("");
  const [disableBtn, setDisableBtn] = useState<boolean>(false);
  const coinSheetRef = useRef<CustomRBSheetRef>(null);
  const currencySheetRef = useRef<CustomRBSheetRef>(null);
  const successSheetRef = useRef<CustomRBSheetRef>(null);
  const [preViewDataLoading, setPreViewDataLoading] = useState<boolean>(false);
  const [cryptoConvertVal, setCryptoConvertVal] = useState<string>("");
  const [inputValue, setInputValue] = useState<string>("");
  const getCurrencyType = getTabsConfigation("CURRENCY_DECIMAL_PLACES") as Record<string, number>;
  const [fiatSelectedVal, setFiatSelectedVal] = useState<string>("");
  const [errormsg, setErrormsg] = useState<string>("");
  const [coinName, setCoinName] = useState<string | undefined>(props?.route?.params?.coinFullName);
  const [selectedValue, setSelectedValue] = useState<string | undefined>(props?.route?.params?.cryptoCoin);
  const [keyboardHeight, setKeyboardHeight] = useState<number>(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const { t } = useLngTranslation();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const loader = MinMAxLoader(1);
  const payLoader = AvilableLoader();
  const currentAmountRef = useRef<string>("");
  const isDropdownChanging = useRef<boolean>(false);
  const configDecimals: number = getCurrencyType?.[selectedValue || 'USDT'] || 8;

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
  } = useCryptoExchange();

  const typedDropDownList: ExchangeDropdownItem[] = dropDownList || [];
  const typedCryptoCoinData: ExchangeAsset[] = cryptoCoinData || [];

  useEffect(() => {
    const initializeData = async () => {
      setRefreshing(true);
      await getCryptoCoins();
      const fiatAssets = await getFiatAssetsData();
      setRefreshing(false);
      if (fiatAssets?.length > 0) {
        setFiatSelectedVal(fiatAssets[0]?.code || "");
      }
      await getMinAxDetails(props?.route?.params?.cryptoCoin);
    };
    initializeData();
  }, []);

  useEffect(() => {
    if (props?.route?.params?.cryptoCoin) {
      setErrormsg("");
      setSelectedValue(props?.route?.params?.cryptoCoin);
    }
    if (props?.route?.params?.toCoin) {
      setErrormsg("");
      setFiatSelectedVal(props?.route?.params?.toCoin);
    }
  }, [props?.route?.params?.cryptoCoin, props?.route?.params?.toCoin, props?.route?.params?.fromAmount]);

  useEffect(() => {
    // Skip if dropdown is changing to prevent duplicate API calls
    if (isDropdownChanging.current) {
      return;
    }

    const timeoutId = setTimeout(() => {
      if (changeAmt && changeAmt !== "" && fiatSelectedVal && selectedValue) {
        const numValue = parseFloat(changeAmt);
        const buyMin = getDropDownObj?.buyMin;

        // Only call API if amount is within min/max range
        if (!isNaN(numValue) && (numValue > 0 || changeAmt.endsWith('.'))) {
          const buyMax = getDropDownObj?.buyMax;
          if ((buyMin === null || buyMin === undefined || numValue >= buyMin) &&
            (buyMax === null || buyMax === undefined || numValue <= buyMax)) {
            getFromAssetValue(changeAmt, selectedValue, fiatSelectedVal, setCryptoConvertVal);
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
  }, [changeAmt, fiatSelectedVal, selectedValue, getDropDownObj?.buyMin, getDropDownObj?.buyMax]);

  useEffect(() => {
    const backAction = () => {
      if (props?.route?.params?.fromScreen === 'ExchangeCryptoList') {
        navigation.goBack();
      } else {
        navigation?.navigate("Dashboard", { initialTab: "GLOBAL_CONSTANTS.EXCHANGE", animation: "slide_from_left" });
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

  const validateAmounts = () => {
    if (changeAmt === "" || changeAmt === null || changeAmt === undefined) {
      return `${t("GLOBAL_CONSTANTS.ENTER_VALID_AMOUNT")} ${selectedValue}.`;
    }

    const amount = parseFloat(changeAmt);
    const buyMin = getDropDownObj?.buyMin;
    const buyMax = getDropDownObj?.buyMax;

    if (amount <= 0) {
      return t("GLOBAL_CONSTANTS.AMOUNT_MUST_BE_GREATER_THAN_ZERO");
    }

    // Check minimum if buyMin is not null
    if (buyMin !== null && buyMin !== undefined && amount < buyMin) {
      return `${t("GLOBAL_CONSTANTS.MINIMUM_LIMIT_NOT_MET")} ${buyMin.toLocaleString(undefined, { maximumFractionDigits: 5 })} ${selectedValue}`;
    }

    // Check maximum if buyMax is not null
    if (buyMax !== null && buyMax !== undefined && amount > buyMax) {
      return `${t("GLOBAL_CONSTANTS.MAXIMUM_LIMIT_EXCEEDED")} ${buyMax.toLocaleString(undefined, { maximumFractionDigits: 5 })} ${selectedValue}.`;
    }

    return null;
  };

  const validateBalance = () => {
    const availableFiatBalance = typedDropDownList.find((item: ExchangeDropdownItem) => item.code === fiatSelectedVal)?.amount || 0;
    if (cryptoConvertVal > availableFiatBalance) {
      return `${t("GLOBAL_CONSTANTS.INSUFFICIENT_BALANCE_TO_BUY")} ${fiatSelectedVal} ${t("GLOBAL_CONSTANTS.TO_BUY")} ${selectedValue}.`;
    }
    if (cryptoConvertVal <= 0) {
      return `${t("GLOBAL_CONSTANTS.CONVERTED_AMOUNT_MUST_BE_GREATER_THAN_ZERO")} ${selectedValue}.`;
    }
    return null;
  };

  const handlePreviewValidation = async () => {
    const amountError = validateAmounts();
    if (amountError) {
      resetLoadingState();
      return setErrormsg(amountError);
    }

    const balanceError = validateBalance();
    if (balanceError) {
      resetLoadingState();
      return setErrormsg(balanceError);
    }

    try {
      const summaryResponse = await getSummaryDetails(changeAmt, selectedValue, fiatSelectedVal);
      resetLoadingState();

      // Navigate to summary page with fresh summaryData
      navigation.navigate('BuyExchangeSummary', {
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
      setErrormsg(isErrorDispaly(error));
    }
  };



  const getPreviewData = async () => {
    Keyboard.dismiss();

    const amountError = validateAmounts();
    if (amountError) {
      setErrormsg(amountError);
      return;
    }

    const balanceError = validateBalance();
    if (balanceError) {
      setErrormsg(balanceError);
      return;
    }

    setPreViewDataLoading(true);
    setErrormsg("");
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
    setErrormsg("");

    // Trigger conversion if there's an existing amount
    if (changeAmt && changeAmt !== "" && selectedValue) {
      getFromAssetValue(changeAmt, selectedValue, val?.code, setCryptoConvertVal);
    }

    // Reset flag after state update
    setTimeout(() => {
      isDropdownChanging.current = false;
    }, 1000);
  };

  const handleGoBack = useCallback(() => {
    if (props?.route?.params?.fromScreen === 'ExchangeCryptoList') {
      navigation.goBack();
    } else {
      navigation?.navigate("Dashboard", { initialTab: "GLOBAL_CONSTANTS.EXCHANGE", animation: "slide_from_left" });
    }
  }, [navigation, props?.route?.params]);

  const handleMaxValue = useCallback(() => {
    const availableBalance = parseFloat(getDropDownObj?.amount || 0);
    const buyMax = getDropDownObj?.buyMax;

    // Determine max value based on scenarios
    let maxValue = availableBalance;

    // If buyMax exists (not null), use the smaller of buyMax or available balance
    if (buyMax !== null && buyMax !== undefined) {
      maxValue = buyMax
    }

    const fixedResult = maxValue.toFixed(configDecimals);
    setChangeAmt(fixedResult);
    getFromAssetValue(fixedResult, selectedValue, fiatSelectedVal, setCryptoConvertVal);
    setErrormsg("");
    clearSummary();
  }, [getDropDownObj, selectedValue, fiatSelectedVal]);
  const handleMinValue = useCallback(() => {
    const buyMin = getDropDownObj?.buyMin;

    // Only set min value if buyMin is not null
    if (buyMin !== null && buyMin !== undefined) {
      const fixedResult = parseFloat(buyMin).toFixed(configDecimals);
      setChangeAmt(fixedResult);
      getFromAssetValue(fixedResult, selectedValue, fiatSelectedVal, setCryptoConvertVal);
      setErrormsg("");
      clearSummary();
    }
  }, [getDropDownObj, selectedValue, fiatSelectedVal]);



  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = async () => {
    setRefreshing(true);
    await getCryptoCoins();
    await getFiatAssetsData();
    setRefreshing(false);
  };

  return (
    <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
      <Container style={commonStyles.container}>
        <PageHeader title={`${t("GLOBAL_CONSTANTS.BUY")} ${coinName || ''}`} onBackPress={handleGoBack} />
        {(errormsg !== "" || hookError !== "") && (
          <ErrorComponent
            message={errormsg || hookError}
            onClose={() => { setErrormsg(""); clearError(); }}
          />
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
              <ViewComponent style={[{ height: s(130) }, commonStyles.bgnote, commonStyles.flexCol, commonStyles.justifyContent]}>
                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent]}>
                  <LabelComponent text={`${t("GLOBAL_CONSTANTS.YOU_BUY")}`} style={[commonStyles.availbleamountbuylabel, commonStyles.mt6]} />
                  <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter]}>
                    <ParagraphComponent style={[commonStyles.availblelabel]} text={`${t("GLOBAL_CONSTANTS.AVAILABLE")} : `} />
                    <CurrencyText
                      value={getDropDownObj?.amount || 0}
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
                      setErrormsg("");
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
                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.mb10,
                    // If only MAX exists (MIN is null), align to right
                    (getDropDownObj?.buyMin === null || getDropDownObj?.buyMin === undefined) &&
                      (getDropDownObj?.buyMax !== null && getDropDownObj?.buyMax !== undefined)
                      ? commonStyles.justifyend
                      : commonStyles.justifyContent
                    ]}>


                      {/* Show MIN only if buyMin is not null */}
                      {getDropDownObj?.buyMin !== null && getDropDownObj?.buyMin !== undefined && (
                        <CommonTouchableOpacity onPress={handleMinValue}>
                          <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter]}>
                            <ParagraphComponent style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textprimary]} text={`${t("GLOBAL_CONSTANTS.MIN")}  `} />
                            <CurrencyText
                              value={getDropDownObj?.buyMin || 0}
                              decimalPlaces={4}
                              currency={selectedValue || ''}
                              style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textprimary]}
                            />
                          </ViewComponent>
                        </CommonTouchableOpacity>
                      )}

                      {/* Show MAX only if buyMax is not null */}
                      {getDropDownObj?.buyMax !== null && getDropDownObj?.buyMax !== undefined && (
                        <CommonTouchableOpacity onPress={handleMaxValue}>
                          <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter]}>
                            <ParagraphComponent style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textprimary]} text={`${t("GLOBAL_CONSTANTS.MAX")}  `} />
                            <CurrencyText
                              value={parseFloat(getDropDownObj?.buyMax)}
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

              <ViewComponent style={[commonStyles.bgnote, commonStyles.justifyContent, { minHeight: s(60) }]}>
                <ViewComponent style={[commonStyles.mb10, commonStyles.mt10, commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent,]}>
                  <LabelComponent text={`${t("GLOBAL_CONSTANTS.YOU_PAY")}`} style={[commonStyles.availbleamountbuylabel,]} />
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








                  <ViewComponent style={[commonStyles.justifyAround,]}>
                    {changeAmountLoader ? (
                      <Loadding contenthtml={payLoader} />
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
                  title={t("GLOBAL_CONSTANTS.BUY")}
                  multiLanguageAllows={false}
                  disable={disableBtn || changeAmountLoader}
                  loading={preViewDataLoading}
                  onPress={getPreviewData}
                />
              )}
              <ViewComponent style={[commonStyles.relative, { position: "absolute", left: "50%", top: s(134), transform: [{ translateX: -s(18) }, { translateY: -s(18) }], minHeight: s(37), minWidth: s(37) }]}>
                <ViewComponent style={[commonStyles.buyiconbg]}>
                  <FontAwesome6Icon name="arrow-up-long" size={s(16)} color={NEW_COLOR.TEXT_WHITE} />
                </ViewComponent>
              </ViewComponent>
            </ViewComponent>



          </KeyboardAwareScrollView>

          {!isKeyboardVisible && (
            <ViewComponent style={[commonStyles.sectionGap]}>
              <ButtonComponent
                title={t("GLOBAL_CONSTANTS.BUY")}
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
            iconSize={24}
          />
        </CustomRBSheet>


      </Container>
    </ViewComponent>
  );
});

export default BuyExchange;