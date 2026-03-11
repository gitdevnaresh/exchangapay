import React from 'react';
import ParagraphComponent from "../paragraphText/paragraph";
import GradientText from "../../gradianttext/gradianttext";
import { StyleProp, StyleSheet, TextStyle } from 'react-native';

interface FormattedNumberProps {
  value: number;
  style?: StyleProp<TextStyle>; // More specific type for style
  decimalPlaces?: number;
  symboles?: boolean;
  currency?: string;
  prifix?: string; // More specific type for prifix
  isDecimal?: boolean;
  isGradient?: boolean;
  actionType?: 'deposit' | 'receive' | 'topup' | 'withdraw' | 'send' | 'spend' | 'refund';
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
  actionType = ''
}) => {
  const safeValue = typeof value === 'number' ? value : Number(value);
  const flatStyle = StyleSheet.flatten(style);

  let currentValue = isNaN(safeValue) ? 0 : safeValue;

  const displayDecimalPlaces = isDecimal ? initialDecimalPlaces : 0;
  const formatWithCommas = (num: number, decimalPlaces: number) => {
    return num.toLocaleString(undefined, {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces
    });
  };
  let unit = '';
  let divisor = 1;
  if (currentValue > 1_000_000) {
    if (currentValue >= 1_000_000_000_000) {
      unit = ' T';
      divisor = 1_000_000_000_000;
    } else if (currentValue >= 1_000_000_000) {
      unit = ' B';
      divisor = 1_000_000_000;
    } else {
      unit = ' M';
      divisor = 1_000_000;
    }
  }
  const formattedValue = formatWithCommas(currentValue / divisor, displayDecimalPlaces); // Comma-separated for formatted value
  const Value = formatWithCommas(currentValue, displayDecimalPlaces); // Comma-separated for normal value


  const SignSymbol = {
    "deposit": "+",
    "receive": "+",
    "topup": "+",
    "withdraw": "-",
    "send": "-",
    "spend": "-",
    "applycard": "-",
    "signupbonus": "+",
    'deletecard': "-",
    'replacecard': "-",
    'freezecard': "-",
    'cryptoback': "+",
    'cashbackcrypto': "+",
    'consume': "-",
    'consumption': "-",
    'refund': "+",
    "referralcomission": "+",
    "Commission": "-",
    "topupcard": "+",
    "cardrecharge":"+",
    "cardrechargepayment":"+",
    "cardfirstrecharge":"+"
  }

  const signPrefix = currentValue > 0 ? (SignSymbol[actionType?.toLowerCase()?.replaceAll(" ", "")] ?? '') : '';
  const displayPrefix = signPrefix || (prifix ?? '');
  const textContent = `${displayPrefix} ${symboles ? formattedValue : Value}${symboles ? unit : ''} ${currency ?? ''}`;

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
