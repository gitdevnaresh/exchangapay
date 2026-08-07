import React from "react";
import {
  Animated,
  Image as ImageNative,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

/**
 * Port of react-native-elements v3.4.3's Image
 * (node_modules/react-native-elements/dist/image/Image.js): the image is
 * absolutely filled inside a relative container, with a grey placeholder that
 * fades out on load. src/components/Icon.tsx is the only consumer and passes
 * source / style / containerStyle, but the placeholder and the fade are kept so
 * remote icons behave exactly as they did while loading.
 */
export interface UiImageProps {
  onPress?: () => void;
  onLongPress?: () => void;
  Component?: any;
  placeholderStyle?: any;
  PlaceholderContent?: React.ReactNode;
  containerStyle?: any;
  childrenContainerStyle?: any;
  style?: any;
  ImageComponent?: any;
  transition?: boolean;
  transitionDuration?: number;
  children?: React.ReactNode;
  [key: string]: any;
}

export class Image extends React.Component<UiImageProps> {
  state = {
    placeholderOpacity: new Animated.Value(1),
  };

  onLoad = (e: any) => {
    const { transition = true, onLoad, transitionDuration = 360 } = this.props;
    if (!transition) {
      this.state.placeholderOpacity.setValue(0);
      return;
    }
    Animated.timing(this.state.placeholderOpacity, {
      toValue: 0,
      duration: transitionDuration,
      useNativeDriver: true,
    }).start();
    onLoad && onLoad(e);
  };

  render() {
    const {
      onPress,
      onLongPress,
      Component = onPress || onLongPress ? TouchableOpacity : View,
      placeholderStyle,
      PlaceholderContent,
      containerStyle,
      childrenContainerStyle = null,
      style = {},
      ImageComponent = ImageNative,
      children,
      ...attributes
    } = this.props;

    const hasImage = Boolean(attributes.source);
    const { width, height, ...styleProps } = StyleSheet.flatten(style) as any;

    return (
      <Component
        onPress={onPress}
        onLongPress={onLongPress}
        accessibilityIgnoresInvertColors={true}
        style={StyleSheet.flatten([styles.container, containerStyle])}
      >
        <ImageComponent
          testID="RNE__Image"
          {...attributes}
          onLoad={this.onLoad}
          style={StyleSheet.flatten([
            StyleSheet.absoluteFill,
            { width, height },
            styleProps,
          ])}
        />

        <Animated.View
          pointerEvents={hasImage ? "none" : "auto"}
          accessibilityElementsHidden={hasImage}
          importantForAccessibility={hasImage ? "no-hide-descendants" : "yes"}
          style={[
            styles.placeholderContainer,
            { opacity: hasImage ? this.state.placeholderOpacity : 1 },
          ]}
        >
          <View
            testID="RNE__Image__placeholder"
            style={StyleSheet.flatten([
              style,
              styles.placeholder,
              placeholderStyle,
            ])}
          >
            {PlaceholderContent}
          </View>
        </Animated.View>

        <View
          testID="RNE__Image__children__container"
          style={childrenContainerStyle ?? style}
        >
          {children}
        </View>
      </Component>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "transparent",
    position: "relative",
    overflow: "hidden",
  },
  placeholderContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  placeholder: {
    backgroundColor: "#bdbdbd",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default Image;
