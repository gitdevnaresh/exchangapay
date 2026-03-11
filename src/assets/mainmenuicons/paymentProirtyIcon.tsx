import React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";
import ViewComponent from "../../newComponents/view/view";
import { s } from "../../constants/theme/scale";


interface PaymentProirtyIconProps extends SvgProps {
  width?: number;
  height?: number;
  color?: string;
  style?: any;
}

const PaymentProirtyIcon: React.FC<PaymentProirtyIconProps> = ({
  width = s(20),
  height = s(20),
  color = "#898A8D",
  style,
  ...props
}) => {
  return (
    <ViewComponent style={style}>
      <Svg
        width={width}
        height={height}
        viewBox="0 0 18 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        <Path
          d="M4.83333 1.33325V14.6666M4.83333 14.6666L1.5 11.3333M4.83333 14.6666L8.16667 11.3333M13.1667 14.6666V1.33325M13.1667 1.33325L9.83333 4.66659M13.1667 1.33325L16.5 4.66659"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </ViewComponent>
  );
};

export default PaymentProirtyIcon;
