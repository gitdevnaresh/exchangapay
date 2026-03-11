import React from "react";
import Svg, { Path, SvgProps, Defs, ClipPath, Rect, G } from "react-native-svg";
import { useThemeColors } from "../../hooks/useThemeColors";
import ViewComponent from "../../newComponents/view/view";
import { s } from "../../constants/theme/scale";


interface RoundedPlusIconProps extends SvgProps {
  width?: number;
  height?: number;
  color?: string;
  style?: any;
}

const RoundedPlusIcon: React.FC<RoundedPlusIconProps> = ({
  width = s(24),
  height = s(24),
  color,
  style,
  ...props
}) => {
  const NEW_COLOR = useThemeColors();
  const strokeColor = color || "#898A8D"; // You can use NEW_COLOR.TEXT_ALWAYS_BLACK if needed

  return (
    <ViewComponent style={style}>
      <Svg
        width={width}
        height={height}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        <G clipPath="url(#clip0)">
          <Path
            d="M12 8V16M8 12H16M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
            stroke={strokeColor}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </G>
        <Defs>
          <ClipPath id="clip0">
            <Rect width="24" height="24" fill="white" />
          </ClipPath>
        </Defs>
      </Svg>
    </ViewComponent>
  );
};

export default RoundedPlusIcon;
