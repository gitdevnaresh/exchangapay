import React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";
import ViewComponent from "../../view/view";
import { s } from "../../../constants/styels/scale";
import { NEW_COLOR } from "../../../constants/styels/variables";

interface HubinactiveIconProps extends SvgProps {
  width?: number;
  height?: number;
  color?: string;
  style?: any;
}

const HubinactiveIcon: React.FC<HubinactiveIconProps> = ({
  width = s(22),
  height = s(22),
  color = NEW_COLOR.MENUINACTIVE,
  style,
  ...props
}) => {
  return (
    <ViewComponent style={style}>
      <Svg
        width={width}
        height={height}
        viewBox="0 0 21 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        <Path
          d="M4.375 0.75C6.37704 0.750002 8 2.37301 8 4.375C7.99997 6.37696 6.37702 8 4.375 8C2.37298 8 0.750031 6.37697 0.75 4.375C0.75 2.37301 2.37296 0.75 4.375 0.75Z"
          stroke={color}
          strokeWidth={1.5}
        />
        <Path
          d="M4.375 12C6.37704 12 8 13.623 8 15.625C7.99997 17.627 6.37702 19.25 4.375 19.25C2.37298 19.25 0.750031 17.627 0.75 15.625C0.75 13.623 2.37296 12 4.375 12Z"
          stroke={color}
          strokeWidth={1.5}
        />
        <Path
          d="M19.7861 8H13.4639L16.625 1.67676L19.7861 8Z"
          stroke={color}
          strokeWidth={1.5}
        />
        <Path
          d="M17.25 11.875C17.25 11.7092 17.1841 11.5503 17.0669 11.4331C16.9497 11.3158 16.7908 11.25 16.625 11.25C16.4592 11.25 16.3003 11.3158 16.1831 11.4331C16.0658 11.5503 16 11.7092 16 11.875V15H12.875C12.7092 15 12.5503 15.0658 12.4331 15.183C12.3158 15.3002 12.25 15.4592 12.25 15.6249C12.25 15.7907 12.3158 15.9497 12.4331 16.0669C12.5503 16.1841 12.7092 16.2499 12.875 16.2499H16V19.3749C16 19.5407 16.0658 19.6996 16.1831 19.8168C16.3003 19.934 16.4592 19.9999 16.625 19.9999C16.7908 19.9999 16.9497 19.934 17.0669 19.8168C17.1841 19.6996 17.25 19.5407 17.25 19.3749V16.2499H20.375C20.5408 16.2499 20.6997 16.1841 20.8169 16.0669C20.9341 15.9497 21 15.7907 21 15.6249C21 15.4592 20.9341 15.3002 20.8169 15.183C20.6997 15.0658 20.5408 15 20.375 15H17.25V11.875Z"
          fill={color}
        />
      </Svg>
    </ViewComponent>
  );
};

export default HubinactiveIcon;
