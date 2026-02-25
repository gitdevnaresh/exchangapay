import React from "react";
import Svg, { Path, G, Defs, ClipPath, Rect } from "react-native-svg";
import ViewComponent from "../../view/view";
import { s } from "../../../constants/styels/scale";
import { useThemeColors } from "../../../hooks/themedHook/useThemeColors";

interface GraphIconImageProps {
  width?: number;
  height?: number;
  color?: string;
  style?: any;
}

const GraphIconImage: React.FC<GraphIconImageProps> = ({
  width = s(18),
  height = s(18),
  color,
  style,
}) => {
  const NEW_COLOR = useThemeColors();

  return (
    <ViewComponent style={style}>
      <Svg
        width={width}
        height={height}
        viewBox="0 0 22 12"
        fill="none"
      >
        <G clipPath="url(#clip0)">
          <Path
            d="M1 11L5.586 5.268C6.367 4.292 7.633 4.292 8.414 5.268L11.586 9.233C12.367 10.209 13.633 10.209 14.414 9.233L21 1.001M21 7.25V1H16"
            stroke={color || NEW_COLOR.TEXT_WHITE}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </G>
        <Defs>
          <ClipPath id="clip0">
            <Rect width="22" height="12" fill="white" />
          </ClipPath>
        </Defs>
      </Svg>
    </ViewComponent>
  );
};

export default GraphIconImage;
