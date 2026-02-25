import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import { NEW_COLOR } from '../../constants/styels/variables';
import { s } from '../../constants/styels/scale';
import { useThemeColors } from '../../hooks/themedHook/useThemeColors';
import { getThemedCommonStyles } from '../CommonStyles';

type Props = {
  message: string;
  children?: any;
  onClose: () => void;
  handleLink?: any;
};

const ErrorComponent: React.FC<Props> = ({ message, onClose, children, handleLink }) => {
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  return (
    <View style={themedStyles.errorBg}>
      <Text style={[commonStyles.fs16, commonStyles.flex1, commonStyles.fw400, commonStyles.textRed]}>{message}{children && <Text style={[commonStyles.textBlue3, commonStyles.fw700]} onPress={handleLink}> {children}</Text>}</Text>
      <TouchableOpacity onPress={onClose}>
        <AntDesign name="close" size={s(24)} color={NEW_COLOR.TEXT_RED} />
      </TouchableOpacity>
    </View>
  );
};

const themedStyles = StyleSheet.create({
  errorBg: {
    backgroundColor: NEW_COLOR.TRANSPARENT,
    padding: s(14),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderColor: NEW_COLOR.TEXT_RED,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    gap: 10,

  },
});
export default ErrorComponent;
