import * as React from "react";
import Svg, { Circle, G, Mask, Path, Rect } from "react-native-svg";
import { s } from "../../../constants/styels/scale";
import { NEW_COLOR } from "../../../constants/styels/variables";
import { useThemeColors } from "../../../hooks/themedHook/useThemeColors";

interface CardInfoIconSvgComponentProps {
  width?: number | string;
  height?: number | string;
  color?: string;
}

const CardInfoIcon: React.FC<CardInfoIconSvgComponentProps> = ({ width = s(100), height = s(100), color , }) => {
  const NEW_COLOR = useThemeColors();
  return (
<Svg
width={width}
height={height}
viewBox="0 0 74 63"
fill="none"
xmlns="http://www.w3.org/2000/svg"
>
<Path
  d="M10.5 54.998L1.348 21.621a5 5 0 013.595-6.17L57.346 2.187a5 5 0 016.033 3.468L68.5 23.5"
  stroke={color || NEW_COLOR.TEXT_WHITE}
  strokeWidth={1.5}
/>
<Path
  d="M10.45 32.648l-5.24 1.41-2.015-7.962L14.5 23.001l19.462-4.647 30.745-7.83 2.001 7.976L47 23.5"
  stroke={color || NEW_COLOR.PRiMARY_COLOR}
  strokeWidth={1.5}
/>
<Rect
  x={10.75}
  y={23.7461}
  width={62.5}
  height={38.5}
  rx={4.25}
  stroke={color || NEW_COLOR.TEXT_WHITE}
  strokeWidth={1.5}
/>
<Path
  d="M17 31.996h49M20 37.496h37M20 42.496h37M19 53.496h13"
  stroke={color || NEW_COLOR.TEXT_WHITE}
  strokeWidth={1.5}
  strokeLinecap="round"
/>
<Mask id="a" fill="#fff">
  <Path
    fillRule="evenodd"
    clipRule="evenodd"
    d="M62.333 55.978a4 4 0 110-5.963 4 4 0 110 5.963z"
  />
</Mask>
<Path
  d="M62.333 55.978l.667-.746-.667-.596-.667.596.667.746zm0-5.963l-.667.745.667.597.667-.597-.667-.745zm-.667 5.217a2.985 2.985 0 01-2 .764v2c1.28 0 2.45-.482 3.334-1.273l-1.334-1.49zm-2 .764a3 3 0 01-3-3h-2a5 5 0 005 5v-2zm-3-3a3 3 0 013-3v-2a5 5 0 00-5 5h2zm3-3c.77 0 1.469.288 2 .764L63 49.27a4.985 4.985 0 00-3.333-1.274v2zM63 50.76a2.985 2.985 0 012-.764v-2c-1.28 0-2.45.482-3.334 1.273L63 50.76zm2-.764a3 3 0 013 3h2a5 5 0 00-5-5v2zm3 3a3 3 0 01-3 3v2a5 5 0 005-5h-2zm-3 3a2.985 2.985 0 01-2-.764l-1.334 1.49A4.986 4.986 0 0065 57.997v-2z"
  fill={color || NEW_COLOR.TEXT_WHITE}
  mask="url(#a)"
/>
</Svg>
  );
};

export default CardInfoIcon;
