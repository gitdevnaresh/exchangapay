import React from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import {
  useTheme,
  StyleService,
  useStyleSheet,
  Icon,
} from '@ui-kitten/components';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { s } from '../constants/theme/scale';
import { NEW_COLOR } from '../constants/theme/variables';

interface Props {
  checked?: boolean;
  style?: StyleProp<ViewStyle>;
  color?: any;
  activeColor?: any;
  size?: number;
}

const Checkbox = ({ checked, style, color, activeColor, size }: Props) => {
  const theme = useTheme();
  const styles = useStyleSheet(themedStyles);
  return (
    <View
    // style={[
    //   styles.container,
    //   { borderWidth: checked ? 0 : 2 },
    //   {
    //     backgroundColor: checked ? theme['color-primary-100'] : 'transparent',
    //   },
    // ]}
    >
      {checked ? (
        <MaterialCommunityIcons name="checkbox-marked" color={activeColor ? activeColor : NEW_COLOR.TEXT_ORANGE} size={(size || s(24))} />
      ) : (<MaterialCommunityIcons name="checkbox-blank-outline" color={color ? color : NEW_COLOR.TEXT_GREY} size={(size || s(24))} />)}
    </View>
  );
};

export default Checkbox;

const themedStyles = StyleService.create({
  container: {
    width: 20,
    height: 20,
    borderRadius: 0,
    borderColor: 'color-basic-400',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
