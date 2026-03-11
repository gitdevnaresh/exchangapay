import React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";
import { s } from "../../constants/theme/scale";
import ViewComponent from "../../newComponents/view/view";


interface SendIconProps extends SvgProps {
  width?: number;
  height?: number;
  color?: string;
  style?: any;
}

const SendIcon: React.FC<SendIconProps> = ({
  width = s(25),
  height = s(24),
  color,
  style,
  ...props
}) => {

  return (
    <ViewComponent style={style}>
      <Svg
        width={width}
        height={height}
        viewBox="0 0 25 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        <Path
          d="M20.6667 17H4.66667M4.66667 17L8.66667 13M4.66667 17L8.66667 21M4.66667 7H20.6667M20.6667 7L16.6667 3M20.6667 7L16.6667 11"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </ViewComponent>
  );
};

export default SendIcon;
