import React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";
import { s } from "../../constants/theme/scale";
import { useThemeColors } from "../../hooks/useThemeColors";
import ViewComponent from "../../newComponents/view/view";


interface CardInactiveIconProps extends SvgProps {
  width?: number;
  height?: number;
  color?: string;
  style?: any;
}

const CardInactiveIcon: React.FC<CardInactiveIconProps> = ({
  width = s(22),
  height = s(18),
  color,
  style,
  ...props
}) => {
  const NEW_COLOR = useThemeColors();
  return (
    <ViewComponent style={style}>
      <Svg
        xmlns="http://www.w3.org/2000/svg"
        width={width}
        height={height}
        viewBox="0 0 22 18"
        fill="none"
        {...props}
      >
        <Path
          d="M5 13H9H11.5H13M1 7H6H10H21M21 9C21 5.229 21 3.343 19.828 2.172C18.656 1.001 16.771 1 13 1H9C5.229 1 3.343 1 2.172 2.172C1.001 3.344 1 5.229 1 9C1 12.771 1 14.657 2.172 15.828C3.344 16.999 5.229 17 9 17H13C16.771 17 18.657 17 19.828 15.828C20.482 15.175 20.771 14.3 20.898 13L21 9Z"
          stroke={color || NEW_COLOR.TEXT_WHITE}
          strokeWidth={1.5}
          strokeLinecap="round"
        />
      </Svg>
    </ViewComponent>
  );
};

export default CardInactiveIcon;
