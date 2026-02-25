import * as React from "react";
import Svg, { Circle, G, Path } from "react-native-svg";
import { s } from "../../../constants/styels/scale";
import { useThemeColors } from "../../../hooks/themedHook/useThemeColors";

interface FreezeIconSvgComponentProps {
  width?: number | string;
  height?: number | string;
  color?: string;
}
const NEW_COLOR = useThemeColors();

const FreezeIcon: React.FC<FreezeIconSvgComponentProps> = ({ width = s(39), height = s(39), color, }) => {
  const NEW_COLOR = useThemeColors();
  return (
    
  <Svg
  width={width}
    height={height}
  viewBox="0 0 24 22"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
>
  <Path
    d="M23 7.6c-.04-2.477-.231-3.908-1.148-4.936a4.84 4.84 0 00-.61-.574C19.86 1 17.791 1 13.656 1h-3.303C6.218 1 4.15 1 2.77 2.089a4.84 4.84 0 00-.61.575C1 3.962 1 5.91 1 9.8c0 3.89 0 5.837 1.158 7.136.187.208.39.4.61.574 1.382 1.09 3.45 1.09 7.586 1.09h1.096M1 6.5h22M18.6 12v1.956m0 0v4.888m0-4.888l1.65-.856m-1.65.856l-1.65-.856m1.65 5.744V20.8m0-1.956l-1.65.856m1.65-.856l1.65.856M23 16.4h-1.956m0 0h-4.888m4.888 0l.856 1.65m-.856-1.65l.856-1.65m-5.744 1.65H14.2m1.956 0l-.856-1.65m.856 1.65l-.856 1.65"
    stroke={color || NEW_COLOR.TEXT_WHITE}
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
  />
</Svg>
  );
};

export default FreezeIcon;
