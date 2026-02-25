import React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";
import ViewComponent from "../../view/view";
import { s } from "../../../constants/styels/scale";
import { useThemeColors } from "../../../hooks/themedHook/useThemeColors";

interface DeleteMembersIconProps extends SvgProps {
  width?: number;
  height?: number;
  style?: any;
  color?: string; // fill color override
}

const DeleteMembersIcon: React.FC<DeleteMembersIconProps> = ({
  width = s(60),
  height = s(60), // square by default to match the new SVG's aspect
  style,
  color,
  ...props
}) => {
  const NEW_COLOR = useThemeColors();

  return (
    <ViewComponent style={style}>
      <Svg
        width={width}
        height={height}
        viewBox="0 0 236 236"
        fill="none"
        {...props}
      >
        <Path
          d="M163.3 93.4999C160.8 93.4999 158.9 95.4999 158.9 97.8999V175.3C158.9 182.6 153 188.6 145.6 188.6H92.5C85.2 188.6 79.2 182.7 79.2 175.3V97.7999C79.2 95.2999 77.2 93.3999 74.8 93.3999C72.4 93.3999 70.4 95.3999 70.4 97.7999V175.2C70.4 187.4 80.3 197.3 92.5 197.3H145.6C157.8 197.3 167.7 187.4 167.7 175.2V97.7999C167.7 95.4999 165.7 93.4999 163.3 93.4999Z"
          fill={color || NEW_COLOR.TEXT_WHITE}
        />
        <Path
          d="M101.3 175.3V113.4C101.3 110.9 99.3 109 96.9 109C94.5 109 92.5 111 92.5 113.4V175.3C92.5 177.7 94.5 179.7 96.9 179.7C99.4 179.8 101.3 177.8 101.3 175.3Z"
          fill={color || NEW_COLOR.TEXT_WHITE}
        />
        <Path
          d="M123.5 175.3V113.4C123.5 110.9 121.5 109 119.1 109C116.6 109 114.7 111 114.7 113.4V175.3C114.7 177.7 116.7 179.7 119.1 179.7C121.5 179.8 123.5 177.8 123.5 175.3Z"
          fill={color || NEW_COLOR.TEXT_WHITE}
        />
        <Path
          d="M145.6 175.3V113.4C145.6 110.9 143.6 109 141.2 109C138.7 109 136.8 111 136.8 113.4V175.3C136.8 177.7 138.8 179.7 141.2 179.7C143.6 179.8 145.6 177.8 145.6 175.3Z"
          fill={color || NEW_COLOR.TEXT_WHITE}
        />
        <Path
          d="M166.7 56.4H131.3V51.8C131.3 44.5 125.4 38.5 118 38.5C110.7 38.5 104.7 44.4 104.7 51.8V56.4H69.3C62 56.4 56 62.3 56 69.7V78.6C56 81 58 83 60.4 83H175.4C177.9 83 179.8 81 179.8 78.6V69.7C179.9 62.3 174 56.4 166.7 56.4ZM113.6 51.8C113.6 49.4 115.6 47.4 118 47.4C120.4 47.4 122.4 49.4 122.4 51.8V56.4H113.6V51.8ZM171.1 74.1H64.9V69.7C64.9 67.3 66.9 65.3 69.3 65.3H166.6C169 65.3 171 67.3 171 69.7V74.1H171.1Z"
          fill={color || NEW_COLOR.TEXT_WHITE}
        />
        <Path
          d="M118 0C52.8 0 0 52.8 0 118C0 183.2 52.8 236 118 236C183.2 236 236 183.2 236 118C236 52.8 183.2 0 118 0ZM118 225.7C58.5 225.7 10.3 177.5 10.3 118C10.3 58.5 58.5 10.3 118 10.3C177.5 10.3 225.7 58.5 225.7 118C225.7 177.5 177.5 225.7 118 225.7Z"
          fill={color || NEW_COLOR.TEXT_WHITE}
        />
      </Svg>
    </ViewComponent>
  );
};

export default DeleteMembersIcon;
