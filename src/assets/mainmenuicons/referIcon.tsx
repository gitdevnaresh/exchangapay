import React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";
import { s } from "../../constants/theme/scale";
import ViewComponent from "../../newComponents/view/view";

interface ReferIconProps extends SvgProps {
  width?: number;
  height?: number;
  style?: any;
  color?: string;          // 👈 add this
}

const ReferIcon: React.FC<ReferIconProps> = ({
  width = (24),
  height =(20),
  style,
  color = '#000',          // 👈 default if nothing passed
  ...props
}) => (
  <ViewComponent style={style}>
    <Svg
      width={width}
      height={height}
      viewBox="0 0 23 20"
      fill="none"
      {...props}
    >
      <Path
        d="M18.375 19L21.375 16M21.375 16L18.375 13M21.375 16H15.375M14.875 1.29076C16.3409 1.88415 17.375 3.32131 17.375 5C17.375 6.67869 16.3409 8.11585 14.875 8.70924M11.375 13H7.375C5.51123 13 4.57935 13 3.84427 13.3045C2.86415 13.7105 2.08546 14.4892 1.67948 15.4693C1.375 16.2044 1.375 17.1362 1.375 19M12.875 5C12.875 7.20914 11.0841 9 8.875 9C6.66586 9 4.875 7.20914 4.875 5C4.875 2.79086 6.66586 1 8.875 1C11.0841 1 12.875 2.79086 12.875 5Z"
        stroke={color}      // 👈 use the prop
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  </ViewComponent>
);

export default ReferIcon;
