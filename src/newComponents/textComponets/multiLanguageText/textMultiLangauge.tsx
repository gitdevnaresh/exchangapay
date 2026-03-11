import React from 'react';
import { Text, StyleProp, TextStyle, GestureResponderEvent } from 'react-native';
import { useLngTranslation } from "../../../hooks/useLngTranslation";
import { useThemeColors } from '../../../hooks/useThemeColors';
import { getThemedCommonStyles } from '../../../assets/styles/CommonStyles';

interface TextMultiLanguageProps {
  text?: string | null;
  style?: StyleProp<TextStyle>;
  children?: React.ReactNode;
  numberOfLines?: number;
  onPress?: (event: GestureResponderEvent) => void;
  ellipsizeMode?: 'head' | 'middle' | 'tail' | 'clip';
}

const TextMultiLanguage = ({ text, style, children, numberOfLines, onPress, ellipsizeMode }: TextMultiLanguageProps) => {
  const { t, currentLanguage } = useLngTranslation();
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);

  // The conditional style for `lineHeight` is a specific fix for certain languages.
  const languageSpecificStyle = currentLanguage !== "te" ? { lineHeight: undefined } : null;

  return (
    <Text onPress={onPress} style={[commonStyles.textWhite, style, languageSpecificStyle]} numberOfLines={numberOfLines} ellipsizeMode={ellipsizeMode}>
      {t(text ?? '')}
      {children}
    </Text>
  );
};

export default TextMultiLanguage;
