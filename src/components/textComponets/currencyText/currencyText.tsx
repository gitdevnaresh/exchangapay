import React from 'react';
import ParagraphComponent from "../paragraphText/paragraph";
import GradientText from "../../gradianttext/gradianttext";
import { StyleProp, StyleSheet, TextStyle } from 'react-native';
import { useThemeColors } from '../../../hooks/themedHook/useThemeColors';
import { getTabsConfigation } from '../../../../cofiguration';
import { getThemedCommonStyles } from '../../CommonStyles';

interface FormattedNumberProps {
  value: number;
  style?: StyleProp<TextStyle>; // More specific type for style
  decimalPlaces?: number;
  symboles?: boolean;
  currency?: string;
  prifix?: string; // More specific type for prifix
  isDecimal?: boolean;
  isGradient?: boolean;
  smallDecimal?: boolean; // Flag to reduce decimal size
  decimalStyle?: StyleProp<TextStyle>; // Style for the decimal part
  coinName?: string;
}

export const CurrencyText: React.FC<FormattedNumberProps> = ({
  value,
  style,
  decimalPlaces: initialDecimalPlaces = 2,
  symboles,
  currency,
  prifix,
  isDecimal = true,
  isGradient = false,
  smallDecimal = false,
  decimalStyle,
  coinName,
}) => {
  const safeValue = typeof value === 'number' ? value : Number(value);
  const flatStyle = StyleSheet.flatten(style);
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const getCurrencyType = getTabsConfigation("CURRENCY_DECIMAL_PLACES");
  let currentValue = isNaN(safeValue) ? 0 : safeValue;
  let calculatedDecimalPlaces = 2;

  const currencyDecimal = getCurrencyType[currency] ?? getCurrencyType[coinName];
  if (currencyDecimal !== undefined) {
    calculatedDecimalPlaces = currencyDecimal;
  }

  const formatWithCommas = (num: number, decimalPlaces: number) => {
    // Truncate the number to the desired decimal places to avoid rounding up.
    const factor = Math?.pow(10, decimalPlaces);
    const truncatedNum = Math?.trunc(num * factor) / factor;
    return truncatedNum?.toLocaleString(undefined, {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces
    });
  };
  // Use absolute value for unit calculation to handle negative numbers
  const absValue = Math.abs(currentValue);
  let unit = '';
  let divisor = 1;
  if (absValue >= 1_000_000_000_000) {
    unit = 'T';
    divisor = 1_000_000_000_000;
  } else if (absValue >= 1_000_000_000) {
    unit = 'B';
    divisor = 1_000_000_000;
  } else if (absValue >= 1_000_000) {
    unit = 'M';
    divisor = 1_000_000;
  } else if (absValue >= 100_000) {
    unit = 'K';
    divisor = 1_000;
  }
  const formattedValue = formatWithCommas(currentValue / divisor, calculatedDecimalPlaces);
  const Value = formatWithCommas(currentValue, calculatedDecimalPlaces);

  const displayValue = symboles ? formattedValue : Value;

  if (smallDecimal && calculatedDecimalPlaces > 0 && displayValue.includes('.')) {
    const [integerPart, decimalPart] = displayValue.split('.');
    const prefix = prifix || '';
    const suffix = `${symboles ? unit : ''}${currency ? ' ' + currency : ''}`;

    return isGradient ? (
      <GradientText
        text={`${prefix}${integerPart}.${decimalPart}${suffix}`}
        style={flatStyle}
        fontSize={flatStyle?.fontSize}
        fontWeight={flatStyle?.fontWeight ? String(flatStyle.fontWeight) : undefined}
      />
    ) : (
      <ParagraphComponent style={style}>
        {prefix}{integerPart}.
        <ParagraphComponent
          style={
            decimalStyle
              ? [decimalStyle, commonStyles.listDecimalFontSize]
              : [commonStyles.balancelistDecimalFontSize]
          }
        >
          {decimalPart}
        </ParagraphComponent>
        {suffix}
      </ParagraphComponent>
    );
  }

  if (!smallDecimal && calculatedDecimalPlaces > 0 && displayValue.includes('.')) {
    const [integerPart, decimalPart] = displayValue.split('.');
    const prefix = prifix || '';
    const suffix = `${symboles ? unit : ''}${currency ? ' ' + currency : ''}`;
    return (
      <ParagraphComponent style={style}>{prefix}{integerPart}.<ParagraphComponent style={style}>{decimalPart}</ParagraphComponent>{suffix}</ParagraphComponent>
    );
  }
  const textContent = `${prifix ? prifix + ' ' : ''}${displayValue}${symboles ? unit : ''}${currency ? ' ' + currency : ''}`;

  return isGradient ? (
    <GradientText
      text={textContent}
      style={flatStyle}
      fontSize={flatStyle?.fontSize}
      fontWeight={flatStyle?.fontWeight ? String(flatStyle.fontWeight) : undefined}
    />
  ) : (
    <ParagraphComponent style={style}>
      {textContent}
    </ParagraphComponent>
  );
};
