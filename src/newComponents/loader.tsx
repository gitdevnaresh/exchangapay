import React, { useRef, useEffect } from 'react';
import { View, Animated, StyleSheet, Easing } from 'react-native';
import { Arthalogo, Arthawallet } from '../assets/svg';
import { useThemeColors } from '../hooks/useThemeColors';
import { getThemedCommonStyles } from '../assets/styles/CommonStyles';

interface DashboardLoaderProps {
  size?: number;    // Size of the flip container (width and height)
  duration?: number; // Duration of one full flip animation in milliseconds
}

const DashboardLoader = ({
  size = 120,
  duration = 3000 // 3 seconds for one full spin
}: DashboardLoaderProps) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  useEffect(() => {
    Animated.loop(
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: duration,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();

    // Clean up the animation on unmount
    return () => animatedValue.stopAnimation();
  }, [animatedValue, duration]);

  // Interpolate the rotation for the front side (0 to 180 degrees)
  const frontInterpolate = animatedValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['0deg', '180deg', '360deg'], // Goes from 0 to 180, then 180 to 360
  });

  // Interpolate the rotation for the back side (starts at 180 degrees relative to front)
  const backInterpolate = animatedValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['180deg', '360deg', '540deg'], // Goes from 180 to 360, then 360 to 540 (which is 180)
  });

  // Interpolate opacity to hide the backface during the flip
  const frontOpacity = animatedValue.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [1, 0.5, 0, 0.5, 1],
  });

  const backOpacity = animatedValue.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [0, 0.5, 1, 0.5, 0],
  });

  const frontAnimatedStyle = {
    transform: [
      { rotateY: frontInterpolate }
    ],
    opacity: frontOpacity
  };

  const backAnimatedStyle = {
    transform: [
      { rotateY: backInterpolate }
    ],
    opacity: backOpacity
  };

  return (
    <View style={[styles.flipContainer,commonStyles.mxAuto,commonStyles.myAuto, { width: size, height: size }]}>
      <View style={[styles.flipper]}>

        {/* Front Side */}
        <Animated.View style={[styles.front, frontAnimatedStyle]}>
          <Arthalogo />
        </Animated.View>

        {/* Back Side */}
        <Animated.View style={[styles.back, backAnimatedStyle]}>
         <Arthawallet/>
        </Animated.View>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  flipContainer: {
    width: 120,  // or any fixed size you want
    height: 120,
    alignItems: 'center',         // centers children horizontally
    justifyContent: 'center',     // centers children vertically
  },
  flipper: {
    width: 120,
    height: 120,
    position: 'relative',
  },
  front: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
    alignItems: 'center',        // center the content inside face
    justifyContent: 'center',
  },
  back: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default DashboardLoader;