import React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";
import { s } from "../../constants/theme/scale";
import { useThemeColors } from "../../hooks/useThemeColors";
import ViewComponent from "../../newComponents/view/view";

interface CardIconProps extends SvgProps {
  width?: number;
  height?: number;
  color?: string;
  style?: any;
}

const CardIcon: React.FC<CardIconProps> = ({
  width = (24),
  height = (24),
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
        viewBox="0 0 69 50"
        fill="none"
        {...props}
      >
        <Path
          d="M66.4 18.4H2.40001M31.2 31.2H15.2M2.40001 12.64L2.40001 36.96C2.40001 40.5443 2.40001 42.3365 3.09757 43.7055C3.71116 44.9098 4.69023 45.8888 5.89447 46.5024C7.2635 47.2 9.05567 47.2 12.64 47.2L56.16 47.2C59.7444 47.2 61.5365 47.2 62.9056 46.5024C64.1098 45.8888 65.0889 44.9098 65.7025 43.7055C66.4 42.3365 66.4 40.5443 66.4 36.96V12.64C66.4 9.05566 66.4 7.26349 65.7025 5.89446C65.0889 4.69022 64.1098 3.71115 62.9056 3.09756C61.5365 2.4 59.7444 2.4 56.16 2.4L12.64 2.39999C9.05568 2.39999 7.26351 2.39999 5.89447 3.09755C4.69023 3.71114 3.71116 4.69022 3.09757 5.89445C2.40001 7.26349 2.40001 9.05566 2.40001 12.64Z"
          stroke={color || NEW_COLOR.TEXT_WHITE}
          strokeWidth={4.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </ViewComponent>
  );
};

export default CardIcon;