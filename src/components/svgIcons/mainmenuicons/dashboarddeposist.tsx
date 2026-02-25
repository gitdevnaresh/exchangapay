import React from "react";
import { SvgProps } from "react-native-svg";
import Svg, { Path } from "react-native-svg";
import ViewComponent from "../../view/view";
import { s } from "../../../constants/styels/scale";
import { useThemeColors } from "../../../hooks/themedHook/useThemeColors";

interface DeposistIconProps extends SvgProps {
  width?: number;
  height?: number;
  color?: string;
  style?: any;
}

const DeposistIcon: React.FC<DeposistIconProps> = ({
  width = s(24),
  height = s(24),
  color,
  style,
  ...props
}) => {
  const NEW_COLOR = useThemeColors();

  return (
    <ViewComponent style={style}>
      <Svg
        xmlns="http://www.w3.org/2000/svg"
        width={width}
        height={height}
        viewBox="0 0 24 24"
        fill="none"
        {...props}
      >
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M10.8049 9.18247L14.4619 3.24947C14.6219 2.98947 14.8719 2.99247 14.9729 3.00647C15.0739 3.02047 15.3169 3.08247 15.4049 3.37747L19.9779 18.8225C20.0579 19.0955 19.9109 19.2815 19.8449 19.3475C19.7809 19.4135 19.5979 19.5545 19.3329 19.4795L3.87694 14.9535C3.58394 14.8675 3.51994 14.6215 3.50594 14.5205C3.49194 14.4175 3.48794 14.1625 3.74694 13.9995L9.74794 10.2465L15.0499 15.6045C15.3409 15.8985 15.8159 15.9015 16.1109 15.6105C16.4059 15.3195 16.4079 14.8435 16.1169 14.5495L10.8049 9.18247ZM14.8949 1.50047C14.1989 1.50047 13.5609 1.85447 13.1849 2.46247L9.30794 8.75347L2.95194 12.7285C2.26694 13.1575 1.90894 13.9215 2.01994 14.7245C2.12994 15.5275 2.68094 16.1655 3.45494 16.3925L18.9109 20.9185C19.6219 21.1265 20.3839 20.9295 20.9079 20.4075C21.4319 19.8805 21.6269 19.1105 21.4149 18.3965L16.8419 2.95247C16.6129 2.17547 15.9729 1.62647 15.1719 1.51947C15.0779 1.50747 14.9869 1.50047 14.8949 1.50047Z"
          fill={color || NEW_COLOR.TEXT_ALWAYS_WHITE}
        />
      </Svg>
    </ViewComponent>
  );
};

export default DeposistIcon;
