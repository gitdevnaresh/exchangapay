import React from "react";
import { useThemeColors } from '../../../../hooks/themedHook/useThemeColors';
import { getThemedCommonStyles } from '../../../../components/CommonStyles';
import { s } from '../../../../constants/styels/scale';
import CommonTouchableOpacity from '../../../../components/touchableComponents/touchableOpacity';
import ViewComponent from '../../../../components/view/view';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { t } from 'i18next';
import ParagraphComponent from '../../../../components/textComponets/paragraphText/paragraph';
import { ApplyCardImage } from "../../../../assets/svg";
import { Image } from "react-native";


interface InviteFriendProps {
    handleInviteFriend: () => void;
}

const InviteFriend: React.FC<InviteFriendProps> = ({
    handleInviteFriend,
}) => {
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);

    return (
        <ViewComponent style={[commonStyles.bashboardInviteFriendBg]}>
            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent]}>
                <CommonTouchableOpacity onPress={handleInviteFriend} style={[commonStyles.flex1]}>
                    <ViewComponent style={[commonStyles.px14]} >

                        <ParagraphComponent
                            text={'GLOBAL_CONSTANTS.INVITE_A_FRIEND_AND_BOTH_EARN_CASHBACK'}
                            style={[
                                commonStyles.textBlack, commonStyles.fs20, commonStyles.fw700, commonStyles.mb10, { width: s(209) }
                            ]}
                        />
                        <ViewComponent
                            style={[
                                commonStyles.dflex,
                                commonStyles.alignCenter,
                                commonStyles.gap4, { borderBottomWidth: s(2), borderBottomcolor: NEW_COLOR.INVITEBORDER, width: s(106) }
                            ]}
                        >
                            <ParagraphComponent
                                text={'GLOBAL_CONSTANTS.INVITE_FRIENDS'}
                                style={[commonStyles.textBlack, commonStyles.fs16, commonStyles.fw500,]}
                            />
                            <AntDesign name="arrowright" size={s(20)} style={[commonStyles.textBlack, commonStyles.mt4]} />
                        </ViewComponent>
                    </ViewComponent>
                </CommonTouchableOpacity>
                <ViewComponent >

                    <ViewComponent style={[commonStyles.mt16]}  >
                        <Image
                            source={require("../../../../assets/images/registration/invitefriendimg.png")}
                        />
                    </ViewComponent>
                </ViewComponent>
            </ViewComponent>
        </ViewComponent>

    );
};

export default InviteFriend;