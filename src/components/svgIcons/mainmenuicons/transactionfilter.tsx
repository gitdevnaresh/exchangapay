import React from "react";
import Svg, { Path } from "react-native-svg";
import ViewComponent from "../../view/view";
import { s } from "../../../constants/styels/scale";
import { NEW_COLOR } from "../../../constants/styels/variables";
import { useThemeColors } from "../../../hooks/themedHook/useThemeColors";

interface FilterIconImageProps {
  width?: number;
  height?: number;
  color?: string;
  style?: any;
}

const FilterIconImage: React.FC<FilterIconImageProps> = ({
  width = s(23),
  height = s(20),
  color,
  style,
}) => {
  const THEME_COLOR = useThemeColors();

  return (
    <ViewComponent style={style}>
      <Svg
        width={width}
        height={height}
        viewBox="0 0 23 20"
        fill="none"
      >
        <Path
          d="M21.4 3.25H19.1333M21.4 10H15.7333M21.4 16.75H15.7333M5.53333 19V11.7564C5.53333 11.5224 5.53333 11.4054 5.51019 11.2934C5.48967 11.1942 5.45571 11.0981 5.40926 11.0078C5.35688 10.9061 5.28325 10.8147 5.13598 10.6319L1.39736 5.99304C1.25008 5.81031 1.17645 5.71894 1.12408 5.61719C1.07762 5.52692 1.04367 5.43083 1.02314 5.33154C1 5.21963 1 5.10262 1 4.86859V2.8C1 2.16994 1 1.85491 1.12352 1.61426C1.23219 1.40258 1.40556 1.23048 1.61881 1.12261C1.86124 1 2.17861 1 2.81333 1H12.7867C13.4214 1 13.7388 1 13.9812 1.12261C14.1945 1.23048 14.3678 1.40258 14.4765 1.61426C14.6 1.85491 14.6 2.16994 14.6 2.8V4.86859C14.6 5.10262 14.6 5.21963 14.5769 5.33154C14.5564 5.43083 14.5224 5.52692 14.4759 5.61719C14.4235 5.71894 14.3499 5.81031 14.2027 5.99304L10.464 10.6319C10.3168 10.8147 10.2431 10.9061 10.1908 11.0078C10.1443 11.0981 10.1103 11.1942 10.0898 11.2934C10.0667 11.4054 10.0667 11.5224 10.0667 11.7564V15.625L5.53333 19Z"
          stroke={color || THEME_COLOR.TEXT_WHITE}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </ViewComponent>
  );
};

export default FilterIconImage;
