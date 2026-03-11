import * as React from "react";
import Svg, { Path } from "react-native-svg";
import { useThemeColors } from "../../hooks/useThemeColors";
import { s } from "../../constants/theme/scale";

interface BackArrowSvgComponentProps {
  width?: number | string;
  height?: number | string;
  color?: string;
}

const BackArrow: React.FC<BackArrowSvgComponentProps> = ({
  width = s(22),
  height = s(20),
  color
}) => {
  const NEW_COLOR = useThemeColors();

  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 22 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <Path
        d="M1 9.57143H21M1 9.57143L9.57143 1M1 9.57143L9.57143 18.1429"
        stroke={color || NEW_COLOR.TEXT_WHITE}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default BackArrow;
