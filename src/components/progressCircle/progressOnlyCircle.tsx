import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { s } from "../../constants/styels/scale";
import { useThemeColors } from "../../hooks/themedHook/useThemeColors";

interface CardHeaderProgressCircleProps {
  progress: number; // Current progress value
  total: number;    // Total value for the progress
  size?: number;    // Diameter of the circular progress bar
  strokeWidth?: number; // Width of the progress bar
  fontSize?: number;
}

const CardHeaderProgressCircle: React.FC<CardHeaderProgressCircleProps> = ({
  progress,
  total,
  size = s(42),
  strokeWidth = 3,
  fontSize = s(12)
}) => {
  const NEW_COLOR = useThemeColors();
  const radius = (size - strokeWidth - s(2)) / 2;
  const circumference = 2 * Math.PI * radius;
  const progressPercentage = Math.min(progress / total, 1); // Ensure it doesn't exceed 100%
  const styles = ScreenStyeles(NEW_COLOR);
  const strokeDashoffset = circumference * (1 - progressPercentage);

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        {/* Background Circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={NEW_COLOR.PROGRESS_OUTLINE} // Dark background color
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress Circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={NEW_COLOR.PRiMARY_COLOR} // Bright blue color for progress
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      {/* Text in the center */}
      <View style={styles.textContainer}>
        <Text style={[styles.text, { fontSize: fontSize }]}>{`${progress} / ${total}`}</Text>
      </View>
    </View>
  );
};

const ScreenStyeles = (NEW_COLOR: any) => StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  textContainer: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: NEW_COLOR.TEXT_WHITE,
    fontFamily: "Blinker-SemiBold"
  },
});

export default CardHeaderProgressCircle;
