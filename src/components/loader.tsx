import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Animated } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import SafeAreaViewComponent from './safeArea/safeArea';
import { useThemeColors } from '../hooks/themedHook/useThemeColors';
import { getThemedCommonStyles } from './CommonStyles';
import { s } from '../constants/styels/scale';

const AnimatedView = Animated.createAnimatedComponent(View);

type AnimatedLogoProps = {
  size?: number;
  style?: StyleProp<ViewStyle>;
};

const DashboardLoader: React.FC<AnimatedLogoProps> = ({ size = s(70), style }) => {
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const [fillColor, setFillColor] = useState(NEW_COLOR.TEXT_PRIMARY); // initial color
  // Color toggle every 2s
  useEffect(() => {
    const interval = setInterval(() => {
      setFillColor((prev: any) => (prev === NEW_COLOR.PRIMARYRAPIDZ_LOGO ? NEW_COLOR.SECONDARYRAPIDZ_LOGO : NEW_COLOR.PRIMARYRAPIDZ_LOGO));
    }, 1000);

    return () => clearInterval(interval);
  }, []);


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
      >
        <AnimatedView style={[styles.flipper]}>
          <Svg width="100%" height="100%" viewBox="0 0 65 71" fill={fillColor}>
            <Path d="M28.5413 21.8912C29.6622 21.8912 30.5792 20.9853 30.5792 19.878V10.99C30.5792 9.88276 29.6622 8.97685 28.5413 8.97685H25.7289C25.6168 8.99698 25.5048 9.00704 25.3927 9.00704H19.2789C19.1974 9.00704 19.1158 9.00704 19.0445 9.00704C18.0357 8.88626 17.2409 8.03067 17.2409 7.00396V1.99123C17.2206 0.904136 16.3239 0.0183525 15.203 0.0183525H9.08919C7.96833 0.0183525 7.05126 0.924268 7.05126 2.0315V7.25561C7.05126 8.36284 7.96833 9.26875 9.08919 9.26875H15.203C16.3341 9.26875 17.2409 10.1747 17.2409 11.2819V19.6666C17.2409 20.7739 16.3341 21.6798 15.203 21.6798H2.03794C0.917071 21.6798 0 22.5857 0 23.6929V35.7517C0 36.8589 0.917071 37.7648 2.03794 37.7648H15.203C16.3341 37.7648 17.2409 36.8589 17.2409 35.7517V23.9043C17.2409 22.7971 18.158 21.8912 19.2789 21.8912H28.5413Z" />
            <Path d="M61.8411 10.849H41.421C39.6785 10.849 38.2622 12.2582 38.2622 13.9694V34.2116C38.2622 35.7818 37.0802 37.0803 35.5313 37.2715C35.409 37.2917 35.2664 37.3017 35.1339 37.3017H21.3167C19.7679 37.493 18.5757 38.7915 18.5757 40.3718V54.0209C18.5757 55.7321 19.9819 57.1212 21.7141 57.1212H35.1339C36.8662 57.1212 38.2622 58.5102 38.2622 60.2113V66.8044C38.2622 69.1195 40.1472 70.9817 42.4909 70.9817H48.89C51.2234 70.9817 53.1187 69.1195 53.1187 66.8044V60.8052C53.1187 58.5002 51.2234 56.6279 48.89 56.6279H42.1954C40.4733 56.6279 39.0671 55.2389 39.0671 53.5378V40.8549C39.0671 39.1538 40.4733 37.7648 42.1954 37.7648H61.8411C63.5937 37.7648 64.9999 36.3556 64.9999 34.6444V13.9694C64.9999 12.2582 63.5937 10.849 61.8411 10.849Z" />
          </Svg>
        </AnimatedView>
      </View>
    </SafeAreaViewComponent>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  flipper: {
    width: '100%',
    height: '100%',
  },
});

export default DashboardLoader;

