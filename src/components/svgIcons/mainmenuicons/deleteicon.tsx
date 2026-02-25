import React from "react";
import { SvgProps } from "react-native-svg";
import Svg, { Path } from "react-native-svg";
import ViewComponent from "../../view/view";
import { s } from "../../../constants/styels/scale";
import { NEW_COLOR } from "../../../constants/styels/variables";
import { useThemeColors } from "../../../hooks/themedHook/useThemeColors";

interface UploadDeleteIconProps extends SvgProps {
  width?: number;
  height?: number;
  color?: string;
  style?: any;
}

const UploadDeleteIcon: React.FC<UploadDeleteIconProps> = ({
  width = s(24),
  height = s(24),
  color,
  style,
  ...props
}) => {
  const NEW_COLOR = useThemeColors();
  return (
    <ViewComponent style={style}>
      <Svg
        xmlns="http://www.w3.org/2000/svg"
        width={width}
        height={height}
        viewBox="0 0 44 49"
        fill="none"
        {...props}
      >
        <Path
          d="M2 12H42"
          stroke={color || NEW_COLOR.PRIMARY_LINKICON}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M17 22V37"
          stroke={color || NEW_COLOR.PRIMARY_LINKICON}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M27 22V37"
          stroke={color || NEW_COLOR.PRIMARY_LINKICON}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M7 12H22H37V39.5C37 43.6423 33.6423 47 29.5 47H14.5C10.3579 47 7 43.6423 7 39.5V12Z"
          stroke={color || NEW_COLOR.PRIMARY_LINKICON}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M14.5 7C14.5 4.23857 16.7386 2 19.5 2H24.5C27.2615 2 29.5 4.23857 29.5 7V12H14.5V7Z"
          stroke={color || NEW_COLOR.PRIMARY_LINKICON}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </ViewComponent>
  );
};

export default UploadDeleteIcon;
