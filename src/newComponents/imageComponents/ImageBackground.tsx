import React from "react";
import {
  ImageBackground,
  ImageSourcePropType,
  ImageResizeMode,
  StyleProp,
  ViewStyle,
  ImageStyle,
} from "react-native";
import ViewComponent from "../view/view";
import { commonStyles } from "../theme/commonStyles";

type ImageBackgroundWrapperProps = {
  /**
   * The image source (either a remote URL or a local file resource).
   * This prop is required.
   */
  source: ImageSourcePropType;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
  resizeMode?: ImageResizeMode;
  /**
   * The mechanism that should be used to resize the image when the image's dimensions
   * differ from the image view's dimensions. Defaults to `auto`.
   * @platform android
   */
  resizeMethod?: "auto" | "resize" | "scale";
};

const ImageBackgroundWrapper: React.FC<ImageBackgroundWrapperProps> = ({
  source,
  children,
  style,
  imageStyle,
  resizeMode,
  resizeMethod,
}) => {
  return (
    <ImageBackground
      source={source}
      style={style}
      imageStyle={imageStyle}
      resizeMethod={resizeMethod}
      resizeMode={resizeMode}
    >
      <ViewComponent style={[commonStyles.flex1]}>{children}</ViewComponent>
    </ImageBackground>
  );
};

export default ImageBackgroundWrapper;
