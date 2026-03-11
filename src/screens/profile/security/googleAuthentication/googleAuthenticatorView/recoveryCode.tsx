import { useNavigation } from "@react-navigation/native";
import { getThemedCommonStyles } from "../../../../../assets/styles/CommonStyles";
import { useThemeColors } from "../../../../../hooks/useThemeColors";
import Container from "../../../../../newComponents/container/container"
import PageHeader from "../../../../../newComponents/pageHeader/pageHeader";
import { useHardwareBackHandler } from "../../../../../hooks/HardwareBackHandler";
import ViewComponent from "../../../../../newComponents/view/view";
import ImageUri from "../../../../../newComponents/imageComponents/image";
import { COMMON_SVG_URLS } from "../../../../../assets/blobUrls";
import { s } from "../../../../../constants/theme/scale";
import TextMultiLanguage from "../../../../../newComponents/textComponets/multiLanguageText/textMultiLangauge";
import CopyCard from "../../../../../newComponents/copyComponent/CopyCard";
import { copyToClipboard } from "../../../../../newComponents/copyToClipBoard/copy ToClopBoard";
import ParagraphComponent from "../../../../../newComponents/textComponets/paragraphText/paragraph";
import ButtonComponent from "../../../../../newComponents/buttons/button";

const RecoveryCode = (props: any) => {
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const navigation = useNavigation<any>();
    const recoveryCode = props?.route?.params?.recoveryCode;
    const handleGoBack = () => {
        navigation.navigate("GoogleAuthentication", { animation: 'slide_from_left' });
    };

    useHardwareBackHandler(() => {
        handleGoBack();
    })

    return (

        <Container style={[commonStyles.flex1, commonStyles.screenBg]}>
            <PageHeader onBackPress={handleGoBack} title={"GLOBAL_CONSTANTS.GOOGLE_AUTHENTICATOR_TITLE"} />
            <ViewComponent style={[commonStyles.flex1]}>
                <ViewComponent style={[commonStyles.dflex, commonStyles.mb24, commonStyles.rounded10, commonStyles.gap10,commonStyles.sectionGap]}>
                    <ViewComponent>
                        <ImageUri uri={COMMON_SVG_URLS.alertIcon} height={s(24)} width={s(24)} />
                    </ViewComponent>
                    <TextMultiLanguage
                        style={[commonStyles.fs14_24, commonStyles.fw400, commonStyles.textGrey, commonStyles.flex1]}
                        text="GLOBAL_CONSTANTS.RECOVERY_CODE_SECURITY_WARNING"
                    />
                </ViewComponent>

                <ViewComponent style={[commonStyles.rounded12,commonStyles.rewardsbg,commonStyles.p8, commonStyles.gap8]}>
                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent]}>
                        <TextMultiLanguage text={"GLOBAL_CONSTANTS.RECOVERY_CODE"} style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textGrey]} />

                        <CopyCard onPress={() => copyToClipboard(recoveryCode)} size={s(24)} />
                    </ViewComponent>
                    <ParagraphComponent text={recoveryCode} style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textWhite]} numberOfLines={1} />
                </ViewComponent>
            </ViewComponent>

            <ButtonComponent
                title={"GLOBAL_CONSTANTS.CLOSE"}
                onPress={handleGoBack}
            />
            <ViewComponent style={[commonStyles.sectionGap]}/>
        </Container>



    )

}


export default RecoveryCode;