import React, { useRef, useEffect } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { NEW_COLOR } from "../../constants/styels/variables";
import { s } from "../../constants/styels/scale";

const Loadding = (props: any) => {
  const shimmerAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnimation, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    ).start();
  }, [shimmerAnimation]);

  const translateX = shimmerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [-350, 350],
  });

  const renderShimmer = (content: any) => (
    <View style={[content.props.style, styles.shimmerWrapper]}>
      {content}
      <Animated.View
        style={[
          styles.shimmerOverlay,
          {
            transform: [{ translateX }],
          },
        ]}
      >
        <LinearGradient
          colors={[NEW_COLOR.SKELETON_PRYMARY, NEW_COLOR.SKELETON_SECONDARY, NEW_COLOR.SKELETON_TERTIARY]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.gradient, { opacity: 0.2 }]}
        />
      </Animated.View>
    </View>
  );

  return (
    <View>
      {props.contenthtml
        ? React.Children.map(props.contenthtml, (child: any) =>
          renderShimmer(child)
        )
        : null}
    </View>
  );
};

const styles = StyleSheet.create({
  shimmerWrapper: {
    position: "relative",
    overflow: "hidden",
    borderRadius: 11,
    marginBottom: 5
  },
  shimmerOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  gradient: {
    flex: 1,
    width: "200%",
    // marginBottom:s(10),
  },
});

export default Loadding;
