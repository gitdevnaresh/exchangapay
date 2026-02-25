import React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";
import ViewComponent from "../../view/view";
import { s } from "../../../constants/styels/scale";
import { useThemeColors } from "../../../hooks/themedHook/useThemeColors";

interface CustomEditIconProps extends SvgProps {
  width?: number;
  height?: number;
  color?: string; // stroke color override
  style?: any;
}

const CustomEditIcon: React.FC<CustomEditIconProps> = ({
  width = s(15),
  height = s(17),
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
        viewBox="0 0 15 17"
        fill="none"
        {...props}
      >
        <Path
          d="M8.69455 2.07931L2.53702 8.59678C2.30452 8.84428 2.07952 9.33178 2.03452 9.66928L1.75702 12.0993C1.65952 12.9768 2.28952 13.5768 3.15952 13.4268L5.57452 13.0143C5.91202 12.9543 6.38454 12.7068 6.61704 12.4518L12.7745 5.93431C13.8395 4.80931 14.3195 3.52681 12.662 1.95931C11.012 0.406813 9.75955 0.954313 8.69455 2.07931Z"
          stroke={color || NEW_COLOR.arrowiconprimary}
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M7.66797 3.16797C7.99047 5.23797 9.67047 6.82047 11.7555 7.03048"
          stroke={color || NEW_COLOR.arrowiconprimary}
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M1 15.8789H14.5"
          stroke={color || NEW_COLOR.arrowiconprimary}
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </ViewComponent>
  );
};

export default CustomEditIcon;
