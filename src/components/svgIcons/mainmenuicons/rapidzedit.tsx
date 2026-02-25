import React from "react";
import Svg, { Path, Mask, Rect, G } from "react-native-svg";
import ViewComponent from "../../view/view";
import { s } from "../../../constants/styels/scale";
import { useThemeColors } from "../../../hooks/themedHook/useThemeColors";

interface RapidzEditIconProps {
  width?: number;
  height?: number;
  color?: string;
  style?: any;
}

const RapidzEditIcon: React.FC<RapidzEditIconProps> = ({
  width = s(24),
  height = s(24),
  color,
  style,
}) => {
  const NEW_COLOR = useThemeColors();

  return (
    <ViewComponent style={style}>
      <Svg
        width={width}
        height={height}
        viewBox="0 0 24 24"
        fill="none"
      >
        {/* Mask for the icon */}


        {/* Group containing the paths */}
        {/* Main icon path */}
        <Path
          d="M13.2594 3.60119L5.04936 12.2912C4.73936 12.6212 4.43936 13.2712 4.37936 13.7212L4.00936 16.9612C3.87936 18.1312 4.71936 18.9312 5.87936 18.7312L9.09936 18.1812C9.54936 18.1012 10.1794 17.7712 10.4894 17.4312L18.6994 8.74119C20.1194 7.24119 20.7594 5.53119 18.5494 3.44119C16.3494 1.37119 14.6794 2.10119 13.2594 3.60119Z"
          stroke={color || NEW_COLOR.TEXT_ALWAYS_WHITE}
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Secondary path */}
        <Path
          d="M11.8906 5.05273C12.3206 7.81273 14.5606 9.92273 17.3406 10.2028"
          stroke={color || NEW_COLOR.TEXT_ALWAYS_WHITE}
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Horizontal line */}
        <Path
          d="M3 22H21"
          stroke={color || NEW_COLOR.TEXT_ALWAYS_WHITE}
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </ViewComponent>
  );
};

export default RapidzEditIcon;
