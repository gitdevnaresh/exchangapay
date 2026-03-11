import React from "react";
import Svg, {
  SvgProps,
  G,
  Defs,
  RadialGradient,
  Stop,
  Circle
} from "react-native-svg";
import ViewComponent from "../../newComponents/view/view";

interface SplashBgProps extends SvgProps {
  width?: number;
  height?: number;
  color?: string; // base color for the gradient
  style?: any;
}

const SplashBg: React.FC<SplashBgProps> = ({
  width = 550,
  height = 550,
  color = "#898A8D",
  style,
  ...props
}) => {
  return (
    <ViewComponent style={style}>
      <Svg
        width={width}
        height={height}
        viewBox="0 0 375 470"
        fill="none"
        {...props}
      >
        <Defs>
          {/* Radial gradient to simulate a blurred glow */}
          <RadialGradient id="blurGlow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse"
            gradientTransform="translate(40 120) rotate(90) scale(150)">
            {/* Center: solid color */}
            <Stop offset="0" stopColor={color} stopOpacity={1} />
            {/* Mid: soften */}
            <Stop offset="0.55" stopColor={color} stopOpacity={0.35} />
            {/* Edge: fade out */}
            <Stop offset="1" stopColor={color} stopOpacity={0} />
          </RadialGradient>
        </Defs>

        {/* Match original <g opacity="0.5"> */}
        <G opacity={0.5}>
          {/* Circle positioned at cx=40, cy=120, r=150 */}
          <Circle cx="40" cy="120" r="150" fill="url(#blurGlow)" />
        </G>
      </Svg>
    </ViewComponent>
  );
};

export default SplashBg;
