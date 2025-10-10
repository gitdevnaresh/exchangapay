import React from "react";
import { View, StyleSheet } from "react-native";
import { Overlay } from "react-native-elements";
import { s } from "../constants/theme/scale";
import { NEW_COLOR } from "../constants/theme/variables";

interface CommonOverlayProps {
  isVisible: boolean;
  onClose: () => void;
  windowWidth: number;
  windowHeight: number;
  title?: string;
  colors?: any;
  children?: React.ReactNode;
}

const CommonOverlay: React.FC<CommonOverlayProps> = ({
  isVisible,
  onClose,
  windowWidth,
  windowHeight,
  title,
  colors,
  children,
}) => {
  return (
    <Overlay
      isVisible={isVisible}
      onBackdropPress={onClose}
      backdropStyle={styles.backdrop}
      overlayStyle={[
        styles.overlayContainer,
        { width: windowWidth - 20, maxHeight: windowHeight * 0.8 },
      ]}
    >
      <View>{children}</View>
    </Overlay>
  );
};

export default CommonOverlay;

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  overlayContainer: {
    borderRadius: 30,
    padding: s(28),
    backgroundColor: NEW_COLOR.POP_UP_BG,
  },
});