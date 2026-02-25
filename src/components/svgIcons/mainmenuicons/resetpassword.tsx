import React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";
import ViewComponent from "../../view/view";
import { s } from "../../../constants/styels/scale";
import { useThemeColors } from "../../../hooks/themedHook/useThemeColors";

interface ResetPasswordIconProps extends SvgProps {
  width?: number;
  height?: number;
  color?: string; // stroke color override
  style?: any;
}

const ResetPasswordIcon: React.FC<ResetPasswordIconProps> = ({
  width = s(60),
  height = s(60),
  color,
  style,
  ...props
}) => {
  const NEW_COLOR = useThemeColors();

  return (
    <ViewComponent style={style}>
      <Svg
        xmlns="http://www.w3.org/2000/svg"
        width={width}
        height={height}
        viewBox="0 0 21 21"
        fill="none"
        {...props}
      >
        <Path
          d="M20 10.5C20 12.3789 19.4428 14.2157 18.399 15.7779C17.3551 17.3402 15.8714 18.5578 14.1355 19.2769C12.3996 19.9959 10.4895 20.184 8.64665 19.8175C6.80383 19.4509 5.11109 18.5461 3.78249 17.2175C2.45389 15.8889 1.5491 14.1962 1.18254 12.3534C0.815985 10.5105 1.00412 8.60041 1.72315 6.86451C2.44218 5.12861 3.65982 3.64491 5.22209 2.60104C6.78435 1.55717 8.62108 1 10.5 1C12.349 0.999396 14.158 1.53839 15.7052 2.55088C17.2523 3.56337 18.4704 5.00535 19.21 6.7M20 4L19.525 7.175L16.5 6.5"
          stroke={color || NEW_COLOR.TEXT_WHITE}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M8.5 9.5V8C8.5 7.46957 8.71071 6.96086 9.08579 6.58579C9.46086 6.21071 9.96957 6 10.5 6C11.0304 6 11.5391 6.21071 11.9142 6.58579C12.2893 6.96086 12.5 7.46957 12.5 8V9.5M9.75 15H11.25C12.423 15 13.01 15 13.413 14.69C13.517 14.6102 13.6102 14.517 13.69 14.413C14 14.009 14 13.423 14 12.25C14 11.077 14 10.49 13.69 10.087C13.6102 9.98295 13.517 9.88983 13.413 9.81C13.009 9.5 12.423 9.5 11.25 9.5H9.75C8.577 9.5 7.99 9.5 7.587 9.81C7.48295 9.88983 7.38983 9.98295 7.31 10.087C7 10.491 7 11.077 7 12.25C7 13.423 7 14.01 7.31 14.413C7.38983 14.517 7.48295 14.6102 7.587 14.69C7.991 15 8.577 15 9.75 15Z"
          stroke={color || NEW_COLOR.TEXT_WHITE}
          strokeWidth={1.5}
          strokeLinejoin="round"
        />
      </Svg>
    </ViewComponent>
  );
};

export default ResetPasswordIcon;
