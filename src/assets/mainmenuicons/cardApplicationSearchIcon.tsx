import React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";
import { s } from "../../constants/theme/scale";
import { useThemeColors } from "../../hooks/useThemeColors";
import ViewComponent from "../../newComponents/view/view";


interface CardApplicationSearchIconProps extends SvgProps {
  width?: number;
  height?: number;
  color?: string;
  style?: any;
}

const CardApplicationSearchIcon: React.FC<CardApplicationSearchIconProps> = ({
  width = s(24),
  height = s(24),
  color,
  style,
  ...props
}) => {
  const NEW_COLOR = useThemeColors();
  const strokeColor = color || "#F2F2F2"; // Or NEW_COLOR.TEXT_ALWAYS_BLACK if themed

  return (
    <ViewComponent style={style}>
      <Svg
        width={width}
        height={height}
        viewBox="0 0 20 22"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        <Path
          d="M11 10H5M7 14H5M13 6H5M17 9.5V5.8C17 4.11984 17 3.27976 16.673 2.63803C16.3854 2.07354 15.9265 1.6146 15.362 1.32698C14.7202 1 13.8802 1 12.2 1H5.8C4.11984 1 3.27976 1 2.63803 1.32698C2.07354 1.6146 1.6146 2.07354 1.32698 2.63803C1 3.27976 1 4.11984 1 5.8V16.2C1 17.8802 1 18.7202 1.32698 19.362C1.6146 19.9265 2.07354 20.3854 2.63803 20.673C3.27976 21 4.11984 21 5.8 21H8.5"
          stroke={strokeColor}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M19 21L17.5 19.5"
          stroke={strokeColor}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M18.5 17C18.5 18.933 16.933 20.5 15 20.5C13.067 20.5 11.5 18.933 11.5 17C11.5 15.067 13.067 13.5 15 13.5C16.933 13.5 18.5 15.067 18.5 17Z"
          stroke={strokeColor}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </ViewComponent>
  );
};

export default CardApplicationSearchIcon;
