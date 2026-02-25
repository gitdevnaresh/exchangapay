import React from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleProp,
  TextStyle,
  Platform,
} from 'react-native';
import { NEW_COLOR } from '../../constants/styels/variables';
import { useLngTranslation } from '../../hooks/languagesHook/useLngTranslation';
import { useThemeColors } from '../../hooks/themedHook/useThemeColors';
import { getThemedCommonStyles } from '../CommonStyles';
import ViewComponent from '../view/view';
import { s } from '../../constants/styels/scale';
import { CurrencyText } from '../textComponets/currencyText/currencyText';
import ParagraphComponent from '../textComponets/paragraphText/paragraph';
import LabelComponent from '../textComponets/lableComponent/lable';
import { getTabsConfigation } from '../../../configuration';

interface AmountInputProps {
  label?: string;
  isRequired?: boolean;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: any) => void;
  maxLength?: number;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  placeholderTextColor?: string;
  coinCode?: string;
  walletCode?: string;
  logoUri?: string;
  minLimit?: number;
  maxLimit?: number;
  onMinPress?: () => void;
  onMaxPress?: () => void;
  showError?: string;
  labelStyle?: StyleProp<TextStyle>;
  editable?: boolean;
  numberOfLines?: number;
  maxDecimals?: number;
  topupBalanceInfo?: any;
  autoCapitalize?: any;
  touched?: any;
  decimals?: number;
  decimalPlaces?: number;
  exchangeDesign?: boolean;
  loading?: boolean;
  showDisabledColor?: boolean;
}

const FONT_SIZE_NORMAL = s(55);
const FONT_SIZE_SMALL = Platform.OS === 'ios' ? s(38) : s(33);
const FONT_CHANGE_THRESHOLD = 9;
// --- NEW: Define a fixed height for the input container ---
// This should be large enough to accommodate the largest font size (FONT_SIZE_NORMAL)
const commonConfiguration = getTabsConfigation("COMMON_CONFIGURATION");

const INPUT_CONTAINER_HEIGHT = Platform.OS === 'ios' ? commonConfiguration?.AMOUNT_INPUT_IOS_HEIGHT_FIX : commonConfiguration?.AMOUNT_INPUT_ANDROID_HEIGHT_FIX || s(70);

