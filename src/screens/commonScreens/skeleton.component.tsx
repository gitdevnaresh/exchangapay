import React, { useRef, useEffect } from 'react';
import { StyleSheet, View, Animated, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface GradientSkeletonProps {
  width?: number | string; // Skeleton width
  height?: number | string; // Skeleton height
  borderRadius?: number; // Skeleton border radius
  style?: ViewStyle; // Additional styles for the skeleton container
}

const GradientSkeleton: React.FC<GradientSkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
}) => {
  const shimmerAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnimation, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      })
    ).start();
  }, [shimmerAnimation]);

  const translateX = shimmerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [-300, 300], // Adjust based on skeleton width
  });

  return (
    <View
      style={[
        styles.skeletonContainer,
        { width, height, borderRadius },
        style,
      ]}
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { transform: [{ translateX }] },
        ]}
      >
        <LinearGradient
          colors={['#1e1e1e80', '#1e1e1e80', '#1e1e1e80']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  skeletonContainer: {
    backgroundColor: '#1e1e1e80', // Base color for the skeleton
    overflow: 'hidden', // Ensures the gradient stays within bounds
  },
});

export default GradientSkeleton;
