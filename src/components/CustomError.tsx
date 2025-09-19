import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { commonStyles } from './CommonStyles';
import { useStyleSheet } from '@ui-kitten/components';
import ParagraphComponent from './Paragraph/Paragraph';
import { NEW_COLOR } from '../constants/theme/variables';
import { s } from '../constants/theme/scale';

interface Props {
  message: string;
  onClose: () => void;
  link: string;
  errList?: string[]
  navigation?: any
}

const CustomErrorComponent: React.FC<Props> = ({ message, onClose, link, errList, navigation }) => {
  const styles = useStyleSheet(themedStyles);

  return (
    <View style={[styles.errorBg, commonStyles.dflex, commonStyles.alignStart, commonStyles.p16, commonStyles.rounded16, commonStyles.mb8]}>
      <View style={[commonStyles.flex1]}>

        <ParagraphComponent text="Please fill below details to proceed:" style={[commonStyles.fs16, commonStyles.textRed, commonStyles.fw500, commonStyles.mb4,]} />
        {errList?.map((err: string) => (
          <ParagraphComponent style={[commonStyles.textRed, commonStyles.fs12, commonStyles.fw400, commonStyles.mb4]}
            text={`- ${err}`} />
        ))}

        <View style={[commonStyles.dflex, commonStyles.gap4, commonStyles.alignCenter]}>
          <ParagraphComponent style={[styles.link, commonStyles.fs14, commonStyles.fw500]}
            onPress={() => { if (navigation) { navigation.navigate('EditProfile') } }}
            text="Click Here" />

          <ParagraphComponent style={[commonStyles.textRed, commonStyles.fs14, commonStyles.fw500]}
            text="to fill the details." />
        </View>
      </View>
      <TouchableOpacity onPress={onClose} style={[{ marginTop: 3 }]}>
        <AntDesign name='close' size={s(20)} color={'red'} />
      </TouchableOpacity>
    </View>
  );
};

const themedStyles = {
  errorBg: {
    backgroundColor: 'rgba(255,0,0,0.1)',
  },
  link: {
    color: NEW_COLOR.BG_BLUE,
    textDecorationLine: 'underline',
  },
};

export default CustomErrorComponent;