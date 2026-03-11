
import { useNavigation } from "@react-navigation/native"
import { getThemedCommonStyles } from "../../../../../../components/CommonStyles"
import Container from "../../../../../../components/container/container"
import { useThemeColors } from "../../../../../../hooks/themedHook/useThemeColors"
import PageHeader from "../../../../../../components/pageHeader/pageHeader"
import ViewComponent from "../../../../../../components/view/view"
import TextMultiLanguage from "../../../../../../components/textComponets/multiLanguageText/textMultiLangauge"
import ButtonComponent from "../../../../../../components/buttons/button"
import { useRef, useState } from "react"
import CustomRBSheet from "../../../../../../components/models/commonBottomSheet"
import { s } from "../../../../../../components/theme/scale"
import CommonTouchableOpacity from "../../../../../../components/touchableComponents/touchableOpacity"
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { KYCKybRequirements } from "../../../../../../assets/svg"
import ParagraphComponent from "../../../../../../components/textComponets/paragraphText/paragraph"
import { useSelector } from "react-redux"

const BrlEnableProvider = (props: any) => {
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const navigation = useNavigation<any>();
    const termsRef = useRef<any>(null);
    const [agreedToTerms, setAgreedToTerms] = useState<boolean>(false);
    const userInfo = useSelector((state: any) => state.userReducer?.userDetails);

    const handleAgreeToTerms = () => {
        setAgreedToTerms(prev => !prev);
    };

    const handleBack = () => {
        navigation.goBack();
    }

    const handleOpenTermsAndConditions = () => {
        setAgreedToTerms(false);
        termsRef.current.open();
    }

    const closeTermsAndConditions = () => {
        termsRef.current.close();
        setAgreedToTerms(false);
    }
    const navigationToCompanyForm = () => {
        termsRef.current.close();
        navigation.navigate("BrlPersonalKycForm", {
            VaultData: props.route.params?.VaultData,
            screenName: "WalletsDashboard"
        });
    }
    const termsConditions = (
        <ViewComponent>
            <TextMultiLanguage text={"GLOBAL_CONSTANTS.TERMS_AND_CONDITIONS"} style={[commonStyles.sectionTitle, commonStyles.titleSectionGap]} />
            <TextMultiLanguage text={"GLOBAL_CONSTANTS.KYB_TERMS_CONFIRMATION"} style={[commonStyles.secondarytext, commonStyles.mb10]} />
            <TextMultiLanguage text={"GLOBAL_CONSTANTS.DOCUMENT_REQUIREMENTS"} style={[commonStyles.secondarytext, commonStyles.mb10]} />
            <TextMultiLanguage text={"GLOBAL_CONSTANTS.COMPLIANCE_AUTHORIZATION"} style={[commonStyles.secondarytext, commonStyles.mb10]} />
            <TextMultiLanguage text={"GLOBAL_CONSTANTS.ADDITIONAL_SUPPORT_INFO"} style={[commonStyles.secondarytext, commonStyles.titleSectionGap]} />

            <ViewComponent style={[]}>
                <CommonTouchableOpacity onPress={handleAgreeToTerms}>
                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]}>
                        <MaterialCommunityIcons
                            name={agreedToTerms ? 'checkbox-outline' : 'checkbox-blank-outline'}
                            size={s(24)}
                            color={agreedToTerms ? NEW_COLOR.BUTTON_BG : NEW_COLOR.TEXT_link}
                        />
                        <TextMultiLanguage
                            style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textlinkgrey, commonStyles.flex1]}
                            text={"GLOBAL_CONSTANTS.AGREE_TERMS_AND_CONDITIONS"}
                        />

                    </ViewComponent>
                    <ViewComponent style={[commonStyles.sectionGap]} />

                </CommonTouchableOpacity>
                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10, commonStyles.mb10]}>

                    <ViewComponent style={[commonStyles.flex1]}>
                        <ButtonComponent
                            title={"GLOBAL_CONSTANTS.CANCEL"}
                            onPress={closeTermsAndConditions}
                            solidBackground={true}
                        />
                    </ViewComponent>
                    <ViewComponent style={[commonStyles.flex1]}>
                        <ButtonComponent
                            title={"GLOBAL_CONSTANTS.IVE_READ"}
                            onPress={navigationToCompanyForm}
                            disable={!agreedToTerms}
                        />
                    </ViewComponent>
                </ViewComponent>
            </ViewComponent>
        </ViewComponent>
    )
    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            <Container style={commonStyles.container}>
                <PageHeader
                    title={props?.route?.params?.VaultData?.code || "Title"}
                    onBackPress={handleBack}
                />
                <ViewComponent style={[commonStyles.myAuto]}>
                    <KYCKybRequirements style={[commonStyles.mxAuto]} />
                    <TextMultiLanguage style={[commonStyles.secondarytext, commonStyles.textCenter,]} text={"GLOBAL_CONSTANTS.ENABLE_PROVIDER_DISCRIPTION"} />

                </ViewComponent>
                <ViewComponent style={[commonStyles.dflex]} />
                <ButtonComponent title="GLOBAL_CONSTANTS.ENABLE" onPress={handleOpenTermsAndConditions} />
                <ViewComponent style={[commonStyles.sectionGap]} />

            </Container>
            <CustomRBSheet refRBSheet={termsRef} draggable={true} title="GLOBAL_CONSTANTS.SUCCESS" height={"Large"} >

                {termsConditions}
            </CustomRBSheet>

        </ViewComponent>


    )




}

export default BrlEnableProvider;
