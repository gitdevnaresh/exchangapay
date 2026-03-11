import React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";
import { useThemeColors } from "../../hooks/useThemeColors";
import { s } from "../../constants/theme/scale";
import ViewComponent from "../../newComponents/view/view";

interface EditPencilIconProps extends SvgProps {
  width?: number;
  height?: number;
  color?: string;
  style?: any;
}

const EditPencilIcon: React.FC<EditPencilIconProps> = ({
  width = s(22),
  height = s(22),
  color,
  style,
  ...props
}) => {
  const NEW_COLOR = useThemeColors();

  return (
    <ViewComponent style={style}>
      <Svg
        width={width}
        height={height}
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        <Path
          d="M1.91732 12.0771C1.94795 11.8015 1.96326 11.6636 2.00497 11.5348C2.04197 11.4205 2.09425 11.3117 2.16038 11.2114C2.23493 11.0984 2.33299 11.0003 2.52911 10.8042L11.3333 2.00004C12.0697 1.26366 13.2636 1.26366 14 2.00004C14.7364 2.73642 14.7364 3.93033 14 4.66671L5.19578 13.4709C4.99966 13.667 4.9016 13.7651 4.78855 13.8396C4.68826 13.9058 4.57949 13.958 4.46519 13.995C4.33636 14.0367 4.19853 14.0521 3.92287 14.0827L1.66663 14.3334L1.91732 12.0771Z"
          stroke={color || "#898A8D"}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </ViewComponent>
  );
};

export default EditPencilIcon;
