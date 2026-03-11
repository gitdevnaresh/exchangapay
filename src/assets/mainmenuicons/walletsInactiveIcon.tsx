import React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";
import { s } from "../../constants/theme/scale";
import { useThemeColors } from "../../hooks/useThemeColors";
import ViewComponent from "../../newComponents/view/view";


interface WalletsInactiveIconProps extends SvgProps {
  width?: number;
  height?: number;
  color?: string;
  style?: any;
}

const WalletsInactiveIcon: React.FC<WalletsInactiveIconProps> = ({
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
        width={width}
        height={height}
        viewBox="0 0 22 18"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        <Path
          d="M5 5H9"
          stroke={color || NEW_COLOR.TEXT_WHITE}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M21 7.5C21 7.423 21 6.967 20.998 6.935C20.962 6.434 20.533 6.035 19.993 6.002C19.959 6 19.918 6 19.834 6H17.232C15.446 6 14 7.343 14 9C14 10.657 15.447 12 17.23 12H19.833C19.917 12 19.958 12 19.993 11.998C20.533 11.965 20.963 11.566 20.998 11.065C21 11.033 21 10.577 21 10.5"
          stroke={color || NEW_COLOR.TEXT_WHITE}
          strokeWidth={1.5}
          strokeLinecap="round"
        />
        <Path
          d="M17 10C17.5523 10 18 9.55228 18 9C18 8.44772 17.5523 8 17 8C16.4477 8 16 8.44772 16 9C16 9.55228 16.4477 10 17 10Z"
          fill={color || NEW_COLOR.TEXT_WHITE}
        />
        <Path
          d="M19.965 6C19.888 4.128 19.637 2.98 18.828 2.172C17.657 1 15.771 1 12 1H8C4.886 1.01 3.235 1.108 2.172 2.172C1 3.343 1 5.229 1 9C1 12.771 1 14.657 2.172 15.828C2.825 16.482 3.7 16.771 5 16.898L9 17H12C15.771 17 17.657 17 18.828 15.828C19.637 15.02 19.888 13.872 19.965 12"
          stroke={color || NEW_COLOR.TEXT_WHITE}
          strokeWidth={1.5}
          strokeLinecap="round"
        />
      </Svg>
    </ViewComponent>
  );
};

export default WalletsInactiveIcon;
