import React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";
import ViewComponent from "../../view/view";
import { s } from "../../../constants/styels/scale";
import { NEW_COLOR } from "../../../constants/styels/variables";
import { useThemeColors } from "../../../hooks/themedHook/useThemeColors";

interface HubActiveIconProps extends SvgProps {
  width?: number;
  height?: number;
  color?: string;
  style?: any;
}

const HubActiveIcon: React.FC<HubActiveIconProps> = ({
  width = s(24),
  height = s(24),
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
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        <Path
          d="M5 10C7.76142 10 10 7.76142 10 5C10 2.23858 7.76142 0 5 0C2.23858 0 0 2.23858 0 5C0 7.76142 2.23858 10 5 10Z"
          fill={color || NEW_COLOR.TEXT_GREEN}
        />
        <Path
          d="M5 24C7.76142 24 10 21.7614 10 19C10 16.2386 7.76142 14 5 14C2.23858 14 0 16.2386 0 19C0 21.7614 2.23858 24 5 24Z"
          fill={color || NEW_COLOR.TEXT_GREEN}
        />
        <Path
          d="M19 0L24 10H14L19 0Z"
          fill={color || NEW_COLOR.TEXT_GREEN}
        />
        <Path
          d="M19.7143 14.7143C19.7143 14.5248 19.639 14.3432 19.5051 14.2092C19.3711 14.0753 19.1894 14 19 14C18.8106 14 18.6289 14.0753 18.4949 14.2092C18.361 14.3432 18.2857 14.5248 18.2857 14.7143V18.2857H14.7143C14.5248 18.2857 14.3432 18.361 14.2092 18.4949C14.0753 18.6289 14 18.8106 14 19C14 19.1894 14.0753 19.3711 14.2092 19.5051C14.3432 19.639 14.5248 19.7143 14.7143 19.7143H18.2857V23.2857C18.2857 23.4752 18.361 23.6568 18.4949 23.7908C18.6289 23.9247 18.8106 24 19 24C19.1894 24 19.3711 23.9247 19.5051 23.7908C19.639 23.6568 19.7143 23.4752 19.7143 23.2857V19.7143H23.2857C23.4752 19.7143 23.6568 19.639 23.7908 19.5051C23.9247 19.3711 24 19.1894 24 19C24 18.8106 23.9247 18.6289 23.7908 18.4949C23.6568 18.361 23.4752 18.2857 23.2857 18.2857H19.7143V14.7143Z"
          fill={color || NEW_COLOR.TEXT_GREEN}
        />
      </Svg>
    </ViewComponent>
  );
};

export default HubActiveIcon;
