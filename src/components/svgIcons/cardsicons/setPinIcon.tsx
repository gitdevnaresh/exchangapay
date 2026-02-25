import * as React from "react";
import Svg, { Path } from "react-native-svg";
import { s } from "../../../constants/styels/scale";
import { useThemeColors } from "../../../hooks/themedHook/useThemeColors";

interface SetPinIconComponentProps {
  width?: number | string;
  height?: number | string;
  color?: string;
}

const SetPinIcon: React.FC<SetPinIconComponentProps> = ({
  width = s(17),
  height = s(17),
  color,
}) => {
  const NEW_COLOR = useThemeColors();
  const fillColor = color || NEW_COLOR.TEXT_WHITE;

  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 24 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <Path
        d="M12 7.6V12m-1.906-3.3l3.81 2.2m0-2.2l-3.81 2.2M6.205 7.6V12M4.3 8.7l3.81 2.2m0-2.2L4.3 10.9M17.795 7.6V12M15.89 8.7l3.81 2.2m0-2.2l-3.81 2.2"
        stroke={fillColor}
        strokeLinecap="round"
      />
      <Path
        d="M23 9.8c0 4.148 0 6.223-1.289 7.511C20.423 18.6 18.348 18.6 14.2 18.6H9.8c-4.148 0-6.223 0-7.511-1.289C1 16.023 1 13.948 1 9.8s0-6.223 1.289-7.511C3.577 1 5.652 1 9.8 1h4.4c4.148 0 6.223 0 7.511 1.289.719.718 1.037 1.68 1.177 3.111"
        stroke={fillColor}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </Svg>
  );
};

export default SetPinIcon;
