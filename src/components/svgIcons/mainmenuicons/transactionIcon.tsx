import React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";
import ViewComponent from "../../view/view";
import { s } from "../../../constants/styels/scale";
import { useThemeColors } from "../../../hooks/themedHook/useThemeColors";

interface TransactionIconProps extends SvgProps {
  width?: number;
  height?: number;
  color?: string;
  style?: any;
}

const TransactionIcon: React.FC<TransactionIconProps> = ({
  width = s(15),
  height = s(15),
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
        viewBox="0 0 15 15"
        fill="none"
        {...props}
      >
        <Path
          d="M1 10.75H13.9998M1 10.75L4.24996 7.5M1 10.75L4.24996 14.0001"
          stroke={color || NEW_COLOR.PROFILE_ICON}
          strokeWidth={1.2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M14 4.25004H1.00016M14 4.25004L10.75 1M14 4.25004L10.75 7.50009"
          stroke={color || NEW_COLOR.PROFILE_ICON}
          strokeWidth={1.2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </ViewComponent>
  );
};

export default TransactionIcon;
