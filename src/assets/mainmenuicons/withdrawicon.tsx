import React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";
import { s } from "../../constants/theme/scale";
import ViewComponent from "../../newComponents/view/view";


interface WithdrawIconProps extends SvgProps {
  width?: number;
  height?: number;
  color?: string;
  style?: any;
}

const WithdrawIcon: React.FC<WithdrawIconProps> = ({
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
          d="M7.33334 20V4M7.33334 4L3.33334 8M7.33334 4L11.3333 8M17.3333 20V9M17.3333 9L13.3333 13M17.3333 9L21.3333 13"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </ViewComponent>
  );
};

export default WithdrawIcon;