const AmountInput: React.FC<AmountInputProps> = ({
  label,
  isRequired = false,
  placeholder,
  value = '',
  onChangeText,
  maxLength = 10,
  keyboardType = "numeric",
  placeholderTextColor = NEW_COLOR.PLACEHOLDER_COLOR,
  coinCode = '',
  walletCode = '',
  logoUri,
  minLimit,
  maxLimit,
  onMinPress,
  onMaxPress,
  labelStyle,
  showError,
  numberOfLines = 1,
  editable = true,
  maxDecimals,
  topupBalanceInfo,
  autoCapitalize = "words",
  touched,
  decimals = 2,
  decimalPlaces,
  exchangeDesign = false,
  loading = false,
   showDisabledColor=true,
}) => {
  const { t } = useLngTranslation();
  const getCurrencyType = getTabsConfigation("CURRENCY_DECIMAL_PLACES");

  const currencyCode = coinCode || topupBalanceInfo?.currency;
  const configDecimals = getCurrencyType?.[currencyCode];
  const effectiveMaxDecimals = decimalPlaces !== undefined ? decimalPlaces : (configDecimals !== undefined ? configDecimals : maxDecimals || 2);

  const formatNumberWithCommas = (num: string) => {
    if (!num) return '';
    const [intPart, decimalPart] = num.split('.');

    // FIX: Default an empty integer part to '0' before parsing.
    // This prevents parseInt('') from returning NaN.
    const formattedInt = parseInt(intPart || '0', 10).toLocaleString('en-US');

    return decimalPart !== undefined ? `${formattedInt}.${decimalPart.slice(0, effectiveMaxDecimals)}` : formattedInt;
  };
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const cleanInput = (text: string) => text.replace(/,/g, '');

  const handleDecimalAndComma = (text: string) => {
    const rawValue = cleanInput(text);

    // If effectiveMaxDecimals is 0, don't allow decimal point at all
    if (effectiveMaxDecimals === 0) {
      if (!/^\d*$/.test(rawValue)) return;
    } else {
      if (!/^\d*\.?\d*$/.test(rawValue)) return;
    }

    if (effectiveMaxDecimals !== undefined && effectiveMaxDecimals > 0 && rawValue.includes('.')) {
      const [_, decimalPart] = rawValue.split('.');
      if (decimalPart.length > effectiveMaxDecimals) return;
    }

    onChangeText?.(rawValue);
  };

  const dynamicFontSize = value.length > FONT_CHANGE_THRESHOLD
    ? FONT_SIZE_SMALL
    : FONT_SIZE_NORMAL;

  // Exchange design - return just the TextInput for inline use
  if (exchangeDesign) {
    return (
      <TextInput
        style={[
          { 
            backgroundColor: "transparent", 
            flex: 1, 
            textAlign: "right", 
            paddingLeft: s(16) 
          }, 
          commonStyles.fw400, 
          commonStyles.fs30, 
          commonStyles.textWhite,
           (!editable && showDisabledColor) && commonStyles.disabledTextStyle
        ]}
        placeholder={t(placeholder || "0.00")}
        onChangeText={handleDecimalAndComma}
        value={formatNumberWithCommas(value)}
        placeholderTextColor={placeholderTextColor}
        keyboardType={keyboardType}
        editable={editable && !loading}
        maxLength={maxLength}
        autoCapitalize={autoCapitalize}
        numberOfLines={numberOfLines}
      />
    );
  }

  // Regular design (existing functionality)

  return (
    <ViewComponent>
      <ViewComponent style={{ height: INPUT_CONTAINER_HEIGHT, justifyContent: 'center' }}>
        {!!label && (
          <LabelComponent text={t(label)} style={[commonStyles.inputLabel, labelStyle]}>
            {isRequired && <LabelComponent text=" *" style={commonStyles.textError} />}
          </LabelComponent>
        )}
        <TextInput
          style={[
            commonStyles.amountInput,
            {
              fontSize: dynamicFontSize,
              // --- NEW: Remove fixed height from the TextInput itself ---
              // Let it be flexible within the container.
              height: '100%',
              // --- NEW: Center text vertically to make the font change smoother ---
              textAlignVertical: 'center',
              lineHeight: INPUT_CONTAINER_HEIGHT
            },
            !editable && commonStyles.disabledTextStyle, // Apply disabled text color
          ]}
          placeholder={t(placeholder || '')}
          maxLength={maxLength}
          keyboardType={keyboardType}
          onChangeText={handleDecimalAndComma}
          value={formatNumberWithCommas(value)}
          placeholderTextColor={placeholderTextColor}
          editable={editable}
          autoCapitalize={autoCapitalize}
          numberOfLines={numberOfLines}
        />
      </ViewComponent>
      {touched && showError && (
        <ParagraphComponent
          text={showError}
          style={[commonStyles.inputrequirederrormessage, commonStyles.mt4]}
        />
      )}

      {(minLimit !== undefined || maxLimit !== undefined) && (
        <ViewComponent style={[commonStyles.amountlabel]}>
          <ViewComponent >
            {minLimit !== undefined && (
              <TouchableOpacity onPress={onMinPress} style={[commonStyles.minmaxbg]}>
                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap4,]}>
                  <ParagraphComponent
                    style={[commonStyles.minmaxLabel]}
                    text={`${t('GLOBAL_CONSTANTS.MIN')}`}
                  />
                  <CurrencyText

                    value={minLimit}
                    currency={topupBalanceInfo?.currency ?? ""}
                    decimalPlaces={decimals}
                    style={[commonStyles.minmaxLabel]}
                    coinName={coinCode ?? topupBalanceInfo?.currency}
                  />
                </ViewComponent>
              </TouchableOpacity>
            )}
          </ViewComponent>


          {maxLimit !== undefined && (<ViewComponent style={[commonStyles.minmaxbg]}>
            <TouchableOpacity onPress={onMaxPress}>
              <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap4,]}>
                <ParagraphComponent
                  style={[commonStyles.minmaxLabel]}
                  text={`${t('GLOBAL_CONSTANTS.MAX')}`}
                />
                <CurrencyText
                  value={maxLimit}
                  currency={topupBalanceInfo?.currency ?? ""}
                  decimalPlaces={decimals}
                  style={[commonStyles.minmaxLabel]}
                  coinName={coinCode ?? topupBalanceInfo?.currency}
                />
              </ViewComponent>
            </TouchableOpacity>
          </ViewComponent>)}
        </ViewComponent>
      )}

    </ViewComponent>
  );
};

export default AmountInput;