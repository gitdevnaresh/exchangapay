import React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";
import ViewComponent from "../../view/view";
import { s } from "../../../constants/styels/scale";
import { useThemeColors } from "../../../hooks/themedHook/useThemeColors";

interface CardactiveIconProps extends SvgProps {
  width?: number;
  height?: number;
  style?: any;
  color?: string; // fill color
}

const CardactiveIcon: React.FC<CardactiveIconProps> = ({
  width = s(20),
  height = s(18),
  style,
  color,
  ...props
}) => {
  const NEW_COLOR = useThemeColors();
  const fillColor = color || NEW_COLOR.BOTTOM_TABS || "#3B82F6";

  return (
    <ViewComponent style={style}>
      <Svg
        width={width}
        height={height}
        viewBox="0 0 20 18"
        fill="none"
        {...props}
      >
        <Path
          d="M13.22 2.9502H3.78C3.5 2.9502 3.24 2.9602 3 2.9702C0.63 3.1102 0 3.9802 0 6.6802V7.2602C0 7.8102 0.45 8.2602 1 8.2602H16C16.55 8.2602 17 7.8102 17 7.2602V6.6802C17 3.7002 16.24 2.9502 13.22 2.9502Z"
          fill={fillColor}
        />
        <Path
          d="M1 9.76074C0.45 9.76074 0 10.2107 0 10.7607V13.6707C0 16.6507 0.76 17.4007 3.78 17.4007H13.22C16.19 17.4007 16.97 16.6807 17 13.8307V10.7607C17 10.2107 16.55 9.76074 16 9.76074H1ZM4.96 14.9607H3.25C2.84 14.9607 2.5 14.6207 2.5 14.2107C2.5 13.8007 2.84 13.4607 3.25 13.4607H4.97C5.38 13.4607 5.72 13.8007 5.72 14.2107C5.72 14.6207 5.38 14.9607 4.96 14.9607ZM10.55 14.9607H7.11C6.7 14.9607 6.36 14.6207 6.36 14.2107C6.36 13.8007 6.7 13.4607 7.11 13.4607H10.55C10.96 13.4607 11.3 13.8007 11.3 14.2107C11.3 14.6207 10.97 14.9607 10.55 14.9607Z"
          fill={fillColor}
        />
        <Path
          d="M19.9996 9.72999V4.49C19.9996 1.36 18.2096 0 15.5096 0H6.57962C5.81962 0 5.13962 0.11 4.53962 0.34C4.06962 0.51 3.64962 0.76 3.30962 1.09C3.12962 1.26 3.26962 1.54 3.52962 1.54H14.3996C16.6496 1.54 18.4696 3.36 18.4696 5.61V12.78C18.4696 13.03 18.7396 13.17 18.9196 12.99C19.6096 12.26 19.9996 11.19 19.9996 9.72999Z"
          fill={fillColor}
        />
      </Svg>
    </ViewComponent>
  );
};

export default CardactiveIcon;
