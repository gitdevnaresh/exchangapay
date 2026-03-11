import React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";
import { useThemeColors } from "../../hooks/useThemeColors";
import { s } from "../../constants/theme/scale";
import ViewComponent from "../../newComponents/view/view";


interface DotGridIconProps extends SvgProps {
  width?: number;
  height?: number;
  color?: string;
  style?: any;
}

const DotGridIcon: React.FC<DotGridIconProps> = ({
  width = s(20),
  height = s(20),
  color,
  style,
  ...props
}) => {
  const NEW_COLOR = useThemeColors();

  const strokeColor = color || "#898A8D"; // Or: NEW_COLOR.TEXT_ALWAYS_BLACK

  return (
    <ViewComponent style={style}>
      <Svg
        width={width}
        height={height}
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        <Path
          d="M8.00004 2.99999C8.46028 2.99999 8.83337 2.6269 8.83337 2.16666C8.83337 1.70642 8.46028 1.33333 8.00004 1.33333C7.5398 1.33333 7.16671 1.70642 7.16671 2.16666C7.16671 2.6269 7.5398 2.99999 8.00004 2.99999Z"
          stroke={strokeColor}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M8.00004 8.83333C8.46028 8.83333 8.83337 8.46023 8.83337 7.99999C8.83337 7.53976 8.46028 7.16666 8.00004 7.16666C7.5398 7.16666 7.16671 7.53976 7.16671 7.99999C7.16671 8.46023 7.5398 8.83333 8.00004 8.83333Z"
          stroke={strokeColor}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M8.00004 14.6667C8.46028 14.6667 8.83337 14.2936 8.83337 13.8333C8.83337 13.3731 8.46028 13 8.00004 13C7.5398 13 7.16671 13.3731 7.16671 13.8333C7.16671 14.2936 7.5398 14.6667 8.00004 14.6667Z"
          stroke={strokeColor}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M13.8334 2.99999C14.2936 2.99999 14.6667 2.6269 14.6667 2.16666C14.6667 1.70642 14.2936 1.33333 13.8334 1.33333C13.3731 1.33333 13 1.70642 13 2.16666C13 2.6269 13.3731 2.99999 13.8334 2.99999Z"
          stroke={strokeColor}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M13.8334 8.83333C14.2936 8.83333 14.6667 8.46023 14.6667 7.99999C14.6667 7.53976 14.2936 7.16666 13.8334 7.16666C13.3731 7.16666 13 7.53976 13 7.99999C13 8.46023 13.3731 8.83333 13.8334 8.83333Z"
          stroke={strokeColor}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M13.8334 14.6667C14.2936 14.6667 14.6667 14.2936 14.6667 13.8333C14.6667 13.3731 14.2936 13 13.8334 13C13.3731 13 13 13.3731 13 13.8333C13 14.2936 13.3731 14.6667 13.8334 14.6667Z"
          stroke={strokeColor}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M2.16671 2.99999C2.62694 2.99999 3.00004 2.6269 3.00004 2.16666C3.00004 1.70642 2.62694 1.33333 2.16671 1.33333C1.70647 1.33333 1.33337 1.70642 1.33337 2.16666C1.33337 2.6269 1.70647 2.99999 2.16671 2.99999Z"
          stroke={strokeColor}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M2.16671 8.83333C2.62694 8.83333 3.00004 8.46023 3.00004 7.99999C3.00004 7.53976 2.62694 7.16666 2.16671 7.16666C1.70647 7.16666 1.33337 7.53976 1.33337 7.99999C1.33337 8.46023 1.70647 8.83333 2.16671 8.83333Z"
          stroke={strokeColor}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M2.16671 14.6667C2.62694 14.6667 3.00004 14.2936 3.00004 13.8333C3.00004 13.3731 2.62694 13 2.16671 13C1.70647 13 1.33337 13.3731 1.33337 13.8333C1.33337 14.2936 1.70647 14.6667 2.16671 14.6667Z"
          stroke={strokeColor}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </ViewComponent>
  );
};

export default DotGridIcon;
