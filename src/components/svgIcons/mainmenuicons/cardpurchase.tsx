import React from "react";
import Svg, { Path } from "react-native-svg";
import ViewComponent from "../../view/view";
import { s } from "../../../constants/styels/scale";
import { useThemeColors } from "../../../hooks/themedHook/useThemeColors";

interface CardPurchaseIconImageProps {
  width?: number;
  height?: number;
  color?: string;
  style?: any;
}

const CardPurchaseIconImage: React.FC<CardPurchaseIconImageProps> = ({
  width = s(18),
  height = s(18),
  color,
  style,
}) => {
  const NEW_COLOR = useThemeColors();

  return (
    <ViewComponent style={style}>
      <Svg
        width={width}
        height={height}
        viewBox="0 0 17 14"
        fill="none"
      >
        <Path
          d="M1 4.30128H15.5455M3.58545 12.5556H12.9593C13.8647 12.5556 14.3171 12.5556 14.6625 12.3757C14.9665 12.2176 15.2138 11.9648 15.3687 11.6542C15.5447 11.3011 15.5447 10.8388 15.5447 9.91439V3.64117C15.5447 2.71672 15.5447 2.2545 15.3687 1.90133C15.2138 1.59078 14.9665 1.338 14.6625 1.17983C14.3171 1 13.864 1 12.9593 1H3.58545C2.68 1 2.22764 1 1.88218 1.17983C1.57818 1.338 1.33091 1.59078 1.176 1.90133C1 2.2545 1 2.71672 1 3.64117V9.91439C1 10.8388 1 11.3011 1.176 11.6542C1.33091 11.9648 1.57818 12.2176 1.88218 12.3757C2.22836 12.5556 2.68073 12.5556 3.58545 12.5556Z"
          stroke={color || NEW_COLOR.TEXT_WHITE}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </ViewComponent>
  );
};

export default CardPurchaseIconImage;
