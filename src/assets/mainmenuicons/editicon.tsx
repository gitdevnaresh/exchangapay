import React from "react";
import Svg, { Path } from "react-native-svg";
import { s } from "../../constants/theme/scale";
import { useThemeColors } from "../../hooks/useThemeColors";
import ViewComponent from "../../newComponents/view/view";


interface ProfileEditIconProps {
  width?: number;
  height?: number;
  color?: string;
  style?: any;
}

const ProfileEditIcon: React.FC<ProfileEditIconProps> = ({
  width = s(18),
  height = s(18),
  color,
  style,
}) => {
  const NEW_COLOR = useThemeColors();

  return (
    <ViewComponent style={style}>
      <Svg
        width={width}
        height={height}
        viewBox="0 0 18 18"
        fill="none"
      >
        <Path
          d="M8.52941 17H16.5294M14.1765 7.58824L17 4.76471L13.2353 1L10.4118 3.82353M14.1765 7.58824L4.76471 17H1V13.2353L10.4118 3.82353M14.1765 7.58824L10.4118 3.82353"
          stroke={color || NEW_COLOR.TEXT_WHITE}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </ViewComponent>
  );
};

export default ProfileEditIcon;
