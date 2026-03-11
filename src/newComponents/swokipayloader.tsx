import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Animated } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import SafeAreaViewComponent from './safeArea/safeArea';
import { useThemeColors } from '../hooks/useThemeColors';
import { getThemedCommonStyles } from '../assets/styles/CommonStyles';
import { s } from './theme/scale';
 
const AnimatedView = Animated.createAnimatedComponent(View);
 
type AnimatedLogoProps = {
  size?: number;
  style?: StyleProp<ViewStyle>;
  /** Set to false if you want a static color from NEW_COLOR.TEXT_PRIMARY */
  pulse?: boolean;
};
 
const SwokipayDashboardLoader: React.FC<AnimatedLogoProps> = ({ size = 50, style, pulse = true }) => {
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const [fillColor, setFillColor] = useState(NEW_COLOR.BG_YELLOW);
 
  useEffect(() => {
    if (!pulse) return;
    const interval = setInterval(() => {
      setFillColor((prev: string) =>
        prev === NEW_COLOR.BG_YELLOW ? '#FFFFFF' : NEW_COLOR.BG_YELLOW 
      );
    }, 1500);
    return () => clearInterval(interval);
  }, [pulse]);
 
  return (
    <SafeAreaViewComponent>
      <View
        style={[
          styles.container,
          commonStyles.mxAuto,
          commonStyles.myAuto,
          { width: size, height: size },
          style,
        ]}
        accessibilityRole="image"
        accessibilityLabel="Rapidz mark"
      >
        <AnimatedView style={styles.flipper}>
          <Svg width={s(70)} height={s(70)} viewBox="0 0 20 24">
            <Path
              d="M16.219 10.9306C17.8597 10.2527 19.3026 8.53392 19.3026 5.89126C19.2996 2.80465 17.1188 0 11.7525 0H0C1.19985 0 2.03374 0.896887 2.03374 1.76078V6.84514C2.03374 6.84514 3.02962 6.43419 4.89238 6.24521C6.75515 6.05624 8.26696 6.10723 8.26696 6.10723C8.28796 6.08323 8.28196 5.45931 8.61791 5.03037C8.95687 4.60142 9.30483 4.53243 9.5358 4.49643C11.7315 4.06749 14.1342 4.06149 16.126 3.2066C15.934 3.85451 15.4091 4.28346 14.6622 4.64641C13.5073 5.18935 12.1605 5.26434 11.7135 5.66329C11.5785 5.78327 11.4946 5.82527 11.3476 6.17922C11.1946 6.55117 11.2126 6.63816 11.3116 6.83314C11.4856 7.24109 12.2205 8.02399 12.5504 8.6989C12.8774 9.37682 12.7274 10.0367 12.8894 10.7416C13.0514 11.4496 13.5283 12.4634 13.8523 13.1143C14.1762 13.7653 14.4522 13.7653 14.7371 14.0352C15.0101 14.2902 15.1601 14.5392 14.9021 15.475C14.6442 16.4109 14.1102 17.0559 13.5433 17.3198C12.9764 17.5838 12.6644 17.6918 12.2745 17.5178C11.8845 17.3438 11.0686 16.7829 10.3997 16.6779C9.86876 16.5969 9.39482 16.7409 8.68391 16.5549C7.84401 16.3359 7.56205 15.88 7.20809 15.838C6.24821 15.724 4.51743 18.7686 2.03374 23.1961H12.0495C16.8009 23.1961 19.9955 20.4094 19.9955 16.2999C19.9955 13.1263 17.7968 11.4826 16.213 10.9186L16.219 10.9306Z"
              fill={fillColor}
            />
          </Svg>
        </AnimatedView>
      </View>
    </SafeAreaViewComponent>
  );
};
 
const styles = StyleSheet.create({
  container: { justifyContent: 'center', alignItems: 'center' },
  flipper: { width: '100%', height: '100%' },
});
 
 

export default SwokipayDashboardLoader;
