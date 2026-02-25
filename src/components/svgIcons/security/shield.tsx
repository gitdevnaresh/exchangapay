import React from "react";
import Svg, { Path, Defs, ClipPath, Rect, G, SvgProps } from "react-native-svg";
import ViewComponent from "../../view/view";
import { s } from "../../../constants/styels/scale";
import { useThemeColors } from "../../../hooks/themedHook/useThemeColors";

interface ShieldIconProps extends SvgProps {
  width?: number;
  height?: number;
  style?: any;
  color?: string;
}

const ShieldIcon: React.FC<ShieldIconProps> = ({
  width = s(20),
  height = s(22),
  style,
  color,
  ...props
}) => {
  const NEW_COLOR = useThemeColors();

  return (
    <ViewComponent style={style}>
      <Svg
        width={width}
        height={height}
        viewBox="0 0 20 22"
        fill="none"
        {...props}
      >
        <G clipPath="url(#clip0)">
          <Path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10.0346 0C6.30541 2.36597 2.93651 3.4853 0.0451984 3.22069C-0.459761 13.4433 3.31196 19.4804 9.99592 22C16.4506 19.6417 20.2684 13.8644 19.9853 3.06564C16.5912 3.24342 13.2613 2.50902 10.0346 0ZM10.0306 1.2631C6.72969 3.35729 3.74752 4.34826 1.1882 4.1139C0.741373 13.1626 4.07986 18.5066 9.9961 20.7367C15.7097 18.6493 19.0895 13.5357 18.8387 3.97658C15.8342 4.13413 12.8867 3.48405 10.0306 1.2631Z"
            fill={color || NEW_COLOR.TEXT_WHITE}
          />
          <Path
            d="M3.14243 5.69447C5.11397 5.87458 7.41142 5.11134 9.95446 3.49805L10.0137 3.54334V18.468C9.98505 18.4787 9.95679 18.4897 9.92799 18.5002C5.37012 16.7822 2.7981 12.6654 3.14243 5.69447Z"
            fill={color || NEW_COLOR.SECURITY_REDICON}
          />
        </G>

        <Defs>
          <ClipPath id="clip0">
            <Rect
              width="20"
              height="22"
              fill="white"
              transform="matrix(-1 0 0 1 20 0)"
            />
          </ClipPath>
        </Defs>
      </Svg>
    </ViewComponent>
  );
};

export default ShieldIcon;
