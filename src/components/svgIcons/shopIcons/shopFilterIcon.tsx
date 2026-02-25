import React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";
import ViewComponent from "../../view/view";
import { s } from "../../../constants/styels/scale";
import { NEW_COLOR } from "../../../constants/styels/variables";

interface ShopFilterIconProps extends SvgProps {
  width?: number;
  height?: number;
  color?: string;
  style?: any;
}

const ShopFilterIcon: React.FC<ShopFilterIconProps> = ({ width = s(18), height = s(18), color = NEW_COLOR.PRiMARY_COLOR, style, ...props }) => {
  return (<ViewComponent style={style}>

    <Svg
      width={width}
      height={height}
      viewBox="0 0 17 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        d="M7.457.69v6.07a.69.69 0 01-.687.69H.687a.68.68 0 01-.485-.204L.19 7.233M7.457.69A.693.693 0 006.77 0m.688.69h-.4s0 0 0 0m.4 0h-.4v0M6.77 0H.687M6.77 0v.4h0m0-.4L6.77.4s0 0 0 0M.687 0A.689.689 0 000 .69M.687 0l.002.4H.688M.687 0v.4h.001M0 .69v6.07M0 .69h.4v0m-.4 0h.4s0 0 0 0M0 6.76c0 .176.068.346.189.473M0 6.76h.4m-.4 0h.4m-.211.473l.29-.275-.003-.003m-.287.278l.283-.282.004.004m0 0A.287.287 0 01.4 6.76m.076.195l.01.009.001.002h0a.281.281 0 00.2.083H6.77a.286.286 0 00.288-.289V.69M.4 6.76V.69m6.657 0A.293.293 0 006.77.4m0 0H.688m0 0A.289.289 0 00.4.69m7.057 9.288v6.075a.69.69 0 01-.687.69H.687a.686.686 0 01-.687-.69V9.979m7.457 0a.693.693 0 00-.687-.69m.688.69h-.4v0m.4 0l-.4.001s0 0 0 0m-.288-.691H.687m6.083 0l-.001.4s0 0 0 0m.001-.4v.4h0m-6.083-.4a.689.689 0 00-.687.69m.687-.69v.4h.001m-.001-.4l.002.4s0 0 0 0M0 9.978l.4.001s0 0 0 0m-.4 0h.4v0m0 0a.293.293 0 01.288-.291m-.288.29v6.075c0 .078.03.151.085.206a.286.286 0 00.202.084H6.771a.282.282 0 00.265-.178.29.29 0 00.022-.11V9.978m-6.37-.291H6.77m0 0a.289.289 0 01.288.29M9.873.487h0L9.88.48A.283.283 0 0110.075.4h6.083a.289.289 0 01.288.29V6.76c0 .077-.032.15-.086.205a.289.289 0 01-.202.085h-6.082a.289.289 0 01-.288-.29V.689a.29.29 0 01.079-.198l.005-.005z"
        stroke={color}
        strokeWidth={0.8}
      />
      <Path
        strokeWidth={0.4}
        d="M16.888 16.326l-1.483-1.473a3.602 3.602 0 00-2.906-5.852 3.596 3.596 0 00-3.498 3.501 3.602 3.602 0 003.302 3.687 3.596 3.596 0 002.546-.78l1.471 1.473a.4.4 0 00.568 0 .4.4 0 000-.556zm-4.282-.917a2.797 2.797 0 01-2.744-3.346 2.801 2.801 0 012.198-2.2 2.796 2.796 0 013.345 2.746 2.802 2.802 0 01-2.799 2.8z"
        stroke={color}
      />
    </Svg>
  </ViewComponent>
  );
};

export default ShopFilterIcon;
