import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";
import { s } from "../../constants/styels/scale";
import { useThemeColors } from "../../hooks/themedHook/useThemeColors";
import { getThemedCommonStyles } from "../CommonStyles";
import TextMultiLangauge from "../textComponets/multiLanguageText/textMultiLangauge";

interface CircularProgressBarProps {
  progress: number;
  total: number;
  size?: number;
  strokeWidth?: number;
}

const CircularProgressBar: React.FC<CircularProgressBarProps> = ({
  progress,
  total,
  size = 80,
  strokeWidth = 8,
}) => {
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);

  const radius = (size - strokeWidth - s(2)) / 2;
  const circumference = 2 * Math.PI * radius;
  const progressPercentage = Math.min(progress / total, 1);
  const strokeDashoffset = circumference * (1 - progressPercentage);

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#11998E" />
            <Stop offset="100%" stopColor="#38EF7D" />
          </LinearGradient>
        </Defs>

        {/* Background Circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={NEW_COLOR.BANNER_BG}
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Progress Circle with gradient */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={NEW_COLOR.BUTTON_BG}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>

      <View style={styles.textContainer}>
        <TextMultiLangauge style={[commonStyles.fs18, commonStyles.fw500]}>
          {`${progress} of ${total}`}
        </TextMultiLangauge>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
});

export default CircularProgressBar;

