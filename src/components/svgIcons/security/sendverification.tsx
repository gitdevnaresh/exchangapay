import React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";
import ViewComponent from "../../view/view";
import { s } from "../../../constants/styels/scale";
import { useThemeColors } from "../../../hooks/themedHook/useThemeColors";

interface SendVerificationProps extends SvgProps {
  width?: number;
  height?: number;
  style?: any;
  color?: string; // fill color override
}

const SendVerification: React.FC<SendVerificationProps> = ({
  width = s(24),
  height = s(24),
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
        viewBox="0 0 24 24"
        fill="none"
        {...props}
      >
        <Path
          d="M11 10V12H9V14H7V12H5.8C5.4 13.2 4.3 14 3 14C1.3 14 0 12.7 0 11C0 9.3 1.3 8 3 8C4.3 8 5.4 8.8 5.8 10H11ZM3 10C2.4 10 2 10.4 2 11C2 11.6 2.4 12 3 12C3.6 12 4 11.6 4 11C4 10.4 3.6 10 3 10ZM16 14C18.7 14 24 15.3 24 18V20H8V18C8 15.3 13.3 14 16 14ZM16 12C13.8 12 12 10.2 12 8C12 5.8 13.8 4 16 4C18.2 4 20 5.8 20 8C20 10.2 18.2 12 16 12Z"
          fill={color || NEW_COLOR.PERSON_VERIFICATION}
        />
      </Svg>
    </ViewComponent>
  );
};

export default SendVerification;
