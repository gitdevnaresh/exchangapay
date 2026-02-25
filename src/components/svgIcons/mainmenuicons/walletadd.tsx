import React from "react";
import Svg, { Path } from "react-native-svg";
import { SvgProps } from "react-native-svg";
import { s } from "../../../constants/styels/scale";
import { useThemeColors } from "../../../hooks/themedHook/useThemeColors";
import ViewComponent from "../../view/view";

interface WalletAddIconProps extends SvgProps {
  width?: number;
  height?: number;
  color?: string;
  style?: any;
}

const WalletAddIcon: React.FC<WalletAddIconProps> = ({
  width = s(14),
  height = s(14),
  color,
  style,
  ...props
}) => {
  const COLORS = useThemeColors();
  const strokeColor = color ?? COLORS.WHITE;

  return (
    <ViewComponent style={style}>
      <Svg
        width={width}
        height={height}
        viewBox="0 0 14 14"
        fill="none"
        {...props}
      >
        <Path
          d="M6.75 0.75V12.75M0.75 6.75H12.75"
          stroke={strokeColor}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </ViewComponent>
  );
};

export default WalletAddIcon;
