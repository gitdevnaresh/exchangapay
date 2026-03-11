import React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";
import { useThemeColors } from "../../hooks/useThemeColors";
import { s } from "../../constants/theme/scale";
import ViewComponent from "../../newComponents/view/view";

interface DepositIconProps extends SvgProps {
  width?: number;
  height?: number;
  color?: string;
  style?: any;
}

const DepositIcon: React.FC<DepositIconProps> = ({
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
          d="M17 4V15M17 15L13 11M17 15L21 11M7 4V20M7 20L3 16M7 20L11 16"
          stroke={color || NEW_COLOR.TEXT_ALWAYS_BLACK}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </ViewComponent>
  );
};

export default DepositIcon;
