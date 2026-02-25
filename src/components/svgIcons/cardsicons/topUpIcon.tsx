import * as React from "react";
import Svg, { Circle, G, Path } from "react-native-svg";
import { s } from "../../../constants/styels/scale";
import { useThemeColors } from "../../../hooks/themedHook/useThemeColors";

interface TopUpIconSvgComponentProps {
  width?: number | string;
  height?: number | string;
  color?: string;
}
const NEW_COLOR = useThemeColors();
const TopUpIcon: React.FC<TopUpIconSvgComponentProps> = ({ width = s(18), height = s(18), color, }) => {
    const NEW_COLOR = useThemeColors();
  
  return (
    
    <Svg
    width={width}
    height={height}
    viewBox="0 0 19 19"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <G stroke={color || NEW_COLOR.BUTTON_TEXT} strokeWidth={1.5} strokeLinecap="round">
      <Path
        d="M10.35 8.65L18 1m0 0h-4.543M18 1v4.542"
        strokeLinejoin="round"
      />
      <Path d="M9.5 1a8.5 8.5 0 100 17A8.5 8.5 0 0018 9.5" />
    </G>
  </Svg>
  );
};

export default TopUpIcon;
