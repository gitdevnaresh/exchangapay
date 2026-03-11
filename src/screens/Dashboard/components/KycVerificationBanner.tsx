import React from "react";
import ViewComponent from "../../../newComponents/view/view";
import TextMultiLangauge from "../../../newComponents/textComponets/multiLanguageText/textMultiLangauge";
import { s } from "../../../constants/theme/scale";
import ActionButton from "../../../newComponents/gradianttext/gradiantbg";
import { Ionicons } from '@expo/vector-icons';
import { KycVerificationBannerProps } from "../interface";
import DashboardBannerCard from "../../../assets/mainmenuicons/dashboardBannerCard";
import { useThemeColors } from "../../../hooks/useThemeColors";
import { useLngTranslation } from "../../../hooks/useLngTranslation";
import InactiveAccountPopup from "../../commonScreens/inactiveSheet/accountInactive";
import { useNavigation } from "@react-navigation/native";




const KycVerificationBanner: React.FC<KycVerificationBannerProps> = ({ Configuration, userInfo, commonStyles, handleRedirectToApplyCard ,myCards}) => {
    const NEW_COLOR = useThemeColors();
    const {t}=useLngTranslation();
    const [isAccountInactive, setAccountIsInactive] = React.useState<boolean>(false);
    const navigation=useNavigation<any>();
    const handleRedirectToVerify = () => {
    if (userInfo?.customerAccountStatus === false) {
      setAccountIsInactive(true); // Open the inactive account popup
      return;
    }
    navigation.navigate("SelectCountry");
    // setKycModelVisible(!kycModelVisible);
  };
  const handleClose = () => {
    setAccountIsInactive(false);
  };


    if (Configuration?.VERIFY_IDENTITY && userInfo?.isKYC !== true) {
        return (
            <ViewComponent>
            <ViewComponent style={[commonStyles.applycardbg, commonStyles.rounded10, commonStyles.dflex, commonStyles.gap16, commonStyles.justifyAround, commonStyles.alignCenter, commonStyles.p8, commonStyles.sectionGap, { height: s(65) }]}>
                <ViewComponent>
                    <Ionicons name="warning-outline" size={s(35)} color={NEW_COLOR.BG_YELLOW} style={commonStyles.mr5} />
                </ViewComponent>
                <ViewComponent style={[commonStyles.flex1]}>
                    <TextMultiLangauge text={t("GLOBAL_CONSTANTS.VERIFY_YOUR_IDENTITY")} style={[commonStyles.fw700, commonStyles.fs12, commonStyles.textWhite]} />
                    <TextMultiLangauge text={`${t("GLOBAL_CONSTANTS.COMPELTE")} ${t("GLOBAL_CONSTANTS.TO_UNLOCK_FULL_ACCESS")}`} style={[commonStyles.fw600, commonStyles.fs12, commonStyles.textlinkgrey]} />
                </ViewComponent>
                <ActionButton text={userInfo?.accountType !== "Business" && "GLOBAL_CONSTANTS.VERIFY" || "GLOBAL_CONSTANTS.VERIFY"} onPress={handleRedirectToVerify} customIcon={false} style={{ backgroundColor: "#E1E31E" }} width={s(70)} height={s(28)} />
            </ViewComponent>
                {isAccountInactive && (<InactiveAccountPopup isVisibleModel={isAccountInactive} onClose={handleClose} />)}
            </ViewComponent>
        );
    } else if (userInfo?.isKYC === true && myCards?.length  === 0) {
        return (
            <ViewComponent style={[commonStyles.dashboardbannerbg, commonStyles.rounded10, commonStyles.dflex, commonStyles.gap16, commonStyles.justifyAround, commonStyles.alignCenter, commonStyles.p8, commonStyles.sectionGap, { height: s(65) }]}>
                <ViewComponent>
                    <DashboardBannerCard color={NEW_COLOR.BG_YELLOW} />
                </ViewComponent>
                <ViewComponent style={[commonStyles.flex1]}>
                    <TextMultiLangauge text={t("GLOBAL_CONSTANTS.APPLY_FOR_A_BULLSWIPE_CARD")} style={[commonStyles.fw700, commonStyles.fs12, commonStyles.textWhite]} />
                    <TextMultiLangauge text={t("GLOBAL_CONSTANTS.START_YOUR_SPENDING_JOURNEY_TODAY")} style={[commonStyles.fw400, commonStyles.fs10, commonStyles.textlinkgrey]} />
                </ViewComponent>
                <ActionButton text={t("GLOBAL_CONSTANTS.APPLY")} onPress={handleRedirectToApplyCard} customIcon={false} style={{ backgroundColor:NEW_COLOR.BG_YELLOW }} width={s(70)} height={s(28)} />
            </ViewComponent>
        );

    }
};
export default React.memo(KycVerificationBanner);