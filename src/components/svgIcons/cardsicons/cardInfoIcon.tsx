import * as React from "react";
import Svg, { Circle, G, Path } from "react-native-svg";
import { s } from "../../../constants/styels/scale";
import { NEW_COLOR } from "../../../constants/styels/variables";

interface CardInfoIconSvgComponentProps {
  width?: number | string;
  height?: number | string;
  color?: string;
}

const CardInfoIcon: React.FC<CardInfoIconSvgComponentProps> = ({ width = s(24), height = s(22), color = NEW_COLOR.TEXT_WHITE }) => {
  return (
<Svg
      width={width}
      height={height}
      viewBox="0 0 24 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <Path
        d="M1 7.996h21.989"
        stroke={color}
        strokeWidth={1.5}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M11.51 19.68H5.894C1.989 19.68 1 18.712 1 14.853V5.816c0-3.497.814-4.618 3.881-4.794A27.94 27.94 0 015.893 1h12.214C22.011 1 23 1.968 23 5.827v4.848"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M18.591 21.19a4.398 4.398 0 100-8.796 4.398 4.398 0 000 8.796z"
        stroke={color}
        strokeWidth={1.3}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M18.5 18.998V16" stroke={color} strokeLinecap="round" />
      <Path d="M18.5 14a.5.5 0 110 1 .5.5 0 010-1z" fill={color}/>
      <Path
        d="M5.398 14.594h4.398"
        stroke={color}
        strokeWidth={1.5}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default CardInfoIcon;
