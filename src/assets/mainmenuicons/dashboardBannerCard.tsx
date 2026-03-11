import React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";
import { s } from "../../constants/theme/scale";
import ViewComponent from "../../newComponents/view/view";

interface DashboardBannerCardProps extends SvgProps {
  width?: number;
  height?: number;
  color?: string;
  style?: any;
}

const DashboardBannerCard: React.FC<DashboardBannerCardProps> = ({
  width = s(40),
  height = s(28),
  color,
  style,
  ...props
}) => {
  return (
    <ViewComponent style={style}>
      <Svg
        width={width}
        height={height}
        viewBox="0 0 42 30"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        <Path
          d="M41 11H1M19 19H9M1 7.4L1 22.6C1 24.8402 1 25.9603 1.43597 26.816C1.81947 27.5686 2.43139 28.1805 3.18404 28.564C4.03968 29 5.15979 29 7.4 29L34.6 29C36.8402 29 37.9603 29 38.816 28.564C39.5686 28.1805 40.1805 27.5686 40.564 26.816C41 25.9603 41 24.8402 41 22.6V7.4C41 5.15979 41 4.03969 40.564 3.18404C40.1805 2.43139 39.5686 1.81947 38.816 1.43598C37.9603 1 36.8402 1 34.6 1L7.4 1C5.15979 1 4.03969 1 3.18404 1.43597C2.43139 1.81947 1.81947 2.43139 1.43597 3.18404C1 4.03968 1 5.15979 1 7.4Z"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </ViewComponent>
  );
};

export default DashboardBannerCard;
