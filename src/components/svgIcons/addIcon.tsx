import * as React from "react";
import Svg, { Path } from "react-native-svg";
import { s } from "../../constants/styels/scale";
import { NEW_COLOR } from "../../constants/styels/variables";

interface AddIconSvgComponentProps {
  width?: number | string;
  height?: number | string;
  color?: string;
}

const AddIconSvgComponent: React.FC<AddIconSvgComponentProps> = ({
  width = s(24),
  height = s(24),
  color,
}) => {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
    >
      <Path
        d="M12 8V16M8 12H16M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
        stroke={color || NEW_COLOR.TEXT_PRIMARY}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default AddIconSvgComponent;
