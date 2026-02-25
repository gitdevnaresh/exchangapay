import React from "react";
import Svg, { Path } from "react-native-svg";
import ViewComponent from "../../view/view";
import { s } from "../../../constants/styels/scale";
import { useThemeColors } from "../../../hooks/themedHook/useThemeColors";

interface PayeesIconImageProps {
  width?: number;
  height?: number;
  color?: string;
  style?: any;
}

const PayeesIconImage: React.FC<PayeesIconImageProps> = ({
  width = s(16),
  height = s(22),
  color,
  style,
}) => {
  const NEW_COLOR = useThemeColors();

  return (
    <ViewComponent style={style}>
      <Svg
        width={width}
        height={height}
        viewBox="0 0 20 22"
        fill="none"
      >
        <Path
          d="M19 17.6667H15.625M15.625 17.6667H12.25M15.625 17.6667V14.3333M15.625 17.6667V21M8.875 21H1C1 16.7044 4.52576 13.2222 8.875 13.2222C9.65687 13.2222 10.4121 13.3348 11.125 13.5443M13.375 5.44444C13.375 7.89904 11.3602 9.88889 8.875 9.88889C6.38972 9.88889 4.375 7.89904 4.375 5.44444C4.375 2.98984 6.38972 1 8.875 1C11.3602 1 13.375 2.98984 13.375 5.44444Z"
          stroke={color || NEW_COLOR.PROFILE_ICON}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </ViewComponent>
  );
};

export default PayeesIconImage;
