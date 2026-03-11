import React from "react";
import Svg, { Path } from "react-native-svg";
import { useThemeColors } from "../../hooks/useThemeColors";
import ViewComponent from "../../newComponents/view/view";
import { s } from "../../newComponents/theme/scale";


interface GalleryIconProps {
  width?: number;
  height?: number;
  color?: string;
  style?: any;
}

const GalleryIcon: React.FC<GalleryIconProps> = ({
  width = s(18),
  height = s(18),
  color ,
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
          d="M17 9C17 12.771 17 14.657 15.828 15.828C14.657 17 12.771 17 9 17C5.229 17 3.343 17 2.172 15.828C1 14.657 1 12.771 1 9C1 5.229 1 3.343 2.172 2.172C3.343 0.999999 5.229 1 9 1"
         stroke={color || NEW_COLOR.TEXT_WHITE}
          strokeWidth={1.2}
          strokeLinecap="round"
        />
        <Path
          opacity={0.5}
          d="M1 9.39991L2.401 8.17391C3.13 7.53591 4.229 7.57291 4.914 8.25791L8.346 11.6899C8.896 12.2399 9.761 12.3149 10.397 11.8679L10.636 11.6999C11.551 11.0569 12.79 11.1309 13.622 11.8799L16.201 14.2009"
          stroke={color || NEW_COLOR.TEXT_WHITE}
          strokeWidth={1.5}
          strokeLinecap="round"
        />
        <Path
          d="M11.398 3.8H14.198M14.198 3.8H16.998M14.198 3.8V6.6M14.198 3.8V1"
          stroke={color || NEW_COLOR.TEXT_WHITE}
          strokeWidth={1.5}
          strokeLinecap="round"
        />
      </Svg>
    </ViewComponent>
  );
};

export default GalleryIcon;
