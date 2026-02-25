import React from "react";
import { StyleSheet, StyleProp, TextStyle } from 'react-native';
import ParagraphComponent from '../paragraphText/paragraph';
import { ms } from '../../theme/scale';
import { useLngTranslation } from "../../../hooks/languagesHook/useLngTranslation";
import { getThemedCommonStyles } from '../../../components/CommonStyles';
import { useThemeColors } from '../../../hooks/themedHook/useThemeColors';

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
    style={[commonStyles.labelStyle, style,]}
  >{multiLanguageAllows ? t(String(text ?? '')) : t(text)}
    {children}</ParagraphComponent>
};

export default LabelComponent;
const screenStyles = (NEW_COLOR: any) => StyleSheet.create({
  container: {},

});

