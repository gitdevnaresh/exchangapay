import React from "react";
import Svg, { Circle, Path, SvgProps, G } from "react-native-svg";
import { s } from "../../constants/theme/scale"; // Assuming this file provides your scaling utility
import ViewComponent from "../../newComponents/view/view";

interface VisaLogoIconProps extends SvgProps {
  width?: number;
  height?: number;
  style?: any;
}

const VisaLogoIcon: React.FC<VisaLogoIconProps> = ({
  width = s(48), // Default width set to 48
  height = s(48), // Default height set to 48
  style,
  ...props
}) => {
  return (
    <ViewComponent style={style}>
      <Svg
        width={width}
        height={height}
        viewBox="0 0 48 48" // Use the 48x48 coordinate system from the circle SVG
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        {/* 1. Draw the blue circular background */}
        <Circle cx="24" cy="24" r="24" fill="#1434CB" />

        {/* 2. Create a group to position the VISA text */}
        {/* We translate the group to center the 34x11 text inside the 48x48 circle */}
        <G x={(48 - 34) / 2} y={(48 - 11) / 2}>
          <Path
            d="M22.1454 0C19.7313 0 17.5739 1.24944 17.5739 3.55789C17.5739 5.10715 18.8843 5.81238 19.9713 6.39743C20.7418 6.8121 21.4001 7.16639 21.4001 7.71804C21.4001 8.27803 20.7574 8.77931 19.6597 8.77931C18.1019 8.77931 16.9376 8.07887 16.9376 8.07887L16.4394 10.4083C16.4394 10.4083 17.7806 11 19.5614 11C22.2008 11 24.2777 9.68921 24.2777 7.34129C24.2777 5.66045 22.8906 4.9255 21.7833 4.33881C21.0477 3.94908 20.4356 3.62476 20.4356 3.13206C20.4356 2.69339 20.9632 2.21274 22.0578 2.21274C23.2927 2.21274 24.3003 2.72214 24.3003 2.72214L24.7879 0.472263C24.7879 0.472263 23.6916 0 22.1454 0ZM0.0584558 0.169802L0 0.509406C0 0.509406 1.01563 0.695008 1.93037 1.06524C3.10817 1.48979 3.19207 1.73694 3.39043 2.50458L5.55197 10.8249H8.44952L12.9134 0.169802H10.0225L7.15419 7.41425L5.98374 1.27352C5.8764 0.570714 5.33269 0.169802 4.66716 0.169802H0.0584558ZM11.8081 10.8249L14.0759 0.169802H16.8246L14.5648 10.8249H11.8081ZM29.4511 0.169802C28.7863 0.169802 28.4341 0.525169 28.1757 1.14616L24.1369 10.8249H27.0278L27.5871 9.21177H31.1091L31.4492 10.8249H34L31.7747 0.169802H29.4511ZM30.684 7.04679L29.8271 3.04848L28.3882 7.04679H30.684Z"
            fill="white"
            fillRule="evenodd"
            clipRule="evenodd"
          />
        </G>
      </Svg>
    </ViewComponent>
  );
};

export default VisaLogoIcon;