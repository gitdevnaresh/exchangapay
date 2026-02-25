import * as React from "react";
import Svg, { Path } from "react-native-svg";
import { s } from "../../../constants/styels/scale";
import { useThemeColors } from "../../../hooks/themedHook/useThemeColors";

interface SupportedPlatformSvgComponentProps {
  width?: number | string;
  height?: number | string;
  color?: string;
}

const SupportedPlatform: React.FC<SupportedPlatformSvgComponentProps> = ({
  width = s(17),
  height = s(17),
  color,
}) => {
  const NEW_COLOR = useThemeColors();
  const fillColor = color || NEW_COLOR.TEXT_WHITE;

  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 17 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <Path
        d="M8.50011 11.9615C10.4119 11.9615 11.9617 10.4119 11.9617 8.50028C11.9617 6.5887 10.4119 5.03906 8.50011 5.03906C6.58836 5.03906 5.03857 6.5887 5.03857 8.50028C5.03857 10.4119 6.58836 11.9615 8.50011 11.9615Z"
        stroke={fillColor}
        strokeWidth="1.2"
        strokeMiterlimit="10"
        strokeLinejoin="round"
      />
      <Path
        d="M13.9809 6.19295C14.7774 6.19295 15.4232 5.54726 15.4232 4.75077C15.4232 3.95428 14.7774 3.30859 13.9809 3.30859C13.1843 3.30859 12.5386 3.95428 12.5386 4.75077C12.5386 5.54726 13.1843 6.19295 13.9809 6.19295Z"
        stroke={fillColor}
        strokeWidth="1.2"
        strokeMiterlimit="10"
        strokeLinejoin="round"
      />
      <Path
        d="M2.44231 3.88435C3.23887 3.88435 3.88462 3.23867 3.88462 2.44218C3.88462 1.64568 3.23887 1 2.44231 1C1.64574 1 1 1.64568 1 2.44218C1 3.23867 1.64574 3.88435 2.44231 3.88435Z"
        stroke={fillColor}
        strokeWidth="1.2"
        strokeMiterlimit="10"
        strokeLinejoin="round"
      />
      <Path
        d="M3.59612 16.0015C4.39268 16.0015 5.03842 15.3559 5.03842 14.5594C5.03842 13.7629 4.39268 13.1172 3.59612 13.1172C2.79955 13.1172 2.15381 13.7629 2.15381 14.5594C2.15381 15.3559 2.79955 16.0015 3.59612 16.0015Z"
        stroke={fillColor}
        strokeWidth="1.2"
        strokeMiterlimit="10"
        strokeLinejoin="round"
      />
      <Path
        d="M14.5578 14.2672C15.3544 14.2672 16.0001 13.6215 16.0001 12.825C16.0001 12.0285 15.3544 11.3828 14.5578 11.3828C13.7612 11.3828 13.1155 12.0285 13.1155 12.825C13.1155 13.6215 13.7612 14.2672 14.5578 14.2672Z"
        stroke={fillColor}
        strokeWidth="1.2"
        strokeMiterlimit="10"
        strokeLinejoin="round"
      />
      <Path
        d="M6.36544 11.2109L4.51929 13.4607"
        stroke={fillColor}
        strokeWidth="1.2"
        strokeMiterlimit="10"
        strokeLinejoin="round"
      />
      <Path
        d="M3.48071 3.48047L6.07687 6.07639"
        stroke={fillColor}
        strokeWidth="1.2"
        strokeMiterlimit="10"
        strokeLinejoin="round"
      />
      <Path
        d="M12.8268 5.61719L11.3845 6.59787"
        stroke={fillColor}
        strokeWidth="1.2"
        strokeMiterlimit="10"
        strokeLinejoin="round"
      />
      <Path
        d="M13.4038 11.9608L11.3269 10.4609"
        stroke={fillColor}
        strokeWidth="1.2"
        strokeMiterlimit="10"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default SupportedPlatform;
