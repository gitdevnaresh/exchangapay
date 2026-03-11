import React from "react";
import Svg, {
  Path,
  Defs,
  LinearGradient,
  Stop,
  SvgProps,
} from "react-native-svg";
import { s } from "../../constants/theme/scale";
import ViewComponent from "../../newComponents/view/view";


interface ProfileactiveIconProps extends SvgProps {
  width?: number;
  height?: number;
  style?: any;
}

const Profileactive: React.FC<ProfileactiveIconProps> = ({
  width = s(30),
  height = s(30),
  style,
  ...props
}) => {
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
        <Path
          d="M3.84453 3.84453C2.71849 4.97056 2.71849 6.79623 3.84453 7.92226L5.43227 9.51C5.44419 9.49622 5.45669 9.48276 5.46978 9.46967L9.46978 5.46967C9.48284 5.45662 9.49625 5.44415 9.50999 5.43226L7.92226 3.84453C6.79623 2.71849 4.97056 2.71849 3.84453 3.84453Z"
          fill="url(#paint0_linear)"
        />
        <Path
          d="M10.568 6.49219C10.5561 6.50593 10.5436 6.51935 10.5305 6.5324L6.53056 10.5324C6.51747 10.5455 6.50402 10.558 6.49023 10.5699L16.0778 20.1576C17.2039 21.2836 19.0295 21.2836 20.1556 20.1576C21.2816 19.0315 21.2816 17.2059 20.1556 16.0798L10.568 6.49219Z"
          fill="url(#paint1_linear)"
        />
        <Path
          d="M16.1 2.30719C16.261 1.8976 16.8385 1.8976 16.9994 2.30719L17.4298 3.40247C17.479 3.52752 17.5776 3.62651 17.7022 3.67583L18.7934 4.1078C19.2015 4.26934 19.2015 4.849 18.7934 5.01054L17.7022 5.44252C17.5776 5.49184 17.479 5.59082 17.4298 5.71587L16.9995 6.81115C16.8385 7.22074 16.261 7.22074 16.1 6.81116L15.6697 5.71587C15.6205 5.59082 15.5219 5.49184 15.3973 5.44252L14.3061 5.01054C13.898 4.849 13.898 4.26934 14.3061 4.1078L15.3973 3.67583C15.5219 3.62651 15.6205 3.52752 15.6697 3.40247L16.1 2.30719Z"
          fill="url(#paint2_linear)"
        />
        <Path
          d="M19.9672 9.1275C20.1281 8.71792 20.7057 8.71792 20.8666 9.1275L21.0235 9.52685C21.0727 9.6519 21.1713 9.75089 21.2959 9.8002L21.6937 9.9577C22.1018 10.1192 22.1018 10.6989 21.6937 10.8604L21.2959 11.0179C21.1713 11.0672 21.0727 11.1662 21.0235 11.2912L20.8666 11.6906C20.7057 12.1002 20.1281 12.1002 19.9672 11.6906L19.8103 11.2912C19.7611 11.1662 19.6625 11.0672 19.5379 11.0179L19.14 10.8604C18.732 10.6989 18.732 10.1192 19.14 9.9577L19.5379 9.8002C19.6625 9.75089 19.7611 9.6519 19.8103 9.52685L19.9672 9.1275Z"
          fill="url(#paint3_linear)"
        />
        <Path
          d="M5.1332 15.3072C5.29414 14.8976 5.87167 14.8976 6.03261 15.3072L6.18953 15.7065C6.23867 15.8316 6.33729 15.9306 6.46188 15.9799L6.85975 16.1374C7.26783 16.2989 7.26783 16.8786 6.85975 17.0401L6.46188 17.1976C6.33729 17.2469 6.23867 17.3459 6.18953 17.471L6.03261 17.8703C5.87167 18.2799 5.29414 18.2799 5.1332 17.8703L4.97628 17.471C4.92714 17.3459 4.82852 17.2469 4.70393 17.1976L4.30606 17.0401C3.89798 16.8786 3.89798 16.2989 4.30606 16.1374L4.70393 15.9799C4.82852 15.9306 4.92714 15.8316 4.97628 15.7065L5.1332 15.3072Z"
          fill="url(#paint4_linear)"
        />
        <Defs>
          <LinearGradient
            id="paint0_linear"
            x1="3.55573"
            y1="6.255"
            x2="9.64892"
            y2="6.255"
            gradientUnits="userSpaceOnUse"
          >
            <Stop stopColor="#11998E" />
            <Stop offset="1" stopColor="#38EF7D" />
          </LinearGradient>
          <LinearGradient
            id="paint1_linear"
            x1="7.72888"
            y1="13.7471"
            x2="21.3098"
            y2="13.7471"
            gradientUnits="userSpaceOnUse"
          >
            <Stop stopColor="#11998E" />
            <Stop offset="1" stopColor="#38EF7D" />
          </LinearGradient>
          <LinearGradient
            id="paint2_linear"
            x1="14.4353"
            y1="4.55917"
            x2="19.2083"
            y2="4.55917"
            gradientUnits="userSpaceOnUse"
          >
            <Stop stopColor="#11998E" />
            <Stop offset="1" stopColor="#38EF7D" />
          </LinearGradient>
          <LinearGradient
            id="paint3_linear"
            x1="19.1042"
            y1="10.4091"
            x2="22.0673"
            y2="10.4091"
            gradientUnits="userSpaceOnUse"
          >
            <Stop stopColor="#11998E" />
            <Stop offset="1" stopColor="#38EF7D" />
          </LinearGradient>
          <LinearGradient
            id="paint4_linear"
            x1="4.27025"
            y1="16.5887"
            x2="7.23337"
            y2="16.5887"
            gradientUnits="userSpaceOnUse"
          >
            <Stop stopColor="#11998E" />
            <Stop offset="1" stopColor="#38EF7D" />
          </LinearGradient>
        </Defs>
      </Svg>
    </ViewComponent>
  );
};

export default Profileactive;
