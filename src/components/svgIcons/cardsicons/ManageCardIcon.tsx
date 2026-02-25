import * as React from "react";
import Svg, { Circle, G, Path } from "react-native-svg";
import { s } from "../../../constants/styels/scale";
import { NEW_COLOR } from "../../../constants/styels/variables";

interface ManageCardIconSvgComponentProps {
  width?: number | string;
  height?: number | string;
  color?: string;
}

const ManageCardIcon: React.FC<ManageCardIconSvgComponentProps> = ({ width = s(24), height = s(21), color  }) => {
  return (
  <Svg
  width={width}
    height={height}
  viewBox="0 0 24 21"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
>
  <G
    stroke={color || NEW_COLOR.BUTTON_TEXT}
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <Path
      d="M1 6.5h13.75M5.4 15.3h2.2M10.35 15.3h4.4"
      strokeMiterlimit={10}
    />
    <Path d="M23 12.583v2.288c0 3.861-.979 4.829-4.884 4.829H5.884C1.979 19.7 1 18.732 1 14.871V5.829C1 1.968 1.979 1 5.884 1h8.866M20.8 7.6V1L23 3.2M20.8 1l-2.2 2.2" />
  </G>
</Svg>
  );
};

export default ManageCardIcon;
