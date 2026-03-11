import React, { useCallback, useEffect, useState, useRef, useMemo } from 'react';
import { BackHandler } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NavigationProp, ParamListBase } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { ExchangeDropdownItem, ExchangeAsset, BuySavePayload } from '../interfaces/exchangeInterfaces';
import { useThemeColors } from '../../../../hooks/themedHook/useThemeColors';
import { getThemedCommonStyles } from '../../../../components/CommonStyles';
import { useLngTranslation } from '../../../../hooks/languagesHook/useLngTranslation';
import { isErrorDispaly } from '../../../../utils/helpers';
import ExchangeBuyService from '../../../../apiServices/exchange/buy/exchangeBuyService';
import ViewComponent from '../../../../components/view/view';
import ErrorComponent from '../../../../components/errorDisplay/errorDisplay';
import Container from '../../../../components/container/container';
import PageHeader from '../../../../components/pageHeader/pageHeader';
import ParagraphComponent from '../../../../components/textComponets/paragraphText/paragraph';
import { CurrencyText } from '../../../../components/textComponets/currencyText/currencyText';
import ButtonComponent from '../../../../components/buttons/button';
import CustomRBSheet from '../../../../components/models/commonBottomSheet';
import CommonSuccess from '../../../commonScreens/successPage/commonSucces';
import ScrollViewComponent from '../../../../components/scrollView/scrollView';
import { s } from '../../../../components/theme/scale';
import TextMultiLanguage from '../../../../components/textComponets/multiLanguageText/textMultiLangauge';

interface BuyExchangeSummaryProps {
  route: {
    params: {
      changeAmt: string;
      selectedValue: string;
      fiatSelectedVal: string;
      cryptoConvertVal: string;
      summaryData: any;
      typedDropDownList: ExchangeDropdownItem[];
      typedCryptoCoinData: ExchangeAsset[];
      getDropDownObj: any;
      coinName?: string;
    };
  };
}

