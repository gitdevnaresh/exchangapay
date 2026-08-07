import React from "react";
import {
  Modal,
  Platform,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  ModalProps,
  StyleProp,
  ViewStyle,
} from "react-native";

/**
 * P-03 — duplicate UI kits.
 *
 * The app renders @ui-kitten/components everywhere and pulled in the whole of
 * react-native-elements for four components: this Overlay (19 screens), a
 * Button, an Input and an Image. These four files replace that dependency.
 *
 * This is a line-for-line port of react-native-elements v3.4.3's Overlay
 * (node_modules/react-native-elements/dist/overlay/Overlay.js) — same element
 * tree, same default styles, same prop names and defaults — so the 19 call
 * sites render identically without a single edit beyond the import path. The
 * RNE version was wrapped in `withTheme`, but no RNE ThemeProvider was ever
 * mounted in this app, so the theme only ever supplied empty defaults.
 */
export interface OverlayProps extends Omit<ModalProps, "visible"> {
  // Optional, as it was in RNE's typings: three call sites (baseCurrency,
  // CardDetailsInfo, CoinsDropDown) mount the overlay conditionally and never
  // pass it, relying on Modal's own `visible` default of true.
  isVisible?: boolean;
  backdropStyle?: StyleProp<ViewStyle>;
  overlayStyle?: StyleProp<ViewStyle>;
  onBackdropPress?: () => void;
  fullScreen?: boolean;
  ModalComponent?: React.ComponentType<any>;
  children?: React.ReactNode;
}

export const Overlay: React.FC<OverlayProps> = ({
  children,
  backdropStyle,
  overlayStyle,
  onBackdropPress = () => null,
  fullScreen = false,
  ModalComponent = Modal,
  isVisible,
  ...rest
}) => (
  <ModalComponent
    visible={isVisible}
    onRequestClose={onBackdropPress}
    transparent
    {...rest}
  >
    <TouchableWithoutFeedback
      onPress={onBackdropPress}
      testID="RNE__Overlay__backdrop"
    >
      <View
        testID="backdrop"
        style={StyleSheet.flatten([styles.backdrop, backdropStyle])}
      />
    </TouchableWithoutFeedback>

    <View style={styles.container} pointerEvents="box-none">
      <View
        style={StyleSheet.flatten([
          styles.overlay,
          fullScreen && styles.fullscreen,
          overlayStyle,
        ])}
      >
        {children}
      </View>
    </View>
  </ModalComponent>
);

const styles = StyleSheet.create({
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, .4)",
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  fullscreen: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    backgroundColor: "white",
    borderRadius: 3,
    padding: 10,
    ...Platform.select({
      android: {
        elevation: 2,
      },
      default: {
        shadowColor: "rgba(0, 0, 0, .3)",
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 4,
      },
    }),
  },
});

export default Overlay;
