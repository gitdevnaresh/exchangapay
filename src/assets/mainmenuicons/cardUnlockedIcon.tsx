import React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";
import { s } from "../../constants/theme/scale";
import { useThemeColors } from "../../hooks/useThemeColors";
import ViewComponent from "../../newComponents/view/view";


interface CardUnlokedIconProps extends SvgProps {
  width?: number;
  height?: number;
  color?: string;
  style?: any;
}

const CardUnlokedIcon: React.FC<CardUnlokedIconProps> = ({
  width = s(20),
  height = s(20),
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
        viewBox="0 0 23 18"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        <Path
          d="M16 12L21 17M21 12L16 17M21.5 6H1.5M21.5 8V4.2C21.5 3.0799 21.5 2.51984 21.282 2.09202C21.0903 1.7157 20.7843 1.40974 20.408 1.21799C19.9802 1 19.4201 1 18.3 1H4.7C3.5799 1 3.01984 1 2.59202 1.21799C2.2157 1.40973 1.90973 1.71569 1.71799 2.09202C1.5 2.51984 1.5 3.0799 1.5 4.2V11.8C1.5 12.9201 1.5 13.4802 1.71799 13.908C1.90973 14.2843 2.21569 14.5903 2.59202 14.782C3.01984 15 3.5799 15 4.7 15H11.5"
          stroke={color || NEW_COLOR.TEXT_ALWAYS_BLACK}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </ViewComponent>
  );
};

export default CardUnlokedIcon;
