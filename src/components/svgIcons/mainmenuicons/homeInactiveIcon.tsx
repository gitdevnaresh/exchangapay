import React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";
import ViewComponent from "../../view/view";
import { s } from "../../../constants/styels/scale";
import { useThemeColors } from "../../../hooks/themedHook/useThemeColors";

interface HomeactiveIconProps extends SvgProps {
  width?: number;
  height?: number;
  style?: any;
  color?: string; // used as fill color
}

const HomeactiveIcon: React.FC<HomeactiveIconProps> = ({
  width = s(52),
  height = s(52),
  style,
  color,
  ...props
}) => {
  const NEW_COLOR = useThemeColors();
  const fillColor = color || NEW_COLOR.TEXT_link || "#94A3BB";

  return (
    <ViewComponent style={style}>
      <Svg
        width={width}
        height={height}
        viewBox="0 0 23 24"
        fill="none"
        {...props}
      >
        <Path
          d="M8.03157 22.528V18.8587C8.03157 17.9221 8.80316 17.1628 9.75495 17.1628H13.2342C13.6913 17.1628 14.1296 17.3414 14.4528 17.6595C14.776 17.9776 14.9576 18.4089 14.9576 18.8587V22.528C14.9547 22.9174 15.1099 23.2918 15.3887 23.5682C15.6675 23.8446 16.0468 24 16.4425 24H18.8162C19.9248 24.0028 20.989 23.5714 21.7739 22.801C22.5589 22.0305 23 20.9844 23 19.8934V9.44023C23 8.55895 22.603 7.72301 21.9161 7.1576L13.8412 0.811042C12.4365 -0.301726 10.424 -0.265797 9.06126 0.896374L1.17059 7.1576C0.451212 7.70634 0.0212475 8.54476 0 9.44023V19.8827C0 22.1566 1.87315 24 4.18379 24H6.5033C7.32517 24 7.9931 23.3474 7.99906 22.5387L8.03157 22.528Z"
          fill={fillColor}
        />
      </Svg>
    </ViewComponent>
  );
};

export default HomeactiveIcon;
