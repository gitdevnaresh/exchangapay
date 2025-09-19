import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useStyleSheet } from "@ui-kitten/components";
import ParagraphComponent from './Paragraph/Paragraph';
import AntDesign from "react-native-vector-icons/AntDesign";
import { ms } from '../constants/theme/scale';
import { NEW_COLOR } from '../constants/theme/variables';
import { commonStyles } from './CommonStyles';

type Props = {
  message: string;
  onClose: () => void;
};

const ErrorComponent: React.FC<Props> = ({ message, onClose }) => {
  const styles = useStyleSheet(themedStyles);

  return (
    <View style={styles.errorBg}>
      <ParagraphComponent style={[styles.errorText, commonStyles.fw500, commonStyles.flex1]} text={message} />
      <TouchableOpacity onPress={onClose}>
        <AntDesign name='close' size={20} color={'red'} />
      </TouchableOpacity>
    </View>
  );
};

const themedStyles = StyleSheet.create({
  errorBg: {
    paddingVertical: 16,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderColor: "red",
    borderWidth: 1,
    borderRadius: 12,
    marginVertical: 10,
    gap: 12
  },
  errorText: {
    color: NEW_COLOR.TEXT_RED,
    fontSize: ms(16),
  },
});
export default ErrorComponent;