import React, { useEffect, useMemo } from 'react';
import { FormikProps } from 'formik';
import Feather from 'react-native-vector-icons/Feather';
import ViewComponent from '../../../../../../components/view/view';
import AmountInput from '../../../../../../components/amountInput/amountInput';
import ButtonComponent from '../../../../../../components/buttons/button';
import { CurrencyText } from '../../../../../../components/textComponets/currencyText/currencyText';
import ParagraphComponent from '../../../../../../components/textComponets/paragraphText/paragraph';
import TextMultiLangauge from '../../../../../../components/textComponets/multiLanguageText/textMultiLangauge';
import CommonTouchableOpacity from '../../../../../../components/touchableComponents/touchableOpacity';
import LabelComponent from '../../../../../../components/textComponets/lableComponent/lable';
import { FormValues, NetworkData, OrderSummaryData, Payee, SelectedAsset, Coin, CoinData } from '../interface';
import CommonDropdown from '../../../../../../components/dropDown';
import ImageUri from '../../../../../../components/imageComponents/image';
import { CoinImages, getThemedCommonStyles } from '../../../../../../components/CommonStyles';
import { useThemeColors } from '../../../../../../hooks/themedHook/useThemeColors';

interface WithdrawFormFieldsProps {
  formikProps: FormikProps<FormValues>;
  selectedNetwork: NetworkData | null;
  handleSendAmountChange: (value: string, setFieldValue: FormikProps<FormValues>['setFieldValue']) => void;
  handleMinValue: (setFieldValue: FormikProps<FormValues>['setFieldValue']) => void;
  handleMaxValue: (setFieldValue: FormikProps<FormValues>['setFieldValue']) => void;
  handleBenificiaryList: () => void;
  selectedBenificiary: Payee | null;
  formikTouched: boolean;
  validateBeneficiary: () => string | undefined;
  orderSummaryDisaplay: boolean;
  btnLoading: boolean;
  orderSummayData: OrderSummaryData | null;
  formInitialValues: FormValues | any;
  t: any;
  s: (val: number) => number;
  dataLoading: boolean;
  handleSubmit: (values?: any) => void;
  setFormikTouched: (touched: boolean) => void;
  onSelectCoin: (coin: SelectedAsset) => void;
  availableCoins: SelectedAsset[];
  availableNetworks: NetworkData[];
  selectedCoin: SelectedAsset | null;
  onNetworkSelect: (network: NetworkData) => void;
}

