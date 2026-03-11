import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather'; // Using Feather for the check icon
import { s } from './theme/scale';
import { useThemeColors } from '../hooks/useThemeColors';

// Define dimensions for the switch
const SWITCH_WIDTH = s(44);
const SWITCH_HEIGHT = s(24);
const THUMB_SIZE = s(20);
const PADDING = s(2); // Padding between thumb and track
const THUMB_TRANSLATE_X = SWITCH_WIDTH - THUMB_SIZE - PADDING * 2;


interface CustomSwitchProps {
  value?: boolean;
  onValueChange?: (newValue: boolean) => void;
  disable?: boolean;
}

const CustomSwitch = ({ value, onValueChange ,disable}: CustomSwitchProps) => {

  const NEW_COLOR = useThemeColors();
  const COLORS = {
  enabledTrack: NEW_COLOR.CIRCLE_BG,   // Dark purple/grey track when on
  disabledTrack: NEW_COLOR.CIRCLE_BG, // Darker grey track when off
  enabledThumb: NEW_COLOR.BG_YELLOW,  // Bright yellow thumb when on
  disabledThumb: NEW_COLOR.LIST_BORDER, // White thumb when off
  thumbIcon: NEW_COLOR.BG_BLACK,     // Black checkmark
};
  // Use a ref for the animated value to avoid re-creating it on each render
  const animatedValue = React.useRef(new Animated.Value(value ? 1 : 0)).current;

  // Animate the switch when the `value` prop changes
  React.useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: value ? 1 : 0,
      duration: 100,
      useNativeDriver: false, // `translateX` on a non-native component
    }).start();
  }, [value, animatedValue]);

  // Interpolate the animated value to create styles
  const thumbTranslateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, THUMB_TRANSLATE_X],
  });

  const trackBackgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [COLORS.disabledTrack, COLORS.enabledTrack],
  });

  const thumbBackgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [COLORS.disabledThumb, COLORS.enabledThumb],
  });

  return (
    <TouchableOpacity disabled={disable}
      activeOpacity={1}
      onPress={() => onValueChange && onValueChange(!value)}
      style={styles.container}>
      <Animated.View style={[styles.track, { backgroundColor: trackBackgroundColor }]} />
      <Animated.View
        style={[
          styles.thumb,
          {
            backgroundColor: thumbBackgroundColor,
            transform: [{ translateX: thumbTranslateX }],
          },
        ]}>
        {value && <Icon name="check" size={s(18)} color={COLORS.thumbIcon} />}
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: SWITCH_WIDTH,
    height: SWITCH_HEIGHT,
    justifyContent: 'center',
  },
  track: {
    width: '100%',
    height: '100%',
    borderRadius: SWITCH_HEIGHT / 2,
    position: 'absolute',
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    position: 'absolute',
    left: PADDING,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
});

export default CustomSwitch;