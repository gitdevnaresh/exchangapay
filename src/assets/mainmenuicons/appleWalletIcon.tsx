import React from "react";
import Svg, { Path, Defs, LinearGradient, Stop, G } from "react-native-svg";
import ViewComponent from "../../newComponents/view/view";
import { s } from "../../constants/theme/scale";


// The useThemeColors hook is no longer necessary as the new icon has its own specific colors.
// import { useThemeColors } from "../../../hooks/useThemeColors";

interface AppleWalletIconProps {
  width?: number;
  height?: number;
  // The 'color' prop is kept in the interface for API consistency, 
  // but it is not used in this specific multi-colored icon.
  color?: string;
  style?: any;
}

const AppleWalletIcon: React.FC<AppleWalletIconProps> = ({
  width = s(27),
  height = s(20),
  style,
  ...props
}) => {
  // const NEW_COLOR = useThemeColors(); // This is no longer used.

  return (
    <ViewComponent style={style}>
      <Svg
        width={width}
        height={height}
        viewBox="0 0 27 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        <Defs>
          <LinearGradient
            id="paint0_linear_14002_358"
            x1="13.5806"
            y1="9.40789"
            x2="13.5806"
            y2="11.3485"
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset="0.0038" stopColor="#D3D1C8" />
            <Stop offset="0.2318" stopColor="#C4C3BB" />
            <Stop offset="0.6887" stopColor="#A5A59F" />
            <Stop offset="1" stopColor="#8C8D88" />
          </LinearGradient>
        </Defs>
        <G>
          {/* Card Background */}
          <Path
            d="M26.601 2.87V19.65H0.559V2.852C0.559 1.429 1.66 0.395 3.018 0.395H24.141C25.499 0.395 26.6 1.42 26.6 2.852c0 .006 0 .012 0 .018z"
            fill="#D3D1C8"
          />
          {/* Center Stripe */}
          <Path
            d="M26.601 9.408H0.56V11.349H26.601V9.408z"
            fill="url(#paint0_linear_14002_358)"
          />
          {/* Inner Content Area - This group represents the layered colored sections from the original SVG */}
          <G>
            <Path
              d="M1.644 13.764V3.614a3.53 3.53 0 0 1 3.138-3.483h18.66c1.94 0 3.516 1.573 3.516 3.515v9.214H1.644z"
              fill="#319DCC"
            />
            <Path
              d="M1.644 15.932V5.782a3.53 3.53 0 0 1 3.137-3.484h18.66c1.94 0 3.515 1.573 3.515 3.516v9.214H1.644z"
              fill="#FDB921"
            />
            <Path
              d="M1.644 18.1V7.95a3.53 3.53 0 0 1 3.137-3.483h18.66c1.94 0 3.515 1.573 3.515 3.515v10.15H1.644z"
              fill="#71BF49"
            />
            <Path
              d="M1.644 18.1v-7.982a3.53 3.53 0 0 1 3.137-3.484h18.66c1.94 0 3.515 1.573 3.515 3.516v7.982H1.644z"
              fill="#F37163"
            />
          </G>
          {/* Bottom Decorative Element */}
          <Path
            d="M26.601 19.906H.559V10.15h6.324c.155 0 .311 0 .466.001.13.001.26.002.39.006.285.008.572.024.854.075.286.05.552.134.812.266-.055.028.695.344 1.371 1.395.488.758 1.436 1.562 2.763 1.562s2.275-.804 2.762-1.562c.642-.998 1.356-1.322 1.39-1.339.26-.132.526-.216.812-.266.282-.05.569-.067.854-.075.13-.004.26-.005.39-.006.155-.001.31-.001.465-.001H26.6v9.756z"
            fill="#D3D1C8"
          />
        </G>
      </Svg>
    </ViewComponent>
  );
};

export default AppleWalletIcon;