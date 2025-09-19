import React from 'react';
import { View, StyleSheet } from 'react-native';
import Text from '../components/Text';
import { ms, s } from '../constants/theme/scale';
import ModalPicker from '../components/ModalPicker';
import { NEW_COLOR, WINDOW_WIDTH } from '../constants/theme/variables';
import LabelComponent from './Paragraph/label';
import ParagraphComponent from './Paragraph/Paragraph';
import { commonStyles } from './CommonStyles';
import { NoDataIcon } from '../assets/svg';

interface NoDataComponentProps {
  Description?:any;
  }
const NoDataComponent = ({Description=false ,}:NoDataComponentProps) => {
  

  return (
    <View style={[commonStyles.mt16]}>
      
      <NoDataIcon width={s(130)} height={s(130)} style={[commonStyles.mxAuto]} />
      {!Description && <ParagraphComponent text={"NO DATA"} style={[commonStyles.fs14,commonStyles.fw500,commonStyles.textBlack,commonStyles.textCenter]} />}
      {Description && <ParagraphComponent text={Description} style={[commonStyles.fs14,commonStyles.fw500,commonStyles.textBlack,commonStyles.textCenter]} />}
  
    </View>
  );
};
export default NoDataComponent;

const styles = StyleSheet.create({

  });
  