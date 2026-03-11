import React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";
import ViewComponent from "../../../newComponents/view/view";
import { s } from "../../../constants/theme/scale";
import { NEW_COLOR } from "../../../constants/theme/variables";
import { useThemeColors } from "../../../hooks/useThemeColors";

interface AppearanceIconProps extends SvgProps {
  width?: number;
  height?: number;
  style?: any;
  fillColor?: string; // optional override for all fills
}

const AppearanceIcon: React.FC<AppearanceIconProps> = ({
  width = s(18),
  height = s(15),
  style,
  fillColor,
  ...props
}) => {
      const NEW_COLOR = useThemeColors();

  return (
    <ViewComponent style={style}>
      <Svg
        width={width}
        height={height}
        viewBox="0 0 18 15"
        fill="none"
        {...props}
      >
        <Path
          d="M0.832891 3.34151H16.8348C17.2948 3.34151 17.6677 2.96859 17.6677 2.50865C17.6677 2.0487 17.2948 1.67578 16.8348 1.67578H0.832891C0.372933 1.67578 0 2.0487 0 2.50865C0 2.96859 0.372933 3.34151 0.832891 3.34151Z"
          fill={fillColor ?? NEW_COLOR.TEXT_WHITE}
        />
        <Path
          d="M0.832891 8.32979H16.8348C17.2948 8.32979 17.6677 7.95687 17.6677 7.49693C17.6677 7.03698 17.2948 6.66406 16.8348 6.66406H0.832891C0.372933 6.66406 0 7.03698 0 7.49693C0 7.95687 0.372933 8.32979 0.832891 8.32979Z"
          fill={fillColor ?? NEW_COLOR.TEXT_WHITE}
        />
        <Path
          d="M0.832891 13.3298H16.8348C17.2948 13.3298 17.6677 12.9569 17.6677 12.4969C17.6677 12.037 17.2948 11.6641 16.8348 11.6641H0.832891C0.372933 11.6641 0 12.037 0 12.4969C0 12.9569 0.372933 13.3298 0.832891 13.3298Z"
          fill={fillColor ?? NEW_COLOR.TEXT_WHITE}
        />
        <Path
          d="M4.70006 4.99731H2.97543C2.53169 4.99731 2.17188 4.63762 2.17188 4.19378V0.803525C2.17188 0.359803 2.53157 0 2.97543 0H4.70006C5.1438 0 5.5035 0.359686 5.5035 0.803525V4.1939C5.50356 4.63762 5.14386 4.99731 4.70006 4.99731Z"
          fill={fillColor ?? NEW_COLOR.TEXT_WHITE}
        />
        <Path
          d="M14.6941 9.99731H12.9694C12.5257 9.99731 12.166 9.63762 12.166 9.1939V5.80352C12.166 5.3598 12.5257 5 12.9694 5H14.6941C15.1378 5 15.4975 5.35969 15.4975 5.80352V9.1939C15.4976 9.63762 15.1379 9.99731 14.6941 9.99731Z"
          fill={fillColor ?? NEW_COLOR.TEXT_WHITE}
        />
        <Path
          d="M11.3621 15.0011H9.63742C9.19368 15.0011 8.83398 14.6414 8.83398 14.1977V10.8073C8.83398 10.3636 9.19368 10.0039 9.63742 10.0039H11.3621C11.8058 10.0039 12.1655 10.3636 12.1655 10.8073V14.1977C12.1656 14.6413 11.8059 15.0011 11.3621 15.0011Z"
          fill={fillColor ?? NEW_COLOR.TEXT_WHITE}
        />
      </Svg>
    </ViewComponent>
  );
};

export default AppearanceIcon;
