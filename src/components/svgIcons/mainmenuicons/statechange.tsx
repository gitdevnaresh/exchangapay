import React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";
import ViewComponent from "../../view/view";
import { s } from "../../../constants/styels/scale";
import { useThemeColors } from "../../../hooks/themedHook/useThemeColors";

interface StateChanageIconProps extends SvgProps {
  width?: number;
  height?: number;
  style?: any;
  color?: string;
}

const StateChanageIcon: React.FC<StateChanageIconProps> = ({
  width = s(22),
  height = s(20),
  style,
  color,
  ...props
}) => {
  const NEW_COLOR = useThemeColors();

  return (
    <ViewComponent style={style}>
      <Svg
        width={width}
        height={height}
        viewBox="0 0 22 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        <Path
          d="M1 8V6C1 2.5 3 1 6 1H16C19 1 21 2.5 21 6V12C21 15.5 19 17 16 17H11"
          stroke={color || NEW_COLOR.TEXT_PRIMARY}
          strokeWidth={1.5}
          strokeMiterlimit={10}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M11 11.5C12.3807 11.5 13.5 10.3807 13.5 9C13.5 7.6193 12.3807 6.5 11 6.5C9.6193 6.5 8.5 7.6193 8.5 9C8.5 10.3807 9.6193 11.5 11 11.5Z"
          stroke={color || NEW_COLOR.TEXT_PRIMARY}
          strokeWidth={1.5}
          strokeMiterlimit={10}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M17.5 6.5V11.5"
          stroke={color || NEW_COLOR.TEXT_PRIMARY}
          strokeWidth={1.5}
          strokeMiterlimit={10}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M1 12.5H6.34003C6.98003 12.5 7.5 13.02 7.5 13.66V14.94"
          stroke={color || NEW_COLOR.TEXT_PRIMARY}
          strokeWidth={1.5}
          strokeMiterlimit={10}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M2.21997 11.2812L1 12.5012L2.21997 13.7211"
          stroke={color || NEW_COLOR.TEXT_PRIMARY}
          strokeWidth={1.5}
          strokeMiterlimit={10}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M7.5 17.7798H2.15997C1.51997 17.7798 1 17.2598 1 16.6198V15.3398"
          stroke={color || NEW_COLOR.TEXT_PRIMARY}
          strokeWidth={1.5}
          strokeMiterlimit={10}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M6.28125 18.9986L7.50122 17.7787L6.28125 16.5586"
          stroke={color || NEW_COLOR.TEXT_PRIMARY}
          strokeWidth={1.5}
          strokeMiterlimit={10}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </ViewComponent>
  );
};

export default StateChanageIcon;
