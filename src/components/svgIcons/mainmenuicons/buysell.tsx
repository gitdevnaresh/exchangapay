import React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";
import { s } from "../../../constants/styels/scale";
import ViewComponent from "../../view/view";
import { useThemeColors } from "../../../hooks/themedHook/useThemeColors";

interface SellExchangeIconProps extends SvgProps {
  width?: number;
  height?: number;
  style?: any;
  /** Fill color for the icon (defaults to original SVG color) */
  color?: string;
}

const SellExchangeIcon: React.FC<SellExchangeIconProps> = ({
  width = s(20),
  height = s(20),
  style,
  color,
  ...props
}) => {
  const NEW_COLOR = useThemeColors();
  const fillColor = color || NEW_COLOR.ACTION_SELL; // default from provided SVG

  return (
    <ViewComponent style={style}>
      <Svg
        width={width}
        height={height}
        viewBox="0 0 12 12"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M7.4754 0.488101C7.71537 0.488101 7.91012 0.682854 7.91012 0.922818C7.91012 1.16278 7.71537 1.35754 7.4754 1.35754H3.2627C1.809 1.35754 0.869435 2.35681 0.869435 3.9044V8.58892C0.869435 10.1568 1.7864 11.1306 3.2627 11.1306H8.24978C9.70347 11.1306 10.643 10.133 10.643 8.58892V4.50895C10.643 4.26898 10.8378 4.07423 11.0778 4.07423C11.3177 4.07423 11.5125 4.26898 11.5125 4.50895V8.58892C11.5125 10.6292 10.2014 12 8.24978 12H3.2627C1.31111 12 0 10.6292 0 8.58892V3.9044C0 1.86123 1.31111 0.488101 3.2627 0.488101H7.4754ZM8.70154 4.44681C8.89165 4.59404 8.92643 4.86704 8.77921 5.05658L7.08091 7.24755C7.0102 7.33913 6.90586 7.39883 6.7911 7.41275C6.67517 7.4284 6.56041 7.39478 6.46883 7.32348L4.83545 6.0402L3.36842 7.94658C3.28264 8.05787 3.15396 8.11641 3.02355 8.11641C2.93081 8.11641 2.83749 8.08685 2.75866 8.02657C2.56854 7.87992 2.53261 7.60692 2.67925 7.4168L4.41406 5.16207C4.48478 5.06991 4.58969 5.01021 4.70445 4.99572C4.82154 4.98065 4.9363 5.0131 5.02731 5.08556L6.66184 6.36942L8.09177 4.52448C8.239 4.33379 8.51142 4.29843 8.70154 4.44681ZM10.4143 0C11.2687 0 11.9631 0.694389 11.9631 1.54875C11.9631 2.40312 11.2687 3.09809 10.4143 3.09809C9.56054 3.09809 8.86557 2.40312 8.86557 1.54875C8.86557 0.694389 9.56054 0 10.4143 0ZM10.4143 0.869435C10.0399 0.869435 9.73501 1.17374 9.73501 1.54875C9.73501 1.92319 10.0399 2.22865 10.4143 2.22865C10.7888 2.22865 11.0936 1.92319 11.0936 1.54875C11.0936 1.17374 10.7888 0.869435 10.4143 0.869435Z"
          fill={fillColor}
        />
      </Svg>
    </ViewComponent>
  );
};

export default SellExchangeIcon;
