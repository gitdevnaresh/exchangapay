import React from "react";
import Svg, { Path } from "react-native-svg";
import ViewComponent from "../../view/view";
import { s } from "../../../constants/styels/scale";
import { useThemeColors } from "../../../hooks/themedHook/useThemeColors";

interface MembershipIconProfileProps {
  width?: number;
  height?: number;
  color?: string;
  style?: any;
}

const MembershipIconProfile: React.FC<MembershipIconProfileProps> = ({
  width = s(16),
  height = s(20),
  color,
  style,
}) => {
  const NEW_COLOR = useThemeColors();
  const iconColor = color || NEW_COLOR.TEXT_WHITE;

  return (
    <ViewComponent style={style}>
      <Svg
        width={width}
        height={height}
        viewBox="0 0 19 20"
        fill="none"
      >
        <Path
          d="M12.099 6.35411V6.21505C12.099 5.87872 11.8254 5.60501 11.489 5.60501H10.6549V4.79587C11.3783 4.30606 11.8092 3.49649 11.8092 2.62305C11.8092 1.17672 10.6325 0 9.18619 0C7.73994 0 6.56329 1.17672 6.56329 2.62305C6.56329 3.49649 6.99411 4.3061 7.71751 4.79587V5.60501H6.88341C6.54708 5.60501 6.27345 5.87872 6.27345 6.21505V6.35411H0V20H18.3726V6.35411H12.099ZM9.18615 1.76336C9.66025 1.76336 10.046 2.14899 10.046 2.62301C10.046 3.09719 9.66025 3.48278 9.18615 3.48278C8.71205 3.48278 8.32634 3.09715 8.32634 2.62301C8.32634 2.14899 8.71205 1.76336 9.18615 1.76336ZM12.099 8.33845V7.70248H17.0241V18.6516H1.34821V7.70248H6.27337V8.33845H12.099Z"
          fill={iconColor}
        />
        <Path
          d="M15.1522 15.9494C15.0954 15.6364 14.8888 15.3704 14.5974 15.2367L13.4344 14.7615C13.2625 14.6825 13.1514 14.5093 13.1514 14.32V14.1486C13.1514 14.074 13.1638 14.0006 13.1791 13.9473C13.2095 13.9067 13.9246 12.9418 13.9246 12.0297C13.9246 10.9205 13.221 10.1152 12.2517 10.1152C11.2824 10.1152 10.5789 10.9204 10.5789 12.0297C10.5789 12.9418 11.294 13.9067 11.3155 13.9303C11.3398 14.0006 11.352 14.0741 11.352 14.1485V14.32C11.352 14.5093 11.241 14.6824 11.0716 14.7604L9.90364 15.2377C9.61462 15.3704 9.4081 15.6364 9.35044 15.9556L9.2854 16.795H15.2181L15.1522 15.9494Z"
          fill={iconColor}
        />
        <Path
          d="M9.2482 10.5586H3.22925V11.9391H9.2482V10.5586Z"
          fill={iconColor}
        />
        <Path
          d="M7.89527 13.0723H3.22925V14.4528H7.89527V13.0723Z"
          fill={iconColor}
        />
        <Path
          d="M7.89527 15.584H3.22925V16.9647H7.89527V15.584Z"
          fill={iconColor}
        />
      </Svg>
    </ViewComponent>
  );
};

export default MembershipIconProfile;
