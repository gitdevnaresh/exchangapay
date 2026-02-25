import { useNavigation } from "@react-navigation/native";
import { getThemedCommonStyles } from "../../../../../../components/CommonStyles";
import { useSelector } from "react-redux";
import { Linking, Text } from "react-native";
import { useThemeColors } from "../../../../../../hooks/themedHook/useThemeColors";
import ViewComponent from "../../../../../../components/view/view";
import Container from "../../../../../../components/container/container";
import PageHeader from "../../../../../../components/pageHeader/pageHeader";
import CommonTouchableOpacity from "../../../../../../components/touchableComponents/touchableOpacity";
import { s } from "../../../../../../components/theme/scale";
import TextMultiLanguage from "../../../../../../components/textComponets/multiLanguageText/textMultiLangauge";
import ButtonComponent from "../../../../../../components/buttons/button";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const ReApplyPayoutKyb = (props: any) => {
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const navigation = useNavigation<any>();
    const userInfo = useSelector((state: any) => state.userReducer?.userDetails);

    const supportEmail = userInfo?.metadata?.AdminEmail || "support@smashpay.io";

    const handleBack = () => {
        navigation.goBack();
    };

    const handleReapply = () => {
        navigation.navigate("KycKybRequirementsForm", {
            VaultData: props?.route?.params?.VaultData,
            isReapply: props?.route?.params?.isReapply
        });
    };
    const handleClickMail = () => {
        const url = `mailto:${supportEmail}`;
        Linking.openURL(url)
    }
    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            <Container style={[commonStyles.container]}>
                <PageHeader
                    title="Rejected"
                    onBackPress={handleBack}
                />
                <ViewComponent style={[commonStyles.myAuto, commonStyles.alignCenter]}>
                    <CommonTouchableOpacity onPress={handleBack} style={[commonStyles.mb20]}>
                        <MaterialCommunityIcons  
                            name="close-circle-outline"
                            size={s(100)}
                            color={NEW_COLOR.TEXT_RED}
                        />
                    </CommonTouchableOpacity>

                    <TextMultiLanguage
                        text="GLOBAL_CONSTANTS.REAPPLY_REJECTION_MESSAGE"
                        style={[commonStyles.nodatascreentitle]}
                    />
                    <TextMultiLanguage
                        text="GLOBAL_CONSTANTS.REAPPLY_REJECTION_REASON"
                        style={[commonStyles.nodatascreenPara]}
                    />
                    <ViewComponent style={[commonStyles.dflex, commonStyles.flexRow, commonStyles.mb20]}>
                        <TextMultiLanguage
                            text="GLOBAL_CONSTANTS.REAPPLY_CONTACT_SUPPORT"
                            style={[commonStyles.nodatascreenPara]}
                        />
                        <CommonTouchableOpacity onPress={handleClickMail} >
                            <Text style={[commonStyles.textprimary]}> {supportEmail} </Text>
                        </CommonTouchableOpacity>
                        <TextMultiLanguage
                            text="GLOBAL_CONSTANTS.FOR_MORE_DETAILS"
                            style={[commonStyles.nodatascreenPara]}
                        />
                    </ViewComponent>


                </ViewComponent>
                <ViewComponent style={[commonStyles.titleSectionGap]}>
                    <ButtonComponent
                        title="GLOBAL_CONSTANTS.REAPPLY"
                        onPress={handleReapply}
                    />
                </ViewComponent>
            </Container>
        </ViewComponent>
    );
};

export default ReApplyPayoutKyb;
