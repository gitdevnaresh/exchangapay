import React, { useEffect, useState } from "react";
import {
  ImageBackground,
  ImageSourcePropType,
  ImageResizeMode,
  StyleProp,
  ViewStyle,
  ImageStyle,
  ActivityIndicator,
} from "react-native";
import { SvgUri } from "react-native-svg";
import ViewComponent from "../view/view";
import { getThemedCommonStyles } from "../CommonStyles";
import { useThemeColors } from "../../hooks/themedHook/useThemeColors";

type Props = {
  source: ImageSourcePropType;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
  resizeMode?: ImageResizeMode;
  resizeMethod?: "auto" | "resize" | "scale";
};

const isSvg = (source: ImageSourcePropType) => {
  return (
    typeof source === "object" &&
    "uri" in source &&
    source.uri?.toLowerCase().endsWith(".svg")
  );
};

const ImageBackgroundWrapper: React.FC<Props> = ({
  source,
  children,
  style,
  imageStyle,
  resizeMode = "cover",
  resizeMethod,
}) => {
    const [isLoading, setIsLoading] = useState(true);
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);

useEffect(() => {
  setTimeout(() => {
    setIsLoading(false);
  }, 800);
}, []);
  // ✅ SVG case
  if (isSvg(source)) {
    return (
      <ViewComponent style={[style,{ overflow: 'hidden' }]}>
          {(isLoading&&isSvg(source)) && (
          <ViewComponent
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1,
            }}
          >
            <ActivityIndicator size="small" color={NEW_COLOR.BUTTON_BG} />
          </ViewComponent>
        )}
        <SvgUri
          uri={(source as any).uri}
          width="100%"
          height="100%"
          preserveAspectRatio="xMidYMid slice"
        />
        <ViewComponent
          style={[
            commonStyles.flex1,
            { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
          ]}
        >
          {children}
        </ViewComponent>
      </ViewComponent>
    );
  }

  // ✅ Normal image case (PNG/JPG)
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
