import React from 'react';
import { StyleSheet, StyleProp, TextStyle } from 'react-native';
import ParagraphComponent from '../paragraphText/paragraph';
import { ms } from '../../theme/scale';
import { useLngTranslation } from "../../../hooks/useLngTranslation";
import { useThemeColors } from '../../../hooks/useThemeColors';
import { getThemedCommonStyles } from '../../../assets/styles/CommonStyles';

interface LabelProps {
  text?: string | number | null;
  style?: StyleProp<TextStyle>;
  children?: React.ReactNode;
  multiLanguageAllows?: boolean;
}

const LabelComponent = ({ multiLanguageAllows, text, style, children }: LabelProps) => {
  const { t } = useLngTranslation();
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const styles = screenStyles(NEW_COLOR);
  return <ParagraphComponent
    style={[styles.labelStyle, style, commonStyles.fw400]}
  >{multiLanguageAllows ? t(String(text ?? '')) : text}
    {children}</ParagraphComponent>
};

export default LabelComponent;
const screenStyles = (NEW_COLOR: any) => StyleSheet.create({
  container: {},
  labelStyle: {
    fontSize: ms(14),
    color: NEW_COLOR.TEXT_GREY,
  },
});
