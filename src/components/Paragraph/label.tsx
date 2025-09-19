import React, { Children } from 'react';
import { StyleSheet } from 'react-native';
import ParagraphComponent from './Paragraph';
import { NEW_COLOR } from '../../constants/theme/variables';
import { ms } from '../../constants/theme/scale';

interface LabelProps {
  text: string,
  style?: any,
  Children?:any,
}
const LabelComponent = ({ text, style,Children }: LabelProps) => {
  return <ParagraphComponent text={text} children={Children}  style={[styles.labelStyle,style]} />;
};

export default LabelComponent;
const styles = StyleSheet.create({
  container: {},
  labelStyle:{
    fontSize: ms(12),
    color: NEW_COLOR.TEXT_LABEL,
    marginBottom:6,
    fontFamily:"PlusJakartaSans-Regular"
  },
});
