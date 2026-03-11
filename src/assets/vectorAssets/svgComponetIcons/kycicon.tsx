import React from "react";
import Svg, { Path } from "react-native-svg";
import { useThemeColors } from "../../../hooks/useThemeColors";
import ViewComponent from "../../../newComponents/view/view";
import { s } from "../../../newComponents/theme/scale";

interface KycIconProps {
  width?: number;
  height?: number;
  color?: string;
  style?: any;
}

const KycIcon: React.FC<KycIconProps> = ({
  width = s(16),
  height = s(16),
  color,
  style,
}) => {
  const NEW_COLOR = useThemeColors();

  return (
    <ViewComponent style={style}>
      <Svg
        width={width}
        height={height}
        viewBox="0 0 16 16"
        fill="none"
      >
        <Path
          d="M3.33333 1H1V3.33333"
          stroke={color ?? NEW_COLOR.TEXT_WHITE}
          strokeWidth={1.2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M12.667 1H15.0003V3.33333"
          stroke={color ?? NEW_COLOR.TEXT_WHITE}
          strokeWidth={1.2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M3.33333 14.9993H1V12.666"
          stroke={color ?? NEW_COLOR.TEXT_WHITE}
          strokeWidth={1.2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M4 12V11.3333C4 9.4924 5.79086 8 8 8C10.2091 8 12 9.4924 12 11.3333V12"
          stroke={color ?? NEW_COLOR.TEXT_WHITE}
          strokeWidth={1.2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M8.00033 8.00065C9.28903 8.00065 10.3337 6.95602 10.3337 5.66732C10.3337 4.37866 9.28903 3.33398 8.00033 3.33398C6.71163 3.33398 5.66699 4.37866 5.66699 5.66732C5.66699 6.95602 6.71163 8.00065 8.00033 8.00065Z"
          stroke={color ?? NEW_COLOR.TEXT_WHITE}
          strokeWidth={1.2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M12.667 14.9993H15.0003V12.666"
          stroke={color ?? NEW_COLOR.TEXT_WHITE}
          strokeWidth={1.2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </ViewComponent>
  );
};

export default KycIcon;
