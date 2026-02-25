import React from 'react';
import { Text, StyleProp, TextStyle, GestureResponderEvent } from 'react-native';
import { useLngTranslation } from "../../../hooks/languagesHook/useLngTranslation";
import { useThemeColors } from '../../../hooks/themedHook/useThemeColors';
import { getThemedCommonStyles } from '../../CommonStyles';
interface LabelProps {
  text?: string | number;
  style?: StyleProp<TextStyle>;
  children?: React.ReactNode;
  numberOfLines?: number;
  onPress?: (event: GestureResponderEvent) => void;
  ellipsizeMode?: 'head' | 'middle' | 'tail' | 'clip';
  multiLanguageAllows?: boolean;
}
const ParagraphComponent = ({ multiLanguageAllows = false, text, style, children, numberOfLines, onPress, ellipsizeMode }: LabelProps) => {
  const { t, currentLanguage } = useLngTranslation();
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  return (
    <Text onPress={onPress} style={[commonStyles.textWhite, style, currentLanguage !== "te" ? { lineHeight: undefined } : null]} numberOfLines={numberOfLines} ellipsizeMode={ellipsizeMode}>
      {multiLanguageAllows ? t(String(text ?? '')) : t(text)}
      {typeof children === 'string' ? t(children) : children}
    </Text>
  );
};

export default React.memo(ParagraphComponent);

