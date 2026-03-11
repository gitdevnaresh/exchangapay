import React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";
import ViewComponent from "../../newComponents/view/view";
import { NEW_COLOR } from "../../constants/theme/variables";
import { s } from "../../constants/theme/scale";


interface ShopMenuIconProps extends SvgProps {
  width?: number;
  height?: number;
  color?: string;
  style?:any;
}

const ShopMenuIcon: React.FC<ShopMenuIconProps> = ({ width = s(20), height = s(18), color = NEW_COLOR.MENUINACTIVE,style, ...props }) => {
  return (<ViewComponent style={style}>
    
    <Svg
      width={width}
      height={height}
      viewBox="0 0 20 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        d="M19.804 14.057c-.27-.608-.782-.987-1.335-.987-.262 0-.52.087-.748.25l-4.46 3.178a.312.312 0 00-.116.194c-.079.401-.262.963-.692 1.353-.476.431-1.12.523-1.905.268a.097.097 0 01-.013-.005l-2.571-1.011c-.155-.062-.244-.272-.195-.469.038-.156.151-.263.281-.263.03 0 .059.005.089.017l2.558 1.006.011.005c.604.193 1.075.138 1.4-.155.41-.373.482-1.028.492-1.123V16.297c.048-.809-.364-1.554-.98-1.774l-.012-.005a94.52 94.52 0 00-3.118-1.226 3.121 3.121 0 00-1.036-.162c-.747 0-1.862.224-2.93 1.293L.09 18.965a.362.362 0 00-.04.423l2.401 4.014a.234.234 0 00.192.122.207.207 0 00.147-.063l3.092-3.015c.07-.068.164-.093.249-.068l4.996 1.495c.37.111.771.04 1.101-.197l6.99-4.984c.74-.52.999-1.704.586-2.635zM17.025 0H7.896c-.297 0-.537.305-.537.68v3.093c0 .375.24.68.537.68h.2v6.57c0 .374.24.679.537.679h7.653c.297 0 .537-.305.537-.68v-6.57h.2c.297 0 .537-.304.537-.68V.68C17.56.305 17.32 0 17.025 0zM13.59 6.07h-2.26c-.236 0-.43-.244-.43-.544 0-.3.194-.543.43-.543h2.26c.237 0 .43.243.43.543 0 .3-.193.543-.43.543zm2.898-2.977H8.434V1.36h8.056v1.733h-.002z"
        fill={color}
      />
    </Svg>
    </ViewComponent>
  );
};

export default ShopMenuIcon;
