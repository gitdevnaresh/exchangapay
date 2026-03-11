import { useNavigation } from "@react-navigation/native";
import { getThemedCommonStyles } from "../../../../assets/styles/CommonStyles";
import { useThemeColors } from "../../../../hooks/useThemeColors";
import Container from "../../../../newComponents/container/container"
import PageHeader from "../../../../newComponents/pageHeader/pageHeader";
import ViewComponent from "../../../../newComponents/view/view";
import ImageUri from "../../../../newComponents/imageComponents/image";
import { PROFILE_URLS } from "../../../../assets/blobUrls";
import { s } from "../../../../constants/theme/scale";
import TextMultiLanguage from "../../../../newComponents/textComponets/multiLanguageText/textMultiLangauge";
import CommonTouchableOpacity from "../../../../newComponents/touchableComponents/touchableOpacity";
import { Feather, Ionicons } from '@expo/vector-icons';
import { useHardwareBackHandler } from "../../../../hooks/HardwareBackHandler";


const IdentityVerifications = () => {
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const navigation = useNavigation<any>();

    const handleback = () => {
        navigation.goBack();
    }
    useHardwareBackHandler(()=>{
      handleback();
    })
    const handleOpnePersonalInfo = () => {
        navigation.navigate("PersonalInformation");
    }
    return (

        <ViewComponent style={[commonStyles.screenBg, commonStyles.flex1]}>
            <Container>
                <PageHeader title="GLOBAL_CONSTANTS.IDENTITY_VERIFICATION" onBackPress={handleback} />
                <ViewComponent style={[commonStyles.myAuto]} >
                    <ViewComponent style={[commonStyles.alignCenter, commonStyles.sectionGap]}>
                        <ViewComponent style={[commonStyles.sectionGap]}>
                            <ImageUri uri={PROFILE_URLS.approvedLogo} height={s(92)} width={s(120)} />
                        </ViewComponent>
                        <TextMultiLanguage style={[commonStyles.fs24, commonStyles.fw700, commonStyles.textWhite]} text={"GLOBAL_CONSTANTS.APPROVED"} />
                    </ViewComponent>
                    <CommonTouchableOpacity onPress={handleOpnePersonalInfo}>
                        <ViewComponent style={[commonStyles.list, commonStyles.mb10, commonStyles.gap10]}>
                            <ViewComponent style={[commonStyles.iconbg, commonStyles.dflex, commonStyles.justifyCenter]}>
                                <Feather name="user" size={s(16)} color={NEW_COLOR.TEXT_WHITE} />                  
                          </ViewComponent>
                            <ViewComponent style={[commonStyles.flex1]}>
                                <TextMultiLanguage text={"GLOBAL_CONSTANTS.PERSIONAL_INFORMATION"} style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textWhite, commonStyles.mb2]} />
                                <TextMultiLanguage text={"GLOBAL_CONSTANTS.VIEW_YOUR_VERIFIED_DETAILS"} style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textGrey]} />
                            </ViewComponent>
                            <Ionicons name="chevron-forward" size={s(22)} color={NEW_COLOR.ICON_GREY} />
                        </ViewComponent>
                    </CommonTouchableOpacity>
                </ViewComponent>
                <ViewComponent style={[commonStyles.sectionGap]}/>
                <ViewComponent style={[commonStyles.sectionGap]}/>
                 <ViewComponent style={[commonStyles.sectionGap]}/>
            </Container>
        </ViewComponent>
    )
}
export default IdentityVerifications