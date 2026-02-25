import React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";
import ViewComponent from "../../view/view";
import { s } from "../../../constants/styels/scale";
import { useThemeColors } from "../../../hooks/themedHook/useThemeColors";

interface WithdrawIconProps extends SvgProps {
    width?: number;
    height?: number;
    style?: any;
    color?: string;
}

const WithdrawIcon: React.FC<WithdrawIconProps> = ({
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
                xmlns="http://www.w3.org/2000/svg"
                {...props}
            >
                <Path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M13.1951 14.8175L9.53806 20.7505C9.37806 21.0105 9.12805 21.0075 9.02705 20.9935C8.92605 20.9795 8.68306 20.9175 8.59506 20.6225L4.02205 5.17753C3.94205 4.90453 4.08905 4.71853 4.15505 4.65253C4.21905 4.58653 4.40206 4.44553 4.66706 4.52053L20.1231 9.04653C20.4161 9.13253 20.4801 9.37853 20.4941 9.47953C20.5081 9.58253 20.5121 9.83753 20.2531 10.0005L14.2521 13.7535L8.95006 8.39553C8.65905 8.10153 8.18406 8.09853 7.88906 8.38953C7.59406 8.68053 7.59205 9.15653 7.88305 9.45053L13.1951 14.8175ZM9.10505 22.4995C9.80105 22.4995 10.4391 22.1455 10.8151 21.5375L14.6921 15.2465L21.0481 11.2715C21.7331 10.8425 22.0911 10.0785 21.9801 9.27553C21.8701 8.47253 21.3191 7.83453 20.5451 7.60753L5.08905 3.08153C4.37805 2.87353 3.61605 3.07053 3.09205 3.59253C2.56805 4.11953 2.37305 4.88953 2.58505 5.60353L7.15806 21.0475C7.38706 21.8245 8.02706 22.3735 8.82806 22.4805C8.92206 22.4925 9.01305 22.4995 9.10505 22.4995Z"
                    fill={color || NEW_COLOR.ACTIONSECONDARYBUTTON_BG}
                />
            </Svg>
        </ViewComponent>
    );
};

export default WithdrawIcon;
