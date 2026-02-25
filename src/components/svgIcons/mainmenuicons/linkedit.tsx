import React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";
import ViewComponent from "../../view/view";
import { s } from "../../../constants/styels/scale";
import { useThemeColors } from "../../../hooks/themedHook/useThemeColors";

interface CustomeditLinkProps extends SvgProps {
  width?: number;
  height?: number;
  style?: any;
  color?: string; // stroke color override
}

const CustomeditLink: React.FC<CustomeditLinkProps> = ({
  width = s(24),
  height = s(24),
  style,
  color,
  ...props
}) => {
  const NEW_COLOR = useThemeColors();
  const strokeColor = NEW_COLOR?.TEXT_PRIMARY;

  return (
    <ViewComponent style={style}>
      <Svg
        width={width}
        height={height}
        viewBox="0 0 15 17"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        <Path
          d="M8.69357 2.07931L2.53605 8.59678C2.30355 8.84428 2.07855 9.33178 2.03355 9.66928L1.75605 12.0993C1.65855 12.9768 2.28855 13.5768 3.15855 13.4268L5.57355 13.0143C5.91105 12.9543 6.38357 12.7068 6.61607 12.4518L12.7736 5.93431C13.8386 4.80931 14.3186 3.52681 12.6611 1.95931C11.0111 0.406813 9.75857 0.954313 8.69357 2.07931Z"
          stroke={strokeColor}
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M7.66797 3.16797C7.99047 5.23797 9.67047 6.82047 11.7555 7.03048"
          stroke={strokeColor}
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M1 15.8789H14.5"
          stroke={strokeColor}
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </ViewComponent>
  );
};

export default CustomeditLink;