const BuyExchangeSummary = React.memo((props: BuyExchangeSummaryProps) => {
  const NEW_COLOR = useThemeColors();
  const commonStyles = useMemo(() => getThemedCommonStyles(NEW_COLOR), [NEW_COLOR]);
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const { t } = useLngTranslation();
  
  const [loading, setLoading] = useState(false);
  const [errormsg, setErrormsg] = useState('');
  const successSheetRef = useRef<any>(null);

  const {
    changeAmt,
    selectedValue,
    fiatSelectedVal,
    cryptoConvertVal,
    summaryData,
    typedDropDownList,
    typedCryptoCoinData,
    getDropDownObj,
    coinName
  } = props.route.params;

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        handleBack();
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription?.remove();
    }, [handleBack])
  );

  const handleConfirmTransaction = useCallback(async () => {
    setLoading(true);
    try {
      const fiatAsset = typedDropDownList.find((item: ExchangeDropdownItem) => item.code === fiatSelectedVal);
      const cryptoAsset = typedCryptoCoinData.find((item: ExchangeAsset) => item.code === selectedValue);
      
      const payload: BuySavePayload = {
        fromAssetId: fiatAsset?.id,
        fromAsset: fiatSelectedVal,
        fromValue: parseFloat(cryptoConvertVal),
        toAssetId: getDropDownObj?.id || cryptoAsset?.id,
        toAsset: selectedValue || '',
        toValue: parseFloat(changeAmt)
      };

      const response = await ExchangeBuyService.buysavesucess(payload);
      
      if (response?.ok) {
        setLoading(false);
        successSheetRef?.current?.open();
      } else {
        setErrormsg(isErrorDispaly(response));
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      setErrormsg(isErrorDispaly(error));
    }
  }, [changeAmt, selectedValue, fiatSelectedVal, cryptoConvertVal, typedDropDownList, typedCryptoCoinData, getDropDownObj]);

  const handleSuccessClose = useCallback(() => {
    successSheetRef?.current?.close();
    navigation.navigate('ExchangeCryptoList', { animation: 'slide_from_left' });
  }, [navigation]);

  const handleBackToExchangeDashboard = useCallback(() => {
    successSheetRef?.current?.close();
    navigation.navigate('Dashboard', { initialTab: 'GLOBAL_CONSTANTS.EXCHANGE', animation: 'slide_from_left' });
  }, [navigation]);

  const handleErrorClose = useCallback(() => {
    setErrormsg('');
  }, []);

  return (
    <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
      <Container style={commonStyles.container}>
        <PageHeader title={t('GLOBAL_CONSTANTS.BUY_SUMMARY')} onBackPress={handleBack} />
        
        {errormsg !== '' && (
          <ErrorComponent message={errormsg} onClose={handleErrorClose} />
        )}

        <ScrollViewComponent contentContainerStyle={{ flexGrow: 1 }}>
          <ViewComponent style={[commonStyles.flex1]}>

            
            <ViewComponent style={[commonStyles.sectionGap]}>
              <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.flexWrap, commonStyles.gap8]}>
                <ParagraphComponent style={[commonStyles.listsecondarytext]} text={t('GLOBAL_CONSTANTS.AMOUNT')} />
                <CurrencyText
                  value={summaryData?.assetValue || 0}
                  decimalPlaces={4}
                  currency={selectedValue}
                  style={[commonStyles.listprimarytext]}
                />
              </ViewComponent>
              
              <ViewComponent style={[commonStyles.listitemGap]} />

              <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.flexWrap, commonStyles.gap8]}>
                <ParagraphComponent style={[commonStyles.listsecondarytext]} text={t('GLOBAL_CONSTANTS.FEE')} />
                <CurrencyText
                  value={summaryData?.fee || 0}
                  decimalPlaces={2}
                  currency={fiatSelectedVal}
                  style={[commonStyles.listprimarytext]}
                />
              </ViewComponent>

              <ViewComponent style={[commonStyles.listitemGap]} />

              <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.flexWrap, commonStyles.gap8]}>
                <ParagraphComponent style={[commonStyles.listsecondarytext]} text={t('GLOBAL_CONSTANTS.YOU_PAY')} />
                <CurrencyText
                  value={summaryData?.totalAmount || 0}
                  decimalPlaces={2}
                  currency={fiatSelectedVal}
                  style={[commonStyles.listprimarytext]}
                />
              </ViewComponent>
            </ViewComponent>
            
            <ViewComponent style={[commonStyles.bgnote]}>
              <ViewComponent style={[commonStyles.dflex, commonStyles.alignStart, commonStyles.gap8]}>
                <ViewComponent>
                  <MaterialIcons name="info-outline" size={s(18)} color={NEW_COLOR.NOTE_ICON} />
                </ViewComponent>
                <ViewComponent style={[commonStyles.flex1]}>
                  <TextMultiLanguage 
                    style={[commonStyles.bgNoteText]} 
                  text={"GLOBAL_CONSTANTS.BUY_SELL_SUMMARY_NOTE"}                  />
                </ViewComponent>
              </ViewComponent>
            </ViewComponent>
          </ViewComponent>

          <ViewComponent>
            <ButtonComponent
              title={t('GLOBAL_CONSTANTS.BUY')}
              suffix={selectedValue?.toUpperCase()}
              multiLanguageAllows={false}
              loading={loading}
              onPress={handleConfirmTransaction}
            />
          </ViewComponent>
          <ViewComponent style={[commonStyles.sectionGap]} />
        </ScrollViewComponent>
      </Container>

      {/* Success Sheet */}
      <CustomRBSheet
        refRBSheet={successSheetRef}
        height="Large"
        draggable={false}
        closeOnPressMask={false}
      >
        <ViewComponent>
          <CommonSuccess
            navigation={navigation}
            successMessage={t('GLOBAL_CONSTANTS.SUCCESS!')}
            subtitle={`${t('GLOBAL_CONSTANTS.YOUR_BUY_ORDER_FOR')} ${parseFloat(changeAmt || '0').toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 })} ${selectedValue} ${t('GLOBAL_CONSTANTS.HAS_BEEN_ADDED_FOR_SELL_AND_BUY')}`}
            buttonText={t('GLOBAL_CONSTANTS.BUY_AGAIN')}
            buttonAction={handleSuccessClose}
            secondaryButtonText={t('GLOBAL_CONSTANTS.BACK_TO_EXCHANGE_DASHBOARD')}
            secondaryButtonAction={handleBackToExchangeDashboard}
            amount={changeAmt}
            prifix={selectedValue}
            amountIsDisplay={false}
          />
        </ViewComponent>
      </CustomRBSheet>
    </ViewComponent>
  );
});

export default BuyExchangeSummary;