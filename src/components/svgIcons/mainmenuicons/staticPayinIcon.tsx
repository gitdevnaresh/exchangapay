import React from "react";
import Svg, { G, Mask, Path, Defs, Rect, ClipPath, SvgProps } from "react-native-svg";
import ViewComponent from "../../view/view";
import { s } from "../../../constants/styels/scale";
import { useThemeColors } from "../../../hooks/themedHook/useThemeColors";

interface CreateStaticIconProps extends SvgProps {
  width?: number;
  height?: number;
  color?: string;
  style?: any;
}

const CreateStaticIcon: React.FC<CreateStaticIconProps> = ({
  width = s(20),
  height = s(20),
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
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        <Defs>
          <ClipPath id="clip0_7482_4479">
            <Rect width="24" height="24" fill="white" />
          </ClipPath>
          <Mask
            id="mask0_7482_4479"
            style={{ maskType: "luminance" }}
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width="24"
            height="24"
          >
            <Path d="M24 0H0V24H24V0Z" fill="white" />
          </Mask>
        </Defs>
        <G clipPath="url(#clip0_7482_4479)">
          <G mask="url(#mask0_7482_4479)">
            <Path
              d="M6.73 19.7C7.55 18.82 8.8 18.89 9.52 19.85L10.53 21.2C11.34 22.27 12.65 22.27 13.46 21.2L14.47 19.85C15.19 18.89 16.44 18.82 17.26 19.7C19.04 21.6 20.49 20.97 20.49 18.31V7.04C20.5 3.01 19.56 2 15.78 2H8.22C4.44 2 3.5 3.01 3.5 7.04V18.3C3.5 20.97 4.96 21.59 6.73 19.7Z"
              stroke={color || NEW_COLOR.ACTION_ICON}
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M8.09619 11H8.10517"
              stroke={color || NEW_COLOR.ACTION_ICON}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M10.8984 11H16.3984"
              stroke={color || NEW_COLOR.ACTION_ICON}
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M8.09619 7H8.10517"
              stroke={color || NEW_COLOR.ACTION_ICON}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M10.8984 7H16.3984"
              stroke={color || NEW_COLOR.ACTION_ICON}
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </G>
        </G>
      </Svg>
    </ViewComponent>
  );
};

export default CreateStaticIcon;
