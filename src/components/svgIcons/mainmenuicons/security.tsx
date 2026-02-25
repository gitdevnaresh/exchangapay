import React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";
import ViewComponent from "../../view/view";
import { s } from "../../../constants/styels/scale";
import { NEW_COLOR } from "../../../constants/styels/variables";

interface SecurityIconProps extends SvgProps {
  width?: number;
  height?: number;
  color?: string;
  style?: any;
}

const Security: React.FC<SecurityIconProps> = ({ width = s(24), height = s(24), color, style, ...props }) => {
  return (<ViewComponent style={style}>
    <Svg
      width={width}
      height={height}
      viewBox="0 0 18 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16.5.75h-15A1.5 1.5 0 000 2.25v5.51c0 8.402 7.108 11.189 8.531 11.662.304.104.634.104.938 0C10.894 18.95 18 16.162 18 7.761V2.25a1.5 1.5 0 00-1.5-1.5zm0 7.012c0 7.351-6.22 9.808-7.5 10.235-1.268-.423-7.5-2.877-7.5-10.235V2.25h15v5.512zM4.72 10.28a.75.75 0 111.06-1.062l1.72 1.72 4.72-4.72a.75.75 0 111.06 1.062l-5.25 5.25a.75.75 0 01-1.06 0l-2.25-2.25z"
        fill={color || NEW_COLOR.TEXT_WHITE}
      />
    </Svg>
  </ViewComponent>
  );
};

export default Security;
