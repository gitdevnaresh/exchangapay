import React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";
import ViewComponent from "../../view/view";
import { s } from "../../../constants/styels/scale";
import { NEW_COLOR } from "../../../constants/styels/variables";

interface WalletsMenuIconProps extends SvgProps {
  width?: number;
  height?: number;
  color?: string;
  style?: any;
}

const WalletsMenuIcon: React.FC<WalletsMenuIconProps> = ({ width = s(20), height = s(18), color = NEW_COLOR.MENUINACTIVE, style, ...props }) => {
  return (<ViewComponent style={style}>

    <Svg
      width={width}
      height={height}
      viewBox="0 0 20 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        d="M12.732 0H1.702C.763 0 0 .763 0 1.702c0 .938.763 1.702 1.702 1.702h11.882V.853A.854.854 0 0012.732 0zM18.291 8.03V6.2a1.95 1.95 0 00-1.947-1.947H1.701A2.54 2.54 0 010 3.598V16.05a1.95 1.95 0 001.947 1.947h14.397a1.95 1.95 0 001.947-1.947v-1.789h-4.616l-1.65-3.116 1.65-3.116h4.616zm-9.146 8.12H1.64v-.853h7.505v.852z"
        fill={color}
      />
      <Path
        d="M19.566 8.887h-5.375l-1.199 2.263 1.198 2.263h5.376a.048.048 0 00.048-.048v-4.43a.048.048 0 00-.048-.048zM15.9 12.183a1.033 1.033 0 110-2.066 1.033 1.033 0 010 2.066z"
        fill={color}
      />
    </Svg>
  </ViewComponent>
  );
};

export default WalletsMenuIcon;
