import React from "react";
import { SvgProps } from "react-native-svg";
import Svg, { Path } from "react-native-svg";
import { useThemeColors } from "../../hooks/useThemeColors";
import ViewComponent from "../../newComponents/view/view";
import { s } from "../../constants/theme/scale";


interface CameraIconProps extends SvgProps {
    width?: number;
    height?: number;
    color?: string;
    style?: any;
}

const CameraIcon: React.FC<CameraIconProps> = ({

    width = s(24),
    height = s(24),
    color ,
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
                viewBox="0 0 51 46"
                fill="none"
                {...props}
            >
                <Path
                    d="M25.5 33C29.6423 33 33 29.6423 33 25.5C33 21.3577 29.6423 18 25.5 18C21.3577 18 18 21.3577 18 25.5C18 29.6423 21.3577 33 25.5 33Z"
                    stroke={color || NEW_COLOR.TEXT_WHITE}
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <Path
                    d="M3 35V16C3 13.1997 3 11.7996 3.54497 10.7301C4.02432 9.78923 4.78923 9.02432 5.73005 8.54497C6.7996 8 8.19975 8 11 8H13.6366C13.944 8 14.0976 8 14.2394 7.98375C14.9791 7.89903 15.6426 7.48898 16.0492 6.86523C16.1272 6.74568 16.1959 6.6082 16.3333 6.33333C16.6082 5.78355 16.7457 5.50865 16.9016 5.26955C17.7148 4.02205 19.0417 3.20195 20.5213 3.03247C20.8048 3 21.112 3 21.7267 3H29.2733C29.888 3 30.1952 3 30.4787 3.03247C31.9582 3.20195 33.2852 4.02205 34.0985 5.26955C34.2542 5.50863 34.3918 5.78363 34.6668 6.33333C34.804 6.60823 34.8728 6.74568 34.9508 6.86523C35.3575 7.48898 36.0207 7.89903 36.7605 7.98375C36.9025 8 37.056 8 37.3635 8H40C42.8002 8 44.2005 8 45.27 8.54497C46.2108 9.02432 46.9757 9.78923 47.455 10.7301C48 11.7996 48 13.1997 48 16V35C48 37.8002 48 39.2005 47.455 40.27C46.9757 41.2108 46.2108 41.9757 45.27 42.455C44.2005 43 42.8002 43 40 43H11C8.19975 43 6.7996 43 5.73005 42.455C4.78923 41.9757 4.02432 41.2108 3.54497 40.27C3 39.2005 3 37.8002 3 35Z"
                    stroke={color || NEW_COLOR.TEXT_WHITE}
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </Svg>
        </ViewComponent>
    );
};

export default CameraIcon;
