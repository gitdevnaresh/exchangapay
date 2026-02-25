import React from "react";
import Svg, { Path } from "react-native-svg";
import ViewComponent from "../../view/view";
import { s } from "../../../constants/styels/scale";
import { useThemeColors } from "../../../hooks/themedHook/useThemeColors";

interface ProfileFeeIconImageProps {
  width?: number;
  height?: number;
  /** Stroke color for the stroked path */
  strokeColor?: string;
  /** Fill color for the filled shape */
  fillColor?: string;
  style?: any;
}

const ProfileFeeIconImage: React.FC<ProfileFeeIconImageProps> = ({
  width = s(20),
  height = s(20),
  strokeColor,
  fillColor,
  style,
}) => {
  const NEW_COLOR = useThemeColors();

  const stroke = strokeColor || NEW_COLOR.PROFILE_ICON;
  const fill = fillColor || NEW_COLOR.PROFILE_ICON;

  return (
    <ViewComponent style={style}>
      <Svg width={width} height={height} viewBox="0 0 51 51" fill="none">
        {/* Filled shape */}
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M5 7.5C5 6.1193 6.1193 5 7.5 5H22.929C23.592 5 24.2278 5.2634 24.6968 5.73223L44.6968 25.7323C45.673 26.7085 45.673 28.2915 44.6968 29.2677L29.2677 44.6968C28.2915 45.673 26.7085 45.673 25.7323 44.6968L5.73223 24.6968C5.2634 24.2278 5 23.592 5 22.929V7.5ZM7.5 0C3.35788 0 0 3.35788 0 7.5V22.929C0 24.918 0.790175 26.8258 2.1967 28.2323L22.1968 48.2323C25.1258 51.1613 29.8742 51.1613 32.8032 48.2323L48.2323 32.8032C51.1613 29.8742 51.1613 25.1258 48.2323 22.1968L28.2323 2.1967C26.8258 0.790175 24.918 0 22.929 0H7.5ZM15 20C17.7614 20 20 17.7614 20 15C20 12.2386 17.7614 10 15 10C12.2386 10 10 12.2386 10 15C10 17.7614 12.2386 20 15 20Z"
          fill={fill}
        />
        {/* Stroked path */}
        <Path
          d="M22.3104 32.1351C23.6896 33.6802 25.8514 34.0009 27.139 32.8517C28.4264 31.7023 28.3523 29.5181 26.9731 27.973C25.5939 26.4282 25.5195 24.2439 26.8071 23.0945C28.0948 21.9451 30.2566 22.2661 31.6355 23.8112M22.3104 32.1351L21.378 32.9676M22.3104 32.1351C21.3662 31.0774 21.0336 29.7204 21.3307 28.6007M31.6355 23.8112L32.5682 22.9786M31.6355 23.8112C32.4156 24.6847 32.7781 25.7627 32.7132 26.7424"
          stroke={stroke}
          strokeWidth={3.75}
          strokeLinecap="round"
        />
      </Svg>
    </ViewComponent>
  );
};

export default ProfileFeeIconImage;
