import React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";
import ViewComponent from "../../view/view";
import { s } from "../../../constants/styels/scale";
import { useThemeColors } from "../../../hooks/themedHook/useThemeColors";

interface LanguageIconProps extends SvgProps {
  width?: number;
  height?: number;
  color?: string;
  style?: any;
}

const LanguageIcon: React.FC<LanguageIconProps> = ({
  width = s(18),
  height = s(17),
  color,
  style,
  ...props
}) => {
  const NEW_COLOR = useThemeColors();

  return (
    <ViewComponent style={style}>
      <Svg
        width={width}
        height={height}
        viewBox="0 0 18 17"
        fill="none"
        {...props}
      >
        <Path
          d="M16.2581 0H6.96774V2.90323H8.12903V1.16129H16.2581C16.6064 1.16129 16.8387 1.39355 16.8387 1.74194V8.12903C16.8387 8.47742 16.6064 8.70968 16.2581 8.70968H8.70968V12.7742H5.63226L3.48387 14.4581V12.7742H1.74194C1.39355 12.7742 1.16129 12.5419 1.16129 12.1935V5.80645C1.16129 5.45806 1.39355 5.22581 1.74194 5.22581H9.29032V4.06452H1.74194C0.754839 4.06452 0 4.81935 0 5.80645V12.1935C0 13.1806 0.754839 13.9355 1.74194 13.9355H2.32258V16.8968L5.98064 13.9355H9.87097V9.87097H16.2581C17.2452 9.87097 18 9.11613 18 8.12903V1.74194C18 0.754839 17.2452 0 16.2581 0Z"
          fill={color || NEW_COLOR.TEXT_WHITE}
        />
        <Path
          d="M2.43848 11.5584H3.83203L4.18041 10.6293H5.98041L6.3288 11.5584H7.72235L5.74815 6.39062H4.35461L2.43848 11.5584ZM5.05138 7.84224L5.63202 9.64224H4.47073L5.05138 7.84224Z"
          fill={color || NEW_COLOR.TEXT_WHITE}
        />
        <Path
          d="M10.4512 8.12147C11.0899 8.12147 11.9608 7.94728 12.7738 7.54083C13.5867 7.94728 14.5157 8.12147 15.0963 8.12147V6.96018C15.0963 6.96018 14.5157 6.96018 13.877 6.72792C14.5738 6.03115 15.0963 4.98599 15.0963 3.47631V2.89567H13.3544V1.73438H12.1931V2.89567H10.4512V4.05696H13.877C13.7608 5.10212 13.2963 5.74083 12.7738 6.14728C12.4254 5.85695 12.077 5.4505 11.8447 4.92792H10.6254C10.8576 5.68276 11.206 6.26341 11.6705 6.72792C11.0899 6.96018 10.5673 6.96018 10.4512 6.96018V8.12147Z"
          fill={color || NEW_COLOR.TEXT_WHITE}
        />
      </Svg>
    </ViewComponent>
  );
};

export default LanguageIcon;
