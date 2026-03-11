import React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";
import ViewComponent from "../../newComponents/view/view";
import { s } from "../../constants/theme/scale";


interface UsdCurrencyIconProps extends SvgProps {
    width?: number;
    height?: number;
    color?: string;
    style?: any;
}

const UsdCurrencyIcon: React.FC<UsdCurrencyIconProps> = ({
    width = s(24),
    height = s(24),
    color = "#F2F2F2",
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
                    d="M5.66665 9.7777C5.66665 10.6368 6.36309 11.3333 7.2222 11.3333H8.66665C9.58712 11.3333 10.3333 10.5871 10.3333 9.66659C10.3333 8.74611 9.58712 7.99992 8.66665 7.99992H7.33331C6.41284 7.99992 5.66665 7.25373 5.66665 6.33325C5.66665 5.41278 6.41284 4.66659 7.33331 4.66659H8.77776C9.63687 4.66659 10.3333 5.36303 10.3333 6.22214"
                    stroke={color}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <Path
                    d="M7.99998 3.66659V4.66659"
                    stroke={color}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <Path
                    d="M7.99998 11.3333V12.3333"
                    stroke={color}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <Path
                    d="M14.6666 7.99992C14.6666 11.6818 11.6819 14.6666 7.99998 14.6666C4.31808 14.6666 1.33331 11.6818 1.33331 7.99992C1.33331 4.31802 4.31808 1.33325 7.99998 1.33325C11.6819 1.33325 14.6666 4.31802 14.6666 7.99992Z"
                    stroke={color}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </Svg>
        </ViewComponent>
    );
};

export default UsdCurrencyIcon;
