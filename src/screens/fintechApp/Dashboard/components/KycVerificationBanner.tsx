import React from "react";
import ViewComponent from "../../../../components/view/view";
import TextMultiLangauge from "../../../../components/textComponets/multiLanguageText/textMultiLangauge";
import { s } from "../../../../constants/styels/scale";
import ActionButton from "../../../../components/gradianttext/gradiantbg";
import ImageUri from "../../../../components/imageComponents/image";

interface Configuration {
    VERIFY_IDENTITY?: boolean;
}

interface UserInfo {
    kycStatus?: string | null;
    accountType?: string; // Added accountType property
}

interface CommonStyles {
    // Define specific style properties, e.g., applycardbg: object, rounded5: object, etc.
    // Replace with actual style definitions
    [key: string]: string;
}

interface KycVerificationBannerProps {
    Configuration: Configuration;
    userInfo: UserInfo;
    commonStyles: CommonStyles;
    handleRedirectToKyc: () => void;
    t?: (key: string) => string;
    commonComponentConfig?: {
        sumsubBanner?: boolean;
    };
}

const KycVerificationBanner: React.FC<KycVerificationBannerProps> = ({ Configuration, userInfo, commonStyles, handleRedirectToKyc,t }) => {
    if (Configuration?.VERIFY_IDENTITY&& userInfo?.kycStatus !== "Approved") {        
    return (
        <ViewComponent style={[commonStyles.applycardbg, commonStyles.rounded5, commonStyles.dflex, commonStyles.gap16,commonStyles.sectionGap, commonStyles.justifyAround,commonStyles.alignCenter,commonStyles.p12]}>
            <ViewComponent>
                <ImageUri width={s(24)} height={s(24)} source={require("../../../../../src/assets/images/secure.png")} />
            </ViewComponent>
            <ViewComponent style={[commonStyles.flex1]}>
                <TextMultiLangauge text={`${t("GLOBAL_CONSTANTS.COMPLETE")} ${userInfo?.accountType=="Business"&&'KYB'||"KYC"} ${t("GLOBAL_CONSTANTS.TO_PROCEED")}`} style={[commonStyles.fw600, commonStyles.fs14, commonStyles.textWhite]} />
            </ViewComponent>
                <ActionButton text={"GLOBAL_CONSTANTS.CONTINUE"} onPress={handleRedirectToKyc}  customIcon={false} useGradient width={s(110)} height={s(30)} />
        </ViewComponent>
    );
}
};
export default React.memo(KycVerificationBanner);