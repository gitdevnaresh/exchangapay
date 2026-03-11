import React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";
import ViewComponent from "../../newComponents/view/view";


interface ProfileArrowIconProps extends SvgProps {
  width?: number;
  height?: number;
  color?: string;
  style?: any;
}

const ProfileArrow: React.FC<ProfileArrowIconProps> = ({ width = s(30), height = s(30), color = NEW_COLOR.MENUINACTIVE, style, ...props }) => {
  return (<ViewComponent style={style}>
    <Svg
      width={width}
      height={height}
      viewBox="0 0 9 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        d="M1 1l7 7M1 15l7-7"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  </ViewComponent>
  );
};

export default ProfileArrow;
