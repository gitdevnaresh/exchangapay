import React from "react";
import Svg, { Path, Rect, SvgProps } from "react-native-svg";
import ViewComponent from "../../view/view";
import { s } from "../../../constants/styels/scale";
import { useThemeColors } from "../../../hooks/themedHook/useThemeColors";

interface HomeactiveIconProps extends SvgProps {
  width?: number;
  height?: number;
  style?: any;
  color?: string; // stroke & fill color
}

const FaceSecurityImage: React.FC<HomeactiveIconProps> = ({
  width = s(120),
  height = s(120),
  style,
  color,
  ...props
}) => {
  const NEW_COLOR = useThemeColors();
  const iconColor = color || NEW_COLOR.TEXT_link || "#3354CC";

  return (
    <ViewComponent style={style}>
      <Svg
        width={width}
        height={height}
        viewBox="0 0 103 113"
        fill="none"
        {...props}
      >
        {/* Top Right */}
        <Path
          d="M78.5488 1.5C91.2242 1.5 101.5 11.7754 101.5 24.4508V29.4104"
          stroke={iconColor}
          strokeWidth={3}
          strokeLinecap="round"
        />

        {/* Top Left */}
        <Path
          d="M24.4512 1.5C11.7758 1.5 1.50035 11.7754 1.50035 24.4508V29.4104"
          stroke={iconColor}
          strokeWidth={3}
          strokeLinecap="round"
        />

        {/* Bottom Left */}
        <Path
          d="M24.4512 111.5C11.7758 111.5 1.50035 101.225 1.50035 88.5492V83.5896"
          stroke={iconColor}
          strokeWidth={3}
          strokeLinecap="round"
        />

        {/* Bottom Right */}
        <Path
          d="M78.5488 111.5C91.2242 111.5 101.5 101.225 101.5 88.5492V83.5896"
          stroke={iconColor}
          strokeWidth={3}
          strokeLinecap="round"
        />

        {/* Left Vertical Bar */}
        <Path
          d="M24.4512 35.9725C24.4512 34.1618 25.9191 32.6938 27.7299 32.6938C29.5406 32.6938 31.0085 34.1618 31.0085 35.9725V47.4749C31.0085 49.2856 29.5406 50.7535 27.7299 50.7535C25.9191 50.7535 24.4512 49.2856 24.4512 47.4749V35.9725Z"
          fill={iconColor}
        />

        {/* Right Vertical Bar */}
        <Rect
          x="71.9922"
          y="32.6938"
          width="6.55738"
          height="18.0597"
          rx="3.27869"
          fill={iconColor}
        />

        {/* Middle Curve */}
        <Path
          d="M53.3752 35.1567C53.3752 42.0487 53.3752 44.6826 53.3752 51.5746C53.3752 53.2734 53.7566 59.4533 52.3198 60.6045C51.2272 61.4798 45.4878 61.4254 44.123 61.4254"
          stroke={iconColor}
          strokeWidth={3}
          strokeLinecap="round"
        />

        {/* Bottom Smile Curve */}
        <Path
          d="M34.2871 78.6641C35.8877 80.4128 40.0176 83.279 44.9296 85.1202C50.5058 87.2104 56.7126 86.2502 61.9663 83.4463C64.3969 82.1491 66.8396 80.5406 68.7133 78.6641"
          stroke={iconColor}
          strokeWidth={3}
          strokeLinecap="round"
        />
      </Svg>
    </ViewComponent>
  );
};

export default FaceSecurityImage;
