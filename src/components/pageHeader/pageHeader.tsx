import React from "react";
import { View, TouchableOpacity, StyleProp, ViewStyle, TextStyle } from "react-native";
import AntDesign from "react-native-vector-icons/AntDesign";
import { IconRefresh } from "../../assets/svg";
import { commonStyles } from "../CommonStyles";
import ParagraphComponent from "../Paragraph/Paragraph";
import { s } from "../../constants/theme/scale";
import { NEW_COLOR } from "../../constants/theme/variables";
interface PageHeaderProps {
    onBackPress?: () => void;
    title?: string;
    titleStyle?: StyleProp<TextStyle>;
    containerStyle?: StyleProp<ViewStyle>;
    isrefresh?: boolean;
    onRefresh?: () => void;
    rightActions?: React.ReactNode;
    showLogo?: boolean;
    headerRightStyle?: StyleProp<ViewStyle>;
    backIcon?: boolean;
    disable?: boolean;
}

const PageHeader: React.FC<PageHeaderProps> = ({
    onBackPress,
    title,
    titleStyle,
    containerStyle,
    isrefresh = false,
    onRefresh,
    rightActions,
    showLogo = false,
    headerRightStyle,
    backIcon = true,
    disable = false,
}) => {

    return (
        <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16, commonStyles.justifyContent, commonStyles.mb42]}>
            <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap8]}>
                <TouchableOpacity style={[]} onPress={onBackPress} >
                    <View>
                        <AntDesign name="arrowleft" size={s(22)} color={NEW_COLOR.TEXT_BLACK} style={{ marginTop: 3 }} />
                    </View>
                </TouchableOpacity>
                <ParagraphComponent text={title} style={[commonStyles.fs16, commonStyles.textBlack, commonStyles.fw800]} />
            </View>
            {isrefresh && <TouchableOpacity activeOpacity={0.6} onPress={onRefresh}>
                <IconRefresh height={s(24)} width={s(24)} />
            </TouchableOpacity>}
        </View>

    );
};

export default PageHeader;
