import React from "react";
import { useThemeColors } from "../../../hooks/useThemeColors";
import ViewComponent from "../../../newComponents/view/view"
import Container from "../../../newComponents/container/container";
import PageHeader from "../../../newComponents/pageHeader/pageHeader";
import { useNavigation } from "@react-navigation/native";
import ComingSoon from "../comingSoon/comingSoon";
import { getThemedCommonStyles } from "../../../assets/styles/CommonStyles";


const InviteFriends = () => {
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const navigation = useNavigation<any>();

    const handleDashBoard = () => {
        navigation.goBack();
    };
    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            <Container style={commonStyles.container}>
                <PageHeader title={"GLOBAL_CONSTANTS.INVITE_FRIENDS"} onBackPress={handleDashBoard} />
                <ViewComponent style={[commonStyles.sectionGap, commonStyles.alignCenter, commonStyles.justifyCenter, commonStyles.flex1]}>
                    <ComingSoon pageHeader={false} />
                    <ViewComponent style={[commonStyles.sectionGap]} />
                    <ViewComponent style={[commonStyles.sectionGap]} />
                </ViewComponent>
            </Container>
        </ViewComponent>
    )
}
export default InviteFriends;
