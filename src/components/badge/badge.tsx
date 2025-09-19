import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Path } from "react-native-svg";
import { commonStyles } from "../CommonStyles";

interface BadgeProps {
  text: string;
  color?: string;
}

const Badge: React.FC<BadgeProps> = ({ text, color = "#FFC107" }) => {
  return (
    <View style={styles.container}>
      <Svg width={70} height={24} viewBox="0 0 111 26" fill="none">
        <Path
          d="M.13 4.9A4 4 0 014.029 0h102.037a4 4 0 013.914 4.828l-3.808 18A4 4 0 01102.258 26H8.182a4 4 0 01-3.898-3.1L.131 4.9z"
          fill={color}
        />
      </Svg>
      <Text style={[commonStyles.fw600, commonStyles.textAlwaysWhite, styles.text, { marginBottom: 2, fontSize: 8 }]}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    position: "absolute", top: 5
  },
});

export default Badge;