const WithdrawFormFields: React.FC<WithdrawFormFieldsProps> = ({
  selectedCoin,
  formikProps,
  availableCoins,
  handleSendAmountChange,
  handleMinValue,
  handleMaxValue,
  handleBenificiaryList,
  selectedBenificiary,
  formikTouched,
  validateBeneficiary,
  btnLoading,
  formInitialValues,
  t,
  s,
  dataLoading,
  handleSubmit,
  setFormikTouched,
  onSelectCoin,
  onNetworkSelect,
  availableNetworks,
  selectedNetwork

}) => {
  const { touched, errors, values, setFieldValue } = formikProps;
  const NEW_COLOR = useThemeColors();
  const commonStyles = useMemo(() => getThemedCommonStyles(NEW_COLOR), [NEW_COLOR]);


  useEffect(() => {
    if (formInitialValues.currency && values.currency !== formInitialValues.currency) {
      setFieldValue('currency', formInitialValues.currency, false);
    }
    if (formInitialValues.network && values.network !== formInitialValues.network) {
      setFieldValue('network', formInitialValues.network, false);
    }
  }, [formInitialValues, values.currency, values.network, values.amount, setFieldValue]);
  return (
    <ViewComponent style={[commonStyles.flex1]}>
      <ViewComponent style={[commonStyles.flex1]}>
        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.mb8]}>
          <LabelComponent style={[commonStyles.textWhite]} text="GLOBAL_CONSTANTS.SELECT_COIN" multiLanguageAllows={true}>
            <LabelComponent text=" *" style={[commonStyles.textRed]} />
          </LabelComponent>
          {selectedCoin && (
            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter]}>
              <ParagraphComponent
                style={[commonStyles.availblelabel]}
                text={`${t('GLOBAL_CONSTANTS.AVAILABLE_BALANCES')}`}
              />
              <CurrencyText
                value={selectedCoin?.amount || 0}
                decimalPlaces={4}
                currency={selectedCoin?.code || selectedCoin?.coinCode}
                style={[commonStyles.availbleamount]}
              />
            </ViewComponent>
          )}
        </ViewComponent>

        <CommonDropdown
          data={availableCoins}
          selectedItem={selectedCoin}
          onSelect={onSelectCoin}
          placeholder={t('GLOBAL_CONSTANTS.SELECT_CURRENCY')}
          renderItem={(item, isSelected) => {
            return (
              <ViewComponent
                style={[
                  commonStyles.dflex,
                  commonStyles.alignCenter,
                  commonStyles.justifyContent,
                  commonStyles.p10,
                  commonStyles.gap16,
                  isSelected && commonStyles.inputdropdowntabactivebg,]}
              >
                <ViewComponent style={{ width: s(28), height: s(28) }}>
                  <ImageUri uri={CoinImages[item?.code?.toLowerCase()] || item?.coinImage} />
                </ViewComponent>
                <ViewComponent style={{ flex: 1 }}>
                  <ParagraphComponent style={[commonStyles.inputdropdowntext, commonStyles.mt6]}>
                    {item.code}
                  </ParagraphComponent>

                </ViewComponent>
                <ViewComponent>
                  <CurrencyText coinName={item?.code} value={item?.amount || 0} decimalPlaces={4} style={[commonStyles.availbleamount]} />
                </ViewComponent>
              </ViewComponent>
            )
          }}
          dropdownHeight={s(300)}
        />
        <ViewComponent style={[commonStyles.formItemSpace]} />
        <LabelComponent style={[commonStyles.textWhite, commonStyles.mb8]} text="GLOBAL_CONSTANTS.SELECT_NETWORK" multiLanguageAllows={true}>
          <LabelComponent text=" *" style={[commonStyles.textRed]} />
        </LabelComponent>
        <CommonDropdown
          data={availableNetworks}
          selectedItem={selectedNetwork}
          onSelect={onNetworkSelect}
          placeholder={t('GLOBAL_CONSTANTS.SELECT_NETWORK')}
          error={formikTouched && errors.network ? t(errors.network) : undefined}
          renderItem={(item, isSelected) => {
            return (
              <ViewComponent
                style={[
                  commonStyles.dflex,
                  commonStyles.alignCenter,
                  commonStyles.justifyContent,
                  commonStyles.p10,
                  commonStyles.gap16,
                  isSelected && commonStyles.inputdropdowntabactivebg,]}
              >
                <ViewComponent style={{ flex: 1 }}>
                  <ParagraphComponent style={[commonStyles.inputdropdowntext, commonStyles.mt6]}>
                    {item.code}
                  </ParagraphComponent>

                </ViewComponent>

              </ViewComponent>
            )
          }}
          dropdownHeight={s(300)}
        />

        <ViewComponent style={[commonStyles.formItemSpace]} />

        <LabelComponent style={commonStyles.amountInputLabel} text="GLOBAL_CONSTANTS.AMOUNT" multiLanguageAllows>
          <LabelComponent text=" *" style={[commonStyles.textRed]} />
        </LabelComponent>

        <AmountInput
          placeholder="GLOBAL_CONSTANTS.ENTER_AMOUNT"
          maxLength={21}
          onChangeText={(value) => handleSendAmountChange(value, setFieldValue)}
          value={values.amount?.toString() || ''}
          minLimit={selectedNetwork?.minLimit == null ? undefined : selectedNetwork?.minLimit}
          maxLimit={selectedNetwork?.maxLimit == null ? undefined : (parseFloat(selectedCoin?.amount) < parseFloat(selectedNetwork?.minLimit) ? parseFloat(selectedNetwork?.maxLimit) : (parseFloat(selectedCoin?.amount) > parseFloat(selectedNetwork?.maxLimit) ? parseFloat(selectedNetwork?.maxLimit) : parseFloat(selectedCoin?.amount)))}
          coinCode={selectedCoin?.code || selectedCoin?.coinCode}
          onMinPress={() => {
            if (selectedNetwork?.minLimit) {
              const formattedValue = selectedNetwork.minLimit.toFixed(4);
              setFieldValue('amount', formattedValue);
            }
          }}
          topupBalanceInfo={selectedCoin?.code || selectedCoin?.coinCode}
          onMaxPress={() => {
            if (selectedNetwork?.maxLimit) {
              const formattedValue = selectedCoin?.amount < selectedNetwork.maxLimit ? selectedCoin?.amount?.toFixed(4) : selectedNetwork?.maxLimit?.toFixed(4);
              setFieldValue('amount', formattedValue);
            }
          }}
          showError={touched.amount && errors.amount ? t(errors.amount) : undefined}
          maxDecimals={4}
          editable={!!(selectedNetwork && selectedCoin)}
          isRequired={true}
          touched={touched.amount}
          decimals={4}
        />

        <ViewComponent style={[commonStyles.formItemSpace]} />

        <LabelComponent style={[commonStyles.mb10]} text="GLOBAL_CONSTANTS.PAYEE" multiLanguageAllows>
          <LabelComponent text=" *" style={[commonStyles.textRed]} />
        </LabelComponent>
        <CommonTouchableOpacity onPress={handleBenificiaryList} disabled={!(selectedCoin && selectedNetwork) || dataLoading}>

          <ViewComponent
            style={[
              commonStyles.withdrawPayeeInput,
              commonStyles.dflex,
              commonStyles.alignCenter,
              commonStyles.justifyContent,
              commonStyles.relative,
              formikTouched && !selectedBenificiary && commonStyles.errorBorder,
              !(selectedCoin && selectedNetwork),
            ]}
          >
            {selectedBenificiary ? (
              <ViewComponent style={[commonStyles.dflex, commonStyles.flex1, commonStyles.gap14, commonStyles.alignCenter]}>
                <ViewComponent style={[commonStyles.inputroundediconbg]}>
                  <ParagraphComponent
                    style={[commonStyles.twolettertext]}
                    text={selectedBenificiary.favoriteName?.slice(0, 1)?.toUpperCase() || ''}
                  />
                </ViewComponent>
                <ViewComponent style={{ flex: 1 }}>
                  <ParagraphComponent
                    style={[commonStyles.withdrawpayeetexttitle]}
                    text={selectedBenificiary.favoriteName || ''}
                    numberOfLines={1}
                  />
                  <ParagraphComponent
                    style={[commonStyles.withdrawpayeetexttitlepara]}
                    text={`${selectedBenificiary?.walletAddress?.substring(0, 10)} ****** ${selectedBenificiary?.walletAddress?.slice(-10) || ''}`}
                    ellipsizeMode="middle"
                  />
                </ViewComponent>
              </ViewComponent>
            ) : (
              <ParagraphComponent
                style={[commonStyles.walletaddressplaceholder, commonStyles.flex1]}
                text={t('GLOBAL_CONSTANTS.SELECT_PAYEE')}
                multiLanguageAllows
              />
            )}
            <Feather
              name="chevron-down"
              size={s(24)}
              color={!(selectedCoin && selectedNetwork) ? NEW_COLOR.TEXT_WHITE : NEW_COLOR.TEXT_WHITE}
            />
          </ViewComponent>
        </CommonTouchableOpacity>

        {validateBeneficiary() && (
          <TextMultiLangauge
            text={validateBeneficiary()!}
            style={[commonStyles.inputrequirederrormessage]}
          />
        )}
      </ViewComponent>
      <ViewComponent style={[commonStyles.sectionGap, commonStyles.mt10]}>
        <ButtonComponent
          title="GLOBAL_CONSTANTS.CONTINUE"
          onPress={() => {
            setFormikTouched(true);
            handleSubmit();
          }}
          loading={btnLoading}
        />
      </ViewComponent>
    </ViewComponent>

  );
};

export default WithdrawFormFields;
