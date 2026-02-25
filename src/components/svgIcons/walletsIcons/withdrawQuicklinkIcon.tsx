import React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";
import ViewComponent from "../../view/view";
import { s } from "../../../constants/styels/scale";
import { NEW_COLOR } from "../../../constants/styels/variables";

interface WithdrawQuicklinkIconProps extends SvgProps {
  width?: number;
  height?: number;
  color?: string;
  style?: any;
}

const WithdrawQuicklinkIcon: React.FC<WithdrawQuicklinkIconProps> = ({ width = s(20), height = s(18), color = NEW_COLOR.PRiMARY_COLOR, style, ...props }) => {
  return (<ViewComponent style={style}>

    <Svg
      xmlns="http://www.w3.org/2000/svg"
      x="0px"
      y="0px"
      width={width}
      height={height}
      viewBox="0 0 50 50"
      xmlSpace="preserve"
      {...props}
    >
      <Path
        fill="none"
        stroke={color}
        d="M25 .5h0C38.531.5 49.5 11.469 49.5 25h0c0 13.531-10.969 24.5-24.5 24.5h0C11.469 49.5.5 38.531.5 25h0C.5 11.469 11.469.5 25 .5z"
      />
      <Path
        fill="none"
        stroke={color}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit={10}
        d="M18.585 16.834l16.333 16.333M30.566 16.834H18.585v11.982"
      />
    </Svg>
  </ViewComponent>
  );
};

export default WithdrawQuicklinkIcon;
