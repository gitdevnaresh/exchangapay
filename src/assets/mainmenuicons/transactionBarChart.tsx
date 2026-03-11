import React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";
import { s } from "../../constants/theme/scale";
import { useThemeColors } from "../../hooks/useThemeColors";
import ViewComponent from "../../newComponents/view/view";


interface TransactionBarChartIconProps extends SvgProps {
  width?: number;
  height?: number;
  color?: string;
  style?: any;
}

const TransactionBarChartIcon: React.FC<TransactionBarChartIconProps> = ({
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
        width={width}
        height={height}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        <Path
          d="M21 21H6.2C5.07989 21 4.51984 21 4.09202 20.782C3.71569 20.5903 3.40973 20.2843 3.21799 19.908C3 19.4802 3 18.9201 3 17.8V3M7 10.5V17.5M11.5 5.5V17.5M16 10.5V17.5M20.5 5.5V17.5"
          stroke={color || NEW_COLOR.TEXT_ALWAYS_BLACK}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </ViewComponent>
  );
};

export default TransactionBarChartIcon;
