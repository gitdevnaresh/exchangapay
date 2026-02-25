import React from "react";
import Svg, { Path } from "react-native-svg";
import ViewComponent from "../../view/view";
import { s } from "../../../constants/styels/scale";
import { useThemeColors } from "../../../hooks/themedHook/useThemeColors";

interface LocationIconImageProps {
  width?: number;
  height?: number;
  color?: string;
  style?: any;
}

const LocationIconImage: React.FC<LocationIconImageProps> = ({
  width = s(32),
  height = s(32),
  color,
  style,
}) => {
  const NEW_COLOR = useThemeColors();

  return (
    <ViewComponent style={style}>
      <Svg
        width={width}
        height={height}
        viewBox="0 0 11 15"
        fill="none"
      >
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M5.41667 6.77083C4.66872 6.77083 4.0625 6.16462 4.0625 5.41667C4.0625 4.66872 4.66872 4.0625 5.41667 4.0625C6.16462 4.0625 6.77083 4.66872 6.77083 5.41667C6.77083 6.16462 6.16462 6.77083 5.41667 6.77083ZM5.41667 3.15972C4.17038 3.15972 3.15972 4.16993 3.15972 5.41667C3.15972 6.6634 4.17038 7.67361 5.41667 7.67361C6.66295 7.67361 7.67361 6.6634 7.67361 5.41667C7.67361 4.16993 6.66295 3.15972 5.41667 3.15972ZM5.41667 13.0903C4.66601 13.0943 0.902778 7.30392 0.902778 5.41667C0.902778 2.9241 2.92365 0.902778 5.41667 0.902778C7.90969 0.902778 9.93056 2.9241 9.93056 5.41667C9.93056 7.27865 6.15559 13.0943 5.41667 13.0903ZM5.41667 0C2.42531 0 0 2.42531 0 5.41667C0 7.68174 4.51615 14.4494 5.41667 14.4444C6.30319 14.4494 10.8333 7.65104 10.8333 5.41667C10.8333 2.42531 8.40802 0 5.41667 0Z"
          fill={color || NEW_COLOR.PROFILE_ICON}
        />
      </Svg>
    </ViewComponent>
  );
};

export default LocationIconImage;
