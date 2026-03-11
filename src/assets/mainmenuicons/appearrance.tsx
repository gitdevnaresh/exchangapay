import React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";
import ViewComponent from "../../newComponents/view/view";
import { s } from "../../constants/theme/scale";

interface AppearanceIconProps extends SvgProps {
    width?: number;
    height?: number;
    color?: string;
    style?: any;
}

const AppearanceIcon: React.FC<AppearanceIconProps> = ({
    width = s(24),
    height = s(24),
    color,
    style,
    ...props
}) => {

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
                    d="M7.99998 14.6668C11.6819 14.6668 14.6666 11.6821 14.6666 8.00016C14.6666 4.31826 11.6819 1.3335 7.99998 1.3335C4.31808 1.3335 1.33331 4.31826 1.33331 8.00016C1.33331 11.6821 4.31808 14.6668 7.99998 14.6668Z"
                    stroke={color}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <Path
                    d="M7.99998 12.3335C10.3932 12.3335 12.3333 10.3934 12.3333 8.00016C12.3333 5.60693 10.3932 3.66683 7.99998 3.66683V12.3335Z"
                    stroke={color}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </Svg>
        </ViewComponent>
    );
};

export default AppearanceIcon;
