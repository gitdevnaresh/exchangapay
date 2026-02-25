import React, { useEffect, useState , useMemo } from 'react';
import {
  TouchableOpacity,
  View,
  StyleSheet,
  Animated,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { NEW_COLOR } from '../../constants/styels/variables';
import { useThemeColors } from '../../hooks/themedHook/useThemeColors';
import { s } from '../../constants/styels/scale';

interface ToggleProps {
  value: boolean;
  onValueChange?: (value: boolean) => void;
  disabled?: boolean;
  size?: number;                // height of toggle (default 24)
  style?: StyleProp<ViewStyle>; // wrapper style
  activeColor?: string;
  inactiveColor?: string;
  thumbColor?: string;
}

const Toggle: React.FC<ToggleProps> = ({
  value,
  onValueChange,
  disabled = false,
  size = s(24),
  style,
}) => {
  const [anim] = useState(new Animated.Value(value ? 1 : 0));

  useEffect(() => {
    Animated.timing(anim, {
      toValue: value ? 1 : 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
  }, [value, anim]);

  const { trackWidth, trackHeight, thumbSize, padding, translateRange } =
    useMemo(() => {
      const trackHeight = size;
      const trackWidth = size * 2;       // pill width
      const padding = size * 0.12;       // inner padding
      const thumbSize = trackHeight - padding * 2;
      const translateRange = trackWidth - thumbSize - padding * 2;
      return { trackWidth, trackHeight, thumbSize, padding, translateRange };
    }, [size]);

  const translateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, translateRange],
  });
    const NEW_COLOR = useThemeColors();


  const handlePress = () => {
    if (disabled) return;
    onValueChange && onValueChange(!value);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      disabled={disabled}
      style={style}
    >
      <View
        style={[
          styles.track,
          {
            width: trackWidth,
            height: trackHeight,
            borderRadius: trackHeight / 2,
            padding,
            backgroundColor: value ? NEW_COLOR.TEXT_PRIMARY : NEW_COLOR.THUMBTOGGLE_BG,
            opacity: disabled ? 0.5 : 1,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.thumb,
            {
              width: thumbSize,
              height: thumbSize,
              borderRadius: thumbSize / 2,
              backgroundColor: NEW_COLOR.THUMBROUNDED_BG,
              transform: [{ translateX }],
            },
          ]}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  track: {
    justifyContent: 'center',
  },
  thumb: {
    elevation: 2,
  },
});

export default Toggle;

